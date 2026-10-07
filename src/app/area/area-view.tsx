"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { nationalStatus, regions } from "@/lib/data";
import {
  findNearestLgu,
  getSavedUserLocation,
  matchProvinceAssessment,
  normalizeProvinceName,
  requestBrowserCoordinates,
  saveUserLocation,
} from "@/lib/geo";
import { riskMeta, type AdminHierarchy, type ProvinceDroughtAssessment } from "@/lib/types";
import { AreaSearch } from "@/components/area-search";
import { AlertSubscriptionCard } from "@/components/alert-subscription-card";
import { CommunityReportsCard } from "@/components/community-reports-card";
import { IndicatorStrip } from "@/components/indicator-strip";
import { LiveWeatherCard } from "@/components/live-weather-card";
import { RiskBadge } from "@/components/risk-badge";
import { SourceNote } from "@/components/source-note";

const ALL_MUNICIPALITIES = "all-municipalities";

// Invert regions map: province -> region
const PROVINCE_TO_REGION = new Map<string, string>();
for (const [regionName, provs] of Object.entries(regions)) {
  for (const prov of provs) {
    PROVINCE_TO_REGION.set(prov.toLowerCase(), regionName);
  }
}

function updateBrowserUrl(provName: string, assessmentList: ProvinceDroughtAssessment[]) {
  if (typeof window === "undefined") return;
  const match = matchProvinceAssessment(provName, assessmentList);
  const slug = match ? match.provinceSlug : provName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const newUrl = `${window.location.pathname}?province=${slug}`;
  window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
}

