import { NextResponse } from "next/server";
import { buildNearbyResponse, gbifNearbyUrls, nearbyPeriod, parseGbifPage, parseNearbyCenter, type NearbyResponse } from "@/lib/nearby-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cache = new Map<string, { expires: number; value: NearbyResponse }>();
const pending = new Map<string, Promise<NearbyResponse>>();
const CACHE_MS = 15 * 60 * 1000;
class UpstreamError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function GET(request: Request) {
  let center;
  try { center = parseNearbyCenter(new URL(request.url).searchParams); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Choose a valid location." }, { status: 400 }); }
  const period = nearbyPeriod();
  const key = `${center.latitude},${center.longitude}:${period.to}`;
  const headers = { "Cache-Control": "private, max-age=300" };
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return NextResponse.json(cached.value, { headers });
  if (pending.size >= 6 && !pending.has(key)) {
    return NextResponse.json({ error: "Nearby search is busy. Please try again in a moment." }, { status: 429, headers: { "Retry-After": "10" } });
  }
  let task = pending.get(key);
  if (!task) {
    task = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 18_000);
      try {
        const pages = await Promise.all(gbifNearbyUrls(center, period).map(async (url) => {
          const response = await fetch(url, { signal: controller.signal, cache: "no-store", headers: { Accept: "application/json" } });
          if (response.status === 429) throw new UpstreamError("GBIF is receiving too many requests. Please try again in a minute.", 429);
          if (!response.ok) throw new UpstreamError("GBIF observations are temporarily unavailable. Your selected area is kept; please try again.", 502);
          return parseGbifPage(await response.json());
        }));
        const value = buildNearbyResponse(pages, center, period);
        // Bound memory use and drop expired searches without storing a location history on disk.
        for (const [oldKey, entry] of cache) if (entry.expires <= Date.now()) cache.delete(oldKey);
        if (cache.size >= 100) cache.delete(cache.keys().next().value!);
        cache.set(key, { expires: Date.now() + CACHE_MS, value });
        return value;
      } catch (error) {
        if (controller.signal.aborted) throw new UpstreamError("GBIF took too long to respond. Please try this area again.", 504);
        throw error;
      } finally { clearTimeout(timer); }
    })();
    pending.set(key, task);
  }
  try { return NextResponse.json(await task, { headers }); }
  catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502;
    return NextResponse.json({ error: error instanceof UpstreamError ? error.message : "Nearby bird observations could not be loaded. Please check your connection and try again." },
      { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) } });
  } finally { if (pending.get(key) === task) pending.delete(key); }
}
