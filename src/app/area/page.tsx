import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaView } from "./area-view";

export const metadata: Metadata = {
  title: "My Area",
  description:
    "Interactive province-level El Niño dashboard for all 88 Philippine provinces: impact score, indicators, plain-language explanations, and recommended actions.",
};

export default function AreaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          Local Climate Intelligence
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Check Your Area
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Select any of the 88 Philippine provinces and 1,600+ municipalities to inspect
          localized El Niño impact scores, drought thresholds, and recommended actions.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center border border-border bg-card">
            <p className="font-mono text-xs tracking-[0.1em] text-muted-foreground uppercase">
              Loading local area data...
            </p>
          </div>
        }
      >
        <AreaView />
      </Suspense>
    </div>
  );
}
