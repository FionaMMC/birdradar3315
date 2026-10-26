# Deploying BirdRadar

BirdRadar supports two builds from the same source: a normal Next.js Node application and a static GitHub Pages site. The intended Pages address is [fionammc.github.io/birdradar3315](https://fionammc.github.io/birdradar3315/). That address is a deployment target, not evidence that a release is live; check the successful Pages workflow and the published site after release. No previous public deployment URL was found in the repository's existing documentation or configuration.

## Node application

From `web/`:

```sh
npm ci
npm test
npm run typecheck
npm run build
npm start
```

This produces `.next/` and runs the normal Node server. Development uses `.next-dev/`. Keep `NEXT_PUBLIC_STATIC_EXPORT` unset for this mode and do not set a Pages base path. The `/api/migration`, `/api/nearby` and `/api/places` handlers remain available, with their server-side validation, caches and request limits.

## GitHub Pages export

From `web/`:

```sh
npm ci
git lfs pull --include="web/public/assets/atlas/*.mp4,web/public/assets/films/*.mp4" --exclude=""
npm run build:pages
```

`scripts/build-pages.mjs` creates a disposable `.pages-build/` project, excludes `app/api`, and builds with `NEXT_PUBLIC_STATIC_EXPORT=true`, `output: 'export'` and trailing-slash routes. It copies the result to `web/out/`, including `.nojekyll`. It leaves the source API handlers and the normal `.next/` build untouched. `.pages-build/` and `out/` are generated artifacts and should not be committed.

The script defaults to `NEXT_PUBLIC_BASE_PATH=/birdradar3315`. To export for a domain root instead:

```sh
NEXT_PUBLIC_BASE_PATH="" npm run build:pages
```

The base path is compiled into navigation and asset URLs. Choose it at build time; changing the hosting directory without rebuilding breaks paths. Next.js links handle the prefix, while `lib/site-path.ts` handles raw media, map-popup links and browser data URLs. To preview the default export, serve `out/` at `/birdradar3315/`; a root-path export can be previewed with `python3 -m http.server 3002 --directory out`.

The export omits large original MP4 files directly under `public/assets/`, `.DS_Store` and generated prompt/metadata sidecars. It retains the optimized runtime bird films in `assets/atlas/` and `assets/films/`, along with artwork and the committed data snapshot. The build fails if a runtime film is still a Git LFS pointer instead of playable bytes. Original archive files remain preserved in Git history; see [Bird films](BIRD_FILMS.md) for their provenance.

## Automated publishing

`.github/workflows/pages.yml` publishes pushes to `main` and supports manual `workflow_dispatch` runs. Set the repository's **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The workflow:

1. Checks out the repository and fetches only optimized bird-film LFS objects.
2. Installs Node.js 22 and Python 3.12, then runs `npm ci`, tests and type checking.
3. Reads the Pages base path from `actions/configure-pages`, exports the static site and uploads `web/out/` as a Pages artifact.
4. Deploys through `actions/deploy-pages`, with `pages: write` and `id-token: write` permissions in the `github-pages` environment.

The workflow's deployment URL is the authoritative published address. A successful push alone does not establish that Pages is enabled, the workflow succeeded or the browser can load its data and media. The workflow updates GitHub Pages; a separate pre-existing host requires its own deployment configuration.

## Data behavior on Pages

Pages has no Next.js API runtime. The historical map fetches the bundled `data/migration-snapshot.json`. Near home and place search call public GBIF and Open-Meteo APIs directly from the browser, using the same pure validation, approximate coordinates, licenses, date limits and sampling rules as the Node deployment. No API key is bundled.

The static client maintains bounded memory caches: up to 100 nearby entries for 15 minutes and 100 place searches for 24 hours. It has cancellation and request timeouts, but none of the Node server's shared request deduplication, per-process concurrency bounds or private HTTP response headers. Network access and the upstream services' CORS policies remain necessary. Maps also require Esri tiles. Service failures preserve the selected location and present recovery controls. Full details are in [Nearby bird observations](NEARBY_DATA.md).

The public Open-Meteo service is for noncommercial use. Commercial hosting needs an appropriate geocoding service; this workflow does not purchase or configure one. The real-data and inherited media licenses still apply to either deployment.

## Local records and release checks

Saved keepsakes, finish preferences, remembered areas and Lights Out entries use browser-local storage, without an account or synchronization service. They belong to the browser and origin. Existing localhost records do **not** transfer automatically to GitHub Pages or another public domain. Publishing an update to the same origin preserves local storage unless the user clears it.

After deployment, verify the actual public URL and a direct link to `/track-migration/`. Check historical bird switching and the 12-month control, place search and nearby heat, map → bird → collection return links, media playback, and the Lights Out record/film flow. Confirm that raw artwork, optimized video and the snapshot load under the configured base path and that the static app does not request `/api/*`. Clear only test-created journal or collection records if necessary; existing user records should remain untouched.