export function AreaView() {
  const searchParams = useSearchParams();
  const requestedSlug = searchParams.get("province");

  const [assessments, setAssessments] = useState<ProvinceDroughtAssessment[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("National Capital Region (NCR)");
  const [selectedProvince, setSelectedProvince] = useState<string>("Metro Manila");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>(ALL_MUNICIPALITIES);

  // Fetch all 88 province assessments from public data catalog and handle user location
  useEffect(() => {
    fetch("/data/drought-assessment.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load assessments");
        return res.json() as Promise<ProvinceDroughtAssessment[]>;
      })
      .then(async (data) => {
        setAssessments(data);

        // Case 1: Specific province requested via URL query string (?province=iloilo)
        if (requestedSlug) {
          const match = matchProvinceAssessment(requestedSlug, data);
          if (match) {
            const cleanProv = normalizeProvinceName(match.provinceName);
            setSelectedProvince(cleanProv);
            const reg = PROVINCE_TO_REGION.get(cleanProv.toLowerCase()) || match.regionName;
            if (reg) setSelectedRegion(reg);
            setSelectedMunicipality(ALL_MUNICIPALITIES);
            return;
          }
        }

        // Case 2: Check localStorage for previously saved/detected location
        const saved = getSavedUserLocation();
        if (saved && saved.province) {
          setSelectedProvince(saved.province);
          if (saved.region) setSelectedRegion(saved.region);
          if (saved.municipality) setSelectedMunicipality(saved.municipality);
          return;
        }

        // Case 3: Initial visit without query param — auto-detect via browser geolocation
        if (typeof navigator !== "undefined" && navigator.geolocation) {
          try {
            const coords = await requestBrowserCoordinates();
            const hierRes = await fetch("/data/admin-hierarchy.json");
            const hier: AdminHierarchy = await hierRes.json();
            const nearest = findNearestLgu(coords.lat, coords.lon, hier.searchIndex);
            if (nearest) {
              const matchedProv = normalizeProvinceName(nearest.provinceName);
              setSelectedProvince(matchedProv);
              setSelectedRegion(nearest.regionName);
              setSelectedMunicipality(nearest.lguName);
              saveUserLocation({
                province: matchedProv,
                region: nearest.regionName,
                municipality: nearest.lguName,
                isGps: true,
              });
              updateBrowserUrl(matchedProv, data);
            }
          } catch {
            // Geolocation declined or timed out; gracefully defaults to National Capital Region (NCR)
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load drought assessments, falling back to baseline:", err);
      });
  }, [requestedSlug]);

  // Find active assessment using intelligent matching
  const activeAssessment =
    matchProvinceAssessment(selectedProvince, assessments) ||
    assessments.find((a) => a.provinceName.toLowerCase() === selectedProvince.toLowerCase());

  function handleRegionChange(nextRegion: string) {
    setSelectedRegion(nextRegion);
    const nextProv = regions[nextRegion]?.[0] ?? "";
    setSelectedProvince(nextProv);
    setSelectedMunicipality(ALL_MUNICIPALITIES);
    updateBrowserUrl(nextProv, assessments);
  }

  function handleProvinceChange(nextProv: string) {
    setSelectedProvince(nextProv);
    setSelectedMunicipality(ALL_MUNICIPALITIES);
    const reg = PROVINCE_TO_REGION.get(nextProv.toLowerCase());
    if (reg) setSelectedRegion(reg);
    updateBrowserUrl(nextProv, assessments);
  }

  function handleMunicipalityChange(nextMun: string) {
    setSelectedMunicipality(nextMun);
  }

  // Display data: use verified assessment or fallback to national status benchmark
  const displayProvinceName = activeAssessment
    ? normalizeProvinceName(activeAssessment.provinceName)
    : selectedProvince;
  const displaySlug = activeAssessment
    ? activeAssessment.provinceSlug
    : selectedProvince.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const displayRegion = activeAssessment ? activeAssessment.regionName : selectedRegion;
  const displayRisk = activeAssessment ? activeAssessment.overallRisk : nationalStatus.risk;
  const displayScore = activeAssessment ? activeAssessment.compositeImpactScore : nationalStatus.impactScore;
  const displayVsHistorical = activeAssessment ? activeAssessment.vsHistorical : "+14%";
  const displayIndicators = activeAssessment ? activeAssessment.indicators : nationalStatus.indicators;
  const displaySummary = activeAssessment
    ? activeAssessment.summary
    : "Comprehensive multi-factor drought and climate risk assessment for the selected province based on official DOST-PAGASA and national monitoring benchmarks.";
  const displayActions = activeAssessment?.recommendedActions ?? {
    households: [
      "Conserve water in daily routines and inspect home plumbing",
      "Limit prolonged direct heat exposure between 10 AM and 3 PM",
      "Check on elderly and vulnerable family members regularly",
    ],
    farmers: [
      "Monitor soil moisture levels and practice mulching",
      "Manage irrigation carefully using alternate wetting and drying",
      "Follow local agricultural advisories from the Municipal Agriculture Office",
    ],
  };

  const riskLabel = `${riskMeta[displayRisk].label} El Niño Impact`;

  return (
    <div className="space-y-8">
      <AreaSearch
        region={selectedRegion}
        province={selectedProvince}
        municipality={selectedMunicipality}
        onRegionChange={handleRegionChange}
        onProvinceChange={handleProvinceChange}
        onMunicipalityChange={handleMunicipalityChange}
      />

      {/* Selected Municipality Callout if specific LGU picked */}
      {selectedMunicipality !== ALL_MUNICIPALITIES ? (
        <aside
          className="border border-border bg-accent/40 p-4"
          aria-label="Local Municipality Advisory"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-[0.1em] text-foreground uppercase">
              Local LGU Focus:
            </span>
            <span className="font-heading text-base font-semibold text-foreground">
              {selectedMunicipality}, {displayProvinceName}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Displaying province-wide meteorological baseline for {displayProvinceName}. Local LGU water
            utility rationing schedules and municipal agriculture advisories apply within {selectedMunicipality}.
          </p>
        </aside>
      ) : null}

      {/* Province dashboard, blueprint §4 */}
      <section
        id="province-dashboard"
        className="border border-border bg-card p-6 sm:p-8"
        aria-labelledby="province-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
            {displayRegion}
          </p>
          {activeAssessment ? (
            <span className="border border-border bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.06em] text-foreground uppercase">
              {activeAssessment.droughtStatus} · {activeAssessment.consecutiveDeficitMonths}mo deficit
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1
            id="province-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            {displayProvinceName}
          </h1>
          <RiskBadge level={displayRisk} label={riskLabel} className="px-2.5 py-1.5" />
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-4">
          <div>
            <p className="font-mono text-7xl font-semibold leading-none tabular-nums text-foreground">
              {displayScore}
              <span className="text-2xl text-muted-foreground"> /100</span>
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
              Bantay Impact Score
            </p>
          </div>
          <div>
            <p className="font-mono text-3xl font-semibold tabular-nums text-risk-high">
              ↑ {displayVsHistorical}
            </p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
              Compared with historical average
            </p>
          </div>
        </div>

        <IndicatorStrip readings={displayIndicators} className="mt-6" />

        <SourceNote
          source={activeAssessment?.source ?? nationalStatus.source}
          updated={activeAssessment?.updatedAt ?? nationalStatus.updatedAt}
          methodology="Bantay composite: temperature 25%, rainfall 25%, drought 20%, water 15%, agriculture 10%, other 5%"
        />
      </section>

      {/* Layer 2: Live Hourly Weather & Heat Index Observation */}
      <LiveWeatherCard provinceSlug={activeAssessment?.provinceSlug || displaySlug} />

      {/* Plain-language translation of the numbers */}
      <section
        className="border border-border bg-card p-6 sm:p-8"
        aria-labelledby="meaning-heading"
      >
        <h2 id="meaning-heading" className="font-heading text-xl font-semibold text-foreground">
          What does this mean?
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-foreground">
          {displaySummary}
        </p>
        <p className="mt-3 font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
          Rule-based assessment model (PAGASA criteria & NOAA ONI baseline). No unverified AI inferences.
        </p>
      </section>

      {/* Recommended actions (blueprint §4) */}
      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="font-heading text-xl font-semibold text-foreground">
          What should you do?
        </h2>
        <div className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-2">
          <div className="bg-card p-5">
            <h3 className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              Households
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              {displayActions.households.map((action) => (
                <li key={action} className="flex gap-2">
                  <span aria-hidden className="text-muted-foreground">
                    ·
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-5">
            <h3 className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              Farmers
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              {displayActions.farmers.map((action) => (
                <li key={action} className="flex gap-2">
                  <span aria-hidden className="text-muted-foreground">
                    ·
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Layer 3 / Backend: Early Warning Alerts & Ground Observations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertSubscriptionCard
          provinceSlug={activeAssessment?.provinceSlug || displaySlug}
          provinceName={displayProvinceName}
        />
        <CommunityReportsCard
          provinceSlug={activeAssessment?.provinceSlug || displaySlug}
          provinceName={displayProvinceName}
        />
      </div>
    </div>
  );
}
