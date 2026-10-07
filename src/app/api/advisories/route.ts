import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { Advisory } from "@/lib/types";

function getFallbackAdvisories(): Advisory[] {
  try {
    const file = join(process.cwd(), "public", "data", "advisories-catalog.json");
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file, "utf8")) as Advisory[];
    }
  } catch (err) {
    console.warn("Failed to load local advisories catalog:", err);
  }
  return [];
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("advisories")
          .select("*")
          .eq("active", true)
          .order("published_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: Advisory[] = data.map((row) => ({
            id: row.id,
            level: (row.severity?.toLowerCase() || "moderate") as Advisory["level"],
            category: (row.advisory_type?.charAt(0).toUpperCase() +
              row.advisory_type?.slice(1).toLowerCase()) as Advisory["category"],
            title: row.title,
            area: "Philippines (National / Regional)",
            summary: row.summary || row.body || "",
            source: "DOST-PAGASA & Inter-Agency El Niño Task Force",
            publishedAt: row.published_at
              ? new Date(row.published_at).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Active Advisory",
            url: row.source_url || "https://bagong.pagasa.dost.gov.ph",
          }));

          return NextResponse.json(
            { advisories: mapped, source: "supabase" },
            {
              headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
              },
            }
          );
        }
      }
    }

    const fallback = getFallbackAdvisories();
    return NextResponse.json({ advisories: fallback, source: "static_catalog" });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_")
    ) {
      throw error;
    }
    console.error("Error reading advisories:", error);
    return NextResponse.json({ advisories: getFallbackAdvisories(), source: "fallback" });
  }
}
