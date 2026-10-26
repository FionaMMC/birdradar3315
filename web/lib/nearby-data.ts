/** Nearby observations are a bounded GBIF sample, never live birds or a census. */
export const NEARBY_RADIUS_KM = 25;
export const NEARBY_RECORD_LIMIT = 300;
const EARTH_RADIUS_KM = 6371.0088;

export interface NearbyCenter { latitude: number; longitude: number }
export interface NearbyPoint extends NearbyCenter {
  id: string;
  taxonKey: number;
  speciesId: string;
  scientificName: string;
  commonName: string | null;
  /** Source observation day, not the time it was downloaded. */
  eventDate: string;
  datasetKey: string;
  datasetName: string;
  license: string;
  rightsHolder: string | null;
  recordedBy: string | null;
  coordinateUncertaintyInMeters: number | null;
  sourceUrl: string;
}
export interface NearbySpecies {
  id: string;
  taxonKey: number;
  scientificName: string;
  commonName: string | null;
  count: number;
  firstObserved: string;
  lastObserved: string;
  sourceUrl: string;
}
export interface NearbyResponse {
  center: NearbyCenter;
  radiusKm: number;
  period: { from: string; to: string };
  fetchedAt: string;
  /** Number of retained records in this sample, not all birds in the area. */
  totalRecords: number;
  species: NearbySpecies[];
  points: NearbyPoint[];
  source: { name: string; url: string; attribution: string };
  sampling: {
    limit: number;
    retrieved: number;
    withinRadius: number;
    availableInBoundingBox: number;
    truncated: boolean;
    description: string;
  };
}
export interface PlaceResult {
  id: number;
  name: string;
  admin: string;
  country: string;
  latitude: number;
  longitude: number;
}
export interface NearbyBounds { south: number; north: number; west: number; east: number }
export interface GbifPage { results: unknown[]; count: number; endOfRecords: boolean }

/** Use the visible world copy for both markers and popup anchors at the date line. */
export function nearbyLongitudeNear(longitude: number, reference: number): number {
  return longitude + 360 * Math.round((reference - longitude) / 360);
}

/** Construct trusted destinations instead of assigning arbitrary source strings to DOM links. */
export function nearbyPointAttribution(point: Pick<NearbyPoint, "id" | "datasetKey" | "license">) {
  const recordUrl = /^\d+$/.test(point.id) ? `https://www.gbif.org/occurrence/${point.id}` : null;
  const datasetUrl = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(point.datasetKey) ? `https://www.gbif.org/dataset/${point.datasetKey}` : null;
  let licenseUrl: string | null = null;
  let licenseLabel = "See source license";
  try {
    const url = new URL(point.license);
    if (["http:", "https:"].includes(url.protocol) && url.hostname === "creativecommons.org" && !url.username && !url.password) {
      if (/^\/publicdomain\/zero\/1\.0(?:\/|$)/.test(url.pathname)) {
        licenseUrl = "https://creativecommons.org/publicdomain/zero/1.0/";
        licenseLabel = "CC0 1.0";
      } else if (/^\/licenses\/by\/4\.0(?:\/|$)/.test(url.pathname)) {
        licenseUrl = "https://creativecommons.org/licenses/by/4.0/";
        licenseLabel = "CC BY 4.0";
      }
    }
  } catch { /* Unreadable license strings remain non-interactive text. */ }
  return { recordUrl, datasetUrl, licenseUrl, licenseLabel };
}

export function validNearbyCoordinate(latitude: unknown, longitude: unknown): boolean {
  return typeof latitude === "number" && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    typeof longitude === "number" && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

/** Keep the location approximate before it enters an upstream URL or cache key. */
export function parseNearbyCenter(params: URLSearchParams): NearbyCenter {
  const read = (name: string) => {
    const values = params.getAll(name);
    if (values.length !== 1 || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(values[0])) {
      throw new RangeError("Choose a location with valid latitude and longitude.");
    }
    return Number(values[0]);
  };
  const latitude = read("lat");
  const longitude = read("lon");
  if (!validNearbyCoordinate(latitude, longitude)) throw new RangeError("Latitude must be between −90 and 90, and longitude between −180 and 180.");
  return { latitude: Number(latitude.toFixed(2)), longitude: Number(longitude.toFixed(2)) };
}

export function distanceKm(a: NearbyCenter, b: NearbyCenter): number {
  const radians = Math.PI / 180;
  const sinLat = Math.sin((b.latitude - a.latitude) * radians / 2);
  const sinLon = Math.sin((b.longitude - a.longitude) * radians / 2);
  const h = sinLat ** 2 + Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * sinLon ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.max(0, Math.min(1, h))));
}

