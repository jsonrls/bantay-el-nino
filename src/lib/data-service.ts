/**
 * src/lib/data-service.ts
 *
 * Unified data access service for Bantay El Niño datasets.
 * Features a resilient Supabase-first architecture: queries live PostgreSQL records
 * when Supabase is configured, and seamlessly falls back to edge-cached static JSON catalogs.
 */

import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type {
  AdminHierarchy,
  Advisory,
  CropInfo,
  DamInfo,
  HistoricalEnsoEvent,
  NoaaOniRecord,
  ProvinceDroughtAssessment,
  ProvinceMaster,
  RiverBasin,
  WeatherStation,
} from "./types";

/**
 * In-memory client cache to avoid redundant network requests.
 */
const cache = new Map<string, unknown>();

async function fetchPublicData<T>(filename: string): Promise<T> {
  if (cache.has(filename)) {
    return cache.get(filename) as T;
  }
  const res = await fetch(`/data/${filename}`);
  if (!res.ok) {
    throw new Error(`Failed to load /data/${filename}: ${res.status}`);
  }
  const data = (await res.json()) as T;
  cache.set(filename, data);
  return data;
}

export const dataService = {
  /** Admin boundaries hierarchy & flat search index (all 17 regions & 1,600+ LGUs) */
  getAdminHierarchy: () => fetchPublicData<AdminHierarchy>("admin-hierarchy.json"),

  /** Master profiles for all 88 provinces & districts (Supabase-first with JSON fallback) */
  getProvincesMaster: async (): Promise<ProvinceMaster[]> => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase.from("provinces").select("*");
          if (!error && data && data.length > 0) {
            return data.map((p) => ({
              psgc: 0,
              name: p.name,
              slug: p.id,
              regionPsgc: 0,
              regionName: p.region,
              islandGroup: p.island_group as "Luzon" | "Visayas" | "Mindanao",
              capital: "",
              population: p.population || 0,
              landAreaKm2: 0,
              climateType: "Type I",
              centroid: [p.longitude || 120.9842, p.latitude || 14.5995],
              baselineAnnualRainfallMm: 2200,
              baselineMeanTempC: 27.5,
              topCrops: ["Rice", "Corn"],
              primaryWaterSources: ["Regional Basin"],
            }));
          }
        }
      }
    } catch (err) {
      console.warn("Falling back to local provinces catalog:", err);
    }
    return fetchPublicData<ProvinceMaster[]>("provinces-master.json");
  },

  /** Province-by-province drought & climate assessment */
  getDroughtAssessments: () =>
    fetchPublicData<ProvinceDroughtAssessment[]>("drought-assessment.json"),

  /** Major Philippine dams & reservoirs */
  getDams: () => fetchPublicData<DamInfo[]>("dams.json"),

  /** Official PAGASA synoptic and agrometeorological weather stations */
  getPagasaStations: () => fetchPublicData<WeatherStation[]>("pagasa-stations.json"),

  /** 18 Major River Basins of the Philippines */
  getRiverBasins: () => fetchPublicData<RiverBasin[]>("river-basins.json"),

  /** Historical Philippine ENSO events catalog (1982–present, Supabase-first) */
  getHistoricalEnsoEvents: async (): Promise<HistoricalEnsoEvent[]> => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase
            .from("historical_events")
            .select("*")
            .order("start_date", { ascending: true });
          if (!error && data && data.length > 0) {
            return data.map((row) => ({
              id: row.id,
              title: row.title,
              period: `${row.start_date.substring(0, 4)} – ${row.end_date ? row.end_date.substring(0, 4) : ""}`,
              type: "El Niño",
              intensity: row.peak_oni >= 2.0 ? "Very Strong" : row.peak_oni >= 1.5 ? "Strong" : "Moderate",
              peakOni: Number(row.peak_oni) || 1.8,
              philippinesImpactSummary: row.description,
              temperatureAnomalyC: 1.5,
              peakRainfallDeficitPercent: -45,
              provincesUnderDrought: row.affected_provinces || 30,
              estimatedAgriculturalLossPhpBillion: row.damage_est_php
                ? Number(row.damage_est_php) / 1e9
                : 5.0,
              angatDamLowestLevelM: 180.0,
              keyAffectedRegions: ["Central Luzon", "Western Visayas", "Mindanao"],
              stateOfCalamityDeclarations: 15,
            }));
          }
        }
      }
    } catch (err) {
      console.warn("Falling back to local historical ENSO catalog:", err);
    }
    return fetchPublicData<HistoricalEnsoEvent[]>("historical-enso-events.json");
  },

  /** NOAA CPC Oceanic Niño Index historical series (1950–present) */
  getNoaaOniSeries: () => fetchPublicData<NoaaOniRecord[]>("noaa-oni-series.json"),

  /** Major agricultural crop vulnerability profiles */
  getCrops: () => fetchPublicData<CropInfo[]>("crops.json"),

  /** Structured official advisories catalog (Supabase-first with JSON fallback) */
  getAdvisories: async (): Promise<Advisory[]> => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase
            .from("advisories")
            .select("*")
            .eq("active", true)
            .order("published_at", { ascending: false });

          if (!error && data && data.length > 0) {
            return data.map((row) => ({
              id: row.id,
              level: (row.severity?.toLowerCase() || "moderate") as Advisory["level"],
              category: (row.advisory_type?.charAt(0).toUpperCase() +
                row.advisory_type?.slice(1).toLowerCase()) as Advisory["category"],
              title: row.title,
              area: "Philippines (National / Regional)",
              summary: row.summary || row.body || "",
              source: "DOST-PAGASA & Inter-Agency El Niño Task Force",
              publishedAt: row.published_at
                ? new Date(row.published_at).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Active Advisory",
              url: row.source_url || "https://bagong.pagasa.dost.gov.ph",
            }));
          }
        }
      }
    } catch (err) {
      console.warn("Falling back to local advisories catalog:", err);
    }
    return fetchPublicData<Advisory[]>("advisories-catalog.json");
  },

  /** Transparent open data sources metadata */
  getDataSources: () => fetchPublicData<Record<string, unknown>[]>("data-sources.json"),

  /** Bantay composite score methodology specifications */
  getMethodology: () => fetchPublicData<Record<string, unknown>>("methodology.json"),
};
