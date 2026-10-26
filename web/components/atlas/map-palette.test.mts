import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("./map-palette.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { DENSITY_SATURATION, densityTransfer, migrationKernel, pearlColor } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("density uses a fixed 10% saturation, without a per-month maximum", () => {
  assert.equal(DENSITY_SATURATION, .1);
  assert.equal(densityTransfer(0), 0);
  assert.equal(densityTransfer(-.1), 0);
  assert.equal(densityTransfer(.1), 1);
  assert.equal(densityTransfer(.8), 1);
  assert.ok(densityTransfer(.05) > 0 && densityTransfer(.05) < 1);
  const august = [.002, .05, .09];
  const september = [.05, .5];
  assert.equal(august.map(densityTransfer)[1], september.map(densityTransfer)[0]);
});

test("the geographic smoothing kernel has finite support and a monotonic falloff", () => {
  assert.equal(migrationKernel(0), 1);
  assert.equal(migrationKernel(1), 0);
  assert.equal(migrationKernel(10), 0);
  let last = 1;
  for (let distance = 0; distance <= 1; distance += .01) {
    const next = migrationKernel(distance);
    assert.ok(next >= 0 && next <= last);
    last = next;
  }
});

test("species retain distinct bounded palettes at equal sample share", () => {
  assert.notDeepEqual(pearlColor("osprey", .5), pearlColor("waved-albatross", .5));
  assert.notDeepEqual(pearlColor("osprey", .5), pearlColor("eastern-curlew", .5));
  for (const species of ["osprey", "waved-albatross", "eastern-curlew", "bar-tailed-godwit"]) {
    for (let share = 0; share <= 1; share += .01) {
      assert.ok(pearlColor(species, share).every((channel: number) => Number.isFinite(channel) && channel >= 0 && channel <= 255));
    }
  }
});
