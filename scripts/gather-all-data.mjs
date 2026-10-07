/**
 * scripts/gather-all-data.mjs
 *
 * Master orchestrator that gathers and audits all GeoJSON and climate datasets
 * for the Bantay El Niño web application.
 *
 * Runs:
 * 1. scripts/gather-boundaries.mjs (regions, island groups, provinces, municities, admin hierarchy)
 * 2. scripts/gather-infrastructure.mjs (dams, weather stations, river basins)
 * 3. scripts/gather-climate-enso.mjs (NOAA ONI series, historical ENSO events, PAGASA criteria)
 * 4. scripts/gather-agriculture-water.mjs (crop profiles, crop vulnerability, dam status)
 * 5. scripts/gather-provinces-master.mjs (provinces master profiles, drought assessment)
 * 6. scripts/gather-advisories-metadata.mjs (advisories catalog, data sources, methodology)
 *
 * Followed by an integrity audit of every generated file.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fork } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "public", "data");
const SCRIPTS_DIR = join(ROOT, "scripts");

const SCRIPTS = [
  "gather-boundaries.mjs",
  "gather-infrastructure.mjs",
  "gather-climate-enso.mjs",
  "gather-agriculture-water.mjs",
  "gather-provinces-master.mjs",
  "gather-advisories-metadata.mjs",
  "generate-automated-advisories.mjs",
];

const EXPECTED_FILES = [
  // Administrative boundaries GeoJSON
  { name: "regions.geojson", type: "GeoJSON", desc: "17 Philippine administrative regions" },
  { name: "island-groups.geojson", type: "GeoJSON", desc: "3 island groups (Luzon, Visayas, Mindanao)" },
  { name: "provinces.geojson", type: "GeoJSON", desc: "88 provinces and districts with metadata" },
  { name: "municities.geojson", type: "GeoJSON", desc: "1,600+ municipalities and cities" },
  { name: "admin-hierarchy.json", type: "JSON", desc: "Hierarchy tree & fast search index" },

  // Infrastructure GeoJSON & JSON
  { name: "dams.geojson", type: "GeoJSON", desc: "Major dams & reservoirs point features" },
  { name: "dams.json", type: "JSON", desc: "Dams technical metadata and capacities" },
  { name: "pagasa-stations.geojson", type: "GeoJSON", desc: "PAGASA synoptic & agromet weather stations" },
  { name: "pagasa-stations.json", type: "JSON", desc: "Weather stations directory" },
  { name: "river-basins.geojson", type: "GeoJSON", desc: "18 major river basins centroids" },
  { name: "river-basins.json", type: "JSON", desc: "Major river basins profiles" },

  // Climate & ENSO
  { name: "noaa-oni-series.json", type: "JSON", desc: "NOAA CPC ONI historical series (1950–present)" },
  { name: "historical-enso-events.json", type: "JSON", desc: "Historical Philippine El Niño & La Niña episodes" },
  { name: "pagasa-criteria.json", type: "JSON", desc: "PAGASA drought, dry spell & heat criteria" },

  // Agriculture & Water
  { name: "crops.json", type: "JSON", desc: "Philippine major crops vulnerability specs" },
  { name: "crop-vulnerability.json", type: "JSON", desc: "Province agricultural vulnerability matrix" },
  { name: "dams-status.json", type: "JSON", desc: "Reservoir monitoring, rule curves & allocations" },

  // Provinces Master & Assessment
  { name: "provinces-master.json", type: "JSON", desc: "Master directory of all 88 provinces/districts" },
  { name: "drought-assessment.json", type: "JSON", desc: "Province-level drought assessment & risk scores" },

  // Advisories & Governance
  { name: "advisories-catalog.json", type: "JSON", desc: "Structured official advisories catalog" },
  { name: "data-sources.json", type: "JSON", desc: "Open data sources transparency catalog" },
  { name: "methodology.json", type: "JSON", desc: "Bantay Composite Impact Score specifications" },
];

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = join(SCRIPTS_DIR, scriptName);
    console.log(`\n======================================================`);
    console.log(`▶ RUNNING: ${scriptName}`);
    console.log(`======================================================`);
    const child = fork(scriptPath, [], { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptName} exited with code ${code}`));
    });
  });
}

async function auditData() {
  console.log(`\n======================================================`);
  console.log(`📊 AUDITING ALL GENERATED DATASETS`);
  console.log(`======================================================`);

  let allValid = true;
  const auditReport = [];

  for (const item of EXPECTED_FILES) {
    const filePath = join(DATA_DIR, item.name);
    if (!existsSync(filePath)) {
      auditReport.push({ file: item.name, status: "MISSING", size: "0 B", count: 0, desc: item.desc });
      allValid = false;
      continue;
    }

    const stat = statSync(filePath);
    const sizeKb = (stat.size / 1024).toFixed(1) + " KB";

    try {
      const content = readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      let count = 0;

      if (parsed.type === "FeatureCollection" && Array.isArray(parsed.features)) {
        count = parsed.features.length;
      } else if (Array.isArray(parsed)) {
        count = parsed.length;
      } else if (parsed.searchIndex && Array.isArray(parsed.searchIndex)) {
        count = parsed.searchIndex.length;
      } else if (parsed.components && Array.isArray(parsed.components)) {
        count = parsed.components.length;
      } else {
        count = Object.keys(parsed).length;
      }

      auditReport.push({
        file: item.name,
        type: item.type,
        status: "VALID",
        size: sizeKb,
        count,
        desc: item.desc,
      });
    } catch (err) {
      auditReport.push({ file: item.name, status: "CORRUPT JSON", size: sizeKb, count: 0, desc: err.message });
      allValid = false;
    }
  }

  console.table(auditReport);

  if (!allValid) {
    throw new Error("One or more datasets failed integrity audit!");
  }
  console.log(`\n✨ AUDIT COMPLETE: All ${EXPECTED_FILES.length} datasets are VALID, verified, and ready!`);
}

async function main() {
  const startTime = Date.now();
  console.log("🇵🇭 BANTAY EL NIÑO: GATHERING ALL GEOJSON AND CLIMATE DATA");
  console.log(`Target directory: ${DATA_DIR}`);

  for (const script of SCRIPTS) {
    await runScript(script);
  }

  await auditData();

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 ALL DATA GATHERED AND VERIFIED IN ${durationSec}s!`);
}

main().catch((err) => {
  console.error("FATAL ERROR in master gathering script:", err);
  process.exit(1);
});