/** A spherical bounding box; split at the date line, and include every longitude near a pole. */
export function nearbyBounds(center: NearbyCenter, radiusKm = NEARBY_RADIUS_KM): NearbyBounds[] {
  if (!validNearbyCoordinate(center.latitude, center.longitude) || !Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
    throw new RangeError("Invalid nearby search bounds.");
  }
  const angle = radiusKm / EARTH_RADIUS_KM;
  const latitudeDelta = angle * 180 / Math.PI;
  const south = Math.max(-90, center.latitude - latitudeDelta);
  const north = Math.min(90, center.latitude + latitudeDelta);
  if (south <= -90 || north >= 90) return [{ south, north, west: -180, east: 180 }];
  const longitudeDelta = Math.asin(Math.min(1, Math.sin(angle) / Math.cos(center.latitude * Math.PI / 180))) * 180 / Math.PI;
  const west = center.longitude - longitudeDelta;
  const east = center.longitude + longitudeDelta;
  if (west < -180) return [{ south, north, west: west + 360, east: 180 }, { south, north, west: -180, east }];
  if (east > 180) return [{ south, north, west, east: 180 }, { south, north, west: -180, east: east - 360 }];
  return [{ south, north, west, east }];
}

export function nearbyPeriod(now = new Date()): NearbyResponse["period"] {
  if (!Number.isFinite(now.getTime())) throw new RangeError("Invalid date.");
  const to = now.toISOString().slice(0, 10);
  const year = now.getUTCFullYear() - 2;
  const month = now.getUTCMonth();
  // February 29 becomes February 28 when the target year is not a leap year.
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const from = new Date(Date.UTC(year, month, Math.min(now.getUTCDate(), lastDay))).toISOString().slice(0, 10);
  return { from, to };
}

export function gbifNearbyUrls(center: NearbyCenter, period: NearbyResponse["period"]): string[] {
  const bounds = nearbyBounds(center);
  return bounds.map((box) => {
    const url = new URL("https://api.gbif.org/v1/occurrence/search");
    const params = url.searchParams;
    params.set("taxonKey", "212"); // Aves in the GBIF backbone taxonomy.
    params.set("hasCoordinate", "true");
    params.set("hasGeospatialIssue", "false");
    params.set("occurrenceStatus", "PRESENT");
    params.append("basisOfRecord", "HUMAN_OBSERVATION");
    params.append("basisOfRecord", "MACHINE_OBSERVATION");
    params.append("license", "CC0_1_0");
    params.append("license", "CC_BY_4_0");
    params.set("eventDate", `${period.from},${period.to}`);
    params.set("decimalLatitude", `${box.south},${box.north}`);
    params.set("decimalLongitude", `${box.west},${box.east}`);
    params.set("limit", String(Math.floor(NEARBY_RECORD_LIMIT / bounds.length)));
    return url.toString();
  });
}

const text = (value: unknown): string | null => typeof value === "string" && value.trim() ? value.trim() : null;
const record = (value: unknown): Record<string, unknown> | null => value != null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

export function parseGbifPage(value: unknown): GbifPage {
  const page = record(value);
  if (!page || !Array.isArray(page.results) || typeof page.count !== "number" || !Number.isFinite(page.count) || page.count < 0 || typeof page.endOfRecords !== "boolean") {
    throw new Error("GBIF returned an unreadable response.");
  }
  return { results: page.results.slice(0, NEARBY_RECORD_LIMIT), count: page.count, endOfRecords: page.endOfRecords };
}

