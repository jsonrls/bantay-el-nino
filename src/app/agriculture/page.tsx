import type { Metadata } from "next";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { AgricultureView, type CropVulnerabilityEntry } from "./agriculture-view";
import type { CropInfo } from "@/lib/types";

export const metadata: Metadata = {
  title: "Agriculture & El Niño",
  description:
    "Assess crop vulnerabilities, critical growth stages, and drought mitigation practices for Philippine agriculture during El Niño.",
};

function getAgricultureData() {
  const dataDir = join(process.cwd(), "public", "data");
  let crops: CropInfo[] = [];
  let vulnerabilities: CropVulnerabilityEntry[] = [];

  try {
    const cropsPath = join(dataDir, "crops.json");
    if (existsSync(cropsPath)) {
      crops = JSON.parse(readFileSync(cropsPath, "utf8")) as CropInfo[];
    }
    const vulnPath = join(dataDir, "crop-vulnerability.json");
    if (existsSync(vulnPath)) {
      vulnerabilities = JSON.parse(readFileSync(vulnPath, "utf8"));
    }
  } catch (err) {
    console.warn("Could not load agriculture datasets:", err);
  }

  return { crops, vulnerabilities };
}

export default function AgriculturePage() {
  const { crops, vulnerabilities } = getAgricultureData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          Food Security & Crops
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Agriculture & El Niño
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Identify water stress risks across major Philippine crops (Rice, Corn, Coconut,
          Sugarcane, Banana) and review verified agronomic mitigation practices.
        </p>
      </div>

      <AgricultureView crops={crops} vulnerabilities={vulnerabilities} />
    </div>
  );
}
