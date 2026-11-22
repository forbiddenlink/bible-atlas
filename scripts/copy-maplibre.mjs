// MapLibre v6 loads its worker as a separate ES module; serve it from /maplibre/ (see MapView.tsx).
import { cp, mkdir } from "node:fs/promises";
const src = new URL("../node_modules/maplibre-gl/dist/", import.meta.url);
const dst = new URL("../public/maplibre/", import.meta.url);
await mkdir(dst, { recursive: true });
for (const f of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) await cp(new URL(f, src), new URL(f, dst));
console.log("copied maplibre worker files");
