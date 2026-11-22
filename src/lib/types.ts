export interface Place {
  id: string;
  n: string;
  alt?: string[];
  t: string;
  ll: [number, number];
  /** 0..1000 time-weighted scholarly confidence in the top identification */
  c: number;
  /** other candidate modern sites: [name, score] */
  m?: [string, number][];
  v: string[];
  /** people: "<index><b|d>" (born or died here) */
  p?: string[];
}
export interface Person { id: string; n: string; b?: number; d?: number }

export type Tier = "high" | "medium" | "low";
export const tierOf = (c: number): Tier => (c >= 700 ? "high" : c >= 400 ? "medium" : "low");
export const TIER_LABEL: Record<Tier, string> = {
  high: "Firmly identified",
  medium: "Probable",
  low: "Tentative or disputed",
};

/** Plain display name: drops OpenBible's disambiguation numeral ("Bethel 1" becomes "Bethel"). */
export const baseName = (n: string) => n.replace(/ \d+$/, "");

/**
 * Short disambiguators, only for places that share a plain name with another place.
 * Prefers the top modern site ("Beitin"); falls back to "site 1 of 2" when that is missing or not unique.
 */
export function buildHints(places: Place[]): Record<string, string> {
  const groups = new Map<string, Place[]>();
  for (const p of places) {
    const k = baseName(p.n);
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  const hints: Record<string, string> = {};
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    const ordered = [...g].sort((a, b) => a.n.localeCompare(b.n, undefined, { numeric: true }));
    const sites = ordered.map((p) => p.m?.[0]?.[0]);
    ordered.forEach((p, i) => {
      const s = sites[i];
      const unique = s && sites.filter((x) => x === s).length === 1;
      hints[p.id] = unique ? `near ${s}` : `site ${i + 1} of ${ordered.length}`;
    });
  }
  return hints;
}
