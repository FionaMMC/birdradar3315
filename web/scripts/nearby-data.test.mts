import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/nearby-data.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const { parseNearbyCenter, distanceKm, nearbyBounds, nearbyPeriod, gbifNearbyUrls, buildNearbyResponse, parsePlaceQuery, parsePlaceResults, parseGbifPage, nearbyLongitudeNear, nearbyPointAttribution } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const center = { latitude: 0, longitude: 0 };
const period = { from: "2024-10-25", to: "2026-10-25" };
const occurrence = (key: number, latitude = 0, longitude = 0, changes: Record<string, unknown> = {}) => ({
  key, decimalLatitude: latitude, decimalLongitude: longitude, speciesKey: 2481469, species: "Pandion haliaetus",
  classKey: 212, occurrenceStatus: "PRESENT", basisOfRecord: "HUMAN_OBSERVATION", eventDate: "2025-05-03T14:15:00",
  datasetKey: "dataset-a", datasetName: "Shared observations", license: "http://creativecommons.org/licenses/by/4.0/legalcode",
  ...changes,
});
const response = (results: unknown[]) => buildNearbyResponse([{ results, count: results.length, endOfRecords: true }], center, period, new Date("2026-10-25T00:00:00Z"));

test("location parsing preserves zero and rounds before upstream use; missing/ambiguous/nonfinite inputs fail", () => {
  assert.deepEqual(parseNearbyCenter(new URLSearchParams("lat=0&lon=0")), center);
  assert.deepEqual(parseNearbyCenter(new URLSearchParams("lat=-33.867123&lon=151.209399")), { latitude: -33.87, longitude: 151.21 });
  for (const query of ["lon=0", "lat=&lon=0", "lat=0&lon=", "lat=0&lat=1&lon=0", "lat=91&lon=0", "lat=0&lon=-181", "lat=NaN&lon=0", "lat=Infinity&lon=0", "lat=0x10&lon=0", "lat=%20&lon=0"]) {
    assert.throws(() => parseNearbyCenter(new URLSearchParams(query)), RangeError, query);
  }
  assert.deepEqual(parseNearbyCenter(new URLSearchParams("lat=90&lon=180")), { latitude: 90, longitude: 180 });
});

test("nearby search is a circle rather than its square bounding box and wraps across the date line", () => {
  const result = response([occurrence(1), occurrence(2, 0, 0.2), occurrence(3, 0.2, 0.2)]);
  assert.deepEqual(result.points.map((p: { id: string }) => p.id), ["1", "2"]);
  assert.ok(distanceKm({ latitude: 0, longitude: 179.9 }, { latitude: 0, longitude: -179.9 }) < 25);
  const dateLine = buildNearbyResponse([{ results: [occurrence(4, 0, -179.9)], count: 1, endOfRecords: true }], { latitude: 0, longitude: 179.9 }, period);
  assert.equal(dateLine.totalRecords, 1);
});

test("search boxes contain every point on the 25 km circle, including polar and antimeridian searches", () => {
  for (const location of [center, { latitude: -33.87, longitude: 151.21 }, { latitude: 0, longitude: 179.99 }, { latitude: 0, longitude: -179.99 }, { latitude: 89.9, longitude: 10 }, { latitude: -90, longitude: 180 }]) {
    const boxes = nearbyBounds(location);
    for (const box of boxes) {
      assert.ok(box.south >= -90 && box.north <= 90 && box.south <= box.north);
      assert.ok(box.west >= -180 && box.east <= 180 && box.west <= box.east);
    }
    for (let bearing = 0; bearing < 360; bearing += 5) {
      // Independent forward-geodesic check catches a longitude box that is too narrow at high latitudes.
      const angular = 24.999 / 6371.0088;
      const lat = location.latitude * Math.PI / 180;
      const lon = location.longitude * Math.PI / 180;
      const direction = bearing * Math.PI / 180;
      const outLat = Math.asin(Math.sin(lat) * Math.cos(angular) + Math.cos(lat) * Math.sin(angular) * Math.cos(direction));
      const outLon = lon + Math.atan2(Math.sin(direction) * Math.sin(angular) * Math.cos(lat), Math.cos(angular) - Math.sin(lat) * Math.sin(outLat));
      const latitude = outLat * 180 / Math.PI;
      const longitude = ((outLon * 180 / Math.PI + 540) % 360) - 180;
      assert.ok(boxes.some((b: { south: number; north: number; west: number; east: number }) => latitude >= b.south - 1e-8 && latitude <= b.north + 1e-8 && longitude >= b.west - 1e-8 && longitude <= b.east + 1e-8), `${JSON.stringify(location)}, bearing ${bearing}`);
    }
  }
});

test("dates are a two-year UTC window with a valid leap-day boundary", () => {
  assert.deepEqual(nearbyPeriod(new Date("2026-10-25T23:59:59Z")), period);
  assert.deepEqual(nearbyPeriod(new Date("2024-02-29T01:00:00Z")), { from: "2022-02-28", to: "2024-02-29" });
  assert.throws(() => nearbyPeriod(new Date("invalid")), RangeError);
});

