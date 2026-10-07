"use client";

import { useEffect, useState } from "react";
import { RiskBadge } from "./risk-badge";
import type { RiskLevel } from "@/lib/types";

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
  className?: string;
}

export function LiveWeatherCard({
  provinceSlug = "cebu",
  className = "",
}: LiveWeatherCardProps) {
  const [data, setData] = useState<LiveWeatherData | null>(null);
  const [loadedSlug, setLoadedSlug] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/weather?province=${encodeURIComponent(provinceSlug)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && (json.current || json.fallback)) {
          setData(json.current ? json : json.fallback);
          setLoadedSlug(provinceSlug);
        }
      })
      .catch((err) => {
        console.warn("Failed to load live weather:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [provinceSlug]);

  const loading = !data || loadedSlug !== provinceSlug;

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
          Fetching live meteorological feed...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`border border-border bg-card p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-2 bg-emerald-600" />
            <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-emerald-700 uppercase">
              Live Observation · Hourly Feed
            </p>
          </div>
          <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
            {data.location.province} Weather & Heat Index
          </h3>
        </div>

        <RiskBadge
          level={data.heatIndex.risk}
          label={`${data.heatIndex.classification} Heat`}
        />
      </div>

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
