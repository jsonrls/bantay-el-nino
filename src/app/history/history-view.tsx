"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SourceNote } from "@/components/source-note";
import { nationalStatus } from "@/lib/data";
import type { HistoricalEnsoEvent } from "@/lib/types";

interface HistoryViewProps {
  events: HistoricalEnsoEvent[];
}

export function HistoryView({ events }: HistoryViewProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "enso-2023-2024");
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div className="space-y-10">
      {/* Historical Episode Selector */}
      <section className="border border-border bg-card p-6" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="font-heading text-xl font-semibold text-foreground">
          Historical Event Timeline
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a major Philippine El Niño episode to review its meteorological peak, dam drops, and socio-economic impact.
        </p>

        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={selectedEventId}
          onValueChange={(val) => {
            if (val) setSelectedEventId(val);
          }}
          className="mt-4 flex flex-wrap"
          aria-label="Historical episodes"
        >
          {events.map((e) => (
            <ToggleGroupItem
              key={e.id}
              value={e.id}
              className="h-11 px-3.5 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase data-[state=on]:bg-foreground data-[state=on]:text-background sm:h-9"
            >
              {e.period}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>

      {/* Selected Historical Episode Card */}
      {selectedEvent ? (
        <section className="border border-border bg-card p-6 sm:p-8" aria-labelledby="event-details-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                {selectedEvent.type} · Intensity: {selectedEvent.intensity}
              </p>
              <h2 id="event-details-heading" className="mt-1 font-heading text-3xl font-semibold text-foreground">
                {selectedEvent.title} ({selectedEvent.period})
              </h2>
            </div>
            <span className="border border-border bg-muted px-3 py-1 font-mono text-xs font-semibold text-foreground">
              Peak ONI: +{selectedEvent.peakOni.toFixed(1)}°C
            </span>
          </div>

          <div className="mt-6 grid gap-6 border-t border-border pt-6 sm:grid-cols-4">
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Peak Rainfall Deficit</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-risk-extreme">
                −{selectedEvent.peakRainfallDeficitPercent}%
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">National average</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Provinces in Drought</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-foreground">
                {selectedEvent.provincesUnderDrought} / 82
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">PAGASA 3-month criteria</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Angat Lowest Level</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-risk-high">
                {selectedEvent.angatDamLowestLevelM > 0 ? `${selectedEvent.angatDamLowestLevelM} m` : "Normal"}
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Critical min: 180 m</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Agricultural Loss</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-foreground">
                ₱{selectedEvent.estimatedAgriculturalLossPhpBillion}B
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Nominal damages</p>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Philippine Impact Summary
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {selectedEvent.philippinesImpactSummary}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="font-mono text-muted-foreground">Severely Affected Regions:</span>
            {selectedEvent.keyAffectedRegions.map((r) => (
              <span key={r} className="border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-foreground">
                {r}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Comparison Table: Historical vs Current */}
      <section aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="font-heading text-2xl font-semibold text-foreground">
          Historical Benchmark Comparison
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparing major benchmark episodes with the current October 2026 monitoring window.
        </p>

        <div className="mt-4 overflow-x-auto border border-border bg-card">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-border bg-muted text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Episode</th>
                <th className="px-4 py-3">Peak ONI</th>
                <th className="px-4 py-3">Rainfall Deficit</th>
                <th className="px-4 py-3">Provinces Affected</th>
                <th className="px-4 py-3">Angat Min Level</th>
                <th className="px-4 py-3">Calamity Declarations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="bg-signal/5 font-semibold text-signal">
                <td className="px-4 py-3">Current Monitoring (2026)</td>
                <td className="px-4 py-3 tabular-nums">+1.4°C (Moderate)</td>
                <td className="px-4 py-3 tabular-nums">{nationalStatus.rainfallAnomaly}</td>
                <td className="px-4 py-3 tabular-nums">42 provinces (Watch)</td>
                <td className="px-4 py-3 tabular-nums">204.6 m</td>
                <td className="px-4 py-3 tabular-nums">Localized LGU level</td>
              </tr>
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-muted/40 text-foreground">
                  <td className="px-4 py-3 font-semibold">{e.period} ({e.intensity})</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">+{e.peakOni.toFixed(1)}°C</td>
                  <td className="px-4 py-3 tabular-nums text-risk-extreme">−{e.peakRainfallDeficitPercent}%</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{e.provincesUnderDrought} provinces</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {e.angatDamLowestLevelM > 0 ? `${e.angatDamLowestLevelM} m` : "N/A"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{e.stateOfCalamityDeclarations} LGUs/Provinces</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SourceNote
        source="NOAA Climate Prediction Center (CPC) ONI Historical Time Series & PAGASA ENSO Catalogues"
        updated={nationalStatus.updatedAt}
        methodology="Historical ENSO records compiled from official DOST-PAGASA post-event reports and NOAA Climate Prediction Center archive."
      />
    </div>
  );
}
