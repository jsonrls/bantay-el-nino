/**
 * scripts/gather-advisories-metadata.mjs
 *
 * Gathers and compiles:
 * 1. public/data/advisories-catalog.json - Structured official & sector alerts catalog
 * 2. public/data/data-sources.json - Complete transparency & attribution catalog
 * 3. public/data/methodology.json - Transparent Bantay Composite Impact Score specifications
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "public", "data");

const ADVISORIES_CATALOG = [
  {
    id: "adv-pagasa-heat-001",
    level: "extreme",
    category: "PAGASA",
    title: "Extreme Heat Index Advisory",
    area: "Central Luzon & Western Visayas",
    provinceSlug: "nueva-ecija",
    regionName: "Region III & Region VI",
    summary: "Daytime heat index values are forecast to reach 44°C to 47°C ('Danger' category). High probability of heat cramps and heat exhaustion with continued outdoor activity. Limit direct sunlight exposure between 10:00 AM and 3:00 PM.",
    source: "PAGASA Climatology and Agrometeorology Division",
    publishedAt: "October 7, 2026 · 10:32 AM",
    effectiveUntil: "October 10, 2026",
    url: "https://bagong.pagasa.dost.gov.ph",
    actions: [
      "Drink at least 2 to 3 liters of water daily, even without feeling thirsty",
      "Avoid outdoor physical labor during peak temperature hours (10 AM to 3 PM)",
      "Wear lightweight, loose-fitting, light-colored clothing",
      "Ensure livestock and poultry have access to shaded pens and continuous fresh drinking water",
    ],
  },
  {
    id: "adv-water-mwss-002",
    level: "high",
    category: "Water",
    title: "Angat Reservoir Conservation Watch",
    area: "Metro Manila / Bulacan Watershed",
    provinceSlug: "bulacan",
    regionName: "Region III & NCR",
    summary: "Angat Dam water elevation is at 204.60 meters, below the seasonal rule curve of 210.00 meters. The National Water Resources Board (NWRB) and MWSS have maintained normal municipal tap water allocations (48 m³/s) while calibrating agricultural releases to the Bustos Dam canal network.",
    source: "MWSS / NWRB / Manila Water / Maynilad",
    publishedAt: "October 6, 2026 · 4:00 PM",
    effectiveUntil: "October 15, 2026",
    url: "https://ro.mwss.gov.ph",
    actions: [
      "Practice household water conservation (recycle rinse water for flushing and gardening)",
      "Report municipal pipe leaks immediately to water concessionaire hotlines",
      "Commercial establishments should optimize cooling tower water recycling",
    ],
  },
  {
    id: "adv-agri-da-003",
    level: "high",
    category: "Agriculture",
    title: "Western Visayas Crop Drought & Soil Moisture Alert",
    area: "Iloilo, Antique, and Negros Occidental",
    provinceSlug: "iloilo",
    regionName: "Region VI (Western Visayas)",
    summary: "Three consecutive months of below-normal precipitation have depleted soil moisture across rainfed rice and sugarcane tracts in Panay Island and Negros Occidental. Field agronomists urge farmers to employ Alternate Wetting and Drying and delay late-season planting.",
    source: "Department of Agriculture - Field Operations Service & DRRM Ops",
    publishedAt: "October 6, 2026 · 9:15 AM",
    effectiveUntil: "October 20, 2026",
    url: "https://www.da.gov.ph",
    actions: [
      "Implement Alternate Wetting and Drying (AWD) in all irrigated paddies",
      "Apply crop residue trash blanketing to sugarcane and upland corn fields to slow evaporation",
      "Coordinate with local City/Municipal Agriculture Offices (MAO) for drought-tolerant seeds",
    ],
  },
  {
    id: "adv-doh-health-004",
    level: "moderate",
    category: "Health",
    title: "Heat Stress and Dehydration Advisory",
    area: "Nationwide",
    provinceSlug: "nationwide",
    regionName: "All Regions",
    summary: "Public advisory against heat-induced health complications. Children, the elderly, outdoor workers, and people with cardiovascular comorbidities are at elevated risk. Monitor vulnerable family members for dizziness, heavy sweating, or fainting.",
    source: "Department of Health (DOH) Health Emergency Management Bureau",
    publishedAt: "October 5, 2026 · 8:00 AM",
    effectiveUntil: "October 31, 2026",
    url: "https://doh.gov.ph",
    actions: [
      "Frequently check on elderly family members and individuals living alone",
      "Never leave children, infants, or pets unattended in parked vehicles",
      "Seek emergency medical evaluation if experiencing nausea, vomiting, or mental confusion under extreme heat",
    ],
  },
  {
    id: "adv-nia-pantabangan-005",
    level: "high",
    category: "Water",
    title: "Pantabangan Irrigation Delivery Schedule Adjustment",
    area: "Central Luzon (UPRIIS Service Area)",
    provinceSlug: "nueva-ecija",
    regionName: "Region III (Central Luzon)",
    summary: "Pantabangan Dam elevation is at 189.50 meters (31.5 meters below spilling level). UPRIIS Operations have enacted rotational canal gating across District I through IV to ensure equal tail-end water distribution forstanding palay crops.",
    source: "National Irrigation Administration - UPRIIS Head Office",
    publishedAt: "October 4, 2026 · 11:00 AM",
    effectiveUntil: "October 18, 2026",
    url: "https://www.nia.gov.ph",
    actions: [
      "Irrigators Associations (IAs) must strictly abide by designated rotational canal water schedules",
      "Divert drainage water where feasible for supplemental farm ditch replenishment",
      "Clear feeder canals of weeds and sediment to optimize gravity flow velocity",
    ],
  },
  {
    id: "adv-cebu-cebu-006",
    level: "high",
    category: "Agriculture",
    title: "Central Visayas Dry Spell Advisory",
    area: "Cebu & Bohol",
    provinceSlug: "cebu",
    regionName: "Region VII (Central Visayas)",
    summary: "Cebu is experiencing warmer and drier-than-normal conditions (+1.5°C temperature anomaly, −24% rainfall deficit). Elevated heat index and rainfall reduction increase heat stress, municipal water demand, and agricultural pressure across upland corn farms.",
    source: "PAGASA Regional Services Division - Visayas",
    publishedAt: "October 4, 2026 · 7:30 AM",
    effectiveUntil: "October 14, 2026",
    url: "https://bagong.pagasa.dost.gov.ph",
    actions: [
      "Conserve water across Metro Cebu households and industrial zones",
      "Upland corn farmers should mulch root zones and limit burning of farm waste",
      "Monitor local barangay water supply schedules and storage tankers",
    ],
  },
  {
    id: "adv-ndrrmc-enso-007",
    level: "moderate",
    category: "General",
    title: "National El Niño Preparedness Directive",
    area: "Nationwide (All LDRRMCs)",
    provinceSlug: "nationwide",
    regionName: "All Regions",
    summary: "The National Disaster Risk Reduction and Management Council (NDRRMC) directs all Regional and Local DRRM Councils to operationalize Task Force El Niño action plans covering food security, water supply, health, electricity, and fire safety.",
    source: "NDRRMC / Office of Civil Defense (OCD)",
    publishedAt: "October 2, 2026 · 2:00 PM",
    effectiveUntil: "November 30, 2026",
    url: "https://ndrrmc.gov.ph",
    actions: [
      "LGUs must activate local El Niño mitigation task groups and inventory buffer seed stocks",
      "Fire departments must inspect hydrants and conduct grass fire risk assessments",
      "Water utilities must verify backup deep wells and portable water filtration units",
    ],
  },
];

const DATA_SOURCES_CATALOG = [
  {
    id: "src-pagasa",
    name: "PAGASA",
    fullName: "Philippine Atmospheric, Geophysical and Astronomical Services Administration",
    provider: "Department of Science and Technology (DOST)",
    role: "Primary official source for Philippine ENSO alert stages, rainfall anomaly definitions, seasonal climate advisories, Corona climate classification, and synoptic weather observations.",
    license: "Public domain / Open government data under Philippine Freedom of Information",
    attribution: "Data provided by the Philippine Atmospheric, Geophysical and Astronomical Services Administration (DOST-PAGASA).",
    updateFrequency: "Daily weather / Monthly climate outlooks",
    baseUrl: "https://bagong.pagasa.dost.gov.ph",
    endpointsUsed: [
      "Climatological Agrometeorological Bulletins",
      "ENSO Status & Early Warning System",
      "Monthly Drought and Dry Spell Assessment",
      "Daily Hydrometeorological Dam Water Level Bulletins",
    ],
  },
  {
    id: "src-nasa-power",
    name: "NASA POWER",
    fullName: "Prediction of Worldwide Energy Resources",
    provider: "NASA Langley Research Center",
    role: "Provides high-resolution daily meteorological variables (temperature at 2 meters, precipitation, solar irradiance, relative humidity) for province-level anomaly calculation.",
    license: "NASA Open Data Policy (Free for commercial and non-commercial use)",
    attribution: "NASA POWER project at NASA Langley Research Center.",
    updateFrequency: "Daily (2-to-3 day reanalysis lag)",
    baseUrl: "https://power.larc.nasa.gov",
    endpointsUsed: [
      "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,RH2M",
    ],
  },
  {
    id: "src-noaa-cpc",
    name: "NOAA CPC",
    fullName: "Climate Prediction Center",
    provider: "National Oceanic and Atmospheric Administration (NOAA)",
    role: "Source of the Oceanic Niño Index (ONI) historical time series (1950 to present) used to establish ENSO phases and compare historical El Niño intensities.",
    license: "Public domain (US Government work)",
    attribution: "NOAA Climate Prediction Center (CPC).",
    updateFrequency: "Monthly (running 3-month SST anomaly)",
    baseUrl: "https://www.cpc.ncep.noaa.gov",
    endpointsUsed: [
      "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt",
    ],
  },
  {
    id: "src-copernicus-era5",
    name: "Copernicus ERA5",
    fullName: "ECMWF / Copernicus Climate Change Service",
    provider: "European Centre for Medium-Range Weather Forecasts (ECMWF)",
    role: "30-year climatological baseline (1991–2020) used as the historical normal for temperature and precipitation anomaly calculations.",
    license: "Copernicus Open Access Policy (Free for commercial and non-commercial use with attribution)",
    attribution: "Generated using Copernicus Climate Change Service information [2026].",
    updateFrequency: "Baseline static / monthly reanalysis updates",
    baseUrl: "https://cds.climate.copernicus.eu",
    endpointsUsed: ["ERA5 Monthly Averaged Reanalysis on Single Levels"],
  },
  {
    id: "src-psa-psgc",
    name: "Philippine Statistics Authority (PSA)",
    fullName: "Philippine Standard Geographic Code & Census Data",
    provider: "Philippine Statistics Authority (PSA)",
    role: "Official administrative boundaries, PSGC hierarchy codes, municipal classifications, demographic census figures, and national agricultural crop production metrics.",
    license: "Open government data under Philippine public information policy",
    attribution: "Philippine Statistics Authority (PSA).",
    updateFrequency: "Quarterly / Annual agricultural reports; decennial censuses",
    baseUrl: "https://psa.gov.ph",
    endpointsUsed: [
      "Philippine Standard Geographic Code (PSGC 2023–2024)",
      "Crops Statistics of the Philippines",
    ],
  },
  {
    id: "src-nia-mwss",
    name: "NIA & MWSS",
    fullName: "National Irrigation Administration & Metropolitan Waterworks and Sewerage System",
    provider: "Department of Agriculture / MWSS",
    role: "Operational reservoir elevations, normal high water levels (NHWL), rule curves, and agricultural/potable water allocation records for major dams.",
    license: "Open government data / Public regulatory disclosures",
    attribution: "National Irrigation Administration (NIA) and Metropolitan Waterworks and Sewerage System (MWSS).",
    updateFrequency: "Daily dam monitoring bulletins",
    baseUrl: "https://www.nia.gov.ph",
    endpointsUsed: ["Daily Dam Level Reports"],
  },
  {
    id: "src-denr-rbco",
    name: "DENR River Basin Control Office",
    fullName: "Department of Environment and Natural Resources - RBCO",
    provider: "DENR Philippines",
    role: "Delineation and watershed profiles of the 18 Major River Basins of the Philippines.",
    license: "Open government data",
    attribution: "DENR River Basin Control Office (RBCO).",
    updateFrequency: "Periodic / Master planning updates",
    baseUrl: "https://forestry.denr.gov.ph",
    endpointsUsed: ["18 Major River Basins Master Plans"],
  },
];

const METHODOLOGY_SPECS = {
  version: "1.0.0",
  title: "Bantay El Niño Composite Impact Score Methodology",
  summary: "A transparent, auditable 0-to-100 index combining normalized meteorological anomalies, official PAGASA drought criteria, reservoir pressure, and agricultural crop exposure. Designed to communicate multi-dimensional climate risk without relying on opaque AI predictions.",
  formula: "ImpactScore = (0.25 * TempScore) + (0.25 * RainScore) + (0.20 * DroughtScore) + (0.15 * WaterScore) + (0.10 * AgriScore) + (0.05 * OtherScore)",
  components: [
    {
      key: "temperature",
      label: "Temperature Anomaly",
      weight: 25,
      weightFraction: 0.25,
      unit: "°C deviation from 1991–2020 ERA5 baseline",
      normalizationFormula: "min(100, max(0, round((tempAnomalyC / 2.5) * 100)))",
      description: "Measures daytime and mean temperature deviation above long-term normal. A +2.5°C anomaly represents 100 points.",
    },
    {
      key: "rainfall",
      label: "Rainfall Deficit",
      weight: 25,
      weightFraction: 0.25,
      unit: "% reduction from historical baseline",
      normalizationFormula: "min(100, max(0, round((abs(rainfallAnomalyPercent) / 60) * 100)))",
      description: "Measures the depth of precipitation shortfall. Shortfalls at or beyond -60% (PAGASA 'way below normal' threshold) map to 100 points.",
    },
    {
      key: "drought",
      label: "Official Drought Indicators",
      weight: 20,
      weightFraction: 0.20,
      unit: "PAGASA criteria category",
      scoringMap: {
        Drought: 90,
        "Dry Spell": 70,
        "Dry Condition": 45,
        "Near Normal": 20,
      },
      description: "Applies official PAGASA consecutive-month criteria to capture cumulative duration rather than single-month blips.",
    },
    {
      key: "water",
      label: "Water & Reservoir Conditions",
      weight: 15,
      weightFraction: 0.15,
      unit: "Storage % & deviation from rule curve",
      description: "Combines regional dam reservoir elevations relative to rule curves and local groundwater vulnerability.",
    },
    {
      key: "agriculture",
      label: "Agricultural Crop Vulnerability",
      weight: 10,
      weightFraction: 0.10,
      unit: "Crop phonology exposure & rainfed ratio",
      description: "Weights the sensitivity of dominant provincial crops (e.g., rainfed rice and flowering corn vs irrigated perennials) during the current calendar window.",
    },
    {
      key: "other",
      label: "Other Factors (Heat Index, Terrain)",
      weight: 5,
      weightFraction: 0.05,
      unit: "Microclimate & drainage indicators",
      description: "Incorporates relative humidity-driven heat index and porous terrain characteristics.",
    },
  ],
  riskBands: [
    {
      range: "0 – 25",
      level: "low",
      label: "Low Impact",
      colorHex: "#4d7c0f",
      description: "Conditions remain close to seasonal averages. Minimal disruption to municipal water supplies and staple crops.",
    },
    {
      range: "26 – 50",
      level: "moderate",
      label: "Moderate Impact",
      colorHex: "#a16207",
      description: "Emerging deficits detected. Rainfed agriculture requires soil moisture monitoring; water utilities monitor storage drawdowns.",
    },
    {
      range: "51 – 75",
      level: "high",
      label: "High Impact",
      colorHex: "#c2410c",
      description: "Significant dry spell or drought conditions. Irrigation allocations constrained, heat index elevated, crop stress widespread.",
    },
    {
      range: "76 – 100",
      level: "extreme",
      label: "Extreme Impact",
      colorHex: "#991b1b",
      description: "Severe protracted drought. Critical reservoir levels, mandatory water rationing, extensive agricultural crop failures, emergency declarations active.",
    },
  ],
  zeroSubscriptionCompliance: "All computations run purely deterministically using open JavaScript/PostgreSQL logic. No paid third-party AI APIs or proprietary weather feeds are required.",
};

function main() {
  console.log("=== STEP 1: Writing Advisories Catalog ===");
  writeFileSync(join(DATA_DIR, "advisories-catalog.json"), JSON.stringify(ADVISORIES_CATALOG, null, 2));
  console.log(`Saved ${ADVISORIES_CATALOG.length} advisories to advisories-catalog.json`);

  console.log("\n=== STEP 2: Writing Data Sources Catalog ===");
  writeFileSync(join(DATA_DIR, "data-sources.json"), JSON.stringify(DATA_SOURCES_CATALOG, null, 2));
  console.log(`Saved ${DATA_SOURCES_CATALOG.length} data sources to data-sources.json`);

  console.log("\n=== STEP 3: Writing Methodology Specifications ===");
  writeFileSync(join(DATA_DIR, "methodology.json"), JSON.stringify(METHODOLOGY_SPECS, null, 2));
  console.log(`Saved methodology specs to methodology.json`);

  console.log("\n=== ADVISORIES, SOURCES, AND METHODOLOGY GATHERED SUCCESSFULLY! ===");
}

main();
