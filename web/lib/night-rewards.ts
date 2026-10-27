import { LIGHTS_OUT_ACTIONS, parseLightsOutJournal, validNightKey, type LightsOutAction, type LightsOutNight } from "./lights-out";

export const NIGHT_REWARDS_STORAGE_KEY = "birdradar:night-rewards:v1";
export const NIGHT_REWARDS_UPDATED_EVENT = "birdradar:night-rewards-updated";
export type NightEvidence = "local-seasonal-observations" | "global-discovery";
export interface NightCandidate { id: string; evidence?: NightEvidence; areaLabel?: string }
export interface NightAssignment {
  date: string;
  species: string;
  evidence: NightEvidence;
  areaLabel?: string;
  assignedAt: string;
}
export interface NightReward extends LightsOutNight {
  species: string;
  evidence: NightEvidence;
  areaLabel?: string;
  recordedAt: string;
}
type NightChange = { kind: "earned"; changedAt: string; recordedAt: string; actions: LightsOutAction[] }
  | { kind: "removed"; changedAt: string };
export interface NightRewardEntry { date: string; assignment?: NightAssignment; change?: NightChange }
export interface NightRewardsState { version: 1; seed: string; entries: NightRewardEntry[] }

const validSpecies = (value: unknown): value is string => typeof value === "string" && /^[a-z]+(?:-[a-z]+)*$/.test(value) && value.length < 100;
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const timestamp = (value: unknown): string | null => typeof value === "string" && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
const cleanArea = (value: unknown): string | undefined => typeof value === "string" && value.trim() ? value.trim().slice(0, 160) : undefined;
const cleanActions = (value: unknown): LightsOutAction[] => Array.isArray(value) ? [...new Set(value.filter((id): id is LightsOutAction => LIGHTS_OUT_ACTIONS.some((action) => action.id === id)))].sort() : [];
const validEvidence = (value: unknown): value is NightEvidence => value === "local-seasonal-observations" || value === "global-discovery";

export function emptyNightRewards(seed: string): NightRewardsState {
  return { version: 1, seed, entries: [] };
}

/** A selection is only a story assignment. Only a separate earned change unlocks it. */
export function parseNightRewards(raw: string | null): NightRewardsState | null {
  if (!raw) return null;
  try {
    const input: unknown = JSON.parse(raw);
    if (!isObject(input) || input.version !== 1 || typeof input.seed !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(input.seed) || !Array.isArray(input.entries)) return null;
    const entries: NightRewardEntry[] = [];
    for (const value of input.entries) {
      if (!isObject(value) || !validNightKey(value.date)) continue;
      const entry: NightRewardEntry = { date: value.date };
      const assignment = value.assignment;
      if (isObject(assignment) && assignment.date === value.date && validSpecies(assignment.species) && validEvidence(assignment.evidence)) {
        const assignedAt = timestamp(assignment.assignedAt);
        const areaLabel = cleanArea(assignment.areaLabel);
        if (assignedAt) entry.assignment = { date: value.date, species: assignment.species, evidence: assignment.evidence, assignedAt, ...(areaLabel ? { areaLabel } : {}) };
      }
      const change = value.change;
      if (isObject(change)) {
        const changedAt = timestamp(change.changedAt);
        if (changedAt && change.kind === "removed") entry.change = { kind: "removed", changedAt };
        if (changedAt && change.kind === "earned" && entry.assignment) {
          const recordedAt = timestamp(change.recordedAt);
          const actions = cleanActions(change.actions);
          if (recordedAt && actions.length) entry.change = { kind: "earned", changedAt, recordedAt, actions };
        }
      }
      if (entry.assignment || entry.change) entries.push(entry);
    }
    return mergeNightRewards(emptyNightRewards(input.seed), { version: 1, seed: input.seed, entries });
  } catch { return null; }
}

function mergeEntry(left: NightRewardEntry, right: NightRewardEntry): NightRewardEntry {
  // The earliest assignment is permanent, including after undo. Deterministic
  // tie breaking also makes simultaneous tabs converge on one nightly bird.
  const assignment = [left.assignment, right.assignment].filter((entry): entry is NightAssignment => !!entry)
    .sort((a, b) => a.assignedAt.localeCompare(b.assignedAt) || JSON.stringify(a).localeCompare(JSON.stringify(b)))[0];
  const change = [left.change, right.change].filter((entry): entry is NightChange => !!entry)
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt) || (b.kind === "removed" ? 1 : 0) - (a.kind === "removed" ? 1 : 0) || JSON.stringify(b).localeCompare(JSON.stringify(a)))[0];
  return { date: left.date, ...(assignment ? { assignment } : {}), ...(change ? { change } : {}) };
}

/** Merge independent dates and tombstones rather than replacing another tab's work. */
export function mergeNightRewards(left: NightRewardsState, right: NightRewardsState): NightRewardsState {
  const entries = new Map<string, NightRewardEntry>();
  for (const entry of [...left.entries, ...right.entries]) entries.set(entry.date, entries.has(entry.date) ? mergeEntry(entries.get(entry.date)!, entry) : entry);
  return { version: 1, seed: [left.seed, right.seed].sort()[0], entries: [...entries.values()].sort((a, b) => b.date.localeCompare(a.date)) };
}

