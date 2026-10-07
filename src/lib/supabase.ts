/**
 * src/lib/supabase.ts
 *
 * Supabase client initialization and database table type definitions.
 * Resilient to missing or placeholder environment variables so the app
 * runs gracefully in demo/static fallback mode if Supabase is unconfigured.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface ProvinceRecord {
  id: string;
  name: string;
  region: string;
  island_group: string;
  latitude: number | null;
  longitude: number | null;
  population?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface DataSourceRecord {
  id: string;
  name: string;
  provider: string;
  source_type?: string;
  base_url?: string;
  license?: string;
  attribution?: string;
  update_frequency?: string;
  active: boolean;
  last_success_at?: string | null;
  last_error_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClimateDailyRecord {
  id?: number;
  province_id: string;
  date: string;
  temperature_avg?: number | null;
  temperature_min?: number | null;
  temperature_max?: number | null;
  rainfall_mm?: number | null;
  humidity_avg?: number | null;
  wind_speed_avg?: number | null;
  water_stress_score?: number | null;
  heat_risk_score?: number | null;
  agriculture_risk_score?: number | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClimateAnomalyRecord {
  id?: number;
  province_id: string;
  date: string;
  variable: string;
  observed_value: number;
  baseline_value: number;
  anomaly_value: number;
  anomaly_percent?: number | null;
  baseline_source_id?: string | null;
  created_at?: string;
}

export interface AdvisoryRecord {
  id: string;
  title: string;
  summary: string;
  body?: string;
  advisory_type: "EL_NINO" | "LA_NINA" | "HEAT" | "RAINFALL" | "WATER" | "AGRICULTURE" | "GENERAL";
  severity: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  province_id?: string | null;
  source_id?: string | null;
  source_url?: string;
  published_at: string;
  expires_at?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HistoricalEventRecord {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date?: string | null;
  province_id?: string | null;
  source_id?: string | null;
  source_url?: string;
  created_at?: string;
}

export interface RiskScoreRecord {
  id?: number;
  province_id: string;
  date: string;
  composite_score: number;
  risk_level: "low" | "moderate" | "high" | "extreme";
  temperature_score?: number | null;
  rainfall_score?: number | null;
  drought_score?: number | null;
  water_score?: number | null;
  agriculture_score?: number | null;
  created_at?: string;
}

export interface CommunityReportRecord {
  id?: string;
  province_slug: string;
  municipality: string;
  category: "crop_damage" | "water_shortage" | "extreme_heat" | "fire_risk" | "other";
  description: string;
  reporter_name?: string | null;
  contact_info?: string | null;
  severity: "moderate" | "high" | "extreme";
  verified: boolean;
  created_at?: string;
}

export interface AlertSubscriptionRecord {
  id?: string;
  channel: "sms" | "email";
  contact: string;
  province_slug: string;
  municipality?: string | null;
  notify_heat_danger: boolean;
  notify_drought_alerts: boolean;
  active: boolean;
  created_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Checks whether Supabase is configured with real non-placeholder credentials.
 */
export function isSupabaseConfigured(): boolean {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project-id") &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.length > 20 &&
    !supabaseAnonKey.includes("your-supabase-anon-key")
  );
}

let clientInstance: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client or null if not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  }
  return clientInstance;
}
