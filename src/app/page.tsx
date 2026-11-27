import type { Metadata } from "next";
import Atlas from "@/components/Atlas";
import { baseName, buildHints, TIER_LABEL, tierOf, type Person, type Place } from "@/lib/types";
import placesJson from "../../public/data/places.json";
import { resolvePlaceId } from "@/lib/place-url";
import peopleJson from "../../public/data/people.json";

const places = placesJson as Place[];
const people = peopleJson as Person[];

type SP = Promise<{ place?: string | string[] }>;
const knownIds = new Set(places.map((p) => p.id));

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const id = resolvePlaceId((await searchParams).place, knownIds);
  const p = id ? places.find((x) => x.id === id) : undefined;
  if (!p) return {};
  const hint = buildHints(places)[p.id];
  const name = baseName(p.n) + (hint ? ` (${hint})` : "");
  const title = `${name} | Bible Atlas`;
  const description = `${name}: ${p.t}, ${TIER_LABEL[tierOf(p.c)].toLowerCase()} location, named in ${p.v.length} passage${p.v.length === 1 ? "" : "s"}. Explore it on the Bible Atlas.`;
  return {
    title,
    description,
    alternates: { canonical: `/?place=${p.id}` },
    openGraph: { title, description, type: "website", url: `/?place=${p.id}`, siteName: "Bible Atlas" },
    twitter: { card: "summary", title, description },
  };
}

export default async function Page({ searchParams }: { searchParams: SP }) {
  const initial = resolvePlaceId((await searchParams).place, knownIds);
  return <Atlas places={places} people={people} initialId={initial} />;
}
