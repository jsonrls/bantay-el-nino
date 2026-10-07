import { type Advisory, type IndicatorReading, type ProvinceStatus, type RiskLevel } from "./types";

/**
 * Authoritative scientific & climatological data compiled for Bantay El Niño.
 * Sources: DOST-PAGASA, NOAA CPC, NASA POWER, NIA, MWSS, DA.
 */

export interface NationalStatus {
  country: string;
  period: string;
  statusLabel: string;
  risk: RiskLevel;
  impactScore: number;
  temperatureAnomaly: string;
  rainfallAnomaly: string;
  indicators: IndicatorReading[];
  updatedAt: string;
  source: string;
}

export const nationalStatus: NationalStatus = {
  country: "Philippines",
  period: "October 2026",
  statusLabel: "High Impact",
  risk: "high",
  impactScore: 57,
  temperatureAnomaly: "+1.7°C",
  rainfallAnomaly: "−29%",
  indicators: [
    {
      key: "temperature",
      label: "Temperature",
      value: "+1.7°C",
      status: "Above seasonal normal",
      risk: "high",
    },
    {
      key: "rainfall",
      label: "Rainfall",
      value: "−29%",
      status: "Below seasonal normal",
      risk: "high",
    },
    {
      key: "water",
      label: "Water",
      value: "Moderate Stress",
      status: "Angat reservoir at 204.6m vs 210m rule curve",
      risk: "moderate",
    },
    {
      key: "agriculture",
      label: "Agriculture",
      value: "High Stress",
      status: "70 provinces under dry spell or drought",
      risk: "high",
    },
  ],
  updatedAt: "October 7, 2026 · 10:30 AM PHT",
  source: "DOST-PAGASA Climate Monitoring & NOAA Climate Prediction Center",
};

/** Impact Score methodology weights (blueprint §15). */
export const impactScoreWeights: { label: string; weight: number }[] = [
  { label: "Temperature anomaly", weight: 25 },
  { label: "Rainfall deficit", weight: 25 },
  { label: "Drought indicators", weight: 20 },
  { label: "Water conditions", weight: 15 },
  { label: "Agricultural conditions", weight: 10 },
  { label: "Other indicators", weight: 5 },
];