export function buildNearbyResponse(pages: GbifPage[], center: NearbyCenter, period: NearbyResponse["period"], now = new Date()): NearbyResponse {
  const points: NearbyPoint[] = [];
  const seen = new Set<string>();
  const rawRecords = pages.flatMap((page) => page.results).slice(0, NEARBY_RECORD_LIMIT);
  for (const raw of rawRecords) {
    const item = record(raw);
    if (!item || !validNearbyCoordinate(item.decimalLatitude, item.decimalLongitude) ||
      typeof item.key !== "number" || !Number.isSafeInteger(item.key) || item.key <= 0 ||
      typeof item.speciesKey !== "number" || !Number.isSafeInteger(item.speciesKey) || item.speciesKey <= 0 ||
      item.classKey !== 212 || item.occurrenceStatus !== "PRESENT" ||
      !["HUMAN_OBSERVATION", "MACHINE_OBSERVATION"].includes(String(item.basisOfRecord))) continue;
    const latitude = item.decimalLatitude as number;
    const longitude = item.decimalLongitude as number;
    if (distanceKm(center, { latitude, longitude }) > NEARBY_RADIUS_KM) continue;
    const scientificName = text(item.species);
    const eventDate = text(item.eventDate)?.slice(0, 10);
    const datasetKey = text(item.datasetKey);
    const license = text(item.license);
    if (!scientificName || !datasetKey || !license || !eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) continue;
    const observed = new Date(`${eventDate}T00:00:00Z`);
    if (!Number.isFinite(observed.getTime()) || observed.toISOString().slice(0, 10) !== eventDate || eventDate < period.from || eventDate > period.to) continue;
    // Do not silently admit restrictive or missing licenses if upstream filters change.
    if (!/^https?:\/\/creativecommons\.org\/(?:publicdomain\/zero\/1\.0|licenses\/by\/4\.0)(?:\/|$)/.test(license)) continue;
    const id = String(item.key);
    if (seen.has(id)) continue;
    seen.add(id);
    points.push({
      id, latitude, longitude, taxonKey: item.speciesKey, speciesId: String(item.speciesKey), scientificName,
      commonName: text(item.vernacularName), eventDate, datasetKey, datasetName: text(item.datasetName) || "GBIF occurrence dataset",
      license, rightsHolder: text(item.rightsHolder), recordedBy: text(item.recordedBy),
      coordinateUncertaintyInMeters: typeof item.coordinateUncertaintyInMeters === "number" && Number.isFinite(item.coordinateUncertaintyInMeters) && item.coordinateUncertaintyInMeters >= 0 ? item.coordinateUncertaintyInMeters : null,
      sourceUrl: `https://www.gbif.org/occurrence/${id}`,
    });
  }
  points.sort((a, b) => b.eventDate.localeCompare(a.eventDate) || a.id.localeCompare(b.id));
  const groups = new Map<string, NearbySpecies>();
  for (const point of points) {
    const existing = groups.get(point.speciesId);
    if (existing) {
      existing.count += 1;
      if (point.eventDate < existing.firstObserved) existing.firstObserved = point.eventDate;
      if (point.eventDate > existing.lastObserved) existing.lastObserved = point.eventDate;
      if (!existing.commonName && point.commonName) existing.commonName = point.commonName;
    } else {
      groups.set(point.speciesId, { id: point.speciesId, taxonKey: point.taxonKey, scientificName: point.scientificName,
        commonName: point.commonName, count: 1, firstObserved: point.eventDate, lastObserved: point.eventDate,
        sourceUrl: `https://www.gbif.org/species/${point.taxonKey}` });
    }
  }
  return {
    center, radiusKm: NEARBY_RADIUS_KM, period, fetchedAt: now.toISOString(), totalRecords: points.length, points,
    species: [...groups.values()].sort((a, b) => b.count - a.count || a.scientificName.localeCompare(b.scientificName)),
    source: { name: "GBIF", url: "https://www.gbif.org/occurrence/search", attribution: "Occurrence records from GBIF contributing datasets; CC0 or CC BY 4.0. Each point links to its record, dataset and license." },
    sampling: {
      limit: NEARBY_RECORD_LIMIT, retrieved: rawRecords.length, withinRadius: points.length,
      availableInBoundingBox: pages.reduce((sum, page) => sum + page.count, 0),
      truncated: pages.some((page) => !page.endOfRecords),
      description: "Up to 300 GBIF observation records from the surrounding bounding box, filtered to 25 km and the last two years. A convenience sample in GBIF's default order, not a census, complete species list, live sightings or migration forecast. Empty results do not mean no birds are present. Coordinates and dates retain source uncertainty.",
    },
  };
}

export function parsePlaceQuery(params: URLSearchParams): string {
  const values = params.getAll("q");
  const query = values.length === 1 ? values[0].trim().replace(/\s+/g, " ") : "";
  if (query.length < 2 || query.length > 100 || /[\u0000-\u001f\u007f]/.test(values[0] || "")) {
    throw new RangeError("Enter a city, suburb or postal code (2–100 characters).");
  }
  return query;
}

export function parsePlaceResults(value: unknown): PlaceResult[] {
  const response = record(value);
  if (!response || response.error || (response.results !== undefined && !Array.isArray(response.results))) throw new Error("Location search returned an unreadable response.");
  return ((response.results || []) as unknown[]).flatMap((raw) => {
    const item = record(raw);
    if (!item || typeof item.id !== "number" || !Number.isSafeInteger(item.id) || !text(item.name) || !validNearbyCoordinate(item.latitude, item.longitude)) return [];
    return [{ id: item.id, name: text(item.name)!, admin: text(item.admin1) || text(item.admin2) || "", country: text(item.country) || text(item.country_code) || "",
      latitude: Number((item.latitude as number).toFixed(2)), longitude: Number((item.longitude as number).toFixed(2)) }];
  }).slice(0, 8);
}
