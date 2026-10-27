"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  importLegacyNight, LEGACY_LIGHTS_OUT_STORAGE_KEY, LIGHTS_OUT_STORAGE_KEY,
  LIGHTS_OUT_UPDATED_EVENT, localNightKey, parseLightsOutJournal,
  type LightsOutAction, type LightsOutNight,
} from "@/lib/lights-out";
import {
  emptyNightRewards, earnedNightRewards, mergeNightRewards, NIGHT_REWARDS_STORAGE_KEY,
  parseNightRewards, prepareNightReward, recordNightReward, removeNightReward, rewardJournal,
  type NightCandidate, type NightRewardsState,
} from "@/lib/night-rewards";

interface Snapshot {
  ready: boolean;
  today: string;
  storageAvailable: boolean;
  state: NightRewardsState | null;
  legacy: LightsOutNight[];
}
const SERVER_SNAPSHOT: Snapshot = { ready: false, today: "", storageAvailable: true, state: null, legacy: [] };
// One document-level store keeps visit-only rewards when navigating between
// Lights Out, a species profile, and the gallery with browser storage disabled.
let snapshot: Snapshot = SERVER_SNAPSHOT;
let initialized = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const getSnapshot = () => snapshot;
const getServerSnapshot = () => SERVER_SNAPSHOT;
function publish(next: Snapshot) { snapshot = next; for (const listener of listeners) listener(); }
const newState = () => emptyNightRewards(typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

function readLatest(): Snapshot {
  const current = { ...snapshot, ready: true, today: localNightKey(), state: snapshot.state || newState() };
  try {
    const stored = parseNightRewards(localStorage.getItem(NIGHT_REWARDS_STORAGE_KEY));
    let legacy = parseLightsOutJournal(localStorage.getItem(LIGHTS_OUT_STORAGE_KEY));
    const imported = importLegacyNight(localStorage.getItem(LEGACY_LIGHTS_OUT_STORAGE_KEY));
    if (imported && !legacy.some((night) => night.date === imported.date)) legacy.push(imported);
    // If the last write failed, a readable stale copy must not erase this visit.
    if (!snapshot.storageAvailable) legacy = parseLightsOutJournal(JSON.stringify([...legacy, ...snapshot.legacy]));
    return { ...current, legacy, state: stored ? (snapshot.state ? mergeNightRewards(current.state, stored) : stored) : current.state };
  } catch { return { ...current, storageAvailable: false }; }
}

function persist(next: Snapshot, announce = true): Snapshot {
  let result = next;
  try {
    // Save the authoritative ledger first. The v2 journal remains readable by
    // earlier versions, but can never grant a stamp without the explicit ledger.
    localStorage.setItem(NIGHT_REWARDS_STORAGE_KEY, JSON.stringify(next.state));
    localStorage.setItem(LIGHTS_OUT_STORAGE_KEY, JSON.stringify(rewardJournal(next.state!, next.legacy)));
    localStorage.removeItem(LEGACY_LIGHTS_OUT_STORAGE_KEY);
    result = { ...next, storageAvailable: true };
  } catch { result = { ...next, storageAvailable: false }; }
  publish(result);
  if (announce) window.dispatchEvent(new Event(LIGHTS_OUT_UPDATED_EVENT));
  return result;
}

function syncFromStorage(event?: StorageEvent) {
  if (event && event.key !== null && ![NIGHT_REWARDS_STORAGE_KEY, LIGHTS_OUT_STORAGE_KEY, LEGACY_LIGHTS_OUT_STORAGE_KEY].includes(event.key)) return;
  if (event && (event.key === null || (event.key === NIGHT_REWARDS_STORAGE_KEY && event.newValue === null))) {
    // Explicitly clearing browser data also clears the in-memory earned state.
    publish({ ...SERVER_SNAPSHOT, ready: true, today: localNightKey(), state: newState() });
    return;
  }
  const next = readLatest();
  if (event?.key === NIGHT_REWARDS_STORAGE_KEY && event.newValue) {
    const incoming = parseNightRewards(event.newValue);
    if (incoming) next.state = mergeNightRewards(next.state!, incoming);
    // A stale tab may have overwritten a different date. Write the converged
    // merge once; identical payloads stop the cross-tab event cycle.
    try {
      if (JSON.stringify(next.state) !== localStorage.getItem(NIGHT_REWARDS_STORAGE_KEY)) { persist(next, false); return; }
    } catch { next.storageAvailable = false; }
  }
  publish(next);
}

function initialize() {
  if (initialized) return;
  initialized = true;
  persist(readLatest(), false);
  window.addEventListener("storage", syncFromStorage);
  window.addEventListener(LIGHTS_OUT_UPDATED_EVENT, () => syncFromStorage());
  const updateDate = () => {
    const today = localNightKey();
    if (today !== snapshot.today) publish({ ...snapshot, today });
  };
  window.addEventListener("focus", updateDate);
  document.addEventListener("visibilitychange", updateDate);
  window.setInterval(updateDate, 30_000);
}

function prepareNight(candidates: readonly NightCandidate[]) {
  if (!snapshot.ready) return null;
  const now = new Date();
  const latest = readLatest();
  const result = prepareNightReward(latest.state!, candidates, localNightKey(now), now.toISOString());
  if (!result.assignment) return null;
  persist({ ...latest, state: result.state });
  return result.assignment;
}

function recordNight(input: { candidates: readonly NightCandidate[]; actions: readonly LightsOutAction[]; confirmedAfterDark: boolean; expectedDate?: string }) {
  if (!snapshot.ready) return null;
  const now = new Date();
  const today = localNightKey(now);
  // A confirmation made before midnight cannot silently earn the next night.
  if (input.expectedDate && input.expectedDate !== today) {
    publish({ ...snapshot, today });
    return null;
  }
  const latest = readLatest();
  const result = recordNightReward(latest.state!, { ...input, date: today, now: now.toISOString() });
  if (!result.reward) return null;
  persist({ ...latest, state: result.state, today });
  return result.reward;
}

function removeNight(date: string) {
  if (!snapshot.ready) return;
  const latest = readLatest();
  persist({ ...latest, state: removeNightReward(latest.state!, date, new Date().toISOString()) });
}

export function useNightRewards() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(initialize, []);
  const rewards = useMemo(() => current.state ? earnedNightRewards(current.state) : [], [current.state]);
  const journal = useMemo(() => current.state ? rewardJournal(current.state, current.legacy) : current.legacy, [current.state, current.legacy]);
  const unlocked = useMemo(() => new Set(rewards.map((reward) => reward.species)), [rewards]);
  return { ready: current.ready, today: current.today, storageAvailable: current.storageAvailable, rewards, journal, unlocked, prepareNight, recordNight, removeNight };
}
