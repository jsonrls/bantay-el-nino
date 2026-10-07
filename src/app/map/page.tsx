import type { Metadata } from "next";
import { nationalStatus } from "@/lib/data";
import { MapView } from "@/components/map-view";
import { SourceNote } from "@/components/source-note";

export const metadata: Metadata = {
  title: "Live Map",
  description:
    "Interactive map of El Niño impact across Philippine provinces, with temperature, rainfall, drought, water, and agriculture layers.",
};

export default function MapPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
        Philippines
      </p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        El Niño Live Map
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Explore overall El Niño impact and individual indicators across
        Philippine provinces. This is the flagship view of Bantay El Niño.
      </p>

      <div className="mt-6">
        <MapView />
      </div>

      <SourceNote
        source={nationalStatus.source}
        updated={nationalStatus.updatedAt}
        methodology="Province polygons come from open administrative GeoJSON; risk values use the Bantay Impact Score"
      />
    </div>
  );
}
