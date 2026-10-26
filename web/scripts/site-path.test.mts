import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import type * as SitePaths from "../lib/site-path.ts";

const source = readFileSync(new URL("../lib/site-path.ts", import.meta.url), "utf8");
async function pathsFor(basePath: string): Promise<typeof SitePaths> {
  // Next replaces this public variable at build time; exercise both build targets.
  const compiled = ts.transpileModule(source.replace("process.env.NEXT_PUBLIC_BASE_PATH", JSON.stringify(basePath)), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}
const local = await pathsFor("");
const pages = await pathsFor("/birdradar3315");

test("normal server paths stay rooted without a configured prefix", () => {
  assert.equal(local.assetUrl("/assets/films/snipe.mp4"), "/assets/films/snipe.mp4");
  assert.equal(local.sitePath("/species/osprey?from=map"), "/species/osprey?from=map");
  assert.equal(local.stripBasePath("/track-migration?month=9"), "/track-migration?month=9");
});

test("Pages public files and native links carry one repository prefix", async () => {
  assert.equal(pages.assetUrl("/assets/Black-faced Spoonbill.png"), "/birdradar3315/assets/Black-faced Spoonbill.png");
  assert.equal(pages.assetUrl("/data/migration-snapshot.json"), "/birdradar3315/data/migration-snapshot.json");
  assert.equal(pages.sitePath("/species/osprey?from=map#field-notes"), "/birdradar3315/species/osprey?from=map#field-notes");
  assert.equal(pages.sitePath("/birdradar3315/species/osprey"), "/birdradar3315/species/osprey");
  assert.equal(pages.sitePath("/birdradar3315?month=9"), "/birdradar3315?month=9");
  assert.equal((await pathsFor("/birdradar3315/")).sitePath("/"), "/birdradar3315/");
});

test("external URLs, anchors and document-relative paths are untouched", () => {
  for (const path of ["https://doi.org/10.5441/001/1.v8r49083", "//example.org/bird.jpg", "data:image/svg+xml;base64,abc", "#field-notes", "?month=9", "assets/bird.jpg", ""]) {
    assert.equal(pages.sitePath(path), path);
    assert.equal(pages.assetUrl(path), path);
    assert.equal(pages.stripBasePath(path), path);
  }
});

test("map returns strip only the complete base path and preserve query state", () => {
  assert.equal(pages.stripBasePath("/birdradar3315/track-migration/?month=9&view=nearby&lat=-33.87&lon=151.21"), "/track-migration/?month=9&view=nearby&lat=-33.87&lon=151.21");
  assert.equal(pages.stripBasePath("/birdradar3315"), "/");
  assert.equal(pages.stripBasePath("/birdradar3315?month=9"), "/?month=9");
  assert.equal(pages.stripBasePath("/birdradar3315-other/track-migration"), "/birdradar3315-other/track-migration");
  assert.equal(pages.sitePath("/birdradar3315-other/track-migration"), "/birdradar3315/birdradar3315-other/track-migration");
  const returnTo = pages.stripBasePath("/birdradar3315/track-migration/").replace(/\/$/, "") + "?month=9&species=osprey";
  const href = new URL(pages.sitePath(`/species/osprey?from=map&returnTo=${encodeURIComponent(returnTo)}`), "https://fionammc.github.io");
  assert.equal(href.pathname, "/birdradar3315/species/osprey");
  assert.equal(href.searchParams.get("returnTo"), "/track-migration?month=9&species=osprey");
});
