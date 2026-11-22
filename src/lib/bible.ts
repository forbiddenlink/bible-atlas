// Book table: OSIS id, display name, short name used in references.
export const BOOKS: { osis: string; name: string; short: string; alias?: string[] }[] = [
  { osis: "Gen", name: "Genesis", short: "Gen" },
  { osis: "Exod", name: "Exodus", short: "Exod", alias: ["ex"] },
  { osis: "Lev", name: "Leviticus", short: "Lev" },
  { osis: "Num", name: "Numbers", short: "Num" },
  { osis: "Deut", name: "Deuteronomy", short: "Deut", alias: ["dt"] },
  { osis: "Josh", name: "Joshua", short: "Josh" },
  { osis: "Judg", name: "Judges", short: "Judg" },
  { osis: "Ruth", name: "Ruth", short: "Ruth" },
  { osis: "1Sam", name: "1 Samuel", short: "1 Sam" },
  { osis: "2Sam", name: "2 Samuel", short: "2 Sam" },
  { osis: "1Kgs", name: "1 Kings", short: "1 Kgs", alias: ["1 ki"] },
  { osis: "2Kgs", name: "2 Kings", short: "2 Kgs", alias: ["2 ki"] },
  { osis: "1Chr", name: "1 Chronicles", short: "1 Chr" },
  { osis: "2Chr", name: "2 Chronicles", short: "2 Chr" },
  { osis: "Ezra", name: "Ezra", short: "Ezra" },
  { osis: "Neh", name: "Nehemiah", short: "Neh" },
  { osis: "Esth", name: "Esther", short: "Esth" },
  { osis: "Job", name: "Job", short: "Job" },
  { osis: "Ps", name: "Psalms", short: "Ps", alias: ["psalm", "psa"] },
  { osis: "Prov", name: "Proverbs", short: "Prov" },
  { osis: "Eccl", name: "Ecclesiastes", short: "Eccl" },
  { osis: "Song", name: "Song of Solomon", short: "Song", alias: ["song of songs", "sos"] },
  { osis: "Isa", name: "Isaiah", short: "Isa" },
  { osis: "Jer", name: "Jeremiah", short: "Jer" },
  { osis: "Lam", name: "Lamentations", short: "Lam" },
  { osis: "Ezek", name: "Ezekiel", short: "Ezek" },
  { osis: "Dan", name: "Daniel", short: "Dan" },
  { osis: "Hos", name: "Hosea", short: "Hos" },
  { osis: "Joel", name: "Joel", short: "Joel" },
  { osis: "Amos", name: "Amos", short: "Amos" },
  { osis: "Obad", name: "Obadiah", short: "Obad" },
  { osis: "Jonah", name: "Jonah", short: "Jonah" },
  { osis: "Mic", name: "Micah", short: "Mic" },
  { osis: "Nah", name: "Nahum", short: "Nah" },
  { osis: "Hab", name: "Habakkuk", short: "Hab" },
  { osis: "Zeph", name: "Zephaniah", short: "Zeph" },
  { osis: "Hag", name: "Haggai", short: "Hag" },
  { osis: "Zech", name: "Zechariah", short: "Zech" },
  { osis: "Mal", name: "Malachi", short: "Mal" },
  { osis: "Matt", name: "Matthew", short: "Matt", alias: ["mt"] },
  { osis: "Mark", name: "Mark", short: "Mark", alias: ["mk"] },
  { osis: "Luke", name: "Luke", short: "Luke", alias: ["lk"] },
  { osis: "John", name: "John", short: "John", alias: ["jn"] },
  { osis: "Acts", name: "Acts", short: "Acts" },
  { osis: "Rom", name: "Romans", short: "Rom" },
  { osis: "1Cor", name: "1 Corinthians", short: "1 Cor" },
  { osis: "2Cor", name: "2 Corinthians", short: "2 Cor" },
  { osis: "Gal", name: "Galatians", short: "Gal" },
  { osis: "Eph", name: "Ephesians", short: "Eph" },
  { osis: "Phil", name: "Philippians", short: "Phil" },
  { osis: "Col", name: "Colossians", short: "Col" },
  { osis: "1Thess", name: "1 Thessalonians", short: "1 Thess" },
  { osis: "2Thess", name: "2 Thessalonians", short: "2 Thess" },
  { osis: "1Tim", name: "1 Timothy", short: "1 Tim" },
  { osis: "2Tim", name: "2 Timothy", short: "2 Tim" },
  { osis: "Titus", name: "Titus", short: "Titus" },
  { osis: "Phlm", name: "Philemon", short: "Phlm" },
  { osis: "Heb", name: "Hebrews", short: "Heb" },
  { osis: "Jas", name: "James", short: "Jas", alias: ["jam"] },
  { osis: "1Pet", name: "1 Peter", short: "1 Pet" },
  { osis: "2Pet", name: "2 Peter", short: "2 Pet" },
  { osis: "1John", name: "1 John", short: "1 John" },
  { osis: "2John", name: "2 John", short: "2 John" },
  { osis: "3John", name: "3 John", short: "3 John" },
  { osis: "Jude", name: "Jude", short: "Jude" },
  { osis: "Rev", name: "Revelation", short: "Rev" },
];

