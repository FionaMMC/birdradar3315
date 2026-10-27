# BirdRadar — A world in flight

A bird discovery ritual and real-data atlas: take part in Lights Out, reveal a mystery bird and earn its stamp, then explore its story and recorded journeys. The revived Next.js app lives in `web/`.

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

- A nightly sequence: mystery bird → explicit after-dark action confirmation → real birds-in-flight film → species reveal → earned stamp → bird information. The bird stays unnamed during the ritual until the action and reveal; the mobile introduction includes “Begin tonight.”
- One immutable assignment and at most one earned record per device-local calendar date, favouring eligible birds not yet earned. `useNightRewards` shares state across Lights Out, the gallery, profiles and map. Refresh, replay or undo cannot reroll that date’s bird. Removing a night revokes its stamp unless the same bird was earned on another retained night.
- An optional discovery area uses exact catalog scientific-name matches from actual nearby observations in the same calendar month. With no matching sample, the ritual clearly offers a global discovery. Neither means a bird is above the visitor’s home tonight; geolocation is requested only after an explicit action.
- Twenty freely readable bird profiles and twenty earnable stamps: seven original illustrations and thirteen licensed species photographs. All / Unlocked / Locked gallery filters, a featured-stamp carousel and dated earned states connect to field notes and maps. Unlocked stamps offer four optical finishes and pointer tilt; locked ones remain sealed. Older favourites appear separately as field-note bookmarks, and old quiz flags do not unlock stamps.
- One full-screen satellite atlas for historical journeys and nearby observations, with a shared bird selector, previous/next controls, a draggable January–December timeline, playback and opacity. It shows tracked-sample density, individual tracks, observation heat or original sightings according to the data type. Near home moves the same map to an approximate 25km area; Find a place / Change place opens a non-modal search panel. Local month/species changes filter loaded records without moving the map.
- Contextual map/profile/gallery links preserve area, selected bird and month/layer. Both map scopes share the same controls and query model, with older nearby links retained. Field notes, maps and gallery browsing never require earning a stamp.
- Cinematic muted footage, soft masks, visible keyboard focus and reduced-motion alternatives. The eight-second flight can be paused, skipped to the reveal, closed with Escape and replayed; reduced motion waits for manual Play. Recording is independent of playback. Browser-storage failure retains shared visit-only rewards and explains the limitation.

## Real data, with boundaries

The committed snapshot contains 157 tracked individuals and 23,982 retained daily positions from three CC0 Movebank studies: Ospreys (1995–2002), Waved Albatrosses (2008), and the Far Eastern Curlew GPS subset (17 birds, 6,800 positions, 2017–2021). The curlew study connects Australian non-breeding grounds and East Asia. The observation snapshot has 2,169 real GBIF records: the original 599 Bar-tailed Godwit observations plus 1,570 added observations for sixteen other species, sampled by month globally and in Australia for 2024–2025. All twenty catalog species have a map sample; three have telemetry and seventeen have independent observations. These historical studies cover different periods; the atlas is not live radar and does not estimate current population abundance or birds overhead tonight.

Density counts distinct individuals per 1° cell within each selected species sample, then uses a bounded smoothing kernel and a fixed 10% saturation. It includes stopovers and residency. Track segments are split across long gaps, implausible speeds and the antimeridian. Independent GBIF sightings are never joined into invented routes. Observation heat smooths their record share with a finite geographic kernel and the same fixed 0% / 5% / 10%+ legend. Its denominator stays at the selected species’ full-period record count when filtering by month; it reflects the sample and observer effort, not abundance. The expanded catalog deliberately samples up to six records per calendar month globally and six in Australia per species, then validates licenses, dates, species and coordinates and deduplicates record IDs. This is not an unbiased seasonal frequency estimate.

Near home queries GBIF for an at-most-300-record convenience sample from the previous two calendar years, then retains eligible records within 25km. These are independent public observations, not the latest 300 sightings, unique birds, flight paths or evidence of presence tonight. Place search uses Open-Meteo / GeoNames. Location is requested only on activation and rounded to two decimals; an approximate selected area appears in the URL and can optionally be remembered locally. See `web/docs/NEARBY_DATA.md` for sources, privacy, sampling and service limits.

See `web/docs/DATA_PROVENANCE.md` and `/sources` for complete citations, licenses, sampling and limitations. Refresh on demand:

```sh
cd web
npm run refresh:data
```

The refresh command needs internet access and public archive availability; the historical atlas uses the checked-in snapshot. The Node deployment serves data through `/api`; the Pages build reads the bundled snapshot and calls GBIF / Open-Meteo directly from the browser, using the same validation and sampling rules. Near home requires those services to be reachable, and the satellite basemap requires Esri tiles. No API key is needed for these public endpoints; Open-Meteo’s free service is for noncommercial use, so commercial deployment needs a suitable geocoding service.

Night assignments, earned stamps, action journals, old bookmarks, finish preferences and remembered areas are browser-local, with no account sync. Storage belongs to a browser and origin: localhost records do not transfer to GitHub Pages, Vercel or another public domain. Clearing site data removes that local history. Earlier journal entries and bookmarks are preserved without inventing rewards. Lights Out records self-reported participation and does not measure lights or birds saved.

## Artwork and footage

Approved visual references and design decisions are in `.impeccable/mocks/`, `DESIGN.md` and `PRODUCT.md`. Generated raster assets include exact prompt sidecars in `web/public/assets/atlas/`. The seven original illustrations are separate from the thirteen licensed Commons species photographs used for photographic stamps. Photograph creator, source, license and display-crop credits remain visible; see `web/docs/PHOTO_PROVENANCE.md` and `web/public/data/bird-photo-provenance.json`. These photographs identify species, not the tracked individuals or birds at the visitor’s home. Profile films and the Lights Out city/flight sequence are muted derivatives restored from the project’s existing film archive. The shared player pauses when hidden or offscreen and keeps a still fallback; reduced motion requires manual Play. Filenames are not verified species identification, and the films are not telemetry or current sightings. See `web/docs/BIRD_FILMS.md` for source filenames, derivatives, identity limits and inherited credit. Existing footage licensing remains applicable; no new footage license is asserted.

`node_modules` and build output were present in the original Git history. They are now ignored and removed from the index; install dependencies with `npm ci`.
