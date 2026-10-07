"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { regions } from "@/lib/data";
import type { AdminHierarchy } from "@/lib/types";

const REGION_NAMES = Object.keys(regions);
const ALL_MUNICIPALITIES = "all-municipalities";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-mono text-[10px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
      {children}
    </span>
  );
}

export interface AreaSearchProps {
  region?: string;
  province?: string;
  municipality?: string;
  onRegionChange?: (region: string) => void;
  onProvinceChange?: (province: string) => void;
  onMunicipalityChange?: (municipality: string) => void;
}

/**
 * "Find your area" selector (blueprint §5).
 * Connects Region -> Province -> Real Municipalities (1,600+ Philippine LGUs)
 * loaded from admin-hierarchy.json.
 */
export function AreaSearch(props: AreaSearchProps) {
  const [internalRegion, setInternalRegion] = useState<string>("National Capital Region (NCR)");
  const [internalProvince, setInternalProvince] = useState<string>("Metro Manila");
  const [internalMunicipality, setInternalMunicipality] = useState<string>(ALL_MUNICIPALITIES);
  const [hierarchy, setHierarchy] = useState<AdminHierarchy | null>(null);

  const region = props.region ?? internalRegion;
  const province = props.province ?? internalProvince;
  const municipality = props.municipality ?? internalMunicipality;

  useEffect(() => {
    fetch("/data/admin-hierarchy.json")
      .then((res) => res.json())
      .then((data: AdminHierarchy) => {
        setHierarchy(data);
      })
      .catch((err) => {
        console.warn("Could not load admin hierarchy:", err);
      });
  }, []);

  // Compute available municipalities for the currently selected province
  const availableMunicipalities = (() => {
    if (!hierarchy) return [];
    if (province.toLowerCase() === "metro manila" || region.toLowerCase().includes("ncr")) {
      const ncr = hierarchy.regions.find((r) => r.name.toLowerCase().includes("ncr"));
      if (ncr) {
        return Array.from(new Set(ncr.provinces.flatMap((p) => p.municipalities.map((m) => m.name)))).sort();
      }
    }
    for (const r of hierarchy.regions) {
      for (const p of r.provinces) {
        if (
          p.name.toLowerCase() === province.toLowerCase() ||
          p.name.toLowerCase().includes(province.toLowerCase()) ||
          province.toLowerCase().includes(p.name.toLowerCase())
        ) {
          return Array.from(new Set(p.municipalities.map((m) => m.name))).sort();
        }
      }
    }
    return [];
  })();

  function handleRegionChange(nextRegion: string) {
    if (props.onRegionChange) {
      props.onRegionChange(nextRegion);
    } else {
      setInternalRegion(nextRegion);
    }
    const nextProv = regions[nextRegion]?.[0] ?? "";
    if (props.onProvinceChange) {
      props.onProvinceChange(nextProv);
    } else {
      setInternalProvince(nextProv);
    }
    if (props.onMunicipalityChange) {
      props.onMunicipalityChange(ALL_MUNICIPALITIES);
    } else {
      setInternalMunicipality(ALL_MUNICIPALITIES);
    }
  }

  function handleProvinceChange(nextProv: string) {
    if (props.onProvinceChange) {
      props.onProvinceChange(nextProv);
    } else {
      setInternalProvince(nextProv);
    }
    if (props.onMunicipalityChange) {
      props.onMunicipalityChange(ALL_MUNICIPALITIES);
    } else {
      setInternalMunicipality(ALL_MUNICIPALITIES);
    }
  }

  function handleMunicipalityChange(nextMun: string) {
    if (props.onMunicipalityChange) {
      props.onMunicipalityChange(nextMun);
    } else {
      setInternalMunicipality(nextMun);
    }
  }

  return (
    <section
      className="border border-border bg-card p-6"
      aria-labelledby="find-area-heading"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2
            id="find-area-heading"
            className="font-heading text-xl font-semibold text-foreground"
          >
            Find your area
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Where are you?</p>
        </div>
        <span className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
          88 provinces · 1,618 LGUs monitored
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel>Region</FieldLabel>
          <Select value={region} onValueChange={handleRegionChange}>
            <SelectTrigger
              className="mt-1 h-11 w-full"
              aria-label="Region"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGION_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>Province</FieldLabel>
          <Select value={province} onValueChange={handleProvinceChange}>
            <SelectTrigger
              className="mt-1 h-11 w-full"
              aria-label="Province"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(regions[region] ?? []).map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>Municipality</FieldLabel>
          <Select
            value={municipality}
            onValueChange={handleMunicipalityChange}
            disabled={availableMunicipalities.length === 0}
          >
            <SelectTrigger className="mt-1 h-11 w-full" aria-label="Municipality">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_MUNICIPALITIES}>
                All municipalities {availableMunicipalities.length > 0 ? `(${availableMunicipalities.length})` : "..."}
              </SelectItem>
              {availableMunicipalities.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="mt-1 block font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
            {availableMunicipalities.length > 0
              ? `${availableMunicipalities.length} cities & municipalities mapped`
              : "Loading Philippine LGUs..."}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button
          asChild
          className="h-11 px-6 font-mono text-xs font-semibold tracking-[0.08em] uppercase"
        >
          <a href="#province-dashboard">View my area</a>
        </Button>
      </div>
    </section>
  );
}
