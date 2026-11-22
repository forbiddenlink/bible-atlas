"use client";

import { useId, useMemo, useRef, useState } from "react";
import { baseName, type Place } from "@/lib/types";
import { bookShort, matchesRef, parseRef } from "@/lib/bible";

interface Result { place: Place; note?: string }

export default function Search({ places, onPick, hints }: { places: Place[]; onPick: (id: string) => void; hints: Record<string, string> }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const uid = useId();
  const listId = `${uid}-list`;
  const input = useRef<HTMLInputElement>(null);

  const { results, heading } = useMemo((): { results: Result[]; heading: string } => {
    const t = q.trim();
    if (t.length < 2) return { results: [], heading: "" };
    const ref = parseRef(t);
    if (ref) {
      const hits = places
        .map((p) => ({ place: p, n: matchesRef(p.v, ref) }))
        .filter((x) => x.n > 0)
        .sort((a, b) => b.place.c - a.place.c)
        .slice(0, 12)
        .map((x) => ({ place: x.place, note: `${x.n} verse${x.n > 1 ? "s" : ""}` }));
      return { results: hits, heading: `Places named in ${bookShort(ref.book)} ${ref.chapter}${ref.verse ? ":" + ref.verse : ""}` };
    }
    const low = t.toLowerCase();
    const score = (p: Place): number => {
      const names = [baseName(p.n), ...(p.alt ?? [])].map((s) => s.toLowerCase());
      if (names.some((n) => n === low)) return 0;
      if (names.some((n) => n.startsWith(low))) return 1;
      if (names.some((n) => n.includes(low))) return 2;
      return 9;
    };
    const hits = places
      .map((p) => ({ p, s: score(p) }))
      .filter((x) => x.s < 9)
      .sort((a, b) => a.s - b.s || b.p.v.length - a.p.v.length)
      .slice(0, 10)
      .map((x) => ({ place: x.p }));
    return { results: hits, heading: "Places" };
  }, [q, places]);

  const pick = (r: Result) => {
    setOpen(false);
    setQ("");
    onPick(r.place.id);
  };

  const showList = open && q.trim().length >= 2;

  return (
    <div className="relative w-full">
      <label htmlFor={`${uid}-q`} className="sr-only">Search places or a passage, for example Bethel or Gen 28</label>
      <input
        ref={input}
        id={`${uid}-q`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${uid}-o${active}` : undefined}
        autoComplete="off"
        placeholder="Search a place or passage: Bethel, Gen 28"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter" && showList && results[active]) { e.preventDefault(); pick(results[active]); }
          else if (e.key === "Escape") { if (open) { setOpen(false); } else setQ(""); }
        }}
        className="h-11 w-full border border-rule bg-panel px-3 text-base text-ink placeholder:text-muted"
        style={{ borderRadius: 2 }}
      />
      {showList && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[60vh] overflow-auto border border-rule bg-panel shadow-md" style={{ borderRadius: 2 }}>
          <p className="border-b border-rule px-3 py-1.5 font-serif text-sm italic text-muted" id={`${uid}-h`}>
            {results.length ? heading : q.trim().length >= 2 ? "No matching place or passage" : ""}
          </p>
          <ul id={listId} role="listbox" aria-labelledby={`${uid}-h`}>
            {results.map((r, i) => (
              <li
                key={r.place.id}
                id={`${uid}-o${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => { e.preventDefault(); pick(r); }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2.5 ${i === active ? "bg-accent text-accent-ink" : ""}`}
              >
                <span className="font-serif text-base">{baseName(r.place.n)}{hints[r.place.id] && <span className="ml-1.5 font-sans text-xs opacity-75">({hints[r.place.id]})</span>}</span>
                <span className={`text-xs ${i === active ? "" : "text-muted"}`}>{r.note ?? r.place.t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
