/**
 * Builds public/data/provinces.geojson by downloading the per-region
 * province/district files from faeldon/philippines-json-maps (MIT,
 * sourced from PSA PSGC data, 31 Dec 2023) and merging them into one
 * FeatureCollection.
 *
 * Run: node scripts/build-geojson.mjs
 * Low resolution (0.1% simplification) is used for the MVP web map;
 * medres/hires variants exist upstream for future zoom levels.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API =
  "https://api.github.com/repos/faeldon/philippines-json-maps/contents/2023/geojson/regions/lowres";
const OUT = join(ROOT, "public", "data", "provinces.geojson");

async function getJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "bantay-el-nino-build" },
  });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
}

const listing = await getJson(API);
const files = listing.filter((f) => f.name.startsWith("provdists-region-"));
if (files.length === 0) throw new Error("No province files found");

const features = [];
for (const file of files) {
  const collection = await getJson(file.download_url);
  features.push(...collection.features);
}

const merged = { type: "FeatureCollection", features };
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(merged));

console.log(`files merged: ${files.length}`);
console.log(`features: ${features.length}`);
console.log(`bytes: ${JSON.stringify(merged).length}`);
console.log("sample properties:", JSON.stringify(features[0].properties, null, 2));
