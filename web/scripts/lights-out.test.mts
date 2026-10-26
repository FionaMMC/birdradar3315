import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("../lib/lights-out.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { localNightKey, validNightKey, parseLightsOutJournal, importLegacyNight, recordLightsOutNight } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("a night uses a local calendar date, including just after midnight", () => {
  assert.equal(localNightKey(new Date(2026, 0, 2, 0, 5)), "2026-01-02");
  assert.equal(localNightKey(new Date(2026, 11, 31, 23, 59)), "2026-12-31");
  assert.equal(validNightKey("2024-02-29"), true);
  assert.equal(validNightKey("2026-02-29"), false);
  assert.equal(validNightKey("2026-13-01"), false);
  assert.equal(validNightKey("2026-1-2"), false);
});

test("journal loading drops malformed records and unrecognized actions", () => {
  assert.deepEqual(parseLightsOutJournal("not json"), []);
  assert.deepEqual(parseLightsOutJournal('{"date":"2026-10-25"}'), []);
  const entries = parseLightsOutJournal(JSON.stringify([
    null,
    { date: "2026-02-29", actions: ["outdoor"], recordedAt: "2026-10-25T11:00:00Z" },
    { date: "2026-10-25", actions: ["birds-saved"], recordedAt: "2026-10-25T11:00:00Z" },
    { date: "2026-10-24", actions: ["indoor"], recordedAt: "not a date" },
    { date: "2026-10-23", actions: ["curtains", "curtains", "birds-saved"], recordedAt: "2026-10-23T11:00:00Z", species: "<script>" },
  ]));
  assert.deepEqual(entries, [{ date: "2026-10-23", actions: ["curtains"], recordedAt: "2026-10-23T11:00:00Z" }]);
});

test("repeat actions update one night while preserving other nights", () => {
  const previous = [
    { date: "2026-10-25", actions: ["outdoor"], recordedAt: "2026-10-25T11:00:00Z" },
    { date: "2026-10-24", actions: ["curtains"], recordedAt: "2026-10-24T11:00:00Z" },
  ];
  const updated = recordLightsOutNight(previous, { date: "2026-10-25", actions: ["indoor", "curtains"], recordedAt: "2026-10-25T12:00:00Z", species: "osprey" });
  assert.equal(updated.length, 2);
  assert.deepEqual(updated[0].actions, ["indoor", "curtains"]);
  assert.equal(updated[0].species, "osprey");
  assert.deepEqual(updated[1], previous[1]);
  assert.equal(updated.filter((night: { date: string }) => night.date !== "2026-10-25").length, 1);
});

test("legacy check-ins preserve their date without inventing action details or timestamps", () => {
  const legacy = importLegacyNight("2026-1-2");
  assert.deepEqual(legacy, { date: "2026-01-02", actions: [], recordedAt: null, imported: true });
  assert.deepEqual(parseLightsOutJournal(JSON.stringify([legacy])), [legacy]);
  assert.equal(importLegacyNight("2026-2-30"), null);
  assert.equal(importLegacyNight(null), null);
});
