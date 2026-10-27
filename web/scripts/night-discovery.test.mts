import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import type * as Discovery from "../lib/night-discovery.ts";
const compiled = ts.transpileModule(readFileSync(new URL("../lib/night-discovery.ts", import.meta.url), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const { seasonalNightCandidates } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`) as typeof Discovery;

test("night discovery matches the calendar month and exact catalog species without inventing local presence", () => {
  const birds = [{ id: "osprey", scientificName: "Pandion haliaetus" }, { id: "arctic-tern", scientificName: "Sterna paradisaea" }];
  const points = [{ scientificName: "Pandion haliaetus", eventDate: "2024-10-11" }, { scientificName: "Sterna paradisaea", eventDate: "2025-03-12" }, { scientificName: "Sterna unknown", eventDate: "2024-10-10" }];
  assert.deepEqual(seasonalNightCandidates(birds, points, 10, "Sydney"), [{ id: "osprey", evidence: "local-seasonal-observations", areaLabel: "Sydney" }]);
  assert.deepEqual(seasonalNightCandidates(birds, points, 8, "Sydney"), []);
  assert.deepEqual(seasonalNightCandidates(birds, points, NaN, "Sydney"), []);
});

test("repeated historical observations yield a single eligible species, never an abundance weighting", () => {
  const birds = [{ id: "osprey", scientificName: "Pandion haliaetus" }];
  const point = { scientificName: "Pandion haliaetus", eventDate: "2024-12-11" };
  assert.equal(seasonalNightCandidates(birds, [point, point], 12, "Chosen area").length, 1);
  assert.deepEqual(seasonalNightCandidates(birds, [{ ...point, eventDate: "invalid" }], 12, "Chosen area"), []);
});
