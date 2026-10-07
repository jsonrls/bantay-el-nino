/**
 * Shared types and risk-level helpers for Bantay El Niño.
 *
 * Impact-score bands (blueprint §15):
 *   0–25 🟢 Low · 26–50 🟡 Moderate · 51–75 🟠 High · 76–100 🔴 Extreme
 */

export type RiskLevel = "low" | "moderate" | "high" | "extreme";

export const riskMeta: Record<
  RiskLevel,
  { label: string; dot: string; badge: string; bar: string }
> = {
  low: {
    label: "Low",
    dot: "bg-risk-low",
    badge: "border-risk-low/50 bg-card text-risk-low",
    bar: "bg-risk-low",
  },
  moderate: {
    label: "Moderate",
    dot: "bg-risk-moderate",
    badge: "border-risk-moderate/50 bg-card text-risk-moderate",
    bar: "bg-risk-moderate",
  },
  high: {
    label: "High",
    dot: "bg-risk-high",
    badge: "border-risk-high/50 bg-card text-risk-high",
    bar: "bg-risk-high",
  },
  extreme: {
    label: "Extreme",
    dot: "bg-risk-extreme",
    badge: "border-risk-extreme/50 bg-card text-risk-extreme",
    bar: "bg-risk-extreme",
  },
};

export type IndicatorKey =
  | "temperature"
  | "rainfall"
  | "water"
  | "agriculture";

export interface IndicatorReading {
  key: IndicatorKey;
  label: string;
  value: string;
  status: string;
  risk: RiskLevel;
}

export type AdvisoryCategory = "PAGASA" | "Water" | "Agriculture" | "Health" | "General";

export interface Advisory {
  id: string;
  level: RiskLevel;
  category: AdvisoryCategory;
  title: string;
  area: string;
  summary: string;
  source: string;
  publishedAt: string;
  url?: string;
  provinceSlug?: string;
  regionName?: string;
  effectiveUntil?: string;
  actions?: string[];
}

export interface ProvinceStatus {
  slug: string;
  name: string;
  region: string;
  risk: RiskLevel;
  impactScore: number;
  /** e.g. "+24%" compared with the historical average */
  vsHistorical: string;
  indicators: IndicatorReading[];
  summary: string;
}

/** Map a 0–100 composite impact score to a risk level (blueprint §15). */
export function scoreToRisk(score: number): RiskLevel {
  if (score <= 25) return "low";
  if (score <= 50) return "moderate";
  if (score <= 75) return "high";
  return "extreme";
}

/**
 * Rule-based, auditable explanations (no paid AI required,
 * per the zero-subscription architecture).
 */
export function explainConditions(
  temperatureAnomaly: number,
  rainfallAnomaly: number,
): string {
  if (rainfallAnomaly <= -20 && temperatureAnomaly >= 1) {
    return "This area is experiencing warmer and drier-than-normal conditions. These conditions can increase heat stress, water demand, and agricultural pressure.";
  }
  if (rainfallAnomaly <= -20) {
    return "Rainfall is well below the seasonal average. Water supplies and irrigation may come under pressure.";
  }
  if (temperatureAnomaly >= 1) {
    return "Temperatures are above the seasonal normal, increasing heat stress and water demand.";
  }
  return "Conditions are close to the seasonal normal. Keep monitoring official advisories.";
}

export interface DamInfo {
  id: string;
  name: string;
  slug: string;
  riverBasin: string;
  province: string;
  provinceSlug: string;
  region: string;
  islandGroup: string;
  latitude: number;
  longitude: number;
  damType: string;
  purpose: string[];
  primarySupplyingArea: string;
  operator: string;
  normalHighWaterLevelM: number;
  ruleCurveM: number;
  minOperatingLevelM: number;
  criticalWaterLevelM: number;
  currentWaterLevelBaselineM: number;
  storageCapacityMcm: number;
  percentFullBaseline: number;
  statusLevel: string;
  elNinoVulnerability: string;
}

export interface WeatherStation {
  id: string;
  wmoId: string;
  name: string;
  province: string;
  region: string;
  islandGroup: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  type: string;
  climateType: string;
}

export interface RiverBasin {
  id: string;
  name: string;
  drainageAreaKm2: number;
  islandGroup: string;
  centerLon: number;
  centerLat: number;
  keyProvinces: string[];
  description: string;
}

export interface HistoricalEnsoEvent {
  id: string;
  title: string;
  period: string;
  type: string;
  intensity: string;
  peakOni: number;
  philippinesImpactSummary: string;
  temperatureAnomalyC: number;
  peakRainfallDeficitPercent: number;
  provincesUnderDrought: number;
  estimatedAgriculturalLossPhpBillion: number;
  angatDamLowestLevelM: number;
  keyAffectedRegions: string[];
  stateOfCalamityDeclarations: number;
}

export interface NoaaOniRecord {
  season: string;
  year: number;
  sstTotal: number;
  anomaly: number;
  phase: string;
  intensity: string;
}

export interface CropInfo {
  id: string;
  name: string;
  scientificName: string;
  tagalogName: string;
  category: string;
  nationalShareGvaPercent: number;
  harvestAreaHectares: number;
  annualProductionMt: number;
  waterRequirementMm: string;
  droughtSensitivity: string;
  rainfedVulnerabilityShare: number;
  criticalGrowthStages: {
    stage: string;
    timing: string;
    impactOfWaterDeficit: string;
  }[];
  topProducingProvinces: {
    province: string;
    region: string;
    sharePercent: number;
    irrigationType: string;
  }[];
  recommendedMitigations: string[];
}

export interface ProvinceMaster {
  psgc: number;
  name: string;
  slug: string;
  regionPsgc: number;
  regionName: string;
  islandGroup: string;
  capital: string;
  population: number;
  landAreaKm2: number;
  climateType: string;
  centroid: [number, number];
  baselineAnnualRainfallMm: number;
  baselineMeanTempC: number;
  topCrops: string[];
  primaryWaterSources: string[];
}

export interface ProvinceDroughtAssessment {
  psgc: number;
  provinceName: string;
  provinceSlug: string;
  regionName: string;
  islandGroup: string;
  droughtStatus: string;
  consecutiveDeficitMonths: number;
  temperatureAnomalyC: number;
  temperatureAnomalyStr: string;
  rainfallAnomalyPercent: number;
  rainfallAnomalyStr: string;
  vsHistorical: string;
  indicators: IndicatorReading[];
  compositeImpactScore: number;
  overallRisk: RiskLevel;
  summary: string;
  recommendedActions: {
    households: string[];
    farmers: string[];
  };
  updatedAt: string;
  source: string;
}

export interface SearchIndexItem {
  name: string;
  slug: string;
  geoLevel: string;
  psgc: number;
  provinceName: string;
  provinceSlug: string;
  regionName: string;
  islandGroup: string;
  coordinates: [number, number];
}

export interface AdminHierarchy {
  islandGroups: string[];
  regions: {
    psgc: number;
    name: string;
    slug: string;
    islandGroup: string;
    centroid: [number, number];
    provinces: {
      psgc: number;
      name: string;
      slug: string;
      regionPsgc: number;
      regionName: string;
      islandGroup: string;
      centroid: [number, number];
      municipalities: {
        psgc: number;
        name: string;
        slug: string;
        geoLevel: string;
        centroid: [number, number];
      }[];
    }[];
  }[];
  searchIndex: SearchIndexItem[];
}

