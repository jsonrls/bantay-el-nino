import type { Metadata } from "next";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { HistoryView } from "./history-view";
import type { HistoricalEnsoEvent } from "@/lib/types";

export const metadata: Metadata = {
  title: "Historical ENSO",
  description:
    "Explore Philippine El Niño episodes from 1982 to the present: compare rainfall deficits, dam drawdowns, and crop damage.",
};

function getHistoryData(): HistoricalEnsoEvent[] {
  const filePath = join(process.cwd(), "public", "data", "historical-enso-events.json");
  try {
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, "utf8")) as HistoricalEnsoEvent[];
    }
  } catch (err) {
    console.warn("Could not load historical ENSO events:", err);
  }
  return [];
}

export default function HistoryPage() {
  const events = getHistoryData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          Climate Records & Context
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          El Niño Through the Years
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Historical timeline of Philippine El Niño episodes (1982 to 2024). Compare rainfall
          deficits, Angat reservoir drawdowns, and agricultural losses to understand the current event.
        </p>
      </div>

      <HistoryView events={events} />
    </div>
  );
}
