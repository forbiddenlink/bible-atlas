"use client";

import { useEffect, useRef } from "react";
import { Map as MlMap, setWorkerUrl, NavigationControl, AttributionControl, type StyleSpecification, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Place } from "@/lib/types";

const STYLE_URL = { light: "https://tiles.openfreemap.org/styles/positron", dark: "https://tiles.openfreemap.org/styles/dark" };

const PALETTE = {
  light: { bg: "#ece3cb", water: "#c3cfca", land: "#e4d9bb", label: "#4f4230", halo: "#f3ecdc", marker: "#7a2e1f", ring: "#f8f2e4" },
  dark: { bg: "#16120e", water: "#1c2628", land: "#1f1a14", label: "#b3a78e", halo: "#1a1612", marker: "#e0a86a", ring: "#1a1612" },
};
type Theme = "light" | "dark";

/** Quiet the OpenFreeMap style into an atlas look: no roads or buildings, paper and ink colors. */
function patchStyle(style: StyleSpecification, theme: Theme): StyleSpecification {
  const p = PALETTE[theme];
  const layers = style.layers.map((l) => {
    const id = l.id;
    if (/^(highway|railway|aeroway|tunnel|bridge|road|building|airport|poi|label_other|place_other|place_suburb)/.test(id)) {
      return { ...l, layout: { ...(l.layout ?? {}), visibility: "none" as const } };
    }
    const paint = { ...((l as { paint?: Record<string, unknown> }).paint ?? {}) };
    if (l.type === "background") paint["background-color"] = p.bg;
    else if (l.type === "fill" && /water/.test(id)) paint["fill-color"] = p.water;
    else if (l.type === "fill" && !/ice|glacier/.test(id)) paint["fill-color"] = p.land;
    else if (l.type === "line" && /waterway/.test(id)) paint["line-color"] = p.water;
    else if (l.type === "symbol") { paint["text-color"] = p.label; paint["text-halo-color"] = p.halo; paint["text-halo-width"] = 1.2; }
    return { ...l, paint } as typeof l;
  });
  return { ...style, layers };
}

const styleCache: Partial<Record<Theme, StyleSpecification>> = {};
async function getStyle(theme: Theme): Promise<StyleSpecification> {
  if (!styleCache[theme]) {
    const res = await fetch(STYLE_URL[theme]);
    styleCache[theme] = patchStyle((await res.json()) as StyleSpecification, theme);
  }
  return styleCache[theme]!;
}

function toGeoJSON(places: Place[]) {
  return {
    type: "FeatureCollection" as const,
    features: places.map((p) => ({
      type: "Feature" as const,
      properties: { id: p.id, name: p.n, tier: p.c >= 700 ? 2 : p.c >= 400 ? 1 : 0 },
      geometry: { type: "Point" as const, coordinates: p.ll },
    })),
  };
}

interface Props {
  places: Place[];
  selectedId: string | null;
  theme: Theme;
  onSelect: (id: string) => void;
  focus: { id: string; nonce: number } | null;
  /** extra bottom padding (px) so the selection is not hidden behind a bottom sheet */
  bottomPad: number;
  leftPad: number;
}

