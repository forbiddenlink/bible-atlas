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
