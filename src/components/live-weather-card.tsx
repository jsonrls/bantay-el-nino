"use client";

import { useEffect, useState } from "react";
import { LocateFixed, MapPin, RefreshCw } from "lucide-react";
import { RiskBadge } from "./risk-badge";
import {
  findNearestLgu,
  getSavedUserLocation,
  normalizeProvinceName,
  requestBrowserCoordinates,
  saveUserLocation,
} from "@/lib/geo";
import { PROVINCES_MAP_STATUS } from "@/lib/data";
import type { AdminHierarchy, RiskLevel } from "@/lib/types";

interface LiveWeatherData {
  location: {
    province: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperatureC: number;
    feelsLikeC: number;
    relativeHumidityPercent: number;
    precipitationMm: number;
    windSpeedKmh: number;
    condition: string;
    observedAt: string;
  };
  heatIndex: {
    indexC: number;
    classification: string;
    risk: RiskLevel;
    effects: string;
    guidance: string;
  };
  source: string;
}

interface LiveWeatherCardProps {
  provinceSlug?: string;
  autoDetect?: boolean;
  className?: string;
}

// Sorted list of all 88 provinces for quick switcher
const ALL_PROVINCES = Object.values(PROVINCES_MAP_STATUS)
  .map((p) => ({ slug: p.slug, name: p.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function LiveWeatherCard({
  provinceSlug: initialSlug,
  className = "",
}: LiveWeatherCardProps) {
  // 1. Initialize user-selected slug from localStorage if no initial prop is supplied
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    if (initialSlug) return null;
    const saved = getSavedUserLocation();
    if (saved && saved.province) {
      const cleanName = normalizeProvinceName(saved.province);
      const matched = ALL_PROVINCES.find(
        (p) =>
          p.name.toLowerCase() === cleanName.toLowerCase() ||
          p.slug === cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      );
      if (matched) return matched.slug;
    }
    return null;
  });

  const [locationSource, setLocationSource] = useState<"gps" | "saved" | "default">(() => {
    if (initialSlug) return "default";
    const saved = getSavedUserLocation();
    if (saved?.province) return saved.isGps ? "gps" : "saved";
    return "default";
  });

  const [data, setData] = useState<LiveWeatherData | null>(null);
  const [loadedSlug, setLoadedSlug] = useState<string>("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Derived effective slug: explicit user selection > initial prop > default Metro Manila
  const activeSlug = selectedSlug || initialSlug || "metro-manila";

  // 2. Fetch live weather whenever activeSlug changes
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/weather?province=${encodeURIComponent(activeSlug)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && (json.current || json.fallback)) {
          setData(json.current ? json : json.fallback);
          setLoadedSlug(activeSlug);
        }
      })
      .catch((err) => {
        console.warn("Failed to load live weather:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSlug]);

  // 3. User clicks "Detect My Location" (GPS)
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationError(null);

    try {
      const coords = await requestBrowserCoordinates();
      const hierRes = await fetch("/data/admin-hierarchy.json");
      if (!hierRes.ok) throw new Error("Could not load administrative hierarchy");
      const hier: AdminHierarchy = await hierRes.json();
      const nearest = findNearestLgu(coords.lat, coords.lon, hier.searchIndex);

      if (nearest) {
        const cleanName = normalizeProvinceName(nearest.provinceName);
        const matched = ALL_PROVINCES.find(
          (p) =>
            p.name.toLowerCase() === cleanName.toLowerCase() ||
            p.slug === nearest.provinceSlug
        );

        const newSlug = matched ? matched.slug : nearest.provinceSlug;
        setSelectedSlug(newSlug);
        setLocationSource("gps");
        saveUserLocation({
          province: cleanName,
          region: nearest.regionName,
          municipality: nearest.lguName,
          isGps: true,
        });
      }
    } catch (err) {
      console.warn("GPS detection warning:", err);
      setLocationError("Could not detect GPS. You can select your province from the list.");
    } finally {
      setDetectingLocation(false);
    }
  };

  // 4. User selects province from dropdown
  const handleSelectProvince = (slug: string) => {
    const matched = ALL_PROVINCES.find((p) => p.slug === slug);
    if (!matched) return;

    setSelectedSlug(slug);
    setLocationSource("saved");
    setLocationError(null);
    saveUserLocation({
      province: matched.name,
      region: "Philippines",
      isGps: false,
    });
  };

  const loading = !data || loadedSlug !== activeSlug;

  if (loading && !data) {
    return (
      <div className={`border border-border bg-card p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
            Hourly Observation
          </p>
          <span className="size-2 animate-pulse bg-muted-foreground" />
        </div>
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Fetching live meteorological feed for {activeSlug}...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`border border-border bg-card p-4 sm:p-6 ${className}`}>
      {/* Header with location controls */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span aria-hidden className="size-2 bg-signal" />
            <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-foreground uppercase">
              Live Observation · Hourly Feed
            </p>
            {locationSource === "gps" && (
              <span className="flex items-center gap-1 border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold text-foreground uppercase">
                <MapPin className="size-2.5" />
                GPS Detected
              </span>
            )}
            {locationSource === "saved" && (
              <span className="flex items-center gap-1 border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold text-foreground uppercase">
                <MapPin className="size-2.5" />
                Your Saved Area
              </span>
            )}
          </div>
          <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
            {data.location.province} Weather & Heat Index
          </h3>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {/* Quick Province Dropdown Selector */}
          <div className="relative w-full sm:w-auto">
            <label htmlFor="weather-province-select" className="sr-only">
              Switch Province
            </label>
            <select
              id="weather-province-select"
              value={activeSlug}
              onChange={(e) => handleSelectProvince(e.target.value)}
              className="h-10 w-full border border-border bg-background px-2.5 font-mono text-xs text-foreground focus:border-foreground focus:outline-none sm:h-8 sm:w-auto"
            >
              {ALL_PROVINCES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* GPS Detect Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            title="Detect weather using your current GPS coordinates"
            className="flex min-h-[40px] w-full items-center justify-center gap-1.5 border border-foreground bg-background px-3 font-mono text-xs font-semibold tracking-[0.06em] text-foreground uppercase hover:bg-muted disabled:opacity-50 sm:min-h-[32px] sm:h-8 sm:w-auto"
          >
            {detectingLocation ? (
              <>
                <RefreshCw className="size-3 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <LocateFixed className="size-3" />
                <span>Use My Location</span>
              </>
            )}
          </button>

          <div className="pt-1 sm:pt-0">
            <RiskBadge
              level={data.heatIndex.risk}
              label={`${data.heatIndex.classification} Heat`}
            />
          </div>
        </div>
      </div>

      {locationError && (
        <p className="mt-2 font-mono text-xs text-risk-moderate">
          {locationError}
        </p>
      )}

      {/* Grid of Meteorological Measurements */}
      <div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4 sm:grid-cols-4">
        <div>
          <dt className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            Air Temperature
          </dt>
          <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
            {data.current.temperatureC}°C
          </dd>
        </div>

        <div>
          <dt className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            Heat Index (Feels Like)
          </dt>
          <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
            {data.current.feelsLikeC}°C
          </dd>
        </div>

        <div>
          <dt className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            Relative Humidity
          </dt>
          <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
            {data.current.relativeHumidityPercent}%
          </dd>
        </div>

        <div>
          <dt className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            Current Rain
          </dt>
          <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
            {data.current.precipitationMm} mm
          </dd>
        </div>
      </div>

      {/* Footer Guidance */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">PAGASA Health Guidance:</span>{" "}
          {data.heatIndex.guidance}
        </p>

        <p className="font-mono text-[9px] tracking-[0.06em] text-muted-foreground uppercase">
          Condition: {data.current.condition} · Caches hourly
        </p>
      </div>
    </div>
  );
}
