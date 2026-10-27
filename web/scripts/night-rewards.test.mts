import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";
import type * as Rewards from "../lib/night-rewards.ts";

const moduleUrl = (text: string) => `data:text/javascript;base64,${Buffer.from(text).toString("base64")}`;
const compile = (path: string) => ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const lightsUrl = moduleUrl(compile("../lib/lights-out.ts"));
const rewardsUrl = moduleUrl(compile("../lib/night-rewards.ts").replace('"./lights-out"', JSON.stringify(lightsUrl)));
const { emptyNightRewards, parseNightRewards, mergeNightRewards, earnedNightRewards, rewardJournal, prepareNightReward, recordNightReward, removeNightReward } = await import(rewardsUrl) as typeof Rewards;
const candidates = [{ id: "osprey" }, { id: "eastern-curlew" }, { id: "waved-albatross" }];
const date = "2026-10-27";
const now = "2026-10-27T10:00:00.000Z";
const fresh = () => emptyNightRewards("test-device");
const award = (state: Rewards.NightRewardsState, day = date, options = candidates) => recordNightReward(state, { date: day, now, candidates: options, actions: ["curtains"], confirmedAfterDark: true });

test("legacy check-ins and malformed storage cannot unlock stamps", () => {
  assert.equal(parseNightRewards("broken"), null);
  assert.equal(parseNightRewards(JSON.stringify({ version: 1, seed: "<script>", entries: [] })), null);
  const legacy = [{ date, actions: ["curtains"] as const, recordedAt: now, species: "osprey" }];
  assert.equal(rewardJournal(fresh(), legacy as never).length, 1);
  assert.deepEqual(earnedNightRewards(fresh()), []);
  const corrupt = parseNightRewards(JSON.stringify({ version: 1, seed: "test", entries: [
    { date, change: { kind: "earned", changedAt: now, recordedAt: now, actions: ["curtains"] } },
    { date: "2026-02-30", assignment: { date: "2026-02-30", species: "osprey", evidence: "global-discovery", assignedAt: now } },
    { date, assignment: { date, species: "<script>", evidence: "global-discovery", assignedAt: now } },
  ] }));
  assert.deepEqual(corrupt?.entries, []);
});

test("preparing or cancelling a mystery awards nothing and refresh cannot reroll it", () => {
  const prepared = prepareNightReward(fresh(), candidates, date, now);
  assert.ok(prepared.assignment);
  assert.deepEqual(earnedNightRewards(prepared.state), []);
  assert.deepEqual(rewardJournal(prepared.state, []), []);
  const reloaded = parseNightRewards(JSON.stringify(prepared.state))!;
  const retry = prepareNightReward(reloaded, [{ id: "different-bird" }], date, "2026-10-27T11:00:00Z");
  assert.deepEqual(retry.assignment, prepared.assignment);
});

test("selection is stable across candidate order and prefers new local seasonal birds", () => {
  const first = prepareNightReward(fresh(), candidates, date, now).assignment!;
  assert.equal(prepareNightReward(fresh(), [...candidates].reverse(), date, now).assignment?.species, first.species);
  const initial = award(fresh(), "2026-10-26").state;
  const next = prepareNightReward(initial, candidates, date, now).assignment!;
  assert.notEqual(next.species, earnedNightRewards(initial)[0].species);
  const local = prepareNightReward(fresh(), [...candidates, { id: "local-bird", evidence: "local-seasonal-observations", areaLabel: "Sydney" }], date, now).assignment!;
  assert.equal(local.species, "local-bird");
  assert.equal(local.areaLabel, "Sydney");
  assert.equal(local.evidence, "local-seasonal-observations");
  const duplicateLocal = prepareNightReward(fresh(), [{ id: "osprey" }, { id: "osprey", evidence: "local-seasonal-observations" }], date, now).assignment!;
  assert.equal(duplicateLocal.evidence, "local-seasonal-observations");
});

test("only a confirmed physical action awards, and duplicate submission is idempotent", () => {
  const base = { date, now, candidates, actions: ["curtains"] as const, confirmedAfterDark: true };
  assert.equal(recordNightReward(fresh(), { ...base, confirmedAfterDark: false }).reward, null);
  assert.equal(recordNightReward(fresh(), { ...base, actions: [] }).reward, null);
  assert.equal(recordNightReward(fresh(), { ...base, candidates: [] }).reward, null);
  assert.equal(recordNightReward(fresh(), { ...base, candidates: [{ id: "bad/id" }] }).reward, null);
  const first = recordNightReward(fresh(), base);
  const duplicate = recordNightReward(first.state, { ...base, now: "2026-10-27T11:00:00Z", candidates: [{ id: "another-bird" }], actions: ["outdoor"] });
  assert.deepEqual(duplicate.reward, first.reward);
  assert.equal(earnedNightRewards(duplicate.state).length, 1);
  assert.equal(rewardJournal(duplicate.state, []).length, 1);
});

