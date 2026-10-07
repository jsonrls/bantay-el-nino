import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ProvinceMaster } from "@/lib/types";


function classifyPagasaHeatIndex(apparentTempC: number) {
  if (apparentTempC >= 52) {
    return {
      level: "Extreme Danger",
      risk: "extreme" as const,
      color: "#991b1b",
      effects: "Heat stroke is imminent with continued exposure.",
      guidance: "Stay indoors in air-conditioned or well-ventilated areas. Strictly avoid strenuous physical outdoor work.",
    };
  }
  if (apparentTempC >= 42) {
    return {
      level: "Danger",
      risk: "high" as const,
      color: "#c2410c",
      effects: "Heat cramps and heat exhaustion are likely; heat stroke is probable with continued activity.",
      guidance: "Limit direct outdoor activity between 10 AM and 3 PM. Drink water regularly and take frequent shaded rests.",
    };
  }
  if (apparentTempC >= 33) {
    return {
      level: "Extreme Caution",
      risk: "moderate" as const,
      color: "#a16207",
      effects: "Heat cramps and heat exhaustion are possible. Continued activity could lead to heat stroke.",
      guidance: "Wear lightweight clothing, drink water even if not thirsty, and watch for symptoms of heat exhaustion.",
    };
  }
  if (apparentTempC >= 27) {
    return {
      level: "Caution",
      risk: "low" as const,
      color: "#4d7c0f",
      effects: "Fatigue is possible with prolonged exposure and activity.",
      guidance: "Stay hydrated and schedule breaks during prolonged outdoor tasks.",
    };
  }
  return {
    level: "Normal",
    risk: "low" as const,
    color: "#2563eb",
    effects: "Comfortable temperature range.",
    guidance: "Normal seasonal activities.",
  };
}

function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Light drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Partly cloudy";
}

let cachedProvinces: ProvinceMaster[] | null = null;
function getProvinces(): ProvinceMaster[] {
  if (cachedProvinces) return cachedProvinces;
  try {
    const file = join(process.cwd(), "public", "data", "provinces-master.json");
    cachedProvinces = JSON.parse(readFileSync(file, "utf8")) as ProvinceMaster[];
    return cachedProvinces;
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceSlug = searchParams.get("province")?.toLowerCase().trim();

    let lat = parseFloat(searchParams.get("lat") || "");
    let lon = parseFloat(searchParams.get("lon") || "");
    let provinceName = "Metro Manila";

    if (provinceSlug) {
      const provinces = getProvinces();
      const matched = provinces.find((p) => p.slug === provinceSlug);
      if (matched) {
        lat = matched.centroid[1];
        lon = matched.centroid[0];
        provinceName = matched.name;
      }
    }

    // Default to Manila if coordinates are not valid numbers
    if (isNaN(lat) || isNaN(lon)) {
      lat = 14.5995;
      lon = 120.9842;
    }

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FManila`;

    const res = await fetch(openMeteoUrl, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "bantay-el-nino-web" },
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    const heatIndex = Math.round(current.apparent_temperature * 10) / 10;
    const pagasaAssessment = classifyPagasaHeatIndex(heatIndex);

    return NextResponse.json({
      location: {
        province: provinceName,
        latitude: lat,
        longitude: lon,
      },
      current: {
        temperatureC: Math.round(current.temperature_2m * 10) / 10,
        feelsLikeC: heatIndex,
        relativeHumidityPercent: current.relative_humidity_2m,
        precipitationMm: current.precipitation,
        windSpeedKmh: current.wind_speed_10m,
        weatherCode: current.weather_code,
        condition: getWeatherCondition(current.weather_code),
        observedAt: current.time,
      },
      heatIndex: {
        indexC: heatIndex,
        classification: pagasaAssessment.level,
        risk: pagasaAssessment.risk,
        effects: pagasaAssessment.effects,
        guidance: pagasaAssessment.guidance,
      },
      source: "Open-Meteo & DOST-PAGASA Heat Index Classification Standards",
      cachedForSeconds: 3600,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
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
    console.error("Error fetching live weather:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch live weather readings",
        fallback: {
          location: { province: "Philippines" },
          current: {
            temperatureC: 31.5,
            feelsLikeC: 38.0,
            relativeHumidityPercent: 78,
            precipitationMm: 0,
            condition: "Partly cloudy",
          },
          heatIndex: {
            indexC: 38.0,
            classification: "Extreme Caution",
            risk: "moderate",
            guidance: "Stay hydrated and avoid peak afternoon sun exposure.",
          },
          source: "Historical baseline fallback",
        },
      },
      { status: 200 } // Graceful fallback
    );
  }
}