const ORDER = new Map(BOOKS.map((b, i) => [b.osis, i]));
const norm = (s: string) => s.toLowerCase().replace(/[.\s]/g, "");

/** Resolve free text such as "gen", "Genesis" or "1 sam" to an OSIS book id. */
export function findBook(text: string): string | null {
  const t = norm(text);
  if (!t) return null;
  for (const b of BOOKS) {
    const names = [b.osis, b.name, b.short, ...(b.alias ?? [])].map(norm);
    if (names.includes(t)) return b.osis;
  }
  // unique prefix match, at least 3 characters ("gene" -> Genesis)
  if (t.length >= 3) {
    const hits = BOOKS.filter((b) => norm(b.name).startsWith(t));
    if (hits.length === 1) return hits[0].osis;
  }
  return null;
}

export interface Ref { book: string; chapter: number; verse?: number }

/** Parse "Gen 28", "Genesis 28:10", "1 Sam 3". Returns null if it is not a reference. */
export function parseRef(q: string): Ref | null {
  const m = q.trim().match(/^(.+?)\s*(\d+)(?:\s*[:.]\s*(\d+))?$/);
  if (!m) return null;
  const book = findBook(m[1]);
  if (!book) return null;
  return { book, chapter: Number(m[2]), ...(m[3] ? { verse: Number(m[3]) } : {}) };
}

export function bookShort(osis: string): string {
  return BOOKS[ORDER.get(osis) ?? 0]?.short ?? osis;
}

export interface ParsedVerse { book: string; ch: number; v: number }
export function parseOsis(s: string): ParsedVerse | null {
  const p = s.split(".");
  if (p.length !== 3) return null;
  return { book: p[0], ch: Number(p[1]), v: Number(p[2]) };
}

/** Group OSIS verse ids into readable per-book strings: "28:10-12, 19; 35:1". */
export function groupVerses(osis: string[]): { book: string; name: string; text: string; count: number }[] {
  const byBook = new Map<string, Map<number, number[]>>();
  for (const o of osis) {
    const v = parseOsis(o);
    if (!v) continue;
    const chs = byBook.get(v.book) ?? new Map<number, number[]>();
    chs.set(v.ch, [...(chs.get(v.ch) ?? []), v.v]);
    byBook.set(v.book, chs);
  }
  return [...byBook.entries()]
    .sort((a, b) => (ORDER.get(a[0]) ?? 99) - (ORDER.get(b[0]) ?? 99))
    .map(([book, chs]) => {
      let count = 0;
      const text = [...chs.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([ch, vs]) => {
          const sorted = [...new Set(vs)].sort((a, b) => a - b);
          count += sorted.length;
          const parts: string[] = [];
          for (let i = 0; i < sorted.length; ) {
            let j = i;
            while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
            parts.push(j > i ? `${sorted[i]}–${sorted[j]}` : `${sorted[i]}`);
            i = j + 1;
          }
          return `${ch}:${parts.join(", ")}`;
        })
        .join("; ");
      return { book, name: BOOKS[ORDER.get(book) ?? 0]?.name ?? book, text, count };
    });
}

export function matchesRef(osis: string[], r: Ref): number {
  let n = 0;
  for (const o of osis) {
    const v = parseOsis(o);
    if (v && v.book === r.book && v.ch === r.chapter && (r.verse === undefined || v.v === r.verse)) n++;
  }
  return n;
}
