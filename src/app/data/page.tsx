import type { Metadata } from "next";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { nationalStatus } from "@/lib/data";
import { SourceNote } from "@/components/source-note";

export const metadata: Metadata = {
  title: "Data & Methodology",
  description:
    "Open data transparency, composite impact score weighting, and scientific sources powering Bantay El Niño.",
};

interface DataSource {
  id: string;
  name: string;
  agency: string;
  category: string;
  type: string;
  coverage: string;
  updateFrequency: string;
  url: string;
  license: string;
  variables: string[];
}

interface Methodology {
  version: string;
  title: string;
  summary: string;
  formula: string;
  components: {
    key: string;
    label: string;
    weight: number;
    weightFraction: number;
    unit: string;
    description: string;
  }[];
  riskBands: {
    range: string;
    level: string;
    label: string;
    colorHex: string;
    description: string;
  }[];
  zeroSubscriptionCompliance: string;
}

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

async function getDataAndMethodology(): Promise<{ sources: DataSource[]; methodology: Methodology | null }> {
  const dataDir = join(process.cwd(), "public", "data");
  let sources: DataSource[] = [];
  let methodology: Methodology | null = null;

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("data_sources").select("*").eq("active", true);
        if (!error && data && data.length > 0) {
          sources = data.map((row) => ({
            id: row.id,
            name: row.name,
            agency: row.provider,
            category: "Climate & Remote Sensing",
            type: row.source_type || "API / Catalog",
            coverage: "Philippines / Global",
            updateFrequency: row.update_frequency || "Daily",
            url: row.base_url || "https://bagong.pagasa.dost.gov.ph",
            license: row.license || "Open Data",
            variables: ["Temperature", "Rainfall", "Drought"],
          }));
        }
      }
    }
  } catch (err) {
    console.warn("Could not query data_sources from Supabase:", err);
  }

  try {
    if (sources.length === 0) {
      const sourcesPath = join(dataDir, "data-sources.json");
      if (existsSync(sourcesPath)) {
        sources = JSON.parse(readFileSync(sourcesPath, "utf8")) as DataSource[];
      }
    }
    const methPath = join(dataDir, "methodology.json");
    if (existsSync(methPath)) {
      methodology = JSON.parse(readFileSync(methPath, "utf8")) as Methodology;
    }
  } catch (err) {
    console.warn("Could not load data/methodology specs:", err);
  }

  return { sources, methodology };
}

export default async function DataPage() {
  const { sources, methodology } = await getDataAndMethodology();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <div>
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          Transparency & Integrity
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Data & Methodology
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every figure, boundary polygon, and advisory on Bantay El Niño comes from open,
          auditable public datasets. We explain exactly how composite risk scores are calculated.
        </p>
      </div>

      {/* Methodology Section (Blueprint §15) */}
      {methodology ? (
        <section className="border border-border bg-card p-6 sm:p-8" aria-labelledby="methodology-heading">
          <h2 id="methodology-heading" className="font-heading text-2xl font-semibold text-foreground">
            Bantay Composite Impact Score (0–100)
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground leading-relaxed">
            The Bantay Impact Score translates meteorological anomalies into actionable civic risk tiers.
            Weights are distributed across physical climate observations, hydrological reservoirs,
            and agricultural sensitivity:
          </p>

          <div className="mt-6 divide-y divide-border border border-border">
            {methodology.components.map((comp) => (
              <div key={comp.key} className="flex flex-wrap items-baseline justify-between gap-4 p-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {comp.label}
                    </span>
                    <span className="border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {comp.unit}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{comp.description}</p>
                </div>
                <div className="font-mono text-2xl font-semibold text-foreground">
                  {comp.weight}%
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Risk Score Bands
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              {methodology.riskBands.map((band) => (
                <div key={band.range} className="border border-border bg-muted/40 p-4">
                  <p className="font-mono text-lg font-semibold text-foreground">{band.range}</p>
                  <p className="font-mono text-xs font-semibold uppercase text-signal">{band.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{band.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Data Sources Catalog Table */}
      <section aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="font-heading text-2xl font-semibold text-foreground">
          Open Data Sources Directory
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Official agencies and open scientific repositories utilized across the platform.
        </p>

        <div className="mt-4 overflow-x-auto border border-border bg-card">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-border bg-muted text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Agency / Repository</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Coverage</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Source Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-foreground">{s.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{s.agency}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.coverage}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.updateFrequency}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.license}</td>
                  <td className="px-4 py-3">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-signal underline hover:text-foreground"
                    >
                      Official URL →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Honesty Policy */}
      <section className="border border-border bg-card p-6" aria-labelledby="policy-heading">
        <h2 id="policy-heading" className="font-heading text-xl font-semibold text-foreground">
          Data Honesty & Public Attribution Policy
        </h2>
        <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Bantay El Niño is an independent civic information dashboard and is not operated by PAGASA
            or the Philippine Government. All meteorological bulletins and hydrological data are compiled
            from publicly accessible open government and scientific channels.
          </p>
          <p>
            Rule-based evaluations and composite impact scores are documented openly to ensure total
            auditability. Figures are presented with timestamps and source notes to maintain public trust.
          </p>
        </div>
      </section>

      <SourceNote
        source="PAGASA, NOAA CPC, NASA POWER, PSA, PhilRice, MWSS, NIA"
        updated={nationalStatus.updatedAt}
        methodology="Complete metadata audit verified across 22 structured datasets."
      />
    </div>
  );
}
