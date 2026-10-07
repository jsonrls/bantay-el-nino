"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdvisoryRow } from "./advisory-row";
import type { Advisory } from "@/lib/types";

const FILTERS = ["All", "PAGASA", "Water", "Agriculture", "Health", "General"] as const;
type Filter = (typeof FILTERS)[number];

/**
 * Advisory filter (blueprint §10) as a segmented control: sharp, form-like,
 * and honest. The empty state names the cause and the next action (R-27).
 */
export function AdvisoryFilter({ advisories }: { advisories: Advisory[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const visible =
    filter === "All"
      ? advisories
      : advisories.filter((advisory) => advisory.category === filter);

  return (
    <div>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        value={filter}
        onValueChange={(value) => {
          if (value) setFilter(value as Filter);
        }}
        aria-label="Filter advisories"
        className="flex flex-wrap"
      >
        {FILTERS.map((value) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className="h-11 px-4 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase data-[state=on]:bg-foreground data-[state=on]:text-background sm:h-9"
          >
            {value}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {visible.length === 0 ? (
        <div className="mt-8 border border-border bg-card p-6">
          <p className="font-heading text-lg font-semibold text-foreground">
            No {filter} advisories right now.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing has been issued in this category for the current period.
            Choose All to see the {advisories.length} current advisories.
          </p>
        </div>
      ) : (
        <div className="mt-6 border-t border-border">
          {visible.map((advisory) => (
            <AdvisoryRow key={advisory.id} advisory={advisory} />
          ))}
        </div>
      )}
    </div>
  );
}