export function earnedNightRewards(state: NightRewardsState): NightReward[] {
  return state.entries.flatMap((entry) => entry.assignment && entry.change?.kind === "earned" ? [{
    date: entry.date, species: entry.assignment.species, evidence: entry.assignment.evidence,
    ...(entry.assignment.areaLabel ? { areaLabel: entry.assignment.areaLabel } : {}),
    actions: entry.change.actions, recordedAt: entry.change.recordedAt,
  }] : []).sort((a, b) => b.date.localeCompare(a.date));
}

/** Old journal species annotations and imported check-ins never become rewards. */
export function rewardJournal(state: NightRewardsState, legacy: LightsOutNight[]): LightsOutNight[] {
  const managedDates = new Set(state.entries.filter((entry) => entry.change).map((entry) => entry.date));
  return parseLightsOutJournal(JSON.stringify([...legacy.filter((night) => !managedDates.has(night.date)), ...earnedNightRewards(state)]));
}

function hash(value: string): number {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return result >>> 0;
}

/** Call after the visitor starts the ritual, once optional local data is ready. */
export function prepareNightReward(state: NightRewardsState, candidates: readonly NightCandidate[], date: string, now: string): { state: NightRewardsState; assignment: NightAssignment | null } {
  const assignedAt = timestamp(now);
  if (!validNightKey(date) || !assignedAt) return { state, assignment: null };
  const existing = state.entries.find((entry) => entry.date === date)?.assignment;
  if (existing) return { state, assignment: existing };
  const unique = new Map<string, NightCandidate>();
  // Candidate order and duplicates must not change the deterministic draw.
  for (const candidate of candidates.filter((entry) => entry && validSpecies(entry.id)).slice().sort((a, b) => a.id.localeCompare(b.id) || Number(b.evidence === "local-seasonal-observations") - Number(a.evidence === "local-seasonal-observations") || String(a.areaLabel).localeCompare(String(b.areaLabel)))) {
    if (!unique.has(candidate.id)) unique.set(candidate.id, candidate);
  }
  const all = [...unique.values()];
  const local = all.filter((candidate) => candidate.evidence === "local-seasonal-observations");
  const eligible = local.length ? local : all;
  const unlocked = new Set(earnedNightRewards(state).map((reward) => reward.species));
  const unseen = eligible.filter((candidate) => !unlocked.has(candidate.id));
  const pool = unseen.length ? unseen : eligible;
  if (!pool.length) return { state, assignment: null };
  const selected = pool[hash(`${state.seed}:${date}`) % pool.length];
  const areaLabel = cleanArea(selected.areaLabel);
  const assignment: NightAssignment = { date, species: selected.id, evidence: validEvidence(selected.evidence) ? selected.evidence : "global-discovery", assignedAt, ...(areaLabel ? { areaLabel } : {}) };
  return { state: mergeNightRewards(state, { ...state, entries: [{ date, assignment }] }), assignment };
}

function changedAt(state: NightRewardsState, date: string, now: string): string {
  const previous = state.entries.find((entry) => entry.date === date)?.change?.changedAt;
  return new Date(Math.max(Date.parse(now), previous ? Date.parse(previous) + 1 : 0)).toISOString();
}

export function recordNightReward(state: NightRewardsState, input: { date: string; now: string; candidates: readonly NightCandidate[]; actions: readonly LightsOutAction[]; confirmedAfterDark: boolean }): { state: NightRewardsState; reward: NightReward | null } {
  const recordedAt = timestamp(input.now);
  const actions = cleanActions(input.actions);
  if (!input.confirmedAfterDark || !actions.length || !validNightKey(input.date) || !recordedAt) return { state, reward: null };
  const prepared = prepareNightReward(state, input.candidates, input.date, recordedAt);
  if (!prepared.assignment) return { state, reward: null };
  // A second click, refresh, or replay cannot issue a second award or replace it.
  const existing = earnedNightRewards(prepared.state).find((entry) => entry.date === input.date);
  if (existing) return { state: prepared.state, reward: existing };
  const next = mergeNightRewards(prepared.state, { ...prepared.state, entries: [{ date: input.date, assignment: prepared.assignment, change: { kind: "earned", actions, recordedAt, changedAt: changedAt(prepared.state, input.date, recordedAt) } }] });
  return { state: next, reward: earnedNightRewards(next).find((entry) => entry.date === input.date)! };
}

/** Removing a check-in revokes its reward, while retaining its anti-reroll assignment. */
export function removeNightReward(state: NightRewardsState, date: string, now: string): NightRewardsState {
  if (!validNightKey(date) || !timestamp(now)) return state;
  return mergeNightRewards(state, { ...state, entries: [{ date, change: { kind: "removed", changedAt: changedAt(state, date, now) } }] });
}
