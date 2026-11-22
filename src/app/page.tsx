import { readFile } from "node:fs/promises";
import path from "node:path";
import Atlas from "@/components/Atlas";
import type { Person, Place } from "@/lib/types";

async function load<T>(name: string): Promise<T> {
  return JSON.parse(await readFile(path.join(process.cwd(), "public", "data", name), "utf8")) as T;
}

export default async function Page() {
  const [places, people] = await Promise.all([load<Place[]>("places.json"), load<Person[]>("people.json")]);
  return <Atlas places={places} people={people} />;
}
