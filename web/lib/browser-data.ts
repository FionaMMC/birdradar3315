import { assetUrl } from "./site-path";
import { buildNearbyResponse, gbifNearbyUrls, nearbyPeriod, parseGbifPage, parseNearbyCenter, parsePlaceQuery, parsePlaceResults, type NearbyCenter, type NearbyResponse, type PlaceResult } from "./nearby-data";
import type { MigrationDataset } from "./migration-data";

type DataClientOptions = { staticExport?: boolean; fetcher?: typeof fetch };
type CacheEntry<T> = { expires: number; value: T };

/** Static hosts have no API server. Both deployments use the same validation and real sources. */
export function createBrowserDataClient({ staticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true", fetcher = fetch }: DataClientOptions = {}) {
  // Memory only: this cache does not retain a location history between visits.
  const nearbyCache = new Map<string, CacheEntry<NearbyResponse>>();
  const placeCache = new Map<string, CacheEntry<PlaceResult[]>>();

  function cacheValue<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, lifetime: number) {
    for (const [oldKey, entry] of cache) if (entry.expires <= Date.now()) cache.delete(oldKey);
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + lifetime, value });
  }

  async function request<T>(signal: AbortSignal | undefined, timeout: number, timeoutMessage: string, task: (signal: AbortSignal) => Promise<T>): Promise<T> {
    signal?.throwIfAborted();
    const controller = new AbortController();
    const cancel = () => controller.abort(signal?.reason);
    signal?.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(() => controller.abort(), timeout);
    try { return await task(controller.signal); }
    catch (error) {
      if (signal?.aborted) throw signal.reason;
      if (controller.signal.aborted) throw new Error(timeoutMessage);
      throw error;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      controller.abort();
    }
  }

  async function json(url: string, signal: AbortSignal, unavailable: string, rateLimited: string): Promise<unknown> {
    let response: Response;
    try { response = await fetcher(url, { signal, cache: "no-store", credentials: "omit", headers: { Accept: "application/json" } }); }
    catch (error) { if (signal.aborted) throw error; throw new Error(unavailable); }
    if (response.status === 429) throw new Error(rateLimited);
    if (!response.ok) {
      // Preserve useful errors from the Node API, never display upstream HTML.
      if (!staticExport) {
        const body = await response.json().catch(() => null);
        if (body && typeof body.error === "string") throw new Error(body.error);
      }
      throw new Error(unavailable);
    }
    try { return await response.json(); }
    catch (error) { if (signal.aborted) throw error; throw new Error(unavailable); }
  }

  async function loadMigration(signal?: AbortSignal): Promise<MigrationDataset> {
    return request(signal, 20_000, "The historical tracking snapshot took too long to load. Please try again.", async (requestSignal) => {
      const payload = await json(assetUrl(staticExport ? "/data/migration-snapshot.json" : "/api/migration?month=all&species=all"), requestSignal,
        "The historical tracking snapshot could not be loaded.", "The tracking service is busy. Please try again shortly.") as Partial<MigrationDataset> | null;
      if (payload?.version !== 1 || !Array.isArray(payload.tracks) || !Array.isArray(payload.occurrences) || !Array.isArray(payload.species) || !Array.isArray(payload.sources)) throw new Error("The tracking snapshot is incomplete.");
      return payload as MigrationDataset;
    });
  }

  async function loadNearby(input: NearbyCenter, signal?: AbortSignal): Promise<NearbyResponse> {
    signal?.throwIfAborted();
    // Round before upstream requests, matching the Node endpoint's privacy boundary.
    const center = parseNearbyCenter(new URLSearchParams({ lat: String(input.latitude), lon: String(input.longitude) }));
    const period = nearbyPeriod();
    const key = `${center.latitude},${center.longitude}:${period.to}`;
    const cached = staticExport ? nearbyCache.get(key) : undefined;
    if (cached && cached.expires > Date.now()) return cached.value;
    return request(signal, 18_000, "GBIF took too long to respond. Please try this area again.", async (requestSignal) => {
      const unavailable = "GBIF observations are temporarily unavailable. Your selected area is kept; please try again.";
      const rateLimited = "GBIF is receiving too many requests. Please try again in a minute.";
      let value: NearbyResponse;
      if (staticExport) {
        const pages = await Promise.all(gbifNearbyUrls(center, period).map(async (url) => parseGbifPage(await json(url, requestSignal, unavailable, rateLimited))));
        value = buildNearbyResponse(pages, center, period);
      } else {
        const body = await json(assetUrl(`/api/nearby?lat=${center.latitude}&lon=${center.longitude}`), requestSignal, unavailable, rateLimited) as Partial<NearbyResponse> | null;
        if (!body || !Array.isArray(body.points) || !Array.isArray(body.species) || !body.period || !body.sampling || !body.source) throw new Error("The observation response is incomplete. Please try again.");
        value = body as NearbyResponse;
      }
      requestSignal.throwIfAborted();
      if (staticExport) cacheValue(nearbyCache, key, value, 15 * 60 * 1000);
      return value;
    });
  }

  async function searchPlaces(input: string, signal?: AbortSignal): Promise<PlaceResult[]> {
    signal?.throwIfAborted();
    const query = parsePlaceQuery(new URLSearchParams({ q: input }));
    const key = query.toLocaleLowerCase("en");
    const cached = staticExport ? placeCache.get(key) : undefined;
    if (cached && cached.expires > Date.now()) return cached.value;
    return request(signal, 10_000, "Location search took too long. Please try again.", async (requestSignal) => {
      const url = staticExport ? new URL("https://geocoding-api.open-meteo.com/v1/search") : null;
      if (url) { url.searchParams.set("name", query); url.searchParams.set("count", "8"); url.searchParams.set("language", "en"); url.searchParams.set("format", "json"); }
      const body = await json(url?.toString() ?? assetUrl(`/api/places?q=${encodeURIComponent(query)}`), requestSignal,
        "Location search is unavailable. You can use your approximate location or move the map instead.", "Location search has reached its request limit. Please try again in a minute.");
      let results: PlaceResult[];
      if (staticExport) results = parsePlaceResults(body);
      else {
        if (!body || typeof body !== "object" || !("results" in body) || !Array.isArray(body.results)) throw new Error("Place search returned an incomplete response. Try again.");
        results = body.results as PlaceResult[];
      }
      requestSignal.throwIfAborted();
      if (staticExport) cacheValue(placeCache, key, results, 24 * 60 * 60 * 1000);
      return results;
    });
  }

  return { loadMigration, loadNearby, searchPlaces };
}

export const browserData = createBrowserDataClient();
