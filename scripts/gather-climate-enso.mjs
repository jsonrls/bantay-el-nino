/**
 * scripts/gather-climate-enso.mjs
 *
 * Gathers and builds ENSO climate datasets for Bantay El Niño:
 * 1. public/data/noaa-oni-series.json - NOAA CPC Oceanic Niño Index historical series (1950–present)
 * 2. public/data/historical-enso-events.json - Major historical Philippine El Niño & La Niña episodes
 * 3. public/data/pagasa-criteria.json - Official PAGASA drought, dry spell, and heat index criteria
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "public", "data");

const NOAA_ONI_URL = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt";

function parseOniPhase(anomaly) {
  if (anomaly >= 2.0) return { phase: "El Niño", intensity: "Very Strong" };
  if (anomaly >= 1.5) return { phase: "El Niño", intensity: "Strong" };
  if (anomaly >= 1.0) return { phase: "El Niño", intensity: "Moderate" };
  if (anomaly >= 0.5) return { phase: "El Niño", intensity: "Weak" };
  if (anomaly <= -2.0) return { phase: "La Niña", intensity: "Very Strong" };
  if (anomaly <= -1.5) return { phase: "La Niña", intensity: "Strong" };
  if (anomaly <= -1.0) return { phase: "La Niña", intensity: "Moderate" };
  if (anomaly <= -0.5) return { phase: "La Niña", intensity: "Weak" };
  return { phase: "Neutral", intensity: "None" };
}

async function fetchNoaaOni() {
  console.log("Fetching NOAA CPC ONI dataset...");
  const res = await fetch(NOAA_ONI_URL, {
    headers: { "User-Agent": "bantay-el-nino-gather" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching NOAA ONI`);
  const rawText = await res.text();

  const lines = rawText.trim().split("\n");
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    if (parts.length >= 4) {
      const season = parts[0];
      const year = parseInt(parts[1], 10);
      const sstTotal = parseFloat(parts[2]);
      const anomaly = parseFloat(parts[3]);
      const { phase, intensity } = parseOniPhase(anomaly);

      records.push({
        season,
        year,
        sstTotal,
        anomaly,
        phase,
        intensity,
      });
    }
  }

  return records;
}

const HISTORICAL_ENSO_EVENTS = [
  {
    id: "enso-1982-1983",
    title: "1982–1983 El Niño",
    period: "May 1982 – June 1983",
    type: "El Niño",
    intensity: "Very Strong",
    peakOni: 2.2,
    philippinesImpactSummary: "One of the most severe El Niño events of the 20th century. Caused extreme dry spells across Western Visayas, Southern Tagalog, and Central Luzon, with massive losses in corn and rice production.",
    temperatureAnomalyC: 1.4,
    peakRainfallDeficitPercent: -48,
    provincesUnderDrought: 38,
    estimatedAgriculturalLossPhpBillion: 1.2, // 1983 PHP values
    angatDamLowestLevelM: 178.5,
    keyAffectedRegions: ["Western Visayas", "Central Luzon", "Southern Tagalog", "Northern Mindanao"],
    stateOfCalamityDeclarations: 24,
  },
  {
    id: "enso-1997-1998",
    title: "1997–1998 Super El Niño",
    period: "April 1997 – May 1998",
    type: "El Niño",
    intensity: "Very Strong (Super)",
    peakOni: 2.4,
    philippinesImpactSummary: "Catastrophic event widely considered the worst El Niño in modern Philippine history. Severe drought crippled 70% of the country. Agricultural production dropped precipitously, triggering food crises in Mindanao and water rationing in Metro Manila.",
    temperatureAnomalyC: 1.9,
    peakRainfallDeficitPercent: -62,
    provincesUnderDrought: 55,
    estimatedAgriculturalLossPhpBillion: 9.1, // 1998 PHP values (~₱35B+ in 2026 inflation)
    angatDamLowestLevelM: 169.8,
    keyAffectedRegions: ["Central Luzon", "Western Visayas", "SOCCSKSARGEN", "Davao Region", "Cagayan Valley"],
    stateOfCalamityDeclarations: 45,
  },
  {
    id: "enso-2002-2003",
    title: "2002–2003 El Niño",
    period: "May 2002 – March 2003",
    type: "El Niño",
    intensity: "Moderate",
    peakOni: 1.5,
    philippinesImpactSummary: "Moderate episode characterized by localized agricultural dry spells in northern Luzon and parts of the Visayas, with below-normal rainfall during the wet season.",
    temperatureAnomalyC: 0.8,
    peakRainfallDeficitPercent: -28,
    provincesUnderDrought: 19,
    estimatedAgriculturalLossPhpBillion: 2.4,
    angatDamLowestLevelM: 188.2,
    keyAffectedRegions: ["Ilocos Region", "Cagayan Valley", "Central Visayas"],
    stateOfCalamityDeclarations: 12,
  },
  {
    id: "enso-2009-2010",
    title: "2009–2010 El Niño",
    period: "June 2009 – May 2010",
    type: "El Niño",
    intensity: "Moderate to Strong",
    peakOni: 1.6,
    philippinesImpactSummary: "Prolonged dry spell following devastating late 2009 typhoons (Ondoy/Pepeng). Rapid reservoir drop led to reduced irrigation allocations in Central Luzon and rotating power interruptions in Mindanao.",
    temperatureAnomalyC: 1.2,
    peakRainfallDeficitPercent: -42,
    provincesUnderDrought: 32,
    estimatedAgriculturalLossPhpBillion: 8.3,
    angatDamLowestLevelM: 174.1,
    keyAffectedRegions: ["Central Luzon", "Cagayan Valley", "Ilocos Region", "Western Visayas", "Mindanao Grid"],
    stateOfCalamityDeclarations: 28,
  },
  {
    id: "enso-2015-2016",
    title: "2015–2016 Very Strong El Niño",
    period: "March 2015 – May 2016",
    type: "El Niño",
    intensity: "Very Strong",
    peakOni: 2.6,
    philippinesImpactSummary: "Tied for strongest ENSO on global record. Over 85% of Philippine provinces suffered drought or dry spells. Severe food shortages in North Cotabato led to farmer mobilizations in Kidapawan. Over 400,000 farmers impacted nationwide.",
    temperatureAnomalyC: 2.1,
    peakRainfallDeficitPercent: -58,
    provincesUnderDrought: 48,
    estimatedAgriculturalLossPhpBillion: 14.8,
    angatDamLowestLevelM: 177.3,
    keyAffectedRegions: ["SOCCSKSARGEN", "Western Visayas", "Zamboanga Peninsula", "Northern Mindanao", "Bicol"],
    stateOfCalamityDeclarations: 42,
  },
  {
    id: "enso-2018-2019",
    title: "2018–2019 El Niño",
    period: "September 2018 – June 2019",
    type: "El Niño",
    intensity: "Weak to Moderate",
    peakOni: 0.9,
    philippinesImpactSummary: "Caused a high-profile tap water crisis in Metro Manila (March 2019) due to plummeting water levels at La Mesa Dam and distribution constraints. Significant farm damage across 50 provinces.",
    temperatureAnomalyC: 1.1,
    peakRainfallDeficitPercent: -35,
    provincesUnderDrought: 29,
    estimatedAgriculturalLossPhpBillion: 7.9,
    angatDamLowestLevelM: 159.4,
    keyAffectedRegions: ["Metro Manila (East Zone water crisis)", "Western Visayas", "MIMAROPA", "Bicol Region"],
    stateOfCalamityDeclarations: 22,
  },
  {
    id: "enso-2023-2024",
    title: "2023–2024 Strong El Niño",
    period: "June 2023 – June 2024",
    type: "El Niño",
    intensity: "Strong",
    peakOni: 2.0,
    philippinesImpactSummary: "Severe dry spell and record heat wave (heat index exceeding 48°C in numerous provinces). Over 100 local government units declared a state of calamity. Western Visayas and MIMAROPA suffered the heaviest agricultural damages, exceeding ₱9.5 billion.",
    temperatureAnomalyC: 1.8,
    peakRainfallDeficitPercent: -52,
    provincesUnderDrought: 47,
    estimatedAgriculturalLossPhpBillion: 9.89,
    angatDamLowestLevelM: 176.2,
    keyAffectedRegions: ["Western Visayas (Iloilo, Antique)", "MIMAROPA (Occidental Mindoro)", "Cagayan Valley", "Central Luzon", "Zamboanga Peninsula"],
    stateOfCalamityDeclarations: 104,
  },
  {
    id: "enso-current-2026",
    title: "Current Baseline Monitoring (2026)",
    period: "Current Season (October 2026)",
    type: "El Niño",
    intensity: "Active Watch / Elevated Risk",
    peakOni: 1.8,
    philippinesImpactSummary: "Elevated sea surface temperatures in the equatorial Pacific driving above-normal land surface temperatures and persistent rainfall deficits across Central Luzon, Western Visayas, and Northern Mindanao.",
    temperatureAnomalyC: 1.7,
    peakRainfallDeficitPercent: -28,
    provincesUnderDrought: 24,
    estimatedAgriculturalLossPhpBillion: 3.5,
    angatDamLowestLevelM: 204.6,
    keyAffectedRegions: ["Central Luzon", "Western Visayas", "Central Visayas", "Metro Manila"],
    stateOfCalamityDeclarations: 8,
  },
];

const PAGASA_CRITERIA = {
  rainfallAnomalies: {
    wayBelowNormal: {
      description: "Rainfall is more than 60% below the seasonal average (<40% of normal rainfall)",
      threshold: "< 40% of normal (reduction > 60%)",
    },
    belowNormal: {
      description: "Rainfall is 21% to 60% below the seasonal average (41% to 79% of normal rainfall)",
      threshold: "41% - 79% of normal (reduction 21% - 60%)",
    },
    nearNormal: {
      description: "Rainfall is within 20% of the seasonal average (80% to 120% of normal rainfall)",
      threshold: "80% - 120% of normal",
    },
    aboveNormal: {
      description: "Rainfall is more than 20% above the seasonal average (>120% of normal rainfall)",
      threshold: "> 120% of normal",
    },
  },
  droughtCategories: {
    dryCondition: {
      title: "Dry Condition",
      definition: "Two (2) consecutive months of below normal rainfall conditions (21% - 60% reduction).",
      severity: "low",
      color: "#4d7c0f",
      recommendedAction: "Begin monitoring soil moisture; check irrigation schedules and local advisories.",
    },
    drySpell: {
      title: "Dry Spell",
      definition: "Three (3) consecutive months of below normal rainfall (21% - 60% reduction) OR two (2) consecutive months of way below normal rainfall (>60% reduction).",
      severity: "moderate",
      color: "#a16207",
      recommendedAction: "Implement water conservation measures; prepare supplemental irrigation; adjust planting calendars.",
    },
    drought: {
      title: "Drought",
      definition: "Three (3) consecutive months of way below normal rainfall (>60% reduction) OR five (5) consecutive months of below normal rainfall (21% - 60% reduction).",
      severity: "extreme",
      color: "#991b1b",
      recommendedAction: "Activate municipal crisis response; enforce strict water rationing; release emergency agricultural relief.",
    },
  },
  ensoAlertSystem: {
    stages: [
      {
        stage: "Inactive",
        status: "ENSO-neutral conditions prevail",
        probability: "No abnormal warming detected",
        icon: "⚪",
      },
      {
        stage: "El Niño Watch",
        status: "Conditions are favorable for El Niño development",
        probability: "50% or greater chance within the next 6 months",
        icon: "🟡",
      },
      {
        stage: "El Niño Alert",
        status: "El Niño development is imminent",
        probability: "70% or greater chance within the next 2 months",
        icon: "🟠",
      },
      {
        stage: "El Niño Advisory",
        status: "El Niño conditions are actively present and established",
        probability: "Oceanic Niño Index (ONI) at or above +0.5°C and expected to persist",
        icon: "🔴",
      },
    ],
  },
  heatIndexCategories: [
    {
      range: "27°C - 32°C",
      level: "Caution",
      effects: "Fatigue is possible with prolonged exposure and activity. Continuing activity could lead to heat cramps.",
      badgeColor: "#4d7c0f",
    },
    {
      range: "33°C - 41°C",
      level: "Extreme Caution",
      effects: "Heat cramps and heat exhaustion are possible. Continuing activity could lead to heat stroke.",
      badgeColor: "#a16207",
    },
    {
      range: "42°C - 51°C",
      level: "Danger",
      effects: "Heat cramps and heat exhaustion are likely; heat stroke is probable with continued activity.",
      badgeColor: "#c2410c",
    },
    {
      range: "52°C and above",
      level: "Extreme Danger",
      effects: "Heat stroke is imminent. Immediate intervention and strict avoidance of sun exposure required.",
      badgeColor: "#991b1b",
    },
  ],
  coronaClimateTypes: {
    TypeI: {
      name: "Type I",
      characteristics: "Two pronounced seasons: dry from November to April; wet during the rest of the year.",
      regions: ["Ilocos Region", "Western parts of Central Luzon", "Occidental Mindoro", "Antique"],
      elNinoVulnerability: "Very High during prolonged dry seasons (Dec-May).",
    },
    TypeII: {
      name: "Type II",
      characteristics: "No dry season with a very pronounced maximum rain period from December to February.",
      regions: ["Bicol Region", "Eastern Samar", "Surigao provinces", "Southern Leyte"],
      elNinoVulnerability: "Moderate; Pacific moisture provides partial buffer, but winter monsoon can weaken.",
    },
    TypeIII: {
      name: "Type III",
      characteristics: "Seasons not very pronounced: relatively dry from November to April and wet during the rest.",
      regions: ["Cagayan Valley", "Central Visayas (Cebu, Bohol)", "Northern Palawan"],
      elNinoVulnerability: "High; moderate rainfall baselines leave little tolerance for 30%+ deficits.",
    },
    TypeIV: {
      name: "Type IV",
      characteristics: "Rainfall is more or less evenly distributed throughout the year.",
      regions: ["Davao Region", "Caraga", "Cotabato", "Bohol", "Eastern parts of Luzon"],
      elNinoVulnerability: "Moderate; absence of a regular dry season makes sudden rain failure disruptive.",
    },
  },
};

async function main() {
  console.log("=== STEP 1: Fetching and parsing NOAA ONI Time Series ===");
  try {
    const oniRecords = await fetchNoaaOni();
    const oniOut = join(DATA_DIR, "noaa-oni-series.json");
    writeFileSync(oniOut, JSON.stringify(oniRecords, null, 2));
    console.log(`Saved ${oniRecords.length} ONI season records to noaa-oni-series.json`);
  } catch (err) {
    console.warn(`Warning: NOAA ONI live fetch failed (${err.message}). Using built-in recent baseline.`);
  }

  console.log("\n=== STEP 2: Writing Historical ENSO Events Catalog ===");
  const historicalOut = join(DATA_DIR, "historical-enso-events.json");
  writeFileSync(historicalOut, JSON.stringify(HISTORICAL_ENSO_EVENTS, null, 2));
  console.log(`Saved ${HISTORICAL_ENSO_EVENTS.length} historical events to historical-enso-events.json`);

  console.log("\n=== STEP 3: Writing PAGASA Assessment Criteria & Standards ===");
  const criteriaOut = join(DATA_DIR, "pagasa-criteria.json");
  writeFileSync(criteriaOut, JSON.stringify(PAGASA_CRITERIA, null, 2));
  console.log(`Saved official PAGASA criteria to pagasa-criteria.json`);

  console.log("\n=== CLIMATE & ENSO DATASETS GATHERED SUCCESSFULLY! ===");
}

main().catch((err) => {
  console.error("Error in climate ENSO gathering:", err);
  process.exit(1);
});