test("removal revokes only its night and re-adding cannot earn a different bird", () => {
  const single = [{ id: "osprey" }];
  const first = award(fresh(), "2026-10-26", single).state;
  const second = award(first, date, single).state;
  const removed = removeNightReward(second, date, "2026-10-27T11:00:00Z");
  assert.deepEqual(earnedNightRewards(removed).map((night) => night.date), ["2026-10-26"]);
  assert.equal(earnedNightRewards(removed)[0].species, "osprey");
  const readded = recordNightReward(removed, { date, now: "2026-10-27T11:00:00Z", candidates: [{ id: "other-bird" }], actions: ["outdoor"], confirmedAfterDark: true });
  assert.equal(readded.reward?.species, "osprey");
  assert.equal(earnedNightRewards(readded.state).length, 2);
  const allRemoved = removeNightReward(removed, "2026-10-26", now);
  assert.deepEqual(earnedNightRewards(allRemoved), []);
  assert.deepEqual(rewardJournal(allRemoved, [{ date, actions: ["outdoor"], recordedAt: now, species: "osprey" }]), []);
});

test("cross-tab merges preserve other dates, undo tombstones, and immutable assignments", () => {
  const a = award(fresh(), "2026-10-26", [{ id: "osprey" }]).state;
  const b = award(fresh(), date, [{ id: "eastern-curlew" }]).state;
  const joined = mergeNightRewards(a, b);
  assert.equal(earnedNightRewards(joined).length, 2);
  assert.deepEqual(mergeNightRewards(a, b), mergeNightRewards(b, a));
  const undone = removeNightReward(joined, date, "2026-10-27T11:00:00Z");
  assert.equal(earnedNightRewards(mergeNightRewards(undone, b)).length, 1);
  const competing = recordNightReward(fresh(), { date, now: "2026-10-27T12:00:00Z", candidates: [{ id: "different-bird" }], actions: ["curtains"], confirmedAfterDark: true }).state;
  assert.equal(mergeNightRewards(b, competing).entries[0].assignment?.species, "eastern-curlew");
  assert.deepEqual(mergeNightRewards(b, competing), mergeNightRewards(competing, b));
  assert.deepEqual(parseNightRewards(JSON.stringify(undone)), undone);
});

test("shared hook keeps visit-only rewards across routes and refuses midnight stale confirmation", async () => {
  const values = new Map<string, string>();
  let failWrites = false;
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { if (failWrites) throw new Error("storage unavailable"); values.set(key, value); }, removeItem: (key: string) => { if (failWrites) throw new Error("storage unavailable"); values.delete(key); } };
  const original = { localStorage: globalThis.localStorage, window: globalThis.window, document: globalThis.document };
  Object.assign(globalThis, { localStorage: storage, window: Object.assign(new EventTarget(), { setInterval: () => 0 }), document: new EventTarget() });
  try {
    const reactUrl = moduleUrl("export const useEffect = fn => fn(); export const useMemo = fn => fn(); export const useSyncExternalStore = (_, get) => get();");
    const hookUrl = moduleUrl(compile("../components/atlas/useNightRewards.ts")
      .replace('"react"', JSON.stringify(reactUrl)).replace('"@/lib/lights-out"', JSON.stringify(lightsUrl)).replace('"@/lib/night-rewards"', JSON.stringify(rewardsUrl)));
    const { useNightRewards } = await import(hookUrl);
    useNightRewards();
    let hook = useNightRewards();
    assert.equal(hook.ready, true);
    assert.equal(hook.recordNight({ candidates, actions: ["curtains"], confirmedAfterDark: true, expectedDate: "2000-01-01" }), null);
    assert.equal(useNightRewards().rewards.length, 0);
    failWrites = true;
    const reward = hook.recordNight({ candidates, actions: ["curtains"], confirmedAfterDark: true, expectedDate: hook.today });
    assert.ok(reward);
    hook = useNightRewards();
    assert.equal(hook.storageAvailable, false);
    assert.equal(hook.unlocked.has(reward.species), true);
    assert.equal(hook.journal.length, 1);
    // Another mounted route reads the same fallback; old readable storage does
    // not erase it after a quota failure.
    hook.prepareNight([{ id: "different-bird" }]);
    assert.equal(useNightRewards().rewards[0].species, reward.species);
    hook.removeNight(hook.today);
    assert.equal(useNightRewards().unlocked.size, 0);
    const retry = useNightRewards().recordNight({ candidates: [{ id: "different-bird" }], actions: ["outdoor"], confirmedAfterDark: true });
    assert.equal(retry.species, reward.species);
    failWrites = false;
    useNightRewards().prepareNight(candidates);
    assert.equal(useNightRewards().storageAvailable, true);
    assert.ok(values.get("birdradar:night-rewards:v1"));
  } finally { Object.assign(globalThis, original); }
});
