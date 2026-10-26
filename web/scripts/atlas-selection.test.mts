import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import type * as AtlasModel from "../lib/atlas-selection.ts";

const compiled = ts.transpileModule(readFileSync(new URL("../lib/atlas-selection.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { parseAtlasSelection, updateAtlasSelection, parseAtlasArea } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`) as typeof AtlasModel;
const params = (query: string) => new URLSearchParams(query);

test("legacy nearby links use the shared month and layer controls, with canonical values taking precedence", () => {
  const legacy = params("view=nearby&lat=-33.87&lon=151.21&nearbyMonth=10&nearbyLayer=points&recordSpecies=2481830");
  assert.equal(parseAtlasSelection(legacy).scope, "nearby");
  assert.equal(parseAtlasSelection(legacy).month, 10);
  assert.equal(parseAtlasSelection(legacy).layer, "observations");
  assert.equal(parseAtlasSelection(legacy).recordSpecies, "2481830");
  legacy.set("month", "all"); legacy.set("layer", "observation-heat");
  assert.equal(parseAtlasSelection(legacy).month, null);
  assert.equal(parseAtlasSelection(legacy).layer, "observation-heat");
  const canonical = updateAtlasSelection(legacy, { month: 12 });
  assert.equal(canonical.get("month"), "12");
  assert.equal(canonical.get("nearbyMonth"), null);
  assert.equal(canonical.get("nearbyLayer"), null);
  assert.equal(canonical.get("recordSpecies"), "2481830");
  assert.equal(canonical.get("lat"), "-33.87");
});

test("a location-less Near home link opens a locator while the existing historical map remains", () => {
  const selection = parseAtlasSelection(params("view=nearby&species=lathams-snipe"));
  assert.equal(selection.scope, "historical");
  assert.equal(selection.locatorRequested, true);
  assert.equal(selection.area, null);
  assert.equal(parseAtlasSelection(params("species=osprey")).locatorRequested, false);
});

test("coordinates reject missing, ambiguous, nonfinite and nondecimal values; zero remains a valid location", () => {
  assert.deepEqual(parseAtlasArea(params("lat=0&lon=0")), { latitude: 0, longitude: 0, name: "Chosen area" });
  assert.deepEqual(parseAtlasArea(params("lat=-33.867123&lon=151.209399&place=Sydney")), { latitude: -33.87, longitude: 151.21, name: "Sydney" });
  for (const query of ["lon=0", "lat=&lon=0", "lat=0&lon=", "lat=0&lat=1&lon=0", "lat=85.01&lon=0", "lat=-86&lon=0", "lat=0&lon=181", "lat=NaN&lon=0", "lat=Infinity&lon=0", "lat=0x10&lon=0", "lat=%20&lon=0"]) {
    assert.equal(parseAtlasArea(params(query)), null, query);
    assert.equal(parseAtlasSelection(params(`view=nearby&${query}`)).locatorRequested, true, query);
  }
});

test("choosing an area preserves the common month, resets the layer and selected records, and rounds before URL use", () => {
  const old = params("species=osprey&month=8&layer=tracks&recordSpecies=old&nearbyMonth=2");
  const next = updateAtlasSelection(old, { area: { latitude: -33.867123, longitude: 151.209399, name: "Sydney" } });
  assert.equal(next.get("month"), "8");
  assert.equal(next.get("view"), "nearby");
  assert.equal(next.get("layer"), "observation-heat");
  assert.equal(next.get("lat"), "-33.87");
  assert.equal(next.get("lon"), "151.21");
  assert.equal(next.get("recordSpecies"), null);
  assert.equal(old.get("layer"), "tracks", "input query remains unchanged");
  assert.equal(updateAtlasSelection(old, { area: { latitude: 0, longitude: 0, name: "Equator" }, recordSpecies: "123" }).get("recordSpecies"), "123");
});

test("returning to worldwide journeys clears area context and leaves the selected month intact", () => {
  const next = updateAtlasSelection(params("view=nearby&lat=0&lon=0&place=Home&recordSpecies=all&nearbyMonth=11&nearbyLayer=points"), { scope: "historical", species: "eastern-curlew" });
  for (const key of ["view", "lat", "lon", "place", "recordSpecies", "nearbyMonth", "nearbyLayer"]) assert.equal(next.get(key), null, key);
  assert.equal(next.get("month"), "11");
  assert.equal(next.get("layer"), "density");
  assert.equal(next.get("species"), "eastern-curlew");
});

test("month values are bounded and invalid canonical values never revive an older legacy month", () => {
  assert.equal(parseAtlasSelection(params("")).month, 9);
  assert.equal(parseAtlasSelection(params("view=nearby&lat=0&lon=0")).month, null);
  for (const value of ["0", "13", "2.5", "01", "NaN", "", "-1"]) {
    assert.equal(parseAtlasSelection(params(`month=${value}`)).month, 9, value);
    assert.equal(parseAtlasSelection(params(`view=nearby&lat=0&lon=0&month=${value}&nearbyMonth=4`)).month, null, value);
  }
  for (const month of [0, 13, 2.5, NaN]) assert.throws(() => updateAtlasSelection(params(""), { month }), RangeError);
  assert.equal(parseAtlasSelection(params("month=12")).month, 12);
  assert.equal(parseAtlasSelection(params("month=all")).month, null);
});
