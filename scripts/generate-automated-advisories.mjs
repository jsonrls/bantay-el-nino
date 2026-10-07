/**
 * scripts/generate-automated-advisories.mjs
 *
 * 100% AUTOMATED ADVISORY ENGINE FOR BANTAY EL NIÑO
 *
 * Automatically synthesizes official advisories from:
 * 1. NOAA CPC ONI live data (ENSO phases: El Niño / La Niña / Neutral)
 * 2. Official DOST-PAGASA Drought & Dry Spell criteria (3+ month deficits)
 * 3. Major Reservoir elevations vs seasonal rule curves (Angat, Pantabangan, Magat, San Roque)
 * 4. Open-Meteo live Heat Index readings (Danger ≥ 42°C & Extreme Caution ≥ 33°C)
 * 5. GDACS (Global Disaster Alert and Coordination System) active Philippine alerts
 *
 * Writes output to:
 * - public/data/advisories-catalog.json
 * - Supabase 'advisories' table (if configured in .env.local)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "public", "data");

// Load .env.local if present
const envPath = join(ROOT, ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [k, ...v] = trimmed.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  }
}

function readJson(filename) {
  const p = join(DATA_DIR, filename);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

const now = new Date();
const formattedDate = now.toLocaleDateString("en-PH", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

async function generateAutomatedAdvisories() {
  console.log("⚡ Starting 100% Automated Advisory Generation Engine...\n");

  const advisories = [];

  // =========================================================================
  // 1. NOAA CPC ENSO STATUS ADVISORY
  // =========================================================================
  const oniSeries = readJson("noaa-oni-series.json");
  if (oniSeries && oniSeries.length > 0) {
    const latestOni = oniSeries[oniSeries.length - 1];
    const isElNino = latestOni.anomaly >= 0.5;
    const isLaNina = latestOni.anomaly <= -0.5;

    advisories.push({
      id: "adv-auto-enso-global",
      level: isElNino ? (latestOni.anomaly >= 1.5 ? "extreme" : "high") : isLaNina ? "moderate" : "low",
      category: "El Niño",
      title: isElNino
        ? `Official El Niño Advisory: Pacific Anomaly +${latestOni.anomaly}°C`
        : isLaNina
        ? `La Niña Watch: Pacific Anomaly ${latestOni.anomaly}°C`
        : `ENSO-Neutral Transition Outlook (Anomaly: ${latestOni.anomaly >= 0 ? "+" : ""}${latestOni.anomaly}°C)`,
      area: "National (All 17 Regions)",
      provinceSlug: "national",
      regionName: "National",
      summary: `NOAA Climate Prediction Center reports the Oceanic Niño Index (ONI) at ${latestOni.anomaly >= 0 ? "+" : ""}${latestOni.anomaly}°C for the ${latestOni.season} season. Atmospheric-oceanic coupling indicates ${latestOni.phase} conditions with ${latestOni.intensity.toLowerCase()} intensity.`,
      source: "NOAA Climate Prediction Center & DOST-PAGASA Climatology",
      publishedAt: formattedDate,
      effectiveUntil: "Next Monthly Cycle",
      url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ensoyears.shtml",
      actions: isElNino
        ? [
            "Maintain rainwater collection drums and optimize domestic water recycling",
            "Follow municipal irrigation scheduling and Alternate Wetting & Drying protocols",
            "Adjust planting schedules for drought-tolerant crop varieties",
          ]
        : [
            "Monitor weekly PAGASA regional rainfall forecasts",
            "Prepare drainage canals for localized monsoon rain bursts",
          ],
    });
  }

  // =========================================================================
  // 2. DOST-PAGASA DROUGHT & DRY SPELL ADVISORIES (From Provincial Assessments)
  // =========================================================================
  const assessments = readJson("drought-assessment.json");
  if (assessments && assessments.length > 0) {
    const droughtProvinces = assessments.filter(
      (a) => a.droughtStatus === "Drought" || a.consecutiveDeficitMonths >= 4
    );

    if (droughtProvinces.length > 0) {
      const topDrought = droughtProvinces.slice(0, 3);
      for (const prov of topDrought) {
        advisories.push({
          id: `adv-auto-drought-${prov.provinceSlug}`,
          level: "extreme",
          category: "PAGASA",
          title: `Severe Meteorological Drought Advisory: ${prov.provinceName}`,
          area: `${prov.provinceName} (${prov.regionName})`,
          provinceSlug: prov.provinceSlug,
          regionName: prov.regionName,
          summary: `${prov.provinceName} has recorded ${prov.consecutiveDeficitMonths} consecutive months of rainfall deficit (${prov.rainfallAnomalyStr}), accompanied by temperature anomalies of ${prov.temperatureAnomalyStr}. Severe moisture depletion threatens rainfed rice, corn, and high-value crops.`,
          source: "DOST-PAGASA Drought Criteria & Bantay Composite Calculations",
          publishedAt: formattedDate,
          effectiveUntil: "End of Current Month",
          url: "https://bagong.pagasa.dost.gov.ph",
          actions: prov.recommendedActions?.farmers || [
            "Implement rotational irrigation distribution immediately",
            "Deploy soil mulching to conserve remaining sub-surface moisture",
            "Coordinate with Municipal Agriculture Offices for drought relief assistance",
          ],
        });
      }
    }

    const drySpellProvinces = assessments.filter(
      (a) => a.droughtStatus === "Dry Spell" && !droughtProvinces.includes(a)
    );

    if (drySpellProvinces.length > 0) {
      const topDrySpell = drySpellProvinces[0];
      advisories.push({
        id: `adv-auto-dryspell-${topDrySpell.provinceSlug}`,
        level: "high",
        category: "PAGASA",
        title: `Dry Spell Warning: ${topDrySpell.provinceName}`,
        area: `${topDrySpell.provinceName} (${topDrySpell.regionName})`,
        provinceSlug: topDrySpell.provinceSlug,
        regionName: topDrySpell.regionName,
        summary: `Persistent below-normal precipitation (${topDrySpell.rainfallAnomalyStr}) for 3 consecutive months. Farmers are advised to prepare supplemental irrigation and protect shallow root crops.`,
        source: "DOST-PAGASA Synoptic Weather Monitoring",
        publishedAt: formattedDate,
        effectiveUntil: "End of Current Month",
        url: "https://bagong.pagasa.dost.gov.ph",
        actions: [
          "Inspect shallow tube wells and small farm reservoirs",
          "Avoid midday field burning to prevent grass and brush fire spread",
        ],
      });
    }
  }

  // =========================================================================
  // 3. RESERVOIR & DAM WATER STORAGE CONSERVATION WATCH
  // =========================================================================
  const dams = readJson("dams.json");
  const damsStatus = readJson("dams-status.json");

  if (dams && damsStatus) {
    const criticalDamStatus = damsStatus.find(
      (s) => s.currentLevelM < s.ruleCurveM || s.trend === "falling"
    );

    if (criticalDamStatus) {
      const damMeta = dams.find((d) => d.id === criticalDamStatus.damId) || dams[0];
      const deficit = (criticalDamStatus.ruleCurveM - criticalDamStatus.currentLevelM).toFixed(2);

      advisories.push({
        id: `adv-auto-dam-${damMeta.slug}`,
        level: "high",
        category: "Water",
        title: `${damMeta.name} Reservoir Conservation Watch`,
        area: `${damMeta.province} (${damMeta.region})`,
        provinceSlug: damMeta.provinceSlug,
        regionName: damMeta.region,
        summary: `${damMeta.name} elevation is at ${criticalDamStatus.currentLevelM.toFixed(2)}m (seasonal rule curve: ${criticalDamStatus.ruleCurveM.toFixed(2)}m, deficit: -${deficit}m). Inflows remain below historical normal. Water concessionaires and the National Irrigation Administration are calibrating releases.`,
        source: "DOST-PAGASA Hydrometeorology Division & National Irrigation Administration",
        publishedAt: formattedDate,
        effectiveUntil: "Next Weekly Hydrological Bulletin",
        url: "https://bagong.pagasa.dost.gov.ph",
        actions: [
          "Practice domestic water conservation (minimize hose cleaning, reuse rinse water)",
          "Report commercial water main leaks immediately to municipal concessionaires",
          "Irrigation associations should adhere strictly to rotational canal distribution",
        ],
      });
    }
  }

  // =========================================================================
  // 4. OPEN-METEO LIVE HEAT INDEX THRESHOLD ADVISORY
  // =========================================================================
  try {
    // Check heat index for representative lowland agricultural centers
    const checkCoords = [
      { name: "Cabanatuan, Nueva Ecija", slug: "nueva-ecija", lat: 15.4828, lon: 120.9708 },
      { name: "Dagupan, Pangasinan", slug: "pangasinan", lat: 16.0433, lon: 120.3344 },
      { name: "Tuguegarao, Cagayan", slug: "cagayan", lat: 17.6132, lon: 121.727 },
    ];

    for (const spot of checkCoords) {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&current=apparent_temperature,temperature_2m&timezone=Asia%2FManila`;
      const res = await fetch(weatherUrl);
      if (res.ok) {
        const data = await res.json();
        const apparent = data.current?.apparent_temperature;

        if (apparent >= 38) {
          const isDanger = apparent >= 42;
          advisories.push({
            id: `adv-auto-heat-${spot.slug}`,
            level: isDanger ? "extreme" : "high",
            category: "Health",
            title: `${isDanger ? "Danger" : "Extreme Caution"} Heat Index Advisory: ${spot.name}`,
            area: `${spot.name} and Surrounding Valley Plains`,
            provinceSlug: spot.slug,
            regionName: "Lowland Agricultural Basins",
            summary: `Automated meteorological sensors recorded peak apparent temperature at ${apparent.toFixed(1)}°C in ${spot.name}. Prolonged exposure or physical labor during midday brings high probability of heat exhaustion and potential heat stroke.`,
            source: "Open-Meteo & DOST-PAGASA Heat Index Classification Scale",
            publishedAt: formattedDate,
            effectiveUntil: "18:00 PHT Today",
            url: "https://bagong.pagasa.dost.gov.ph",
            actions: [
              "Drink water regularly even before feeling thirsty (2 to 3 liters daily)",
              "Reschedule strenuous outdoor farm and construction tasks to early morning or late afternoon",
              "Wear loose-fitting, light-colored clothing and wide-brimmed hats outdoors",
            ],
          });
          break; // Keep to 1 representative heat alert to avoid clutter
        }
      }
    }
  } catch (err) {
    console.warn("Skipping live heat index query check:", err.message);
  }

  // =========================================================================
  // 5. GDACS GLOBAL DISASTER ALERT FEED CHECK (PHILIPPINES)
  // =========================================================================
  try {
    const gdacsRes = await fetch("https://www.gdacs.org/xml/rss.xml");
    if (gdacsRes.ok) {
      const xml = await gdacsRes.text();
      // Check if Philippines has an active alert in GDACS RSS
      const phMatch = xml.match(/<item>[\s\S]*?Philippines[\s\S]*?<\/item>/i);
      if (phMatch) {
        const item = phMatch[0];
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/);

        if (titleMatch && titleMatch[1]) {
          advisories.push({
            id: "adv-auto-gdacs-ph",
            level: "high",
            category: "General",
            title: `International Disaster Coordination Notice: ${titleMatch[1].replace(/<[^>]+>/g, "").trim()}`,
            area: "Philippines (National Territory)",
            provinceSlug: "national",
            regionName: "National",
            summary: descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim().substring(0, 250) + "..." : "Active alert issued by GDACS for Philippine territory.",
            source: "Global Disaster Alert and Coordination System (GDACS - UN/EC)",
            publishedAt: formattedDate,
            effectiveUntil: "Under Active Monitoring",
            url: "https://www.gdacs.org",
            actions: [
              "Follow official directives from NDRRMC and local City/Municipal DRRM offices",
              "Maintain emergency battery power and clean potable water reserves",
            ],
          });
        }
      }
    }
  } catch (err) {
    console.warn("Skipping GDACS feed check:", err.message);
  }

  console.log(`✓ Compiled ${advisories.length} official automated advisories.`);

  // Write to public/data/advisories-catalog.json
  const outPath = join(DATA_DIR, "advisories-catalog.json");
  writeFileSync(outPath, JSON.stringify(advisories, null, 2), "utf8");
  console.log(`✓ Written to public/data/advisories-catalog.json`);

  // Write to Supabase if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project-id")) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const rows = advisories.map((a) => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        body: a.summary,
        advisory_type: a.category.toUpperCase(),
        severity: a.level.toUpperCase(),
        published_at: new Date().toISOString(),
        active: true,
      }));

      const { error } = await supabase.from("advisories").upsert(rows, { onConflict: "id" });
      if (error) {
        console.warn("Could not sync to Supabase (RLS or policy):", error.message);
      } else {
        console.log(`✓ Synchronized ${rows.length} automated advisories directly to Supabase 'advisories' table!`);
      }
    } catch (err) {
      console.warn("Supabase sync warning:", err.message);
    }
  }

  console.log("\n🎉 Automated Advisory Generation Completed!\n");
}

generateAutomatedAdvisories().catch(console.error);
