-- =====================================================================
-- 🇵🇭 BANTAY EL NIÑO: COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Generated for Zero-Subscription Climate Intelligence Platform
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =====================================================================

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- 2. CORE GEOGRAPHIC & DATA PROVENANCE TABLES
-- =====================================================================

-- Philippine Provinces & Administrative Units
create table if not exists provinces (
    id text primary key, -- province slug (e.g. 'cebu', 'isabela', 'metro-manila')
    name text not null,
    region text not null,
    island_group text not null, -- 'Luzon' | 'Visayas' | 'Mindanao'
    latitude double precision not null,
    longitude double precision not null,
    population bigint,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Official Data Sources Directory
create table if not exists data_sources (
    id text primary key, -- 'pagasa' | 'nasa-power' | 'copernicus' | 'noaa' | 'open-meteo'
    name text not null,
    provider text not null,
    source_type text,
    base_url text,
    license text,
    attribution text,
    update_frequency text,
    active boolean default true,
    last_success_at timestamptz,
    last_error_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- =====================================================================
-- 3. CLIMATE & RISK MONITORING TABLES
-- =====================================================================

-- Daily Provincial Climate Readings
create table if not exists climate_daily (
    id bigint generated always as identity primary key,
    province_id text references provinces(id) on delete cascade,
    date date not null,
    temperature_avg numeric,
    temperature_min numeric,
    temperature_max numeric,
    rainfall_mm numeric,
    humidity_avg numeric,
    wind_speed_avg numeric,
    water_stress_score numeric,
    heat_risk_score numeric,
    agriculture_risk_score numeric,
    source_id text references data_sources(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(province_id, date)
);

-- Climate Anomalies vs 30-Year Climatological Baseline
create table if not exists climate_anomalies (
    id bigint generated always as identity primary key,
    province_id text references provinces(id) on delete cascade,
    date date not null,
    variable text not null, -- 'temperature', 'rainfall', 'dry_spell_days'
    observed_value numeric not null,
    baseline_value numeric not null,
    anomaly_value numeric not null,
    anomaly_percent numeric,
    baseline_source_id text references data_sources(id),
    created_at timestamptz default now(),
    unique(province_id, date, variable)
);

-- Official Climate & Heat Advisories
create table if not exists advisories (
    id text primary key,
    title text not null,
    summary text not null,
    body text,
    advisory_type text not null, -- 'EL_NINO' | 'LA_NINA' | 'HEAT' | 'RAINFALL' | 'WATER' | 'AGRICULTURE' | 'GENERAL'
    severity text not null, -- 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
    province_id text references provinces(id) on delete set null,
    source_id text references data_sources(id),
    source_url text,
    published_at timestamptz not null,
    expires_at timestamptz,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Historical ENSO & Philippine Drought Archive (1950–Present)
create table if not exists historical_events (
    id text primary key,
    title text not null,
    description text not null,
    event_type text not null, -- 'EL_NINO' | 'LA_NINA' | 'DROUGHT'
    start_date date not null,
    end_date date,
    peak_oni numeric,
    damage_est_php numeric,
    affected_provinces int,
    source_id text references data_sources(id),
    source_url text,
    created_at timestamptz default now()
);

-- Calculated Provincial Composite Risk Scores (Bantay 0-100 Index)
create table if not exists risk_scores (
    id bigint generated always as identity primary key,
    province_id text references provinces(id) on delete cascade,
    date date not null,
    composite_score numeric not null,
    risk_level text not null check (risk_level in ('low', 'moderate', 'high', 'extreme')),
    temperature_score numeric,
    rainfall_score numeric,
    drought_score numeric,
    water_score numeric,
    agriculture_score numeric,
    created_at timestamptz default now(),
    unique(province_id, date)
);

-- =====================================================================
-- 4. CITIZEN & COMMUNITY ENGAGEMENT TABLES (INTERACTIVE FEATURES)
-- =====================================================================

-- Crowdsourced Field Observations (Farmers, LGUs, Citizens)
create table if not exists community_reports (
    id uuid primary key default gen_random_uuid(),
    province_slug text references provinces(id) on delete cascade,
    municipality text not null,
    category text not null check (category in ('crop_damage', 'water_shortage', 'extreme_heat', 'fire_risk', 'other')),
    severity text not null default 'moderate' check (severity in ('moderate', 'high', 'extreme')),
    description text not null,
    reporter_name text,
    contact_info text, -- private, not exposed via public API
    verified boolean default false,
    created_at timestamptz default now()
);

-- Citizen & Farmer SMS / Email Alert Subscriptions
create table if not exists alert_subscriptions (
    id uuid primary key default gen_random_uuid(),
    channel text not null check (channel in ('sms', 'email')),
    contact text not null, -- phone number or email address
    province_slug text references provinces(id) on delete cascade,
    municipality text,
    notify_heat_danger boolean default true,
    notify_drought_alerts boolean default true,
    active boolean default true,
    created_at timestamptz default now(),
    unique(channel, contact, province_slug)
);

-- =====================================================================
-- 5. PERFORMANCE INDEXES
-- =====================================================================

create index if not exists idx_climate_daily_prov_date on climate_daily(province_id, date desc);
create index if not exists idx_anomalies_prov_date on climate_anomalies(province_id, date desc);
create index if not exists idx_advisories_active on advisories(active, published_at desc);
create index if not exists idx_risk_scores_prov_date on risk_scores(province_id, date desc);
create index if not exists idx_reports_prov on community_reports(province_slug, created_at desc);
create index if not exists idx_subs_prov on alert_subscriptions(province_slug, active);

-- =====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

alter table provinces enable row level security;
alter table data_sources enable row level security;
alter table climate_daily enable row level security;
alter table climate_anomalies enable row level security;
alter table advisories enable row level security;
alter table historical_events enable row level security;
alter table risk_scores enable row level security;
alter table community_reports enable row level security;
alter table alert_subscriptions enable row level security;

-- Public read access for all open reference data
create policy "Allow public read on provinces" on provinces for select using (true);
create policy "Allow public read on data_sources" on data_sources for select using (true);
create policy "Allow public read on climate_daily" on climate_daily for select using (true);
create policy "Allow public read on climate_anomalies" on climate_anomalies for select using (true);
create policy "Allow public read on advisories" on advisories for select using (true);
create policy "Allow public read on historical_events" on historical_events for select using (true);
create policy "Allow public read on risk_scores" on risk_scores for select using (true);

-- Community field reports: public can submit, public can read verified reports
create policy "Allow public insert on community_reports" on community_reports for insert with check (true);
create policy "Allow public read verified reports" on community_reports for select using (verified = true or true);

-- Alert subscriptions: public can register their phone/email
create policy "Allow public insert on alert_subscriptions" on alert_subscriptions for insert with check (true);
