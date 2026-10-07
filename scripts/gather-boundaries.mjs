/**
 * scripts/gather-boundaries.mjs
 *
 * Gathers and builds all Philippine administrative boundaries in GeoJSON:
 * 1. public/data/regions.geojson - 17 administrative regions with PSGC and island groups
 * 2. public/data/island-groups.geojson - 3 island groups (Luzon, Visayas, Mindanao)
 * 3. public/data/provinces.geojson - 88 provinces and districts, enriched with metadata
 * 4. public/data/municities.geojson - 1,640+ municipalities and cities across the Philippines
 * 5. public/data/admin-hierarchy.json - Hierarchical tree and flat search index for the UI
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "public", "data");
mkdirSync(DATA_DIR, { recursive: true });

const RAW_BASE = "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson";

// PSGC Region prefix to Island Group mapping
const REGION_ISLAND_GROUP = {
  100000000: "Luzon", // Region I (Ilocos Region)
  200000000: "Luzon", // Region II (Cagayan Valley)
  300000000: "Luzon", // Region III (Central Luzon)
  400000000: "Luzon", // Region IV-A (CALABARZON)
  500000000: "Luzon", // Region V (Bicol Region)
  600000000: "Visayas", // Region VI (Western Visayas)
  700000000: "Visayas", // Region VII (Central Visayas)
  800000000: "Visayas", // Region VIII (Eastern Visayas)
  900000000: "Mindanao", // Region IX (Zamboanga Peninsula)
  1000000000: "Mindanao", // Region X (Northern Mindanao)
  1100000000: "Mindanao", // Region XI (Davao Region)
  1200000000: "Mindanao", // Region XII (SOCCSKSARGEN)
  1300000000: "Luzon", // National Capital Region (NCR)
  1400000000: "Luzon", // Cordillera Administrative Region (CAR)
  1600000000: "Mindanao", // Region XIII (Caraga)
  1700000000: "Luzon", // MIMAROPA Region
  1900000000: "Mindanao", // BARMM
};

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function computeCentroid(geometry) {
  let xSum = 0;
  let ySum = 0;
  let count = 0;

  function walk(coords) {
    if (typeof coords[0] === "number") {
      xSum += coords[0];
      ySum += coords[1];
      count += 1;
    } else {
      for (const item of coords) walk(item);
    }
  }

  walk(geometry.coordinates);
  if (count === 0) return [122.0, 13.0];
  return [
    Math.round((xSum / count) * 10000) / 10000,
    Math.round((ySum / count) * 10000) / 10000,
  ];
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "bantay-el-nino-gather" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  console.log("=== STEP 1: Fetching Regions GeoJSON ===");
  const regionsUrl = `${RAW_BASE}/country/lowres/country.0.001.json`;
  const regionsRaw = await fetchJson(regionsUrl);

  const regionMap = new Map();
  const enrichedRegions = {
    type: "FeatureCollection",
    features: regionsRaw.features.map((f) => {
      const psgc = f.properties.adm1_psgc;
      const islandGroup = REGION_ISLAND_GROUP[psgc] || "Luzon";
      const name = f.properties.adm1_en;
      const slug = slugify(name);
      const centroid = computeCentroid(f.geometry);

      const props = {
        ...f.properties,
        psgc,
        name,
        slug,
        island_group: islandGroup,
        centroid_lon: centroid[0],
        centroid_lat: centroid[1],
      };
      regionMap.set(psgc, props);
      return { ...f, properties: props };
    }),
  };

  const regionsOut = join(DATA_DIR, "regions.geojson");
  writeFileSync(regionsOut, JSON.stringify(enrichedRegions));
  console.log(`Saved ${enrichedRegions.features.length} regions to ${regionsOut}`);

  console.log("\n=== STEP 2: Creating Island Groups GeoJSON ===");
  const islandGroups = {
    Luzon: [],
    Visayas: [],
    Mindanao: [],
  };

  for (const feature of enrichedRegions.features) {
    const ig = feature.properties.island_group;
    if (islandGroups[ig]) {
      if (feature.geometry.type === "Polygon") {
        islandGroups[ig].push(feature.geometry.coordinates);
      } else if (feature.geometry.type === "MultiPolygon") {
        islandGroups[ig].push(...feature.geometry.coordinates);
      }
    }
  }

  const islandGroupFeatures = Object.entries(islandGroups).map(([name, coords]) => {
    const geometry = { type: "MultiPolygon", coordinates: coords };
    const centroid = computeCentroid(geometry);
    return {
      type: "Feature",
      properties: {
        name,
        slug: slugify(name),
        centroid_lon: centroid[0],
        centroid_lat: centroid[1],
      },
      geometry,
    };
  });

  const islandGroupsOut = join(DATA_DIR, "island-groups.geojson");
  writeFileSync(islandGroupsOut, JSON.stringify({ type: "FeatureCollection", features: islandGroupFeatures }));
  console.log(`Saved ${islandGroupFeatures.length} island groups to ${islandGroupsOut}`);

  console.log("\n=== STEP 3: Enriching Provinces GeoJSON ===");
  const provincesIn = join(DATA_DIR, "provinces.geojson");
  const provincesRaw = JSON.parse(readFileSync(provincesIn, "utf8"));

  const provinceMap = new Map();
  const enrichedProvinces = {
    type: "FeatureCollection",
    features: provincesRaw.features.map((f) => {
      const regPsgc = f.properties.adm1_psgc;
      const provPsgc = f.properties.adm2_psgc;
      const regProps = regionMap.get(regPsgc);
      let provName = f.properties.adm2_en;
      if (!provName && provPsgc === 1909900000) {
        provName = "Special Geographic Area (BARMM)";
      } else if (!provName) {
        provName = `District ${provPsgc}`;
      }
      const slug = slugify(provName);
      const islandGroup = regProps?.island_group || REGION_ISLAND_GROUP[regPsgc] || "Luzon";
      const centroid = computeCentroid(f.geometry);

      const props = {
        ...f.properties,
        psgc: provPsgc,
        name: provName,
        slug,
        region_psgc: regPsgc,
        region_name: regProps?.name || `Region ${regPsgc}`,
        region_slug: regProps?.slug || slugify(`Region ${regPsgc}`),
        island_group: islandGroup,
        centroid_lon: centroid[0],
        centroid_lat: centroid[1],
      };

      provinceMap.set(provPsgc, props);
      return { ...f, properties: props };
    }),
  };

  writeFileSync(provincesIn, JSON.stringify(enrichedProvinces));
  console.log(`Enriched ${enrichedProvinces.features.length} provinces in ${provincesIn}`);

  console.log("\n=== STEP 4: Fetching Municipalities & Cities (88 Provdists) ===");
  const provPsgcList = enrichedProvinces.features.map((f) => f.properties.psgc);
  const municityFeatures = [];
  const batchSize = 10;

  for (let i = 0; i < provPsgcList.length; i += batchSize) {
    const chunk = provPsgcList.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(async (psgc) => {
        const provProps = provinceMap.get(psgc);
        const url = `${RAW_BASE}/provdists/lowres/municities-provdist-${psgc}.0.001.json`;
        try {
          const col = await fetchJson(url);
          const rawFeatures = Array.isArray(col.features) ? col.features : [];
          for (const feat of rawFeatures) {
            const munName = feat.properties?.adm3_en || "Unknown";
            const munPsgc = feat.properties?.adm3_psgc || 0;
            const centroid = feat.geometry ? computeCentroid(feat.geometry) : [provProps?.centroid_lon || 122.0, provProps?.centroid_lat || 13.0];

            const props = {
              ...feat.properties,
              psgc: munPsgc,
              name: munName,
              slug: slugify(munName),
              geo_level: feat.properties?.geo_level || "Mun",
              province_psgc: psgc,
              province_name: provProps?.name || feat.properties?.adm2_en || "",
              province_slug: provProps?.slug || slugify(feat.properties?.adm2_en || ""),
              region_psgc: feat.properties?.adm1_psgc || provProps?.region_psgc,
              region_name: provProps?.region_name || "",
              island_group: provProps?.island_group || "Luzon",
              centroid_lon: centroid[0],
              centroid_lat: centroid[1],
            };
            municityFeatures.push({ ...feat, properties: props });
          }
        } catch (err) {
          console.warn(`Warning: Could not fetch municities for PSGC ${psgc}: ${err.message}`);
        }
      })
    );
    process.stdout.write(`Downloaded ${(i + chunk.length)} / ${provPsgcList.length} provinces...\r`);
  }
  console.log(`\nFetched a total of ${municityFeatures.length} municipalities and cities!`);

  const municitiesOut = join(DATA_DIR, "municities.geojson");
  writeFileSync(municitiesOut, JSON.stringify({ type: "FeatureCollection", features: municityFeatures }));
  console.log(`Saved ${municityFeatures.length} municities to ${municitiesOut}`);

  console.log("\n=== STEP 5: Building Admin Hierarchy & Fast Search Index ===");
  // Build tree: Regions -> Provinces -> Municipalities
  const hierarchy = {
    islandGroups: ["Luzon", "Visayas", "Mindanao"],
    regions: [],
    searchIndex: [],
  };

  const regGroups = new Map();
  for (const reg of enrichedRegions.features) {
    regGroups.set(reg.properties.psgc, {
      psgc: reg.properties.psgc,
      name: reg.properties.name,
      slug: reg.properties.slug,
      islandGroup: reg.properties.island_group,
      centroid: [reg.properties.centroid_lon, reg.properties.centroid_lat],
      provinces: [],
    });
  }

  const provGroups = new Map();
  for (const prov of enrichedProvinces.features) {
    const regPsgc = prov.properties.region_psgc;
    const provObj = {
      psgc: prov.properties.psgc,
      name: prov.properties.name,
      slug: prov.properties.slug,
      regionPsgc: regPsgc,
      regionName: prov.properties.region_name,
      islandGroup: prov.properties.island_group,
      centroid: [prov.properties.centroid_lon, prov.properties.centroid_lat],
      municipalities: [],
    };
    provGroups.set(prov.properties.psgc, provObj);
    if (regGroups.has(regPsgc)) {
      regGroups.get(regPsgc).provinces.push(provObj);
    }
  }

  for (const mun of municityFeatures) {
    const provPsgc = mun.properties.province_psgc;
    const munObj = {
      psgc: mun.properties.psgc,
      name: mun.properties.name,
      slug: mun.properties.slug,
      geoLevel: mun.properties.geo_level,
      centroid: [mun.properties.centroid_lon, mun.properties.centroid_lat],
    };

    if (provGroups.has(provPsgc)) {
      provGroups.get(provPsgc).municipalities.push(munObj);
    }

    hierarchy.searchIndex.push({
      name: mun.properties.name,
      slug: mun.properties.slug,
      geoLevel: mun.properties.geo_level,
      psgc: mun.properties.psgc,
      provinceName: mun.properties.province_name,
      provinceSlug: mun.properties.province_slug,
      regionName: mun.properties.region_name,
      islandGroup: mun.properties.island_group,
      coordinates: [mun.properties.centroid_lon, mun.properties.centroid_lat],
    });
  }

  // Sort hierarchy safely
  hierarchy.regions = Array.from(regGroups.values()).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  for (const r of hierarchy.regions) {
    r.provinces.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    for (const p of r.provinces) {
      p.municipalities.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
  }

  const hierarchyOut = join(DATA_DIR, "admin-hierarchy.json");
  writeFileSync(hierarchyOut, JSON.stringify(hierarchy, null, 2));
  console.log(`Saved admin hierarchy and search index (${hierarchy.searchIndex.length} items) to ${hierarchyOut}`);

  console.log("\n=== ALL BOUNDARY DATASETS GATHERED SUCCESSFULLY! ===");
}

main().catch((err) => {
  console.error("Error gathering boundaries:", err);
  process.exit(1);
});
