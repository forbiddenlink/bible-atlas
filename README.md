# Bible Atlas

A free, open prototype that joins a map of biblical places, the people tied to them, and passage references.
Not a replacement for a study Bible: it shows references only, never verse text.

## Run it

```bash
pnpm install
pnpm build:data   # optional: regenerates public/data/*.json (the generated files are committed, about 320 KB)
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

Requires Node 20 or newer and pnpm. `pnpm dev` and `pnpm build` first copy MapLibre's worker module to
`public/maplibre/` (gitignored); MapLibre v6 ships its worker as a separate ES module and the bundler cannot
resolve it.

## What it does

- Full-screen MapLibre map with clustered markers.
- Marker style shows how sure scholars are of the location: solid (firm), translucent (probable), hollow ring
  (tentative or disputed). The legend explains it.
- Side panel (bottom sheet on phones): name, alternate spellings, confidence, other candidate sites, people born
  or died there, and passages grouped by book.
- Shareable links: selecting a place sets `?place=<id>`; opening that URL restores it, with per-place page title and Open Graph tags.
- Places that share a name get a short disambiguator (the top modern site, or "site 1 of 2"); the plain name is shown everywhere else.
- Zoom-gated markers: firm places always, probable from zoom 8, tentative from zoom 9.2.
- Search by place name or by passage ("Bethel", "Gen 28", "1 Sam 3:1"); full keyboard support.
- Light and dark theme, parchment palette, serif headings.
- `/about` page with full source attributions.

## Data

| Data | Source | License |
| --- | --- | --- |
| Places, coordinates, confidence, verse references | [OpenBible.info Bible Geocoding Data](https://github.com/openbibleinfo/Bible-Geocoding-Data) | CC BY 4.0 |
| People (birth and death places) | [Theographic Bible Metadata](https://github.com/robertrouse/theographic-bible-metadata) | CC BY-SA 4.0 |
| Basemap tiles | [OpenFreeMap](https://openfreemap.org) (OpenMapTiles schema, OpenStreetMap data) | no key; OSM data ODbL |

See [DATA-LICENSES.md](DATA-LICENSES.md) for what the share-alike license means for the generated files.

`scripts/build-data.ts` downloads the raw files into `.cache/` (gitignored), joins Theographic places to
OpenBible places through the OpenBible id in Theographic's `openBibleUri`, and writes `public/data/places.json` and
`public/data/people.json`. Confidence `c` is OpenBible's time-weighted score for the top identification (0 to 1000);
tiers are firm at 700 and above, probable at 400 to 699, tentative below 400.

## Known limits

- People links cover birth and death places only, so just 91 people appear. Events and journeys are not used yet.
- The basemap is modern geography. Region and river geometry is not drawn, only one point per place.
- Map markers are not individually focusable; the keyboard path is search or the "most-mentioned" list.
- OpenFreeMap is a free community service without an uptime promise.

## Screenshots

`pnpm screenshots` (with the app running on port 3111) writes desktop and mobile images to `screenshots/`.
Mobile shots use WebKit because headless Chromium with software GL leaves part of the WebGL canvas unpainted
when a panel overlaps it.
