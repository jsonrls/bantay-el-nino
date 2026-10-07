import type { Metadata } from "next";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { advisories as fallbackAdvisories, nationalStatus } from "@/lib/data";
import { AdvisoryFilter } from "@/components/advisory-filter";
import { SourceNote } from "@/components/source-note";
import type { Advisory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Advisories",
  description:
    "Latest heat, drought, water, and agriculture advisories for the Philippines, with sources and timestamps.",
};

function getAdvisories(): Advisory[] {
  try {
    const catalogPath = join(process.cwd(), "public", "data", "advisories-catalog.json");
    if (existsSync(catalogPath)) {
      const raw = readFileSync(catalogPath, "utf8");
      return JSON.parse(raw) as Advisory[];
    }
  } catch (err) {
    console.warn("Could not read advisories-catalog.json:", err);
  }
  return fallbackAdvisories;
}

export default function AdvisoriesPage() {
  const allAdvisories = getAdvisories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
        Official Alert Center
      </p>
      <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Latest Advisories
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Aggregated official information, clearly attributed. Bantay is a civic
        information service. Always refer to the issuing government agency for official
        directives.
      </p>

      <div className="mt-6">
        <AdvisoryFilter advisories={allAdvisories} />
      </div>

      <SourceNote
        source="Official bulletins from PAGASA, DA, NIA, MWSS, and DOH"
        updated={nationalStatus.updatedAt}
        methodology="Official bulletins aggregated by Bantay and linked directly to issuing agencies"
      />
    </div>
  );
}
