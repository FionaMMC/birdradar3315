import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import type { MigrationDataset, MigrationTrack } from "../lib/migration-data.ts";

// Compile the production module in memory; the application uses CommonJS package
// metadata while Next compiles its TypeScript modules as ESM.
const source = readFileSync(new URL("../lib/migration-data.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const { filterMigrationData, getMigrationHeatCells, getMigrationSummary } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const point = (timestamp: string, latitude = 1.2, longitude = 2.2) => ({ timestamp, latitude, longitude, month: new Date(timestamp).getUTCMonth() + 1 });
const track = (individualId: string, points: MigrationTrack["points"], sourceId = "study"): MigrationTrack => ({ id: `${sourceId}:${individualId}`, individualId, sourceId, speciesId: "bird", points });
const data = (tracks: MigrationTrack[]): MigrationDataset => ({ version: 1, generatedAt: "2026-10-23T00:00:00.000Z", sources: [], species: [], occurrences: [], tracks });

test("month filtering never joins separate years or modifies source records", () => {
  const original = data([track("A", [point("2020-01-01T00:00:00.000Z"), point("2020-02-01T00:00:00.000Z"), point("2021-01-01T00:00:00.000Z")])]);
  const filtered = filterMigrationData(original, { month: 1 });
  assert.deepEqual(filtered.tracks.map((t) => t.points.length), [1, 1]);
  assert.equal(original.tracks[0].points.length, 3);
  assert.equal(getMigrationSummary(filtered).individualCount, 1);
  assert.throws(() => filterMigrationData(original, { month: 13 }), RangeError);
});

test("density normalizes distinct animals, not telemetry sampling rate", () => {
  const repeated = Array.from({ length: 100 }, () => point("2020-01-01T00:00:00.000Z"));
  const snapshot = data([track("A", repeated), track("A", repeated), track("B", [point("2020-01-01T00:00:00.000Z", 12.2, 22.2)])]);
  const cells = getMigrationHeatCells(snapshot);
  assert.equal(cells.length, 2);
  assert.deepEqual(cells.map((c) => c.individualCount), [1, 1]);
  assert.deepEqual(cells.map((c) => c.weight), [0.5, 0.5]);
});

test("same local animal identifier in different studies is counted independently", () => {
  const snapshot = data([track("A", [point("2020-01-01T00:00:00.000Z")]), track("A", [point("2020-01-01T00:00:00.000Z")], "another-study")]);
  assert.equal(getMigrationSummary(snapshot).individualCount, 2);
  assert.equal(getMigrationHeatCells(snapshot)[0].individualCount, 2);
});

test("missing species and missing months remain empty, without demo fallbacks", () => {
  const snapshot = data([track("A", [point("2020-01-01T00:00:00.000Z")])]);
  assert.equal(filterMigrationData(snapshot, { species: "missing" }).tracks.length, 0);
  assert.equal(getMigrationSummary(filterMigrationData(snapshot, { month: 10 })).individualCount, 0);
});

test("edge cells stay inside coordinate bounds even when their size does not divide the globe", () => {
  const cells = getMigrationHeatCells(data([track("A", [point("2020-01-01T00:00:00.000Z", 90, 180)])]), 7);
  assert.ok(cells[0].longitude <= 180 && cells[0].latitude <= 90);
});
