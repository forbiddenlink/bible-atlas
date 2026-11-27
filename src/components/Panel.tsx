"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { groupVerses } from "@/lib/bible";
import { TIER_LABEL, baseName, tierOf, type Person, type Place } from "@/lib/types";
import { withPlace } from "@/lib/place-url";
import { Swatch } from "./Legend";

const era = (y?: number) => (y === undefined ? "" : y < 0 ? `${-y} BC` : `AD ${y}`);

export default function Panel({
  place, people, onClose, onPick, featured, hints,
}: {
  place: Place | null;
  people: Person[];
  onClose: () => void;
  onPick: (id: string) => void;
  featured: Place[];
  hints: Record<string, string>;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [all, setAll] = useState(false);
  useEffect(() => { setAll(false); if (place) heading.current?.focus(); }, [place]);

  const groups = useMemo(() => (place ? groupVerses(place.v) : []), [place]);

  const [note, setNote] = useState("");
  useEffect(() => { setNote(""); }, [place]);
  const share = async () => {
    if (!place) return;
    const url = new URL(withPlace("/", place.id), location.origin).href;
    const title = `${baseName(place.n)} | Bible Atlas`;
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title, url }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); setNote("Link copied"); }
    catch { setNote("Copy failed. Copy the address bar instead."); }
  };

  if (!place) {
    return (
      <div className="p-5">
        <h2 className="font-serif text-xl font-semibold">Begin anywhere</h2>
        <p className="mt-1 text-sm text-muted">Select a marker on the map, search above, or choose one of the most-mentioned places.</p>
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {featured.map((p) => (
            <li key={p.id}>
              <button onClick={() => onPick(p.id)} className="flex w-full items-baseline justify-between px-1 py-2.5 text-left hover:bg-paper">
                <span className="font-serif text-lg">{baseName(p.n)}{hints[p.id] && <span className="ml-1.5 font-sans text-xs text-muted">({hints[p.id]})</span>}</span>
                <span className="text-xs text-muted">{p.v.length} verses</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const tier = tierOf(place.c);
  const born = (place.p ?? []).filter((s) => s.endsWith("b")).map((s) => people[parseInt(s)]);
  const died = (place.p ?? []).filter((s) => s.endsWith("d")).map((s) => people[parseInt(s)]);
  const shown = all ? groups : groups.slice(0, 6);

  return (
    <article aria-labelledby="place-h" className="p-5" onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">{place.t}</p>
          <h2 id="place-h" ref={heading} tabIndex={-1} className="font-serif text-3xl font-semibold leading-tight outline-none">{baseName(place.n)}</h2>
          {hints[place.id] && <p className="mt-0.5 text-sm text-muted">{hints[place.id]}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={share} className="h-11 border border-rule px-3 text-sm hover:bg-paper" style={{ borderRadius: 2 }} aria-label={`Share link to ${baseName(place.n)}`}>Share</button>
          <button onClick={onClose} className="h-11 border border-rule px-3 text-sm hover:bg-paper" style={{ borderRadius: 2 }} aria-label={`Close ${baseName(place.n)} details`}>Close</button>
        </div>
      </div>
      <p role="status" aria-live="polite" className="mt-1 min-h-5 text-right text-xs text-muted">{note}</p>

      {place.alt && (
        <p className="mt-2 text-sm"><span className="text-muted">Also spelled: </span><span className="font-serif italic">{place.alt.join(", ")}</span></p>
      )}

      <section aria-labelledby="conf-h" className="mt-4 border-t border-rule pt-3">
        <h3 id="conf-h" className="font-serif text-lg font-semibold">Identification</h3>
        <p className="mt-1 flex items-center gap-2 text-sm"><Swatch tier={tier} /><span>{TIER_LABEL[tier]}, scholarly score {Math.round(place.c / 10)} of 100</span></p>
        {place.m && (
          <>
            <p className="mt-2 text-sm text-muted">Other candidate sites proposed:</p>
            <ul className="mt-1 text-sm">
              {place.m.map(([n, s]) => (<li key={n} className="flex justify-between border-b border-rule/60 py-1"><span>{n}</span><span className="text-muted">{Math.round(s / 10)}</span></li>))}
            </ul>
          </>
        )}
        <p className="mt-2 text-xs text-muted">Plotted at {place.ll[1].toFixed(3)}, {place.ll[0].toFixed(3)}.</p>
      </section>

      <section aria-labelledby="ppl-h" className="mt-4 border-t border-rule pt-3">
        <h3 id="ppl-h" className="font-serif text-lg font-semibold">People associated</h3>
        {born.length + died.length === 0 ? (
          <p className="mt-1 text-sm text-muted">No people linked here in the current data (birth and death places only).</p>
        ) : (
          <dl className="mt-1 text-sm">
            {born.length > 0 && (<><dt className="text-muted">Born here</dt><dd className="font-serif text-base">{born.map((p) => `${p.n}${p.b !== undefined ? ` (${era(p.b)})` : ""}`).join(", ")}</dd></>)}
            {died.length > 0 && (<><dt className="mt-1 text-muted">Died here</dt><dd className="font-serif text-base">{died.map((p) => `${p.n}${p.d !== undefined ? ` (${era(p.d)})` : ""}`).join(", ")}</dd></>)}
          </dl>
        )}
      </section>

      <section aria-labelledby="ref-h" className="mt-4 border-t border-rule pt-3">
        <h3 id="ref-h" className="font-serif text-lg font-semibold">Passages ({place.v.length})</h3>
        <ul className="mt-1 text-sm leading-relaxed">
          {shown.map((g) => (
            <li key={g.book} className="py-1"><span className="font-serif font-semibold">{g.name}</span> {g.text}</li>
          ))}
        </ul>
        {groups.length > 6 && (
          <button onClick={() => setAll(!all)} className="mt-1 min-h-11 text-sm underline" aria-expanded={all}>
            {all ? "Show fewer books" : `Show all ${groups.length} books`}
          </button>
        )}
      </section>
    </article>
  );
}
