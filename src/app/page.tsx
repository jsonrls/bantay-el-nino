import Link from "next/link";
import { advisories, nationalStatus } from "@/lib/data";
import { scoreToRisk } from "@/lib/types";
import { AdvisoryRow } from "@/components/advisory-row";
import { IndicatorStrip } from "@/components/indicator-strip";
import { LiveWeatherCard } from "@/components/live-weather-card";
import { PhilippinesMap } from "@/components/philippines-map";
import { RiskBadge } from "@/components/risk-badge";
import { SourceNote } from "@/components/source-note";
import { Button } from "@/components/ui/button";

const WHATS_HAPPENING = [
  {
    n: "01",
    title: "Heat",
    body: "Above-normal temperatures are increasing heat stress across affected areas.",
  },
  {
    n: "02",
    title: "Rainfall",
    body: "Rainfall is below seasonal averages in several areas.",
  },
  {
    n: "03",
    title: "Water",
    body: "Reduced rainfall can increase pressure on reservoirs and water supplies.",
  },
];

export default function Home() {
  const risk = scoreToRisk(nationalStatus.impactScore);

  return (
    <div>
      {/* Hero (blueprint §2): the answer first. Focal point = the score. */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl px-4 py-10 lg:grid-cols-[1.3fr_1fr] lg:gap-0">
          <div className="lg:pr-10">
            <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              Philippines · {nationalStatus.period}
            </p>
            <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              El Niño Status
            </h1>

            <div className="mt-6 flex items-end gap-4">
              <p className="font-mono text-7xl font-semibold leading-none tabular-nums text-foreground sm:text-8xl">
                {nationalStatus.impactScore}
              </p>
              <div className="pb-1.5">
                <p className="font-mono text-base text-muted-foreground">
                  /100
                </p>
                <RiskBadge
                  level={risk}
                  label={nationalStatus.statusLabel}
                  className="mt-1.5"
                />
              </div>
            </div>
            <p className="mt-2 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
              National composite impact score
            </p>

            <SourceNote
              source={nationalStatus.source}
              updated={nationalStatus.updatedAt}
              methodology="Bantay composite: temperature 25%, rainfall 25%, drought 20%, water 15%, agriculture 10%, other 5%"
            />
          </div>

          <div className="mt-8 border-t border-border pt-6 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <dl className="divide-y divide-border">
              <div className="flex items-baseline justify-between gap-4 pb-4">
                <dt className="font-mono text-[10px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
                  Temperature
                </dt>
                <dd className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {nationalStatus.temperatureAnomaly}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-4">
                <dt className="font-mono text-[10px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
                  Rainfall
                </dt>
                <dd className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {nationalStatus.rainfallAnomaly}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-3">
              <Button
                asChild
                className="h-11 px-6 font-mono text-xs font-semibold tracking-[0.08em] uppercase"
              >
                <Link href="/map">Open live map</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 border-foreground px-6 font-mono text-xs font-semibold tracking-[0.08em] uppercase"
              >
                <Link href="/area">Check my area</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's happening: numbered editorial rows, not cards (R-05). */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          What’s happening?
        </h2>
        <ol className="mt-5 border-t border-border">
          {WHATS_HAPPENING.map((item) => (
            <li
              key={item.n}
              className="grid gap-1 border-b border-border py-5 sm:grid-cols-[3rem_8rem_1fr] sm:gap-6"
            >
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {item.n}
              </span>
              <span className="font-mono text-xs font-semibold tracking-[0.1em] text-foreground uppercase">
                {item.title}
              </span>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Map band: full-width surface break in the section rhythm (RHYTHM 2). */}
      <section className="border-y border-border bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              National Impact Map
            </h2>
            <Link
              href="/map"
              className="font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground uppercase underline underline-offset-4 hover:underline-offset-2"
            >
              Open live map
            </Link>
          </div>
          <p className="mt-2 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            Layers: Impact · Temperature · Rainfall · Drought · Water ·
            Agriculture
          </p>
          <PhilippinesMap activeLayer="impact" className="mt-5" minHeight="min-h-[440px]" />
        </div>
      </section>

      {/* Core indicators as one divided strip (R-14). */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Core indicators
          </h2>
          <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            {nationalStatus.period} · Synoptic monitoring
          </span>
        </div>
        <IndicatorStrip
          readings={nationalStatus.indicators}
          className="mt-5"
        />
        <SourceNote
          source={nationalStatus.source}
          updated={nationalStatus.updatedAt}
        />
      </section>

      {/* Live Hourly Weather & Heat Index Observation (Layer 2) */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <LiveWeatherCard provinceSlug="metro-manila" />
      </section>

      {/* Latest advisories as ruled rows. */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Latest advisories
          </h2>
          <Link
            href="/advisories"
            className="font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground uppercase underline underline-offset-4 hover:underline-offset-2"
          >
            View all advisories
          </Link>
        </div>
        <div className="mt-4 border-t border-border">
          {advisories.slice(0, 2).map((advisory) => (
            <AdvisoryRow key={advisory.id} advisory={advisory} />
          ))}
        </div>
      </section>
    </div>
  );
}
