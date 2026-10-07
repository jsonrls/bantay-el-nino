import type { Metadata } from "next";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { nationalStatus } from "@/lib/data";
import { RiskBadge } from "@/components/risk-badge";
import { SourceNote } from "@/components/source-note";
import type { DamInfo, RiverBasin } from "@/lib/types";

export const metadata: Metadata = {
  title: "Water Watch",
  description:
    "Monitor Philippine dam levels, reservoir storage vs rule curves, and water stress across major river basins during El Niño.",
};

interface DamStatus {
  damId: string;
  name: string;
  currentLevelM: number;
  normalHighWaterLevelM: number;
  ruleCurveM: number;
  deviationFromRuleM: number;
  deviationPercent: number;
  percentCapacity: number;
  operationalStatus: string;
  potableWaterAllocationM3s: number;
  irrigationAllocationM3s: number;
  potableSupplyRisk: string;
  irrigationSupplyRisk: string;
  outlook: string;
}

function getWaterData(): { dams: DamInfo[]; statuses: DamStatus[]; basins: RiverBasin[] } {
  const dataDir = join(process.cwd(), "public", "data");
  let dams: DamInfo[] = [];
  let statuses: DamStatus[] = [];
  let basins: RiverBasin[] = [];

  try {
    const damsPath = join(dataDir, "dams.json");
    if (existsSync(damsPath)) {
      dams = JSON.parse(readFileSync(damsPath, "utf8")) as DamInfo[];
    }
    const statusPath = join(dataDir, "dams-status.json");
    if (existsSync(statusPath)) {
      statuses = JSON.parse(readFileSync(statusPath, "utf8")) as DamStatus[];
    }
    const basinsPath = join(dataDir, "river-basins.json");
    if (existsSync(basinsPath)) {
      basins = JSON.parse(readFileSync(basinsPath, "utf8")) as RiverBasin[];
    }
  } catch (err) {
    console.warn("Could not load water datasets:", err);
  }

  return { dams, statuses, basins };
}

const CONSERVATION_TIPS = [
  {
    target: "Households",
    actions: [
      "Check faucets, toilet tanks, and exposed pipework for silent leaks.",
      "Reuse greywater from laundry or rinsing for toilet flushing and plants.",
      "Store potable water in clean, covered containers in case of rotational pressure drops.",
    ],
  },
  {
    target: "Irrigation & Farms",
    actions: [
      "Practice Alternate Wetting and Drying (AWD) in rice paddies to save up to 30% water.",
      "Line farm conveyance canals or repair earthen embankments to reduce seepage loss.",
      "Construct Small Farm Reservoirs (SFR) to trap localized rain showers.",
    ],
  },
];

