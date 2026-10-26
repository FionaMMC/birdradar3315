# BirdRadar migration data preview

This snapshot powers the historical migration atlas. All bundled bird coordinates come from public source records; no corridors, locations, counts, or bird movements have been generated. The separate Near home map queries public observations around a chosen area; its sources, sampling and privacy are documented in [NEARBY_DATA.md](NEARBY_DATA.md).

## Included snapshot

| Source | Coverage and actual dates | Bundled records | License |
| --- | --- | --- | --- |
| [Martell & Douglas: Osprey in North and South America](https://doi.org/10.5441/001/1.sv6335t3) | North, Central and South America; 21 August 1995–25 November 2002 | 112 individuals; 16,125 daily positions | CC0 1.0 |
| [Cruz et al.: Galapagos Albatrosses / Env-DATA](https://doi.org/10.5441/001/1.3hp3s250) | Galápagos and eastern Pacific; 31 May–6 November 2008 | 28 individuals; 1,057 daily positions | CC0 1.0 |
| [Lilleyman et al.: Full annual cycle tracking of Far Eastern Curlew](https://doi.org/10.5441/001/1.v8r49083) | Australian coasts and East Asia; archived GPS records 21 November 2017–31 October 2021 | 17 GPS-tracked individuals; 6,800 daily positions in 68 segments | CC0 1.0 |
| [GBIF: Limosa lapponica](https://www.gbif.org/species/2481681) | Query bounds 90–180°E, 50°S–75°N; query years 2023–2025; returned sample 2024–2025 | 599 observation records, at most 50 requested per calendar month | CC0 or CC BY, retained per record |

Total telemetry: **157 tracked individuals and 23,982 daily positions**. The October filter contains **95 individuals and 2,210 daily positions**, plus **50 separate GBIF observations**. These are counts of the bundled historical sample, not the number of birds currently migrating. The three tracking studies cover different years and should not be presented as concurrent movements. The curlew data are the archived GPS subset, not all 21 birds in the study's combined GPS/Argos sample. See [AUSTRALIAN_TRACKING.md](AUSTRALIAN_TRACKING.md) for exact file, license verification and other candidates.

GBIF observations are a convenience sample in the API's returned order. They are not complete, evenly distributed, adjusted for observer effort, or a representative estimate of abundance. There is no individual identity linking these records. Never connect them into migration paths. The bundled source metadata includes the contributing dataset citations and each record links to its GBIF provenance and license.

## Interpretation for the map

- Suitable title: **Historical migration atlas / 历史迁徙图谱**. Suitable layer labels: **Tracked sample activity / 追踪样本活动密度** and **Observation heat / 观测热度**.
- Color identifies species; transparency expresses the fraction of active tracked individuals visiting a 1° cell. The denominator is the selected species' distinct tracked animals in the selected period. One animal gets one vote per cell even if it has many positions there.
- This measures sample space use, including stopovers and residency. It does **not** directly measure population abundance, flight frequency, or the strength of a global flyway. A bright cell can include repeated stopovers across different historical years.
- Heat is computed from measured positions only. A smooth visual kernel can blend nearby measured cells, but should not create unsupported global ribbons or imply measured presence between distant fixes.
- Observation heat uses the spatial concentration of independent records. It is a separate density measure from tracked-individual activity, has no implied individual identity, and must not be connected into flight paths. Smoothing is visual; brightness does not establish bird abundance, current presence or a migration corridor. The observation records remain available for inspection.
- Lines join consecutive measured positions in a segment. Those connections are visual interpolation, not the exact path between the fixes. Data gaps greater than 72 hours, apparent speed above 160 km/h, and antimeridian crossings split segments. The map renderer must draw segments independently and leave one-point segments as points.
- Filtering October means October across all years in the source snapshot. Empty months or unavailable regions must stay empty, with an explicit no-data state.
- Finite sampling, sensor uncertainty, and study locations limit coverage. Waved albatross data include breeding-season foraging as well as wider movements; not every displayed movement is migratory flight.
- Do not label the snapshot “live”, “radar now”, “all migrations”, “global abundance”, or “2026 migration”. Show historical dates and source attribution alongside the map.

## Ingestion and verification

`scripts/refresh-migration-data.py` uses Python's standard library. No credentials or API keys are needed. It resolves Movebank's public archive metadata, verifies the archive's CC0 label, downloads the original CSV, and records its SHA-256. The sources are archived research data, rather than an ongoing API feed whose newer records may not be covered by the historical DOI license.

For telemetry the parser requires `visible=true`, the expected species, a deployed individual identifier, finite in-range coordinates, and a parseable timestamp. The curlew source additionally requires `sensor-type=gps`. It keeps the earliest real fix for each individual and UTC date, rounds coordinates to six decimals, sorts by timestamp, and splits discontinuous segments. No daily average or synthetic position is introduced. The original CSVs have 86,383 osprey rows, 16,414 albatross rows and 41,301 curlew GPS rows before these filters.

The individual key is `sourceId + individualId`, since IDs are only unique within a study. Track segments are not counted as extra animals. Different fix rates cannot create extra heat votes from the same animal in a cell.

The 600 GBIF API results are filtered to 599 records with a precise date and an eligible open license. `public/data/gbif-query-provenance.json` retains every exact query. A production-scale occurrence study should use a [GBIF occurrence download](https://techdocs.gbif.org/en/openapi/v1/occurrence) with a DOI, and make an explicit effort-bias correction before estimating abundance.

Public [Movebank API documentation](https://github.com/movebank/movebank-api-doc/blob/master/movebank-api.md) currently specifies one concurrent request per IP. The refresh script makes sequential requests, caches downloads, and has bounded retries. It only replaces the shipped JSON after every requested source succeeds. A failed refresh leaves the previous snapshot usable.

```sh
# Run from web/. This manually refreshes the committed preview data.
python3 scripts/refresh-migration-data.py --cache /tmp/birdradar-data-cache

# Rebuild using already downloaded originals, without network access.
python3 scripts/refresh-migration-data.py --cache /tmp/birdradar-data-cache --offline

# Verify real parsing, filtering, and density semantics.
python3 -m unittest scripts/test_migration_ingestion.py
node --experimental-strip-types --test scripts/migration-data.test.mts
```

The cache is intentionally outside the repository. The raw archived CSVs are not bundled in the application. The public snapshot contains source URLs, citations, license, original file digest, original and retained row counts, actual time coverage, and retrieval time. The script is manual; no recurring automation is installed.

## Frontend/API contract

`GET /api/migration?month=10&species=all` returns the typed snapshot plus `filter`, `summary`, and `heatCells`. `month=all` returns the full historical snapshot. Accepted species IDs are `osprey`, `waved-albatross`, `eastern-curlew`, and `bar-tailed-godwit`; the last is an observation layer and returns no telemetry tracks. Invalid months or species produce HTTP 400. A missing or unreadable snapshot produces HTTP 503, with no demo-data fallback.

Types and pure filtering/summary functions live in `lib/migration-data.ts`. The data file is `public/data/migration-snapshot.json`; static hosts can fetch that directly and call the same filter functions locally. The API route uses the Next.js Node runtime and does not contact third-party services during a page request.

## Deliberately not bundled

The ongoing white-stork public API study `21231406` was reachable during research and includes more recent data, but its historical archive is large and a historical DOI license must not automatically be applied to newer records. It is not included in this snapshot. A future expansion can ingest its exact archived file after verifying the intended release.

[eBird Status and Trends](https://science.ebird.org/en/status-and-trends/download-data) provides valuable modelled weekly abundance, but needs an access key and has separate product reuse/redistribution conditions. It is not a silent dependency of this prototype. Public occurrence data and tracked-individual data remain separate so their scientific meaning stays clear.
