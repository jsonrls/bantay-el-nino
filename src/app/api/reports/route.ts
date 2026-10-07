import { NextResponse } from "next/server";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const DEMO_REPORTS = [
  {
    id: "rep-001",
    province_slug: "isabela",
    municipality: "Ilagan City",
    category: "crop_damage",
    severity: "high",
    description: "Yellowing and stunted growth on 20 hectares of rainfed corn fields due to 4 consecutive dry weeks.",
    reporter_name: "Farmer Association Member",
    verified: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "rep-002",
    province_slug: "cebu",
    municipality: "Toledo City",
    category: "water_shortage",
    severity: "moderate",
    description: "Water levels at local communal irrigation canal have dropped below intake level; farmers taking turns in 12-hour intervals.",
    reporter_name: "Barangay Councilor",
    verified: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "rep-003",
    province_slug: "pangasinan",
    municipality: "Dagupan City",
    category: "extreme_heat",
    severity: "extreme",
    description: "Heat index exceeded 44°C for two consecutive afternoons; outdoor construction suspended from 11 AM to 3 PM.",
    reporter_name: "Local DRRM Volunteer",
    verified: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceSlug = searchParams.get("province")?.toLowerCase().trim();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase
          .from("community_reports")
          .select("id, province_slug, municipality, category, severity, description, reporter_name, verified, created_at")
          .order("created_at", { ascending: false })
          .limit(20);

        if (provinceSlug) {
          query = query.eq("province_slug", provinceSlug);
        }

        const { data, error } = await query;
        if (!error && data) {
          return NextResponse.json({ reports: data, source: "supabase" });
        }
      }
    }

    // Fallback demo reports
    let filtered = DEMO_REPORTS;
    if (provinceSlug) {
      filtered = DEMO_REPORTS.filter((r) => r.province_slug === provinceSlug);
      if (filtered.length === 0) {
        filtered = DEMO_REPORTS; // Show all if none for specific province
      }
    }

    return NextResponse.json({ reports: filtered, source: "baseline_catalog" });
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
    console.error("Error fetching community reports:", error);
    return NextResponse.json({ reports: DEMO_REPORTS, source: "fallback" }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      provinceSlug,
      municipality,
      category,
      severity = "moderate",
      description,
      reporterName,
      contactInfo,
    } = body;

    // Validation
    if (!provinceSlug || typeof provinceSlug !== "string") {
      return NextResponse.json({ error: "Province is required" }, { status: 400 });
    }
    if (!municipality || typeof municipality !== "string") {
      return NextResponse.json({ error: "Municipality is required" }, { status: 400 });
    }
    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    const validCategories = ["crop_damage", "water_shortage", "extreme_heat", "fire_risk", "other"];
    const safeCategory = validCategories.includes(category) ? category : "other";

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("community_reports")
          .insert({
            province_slug: provinceSlug.toLowerCase().trim(),
            municipality: municipality.trim(),
            category: safeCategory,
            severity,
            description: description.trim(),
            reporter_name: reporterName ? reporterName.trim() : "Anonymous Citizen",
            contact_info: contactInfo ? contactInfo.trim() : null,
            verified: false,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Supabase report insert error:", error);
          return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          reportId: data?.id,
          message: "Report submitted successfully! Thank you for helping monitor climate impacts.",
        });
      }
    }

    // Demo fallback response
    return NextResponse.json({
      success: true,
      demoMode: true,
      reportId: `demo-${Date.now()}`,
      message: "Report recorded [Demo Mode]. Connect Supabase in .env.local for database persistence.",
    });
  } catch (err) {
    console.error("Error submitting community report:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
