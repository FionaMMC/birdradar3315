# Nearby bird observations

Near home moves the shared migration atlas to public GBIF occurrence records around a place selected by the user. These observations are a separate data type from archived individual tracks; both use the same map controls and January–December timeline. Observation points do not establish a flight path, current bird presence, local abundance or migration risk tonight.

## Endpoints and sources

- `GET /api/places?q=Sydney` searches city, suburb and postal-code names through the [Open-Meteo geocoding API](https://open-meteo.com/en/docs/geocoding-api), using its [GeoNames](https://www.geonames.org/) location data. It returns at most eight results and no street address lookup. Open-Meteo and GeoNames are attributed in the search results.
- `GET /api/nearby?lat=-33.87&lon=151.21` queries the [GBIF occurrence search API](https://techdocs.gbif.org/en/openapi/v1/occurrence) for Aves (`taxonKey=212`). No API key is required for these public searches.

Those relative endpoints are available in the normal Next.js Node deployment. GitHub Pages has no API server: the static client calls the same public Open-Meteo and GBIF endpoints directly through their CORS-enabled APIs. Both modes use the pure helpers in `lib/nearby-data.ts` for rounded coordinates, query construction, source validation, licenses, record budgets and circular-distance filtering. The Pages historical atlas reads the committed `data/migration-snapshot.json` under the site's configured base path. See [deployment details](DEPLOYMENT.md).

The nearby search covers the previous two calendar years through the current UTC day. It uses `HUMAN_OBSERVATION` and `MACHINE_OBSERVATION` records marked `PRESENT`, with coordinates and without GBIF geospatial issues. It requests only CC0 1.0 and CC BY 4.0 records. Only records identified to species with a valid observation day and license are retained. Data remains subject to the contributing publisher’s identification and coordinate uncertainty.

## Sample limits and geography

The search radius is fixed at 25 km. A spherical bounding box is sent to GBIF, then each returned point is checked against the true circular distance. Searches crossing the antimeridian use two bounded queries, sharing the same total budget of 300 records. Near a pole, all longitudes are searched for the applicable latitude range. The shared data helpers support valid coordinates through ±90° latitude; the satellite map uses a Mercator viewport limited near the poles.

GBIF’s default result order supplies a convenience sample; these are **not the newest 300 records**, a randomized sample, a complete species list or a population count. Filtering out bounding-box corners and invalid records can leave fewer than 300 points. `totalRecords` and species counts count retained occurrence records, not unique individual birds. Duplicate GBIF record identifiers are removed, but the same bird may have separate observations. A truncated result says that more records exist in the bounding box; it does not estimate the total inside the circle. An empty result does not mean birds are absent.

Species names and observation dates come from the source. The app does not manufacture a common name when none is supplied. Markers on opposite sides of the antimeridian are drawn in the nearest visible world copy. Source coordinate uncertainty is retained and exposed in each marker popup.

## Attribution and licenses

Every marker retains its GBIF record ID, dataset key and title, source license, observer and rights holder when provided. Popups link to the original record, dataset and canonical Creative Commons license and display contributor credits. Links are constructed from validated identifiers and allowlisted license destinations; external source strings are not inserted as HTML. Images from occurrence records are not downloaded or reused.

The original record and contributing dataset remain authoritative. A nearby query is an exploratory API sample, not a citable GBIF download with a DOI. For publication or a reproducible analysis, obtain a GBIF download and retain its DOI and constituent dataset citations. See [GBIF terms of use](https://www.gbif.org/terms) and the license on each record.

The Open-Meteo public endpoint is available for noncommercial use under its [terms](https://open-meteo.com/en/terms). A commercial deployment must use an appropriate paid or self-hosted geocoding service. This implementation does not configure or purchase that service.

## Location choice and privacy

Browser geolocation is requested only after the user activates the location control. High-accuracy mode is disabled. The client rounds the result to two decimal places before requesting records. The Node endpoint validates and rounds coordinates again; the static browser client applies that same validation before calling GBIF directly. Latitude steps of 0.01° are about 1.1 km; longitude steps become narrower toward the poles. This reduces precision but is not a guarantee of anonymity.

An approximate selected area is encoded in the page URL, so it can appear in browser history or a copied link. “Remember this area” is optional and stores only the chosen approximate area and name in this browser’s local storage; “Forget” removes that saved value. Removing it does not erase browser history or copies of a shared URL. Geolocation results are not written to a server database or disk by this feature. Search terms go to Open-Meteo, rounded search bounds go to GBIF, and satellite-map tile requests go to Esri. On Pages, those data requests come directly from the visitor's browser; in the Node deployment they pass through the app's server. Upstream services and hosting infrastructure have their own request logs and privacy policies.

Remembered areas, saved keepsakes and Lights Out journal entries are local to the browser and origin. A localhost visit, a GitHub Pages visit and a visit on another domain have separate storage; publishing does not migrate those records.

## Caching, failures and limits

### Node deployment

- Nearby successful responses are cached in process memory for 15 minutes, with at most 100 location/day entries. Matching simultaneous requests share a single upstream operation. Responses include `Cache-Control: private, max-age=300`.
- Place searches are cached in process memory for 24 hours, with at most 100 search terms. Responses include `Cache-Control: private, max-age=3600`. The app's data client requests `no-store`, so its lookups rely on the server memory cache rather than browser HTTP reuse.
- The services allow at most six simultaneous distinct nearby lookups and six place requests per process. These are resource bounds, not a distributed deployment-wide abuse limiter.
- GBIF queries time out after 18 seconds; place queries after 10 seconds. Invalid input returns 400, busy or upstream-rate-limited requests return 429 with `Retry-After`, network/invalid-upstream failures return 502, and timeouts return 504.

### Static GitHub Pages deployment

- Successful nearby responses are cached in browser memory for 15 minutes, with at most 100 location/day entries. Successful place searches are cached for 24 hours, with at most 100 terms. These caches disappear on a full page reload and are not stored as location history.
- There is no app server, shared request deduplication, server concurrency limit or app-controlled private HTTP response cache. Requests omit credentials and request `no-store`; upstream services still enforce their own limits and CORS policy.
- GBIF requests time out after 18 seconds and place requests after 10 seconds. Superseded or cancelled requests are aborted. Invalid data, rate limits, network failures and timeouts produce recovery messages rather than a synthetic API response.

In both modes, failures do not return fabricated records or silently substitute another place. The interface retains the selected area and offers retry, city search or a new map area. A service outage or changed CORS policy can temporarily prevent Pages lookups even while its bundled historical atlas remains available.

Pure helper tests live in `scripts/nearby-data.test.mts`; `scripts/browser-data.test.mts` checks both deployment paths, bounded requests, errors, cancellation and memory caching. The helper tests cover approximate and zero coordinates, circular distances, date-line and pole bounds, leap-day windows, source validation, deduplication, empty and truncated samples, record budgets, location search and safe attribution links. A live Sydney probe during implementation returned 286 retained records from 300 retrieved; that count is illustrative of the probe and is not a permanent fixture or expected future result.
