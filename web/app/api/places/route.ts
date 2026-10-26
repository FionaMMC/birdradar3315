import { NextResponse } from "next/server";
import { parsePlaceQuery, parsePlaceResults, type PlaceResult } from "@/lib/nearby-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const attribution = { label: "GeoNames via Open-Meteo", url: "https://open-meteo.com/en/docs/geocoding-api" };
const cache = new Map<string, { expires: number; results: PlaceResult[] }>();
let activeRequests = 0;

export async function GET(request: Request) {
  let query;
  try { query = parsePlaceQuery(new URL(request.url).searchParams); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Enter a location." }, { status: 400 }); }
  const key = query.toLocaleLowerCase("en");
  const headers = { "Cache-Control": "private, max-age=3600" };
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return NextResponse.json({ results: cached.results, attribution }, { headers });
  if (activeRequests >= 6) return NextResponse.json({ error: "Location search is busy. Please try again shortly." }, { status: 429, headers: { "Retry-After": "5" } });
  activeRequests += 1;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query);
    url.searchParams.set("count", "8");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");
    const response = await fetch(url, { signal: controller.signal, cache: "no-store", headers: { Accept: "application/json" } });
    if (response.status === 429) return NextResponse.json({ error: "Location search has reached its request limit. Please try again in a minute." }, { status: 429, headers: { "Retry-After": "60" } });
    if (!response.ok) throw new Error("Location search unavailable");
    const results = parsePlaceResults(await response.json());
    for (const [oldKey, entry] of cache) if (entry.expires <= Date.now()) cache.delete(oldKey);
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + 24 * 60 * 60 * 1000, results });
    return NextResponse.json({ results, attribution }, { headers });
  } catch {
    return NextResponse.json({ error: controller.signal.aborted ? "Location search took too long. Please try again." : "Location search is unavailable. You can use your approximate location or move the map instead." },
      { status: controller.signal.aborted ? 504 : 502, headers: { "Cache-Control": "no-store" } });
  } finally { clearTimeout(timer); activeRequests -= 1; }
}