export default function MapView({ places, selectedId, theme, onSelect, focus, bottomPad, leftPad }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const live = useRef({ places, selectedId, onSelect, theme });
  live.current = { places, selectedId, onSelect, theme };
  const padRef = useRef({ bottomPad, leftPad });
  padRef.current = { bottomPad, leftPad };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setWorkerUrl(new URL("/maplibre/maplibre-gl-worker.mjs", window.location.origin).href);
      const style = await getStyle(live.current.theme);
      if (cancelled || !el.current) return;
      const m = new MlMap({
        container: el.current,
        style,
        center: [35.2, 31.8],
        zoom: 5.2,
        minZoom: 2,
        attributionControl: false,
        dragRotate: false,
      });
      map.current = m;
      m.touchZoomRotate.disableRotation();
      m.addControl(new NavigationControl({ showCompass: false }), "top-right");
      m.addControl(new AttributionControl({ compact: true }), "bottom-right");

      const addLayers = () => {
        const pal = PALETTE[live.current.theme];
        if (m.getSource("places")) return;
        m.addSource("places", { type: "geojson", data: toGeoJSON(live.current.places), cluster: true, clusterRadius: 38, clusterMaxZoom: 8 });
        m.addLayer({
          id: "clusters", type: "circle", source: "places", filter: ["has", "point_count"],
          paint: { "circle-color": pal.land, "circle-stroke-color": pal.marker, "circle-stroke-width": 1.5, "circle-radius": ["step", ["get", "point_count"], 14, 10, 18, 50, 23] },
        });
        m.addLayer({
          id: "cluster-count", type: "symbol", source: "places", filter: ["has", "point_count"],
          layout: { "text-field": ["get", "point_count_abbreviated"], "text-font": ["Noto Sans Bold"], "text-size": 12 },
          paint: { "text-color": pal.marker },
        });
        // Confidence: solid = firm, translucent = probable, hollow ring = tentative.
        m.addLayer({
          id: "places", type: "circle", source: "places", filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 4, 10, 8],
            "circle-color": pal.marker,
            "circle-opacity": ["match", ["get", "tier"], 2, 1, 1, 0.55, 0.0],
            "circle-stroke-color": pal.marker,
            "circle-stroke-width": ["match", ["get", "tier"], 0, 1.75, 1, 1, 0.5],
            "circle-stroke-opacity": ["match", ["get", "tier"], 2, 1, 1, 0.8, 0.9],
          },
        });
        m.addLayer({
          id: "place-labels", type: "symbol", source: "places", minzoom: 6.5, filter: ["!", ["has", "point_count"]],
          layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 12, "text-offset": [0, 1.1], "text-anchor": "top", "text-optional": true },
          paint: { "text-color": pal.label, "text-halo-color": pal.halo, "text-halo-width": 1.4 },
        });
        m.addLayer({
          id: "selected", type: "circle", source: "places",
          filter: ["==", ["get", "id"], live.current.selectedId ?? ""],
          paint: { "circle-radius": 13, "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": pal.marker, "circle-stroke-width": 2.5 },
        });
      };
      m.on("style.load", addLayers);
      if (m.isStyleLoaded()) addLayers();

      m.on("click", "clusters", async (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const src = m.getSource("places") as GeoJSONSource;
        const zoom = await src.getClusterExpansionZoom(f.properties.cluster_id as number);
        m.easeTo({ center: (f.geometry as unknown as { coordinates: [number, number] }).coordinates, zoom: zoom + 0.5 });
      });
      m.on("click", "places", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (id) live.current.onSelect(id);
      });
      for (const l of ["clusters", "places"]) {
        m.on("mouseenter", l, () => (m.getCanvas().style.cursor = "pointer"));
        m.on("mouseleave", l, () => (m.getCanvas().style.cursor = ""));
      }
    })();
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
  }, []);

  // theme switch: swap style (layers are re-added on style.load)
  const firstTheme = useRef(theme);
  useEffect(() => {
    if (firstTheme.current === theme) return;
    firstTheme.current = theme;
    getStyle(theme).then((s) => map.current?.setStyle(s));
  }, [theme]);

  useEffect(() => {
    const m = map.current;
    if (m?.getLayer("selected")) m.setFilter("selected", ["==", ["get", "id"], selectedId ?? ""]);
  }, [selectedId]);

  useEffect(() => {
    if (!focus || !map.current) return;
    const p = live.current.places.find((x) => x.id === focus.id);
    if (!p) return;
    const { bottomPad: b, leftPad: l } = padRef.current;
    map.current.easeTo({ center: p.ll, zoom: Math.max(map.current.getZoom(), 9.3), offset: [l / 2, -b / 2], duration: 700 });
  }, [focus]);

  return <div className="absolute inset-0"><div ref={el} className="h-full w-full" role="application" aria-label="Map of biblical places. Use the search box or the list to choose a place." /></div>;
}
