"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PhilippinesMap } from "./philippines-map";

const LAYERS = [
  { key: "impact", label: "Impact" },
  { key: "temperature", label: "Temperature" },
  { key: "rainfall", label: "Rainfall" },
  { key: "drought", label: "Drought" },
  { key: "water", label: "Water" },
  { key: "agriculture", label: "Agriculture" },
] as const;

type LayerKey = (typeof LAYERS)[number]["key"];

/**
 * Live Map shell: segmented layer switcher driving the MapLibre GL map surface.
 * Clicking a province opens its side panel with the indicator table and a direct
 * link to the province dashboard (blueprint §3).
 */
export function MapView() {
  const [activeLayer, setActiveLayer] = useState<LayerKey>("impact");
  const active = LAYERS.find((layer) => layer.key === activeLayer);

  return (
    <div className="border border-border bg-card p-4 sm:p-6">
      <p className="font-mono text-[10px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
        Layer
      </p>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        value={activeLayer}
        onValueChange={(value) => {
          if (value) setActiveLayer(value as LayerKey);
        }}
        aria-label="Map layer"
        className="mt-2 flex flex-wrap"
      >
        {LAYERS.map(({ key, label }) => (
          <ToggleGroupItem
            key={key}
            value={key}
            className="h-11 px-4 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase data-[state=on]:bg-foreground data-[state=on]:text-background sm:h-9"
          >
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <PhilippinesMap activeLayer={active?.key ?? "impact"} className="mt-5" minHeight="min-h-[440px]" />

      <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground">
        Selecting a province will open its side panel with the indicator table
        and a link to the province dashboard (blueprint §3).
      </p>
    </div>
  );
}
