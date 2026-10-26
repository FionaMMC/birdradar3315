import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import type * as DataClient from "../lib/browser-data.ts";

function moduleUrl(file: string, replacements: Record<string, string> = {}) {
  let source = readFileSync(new URL(file, import.meta.url), "utf8");
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(from, to);
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
const site = moduleUrl("../lib/site-path.ts", { "process.env.NEXT_PUBLIC_BASE_PATH": '"/birdradar3315"' });
const nearby = moduleUrl("../lib/nearby-data.ts");
const { createBrowserDataClient } = await import(moduleUrl("../lib/browser-data.ts", { '"./site-path"': JSON.stringify(site), '"./nearby-data"': JSON.stringify(nearby) })) as typeof DataClient;
const sample = { version: 1, tracks: [], occurrences: [], species: [], sources: [] };
const page = { results: [], count: 0, endOfRecords: true };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

test("Pages loads the bundled verified snapshot under the project path and never substitutes failed data", async () => {
  const requests: string[] = [];
  const client = createBrowserDataClient({ staticExport: true, fetcher: async (url) => { requests.push(String(url)); return response(sample); } });
  assert.deepEqual(await client.loadMigration(), sample);
  assert.deepEqual(requests, ["/birdradar3315/data/migration-snapshot.json"]);
  const invalid = createBrowserDataClient({ staticExport: true, fetcher: async () => response({ tracks: [] }) });
  await assert.rejects(invalid.loadMigration(), /incomplete/);
  const unavailable = createBrowserDataClient({ staticExport: true, fetcher: async () => response({}, 503) });
  await assert.rejects(unavailable.loadMigration(), /could not be loaded/);
});

test("Node deployments retain the three server endpoints and their useful errors", async () => {
  const requests: string[] = [];
  const client = createBrowserDataClient({ staticExport: false, fetcher: async (url) => {
    requests.push(String(url));
    if (String(url).includes("migration")) return response(sample);
    if (String(url).includes("nearby")) return response({ points: [], species: [], period: {}, sampling: {}, source: {} });
    return response({ results: [{ id: 1, name: "Sydney", admin: "NSW", country: "Australia", latitude: -33.87, longitude: 151.21 }] });
  } });
  await client.loadMigration();
  await client.loadNearby({ latitude: -33.86712, longitude: 151.209399 });
  const places = await client.searchPlaces("Sydney");
  assert.equal(places[0].admin, "NSW");
  assert.deepEqual(requests, ["/birdradar3315/api/migration?month=all&species=all", "/birdradar3315/api/nearby?lat=-33.87&lon=151.21", "/birdradar3315/api/places?q=Sydney"]);
  const failed = createBrowserDataClient({ staticExport: false, fetcher: async () => response({ error: "Observation service maintenance" }, 503) });
  await assert.rejects(failed.loadNearby({ latitude: 0, longitude: 0 }), /Observation service maintenance/);
});

test("Pages nearby queries preserve rounding, the shared date-line budget, licensing and real empty results", async () => {
  const requests: URL[] = [];
  const client = createBrowserDataClient({ staticExport: true, fetcher: async (url, init) => {
    requests.push(new URL(String(url)));
    assert.equal(init?.credentials, "omit");
    return response(page);
  } });
  const result = await client.loadNearby({ latitude: 0.001, longitude: 179.991 });
  assert.deepEqual(result.center, { latitude: 0, longitude: 179.99 });
  assert.equal(result.totalRecords, 0);
  assert.deepEqual(result.points, []);
  assert.equal(requests.length, 2);
  assert.equal(requests.reduce((sum, url) => sum + Number(url.searchParams.get("limit")), 0), 300);
  for (const url of requests) {
    assert.equal(url.origin, "https://api.gbif.org");
    assert.equal(url.searchParams.get("taxonKey"), "212");
    assert.deepEqual(url.searchParams.getAll("license"), ["CC0_1_0", "CC_BY_4_0"]);
  }
  await client.loadNearby({ latitude: 0, longitude: 179.99 });
  assert.equal(requests.length, 2, "successful queries are cached only in this client instance");
});

test("rate limits remain errors and do not poison the nearby cache", async () => {
  let requests = 0;
  const client = createBrowserDataClient({ staticExport: true, fetcher: async () => response(++requests === 1 ? {} : page, requests === 1 ? 429 : 200) });
  await assert.rejects(client.loadNearby({ latitude: 0, longitude: 0 }), /too many requests/);
  assert.equal((await client.loadNearby({ latitude: 0, longitude: 0 })).totalRecords, 0);
  assert.equal(requests, 2);
});

test("cancellation aborts the active upstream request without storing an empty fallback", async () => {
  let requests = 0;
  let aborted = false;
  const client = createBrowserDataClient({ staticExport: true, fetcher: async (_url, init) => {
    requests += 1;
    if (requests > 1) return response(page);
    return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => { aborted = true; reject(init.signal?.reason); }, { once: true }));
  } });
  const controller = new AbortController();
  const pending = client.loadNearby({ latitude: 0, longitude: 0 }, controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  assert.ok(aborted);
  await client.loadNearby({ latitude: 0, longitude: 0 });
  assert.equal(requests, 2);
  await assert.rejects(client.loadNearby({ latitude: 0, longitude: 0 }, controller.signal), { name: "AbortError" });
});

test("a slow upstream is cancelled with a retryable timeout, not a fabricated empty sample", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const client = createBrowserDataClient({ staticExport: true, fetcher: async (_url, init) => new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true })) });
  const pending = client.loadNearby({ latitude: 0, longitude: 0 });
  const rejection = assert.rejects(pending, /took too long/);
  t.mock.timers.tick(18_001);
  await rejection;
});

test("Pages city search uses Open-Meteo's real response and distinguishes no matches from service failure", async () => {
  const requests: URL[] = [];
  const client = createBrowserDataClient({ staticExport: true, fetcher: async (url) => {
    requests.push(new URL(String(url)));
    return response({ results: [{ id: 2147714, name: "Sydney", admin1: "New South Wales", country: "Australia", latitude: -33.86785, longitude: 151.20732 }] });
  } });
  const places = await client.searchPlaces("  Sydney  ");
  assert.equal(requests[0].origin, "https://geocoding-api.open-meteo.com");
  assert.equal(requests[0].searchParams.get("name"), "Sydney");
  assert.equal(requests[0].searchParams.get("count"), "8");
  assert.equal(places[0].latitude, -33.87);
  assert.equal(places[0].admin, "New South Wales");
  await client.searchPlaces("sydney");
  assert.equal(requests.length, 1);
  const noMatches = createBrowserDataClient({ staticExport: true, fetcher: async () => response({ generationtime_ms: 0.1 }) });
  assert.deepEqual(await noMatches.searchPlaces("No such city"), []);
  const failed = createBrowserDataClient({ staticExport: true, fetcher: async () => { throw new Error("CORS or offline"); } });
  await assert.rejects(failed.searchPlaces("Sydney"), /unavailable/);
});
