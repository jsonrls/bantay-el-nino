import { CloudRain, Droplets, Thermometer, Wheat, type LucideIcon } from "lucide-react";
import { type IndicatorKey, type IndicatorReading } from "@/lib/types";
import { RiskBadge } from "./risk-badge";

/**
 * Icon policy (DESIGN.md, R-04): the glyph literally names the datum it
 * labels (thermometer = temperature, rain cloud = rainfall, drop = water,
 * wheat = agriculture). No icon without a relevant meaning.
 */
const ICONS: Record<IndicatorKey, LucideIcon> = {
  temperature: Thermometer,
  rainfall: CloudRain,
  water: Droplets,
  agriculture: Wheat,
};

/**
 * The four core indicators as one divided data strip instead of four
 * identical cards (R-14). Hairlines come from the grid gap over the
 * border-colored container, so the treatment holds at every breakpoint.
 */
export function IndicatorStrip({
  readings,
  className = "",
}: {
  readings: IndicatorReading[];
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {readings.map((reading) => {
        const Icon = ICONS[reading.key];
        return (
          <div key={reading.key} className="bg-card p-5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="size-3.5" aria-hidden />
              <span className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase">
                {reading.label}
              </span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-foreground">
              {reading.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {reading.status}
            </p>
            <RiskBadge level={reading.risk} className="mt-3" />
          </div>
        );
      })}
    </div>
  );
}
