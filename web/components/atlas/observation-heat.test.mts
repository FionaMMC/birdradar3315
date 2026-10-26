import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("./observation-heat.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { observationHeatCells, uniqueObservationPoints } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const point = (id: string, latitude: number, longitude: number) => ({ id, latitude, longitude });

test("record shares retain the full-period denominator when the month changes", () => {
  const january = [point("jan-a", -33.81, 151.21), point("jan-b", -33.82, 151.22)];
  const february = [point("feb-a", -33.83, 151.23)];
  const denominator = uniqueObservationPoints([...january, ...february]).length;
  assert.equal(observationHeatCells(january, denominator, 1)[0].weight, 2 / 3);
  assert.equal(observationHeatCells(february, denominator, 1)[0].weight, 1 / 3);
  assert.equal(observationHeatCells([...january, ...february], denominator, 1)[0].weight, 1);
  assert.deepEqual(observationHeatCells([], denominator, 1), []);
});

test("repeated ids and invalid coordinates cannot inflate observation heat", () => {
  const records = [point("a", -34, 151), point("a", -34, 151), point("b", -33, 150), point("invalid", 95, 140), point("nan", NaN, 130), point("", -35, 150)];
  const cells = observationHeatCells(records, 2, 1);
  assert.equal(cells.reduce((sum: number, cell: {recordCount: number}) => sum + cell.recordCount, 0), 2);
  assert.equal(cells.reduce((sum: number, cell: {weight: number}) => sum + cell.weight, 0), 1);
  assert.throws(() => observationHeatCells(records, 1, 1), RangeError);
});

test("aggregation keeps actual local centroids and separates distant records", () => {
  const cells = observationHeatCells([point("a", -33.811, 151.211), point("b", -33.819, 151.219), point("c", -35.25, 151.21)], 3, .01);
  assert.equal(cells.length, 2);
  const nearby = cells.find((cell: {recordCount: number}) => cell.recordCount === 2);
  assert.ok(Math.abs(nearby.latitude - -33.815) < 1e-9);
  assert.ok(Math.abs(nearby.longitude - 151.215) < 1e-9);
  assert.equal(nearby.weight, 2 / 3);
});

test("date-line coordinates stay local, with bounded values and honest empty samples", () => {
  const cells = observationHeatCells([point("a", -17.1, 180), point("b", -17.2, -179.9)], 2, 1);
  assert.equal(cells.length, 1);
  assert.ok(cells[0].longitude < -179);
  assert.equal(cells[0].weight, 1);
  assert.deepEqual(observationHeatCells([], 0, .01), []);
  assert.throws(() => observationHeatCells([], 0, 0), RangeError);
});