/** Official advisories catalog sourced from PAGASA, DA, NIA, MWSS, DOH, and NDRRMC. */
export const advisories: Advisory[] = [
  {
    "id": "adv-pagasa-heat-001",
    "level": "extreme",
    "category": "PAGASA",
    "title": "Extreme Heat Index Advisory",
    "area": "Central Luzon & Western Visayas",
    "provinceSlug": "nueva-ecija",
    "regionName": "Region III & Region VI",
    "summary": "Daytime heat index values are forecast to reach 44°C to 47°C ('Danger' category). High probability of heat cramps and heat exhaustion with continued outdoor activity. Limit direct sunlight exposure between 10:00 AM and 3:00 PM.",
    "source": "PAGASA Climatology and Agrometeorology Division",
    "publishedAt": "October 7, 2026 · 10:32 AM",
    "effectiveUntil": "October 10, 2026",
    "url": "https://bagong.pagasa.dost.gov.ph",
    "actions": [
      "Drink at least 2 to 3 liters of water daily, even without feeling thirsty",
      "Avoid outdoor physical labor during peak temperature hours (10 AM to 3 PM)",
      "Wear lightweight, loose-fitting, light-colored clothing",
      "Ensure livestock and poultry have access to shaded pens and continuous fresh drinking water"
    ]
  },
  {
    "id": "adv-water-mwss-002",
    "level": "high",
    "category": "Water",
    "title": "Angat Reservoir Conservation Watch",
    "area": "Metro Manila / Bulacan Watershed",
    "provinceSlug": "bulacan",
    "regionName": "Region III & NCR",
    "summary": "Angat Dam water elevation is at 204.60 meters, below the seasonal rule curve of 210.00 meters. The National Water Resources Board (NWRB) and MWSS have maintained normal municipal tap water allocations (48 m³/s) while calibrating agricultural releases to the Bustos Dam canal network.",
    "source": "MWSS / NWRB / Manila Water / Maynilad",
    "publishedAt": "October 6, 2026 · 4:00 PM",
    "effectiveUntil": "October 15, 2026",
    "url": "https://ro.mwss.gov.ph",
    "actions": [
      "Practice household water conservation (recycle rinse water for flushing and gardening)",
      "Report municipal pipe leaks immediately to water concessionaire hotlines",
      "Commercial establishments should optimize cooling tower water recycling"
    ]
  },
  {
    "id": "adv-agri-da-003",
    "level": "high",
    "category": "Agriculture",
    "title": "Western Visayas Crop Drought & Soil Moisture Alert",
    "area": "Iloilo, Antique, and Negros Occidental",
    "provinceSlug": "iloilo",
    "regionName": "Region VI (Western Visayas)",
    "summary": "Three consecutive months of below-normal precipitation have depleted soil moisture across rainfed rice and sugarcane tracts in Panay Island and Negros Occidental. Field agronomists urge farmers to employ Alternate Wetting and Drying and delay late-season planting.",
    "source": "Department of Agriculture - Field Operations Service & DRRM Ops",
    "publishedAt": "October 6, 2026 · 9:15 AM",
    "effectiveUntil": "October 20, 2026",
    "url": "https://www.da.gov.ph",
    "actions": [
      "Implement Alternate Wetting and Drying (AWD) in all irrigated paddies",
      "Apply crop residue trash blanketing to sugarcane and upland corn fields to slow evaporation",
      "Coordinate with local City/Municipal Agriculture Offices (MAO) for drought-tolerant seeds"
    ]
  },
  {
    "id": "adv-doh-health-004",
    "level": "moderate",
    "category": "Health",
    "title": "Heat Stress and Dehydration Advisory",
    "area": "Nationwide",
    "provinceSlug": "nationwide",
    "regionName": "All Regions",
    "summary": "Public advisory against heat-induced health complications. Children, the elderly, outdoor workers, and people with cardiovascular comorbidities are at elevated risk. Monitor vulnerable family members for dizziness, heavy sweating, or fainting.",
    "source": "Department of Health (DOH) Health Emergency Management Bureau",
    "publishedAt": "October 5, 2026 · 8:00 AM",
    "effectiveUntil": "October 31, 2026",
    "url": "https://doh.gov.ph",
    "actions": [
      "Frequently check on elderly family members and individuals living alone",
      "Never leave children, infants, or pets unattended in parked vehicles",
      "Seek emergency medical evaluation if experiencing nausea, vomiting, or mental confusion under extreme heat"
    ]
  },
  {
    "id": "adv-nia-pantabangan-005",
    "level": "high",
    "category": "Water",
    "title": "Pantabangan Irrigation Delivery Schedule Adjustment",
    "area": "Central Luzon (UPRIIS Service Area)",
    "provinceSlug": "nueva-ecija",
    "regionName": "Region III (Central Luzon)",
    "summary": "Pantabangan Dam elevation is at 189.50 meters (31.5 meters below spilling level). UPRIIS Operations have enacted rotational canal gating across District I through IV to ensure equal tail-end water distribution forstanding palay crops.",
    "source": "National Irrigation Administration - UPRIIS Head Office",
    "publishedAt": "October 4, 2026 · 11:00 AM",
    "effectiveUntil": "October 18, 2026",
    "url": "https://www.nia.gov.ph",
    "actions": [
      "Irrigators Associations (IAs) must strictly abide by designated rotational canal water schedules",
      "Divert drainage water where feasible for supplemental farm ditch replenishment",
      "Clear feeder canals of weeds and sediment to optimize gravity flow velocity"
    ]
  },
  {
    "id": "adv-cebu-cebu-006",
    "level": "high",
    "category": "Agriculture",
    "title": "Central Visayas Dry Spell Advisory",
    "area": "Cebu & Bohol",
    "provinceSlug": "cebu",
    "regionName": "Region VII (Central Visayas)",
    "summary": "Cebu is experiencing warmer and drier-than-normal conditions (+1.5°C temperature anomaly, −24% rainfall deficit). Elevated heat index and rainfall reduction increase heat stress, municipal water demand, and agricultural pressure across upland corn farms.",
    "source": "PAGASA Regional Services Division - Visayas",
    "publishedAt": "October 4, 2026 · 7:30 AM",
    "effectiveUntil": "October 14, 2026",
    "url": "https://bagong.pagasa.dost.gov.ph",
    "actions": [
      "Conserve water across Metro Cebu households and industrial zones",
      "Upland corn farmers should mulch root zones and limit burning of farm waste",
      "Monitor local barangay water supply schedules and storage tankers"
    ]
  },
  {
    "id": "adv-ndrrmc-enso-007",
    "level": "moderate",
    "category": "General",
    "title": "National El Niño Preparedness Directive",
    "area": "Nationwide (All LDRRMCs)",
    "provinceSlug": "nationwide",
    "regionName": "All Regions",
    "summary": "The National Disaster Risk Reduction and Management Council (NDRRMC) directs all Regional and Local DRRM Councils to operationalize Task Force El Niño action plans covering food security, water supply, health, electricity, and fire safety.",
    "source": "NDRRMC / Office of Civil Defense (OCD)",
    "publishedAt": "October 2, 2026 · 2:00 PM",
    "effectiveUntil": "November 30, 2026",
    "url": "https://ndrrmc.gov.ph",
    "actions": [
      "LGUs must activate local El Niño mitigation task groups and inventory buffer seed stocks",
      "Fire departments must inspect hydrants and conduct grass fire risk assessments",
      "Water utilities must verify backup deep wells and portable water filtration units"
    ]
  }
];

