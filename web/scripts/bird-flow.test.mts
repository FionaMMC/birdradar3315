import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import type * as BirdCatalog from "../lib/birds.ts";

const compiled = ts.transpileModule(readFileSync(new URL("../lib/birds.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { BIRDS, birdCollectionHref, birdMapHref, getBird, safeMapReturnTo, withMapReturn } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`) as typeof BirdCatalog;

test("every catalog bird has a working local profile and sources", () => {
  assert.equal(new Set(BIRDS.map((bird) => bird.id)).size, BIRDS.length);
  for (const bird of BIRDS) {
    assert.ok(existsSync(fileURLToPath(new URL(`../app/species/${bird.id}/page.tsx`, import.meta.url))), bird.id);
    assert.ok(bird.sources.length > 0, bird.id);
    if (bird.image) assert.ok(existsSync(fileURLToPath(new URL(`../public${bird.image}`, import.meta.url))), bird.image);
    if (bird.photo) {
      assert.ok(existsSync(fileURLToPath(new URL(`../public${bird.photo}`, import.meta.url))), bird.photo);
      assert.ok(bird.photoCredit && bird.photoLicense && bird.photoSource, bird.id);
      assert.equal(new URL(bird.photoSource).hostname, "commons.wikimedia.org");
    }
    assert.equal(new URL(birdCollectionHref(bird), "https://birdradar.test").searchParams.get("species"), bird.id);
  }
});

test("map links distinguish supported samples from the nearby discovery flow", () => {
  for (const bird of BIRDS) {
    const params = new URL(birdMapHref(bird), "https://birdradar.test").searchParams;
    assert.equal(params.get("species"), bird.id);
    if (bird.dataStatus === "none") {
      assert.equal(params.get("view"), "nearby");
      assert.equal(params.get("month"), null);
    } else {
      assert.equal(params.get("month"), "all");
      assert.equal(params.get("view"), null);
    }
  }
  assert.deepEqual(BIRDS.filter((bird) => bird.dataStatus === "tracking").map((bird) => bird.id).sort(), ["eastern-curlew", "osprey", "waved-albatross"]);
  assert.equal(BIRDS.filter((bird) => bird.dataStatus === "observations").length, 17);
  assert.equal(BIRDS.length, 20);
});

test("missing species and unavailable artwork remain absent", () => {
  assert.equal(getBird("unknown-bird"), undefined);
  assert.equal(getBird(null), undefined);
  assert.equal(getBird(undefined), undefined);
  assert.equal(getBird("waved-albatross")?.image, undefined);
  assert.equal(getBird("bar-tailed-godwit")?.image, undefined);
  assert.equal(BIRDS.filter((bird) => bird.image).length, 7);
});

test("photographic stamp credits stay aligned with their licensed originals", () => {
  const photos = JSON.parse(readFileSync(new URL("../public/data/bird-photo-provenance.json", import.meta.url), "utf8"));
  assert.equal(photos.length, 13);
  for (const photo of photos) {
    const bird = getBird(photo.speciesId)!;
    assert.ok(bird, photo.speciesId);
    for (const field of ["photo", "photoCredit", "photoLicense", "photoLicenseUrl", "photoSource"] as const) {
      assert.equal(bird[field], photo[field], `${photo.speciesId} ${field}`);
    }
    assert.match(photo.sha256, /^[a-f0-9]{64}$/);
  }
});

test("every shipped tracking species has a reachable profile and truthful map status", () => {
  const snapshot = JSON.parse(readFileSync(new URL("../public/data/migration-snapshot.json", import.meta.url), "utf8"));
  for (const species of snapshot.species) {
    const profile = getBird(species.id);
    assert.ok(profile, `Missing profile for ${species.id}`);
    assert.equal(profile.dataStatus, species.kind === "telemetry" ? "tracking" : "observations");
    if (species.kind === "telemetry") {
      assert.ok(snapshot.tracks.some((track: { speciesId: string }) => track.speciesId === species.id));
    } else {
      assert.ok(snapshot.occurrences.some((point: { speciesId: string }) => point.speciesId === species.id), species.id);
    }
  }
  assert.deepEqual(snapshot.species.map((species: { id: string }) => species.id).sort(), BIRDS.map((bird) => bird.id).sort());
  assert.ok(Buffer.byteLength(JSON.stringify(snapshot)) < 4_000_000, "Snapshot leaves space for API summary fields");
});

test("nearby context survives collection and action links without allowing external returns", () => {
  const nearby = "/track-migration?view=nearby&lat=-33.87&lon=151.2&place=Sydney%20Harbour";
  const osprey = getBird("osprey")!;
  assert.equal(safeMapReturnTo(nearby), nearby);
  assert.equal(birdMapHref(osprey, nearby), nearby);
  assert.equal(new URL(birdCollectionHref(osprey, nearby), "https://birdradar.test").searchParams.get("returnTo"), nearby);
  const action = new URL(withMapReturn("/lights-out?species=osprey#night-journal", nearby), "https://birdradar.test");
  assert.equal(action.searchParams.get("returnTo"), nearby);
  assert.equal(action.searchParams.get("species"), "osprey");
  assert.equal(action.hash, "#night-journal");
  for (const bad of ["https://example.com/track-migration?view=nearby", "//example.com/track-migration?view=nearby", "/track-migration?view=global", "/collection?view=nearby", "javascript:alert(1)", "/track-migration/../collection?view=nearby"]) {
    assert.equal(safeMapReturnTo(bad), null, bad);
    assert.equal(birdCollectionHref(osprey, bad), "/collection?species=osprey");
  }
});

test("historical map context preserves species, month and layer through the journey", () => {
  const historical = "/track-migration?species=osprey&month=9&layer=tracks";
  const bird = getBird("osprey")!;
  assert.equal(safeMapReturnTo(historical), historical);
  assert.equal(birdMapHref(bird, historical), historical);
  assert.equal(new URL(birdCollectionHref(bird, historical), "https://birdradar.test").searchParams.get("returnTo"), historical);
  const action = new URL(withMapReturn("/lights-out?species=osprey&from=species", historical), "https://birdradar.test");
  assert.equal(action.searchParams.get("returnTo"), historical);
  assert.equal(action.searchParams.get("from"), "species");
  assert.equal(safeMapReturnTo("/track-migration?view=&species=osprey"), null);
  assert.equal(safeMapReturnTo("/track-migration?view=unknown&species=osprey"), null);
});
