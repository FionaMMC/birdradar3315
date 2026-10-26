# Australian tracking sources

Checked 25 October 2026. BirdRadar now includes an Australian migratory bird's archived GPS positions. This is a historical research sample, not a live feed. GBIF observations remain an independent layer labeled **Observation heat / 观测热度**.

## Included: Far Eastern Curlew

- Species: *Numenius madagascariensis*, `eastern-curlew`.
- Archive: [Lilleyman et al. (2021), Movebank Data Repository](https://doi.org/10.5441/001/1.v8r49083), handle `10255/move.1313`, study `1450838481`.
- Primary paper: [Morrick et al., Differential population trends align with migratory connectivity in an endangered shorebird](https://conbio.onlinelibrary.wiley.com/doi/10.1111/csp2.594), also available as an [author institutional PDF at Charles Darwin University](https://ris.cdu.edu.au/ws/portalfiles/portal/49346499/Conservat_Sci_and_Prac_2021_Morrick_Differential_population_trends_align_with_migratory_connectivity_in_an_endangered.pdf).
- Input: `Full annual cycle tracking of Far Eastern Curlew (Numenius madagascariensis)-gps.csv`, 11,311,303 bytes. [Original public GPS CSV](https://datarepository.movebank.org/server/api/core/bitstreams/7208165e-8015-4929-9a51-9c8d93bb2177/content).
- License: **CC0 1.0**. Verified in the archive's `dc.rights` and `dc.rights.uri` metadata and the [archive README's Terms of Use](https://datarepository.movebank.org/server/api/core/bitstreams/a8498b7d-7d81-4b86-879c-df5bb47bb8c5/content). The citation is retained in the snapshot and shown with the map. The recommendation to contact the researchers is not a prerequisite to reuse; no messages were sent.
- Raw SHA-256: `a6c25b8f50cfe50bc43392b904ba38686b6fa239d7e3ad3d9806c9b095b349e9`.

The source file contains **41,301 GPS rows from 17 identified birds**. The application keeps **6,800 actual daily positions**, spanning **21 November 2017–31 October 2021**. The study tagged birds at Australian nonbreeding sites, with migration toward East Asia. The GPS subset includes positions around Australian coasts and farther north through the flyway. It is not a census or a complete representation of every Australian population.

The paper analyzes records through November 2020 and combines GPS with Argos data for 21 tracked birds. The archived GPS file extends into 2021. Accordingly, the app reports the archive's actual dates and its **17-bird GPS subset**, not the paper's full sample size. The separate Argos file is not bundled.

The existing parser keeps the earliest valid, owner-visible fix per bird per UTC day, requires the expected taxon and `sensor-type=gps`, and rounds coordinates to six decimals. It splits rather than fills gaps over 72 hours, apparent speeds above 160 km/h and antimeridian crossings. The result contains 68 segments: 55 with multiple points and 13 single points. Lines interpolate between retained measured fixes; they are not exact flight paths. No synthetic coordinates or extra birds are added.

Rebuild with `python3 scripts/refresh-migration-data.py --cache /tmp/birdradar-data-cache`; use `--offline` after the original files have been cached. The script validates CC0, records the input hash and replaces the working snapshot only after all sources succeed. The API validates species against the actual snapshot, so `/api/migration?species=eastern-curlew&month=all` exposes the new record set without a separate remote request.

## Other verified candidates

| Candidate | Access and meaning | Decision |
| --- | --- | --- |
| [Red-necked stints, Movebank](https://doi.org/10.5441/001/1.s07tk38d) | CC0 archive `10255/move.1232`; downloaded and inspected the 380,561-byte tracks CSV: 1,288 records, 17 individual identifiers. Sensor is `solar-geolocator`, with start/end times and latitude/longitude uncertainty bounds. | A legitimate next source, but the positions are light-derived estimates covering intervals. Preserve that uncertainty and timing before adding it; do not silently treat them as precise GPS fixes. The related GBIF/OBIS republication has a different, noncommercial license, so it is not the source used for this assessment. |
| [Bar-tailed Godwit, New Zealand 2013–2014](https://doi.org/10.5441/001/1.327) | Movebank archive `10255/move.3100`; metadata confirms CC BY 4.0. Light-level geolocator study centered on New Zealand. | Useful wider Australasian candidate, but it is not Australian GPS tracking. Not bundled in this change. The app's existing bar-tailed godwit layer remains independent observations. |
| [Great knots, Dryad](https://datadryad.org/dataset/doi:10.5061/dryad.f2g5f49) | Australian deployment, satellite tracking study. Published files provide stopping sites and arrival/departure timing, plus encounter histories. | Do not describe the listed processed stopover file as a continuous raw GPS trajectory. Not bundled. |
| [Latham's Snipe Project, Federation University](https://www.cerdi.edu.au/LathamsSnipe) | The primary project page documents successful migration tracking and newer local GPS studies. | This search did not find an openly licensed downloadable migration-coordinate archive. Existence of study maps is not redistribution permission. The project is the strongest follow-up contact, but no request was sent. |

The [Latham's Snipe flight-initiation-distance dataset](https://federation.figshare.com/articles/dataset/Latham_s_Snipe_i_Gallinago_hardwickii_i_flight_initiation_distance_data/27966531) concerns disturbance responses, not migration positions. It cannot fill this map's tracking gap. No matching open continuous tracking archive was found for Rainbow Bee-eater in this bounded search; that is not a claim that such data do not exist.

For follow-up ingestion, require individual identity, timestamp/interval semantics, coordinates, a sensor/accuracy description and explicit reuse permission. Keep observation density, processed geolocation estimates and precise telemetry distinguishable in both labels and data structures.