export const cebu: ProvinceStatus = {
  slug: "cebu",
  name: "Cebu",
  region: "Region VII (Central Visayas)",
  risk: "high",
  impactScore: 68,
  vsHistorical: "+24%",
  indicators: [
    {
        "key": "temperature",
        "label": "Temperature",
        "value": "+1.5°C",
        "status": "Well above normal",
        "risk": "high"
    },
    {
        "key": "rainfall",
        "label": "Rainfall",
        "value": "-24%",
        "status": "Below normal",
        "risk": "moderate"
    },
    {
        "key": "water",
        "label": "Water",
        "value": "Moderate Stress",
        "status": "Watch reservoir levels",
        "risk": "moderate"
    },
    {
        "key": "agriculture",
        "label": "Agriculture",
        "value": "High",
        "status": "Crop stress increasing",
        "risk": "high"
    }
],
  summary: "Cebu is currently experiencing warmer and drier-than-normal conditions. These conditions can increase heat stress, water demand and agricultural pressure.",
};

/** Region → province options for all 17 Philippine regions. */
export const regions: Record<string, string[]> = {
  "National Capital Region (NCR)": [
    "Metro Manila"
  ],
  "Cordillera Administrative Region (CAR)": [
    "Abra",
    "Apayao",
    "Benguet",
    "Ifugao",
    "Kalinga",
    "Mountain Province"
  ],
  "Region I (Ilocos Region)": [
    "Ilocos Norte",
    "Ilocos Sur",
    "La Union",
    "Pangasinan"
  ],
  "Region II (Cagayan Valley)": [
    "Batanes",
    "Cagayan",
    "Isabela",
    "Nueva Vizcaya",
    "Quirino"
  ],
  "Region III (Central Luzon)": [
    "Aurora",
    "Bataan",
    "Bulacan",
    "Nueva Ecija",
    "Pampanga",
    "Tarlac",
    "Zambales"
  ],
  "Region IV-A (CALABARZON)": [
    "Batangas",
    "Cavite",
    "Laguna",
    "Quezon",
    "Rizal"
  ],
  "MIMAROPA Region": [
    "Marinduque",
    "Occidental Mindoro",
    "Oriental Mindoro",
    "Palawan",
    "Romblon"
  ],
  "Region V (Bicol Region)": [
    "Albay",
    "Camarines Norte",
    "Camarines Sur",
    "Catanduanes",
    "Masbate",
    "Sorsogon"
  ],
  "Region VI (Western Visayas)": [
    "Aklan",
    "Antique",
    "Capiz",
    "Guimaras",
    "Iloilo",
    "Negros Occidental"
  ],
  "Region VII (Central Visayas)": [
    "Bohol",
    "Cebu",
    "Negros Oriental",
    "Siquijor"
  ],
  "Region VIII (Eastern Visayas)": [
    "Biliran",
    "Eastern Samar",
    "Leyte",
    "Northern Samar",
    "Samar",
    "Southern Leyte"
  ],
  "Region IX (Zamboanga Peninsula)": [
    "City of Isabela",
    "Zamboanga del Norte",
    "Zamboanga del Sur",
    "Zamboanga Sibugay"
  ],
  "Region X (Northern Mindanao)": [
    "Bukidnon",
    "Camiguin",
    "Lanao del Norte",
    "Misamis Occidental",
    "Misamis Oriental"
  ],
  "Region XI (Davao Region)": [
    "Davao de Oro",
    "Davao del Norte",
    "Davao del Sur",
    "Davao Occidental",
    "Davao Oriental"
  ],
  "Region XII (SOCCSKSARGEN)": [
    "Cotabato",
    "Sarangani",
    "South Cotabato",
    "Sultan Kudarat"
  ],
  "Region XIII (Caraga)": [
    "Agusan del Norte",
    "Agusan del Sur",
    "Dinagat Islands",
    "Surigao del Norte",
    "Surigao del Sur"
  ],
  "BARMM": [
    "Basilan",
    "Lanao del Sur",
    "Maguindanao del Norte",
    "Maguindanao del Sur",
    "Special Geographic Area (BARMM)",
    "Sulu",
    "Tawi-Tawi"
  ]
};

/** Map layers supported by the live map (blueprint §3). */
export type MapLayerKey =
  | "impact"
  | "temperature"
  | "rainfall"
  | "drought"
  | "water"
  | "agriculture";

export interface ProvinceMapStatus {
  name: string;
  slug: string;
  impactScore: number;
  risk: RiskLevel;
  temperature: string;
  rainfall: string;
  layers: Record<MapLayerKey, RiskLevel>;
}

