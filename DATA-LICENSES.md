# Data licenses

Verified on 2026-11-22 with `gh api repos/<owner>/<repo> --jq .license.spdx_id` and each project's README.

## OpenBible.info Bible Geocoding Data

- Repo: https://github.com/openbibleinfo/Bible-Geocoding-Data
- License: **CC BY 4.0** (SPDX `CC-BY-4.0`)
- Used for: place names, alternate names (translation spellings), coordinates, identification confidence
  (`modern_associations` time-weighted score, 0 to 1000), candidate modern sites, verse references.
- Requirement: attribution. We credit OpenBible.info in the app footer, on `/about`, and here. Changes were made:
  records were reduced to one plotted point per ancient place and reshaped into a compact JSON.
- Not used: thumbnails and GeoJSON geometry (their licenses vary per image).

## Theographic Bible Metadata

- Repo: https://github.com/robertrouse/theographic-bible-metadata
- License: **CC BY-SA 4.0** (SPDX `CC-BY-SA-4.0`). The README also asks users to credit the original sources
  listed in its `docs/data-source-bibliography.md`.
- Used for: people with a birth place or death place that links to a mapped place (name, birth and death year).
- Share-alike effect: `public/data/people.json`, and the people links (`p` field) inside `public/data/places.json`,
  are adaptations of CC BY-SA material. If you redistribute those files, license them under CC BY-SA 4.0 (or a
  compatible license), keep the attribution, and mark that changes were made. The CC BY-SA 4.0 license text
  is at https://creativecommons.org/licenses/by-sa/4.0/. The app source code is separate and is not a derivative.
  JUDGMENT: this is a plain reading of the license, not legal advice.
- Because `places.json` mixes the two sources, treat the combined file as CC BY-SA 4.0 when you redistribute it.
  To ship a CC BY-only dataset, rebuild without the people join (remove the `byPlace` step in
  `scripts/build-data.ts`).

## Map tiles

- OpenFreeMap (https://openfreemap.org): no API key; its terms (https://openfreemap.org/tos/) do not require one and
  describe the service as free. Data is OpenStreetMap (ODbL 1.0) via OpenMapTiles. Attribution is shown in the map
  control and the footer. The service is provided as-is and can be discontinued; for production use, self-host
  tiles or sponsor the project.

## Verse text

None. Only reference strings are shown.