test("only identified, licensed, in-window bird observations become sample points; records are deduplicated", () => {
  const valid = occurrence(1);
  const result = response([valid, valid,
    occurrence(2, 0, 0, { eventDate: "2024-01-01" }), occurrence(3, 0, 0, { eventDate: "2027-01-01" }),
    occurrence(4, 0, 0, { eventDate: "2025-02-30" }), occurrence(5, 0, 0, { eventDate: "2025-02" }),
    occurrence(6, 0, 0, { license: "https://creativecommons.org/licenses/by-nc/4.0/" }),
    occurrence(7, 0, 0, { basisOfRecord: "PRESERVED_SPECIMEN" }), occurrence(8, 0, 0, { classKey: 359 }),
    occurrence(9, 0, 0, { speciesKey: null }), occurrence(10, 0, 0, { occurrenceStatus: "ABSENT" }),
    occurrence(11, Number.NaN), occurrence(12, 0, 181),
    occurrence(13, 0, 0, { eventDate: "2024-10-25", license: "https://creativecommons.org/publicdomain/zero/1.0/", rightsHolder: "Bird observer" }),
    occurrence(14, 0, 0, { eventDate: "2026-10-25", speciesKey: 2498190, species: "Limosa lapponica" }),
  ]);
  assert.equal(result.totalRecords, 3);
  assert.equal(result.species.length, 2);
  assert.equal(result.species[0].count, 2);
  assert.equal(result.species[0].firstObserved, "2024-10-25");
  assert.equal(result.species[0].lastObserved, "2025-05-03");
  assert.equal(result.points.find((p: { id: string }) => p.id === "13").rightsHolder, "Bird observer");
  assert.equal(valid.eventDate, "2025-05-03T14:15:00");
});

test("empty and truncated samples describe only retained observations without manufacturing birds or completeness", () => {
  const empty = response([]);
  assert.equal(empty.totalRecords, 0);
  assert.deepEqual(empty.points, []);
  assert.deepEqual(empty.species, []);
  const truncated = buildNearbyResponse([{ results: [occurrence(1)], count: 17000, endOfRecords: false }], center, period);
  assert.equal(truncated.totalRecords, 1);
  assert.equal(truncated.sampling.availableInBoundingBox, 17000);
  assert.equal(truncated.sampling.truncated, true);
  assert.match(truncated.sampling.description, /not a census/);
  assert.throws(() => parseGbifPage({ results: [], count: "100" }), /unreadable/);
});

test("upstream queries share a global 300-record budget across date-line boxes", () => {
  const urls = gbifNearbyUrls({ latitude: 0, longitude: 179.99 }, period).map((url: string) => new URL(url));
  assert.equal(urls.length, 2);
  assert.equal(urls.reduce((total: number, url: URL) => total + Number(url.searchParams.get("limit")), 0), 300);
  for (const url of urls) {
    assert.equal(url.origin, "https://api.gbif.org");
    assert.equal(url.searchParams.get("taxonKey"), "212");
    assert.equal(url.searchParams.get("eventDate"), "2024-10-25,2026-10-25");
    assert.deepEqual(url.searchParams.getAll("license"), ["CC0_1_0", "CC_BY_4_0"]);
  }
});

test("place search handles no matches, approximate zero coordinates, and malformed input without invented results", () => {
  assert.equal(parsePlaceQuery(new URLSearchParams("q=%20Sydney%20%20NSW%20")), "Sydney NSW");
  assert.throws(() => parsePlaceQuery(new URLSearchParams("q=S")), RangeError);
  assert.throws(() => parsePlaceQuery(new URLSearchParams("q=Sydney&q=London")), RangeError);
  assert.throws(() => parsePlaceQuery(new URLSearchParams("q=Sydney%00")), RangeError);
  assert.deepEqual(parsePlaceResults({ generationtime_ms: 0.2 }), []);
  assert.deepEqual(parsePlaceResults({ results: [{ id: 1, name: "Null Island", latitude: 0, longitude: 0 }, { id: 2, name: "Invalid", latitude: 91, longitude: 0 }] }), [{ id: 1, name: "Null Island", admin: "", country: "", latitude: 0, longitude: 0 }]);
  assert.throws(() => parsePlaceResults({ error: true, reason: "Too many requests" }), /unreadable/);
});

test("date-line marker positions use the visible world copy and preserve ordinary coordinates", () => {
  assert.equal(nearbyLongitudeNear(-179.9, 179.9), 180.1);
  assert.equal(nearbyLongitudeNear(179.9, -179.9), -180.1);
  assert.equal(nearbyLongitudeNear(151.21, 151), 151.21);
  assert.ok(Math.abs(nearbyLongitudeNear(-179.9, 540) - 540) < 180);
});

test("popup destinations are constructed from validated IDs and canonical licenses, never arbitrary URLs", () => {
  assert.deepEqual(nearbyPointAttribution({ id: "5938198806", datasetKey: "50c9509d-22c7-4a22-a47d-8c48425ef4a7", license: "http://creativecommons.org/licenses/by/4.0/legalcode" }), {
    recordUrl: "https://www.gbif.org/occurrence/5938198806", datasetUrl: "https://www.gbif.org/dataset/50c9509d-22c7-4a22-a47d-8c48425ef4a7", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", licenseLabel: "CC BY 4.0",
  });
  for (const unsafe of ["javascript:alert(1)", "https://creativecommons.org.evil.example/licenses/by/4.0/", "https://evil.example/@creativecommons.org/licenses/by/4.0/", "https://user:pass@creativecommons.org/licenses/by/4.0/"]) {
    const result = nearbyPointAttribution({ id: "../bad", datasetKey: "javascript:alert(1)", license: unsafe });
    assert.equal(result.recordUrl, null);
    assert.equal(result.datasetUrl, null);
    assert.equal(result.licenseUrl, null);
  }
});
