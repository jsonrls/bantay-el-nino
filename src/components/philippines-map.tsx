"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type {
  ExpressionSpecification,
  Map as MapLibreMap,
  StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import {
  getProvinceStatus,
  type MapLayerKey,
  type ProvinceMapStatus,
} from "@/lib/data";
import { riskMeta, scoreToRisk, type RiskLevel } from "@/lib/types";
import { RiskBadge } from "./risk-badge";

const NAME_PROP = "adm2_en";
const DATA_URL = "/data/provinces.geojson";

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#4d7c0f",
  moderate: "#a16207",
  high: "#c2410c",
  extreme: "#991b1b",
};

/**
 * Self-contained style: no basemap tiles, no API key, no tile-usage policy
 * risk. The sea is paper-toned and the land is the choropleth (DESIGN.md,
 * zero-subscription architecture).
 */
const STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "sea",
      type: "background",
      paint: { "background-color": "#f1eee5" },
    },
  ],
};

const LEGEND_LEVELS: RiskLevel[] = ["low", "moderate", "high", "extreme"];

function colorExpression(layer: MapLayerKey): ExpressionSpecification {
  return [
    "match",
    ["get", layer],
    "low",
    RISK_COLORS.low,
    "moderate",
    RISK_COLORS.moderate,
    "high",
    RISK_COLORS.high,
    "extreme",
    RISK_COLORS.extreme,
    "#e5e2d8",
  ] as unknown as ExpressionSpecification;
}

interface PhilippinesMapProps {
  activeLayer: MapLayerKey;
  className?: string;
  minHeight?: string;
}