export default function WaterPage() {
  const { dams, statuses, basins } = getWaterData();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <div>
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          Resource Monitoring
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Water Watch
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Track reservoir elevations against operational rule curves, potable water
          allocations, and hydrological stress across Philippine river basins.
        </p>
      </div>

      {/* National Water Status Hero Banner */}
      <section className="border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              National Water Alert Status
            </p>
            <h2 className="mt-1 font-heading text-2xl font-semibold text-foreground">
              Moderate to Elevated Reservoir Stress
            </h2>
          </div>
          <RiskBadge level="high" label="Watch Status" className="px-3 py-1 font-mono text-xs" />
        </div>

        <div className="mt-6 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase">Angat Dam Elevation</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-foreground">204.6 m</p>
            <p className="mt-1 font-mono text-[11px] text-risk-moderate">
              −5.4 m below rule curve (210 m)
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase">Metro Manila Allocation</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-foreground">48 m³/s</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              Normal municipal supply maintained
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase">Irrigation Cutback</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-risk-high">20 m³/s</p>
            <p className="mt-1 font-mono text-[11px] text-risk-high">
              Bulacan/Pampanga farm allocations curtailed
            </p>
          </div>
        </div>
      </section>

      {/* Monitored Major Reservoirs */}
      <section aria-labelledby="reservoirs-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="reservoirs-heading" className="font-heading text-2xl font-semibold text-foreground">
            Major Reservoirs Status
          </h2>
          <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            PAGASA Daily Hydrometeorological Rule Curve Baseline
          </span>
        </div>

        <div className="mt-4 divide-y divide-border border border-border bg-card">
          {statuses.map((dam) => {
            const isLow = dam.percentCapacity < 70;
            return (
              <div key={dam.damId} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-foreground">
                      {dam.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      Current: <span className="font-semibold text-foreground">{dam.currentLevelM} m</span> · Normal High: {dam.normalHighWaterLevelM} m · Rule Curve: {dam.ruleCurveM} m
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                      {dam.percentCapacity}%
                    </span>
                    <span className="block font-mono text-[10px] text-muted-foreground uppercase">
                      Capacity
                    </span>
                  </div>
                </div>

                {/* Visual Capacity Bar */}
                <div className="mt-3 h-2 w-full bg-muted">
                  <div
                    className={`h-full ${isLow ? "bg-risk-high" : "bg-foreground"}`}
                    style={{ width: `${Math.min(dam.percentCapacity, 100)}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4 text-xs">
                  <p className="max-w-2xl text-muted-foreground">
                    <strong className="text-foreground">Operational Outlook: </strong>
                    {dam.outlook}
                  </p>
                  <div className="flex gap-4 font-mono text-[11px]">
                    <span>
                      Drinking Water: <strong className="text-foreground">{dam.potableSupplyRisk}</strong>
                    </span>
                    <span>
                      Irrigation: <strong className={dam.irrigationSupplyRisk === "High" ? "text-risk-high" : "text-foreground"}>{dam.irrigationSupplyRisk}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Philippine River Basins & Technical Infrastructure Catalog */}
      <section aria-labelledby="directory-heading">
        <h2 id="directory-heading" className="font-heading text-2xl font-semibold text-foreground">
          Critical Water Infrastructure Directory
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Full directory of Philippine multipurpose dams and principal river basins monitored by Bantay.
        </p>

        <div className="mt-4 overflow-x-auto border border-border bg-card">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-border bg-muted text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Facility / Reservoir</th>
                <th className="px-4 py-3">River Basin</th>
                <th className="px-4 py-3">Province</th>
                <th className="px-4 py-3">Capacity (MCM)</th>
                <th className="px-4 py-3">Primary Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dams.map((item) => (
                <tr key={item.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.riverBasin}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.province}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{item.storageCapacityMcm.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.purpose.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 18 Major River Basins */}
        <h3 className="mt-8 font-heading text-lg font-semibold text-foreground">
          18 Principal River Basins
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Hydrological catchment areas providing baseflow to Philippine agricultural and municipal water systems.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {basins.map((b) => (
            <div key={b.id} className="border border-border bg-card p-3 font-mono text-xs">
              <p className="font-semibold text-foreground">{b.name}</p>
              <p className="text-[10px] text-muted-foreground">
                Drainage: {b.drainageAreaKm2.toLocaleString()} km² · {b.islandGroup}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Conservation Actions */}
      <section aria-labelledby="conservation-heading">
        <h2 id="conservation-heading" className="font-heading text-2xl font-semibold text-foreground">
          What can you do?
        </h2>
        <div className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-2">
          {CONSERVATION_TIPS.map((group) => (
            <div key={group.target} className="bg-card p-6">
              <h3 className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                {group.target}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {group.actions.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span aria-hidden className="text-muted-foreground">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <SourceNote
        source="PAGASA Hydrometeorological Division, National Irrigation Administration (NIA), MWSS"
        updated={nationalStatus.updatedAt}
        methodology="Reservoir elevations evaluated relative to official seasonal rule curves. Daily data validated by Bantay pipelines."
      />
    </div>
  );
}
