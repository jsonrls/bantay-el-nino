"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RiskBadge } from "@/components/risk-badge";
import { SourceNote } from "@/components/source-note";
import { nationalStatus } from "@/lib/data";
import type { CropInfo, RiskLevel } from "@/lib/types";

export interface CropVulnerabilityEntry {
  province: string;
  region: string;
  primaryCrops: string[];
  rainfedRatio: number;
  vulnerabilityLevel: string;
  irrigationCoverage: string;
  mainRisk: string;
}

interface AgricultureViewProps {
  crops: CropInfo[];
  vulnerabilities: CropVulnerabilityEntry[];
}

const CROP_RISKS: Record<string, { level: RiskLevel; label: string }> = {
  "crop-rice": { level: "extreme", label: "High to Extreme Risk" },
  "crop-corn": { level: "high", label: "High Risk" },
  "crop-coconut": { level: "moderate", label: "Moderate Risk" },
  "crop-sugarcane": { level: "high", label: "High Risk" },
  "crop-banana": { level: "moderate", label: "Moderate Risk" },
};

export function AgricultureView({ crops, vulnerabilities }: AgricultureViewProps) {
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || "crop-rice");
  const selectedCrop = crops.find((c) => c.id === selectedCropId) || crops[0];
  const risk = CROP_RISKS[selectedCropId] || { level: "high", label: "High Risk" };

  return (
    <div className="space-y-10">
      {/* Crop Selector Toggle */}
      <section className="border border-border bg-card p-6" aria-labelledby="crop-select-heading">
        <h2 id="crop-select-heading" className="font-heading text-xl font-semibold text-foreground">
          Select Crop Profile
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze localized crop vulnerability, critical phenological growth stages, and recommended drought mitigations.
        </p>

        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={selectedCropId}
          onValueChange={(val) => {
            if (val) setSelectedCropId(val);
          }}
          className="mt-4 flex flex-wrap"
          aria-label="Crop selector"
        >
          {crops.map((c) => (
            <ToggleGroupItem
              key={c.id}
              value={c.id}
              className="h-11 px-4 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase data-[state=on]:bg-foreground data-[state=on]:text-background sm:h-9"
            >
              {c.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>

      {/* Selected Crop Profile Card */}
      {selectedCrop ? (
        <section className="border border-border bg-card p-6 sm:p-8" aria-labelledby="selected-crop-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                {selectedCrop.category} · {selectedCrop.scientificName}
              </p>
              <h2 id="selected-crop-heading" className="mt-1 font-heading text-3xl font-semibold text-foreground">
                {selectedCrop.name} ({selectedCrop.tagalogName})
              </h2>
            </div>
            <RiskBadge level={risk.level} label={risk.label} className="px-3 py-1 font-mono text-xs" />
          </div>

          <div className="mt-6 grid gap-6 border-t border-border pt-6 sm:grid-cols-4">
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">National Agr. Share</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-foreground">
                {selectedCrop.nationalShareGvaPercent}%
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Gross Value Added</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Harvest Area</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-foreground">
                {(selectedCrop.harvestAreaHectares / 1000000).toFixed(2)}M ha
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Nationwide footprint</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Rainfed Exposure</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-risk-high">
                {selectedCrop.rainfedVulnerabilityShare}%
              </p>
              <p className="mt-1 font-mono text-[10px] text-risk-high">High drought sensitivity</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Water Requirement</p>
              <p className="mt-1 font-mono text-xs font-semibold text-foreground leading-relaxed">
                {selectedCrop.waterRequirementMm}
              </p>
            </div>
          </div>

          {/* Critical Growth Stages */}
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Critical Growth Stages Vulnerable to Water Deficit
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {selectedCrop.criticalGrowthStages.map((stage) => (
                <div key={stage.stage} className="border border-border bg-muted/40 p-4">
                  <span className="font-mono text-[10px] font-semibold tracking-[0.1em] text-signal uppercase">
                    {stage.timing}
                  </span>
                  <h4 className="mt-1 font-heading text-base font-semibold text-foreground">
                    {stage.stage}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {stage.impactOfWaterDeficit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Producing Provinces */}
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Top Producing Provinces & Irrigation Footprint
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCrop.topProducingProvinces.map((p) => (
                <span
                  key={p.province}
                  className="border border-border bg-card px-3 py-1 font-mono text-xs text-foreground"
                >
                  <strong>{p.province}</strong> ({p.region}) · {p.sharePercent}% share · {p.irrigationType}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Mitigations */}
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Recommended Agricultural Mitigations (DA / PhilRice)
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              {selectedCrop.recommendedMitigations.map((mitigation) => (
                <li key={mitigation} className="flex gap-2">
                  <span aria-hidden className="text-muted-foreground">·</span>
                  {mitigation}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Provincial Vulnerability Table */}
      <section aria-labelledby="vulnerability-table-heading">
        <h2 id="vulnerability-table-heading" className="font-heading text-2xl font-semibold text-foreground">
          Provincial Agricultural Vulnerability Matrix
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Evaluates rainfed agricultural exposure, soil water retention, and regional irrigation security.
        </p>

        <div className="mt-4 overflow-x-auto border border-border bg-card">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-border bg-muted text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Province</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Dominant Crops</th>
                <th className="px-4 py-3">Rainfed Area</th>
                <th className="px-4 py-3">Primary Irrigation Source</th>
                <th className="px-4 py-3">Vulnerability Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vulnerabilities.map((v) => (
                <tr key={v.province} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold text-foreground">{v.province}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.region}</td>
                  <td className="px-4 py-3 text-muted-foreground">{(v.primaryCrops || []).join(", ")}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{Math.round((v.rainfedRatio || 0) * 100)}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.irrigationCoverage}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        v.vulnerabilityLevel === "Extreme" || v.vulnerabilityLevel === "High to Extreme"
                          ? "bg-risk-extreme/10 text-risk-extreme"
                          : v.vulnerabilityLevel === "High"
                            ? "bg-risk-high/10 text-risk-high"
                            : "bg-risk-moderate/10 text-risk-moderate"
                      }`}
                    >
                      {v.vulnerabilityLevel} Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SourceNote
        source="Department of Agriculture (DA), Philippine Rice Research Institute (PhilRice), Philippine Statistics Authority (PSA)"
        updated={nationalStatus.updatedAt}
        methodology="Crop vulnerability index based on rainfed hectare exposure, phenological sensitivity, and regional irrigation dependency."
      />
    </div>
  );
}