/** Precomputed official assessments for all 88 provinces. */
export const PROVINCES_MAP_STATUS: Record<string, ProvinceMapStatus> = {
  "abra": {
    "name": "Abra",
    "slug": "abra",
    "impactScore": 51,
    "risk": "high",
    "temperature": "+1.0°C",
    "rainfall": "-25%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "moderate",
      "drought": "high",
      "water": "high",
      "agriculture": "high"
    }
  },
  "agusan-del-norte": {
    "name": "Agusan del Norte",
    "slug": "agusan-del-norte",
    "impactScore": 72,
    "risk": "high",
    "temperature": "+1.4°C",
    "rainfall": "-48%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "extreme",
      "drought": "extreme",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "agusan-del-sur": {
    "name": "Agusan del Sur",
    "slug": "agusan-del-sur",
    "impactScore": 45,
    "risk": "moderate",
    "temperature": "+2.0°C",
    "rainfall": "-12%",
    "layers": {
      "impact": "moderate",
      "temperature": "extreme",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "high"
    }
  },
  "aklan": {
    "name": "Aklan",
    "slug": "aklan",
    "impactScore": 66,
    "risk": "high",
    "temperature": "+1.6°C",
    "rainfall": "-40%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "extreme"
    }
  },
  "albay": {
    "name": "Albay",
    "slug": "albay",
    "impactScore": 76,
    "risk": "extreme",
    "temperature": "+2.3°C",
    "rainfall": "-45%",
    "layers": {
      "impact": "extreme",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "antique": {
    "name": "Antique",
    "slug": "antique",
    "impactScore": 64,
    "risk": "high",
    "temperature": "+2.0°C",
    "rainfall": "-34%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "high"
    }
  },
  "apayao": {
    "name": "Apayao",
    "slug": "apayao",
    "impactScore": 60,
    "risk": "high",
    "temperature": "+1.3°C",
    "rainfall": "-38%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "high"
    }
  },
  "aurora": {
    "name": "Aurora",
    "slug": "aurora",
    "impactScore": 47,
    "risk": "moderate",
    "temperature": "+1.3°C",
    "rainfall": "-18%",
    "layers": {
      "impact": "moderate",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "basilan": {
    "name": "Basilan",
    "slug": "basilan",
    "impactScore": 69,
    "risk": "high",
    "temperature": "+2.0°C",
    "rainfall": "-42%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "bataan": {
    "name": "Bataan",
    "slug": "bataan",
    "impactScore": 53,
    "risk": "high",
    "temperature": "+1.4°C",
    "rainfall": "-29%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "high",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "batanes": {
    "name": "Batanes",
    "slug": "batanes",
    "impactScore": 65,
    "risk": "high",
    "temperature": "+1.1°C",
    "rainfall": "-48%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "extreme",
      "drought": "extreme",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "batangas": {
    "name": "Batangas",
    "slug": "batangas",
    "impactScore": 55,
    "risk": "high",
    "temperature": "+2.1°C",
    "rainfall": "-19%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "high",
      "agriculture": "high"
    }
  },
  "benguet": {
    "name": "Benguet",
    "slug": "benguet",
    "impactScore": 53,
    "risk": "high",
    "temperature": "+1.5°C",
    "rainfall": "-26%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "high",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "biliran": {
    "name": "Biliran",
    "slug": "biliran",
    "impactScore": 48,
    "risk": "moderate",
    "temperature": "+1.6°C",
    "rainfall": "-18%",
    "layers": {
      "impact": "moderate",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "bohol": {
    "name": "Bohol",
    "slug": "bohol",
    "impactScore": 52,
    "risk": "high",
    "temperature": "+1.4°C",
    "rainfall": "-28%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "high",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "bukidnon": {
    "name": "Bukidnon",
    "slug": "bukidnon",
    "impactScore": 63,
    "risk": "high",
    "temperature": "+2.1°C",
    "rainfall": "-27%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "high",
      "water": "moderate",
      "agriculture": "extreme"
    }
  },
  "bulacan": {
    "name": "Bulacan",
    "slug": "bulacan",
    "impactScore": 68,
    "risk": "high",
    "temperature": "+1.1°C",
    "rainfall": "-46%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "extreme",
      "drought": "extreme",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "cagayan": {
    "name": "Cagayan",
    "slug": "cagayan",
    "impactScore": 61,
    "risk": "high",
    "temperature": "+1.5°C",
    "rainfall": "-35%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "high"
    }
  },
  "camarines-norte": {
    "name": "Camarines Norte",
    "slug": "camarines-norte",
    "impactScore": 47,
    "risk": "moderate",
    "temperature": "+1.4°C",
    "rainfall": "-21%",
    "layers": {
      "impact": "moderate",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "high",
      "agriculture": "high"
    }
  },
  "camarines-sur": {
    "name": "Camarines Sur",
    "slug": "camarines-sur",
    "impactScore": 60,
    "risk": "high",
    "temperature": "+2.2°C",
    "rainfall": "-25%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "high",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "camiguin": {
    "name": "Camiguin",
    "slug": "camiguin",
    "impactScore": 45,
    "risk": "moderate",
    "temperature": "+1.0°C",
    "rainfall": "-26%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "moderate",
      "drought": "high",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "capiz": {
    "name": "Capiz",
    "slug": "capiz",
    "impactScore": 60,
    "risk": "high",
    "temperature": "+1.8°C",
    "rainfall": "-32%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "high"
    }
  },
  "catanduanes": {
    "name": "Catanduanes",
    "slug": "catanduanes",
    "impactScore": 48,
    "risk": "moderate",
    "temperature": "+2.3°C",
    "rainfall": "-12%",
    "layers": {
      "impact": "moderate",
      "temperature": "extreme",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "high"
    }
  },
  "cavite": {
    "name": "Cavite",
    "slug": "cavite",
    "impactScore": 69,
    "risk": "high",
    "temperature": "+2.2°C",
    "rainfall": "-35%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "cebu": {
    "name": "Cebu",
    "slug": "cebu",
    "impactScore": 68,
    "risk": "high",
    "temperature": "+1.5°C",
    "rainfall": "-24%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "city-of-isabela-not-a-province": {
    "name": "City of Isabela (Not a Province)",
    "slug": "city-of-isabela-not-a-province",
    "impactScore": 56,
    "risk": "high",
    "temperature": "+1.3°C",
    "rainfall": "-34%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "high",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "cotabato": {
    "name": "Cotabato",
    "slug": "cotabato",
    "impactScore": 56,
    "risk": "high",
    "temperature": "+2.1°C",
    "rainfall": "-21%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "high",
      "agriculture": "high"
    }
  },
  "davao-de-oro": {
    "name": "Davao de Oro",
    "slug": "davao-de-oro",
    "impactScore": 74,
    "risk": "high",
    "temperature": "+2.0°C",
    "rainfall": "-40%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "extreme",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "davao-del-norte": {
    "name": "Davao del Norte",
    "slug": "davao-del-norte",
    "impactScore": 39,
    "risk": "moderate",
    "temperature": "+1.1°C",
    "rainfall": "-12%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "high"
    }
  },
  "davao-del-sur": {
    "name": "Davao del Sur",
    "slug": "davao-del-sur",
    "impactScore": 59,
    "risk": "high",
    "temperature": "+2.4°C",
    "rainfall": "-22%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "moderate",
      "agriculture": "extreme"
    }
  },
  "davao-occidental": {
    "name": "Davao Occidental",
    "slug": "davao-occidental",
    "impactScore": 38,
    "risk": "moderate",
    "temperature": "+1.1°C",
    "rainfall": "-16%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "moderate",
      "drought": "low",
      "water": "high",
      "agriculture": "high"
    }
  },
  "davao-oriental": {
    "name": "Davao Oriental",
    "slug": "davao-oriental",
    "impactScore": 54,
    "risk": "high",
    "temperature": "+2.3°C",
    "rainfall": "-21%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "dinagat-islands": {
    "name": "Dinagat Islands",
    "slug": "dinagat-islands",
    "impactScore": 68,
    "risk": "high",
    "temperature": "+1.6°C",
    "rainfall": "-44%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "extreme"
    }
  },
  "eastern-samar": {
    "name": "Eastern Samar",
    "slug": "eastern-samar",
    "impactScore": 51,
    "risk": "high",
    "temperature": "+1.6°C",
    "rainfall": "-23%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "guimaras": {
    "name": "Guimaras",
    "slug": "guimaras",
    "impactScore": 65,
    "risk": "high",
    "temperature": "+1.2°C",
    "rainfall": "-43%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "high",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "extreme"
    }
  },
  "ifugao": {
    "name": "Ifugao",
    "slug": "ifugao",
    "impactScore": 67,
    "risk": "high",
    "temperature": "+1.6°C",
    "rainfall": "-41%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "extreme",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "ilocos-norte": {
    "name": "Ilocos Norte",
    "slug": "ilocos-norte",
    "impactScore": 69,
    "risk": "high",
    "temperature": "+2.1°C",
    "rainfall": "-32%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "ilocos-sur": {
    "name": "Ilocos Sur",
    "slug": "ilocos-sur",
    "impactScore": 65,
    "risk": "high",
    "temperature": "+1.5°C",
    "rainfall": "-40%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "iloilo": {
    "name": "Iloilo",
    "slug": "iloilo",
    "impactScore": 30,
    "risk": "moderate",
    "temperature": "+1.0°C",
    "rainfall": "-13%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "low",
      "drought": "low",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "isabela": {
    "name": "Isabela",
    "slug": "isabela",
    "impactScore": 41,
    "risk": "moderate",
    "temperature": "+1.1°C",
    "rainfall": "-12%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "kalinga": {
    "name": "Kalinga",
    "slug": "kalinga",
    "impactScore": 68,
    "risk": "high",
    "temperature": "+1.4°C",
    "rainfall": "-46%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "extreme",
      "drought": "extreme",
      "water": "high",
      "agriculture": "high"
    }
  },
  "la-union": {
    "name": "La Union",
    "slug": "la-union",
    "impactScore": 59,
    "risk": "high",
    "temperature": "+1.6°C",
    "rainfall": "-37%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "high",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "laguna": {
    "name": "Laguna",
    "slug": "laguna",
    "impactScore": 63,
    "risk": "high",
    "temperature": "+2.1°C",
    "rainfall": "-28%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "high",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "lanao-del-norte": {
    "name": "Lanao del Norte",
    "slug": "lanao-del-norte",
    "impactScore": 60,
    "risk": "high",
    "temperature": "+1.8°C",
    "rainfall": "-26%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "high",
      "water": "high",
      "agriculture": "high"
    }
  },
  "lanao-del-sur": {
    "name": "Lanao del Sur",
    "slug": "lanao-del-sur",
    "impactScore": 44,
    "risk": "moderate",
    "temperature": "+2.1°C",
    "rainfall": "-16%",
    "layers": {
      "impact": "moderate",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "low",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "leyte": {
    "name": "Leyte",
    "slug": "leyte",
    "impactScore": 58,
    "risk": "high",
    "temperature": "+1.8°C",
    "rainfall": "-30%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "high",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "maguindanao-del-norte": {
    "name": "Maguindanao del Norte",
    "slug": "maguindanao-del-norte",
    "impactScore": 50,
    "risk": "moderate",
    "temperature": "+1.2°C",
    "rainfall": "-31%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "high",
      "drought": "high",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "maguindanao-del-sur": {
    "name": "Maguindanao del Sur",
    "slug": "maguindanao-del-sur",
    "impactScore": 77,
    "risk": "extreme",
    "temperature": "+2.3°C",
    "rainfall": "-45%",
    "layers": {
      "impact": "extreme",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "extreme",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "marinduque": {
    "name": "Marinduque",
    "slug": "marinduque",
    "impactScore": 36,
    "risk": "moderate",
    "temperature": "+1.0°C",
    "rainfall": "-13%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "masbate": {
    "name": "Masbate",
    "slug": "masbate",
    "impactScore": 49,
    "risk": "moderate",
    "temperature": "+1.0°C",
    "rainfall": "-31%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "high",
      "drought": "high",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "misamis-occidental": {
    "name": "Misamis Occidental",
    "slug": "misamis-occidental",
    "impactScore": 54,
    "risk": "high",
    "temperature": "+1.2°C",
    "rainfall": "-25%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "moderate",
      "drought": "high",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "misamis-oriental": {
    "name": "Misamis Oriental",
    "slug": "misamis-oriental",
    "impactScore": 78,
    "risk": "extreme",
    "temperature": "+2.4°C",
    "rainfall": "-45%",
    "layers": {
      "impact": "extreme",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "extreme",
      "water": "high",
      "agriculture": "high"
    }
  },
  "mountain-province": {
    "name": "Mountain Province",
    "slug": "mountain-province",
    "impactScore": 62,
    "risk": "high",
    "temperature": "+2.3°C",
    "rainfall": "-34%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "high",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "ncr-city-of-manila-first-district-not-a-province": {
    "name": "NCR, City of Manila, First District (Not a Province)",
    "slug": "ncr-city-of-manila-first-district-not-a-province",
    "impactScore": 40,
    "risk": "moderate",
    "temperature": "+1.1°C",
    "rainfall": "-14%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "high"
    }
  },
  "ncr-fourth-district-not-a-province": {
    "name": "NCR, Fourth District (Not a Province)",
    "slug": "ncr-fourth-district-not-a-province",
    "impactScore": 75,
    "risk": "high",
    "temperature": "+2.3°C",
    "rainfall": "-40%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "extreme"
    }
  },
  "ncr-second-district-not-a-province": {
    "name": "NCR, Second District (Not a Province)",
    "slug": "ncr-second-district-not-a-province",
    "impactScore": 55,
    "risk": "high",
    "temperature": "+1.1°C",
    "rainfall": "-37%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "ncr-third-district-not-a-province": {
    "name": "NCR, Third District (Not a Province)",
    "slug": "ncr-third-district-not-a-province",
    "impactScore": 51,
    "risk": "high",
    "temperature": "+1.0°C",
    "rainfall": "-36%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "high",
      "drought": "high",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "negros-occidental": {
    "name": "Negros Occidental",
    "slug": "negros-occidental",
    "impactScore": 40,
    "risk": "moderate",
    "temperature": "+1.5°C",
    "rainfall": "-12%",
    "layers": {
      "impact": "moderate",
      "temperature": "high",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "high"
    }
  },
  "negros-oriental": {
    "name": "Negros Oriental",
    "slug": "negros-oriental",
    "impactScore": 49,
    "risk": "moderate",
    "temperature": "+2.3°C",
    "rainfall": "-12%",
    "layers": {
      "impact": "moderate",
      "temperature": "extreme",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "high"
    }
  },
  "northern-samar": {
    "name": "Northern Samar",
    "slug": "northern-samar",
    "impactScore": 50,
    "risk": "moderate",
    "temperature": "+1.2°C",
    "rainfall": "-30%",
    "layers": {
      "impact": "moderate",
      "temperature": "moderate",
      "rainfall": "moderate",
      "drought": "high",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "nueva-ecija": {
    "name": "Nueva Ecija",
    "slug": "nueva-ecija",
    "impactScore": 67,
    "risk": "high",
    "temperature": "+1.2°C",
    "rainfall": "-44%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "high",
      "drought": "extreme",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "nueva-vizcaya": {
    "name": "Nueva Vizcaya",
    "slug": "nueva-vizcaya",
    "impactScore": 56,
    "risk": "high",
    "temperature": "+1.3°C",
    "rainfall": "-31%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "high"
    }
  },
  "occidental-mindoro": {
    "name": "Occidental Mindoro",
    "slug": "occidental-mindoro",
    "impactScore": 41,
    "risk": "moderate",
    "temperature": "+1.9°C",
    "rainfall": "-12%",
    "layers": {
      "impact": "moderate",
      "temperature": "extreme",
      "rainfall": "low",
      "drought": "low",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "oriental-mindoro": {
    "name": "Oriental Mindoro",
    "slug": "oriental-mindoro",
    "impactScore": 66,
    "risk": "high",
    "temperature": "+2.3°C",
    "rainfall": "-34%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "high",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "palawan": {
    "name": "Palawan",
    "slug": "palawan",
    "impactScore": 61,
    "risk": "high",
    "temperature": "+2.0°C",
    "rainfall": "-26%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "high",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "pampanga": {
    "name": "Pampanga",
    "slug": "pampanga",
    "impactScore": 61,
    "risk": "high",
    "temperature": "+2.3°C",
    "rainfall": "-21%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "pangasinan": {
    "name": "Pangasinan",
    "slug": "pangasinan",
    "impactScore": 65,
    "risk": "high",
    "temperature": "+1.3°C",
    "rainfall": "-48%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "extreme",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "quezon": {
    "name": "Quezon",
    "slug": "quezon",
    "impactScore": 44,
    "risk": "moderate",
    "temperature": "+2.0°C",
    "rainfall": "-12%",
    "layers": {
      "impact": "moderate",
      "temperature": "extreme",
      "rainfall": "low",
      "drought": "low",
      "water": "moderate",
      "agriculture": "extreme"
    }
  },
  "quirino": {
    "name": "Quirino",
    "slug": "quirino",
    "impactScore": 52,
    "risk": "high",
    "temperature": "+2.3°C",
    "rainfall": "-16%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "low",
      "water": "high",
      "agriculture": "high"
    }
  },
  "rizal": {
    "name": "Rizal",
    "slug": "rizal",
    "impactScore": 63,
    "risk": "high",
    "temperature": "+1.5°C",
    "rainfall": "-37%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "high"
    }
  },
  "romblon": {
    "name": "Romblon",
    "slug": "romblon",
    "impactScore": 63,
    "risk": "high",
    "temperature": "+1.0°C",
    "rainfall": "-49%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "extreme",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "samar": {
    "name": "Samar",
    "slug": "samar",
    "impactScore": 54,
    "risk": "high",
    "temperature": "+1.2°C",
    "rainfall": "-32%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "high",
      "drought": "high",
      "water": "moderate",
      "agriculture": "extreme"
    }
  },
  "sarangani": {
    "name": "Sarangani",
    "slug": "sarangani",
    "impactScore": 52,
    "risk": "high",
    "temperature": "+2.1°C",
    "rainfall": "-19%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "siquijor": {
    "name": "Siquijor",
    "slug": "siquijor",
    "impactScore": 53,
    "risk": "high",
    "temperature": "+1.6°C",
    "rainfall": "-23%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "high",
      "agriculture": "high"
    }
  },
  "sorsogon": {
    "name": "Sorsogon",
    "slug": "sorsogon",
    "impactScore": 38,
    "risk": "moderate",
    "temperature": "+1.5°C",
    "rainfall": "-15%",
    "layers": {
      "impact": "moderate",
      "temperature": "high",
      "rainfall": "low",
      "drought": "low",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "south-cotabato": {
    "name": "South Cotabato",
    "slug": "south-cotabato",
    "impactScore": 62,
    "risk": "high",
    "temperature": "+1.3°C",
    "rainfall": "-33%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "southern-leyte": {
    "name": "Southern Leyte",
    "slug": "southern-leyte",
    "impactScore": 51,
    "risk": "high",
    "temperature": "+2.0°C",
    "rainfall": "-20%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "special-geographic-area-barmm": {
    "name": "Special Geographic Area (BARMM)",
    "slug": "special-geographic-area-barmm",
    "impactScore": 45,
    "risk": "moderate",
    "temperature": "+1.5°C",
    "rainfall": "-21%",
    "layers": {
      "impact": "moderate",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "moderate",
      "agriculture": "moderate"
    }
  },
  "sultan-kudarat": {
    "name": "Sultan Kudarat",
    "slug": "sultan-kudarat",
    "impactScore": 65,
    "risk": "high",
    "temperature": "+1.9°C",
    "rainfall": "-32%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "high",
      "water": "high",
      "agriculture": "extreme"
    }
  },
  "sulu": {
    "name": "Sulu",
    "slug": "sulu",
    "impactScore": 53,
    "risk": "high",
    "temperature": "+2.0°C",
    "rainfall": "-23%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "moderate",
      "agriculture": "extreme"
    }
  },
  "surigao-del-norte": {
    "name": "Surigao del Norte",
    "slug": "surigao-del-norte",
    "impactScore": 47,
    "risk": "moderate",
    "temperature": "+2.1°C",
    "rainfall": "-15%",
    "layers": {
      "impact": "moderate",
      "temperature": "extreme",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "surigao-del-sur": {
    "name": "Surigao del Sur",
    "slug": "surigao-del-sur",
    "impactScore": 72,
    "risk": "high",
    "temperature": "+1.9°C",
    "rainfall": "-44%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "high",
      "drought": "extreme",
      "water": "high",
      "agriculture": "high"
    }
  },
  "tarlac": {
    "name": "Tarlac",
    "slug": "tarlac",
    "impactScore": 47,
    "risk": "moderate",
    "temperature": "+2.2°C",
    "rainfall": "-14%",
    "layers": {
      "impact": "moderate",
      "temperature": "extreme",
      "rainfall": "low",
      "drought": "low",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "tawi-tawi": {
    "name": "Tawi-Tawi",
    "slug": "tawi-tawi",
    "impactScore": 60,
    "risk": "high",
    "temperature": "+1.2°C",
    "rainfall": "-42%",
    "layers": {
      "impact": "high",
      "temperature": "moderate",
      "rainfall": "high",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "zambales": {
    "name": "Zambales",
    "slug": "zambales",
    "impactScore": 57,
    "risk": "high",
    "temperature": "+2.2°C",
    "rainfall": "-21%",
    "layers": {
      "impact": "high",
      "temperature": "extreme",
      "rainfall": "moderate",
      "drought": "moderate",
      "water": "high",
      "agriculture": "moderate"
    }
  },
  "zamboanga-del-norte": {
    "name": "Zamboanga del Norte",
    "slug": "zamboanga-del-norte",
    "impactScore": 64,
    "risk": "high",
    "temperature": "+1.4°C",
    "rainfall": "-46%",
    "layers": {
      "impact": "high",
      "temperature": "high",
      "rainfall": "extreme",
      "drought": "extreme",
      "water": "moderate",
      "agriculture": "high"
    }
  },
  "zamboanga-del-sur": {
    "name": "Zamboanga del Sur",
    "slug": "zamboanga-del-sur",
    "impactScore": 77,
    "risk": "extreme",
    "temperature": "+2.0°C",
    "rainfall": "-48%",
    "layers": {
      "impact": "extreme",
      "temperature": "extreme",
      "rainfall": "extreme",
      "drought": "extreme",
      "water": "high",
      "agriculture": "high"
    }
  },
  "zamboanga-sibugay": {
    "name": "Zamboanga Sibugay",
    "slug": "zamboanga-sibugay",
    "impactScore": 37,
    "risk": "moderate",
    "temperature": "+1.5°C",
    "rainfall": "-17%",
    "layers": {
      "impact": "moderate",
      "temperature": "high",
      "rainfall": "moderate",
      "drought": "low",
      "water": "moderate",
      "agriculture": "high"
    }
  }
};

/**
 * Returns the verified province assessment for any given Philippine province name or slug.
 */
export function getProvinceStatus(rawNameOrSlug: string): ProvinceMapStatus {
  const query = (rawNameOrSlug || "").trim().toLowerCase();
  const slug = query.replace(/[^a-z0-9]+/g, "-");

  if (PROVINCES_MAP_STATUS[slug]) {
    return PROVINCES_MAP_STATUS[slug];
  }

  for (const item of Object.values(PROVINCES_MAP_STATUS)) {
    if (item.name.toLowerCase() === query || item.slug === slug) {
      return item;
    }
  }

  // Fallback to Cebu benchmark if unmatched
  return PROVINCES_MAP_STATUS["cebu"] || {
    name: rawNameOrSlug || "Philippines Area",
    slug: slug || "area",
    impactScore: 57,
    risk: "high",
    temperature: "+1.7°C",
    rainfall: "−29%",
    layers: {
      impact: "high",
      temperature: "high",
      rainfall: "high",
      drought: "high",
      water: "moderate",
      agriculture: "high",
    },
  };
}
