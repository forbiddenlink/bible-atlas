/** Query parameter that carries the selected place id, for example `/?place=aea17b7`. */
export const PLACE_PARAM = "place";

/**
 * Resolve a raw `?place=` value to a known place id, or null.
 * Unknown, empty or malformed values return null so callers can ignore them quietly.
 */
export function resolvePlaceId(raw: string | string[] | null | undefined, known: ReadonlySet<string>): string | null {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== "string") return null;
  const id = first.trim();
  return id && known.has(id) ? id : null;
}

/** Return `href` with `?place=` set to `id` (or removed when null). Other params and the hash are kept. */
export function withPlace(href: string, id: string | null): string {
  const url = new URL(href, "http://x.invalid");
  if (id) url.searchParams.set(PLACE_PARAM, id);
  else url.searchParams.delete(PLACE_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}
