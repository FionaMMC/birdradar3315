# BirdRadar — A world in flight

An interactive bird atlas connecting historical tracks, nearby public observations, illustrated keepsakes and bird-friendly nights. The revived Next.js app lives in `web/`.

## Run locally

Node.js 22.6+ and Python 3 are used for the checks and data refresh.

```sh
cd web
npm ci
npm run dev
```

Open http://localhost:3000. Development artifacts use `.next-dev`, separately from production `.next`, so a production build does not corrupt the preview.

```sh
npm test
npm run typecheck
npm run build
npm start
```

## Publish

The project supports a normal Next.js server and a static GitHub Pages build. `npm run build` / `npm start` keep the Node API routes. From `web/`, `npm run build:pages` creates an isolated `.pages-build/` project without those routes and exports `out/`, leaving the normal production build untouched. The default base path is `/birdradar3315`; set `NEXT_PUBLIC_BASE_PATH=""` when building for a domain root.

The Pages workflow in `.github/workflows/pages.yml` runs checks, exports the site and publishes on pushes to `main` or manual dispatch. It downloads only the optimized film derivatives from Git LFS. The intended Pages address is [fionammc.github.io/birdradar3315](https://fionammc.github.io/birdradar3315/); the workflow's successful deployment and a live check establish whether it is published. See [deployment instructions](web/docs/DEPLOYMENT.md) for configuration, release checks and the two data-loading modes.

## What is implemented

- Cinematic, video-backed homepage with a still fallback, pause control and reduced-motion support.
- One full-screen satellite atlas for historical journeys and nearby observations, with a shared bird selector, previous/next bird controls, available stamp art, a draggable January–December timeline, playback and opacity. It shows tracked-sample density, individual tracks, observation heat or original sightings according to the data type. The archived Far Eastern Curlew GPS sample connects Australia with East Asia. Empty selections stay empty; data and tile failures expose recovery controls.
- Near home explicitly requests approximate geolocation and moves that same map to a 25km public-observation sample. Find a place / Change place opens a small non-modal city/suburb search panel, with optional remembered areas. Local month/species changes filter loaded records and keep the current map position. Back to migration data restores the preceding historical bird while keeping the month; desktop and mobile use the same controls.
- Ten unified bird profiles with living bird footage, cited field notes, habitat, movement and clear data-coverage status. A separate keepsake section follows the film; brief labels identify shared archival footage or an unverified exact species. Seven have illustrated keepsakes with four optical finishes, pointer tilt, local bookmarks, a featured-stamp carousel and All / Saved gallery filters.
- Connected map → bird → collection → Lights Out journey. Return links preserve the selected nearby area, species and month/layer or the historical map selection. Both scopes use common month/layer parameters; older nearby links remain compatible, and a location-less link opens search without a geolocation request. The six original species quizzes are archived in `web/legacy/species/`; prior completion marks remain readable.
- Lights Out explains the action, offers practical light/curtain choices, and requires confirmation that a chosen action was completed after dark. Recording adds one device-local entry per local calendar date, then opens an eight-second birds-in-flight sequence before the darker completed state. The film can be paused, skipped, closed with Escape and replayed; reduced motion waits for manual Play. The record never depends on playback. The night journal supports undo/removal and stays separate from saved stamps.
- Shared Map / Birds / Collection / Lights Out navigation, visible focus, keyboard controls, restrained selection motion and reduced-motion alternatives.

## Real data, with boundaries

The committed snapshot contains 157 tracked individuals and 23,982 retained daily positions from three CC0 Movebank studies: Ospreys (1995–2002), Waved Albatrosses (2008), and the Far Eastern Curlew GPS subset (17 birds, 6,800 positions, 2017–2021). The curlew study connects Australian non-breeding grounds and East Asia. A separate 599-record GBIF sample covers Bar-tailed Godwit observations in 2024–2025. These historical studies cover different periods; the atlas is not live radar and does not estimate current population abundance or birds overhead tonight.

Density counts distinct individuals per 1° cell within each selected species sample, then uses a bounded smoothing kernel and a fixed 10% saturation. It includes stopovers and residency. Track segments are split across long gaps, implausible speeds and the antimeridian. Independent GBIF sightings are never joined into invented routes. Observation heat smooths their record share with a finite geographic kernel and the same fixed 0% / 5% / 10%+ legend. Its denominator stays at the selected species’ full-period record count when filtering by month; it reflects the sample and observer effort, not abundance.

Near home queries GBIF for an at-most-300-record convenience sample from the previous two calendar years, then retains eligible records within 25km. These are independent public observations, not the latest 300 sightings, unique birds, flight paths or evidence of presence tonight. Place search uses Open-Meteo / GeoNames. Location is requested only on activation and rounded to two decimals; an approximate selected area appears in the URL and can optionally be remembered locally. See `web/docs/NEARBY_DATA.md` for sources, privacy, sampling and service limits.

See `web/docs/DATA_PROVENANCE.md` and `/sources` for complete citations, licenses, sampling and limitations. Refresh on demand:

```sh
cd web
npm run refresh:data
```

The refresh command needs internet access and public archive availability; the historical atlas uses the checked-in snapshot. The Node deployment serves data through `/api`; the Pages build reads the bundled snapshot and calls GBIF / Open-Meteo directly from the browser, using the same validation and sampling rules. Near home requires those services to be reachable, and the satellite basemap requires Esri tiles. No API key is needed for these public endpoints; Open-Meteo’s free service is for noncommercial use, so commercial deployment needs a suitable geocoding service.

Bookmarks, finish preference, remembered areas and night journals are browser-local, with no account sync. Storage belongs to a browser and origin: saves on localhost do not transfer to GitHub Pages or a different public domain. Lights Out records self-reported actions and does not measure lights or birds saved.

## Artwork and footage

Approved visual references and design decisions are in `.impeccable/mocks/`, `DESIGN.md` and `PRODUCT.md`. Generated raster assets include exact prompt sidecars in `web/public/assets/atlas/`. These are illustrations, not identification photographs. Profile films and the Lights Out city/flight sequence are muted derivatives restored from the project’s existing film archive. The shared player pauses when hidden or offscreen and keeps a still fallback; reduced motion requires manual Play. Filenames are not verified species identification, and the films are not telemetry or current sightings. See `web/docs/BIRD_FILMS.md` for source filenames, derivatives, identity limits and inherited credit. Existing footage licensing remains applicable; no new footage license is asserted.

`node_modules` and build output were present in the original Git history. They are now ignored and removed from the index; install dependencies with `npm ci`.
