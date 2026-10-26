/** Independent sightings remain independent: heat expresses this record sample only. */
export interface ObservationHeatPoint {
  id: string;
  latitude: number;
  longitude: number;
}
export interface ObservationHeatCell {
  latitude: number;
  longitude: number;
  recordCount: number;
  /** Share of the full-period selected record sample, including hidden months. */
  weight: number;
}

export function uniqueObservationPoints(points: readonly ObservationHeatPoint[]): ObservationHeatPoint[] {
  const seen = new Set<string>();
  return points.filter((point) => {
    if (!point.id || seen.has(point.id) || !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude) || Math.abs(point.latitude) > 85 || Math.abs(point.longitude) > 180) return false;
    seen.add(point.id);
    return true;
  });
}

/** The denominator is deliberately passed from the unfiltered time period. */
export function observationHeatCells(points: readonly ObservationHeatPoint[], denominator: number, cellDegrees: number): ObservationHeatCell[] {
  if (!Number.isFinite(cellDegrees) || cellDegrees <= 0 || cellDegrees > 5) throw new RangeError("cellDegrees must be within (0, 5]");
  if (!Number.isFinite(denominator) || denominator <= 0) return [];
  const cells = new Map<string, { latitude: number; longitude: number; recordCount: number }>();
  const records = uniqueObservationPoints(points);
  // Reject an impossible denominator instead of silently amplifying the field.
  if (denominator < records.length) throw new RangeError("The full-period denominator cannot be smaller than the visible record sample");
  for (const point of records) {
    const longitude = point.longitude === 180 ? -180 : point.longitude;
    const key = `${Math.floor((longitude + 180) / cellDegrees)}:${Math.floor((point.latitude + 90) / cellDegrees)}`;
    const cell = cells.get(key) ?? { latitude: 0, longitude: 0, recordCount: 0 };
    cell.latitude += point.latitude;
    cell.longitude += longitude;
    cell.recordCount += 1;
    cells.set(key, cell);
  }
  return [...cells.values()].map((cell) => ({ latitude: cell.latitude / cell.recordCount, longitude: cell.longitude / cell.recordCount, recordCount: cell.recordCount, weight: cell.recordCount / denominator }));
}
