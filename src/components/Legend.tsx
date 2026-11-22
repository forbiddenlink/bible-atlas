import { TIER_LABEL, type Tier } from "@/lib/types";

function Swatch({ tier }: { tier: Tier }) {
  const common = { cx: 8, cy: 8, r: 5.5, stroke: "var(--accent)" };
  return (
    <svg width="16" height="16" aria-hidden="true" className="shrink-0">
      {tier === "high" && <circle {...common} fill="var(--accent)" />}
      {tier === "medium" && <circle {...common} fill="var(--accent)" fillOpacity="0.5" strokeWidth="1" />}
      {tier === "low" && <circle {...common} fill="none" strokeWidth="1.75" />}
    </svg>
  );
}

export default function Legend() {
  return (
    <section aria-labelledby="legend-h" className="border border-rule bg-panel/95 px-3 py-2 text-sm shadow-sm" style={{ borderRadius: 2 }}>
      <h2 id="legend-h" className="font-serif text-sm font-semibold">How sure is the location?</h2>
      <ul className="mt-1 space-y-1">
        {(["high", "medium", "low"] as Tier[]).map((t) => (
          <li key={t} className="flex items-center gap-2"><Swatch tier={t} /><span>{TIER_LABEL[t]}</span></li>
        ))}
      </ul>
    </section>
  );
}
export { Swatch };