export function PhilippinesMap({
  activeLayer,
  className = "",
  minHeight = "min-h-[420px]",
}: PhilippinesMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const layerRef = useRef<MapLayerKey>(activeLayer);

  useEffect(() => {
    layerRef.current = activeLayer;
  }, [activeLayer]);

  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<ProvinceMapStatus | null>(null);
  const [hovered, setHovered] = useState<string>("");

  // Initialize the map and load boundaries (re-run on Retry).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    let map: MapLibreMap | undefined;

    (async () => {
      try {
        setPhase("loading");
        const [maplibregl, data, assessments] = await Promise.all([
          import("maplibre-gl"),
          fetch(DATA_URL).then((response) => {
            if (!response.ok) {
              throw new Error(`Boundary fetch failed: ${response.status}`);
            }
            return response.json() as Promise<
              FeatureCollection<Polygon | MultiPolygon>
            >;
          }),
          fetch("/data/drought-assessment.json")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
        ]);
        if (disposed || !containerRef.current) return;

        // Ensure MapLibre Web Worker resolves correctly in Next.js / Turbopack
        const ml = (maplibregl as { default?: typeof maplibregl; setWorkerUrl?: (url: string) => void }).default || maplibregl;
        const setWorker = ml.setWorkerUrl || maplibregl.setWorkerUrl;
        if (typeof setWorker === "function") {
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          const isDev = process.env.NODE_ENV === "development";
          const workerFile = isDev ? "maplibre-gl-worker-dev.mjs" : "maplibre-gl-worker.mjs";
          setWorker(`${origin}/${workerFile}`);
        }

        const assessMap = new Map<string, ProvinceMapStatus>();
        if (Array.isArray(assessments)) {
          for (const item of assessments) {
            const tempRisk = item.indicators?.find((i: { key: string }) => i.key === "temperature")?.risk || "moderate";
            const rainRisk = item.indicators?.find((i: { key: string }) => i.key === "rainfall")?.risk || "moderate";
            const waterRisk = item.indicators?.find((i: { key: string }) => i.key === "water")?.risk || "moderate";
            const agriRisk = item.indicators?.find((i: { key: string }) => i.key === "agriculture")?.risk || "moderate";
            const droughtRisk: RiskLevel =
              item.droughtStatus === "Drought"
                ? "extreme"
                : item.droughtStatus === "Dry Spell"
                  ? "high"
                  : item.droughtStatus === "Dry Condition"
                    ? "moderate"
                    : "low";

            const provStatus: ProvinceMapStatus = {
              name: item.provinceName,
              slug: item.provinceSlug,
              impactScore: item.compositeImpactScore,
              risk: item.overallRisk || scoreToRisk(item.compositeImpactScore),
              temperature: item.temperatureAnomalyStr || "+1.0°C",
              rainfall: item.rainfallAnomalyStr || "-20%",
              layers: {
                impact: item.overallRisk || scoreToRisk(item.compositeImpactScore),
                temperature: tempRisk,
                rainfall: rainRisk,
                drought: droughtRisk,
                water: waterRisk,
                agriculture: agriRisk,
              },
            };
            if (item.provinceSlug) assessMap.set(item.provinceSlug.toLowerCase(), provStatus);
            if (item.provinceName) assessMap.set(item.provinceName.toLowerCase(), provStatus);
          }
        }

        // Attach verified assessment to every province feature (R-38).
        for (const feature of data.features) {
          const rawName = (feature.properties?.name || feature.properties?.[NAME_PROP] || "") as string;
          const rawSlug = (feature.properties?.slug || "") as string;
          const status =
            assessMap.get(rawSlug.toLowerCase()) ||
            assessMap.get(rawName.toLowerCase()) ||
            getProvinceStatus(rawName);

          feature.properties = {
            ...feature.properties,
            name: status.name,
            slug: status.slug,
            impact: status.layers.impact,
            temperature: status.layers.temperature,
            rainfall: status.layers.rainfall,
            drought: status.layers.drought,
            water: status.layers.water,
            agriculture: status.layers.agriculture,
          };
        }

        map = new maplibregl.Map({
          container: containerRef.current,
          style: STYLE,
          center: [122.0, 12.4],
          zoom: 5.1,
          minZoom: 4.5,
          maxZoom: 9,
          attributionControl: false,
        });
        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right",
        );
        mapRef.current = map;

        map.on("load", () => {
          if (disposed || !map) return;
          map.addSource("provinces", { type: "geojson", data });
          map.addLayer({
            id: "prov-fill",
            type: "fill",
            source: "provinces",
            paint: {
              "fill-color": colorExpression(layerRef.current),
              "fill-opacity": 0.78,
            },
          });
          map.addLayer({
            id: "prov-line",
            type: "line",
            source: "provinces",
            paint: {
              "line-color": "#1a1814",
              "line-width": 0.5,
              "line-opacity": 0.45,
            },
          });
          map.addLayer({
            id: "prov-hover",
            type: "line",
            source: "provinces",
            filter: ["==", ["get", "name"], ""],
            paint: { "line-color": "#1a1814", "line-width": 1.8 },
          });
          setPhase("ready");
        });

        map.on("mousemove", "prov-fill", (event) => {
          const name = event.features?.[0]?.properties?.name;
          setHovered(typeof name === "string" ? name : "");
          map?.getCanvas().style.setProperty("cursor", "pointer");
        });
        map.on("mouseleave", "prov-fill", () => {
          setHovered("");
          map?.getCanvas().style.removeProperty("cursor");
        });
        map.on("click", "prov-fill", (event) => {
          const feature = event.features?.[0];
          if (!feature) return;
          const pName = String(feature.properties?.name || "");
          const pSlug = String(feature.properties?.slug || "");
          const st =
            assessMap.get(pSlug.toLowerCase()) ||
            assessMap.get(pName.toLowerCase()) ||
            getProvinceStatus(pName);
          setSelected(st);
        });
        map.on("click", (event) => {
          if (!map) return;
          const hits = map.queryRenderedFeatures(event.point, {
            layers: ["prov-fill"],
          });
          if (hits.length === 0) setSelected(null);
        });
      } catch {
        if (!disposed) setPhase("error");
      }
    })();

    return () => {
      disposed = true;
      mapRef.current = null;
      map?.remove();
    };
  }, [attempt]);

  // Repaint the choropleth when the switcher changes layer.
  useEffect(() => {
    if (phase !== "ready") return;
    mapRef.current?.setPaintProperty(
      "prov-fill",
      "fill-color",
      colorExpression(activeLayer),
    );
  }, [activeLayer, phase]);

  // Outline the hovered province.
  useEffect(() => {
    if (phase !== "ready") return;
    mapRef.current?.setFilter("prov-hover", ["==", ["get", "name"], hovered]);
  }, [hovered, phase]);

  // Escape closes the panel (R-32).
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  return (
    <div className={`relative overflow-hidden border border-border ${className}`}>
      <div
        ref={containerRef}
        className={`${minHeight} bg-muted`}
        role="application"
        aria-label="Philippine province El Niño map"
      />

      {phase === "loading" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
            Loading province boundaries
          </p>
        </div>
      ) : null}

      {phase === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted px-6 text-center">
          <p className="font-mono text-[11px] font-semibold tracking-[0.1em] text-risk-extreme uppercase">
            Province boundaries failed to load
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The boundary file at {DATA_URL} could not be fetched. Run
            scripts/gather-all-data.mjs to regenerate it.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="border border-border bg-card px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground uppercase hover:bg-accent"
          >
            Retry
          </button>
        </div>
      ) : null}

      {phase === "ready" && selected ? (
        <aside
          className="absolute inset-x-0 bottom-0 z-20 max-h-[60%] overflow-y-auto border-t border-border bg-card p-4 sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-80 sm:border-t-0 sm:border-l"
          aria-label={`${selected.name} details`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                Province panel
              </p>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {selected.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <RiskBadge level={selected.risk} label={riskMeta[selected.risk].label} />
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {selected.impactScore} / 100
            </span>
          </div>

          <dl className="mt-4 divide-y divide-border font-mono text-xs">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Temperature</dt>
              <dd className="font-semibold">{selected.temperature}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Rainfall</dt>
              <dd className="font-semibold">{selected.rainfall}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Water</dt>
              <dd className="font-semibold">{riskMeta[selected.layers.water].label}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Agriculture</dt>
              <dd className="font-semibold">{riskMeta[selected.layers.agriculture].label}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <Link
              href={`/area?province=${selected.slug}`}
              className="block w-full border border-border bg-foreground py-2 text-center font-mono text-xs font-semibold text-background uppercase hover:opacity-90"
            >
              View Province Dashboard →
            </Link>
          </div>
        </aside>
      ) : null}

      {phase === "ready" ? (
        <ul className="absolute bottom-2 left-2 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 border border-border bg-card/95 px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {LEGEND_LEVELS.map((level) => (
            <li key={level} className="flex items-center gap-1.5">
              <span aria-hidden className={`size-2 ${riskMeta[level].bar}`} />
              {riskMeta[level].label}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="absolute right-2 bottom-1 z-10 font-mono text-[9px] tracking-[0.04em] text-muted-foreground">
        Boundaries: PSA PSGC 2023 (MIT)
      </p>
    </div>
  );
}
