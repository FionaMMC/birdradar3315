import type { NightCandidate } from "./night-rewards";

/** A seasonal record supports a discovery, never an overhead prediction. */
export function seasonalNightCandidates(
  birds: readonly { id: string; scientificName: string }[],
  points: readonly { scientificName: string; eventDate: string }[],
  month: number,
  areaLabel: string,
): NightCandidate[] {
  if (!Number.isInteger(month) || month < 1 || month > 12) return [];
  const names = new Set(points.filter((point) => /^\d{4}-\d{2}-\d{2}/.test(point.eventDate) && Number(point.eventDate.slice(5, 7)) === month).map((point) => point.scientificName.trim().toLowerCase()));
  return birds.filter((bird) => names.has(bird.scientificName.toLowerCase())).map((bird) => ({ id: bird.id, evidence: "local-seasonal-observations", areaLabel }));
}
