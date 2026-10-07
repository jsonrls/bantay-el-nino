/**
 * scripts/gather-agriculture-water.mjs
 *
 * Gathers and builds agricultural and water reservoir datasets for Bantay El Niño:
 * 1. public/data/crops.json - In-depth Philippine crop profiles & vulnerability specs
 * 2. public/data/crop-vulnerability.json - Province/regional agricultural vulnerability matrix
 * 3. public/data/dams-status.json - Detailed reservoir status, rule curves, and water allocations
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "public", "data");

const CROPS_DATA = [
  {
    id: "crop-rice",
    name: "Rice (Palay)",
    scientificName: "Oryza sativa",
    tagalogName: "Palay",
    category: "Cereal Grain / Staple",
    nationalShareGvaPercent: 19.5,
    harvestAreaHectares: 4800000,
    annualProductionMt: 20000000,
    waterRequirementMm: "1,000 – 1,500 mm per cropping season (6–10 mm/day)",
    droughtSensitivity: "High to Extreme",
    rainfedVulnerabilityShare: 35.8, // percent of total palay area that is rainfed and highly exposed
    criticalGrowthStages: [
      {
        stage: "Reproductive (Panicle Initiation to Flowering)",
        timing: "Days 45 to 75 after transplanting",
        impactOfWaterDeficit: "Severe spikelet sterility, unfilled grains, and up to 70% yield loss if dry for 10+ consecutive days.",
      },
      {
        stage: "Early Vegetative (Tillering)",
        timing: "Days 15 to 40",
        impactOfWaterDeficit: "Reduced tiller count and delayed maturity; reversible if rain resumes.",
      },
    ],
    topProducingProvinces: [
      { province: "Nueva Ecija", region: "Region III", sharePercent: 9.8, irrigationType: "High (UPRIIS fed)" },
      { province: "Isabela", region: "Region II", sharePercent: 7.2, irrigationType: "High (MARIIS fed)" },
      { province: "Pangasinan", region: "Region I", sharePercent: 6.1, irrigationType: "Moderate (San Roque & pumps)" },
      { province: "Cagayan", region: "Region II", sharePercent: 5.4, irrigationType: "Moderate" },
      { province: "Iloilo", region: "Region VI", sharePercent: 5.1, irrigationType: "Moderate (heavily rainfed until Jalaur full operation)" },
      { province: "Camarines Sur", region: "Region V", sharePercent: 3.8, irrigationType: "Moderate" },
      { province: "Tarlac", region: "Region III", sharePercent: 3.5, irrigationType: "High" },
      { province: "Leyte", region: "Region VIII", sharePercent: 3.1, irrigationType: "Moderate" },
      { province: "Bukidnon", region: "Region X", sharePercent: 2.8, irrigationType: "Moderate (river diversion)" },
      { province: "Maguindanao del Sur", region: "BARMM", sharePercent: 2.6, irrigationType: "Low / Rainfed" },
    ],
    recommendedMitigations: [
      "Adopt Alternate Wetting and Drying (AWD) water-saving technique (reduces water use by 20–30% without yield loss).",
      "Shift to early-maturing and drought-tolerant seed varieties (e.g., NSIC Rc192 'Sahod Ulan 1', NSIC Rc222, NSIC Rc480).",
      "Adjust planting calendar to align with localized PAGASA seasonal rainfall forecast.",
      "Construct farm reservoirs and repair earthen canal embankments to minimize conveyance loss.",
    ],
  },
  {
    id: "crop-corn",
    name: "Corn (Maize)",
    scientificName: "Zea mays",
    tagalogName: "Mais",
    category: "Feed & Cereal Staple",
    nationalShareGvaPercent: 6.8,
    harvestAreaHectares: 2500000,
    annualProductionMt: 8200000,
    waterRequirementMm: "500 – 800 mm per cropping cycle (4–7 mm/day)",
    droughtSensitivity: "High",
    rainfedVulnerabilityShare: 88.0, // Almost all Philippine corn is rainfed upland
    criticalGrowthStages: [
      {
        stage: "Tasseling and Silking (Flowering)",
        timing: "Days 45 to 65 after emergence",
        impactOfWaterDeficit: "Tassel dehydration and delayed silking causes asynchrony; pollen dies quickly in >36°C heat, causing completely barren cobs.",
      },
      {
        stage: "Grain Filling (Blister & Dough stage)",
        timing: "Days 65 to 85",
        impactOfWaterDeficit: "Premature dry-down and shriveled kernels, reducing test weight by 30–50%.",
      },
    ],
    topProducingProvinces: [
      { province: "Isabela", region: "Region II", sharePercent: 18.5, irrigationType: "Rainfed Upland" },
      { province: "Bukidnon", region: "Region X", sharePercent: 12.4, irrigationType: "Rainfed Upland" },
      { province: "Pangasinan", region: "Region I", sharePercent: 6.8, irrigationType: "Supplemental Shallow Tube Well" },
      { province: "Cagayan", region: "Region II", sharePercent: 6.2, irrigationType: "Rainfed Upland" },
      { province: "South Cotabato", region: "Region XII", sharePercent: 5.5, irrigationType: "Rainfed Upland" },
      { province: "Cotabato", region: "Region XII", sharePercent: 5.1, irrigationType: "Rainfed Upland" },
      { province: "Maguindanao del Norte", region: "BARMM", sharePercent: 4.2, irrigationType: "Rainfed Upland" },
    ],
    recommendedMitigations: [
      "Plant drought-tolerant yellow corn hybrids with deep rooting traits.",
      "Practice zero-tillage with thick crop residue mulch to conserve soil moisture.",
      "Apply supplemental irrigation during the critical 10-day flowering window using small solar water pumps.",
      "Intercrop with short-duration drought legumes (mungbean/cowpea) to spread financial risk.",
    ],
  },
  {
    id: "crop-coconut",
    name: "Coconut",
    scientificName: "Cocos nucifera",
    tagalogName: "Niyog",
    category: "Industrial Tree Crop / Export",
    nationalShareGvaPercent: 4.8,
    harvestAreaHectares: 3650000,
    annualProductionMt: 14900000,
    waterRequirementMm: "1,500 – 2,500 mm annually evenly distributed",
    droughtSensitivity: "Moderate (Short-term) / High (Long-term due to lag)",
    rainfedVulnerabilityShare: 96.0,
    criticalGrowthStages: [
      {
        stage: "Inflorescence Development & Button Stage",
        timing: "8 to 12 months before nut harvest",
        impactOfWaterDeficit: "Button shedding (premature nut drop). Reduced rainfall creates an 8–12 month lagged production drop.",
      },
      {
        stage: "Mature Palm Canopy Maintenance",
        timing: "Continuous",
        impactOfWaterDeficit: "Drooping and browning of lower fronds, bunch breakage, and stunted nut meat development.",
      },
    ],
    topProducingProvinces: [
      { province: "Davao Oriental", region: "Region XI", sharePercent: 7.8, irrigationType: "Rainfed Coastal/Hills" },
      { province: "Quezon", region: "Region IV-A", sharePercent: 6.9, irrigationType: "Rainfed Coastal/Hills" },
      { province: "Zamboanga del Norte", region: "Region IX", sharePercent: 5.8, irrigationType: "Rainfed Coastal" },
      { province: "Leyte", region: "Region VIII", sharePercent: 4.9, irrigationType: "Rainfed Coastal" },
      { province: "Misamis Oriental", region: "Region X", sharePercent: 4.4, irrigationType: "Rainfed Coastal" },
      { province: "Davao del Sur", region: "Region XI", sharePercent: 4.1, irrigationType: "Rainfed Coastal" },
      { province: "Camarines Sur", region: "Region V", sharePercent: 3.9, irrigationType: "Rainfed Coastal" },
    ],
    recommendedMitigations: [
      "Ring-weeding and mulching the base of coconut palms with coir dust and pruned fronds (1.5–2m radius).",
      "Avoid slash-and-burn underbrush clearance under coconut stands to preserve natural soil moisture.",
      "Apply potassium chloride fertilizer to boost palm stomatal regulation and drought tolerance.",
    ],
  },
  {
    id: "crop-sugarcane",
    name: "Sugarcane",
    scientificName: "Saccharum officinarum",
    tagalogName: "Tubo",
    category: "Commercial Industrial Crop",
    nationalShareGvaPercent: 2.5,
    harvestAreaHectares: 395000,
    annualProductionMt: 21000000,
    waterRequirementMm: "1,500 – 2,000 mm over 10–12 month cycle",
    droughtSensitivity: "High",
    rainfedVulnerabilityShare: 72.0,
    criticalGrowthStages: [
      {
        stage: "Formative & Tillering Phase",
        timing: "Months 2 to 4 after planting/ratooning",
        impactOfWaterDeficit: "Drastic suppression of shoot and stalk population, leaf rolling, and permanently stunted internodes.",
      },
      {
        stage: "Grand Growth Phase (Stalk Elongation)",
        timing: "Months 5 to 8",
        impactOfWaterDeficit: "Reduced cane tonnage per hectare, though brix (% sugar content) may temporarily concentrate.",
      },
    ],
    topProducingProvinces: [
      { province: "Negros Occidental", region: "Region VI", sharePercent: 52.4, irrigationType: "Mostly Rainfed" },
      { province: "Bukidnon", region: "Region X", sharePercent: 14.1, irrigationType: "Rainfed Plateau" },
      { province: "Batangas", region: "Region IV-A", sharePercent: 7.2, irrigationType: "Rainfed / Supplemental" },
      { province: "Tarlac", region: "Region III", sharePercent: 5.8, irrigationType: "River Diversion / Pumps" },
      { province: "Iloilo", region: "Region VI", sharePercent: 4.5, irrigationType: "Rainfed" },
      { province: "Negros Oriental", region: "Region VII", sharePercent: 3.9, irrigationType: "Rainfed" },
    ],
    recommendedMitigations: [
      "Implement trash blanketing (leaving cane trash / dried leaves evenly spread over fields) to reduce soil evaporation by up to 40%.",
      "Prioritize furrow irrigation scheduling during the critical formative tillering window.",
      "Select drought-hardy varieties developed by the Sugar Regulatory Administration (SRA).",
    ],
  },
  {
    id: "crop-banana",
    name: "Banana",
    scientificName: "Musa acuminata",
    tagalogName: "Saging",
    category: "Fruit / Export & Domestic Food",
    nationalShareGvaPercent: 3.6,
    harvestAreaHectares: 445000,
    annualProductionMt: 9100000,
    waterRequirementMm: "1,200 – 2,200 mm annually (very continuous requirement)",
    droughtSensitivity: "High",
    rainfedVulnerabilityShare: 65.0, // Smallholders rainfed; export plantations drip-irrigated
    criticalGrowthStages: [
      {
        stage: "Floral Initiation & Shooting Stage",
        timing: "Months 6 to 9",
        impactOfWaterDeficit: "Choked emerging bunches, small and deformed fruit fingers, delayed harvest intervals.",
      },
    ],
    topProducingProvinces: [
      { province: "Davao del Norte", region: "Region XI", sharePercent: 21.0, irrigationType: "High (commercial drip)" },
      { province: "Bukidnon", region: "Region X", sharePercent: 13.5, irrigationType: "Moderate (commercial/rainfed)" },
      { province: "Davao de Oro", region: "Region XI", sharePercent: 9.8, irrigationType: "Moderate" },
      { province: "Cotabato", region: "Region XII", sharePercent: 6.2, irrigationType: "Rainfed Smallholder" },
      { province: "Maguindanao del Sur", region: "BARMM", sharePercent: 4.8, irrigationType: "Rainfed Smallholder" },
    ],
    recommendedMitigations: [
      "Heavy organic mulching around pseudostem root mat using banana leaves and pseudostem chips.",
      "Install micro-jet or drip irrigation systems to deliver water directly to the shallow root zone.",
      "Erect bamboo propping to prevent weak stems from toppling under dry canopy stress.",
    ],
  },
];

// Province-level crop vulnerability summary matrix
const PROVINCE_CROP_VULNERABILITY = [
  { province: "Cebu", region: "Region VII", primaryCrops: ["Corn", "Mango", "Vegetables"], rainfedRatio: 0.82, vulnerabilityLevel: "High", irrigationCoverage: "18% irrigated", mainRisk: "High dependence on rainfed upland corn; porous karst terrain causes rapid moisture drainage." },
  { province: "Iloilo", region: "Region VI", primaryCrops: ["Rice", "Corn", "Sugarcane"], rainfedRatio: 0.64, vulnerabilityLevel: "High", irrigationCoverage: "36% irrigated", mainRisk: "Western Visayas epicenter of 2023–24 El Niño drought; rainfed palay areas suffer severe panicle drying." },
  { province: "Negros Occidental", region: "Region VI", primaryCrops: ["Sugarcane", "Rice", "Corn"], rainfedRatio: 0.70, vulnerabilityLevel: "High", irrigationCoverage: "30% irrigated", mainRisk: "Sugarcane formative tillering requires continuous soil water; prolonged drought causes drastic tonnage reduction." },
  { province: "Occidental Mindoro", region: "MIMAROPA", primaryCrops: ["Rice", "Corn", "Onion"], rainfedRatio: 0.55, vulnerabilityLevel: "Extreme", irrigationCoverage: "45% irrigated", mainRisk: "Corona Type I climate with severe dry season; river flows plummet and pump aquifers rapidly drop." },
  { province: "Nueva Ecija", region: "Region III", primaryCrops: ["Rice", "Corn", "Onion"], rainfedRatio: 0.22, vulnerabilityLevel: "Moderate", irrigationCoverage: "78% irrigated (UPRIIS)", mainRisk: "Buffered by Pantabangan Dam, but water cutoffs occur if reservoir dips below rule curves." },
  { province: "Isabela", region: "Region II", primaryCrops: ["Corn", "Rice", "Banana"], rainfedRatio: 0.48, vulnerabilityLevel: "High", irrigationCoverage: "52% irrigated (MARIIS)", mainRisk: "Immense corn harvest areas are entirely rainfed; high heat indexes (>44°C) cause pollination failure." },
  { province: "Bukidnon", region: "Region X", primaryCrops: ["Corn", "Sugarcane", "Pineapple", "Banana"], rainfedRatio: 0.65, vulnerabilityLevel: "Moderate", irrigationCoverage: "35% irrigated", mainRisk: "Mindanao high plateau normally benefits from Type IV climate; prolonged drought shocks non-irrigated corn." },
  { province: "Pangasinan", region: "Region I", primaryCrops: ["Rice", "Corn", "Mango"], rainfedRatio: 0.38, vulnerabilityLevel: "High", irrigationCoverage: "62% irrigated", mainRisk: "Type I climate with intense dry spells; downstream Agno canal tail-enders frequently run dry." },
  { province: "Albay", region: "Region V", primaryCrops: ["Rice", "Coconut", "Abaca"], rainfedRatio: 0.62, vulnerabilityLevel: "Moderate", irrigationCoverage: "38% irrigated", mainRisk: "Bicol river basin buffering, but rainfed upland coconut and abaca experience flower drop." },
  { province: "Cotabato", region: "Region XII", primaryCrops: ["Rice", "Corn", "Rubber", "Oil Palm"], rainfedRatio: 0.72, vulnerabilityLevel: "High", irrigationCoverage: "28% irrigated", mainRisk: "Historical site of severe 2016 drought crisis; rainfed corn and palay experience total crop failure." },
];

// Detailed status indicators for major reservoirs
const DAMS_STATUS = [
  {
    damId: "dam-angat",
    name: "Angat Dam",
    currentLevelM: 204.6,
    normalHighWaterLevelM: 212.0,
    ruleCurveM: 210.0,
    deviationFromRuleM: -5.4,
    deviationPercent: -2.57,
    percentCapacity: 82.5,
    operationalStatus: "Watch",
    potableWaterAllocationM3s: 48.0, // Normal allocation to MWSS concessionaires
    irrigationAllocationM3s: 20.0, // Reduced allocation to Bustos/AMRIS
    potableSupplyRisk: "Moderate",
    irrigationSupplyRisk: "High",
    outlook: "Water allocation to Bulacan/Pampanga irrigation reduced to conserve drinking water pool for Metro Manila.",
  },
  {
    damId: "dam-magat",
    name: "Magat Dam",
    currentLevelM: 174.2,
    normalHighWaterLevelM: 193.0,
    ruleCurveM: 180.0,
    deviationFromRuleM: -5.8,
    deviationPercent: -3.22,
    percentCapacity: 69.4,
    operationalStatus: "Watch",
    potableWaterAllocationM3s: 0.0,
    irrigationAllocationM3s: 95.0,
    potableSupplyRisk: "Low",
    irrigationSupplyRisk: "High",
    outlook: "Water level is below seasonal rule curve. NIA implementing rotation schedule for MARIIS irrigation divisions.",
  },
  {
    damId: "dam-pantabangan",
    name: "Pantabangan Dam",
    currentLevelM: 189.5,
    normalHighWaterLevelM: 221.0,
    ruleCurveM: 200.0,
    deviationFromRuleM: -10.5,
    deviationPercent: -5.25,
    percentCapacity: 61.2,
    operationalStatus: "Watch",
    potableWaterAllocationM3s: 0.0,
    irrigationAllocationM3s: 140.0,
    potableSupplyRisk: "Low",
    irrigationSupplyRisk: "High",
    outlook: "Reservoir level is 31.5m below spilling level. UPRIIS advising farmers to practice Alternate Wetting & Drying.",
  },
  {
    damId: "dam-san-roque",
    name: "San Roque Dam",
    currentLevelM: 252.0,
    normalHighWaterLevelM: 280.0,
    ruleCurveM: 250.0,
    deviationFromRuleM: 2.0,
    deviationPercent: 0.8,
    percentCapacity: 70.3,
    operationalStatus: "Normal",
    potableWaterAllocationM3s: 0.0,
    irrigationAllocationM3s: 110.0,
    potableSupplyRisk: "Low",
    irrigationSupplyRisk: "Moderate",
    outlook: "Stable near rule curve, supported by controlled upstream releases from Ambuklao and Binga.",
  },
  {
    damId: "dam-la-mesa",
    name: "La Mesa Dam",
    currentLevelM: 77.8,
    normalHighWaterLevelM: 80.15,
    ruleCurveM: 79.0,
    deviationFromRuleM: -1.2,
    deviationPercent: -1.52,
    percentCapacity: 84.1,
    operationalStatus: "Watch",
    potableWaterAllocationM3s: 16.0,
    irrigationAllocationM3s: 0.0,
    potableSupplyRisk: "Moderate",
    irrigationSupplyRisk: "Low",
    outlook: "Water buffer is stable with steady conveyance from Ipo Dam, but vulnerable if Angat release drops.",
  },
];

function main() {
  console.log("=== STEP 1: Writing Crops Dataset ===");
  writeFileSync(join(DATA_DIR, "crops.json"), JSON.stringify(CROPS_DATA, null, 2));
  console.log(`Saved ${CROPS_DATA.length} major crop profiles to crops.json`);

  console.log("\n=== STEP 2: Writing Crop Vulnerability Matrix ===");
  writeFileSync(join(DATA_DIR, "crop-vulnerability.json"), JSON.stringify(PROVINCE_CROP_VULNERABILITY, null, 2));
  console.log(`Saved ${PROVINCE_CROP_VULNERABILITY.length} province vulnerability entries to crop-vulnerability.json`);

  console.log("\n=== STEP 3: Writing Dams Status Dataset ===");
  writeFileSync(join(DATA_DIR, "dams-status.json"), JSON.stringify(DAMS_STATUS, null, 2));
  console.log(`Saved ${DAMS_STATUS.length} reservoir monitoring entries to dams-status.json`);

  console.log("\n=== AGRICULTURE & WATER DATASETS GATHERED SUCCESSFULLY! ===");
}

main();
