export const LIGHTS_OUT_STORAGE_KEY = "birdradar:lights-out-journal:v2";
export const LIGHTS_OUT_UPDATED_EVENT = "birdradar:lights-out-updated";
export const LEGACY_LIGHTS_OUT_STORAGE_KEY = "birdradar:lights-out:v1";

export const LIGHTS_OUT_ACTIONS = [
  { id: "outdoor", title: "Turn off unnecessary outdoor lights", detail: "Decorative, garden and flood lights can stay off when you don’t need them.", recorded: "Unnecessary outdoor lights off" },
  { id: "indoor", title: "Switch off lights in unused rooms", detail: "Use only the light you need, where you need it.", recorded: "Unused-room lights off" },
  { id: "curtains", title: "Close curtains or blinds", detail: "Keep light from occupied rooms from spilling through windows.", recorded: "Curtains or blinds closed" },
] as const;

export type LightsOutAction = (typeof LIGHTS_OUT_ACTIONS)[number]["id"];
export interface LightsOutNight {
  date: string;
  actions: LightsOutAction[];
  recordedAt: string | null;
  species?: string;
  imported?: true;
}

/** Calendar dates deliberately use the device’s timezone, never UTC truncation. */
export function localNightKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validNightKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 2000 && year <= 9999 && date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
}

/** Treat browser storage as untrusted and keep one genuine check-in per date. */
export function parseLightsOutJournal(raw: string | null): LightsOutNight[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const nights = new Map<string, LightsOutNight>();
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object" || !validNightKey(entry.date) || !Array.isArray(entry.actions)) continue;
      const actions = [...new Set<LightsOutAction>(entry.actions.filter((id: unknown): id is LightsOutAction => LIGHTS_OUT_ACTIONS.some((action) => action.id === id)))];
      const imported = entry.imported === true;
      if (!actions.length && !imported) continue;
      const recordedAt = typeof entry.recordedAt === "string" && Number.isFinite(Date.parse(entry.recordedAt)) ? entry.recordedAt : null;
      if (!recordedAt && !imported) continue;
      nights.set(entry.date, {
        date: entry.date,
        actions,
        recordedAt,
        ...(typeof entry.species === "string" && /^[a-z]+(?:-[a-z]+)*$/.test(entry.species) ? { species: entry.species } : {}),
        ...(imported ? { imported: true as const } : {}),
      });
    }
    return [...nights.values()].sort((a, b) => b.date.localeCompare(a.date));
  } catch { return []; }
}

/** The old app saved only one unpadded date, without action detail or timestamp. */
export function importLegacyNight(raw: string | null): LightsOutNight | null {
  if (!raw || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) return null;
  const [year, month, day] = raw.split("-");
  const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  return validNightKey(date) ? { date, actions: [], recordedAt: null, imported: true } : null;
}

export function recordLightsOutNight(journal: LightsOutNight[], night: LightsOutNight): LightsOutNight[] {
  return parseLightsOutJournal(JSON.stringify([night, ...journal.filter((entry) => entry.date !== night.date)]));
}

export function nightDateLabel(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day, 12));
}
