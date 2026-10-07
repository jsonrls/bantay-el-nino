import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";


export async function GET() {
  try {
    const dataDir = join(process.cwd(), "public", "data");
    const damsFile = join(dataDir, "dams.json");
    const statusFile = join(dataDir, "dams-status.json");

    const dams = JSON.parse(readFileSync(damsFile, "utf8"));
    const status = JSON.parse(readFileSync(statusFile, "utf8"));

    const combined = dams.map((d: { id: string }) => {
      const live = status.find((s: { damId: string }) => s.damId === d.id);
      return {
        ...d,
        ...(live || {}),
      };
    });

    return NextResponse.json({
      dams: combined,
      bulletinTime: "06:00 AM PHT Daily",
      source: "DOST-PAGASA Hydrometeorological Division & National Irrigation Administration",
      cachedForSeconds: 86400,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800",
      },
    });
  } catch (err) {
    console.error("Error reading dam status:", err);
    return NextResponse.json({ error: "Failed to load dam records" }, { status: 500 });
  }
}
