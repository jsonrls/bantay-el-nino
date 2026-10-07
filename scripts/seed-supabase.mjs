/**
 * scripts/seed-supabase.mjs
 *
 * Seeds the Supabase PostgreSQL database from local verified JSON datasets in public/data/.
 * Usage:
 *   node scripts/seed-supabase.mjs
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * from .env.local or process.env.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local if present
const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [k, ...v] = trimmed.split("=");
    if (k && v.length) {
      process.env[k.trim()] = v.join("=").trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl.includes("your-project-id") ||
  supabaseKey.includes("your-supabase")
) {
  console.log("ℹ️ Supabase credentials not found or set to placeholders in .env.local.");
  console.log("   Add your actual URL and Anon Key in .env.local, then re-run this script.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const dataDir = join(process.cwd(), "public", "data");

function readJson(filename) {
  const p = join(dataDir, filename);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

async function seed() {
  console.log("🚀 Starting Supabase Database Seed for Bantay El Niño...\n");

  // 1. Seed Provinces
  const provinces = readJson("provinces-master.json");
  if (provinces && provinces.length > 0) {
    const rows = provinces.map((p) => ({
      id: p.slug,
      name: p.name,
      region: p.region,
      island_group: p.islandGroup,
      latitude: p.centroid[1],
      longitude: p.centroid[0],
      population: p.population || null,
    }));
    const { error } = await supabase.from("provinces").upsert(rows, { onConflict: "id" });
    if (error) console.error("❌ Error seeding provinces:", error.message);
    else console.log(`✓ Seeded ${rows.length} provinces into 'provinces'`);
  }

  // 2. Seed Data Sources
  const sources = readJson("data-sources.json");
  if (sources && sources.length > 0) {
    const rows = sources.map((s) => ({
      id: s.id,
      name: s.name,
      provider: s.provider,
      source_type: s.sourceType,
      base_url: s.baseUrl,
      license: s.license,
      attribution: s.attribution,
      update_frequency: s.updateFrequency,
      active: true,
    }));
    const { error } = await supabase.from("data_sources").upsert(rows, { onConflict: "id" });
    if (error) console.error("❌ Error seeding data_sources:", error.message);
    else console.log(`✓ Seeded ${rows.length} data sources into 'data_sources'`);
  }

  // 3. Seed Advisories
  const advisories = readJson("advisories-catalog.json");
  if (advisories && advisories.length > 0) {
    const rows = advisories.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      body: a.body || a.summary,
      advisory_type: a.type.toUpperCase(),
      severity: a.severity.toUpperCase(),
      published_at: a.issuedAt,
      active: true,
    }));
    const { error } = await supabase.from("advisories").upsert(rows, { onConflict: "id" });
    if (error) console.error("❌ Error seeding advisories:", error.message);
    else console.log(`✓ Seeded ${rows.length} advisories into 'advisories'`);
  }

  // 4. Seed Historical Events
  const events = readJson("historical-enso-events.json");
  if (events && events.length > 0) {
    const rows = events.map((e) => ({
      id: e.id,
      title: e.label,
      description: e.description,
      event_type: "EL_NINO",
      start_date: `${e.startYear}-01-01`,
      end_date: `${e.endYear}-12-31`,
      peak_oni: e.peakOni,
      damage_est_php: e.damagePhpBillions ? e.damagePhpBillions * 1e9 : null,
      affected_provinces: e.affectedProvinces || null,
    }));
    const { error } = await supabase.from("historical_events").upsert(rows, { onConflict: "id" });
    if (error) console.error("❌ Error seeding historical_events:", error.message);
    else console.log(`✓ Seeded ${rows.length} historical events into 'historical_events'`);
  }

  // 5. Seed Risk Scores & Assessments
  const assessments = readJson("drought-assessment.json");
  if (assessments && assessments.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const rows = assessments.map((a) => ({
      province_id: a.provinceSlug,
      date: today,
      composite_score: a.compositeScore,
      risk_level: a.riskLevel,
      drought_score: a.droughtStatus === "Drought" ? 90 : a.droughtStatus === "Dry Spell" ? 60 : 20,
    }));
    const { error } = await supabase
      .from("risk_scores")
      .upsert(rows, { onConflict: "province_id,date" });
    if (error) console.error("❌ Error seeding risk_scores:", error.message);
    else console.log(`✓ Seeded ${rows.length} provincial risk assessments into 'risk_scores'`);
  }

  console.log("\n🎉 Supabase Database Seed Completed Successfully!");
}

seed().catch(console.error);
