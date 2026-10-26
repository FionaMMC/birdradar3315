/** Public, historical telemetry and occurrence records. No generated bird positions. */
export interface MigrationPoint {
  longitude: number;
  latitude: number;
  /** ISO-8601 UTC observation time, retained from the source. */
  timestamp: string;
  month: number;
}

export interface MigrationTrack {
  id: string;
  sourceId: string;
  speciesId: string;
  individualId: string;
  /** A continuous segment; long gaps are split during ingestion. */
  points: MigrationPoint[];
}

export interface MigrationSpecies {
  id: string;
  name: string;
  nameZh: string;
  scientificName: string;
  color: string;
  kind: "telemetry" | "occurrence";
}

export interface MigrationSource {
  id: string;
  name: string;
  kind: "telemetry" | "occurrence";
  url: string;
  citation: string;
  license: string;
  retrievedAt: string;
  period: { start: string; end: string };
  method: string;
  rawSha256?: string;
  attributions?: { datasetKey: string; title: string; url: string; citation: string; license: string }[];
  sourceRecordCount: number;
  retainedRecordCount: number;
}

export interface BirdOccurrence extends MigrationPoint {
  id: string;
  speciesId: string;
  sourceId: string;
  datasetKey: string;
  license: string;
  url: string;
}

export interface MigrationDataset {
  version: 1;
  generatedAt: string;
  sources: MigrationSource[];
  species: MigrationSpecies[];
  tracks: MigrationTrack[];
  occurrences: BirdOccurrence[];
}

export interface MigrationFilter {
  /** null or omitted means the whole historical snapshot, not the current year. */
  month?: number | null;
  species?: string | null;
}

export interface MigrationHeatCell {
  latitude: number;
  longitude: number;
  speciesId: string;
  individualCount: number;
  /** Fraction of this species' active tracked individuals visiting this cell. */
  weight: number;
}

export function isValidCoordinate(latitude: unknown, longitude: unknown): boolean {
  return typeof latitude === "number" && typeof longitude === "number" &&
    Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/** Filter contiguous runs, so January never gets connected across different years. */
export function filterMigrationData(data: MigrationDataset, filter: MigrationFilter = {}): MigrationDataset {
  const month = filter.month;
  if (month != null && (!Number.isInteger(month) || month < 1 || month > 12)) {
    throw new RangeError("month must be an integer from 1 to 12");
  }
  const matchesSpecies = (id: string) => !filter.species || filter.species === "all" || filter.species === id;
  const tracks = data.tracks.flatMap((track) => {
    if (!matchesSpecies(track.speciesId)) return [];
    if (month == null) return [track];
    const runs: MigrationTrack[] = [];
    let points: MigrationPoint[] = [];
    const finish = () => {
      if (points.length) runs.push({ ...track, id: `${track.id}:month-${month}:${runs.length}`, points });
      points = [];
    };
    for (const point of track.points) {
      if (point.month === month) points.push(point);
      else finish();
    }
    finish();
    return runs;
  });
  return {
    ...data,
    species: data.species.filter((s) => matchesSpecies(s.id)),
    tracks,
    occurrences: data.occurrences.filter((p) => matchesSpecies(p.speciesId) && (month == null || p.month === month)),
  };
}

/** One vote per tracked animal per cell, irrespective of fix rate or repeated visits. */
export function getMigrationHeatCells(data: MigrationDataset, cellDegrees = 1): MigrationHeatCell[] {
  if (!Number.isFinite(cellDegrees) || cellDegrees <= 0 || cellDegrees > 10) {
    throw new RangeError("cellDegrees must be greater than 0 and at most 10");
  }
  const cells = new Map<string, { latitude: number; longitude: number; speciesId: string; individuals: Set<string> }>();
  const totals = new Map<string, Set<string>>();
  for (const track of data.tracks) {
    const individual = `${track.sourceId}:${track.individualId}`;
    for (const point of track.points) {
      if (!isValidCoordinate(point.latitude, point.longitude)) continue;
      if (!totals.has(track.speciesId)) totals.set(track.speciesId, new Set());
      totals.get(track.speciesId)!.add(individual);
      const x = Math.min(Math.ceil(360 / cellDegrees) - 1, Math.floor((point.longitude + 180) / cellDegrees));
      const y = Math.min(Math.ceil(180 / cellDegrees) - 1, Math.floor((point.latitude + 90) / cellDegrees));
      const key = `${track.speciesId}:${x}:${y}`;
      if (!cells.has(key)) cells.set(key, {
        longitude: (-180 + x * cellDegrees + Math.min(180, -180 + (x + 1) * cellDegrees)) / 2,
        latitude: (-90 + y * cellDegrees + Math.min(90, -90 + (y + 1) * cellDegrees)) / 2,
        speciesId: track.speciesId,
        individuals: new Set(),
      });
      cells.get(key)!.individuals.add(individual);
    }
  }
  return [...cells.values()].map(({ individuals, ...cell }) => ({
    ...cell,
    individualCount: individuals.size,
    weight: individuals.size / totals.get(cell.speciesId)!.size,
  }));
}

export function getMigrationSummary(data: MigrationDataset) {
  const individuals = new Set<string>();
  let pointCount = 0;
  let start = "";
  let end = "";
  for (const track of data.tracks) {
    if (track.points.length) individuals.add(`${track.sourceId}:${track.individualId}`);
    for (const point of track.points) {
      pointCount += 1;
      if (!start || point.timestamp < start) start = point.timestamp;
      if (!end || point.timestamp > end) end = point.timestamp;
    }
  }
  return {
    individualCount: individuals.size,
    pointCount,
    segmentCount: data.tracks.length,
    occurrenceCount: data.occurrences.length,
    telemetrySpeciesCount: new Set(data.tracks.map((t) => t.speciesId)).size,
    period: start ? { start, end } : null,
    label: "Historical tracking sample · not a live population estimate",
  };
}
