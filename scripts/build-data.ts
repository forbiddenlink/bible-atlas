/**
 * Builds public/data/{places,people}.json from:
 *  - OpenBible.info Bible-Geocoding-Data (CC BY 4.0)  ancient.jsonl
 *  - Theographic Bible Metadata (CC BY-SA 4.0)        places.json, people.json
 * Raw downloads are cached in .cache/ (gitignored). Run: pnpm build:data
 */
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache");
const OUT = path.join(ROOT, "public", "data");

const OB = "https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/main/data/ancient.jsonl";
const TH = "https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json";

async function cached(url: string, name: string): Promise<string> {
  const file = path.join(CACHE, name);
  try {
    await stat(file);
  } catch {
    const res = await fetch(url, { headers: { "User-Agent": "bible-atlas-build" } });
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    await mkdir(CACHE, { recursive: true });
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  return readFile(file, "utf8");
}

interface Resolution { lonlat?: string; modern_basis_id?: string; best_path_score?: number; type?: string }
interface Ident { resolutions?: Resolution[] }
interface Ancient {
  id: string;
  friendly_id: string;
  types?: string[];
  identifications?: Ident[];
  modern_associations?: Record<string, { name: string; score: number }>;
  translation_name_counts?: Record<string, number>;
  verses?: { osis: string }[];
}
interface ThPlace { fields: { openBibleUri?: string } ; id: string }
interface ThPerson {
  id: string;
  fields: { displayTitle?: string; gender?: string; birthYear?: string; deathYear?: string; birthPlace?: string[]; deathPlace?: string[]; slug?: string };
}

const yr = (s?: string) => (s && /^-?\d+$/.test(s) ? Number(s) : undefined);

async function main() {
  const ancient: Ancient[] = (await cached(OB, "ancient.jsonl"))
    .split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const thPlaces: ThPlace[] = JSON.parse(await cached(`${TH}/places.json`, "th-places.json"));
  const thPeople: ThPerson[] = JSON.parse(await cached(`${TH}/people.json`, "th-people.json"));

  // Theographic place record id -> OpenBible ancient id
  const thToOb = new Map<string, string>();
  for (const p of thPlaces) {
    const m = p.fields.openBibleUri?.match(/\/ancient\/([a-z0-9]+)/);
    if (m) thToOb.set(p.id, m[1]);
  }

  // OpenBible id -> list of [personIndex, "b"|"d"]
  const people: { id: string; n: string; b?: number; d?: number }[] = [];
  const personIdx = new Map<string, number>();
  const byPlace = new Map<string, Set<string>>();
  const idxOf = (p: ThPerson) => {
    let i = personIdx.get(p.id);
    if (i === undefined) {
      i = people.length;
      personIdx.set(p.id, i);
      const o: { id: string; n: string; b?: number; d?: number } = { id: p.fields.slug ?? p.id, n: p.fields.displayTitle ?? "?" };
      const b = yr(p.fields.birthYear), d = yr(p.fields.deathYear);
      if (b !== undefined) o.b = b;
      if (d !== undefined) o.d = d;
      people.push(o);
    }
    return i;
  };
  for (const p of thPeople) {
    for (const [key, tag] of [["birthPlace", "b"], ["deathPlace", "d"]] as const) {
      for (const tid of p.fields[key] ?? []) {
        const ob = thToOb.get(tid);
        if (!ob) continue;
        const set = byPlace.get(ob) ?? new Set<string>();
        set.add(`${idxOf(p)}${tag}`);
        byPlace.set(ob, set);
      }
    }
  }

  const places = [];
  let skipped = 0;
  for (const a of ancient) {
    const assoc = Object.entries(a.modern_associations ?? {}).sort((x, y) => y[1].score - x[1].score);
    const resolutions = (a.identifications ?? []).flatMap((i) => i.resolutions ?? []).filter((r) => r.lonlat);
    if (!resolutions.length) { skipped++; continue; }
    const topId = assoc[0]?.[0];
    const best =
      resolutions.find((r) => topId && r.modern_basis_id === topId) ??
      [...resolutions].sort((x, y) => (y.best_path_score ?? 0) - (x.best_path_score ?? 0))[0];
    const [lon, lat] = best.lonlat!.split(",").map(Number);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) { skipped++; continue; }
    const alt = Object.keys(a.translation_name_counts ?? {}).filter((n) => n !== a.friendly_id);
    const verses = (a.verses ?? []).map((v) => v.osis);
    const ppl = [...(byPlace.get(a.id) ?? [])];
    places.push({
      id: a.id,
      n: a.friendly_id,
      ...(alt.length ? { alt } : {}),
      t: best.type ?? a.types?.[0] ?? "place",
      ll: [Math.round(lon * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5],
      // 0..1000 time-weighted scholarly confidence in the top identification
      c: assoc[0]?.[1].score ?? best.best_path_score ?? 0,
      ...(assoc.length > 1 ? { m: assoc.slice(0, 4).map(([, v]) => [v.name, v.score]) } : {}),
      v: verses,
      ...(ppl.length ? { p: ppl } : {}),
    });
  }

  // keep only referenced people
  const used = new Set<number>();
  for (const p of places) for (const s of (p as { p?: string[] }).p ?? []) used.add(parseInt(s));
  const remap = new Map<number, number>();
  const outPeople = [...used].sort((x, y) => x - y).map((old, i) => { remap.set(old, i); return people[old]; });
  for (const p of places as { p?: string[] }[]) {
    if (p.p) p.p = p.p.map((s) => `${remap.get(parseInt(s))}${s.slice(-1)}`);
  }

  await mkdir(OUT, { recursive: true });
  await writeFile(path.join(OUT, "places.json"), JSON.stringify(places));
  await writeFile(path.join(OUT, "people.json"), JSON.stringify(outPeople));
  console.log(`places: ${places.length} (skipped ${skipped} with no coordinates), people: ${outPeople.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
