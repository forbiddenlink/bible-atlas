import Link from "next/link";

export const metadata = { title: "Sources and licenses | Bible Atlas" };

export default function About() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 font-serif leading-relaxed">
      <Link href="/" className="font-sans text-sm underline">Back to the map</Link>
      <h1 className="mt-6 text-4xl font-semibold">Sources and licenses</h1>
      <p className="mt-4">
        Bible Atlas is a free, open prototype. It shows reference strings only (for example Gen 28:10), never verse
        text.
      </p>
      <h2 className="mt-8 text-2xl font-semibold">Place data</h2>
      <p className="mt-2">
        Place names, coordinates, alternate names, identification confidence and verse references come from{" "}
        <a className="underline" href="https://github.com/openbibleinfo/Bible-Geocoding-Data">OpenBible.info Bible Geocoding Data</a>,
        by Stephen Smith, licensed{" "}
        <a className="underline" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. We reduced and
        reshaped the data. Confidence is the time-weighted score of the top identification (0 to 1000), as defined in
        that project.
      </p>
      <h2 className="mt-8 text-2xl font-semibold">People data</h2>
      <p className="mt-2">
        Birth and death places of people come from the{" "}
        <a className="underline" href="https://github.com/robertrouse/theographic-bible-metadata">Theographic Bible Metadata</a>{" "}
        by Robert Rouse and contributors, licensed{" "}
        <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. The derived
        file <code>people.json</code>, and the people links inside <code>places.json</code>, are adaptations and are
        shared under the same CC BY-SA 4.0 license. See DATA-LICENSES.md in the repository.
      </p>
      <h2 className="mt-8 text-2xl font-semibold">Map tiles</h2>
      <p className="mt-2">
        Tiles come from <a className="underline" href="https://openfreemap.org">OpenFreeMap</a>, with{" "}
        <a className="underline" href="https://openmaptiles.org/">OpenMapTiles</a> schema and data from{" "}
        <a className="underline" href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> (ODbL).
        The basemap shows modern geography; ancient places are plotted onto it.
      </p>
    </main>
  );
}
