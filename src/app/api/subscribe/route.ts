import { NextResponse } from "next/server";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      channel,
      contact,
      provinceSlug,
      municipality,
      notifyHeatDanger = true,
      notifyDroughtAlerts = true,
    } = body;

    // 1. Validation
    if (!channel || (channel !== "sms" && channel !== "email")) {
      return NextResponse.json(
        { error: "Channel must be 'sms' or 'email'" },
        { status: 400 }
      );
    }

    if (!contact || typeof contact !== "string" || contact.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid phone number or email address is required" },
        { status: 400 }
      );
    }

    if (!provinceSlug || typeof provinceSlug !== "string") {
      return NextResponse.json(
        { error: "Province is required" },
        { status: 400 }
      );
    }

    const cleanContact = contact.trim();
    const cleanProvince = provinceSlug.toLowerCase().trim();
    const cleanMunicipality = municipality ? municipality.trim() : null;

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("alert_subscriptions").upsert(
          {
            channel,
            contact: cleanContact,
            province_slug: cleanProvince,
            municipality: cleanMunicipality,
            notify_heat_danger: Boolean(notifyHeatDanger),
            notify_drought_alerts: Boolean(notifyDroughtAlerts),
            active: true,
          },
          { onConflict: "channel,contact,province_slug" }
        );

        if (error) {
          console.error("Supabase subscription error:", error);
          return NextResponse.json(
            { error: "Failed to save subscription in database" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: `Subscribed successfully! You will receive ${channel.toUpperCase()} alerts for ${cleanProvince}.`,
          channel,
          province: cleanProvince,
        });
      }
    }

    // 3. Fallback for demo / unconfigured mode
    return NextResponse.json({
      success: true,
      demoMode: true,
      message: `[Demo Mode] Alert subscription recorded for ${cleanContact} (${cleanProvince}). Connect Supabase in .env.local to persist real alerts.`,
      channel,
      province: cleanProvince,
    });
  } catch (err) {
    console.error("Error in alert subscription API:", err);
    return NextResponse.json(
      { error: "Internal server error processing subscription" },
      { status: 500 }
    );
  }
}
