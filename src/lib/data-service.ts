/**
 * src/lib/data-service.ts
 *
 * Unified data access service for Bantay El Niño datasets.
 * Works seamlessly in server environments and provides client-friendly fetch helpers.
 */

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
 * Client-side fetch helper with simple caching.
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

  /** Master profiles for all 88 provinces & districts */
  getProvincesMaster: () => fetchPublicData<ProvinceMaster[]>("provinces-master.json"),

  /** Province-by-province drought & climate assessment */
  getDroughtAssessments: () => fetchPublicData<ProvinceDroughtAssessment[]>("drought-assessment.json"),

  /** Major Philippine dams & reservoirs */
  getDams: () => fetchPublicData<DamInfo[]>("dams.json"),

  /** Official PAGASA synoptic and agrometeorological weather stations */
  getPagasaStations: () => fetchPublicData<WeatherStation[]>("pagasa-stations.json"),

  /** 18 Major River Basins of the Philippines */
  getRiverBasins: () => fetchPublicData<RiverBasin[]>("river-basins.json"),

  /** Historical Philippine ENSO events catalog (1982–present) */
  getHistoricalEnsoEvents: () => fetchPublicData<HistoricalEnsoEvent[]>("historical-enso-events.json"),

  /** NOAA CPC Oceanic Niño Index historical series (1950–present) */
  getNoaaOniSeries: () => fetchPublicData<NoaaOniRecord[]>("noaa-oni-series.json"),

  /** Major agricultural crop vulnerability profiles */
  getCrops: () => fetchPublicData<CropInfo[]>("crops.json"),

  /** Structured official advisories catalog */
  getAdvisories: () => fetchPublicData<Advisory[]>("advisories-catalog.json"),

  /** Transparent open data sources metadata */
  getDataSources: () => fetchPublicData<Record<string, unknown>[]>("data-sources.json"),

  /** Bantay composite score methodology specifications */
  getMethodology: () => fetchPublicData<Record<string, unknown>>("methodology.json"),
};
