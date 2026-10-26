/** One URL model for the atlas, including legacy links to the nearby map. */
export interface AreaCenter { latitude: number; longitude: number }
export interface ChosenArea extends AreaCenter { name: string }
export type AtlasLayer = "density" | "tracks" | "observation-heat" | "observations";
export type AtlasScope = "historical" | "nearby";
export type AtlasParams = Pick<URLSearchParams, "get" | "getAll" | "toString">;

export interface AtlasSelection {
  scope: AtlasScope;
  area: ChosenArea | null;
  /** An old location-less Near home link opens the locator, without asking for geolocation. */
  locatorRequested: boolean;
  month: number | null;
  layer: AtlasLayer;
  recordSpecies: string | null;
}

export function validAtlasArea(value: unknown): value is ChosenArea {
  if (!value || typeof value !== "object") return false;
  const area = value as Partial<ChosenArea>;
  return typeof area.name === "string" && typeof area.latitude === "number" && Number.isFinite(area.latitude) &&
    Math.abs(area.latitude) <= 85 && typeof area.longitude === "number" && Number.isFinite(area.longitude) && Math.abs(area.longitude) <= 180;
}

/** Only this approximate location is sent to the nearby service or saved on the device. */
export function roundAtlasArea(area: ChosenArea): ChosenArea {
  return { latitude: Number(area.latitude.toFixed(2)), longitude: Number(area.longitude.toFixed(2)), name: area.name.trim() || "Chosen area" };
}

export function parseAtlasArea(params: AtlasParams): ChosenArea | null {
  const read = (name: string) => {
    const values = params.getAll(name);
    return values.length === 1 && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(values[0]) ? Number(values[0]) : NaN;
  };
  const candidate = { latitude: read("lat"), longitude: read("lon"), name: params.get("place") || "Chosen area" };
  return validAtlasArea(candidate) ? roundAtlasArea(candidate) : null;
}

export function parseAtlasMonth(value: string | null, fallback: number | null = 9): number | null {
  return value === "all" ? null : value !== null && /^([1-9]|1[0-2])$/.test(value) ? Number(value) : fallback;
}

export function parseAtlasSelection(params: AtlasParams): AtlasSelection {
  const area = parseAtlasArea(params);
  const nearbyRequested = params.get("view") === "nearby";
  const scope: AtlasScope = area ? "nearby" : "historical";
  const rawMonth = params.get("month") ?? (nearbyRequested || area ? params.get("nearbyMonth") : null);
  const month = parseAtlasMonth(rawMonth, nearbyRequested || area ? null : 9);
  const rawLayer = params.get("layer");
  const legacyLayer = params.get("nearbyLayer");
  let layer: AtlasLayer;
  if (scope === "nearby") {
    layer = rawLayer === "observations" || rawLayer === null && legacyLayer === "points" ? "observations" : "observation-heat";
  } else {
    layer = rawLayer === "tracks" || rawLayer === "observations" || rawLayer === "observation-heat" ? rawLayer : "density";
  }
  return { scope, area, locatorRequested: nearbyRequested && !area, month, layer, recordSpecies: params.get("recordSpecies") };
}

export interface AtlasSelectionUpdate {
  species?: string | null;
  month?: number | null;
  layer?: AtlasLayer;
  recordSpecies?: string | null;
  area?: ChosenArea | null;
  scope?: AtlasScope;
}

/** Keep return links and historical bookmarks compatible while writing one set of map controls. */
export function updateAtlasSelection(params: AtlasParams, next: AtlasSelectionUpdate = {}): URLSearchParams {
  const current = parseAtlasSelection(params);
  const query = new URLSearchParams(params.toString());
  const month = next.month === undefined ? current.month : next.month;
  if (month !== null && (!Number.isInteger(month) || month < 1 || month > 12)) throw new RangeError("Choose a month from 1 to 12, or all months.");
  query.set("month", month === null ? "all" : String(month));
  query.set("layer", next.layer ?? current.layer);
  query.delete("nearbyMonth");
  query.delete("nearbyLayer");
  if (next.species !== undefined) {
    if (next.species) query.set("species", next.species); else query.delete("species");
  }

  if (next.scope === "historical" || next.area === null) {
    for (const key of ["view", "lat", "lon", "place", "recordSpecies"]) query.delete(key);
    if (!next.layer && current.scope === "nearby") query.set("layer", "density");
  } else if (next.area) {
    if (!validAtlasArea(next.area)) throw new RangeError("Choose an area between 85° south and 85° north.");
    const area = roundAtlasArea(next.area);
    query.set("view", "nearby");
    query.set("lat", String(area.latitude));
    query.set("lon", String(area.longitude));
    query.set("place", area.name);
    query.set("layer", next.layer === "observations" ? "observations" : "observation-heat");
    query.delete("recordSpecies");
  } else if (next.scope === "nearby" || current.scope === "nearby") {
    query.set("view", "nearby");
    if (next.layer && next.layer !== "observations" && next.layer !== "observation-heat") query.set("layer", "observation-heat");
  }

  if (next.recordSpecies !== undefined && next.scope !== "historical" && next.area !== null) {
    if (next.recordSpecies) query.set("recordSpecies", next.recordSpecies); else query.delete("recordSpecies");
  }
  return query;
}
