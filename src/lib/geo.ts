import type { ProvinceDroughtAssessment, SearchIndexItem } from "./types";

export interface GeoLocationResult {
  lguName: string;
  provinceName: string;
  provinceSlug: string;
  regionName: string;
  distanceKm: number;
}

const STORAGE_KEY = "bantay_user_location";

/**
 * Normalizes official PSGC administrative titles into standard display names.
 * e.g. "NCR, City of Manila, First District (Not a Province)" -> "Metro Manila"
 */
export function normalizeProvinceName(raw: string): string {
  if (!raw) return "Metro Manila";
  const trimmed = raw.trim();
  if (trimmed.startsWith("NCR") || trimmed.toLowerCase().includes("manila")) {
    return "Metro Manila";
  }
  return trimmed.replace(/\s*\(Not a Province\)/i, "").trim();
}

/**
 * Haversine formula to find the nearest Philippine LGU / Province given GPS coordinates.
 */
export function findNearestLgu(
  userLat: number,
  userLon: number,
  searchIndex: SearchIndexItem[]
): GeoLocationResult | null {
  if (!searchIndex || searchIndex.length === 0) return null;

  let best: SearchIndexItem | null = null;
  let minKm = Infinity;

  const toRad = Math.PI / 180;
  const userLatRad = userLat * toRad;

  for (const item of searchIndex) {
    if (!item.coordinates || item.coordinates.length < 2) continue;
    const [iLon, iLat] = item.coordinates;

    const dLat = (iLat - userLat) * toRad;
    const dLon = (iLon - userLon) * toRad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLatRad) * Math.cos(iLat * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = 6371 * c;

    if (distKm < minKm) {
      minKm = distKm;
      best = item;
    }
  }

  if (!best) return null;

  const provinceName = normalizeProvinceName(best.provinceName || "Metro Manila");

  return {
    lguName: best.name,
    provinceName,
    provinceSlug: best.provinceSlug,
    regionName: best.regionName,
    distanceKm: Math.round(minKm),
  };
}

/**
 * Matches a requested province query or slug against the 88 drought assessment records.
 */
export function matchProvinceAssessment(
  query: string,
  assessments: ProvinceDroughtAssessment[]
): ProvinceDroughtAssessment | undefined {
  if (!assessments || assessments.length === 0 || !query) return undefined;
  const q = query.trim().toLowerCase();
  const slug = q.replace(/[^a-z0-9]+/g, "-");

  // 1. Direct slug or name match
  let match = assessments.find(
    (a) =>
      a.provinceSlug.toLowerCase() === slug ||
      a.provinceName.toLowerCase() === q ||
      normalizeProvinceName(a.provinceName).toLowerCase() === q
  );

  // 2. Metro Manila / NCR fallback
  if (!match && (q.includes("manila") || q.includes("ncr") || q.includes("metro"))) {
    match = assessments.find(
      (a) =>
        a.provinceName.toLowerCase().includes("manila") ||
        a.regionName.toLowerCase().includes("ncr")
    );
  }

  // 3. Substring matching
  if (!match) {
    match = assessments.find(
      (a) =>
        a.provinceName.toLowerCase().includes(q) ||
        q.includes(a.provinceName.toLowerCase())
    );
  }

  return match;
}

/**
 * Persists detected or selected user location in localStorage.
 */
export function saveUserLocation(location: {
  province: string;
  region: string;
  municipality?: string;
  isGps?: boolean;
}): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch (err) {
    console.warn("Could not save user location to localStorage:", err);
  }
}

/**
 * Retrieves saved user location from localStorage if available.
 */
export function getSavedUserLocation(): {
  province: string;
  region: string;
  municipality?: string;
  isGps?: boolean;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Requests browser GPS location with timeout.
 */
export function requestBrowserCoordinates(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Browser geolocation is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        let msg = "Could not retrieve GPS location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location access was denied. Please select your province manually.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // cache for 5 minutes
      }
    );
  });
}
