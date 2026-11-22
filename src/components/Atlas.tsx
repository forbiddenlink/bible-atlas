"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildHints, type Person, type Place } from "@/lib/types";
import Search from "./Search";
import Panel from "./Panel";
import Legend from "./Legend";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="absolute inset-0 bg-paper" /> });

export default function Atlas({ places, people, initialId = null }: { places: Place[]; people: Person[]; initialId?: string | null }) {
  const [selected, setSelected] = useState<string | null>(initialId);
  const [focus, setFocus] = useState<{ id: string; nonce: number } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [wide, setWide] = useState(true);

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as "light" | "dark") || "light");
    const mq = matchMedia("(min-width: 768px)");
    const f = () => setWide(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  const toggleTheme = () => {
    const t = theme === "dark" ? "light" : "dark";
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch {}
  };

  const hints = useMemo(() => buildHints(places), [places]);

  // keep ?place=<id> in sync with the selection without adding history entries
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selected) url.searchParams.set("place", selected); else url.searchParams.delete("place");
    if (url.href !== window.location.href) history.replaceState(null, "", url);
  }, [selected]);

  const pick = useCallback((id: string) => { setSelected(id); setFocus({ id, nonce: Date.now() }); }, []);
  const place = useMemo(() => places.find((p) => p.id === selected) ?? null, [places, selected]);
  const featured = useMemo(() => [...places].sort((a, b) => b.v.length - a.v.length).slice(0, 12), [places]);

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr_auto]">
      <header className="z-20 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-rule bg-panel px-4 py-2.5">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Bible Atlas<span className="ml-3 hidden font-serif text-sm font-normal italic text-muted lg:inline">places, people and passages</span>
        </h1>
        <div className="order-3 w-full md:order-none md:w-auto md:flex-1 md:max-w-xl"><Search places={places} onPick={pick} hints={hints} /></div>
        <button onClick={toggleTheme} className="ml-auto h-11 border border-rule px-3 text-sm hover:bg-paper md:ml-0" style={{ borderRadius: 2 }} aria-pressed={theme === "dark"}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </header>

      <main className="relative min-h-0">
        <MapView places={places} selectedId={selected} theme={theme} onSelect={pick} focus={focus} bottomPad={wide ? 0 : 300} leftPad={wide ? 400 : 0} />

        <aside
          aria-label="Place details"
          className="absolute z-10 overflow-y-auto border-rule bg-panel max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[42%] max-md:border-t md:bottom-0 md:left-0 md:top-0 md:w-[390px] md:border-r"
        >
          <Panel place={place} people={people} onClose={() => setSelected(null)} onPick={pick} featured={featured} hints={hints} />
        </aside>

        <div className="pointer-events-none absolute right-3 top-3 z-[5] hidden md:block md:top-28"><div className="pointer-events-auto"><Legend /></div></div>
        <div className="absolute right-3 top-3 z-[5] max-w-[220px] md:hidden"><LegendToggle /></div>
      </main>

      <footer className="z-20 flex flex-wrap items-center justify-between gap-x-4 border-t border-rule bg-panel px-4 py-1.5 text-xs text-muted">
        <p>
          Places: <a className="underline" href="https://www.openbible.info/geo/">OpenBible.info</a> (CC BY 4.0). People: <a className="underline" href="https://github.com/robertrouse/theographic-bible-metadata">Theographic</a> (CC BY-SA 4.0). Map: OpenFreeMap, OpenStreetMap contributors.
        </p>
        <Link href="/about" className="min-h-6 underline">Sources and licenses</Link>
      </footer>
    </div>
  );
}

function LegendToggle() {
  return (
    <details className="group">
      <summary className="ml-auto flex h-11 w-fit cursor-pointer items-center border border-rule bg-panel px-3 text-sm" style={{ borderRadius: 2 }}>Legend</summary>
      <div className="mt-1"><Legend /></div>
    </details>
  );
}
