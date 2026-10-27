---
name: BirdRadar
description: A cinematic bird atlas where a Lights Out night reveals a bird and earns its stamp.
colors:
  night: "#08131a"
  cinematic-night: "#08131f"
  atlas-night: "#07141e"
  atlas-ink: "#f7f6f0"
  atlas-muted: "#bccbd3"
  focus: "#c5e5ef"
  saved: "#f6dfa3"
  stamp-paper: "#ebe9d8"
  stamp-ink: "#183445"
  earned: "#d8e8bb"
  source-surface: "#0b1d29fa"
typography:
  display-home:
    fontFamily: "Geom Variable, Helvetica Neue, sans-serif"
    fontSize: "clamp(96px, 10.2vw, 166px)"
    fontWeight: 450
    lineHeight: 0.93
    letterSpacing: "-0.04em"
  display-atlas:
    fontFamily: "Geom Variable, Helvetica Neue, sans-serif"
    fontSize: "clamp(60px, 6vw, 88px)"
    fontWeight: 500
    lineHeight: 0.99
    letterSpacing: "-0.04em"
  display-collection:
    fontFamily: "Geom Variable, Helvetica Neue, sans-serif"
    fontSize: "clamp(48px, 4.9vw, 78px)"
    fontWeight: 560
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  display-bird:
    fontFamily: "Geom Variable, Helvetica Neue, sans-serif"
    fontSize: "clamp(52px, 7vw, 96px)"
    fontWeight: 480
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  display-lights:
    fontFamily: "Geom Variable, Helvetica Neue, sans-serif"
    fontSize: "clamp(62px, 6.3vw, 96px)"
    fontWeight: 450
    lineHeight: 0.99
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Geom Variable, Helvetica Neue, sans-serif"
    fontSize: "16px"
    lineHeight: 1.8
  navigation:
    fontFamily: "Geom Variable, Helvetica Neue, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  label:
    fontFamily: "Geom Variable, Helvetica Neue, sans-serif"
    fontSize: "12px"
    lineHeight: 1.5
rounded:
  panel: "12px"
  circle: "50%"
spacing:
  compact: "8px"
  small: "16px"
  medium: "24px"
  large: "32px"
components:
  primary-link:
    backgroundColor: "transparent"
    textColor: "#f7f8fb"
    padding: "0"
  finish-tab:
    backgroundColor: "transparent"
    textColor: "#c2cbd5"
    padding: "0 0 9px"
  finish-tab-active:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    padding: "0 0 9px"
  map-control:
    backgroundColor: "rgba(5, 17, 27, .3)"
    textColor: "#f7f5ed"
    rounded: "{rounded.circle}"
    width: "44px"
    height: "44px"
  lights-primary:
    backgroundColor: "#e4eae8"
    textColor: "#14232c"
    rounded: "8px"
    padding: "14px 21px"
  source-panel:
    backgroundColor: "{colors.source-surface}"
    textColor: "#c5d3db"
    rounded: "{rounded.panel}"
    padding: "28px"
---
# Design System: BirdRadar

## Overview

**Creative North Star: "A world in flight"**

BirdRadar places oversized, closely set sans-serif type and quiet controls directly over wildlife film, dark landscape imagery and satellite geography. Soft directional masks create reading space; open composition and tonal contrast do most of the grouping. Rich colour belongs to measured geographic fields and illustrated postage stamps.

The nightly ritual gives the stamps their meaning: an unnamed bird, an explicit after-dark action, real birds in flight, then a species reveal and its earned keepsake. Intact bird illustrations and licensed photographs sit within perforated paper, with optical finishes reserved for unlocked stamps. One continuous map and every profile remain open for independent discovery, with geographic shape and coverage derived from source records.

**Key Characteristics:**
- Full-bleed imagery and geography with dissolving dark masks.
- Large Geom headings; compact, unboxed navigation and controls.
- Milky data fields, sealed paper stamps and tactile foil on earned keepsakes.
- A mystery-to-reveal ritual, device-local earned stamps and action journals, visible sources and reduced-motion alternatives.

This system is extracted from `web/components/atlas/`, `web/app/layout.tsx` and `web/app/globals.css`. It covers Home, the unified atlas with historical and nearby data, twenty unified bird profiles, Collection, Lights Out and their shared primitives. The six original quiz pages are archived in `web/legacy/species/` and are no longer routed. Legacy bookmarks and journal entries are preserved without granting stamps; old quiz flags never unlock the new collection.

## Colors

Midnight surfaces and warm near-white text recede behind the two coloured materials: geographic density and stamp foil. Frontmatter values are extracted values, not a new centralized CSS theme; most source styles remain component-local.

- **Primary — warm atlas ink:** headings, selected controls and readable foreground text. Muted blue-grey carries historical dates, supporting copy and inactive controls.
- **Secondary — measured pearl:** Osprey density moves through blue, cyan, violet, rose, peach and cream. Waved albatross uses teal-to-seafoam-to-pale-green, and Far Eastern Curlew uses violet-to-rose-to-warm-cream. Observation heat uses its own blue-to-lilac-to-pearl palette, shared by the Bar-tailed Godwit sample and Near home. The exact interpolation stops and transfer function live in `map-palette.ts`; the legend is generated from that same function.
- **Neutral — midnight:** the global base, cinematic sections and atlas use their closely related night colours. Source content sits on a near-opaque dark surface only when opened.
- **Interaction:** pale cyan focus outlines and warm saved-bookmark colour are functional accents. Unlocked stamp finishes introduce optical colours inside the illustration or perforated paper mask. Warm paper and deep blue ink distinguish photographic stamps; the pale green earned mark signals a completed Lights Out reward.

**The Evidence Colour Rule.** Both fields use the fixed 0%, 5%, 10%+ legend, but their denominators differ. Tracking density counts distinct tracked individuals in the selected period. Observation heat counts independent records against the selected species’ full-period sample; changing month must not recalculate that denominator. Neither field estimates abundance, and observation heat does not establish a route.

## Typography

`@fontsource-variable/geom` is bundled through `app/layout.tsx`. The shared stack is Geom Variable, Helvetica Neue, sans-serif; `--font-montserrat` currently aliases the same UI font for inherited content. No external font request is required.

The display roles in frontmatter describe desktop headings. They use tight negative tracking and nearly solid line spacing. Body copy is calmer and more open, generally constrained to about 65 characters per line. UI species names remain sans-serif; scientific names can be italic. Stamp artwork retains its own printed lettering.

Navigation is compact, regular-weight text, with white active and hover states. Counts use tabular numerals. Labels range from 10–15px according to context; the small legend and provenance text are subordinate to the map, not primary reading content.

## Layout

The atlas is one full-bleed map surface for both historical journeys and nearby observations. Navigation floats above, the headline and location actions sit left, and a shared bird chooser with previous/next controls and a native species selector sits right. A stamp accompanies the chosen bird, shown as sealed paper until earned and as its illustration or photograph after unlocking. The legend, opacity and continuous twelve-month scrubber occupy the lower edge. These controls retain their roles when the map moves to a nearby area; there is no separate nearby results page or second map instance.

“Near home” requests approximate geolocation only on activation, then moves the existing map to the chosen area. “Find a place” / “Change place” opens a compact, non-modal search panel within the map. Choosing a city or remembered area closes that panel. The panel does not replace the map layout; source information has its own temporary panel. Bird profiles place a large name and field summary over photographic bird footage, with a directional mask preserving a reading area and leaving the subject visible. The earned-or-sealed keepsake is a separate section below the film, followed by freely readable field notes, source information and the next action. Lights Out pairs the introduction with a three-stage ritual—A mystery, Lights out, A bird to keep—followed by reasons and a journal linking actions to earned birds. Its city film stays an absolute background through the scoped `.lights-hero > .lights-landscape-film` rule; it must not become a grid child when shared film CSS loads later.

Home uses a viewport-height film with a 760px minimum and a two-column story below. Collection uses a three-stamp fan with a larger central stamp, then a four-column library. Content sections use generous 6–7% horizontal insets. These are surface compositions, not required templates for every page.

At 760px and below, navigation becomes an expandable menu over a fading dark background; content generally uses 6% insets. Home stacks its story, with display type reduced further at 500px. The atlas remains a full-bleed map with the same bird chooser and draggable month range. Layers sit below navigation; the compact bird identity and its links sit above the timeline, with legend and source controls below. The stamp art and supporting bird note are hidden at this breakpoint while the species selector, previous/next and profile/collection links remain. Collection keeps a three-stamp fan, enlarges its centre, moves its caption beneath, and uses two library columns. Lights Out stacks at 760px and puts “Begin tonight” in the initial mobile introduction, so starting the ritual does not require reaching the lower mystery panel. Deliberate stage changes focus and scroll to the next heading. At 650px and below, bird profiles show the introduction first, an unobscured 390px film strip, then the keepsake and field notes; the desktop reading mask is removed. Supporting research layouts stack at 800px and 560px.

## Elevation & Depth

Depth comes first from imagery, directional gradient masks and the map's separate label plane. Satellite tiles are muted with saturation, brightness and contrast filters; labels sit above the density overlay. The field uses screen compositing, a bounded local kernel and fine deterministic isobands, producing a soft milky edge and brighter measured cores without invented trajectories.

Shadows belong chiefly to physical stamp cutouts and temporary source/pop-up surfaces. Stamp depth uses `drop-shadow`, preserving perforations rather than casting a rectangular card shadow. The source drawer and temporary place suggestions have broad ambient shadows. Lights Out begins with city-bird footage at brightness .73 / saturation .8. After a night is recorded, a separate full-screen flight film precedes the species and earned-stamp reveal against a darkened city poster at brightness .3 / saturation .55; the warm ambient glow fades away. This acknowledges the journal entry, not a measured change outdoors. Exact effects and motion values are in `.impeccable/design.json` and the source styles.

**The Material Boundary Rule.** Keep foil and diffraction within an unlocked stamp’s illustration alpha mask or perforated paper silhouette. Sealed stamps, navigation and ordinary controls remain quiet and matte.

## Shapes

The seven illustrated stamps retain their actual transparent PNG silhouette, paper edge and perforations at a 2:3 presentation ratio. Their optical layers use the same image as a CSS mask and `contain` sizing. Thirteen photographic stamps and all locked backs use a CSS-perforated paper silhouette, not a generic rounded card. Locked backs show a lock and “A night still to come”; photographs carry bird identity within the paper and visible creator/license/crop credit alongside.

Most text links, selectors, finish options and layer controls have no enclosing shape. Circular map/play buttons, small round state dots and fine timeline lines remain useful exceptions. Temporary source and map-status surfaces use the panel radius; the interface does not impose a universal card container.

## Components

- **Navigation and links:** the BirdRadar wordmark is text; links use muted-to-white states. Primary actions are large inline text with a thin diagonal arrow. Hover moves that arrow slightly; keyboard focus remains outlined. Map, Birds, Collection and Lights Out form the shared route set. The mobile menu exposes expanded state, closes on navigation, and supports Escape with focus returned to its trigger.
- **Species and layer controls:** the shared bird chooser has previous/next buttons and a visible name over a native transparent `select`, retaining keyboard and native picker behavior. Its options are bundled tracking and observation species in the historical scope and the chosen area’s recorded species in the nearby scope. A focus-within outline surrounds the selector. Tracking species offer Density and Tracks; observation species and nearby records offer Observation heat and Recorded sightings. Choosing a bird selects a compatible layer and keeps its free profile link, earned-or-locked collection link and stamp state together. A locked stamp action leads to the nightly surprise ritual without promising that the currently browsed species will be awarded. Nearby species changes filter already loaded records without requerying or moving the map.
- **Map and legend:** Esri satellite imagery and geographic labels retain visible attribution. Density uses one vote per tracked individual per visited 1° cell, divided by active individuals of that species; nearby measured cells are smoothed with finite support. Tracks connect consecutive recorded fixes, split at gaps over 72 hours, implausible speeds and antimeridian crossings. GBIF occurrences remain independent records, displayed either as source-linked points or a locally smoothed heat field; they are never joined into routes. The atlas now includes Far Eastern Curlew’s archived GPS subset alongside Osprey and Waved Albatross. Source counts and dates come from the dataset, not the visual composition. Loading, unavailable imagery, data errors and empty months have distinct messages and relevant recovery controls.
- **Observation heat:** the shared pearl renderer groups unique record IDs into cells and applies a finite geographic kernel, with no screen-space minimum that would invent broad coverage when zoomed out. Bundled historical observation species use 1° cells and 2.4° support (about 267km); Near home uses .01° cells and .054° support (about 6km), correcting longitudinal scale for latitude. The denominator is the selected species’ full-period record count before month filtering. Month, opacity and raw-point controls remain available, and labels distinguish record share from bird abundance or tracking. Same-frame updates may crossfade over 320ms; geographic changes and reduced motion cancel that transition.
- **Near home and place search:** “Near home” is an explicit geolocation action on the existing map, not a page switch. It never requests location merely on load, from an old nearby link, or from a remembered area. “Find a place” / “Change place” opens a non-modal panel with an underlined city/suburb field and attributed suggestions; Escape closes it and returns focus to the trigger. Coordinates are rounded to two decimals before the GBIF lookup. Choosing an area moves the same Leaflet map to it over .8 seconds (without animation under reduced motion), adds the 25km circle and fetches its two-year public sample. Month, bird and opacity changes retain the map’s current centre/zoom and do not repeat the nearby request. “Search this area” explicitly queries after panning. “Back to migration data” restores the preceding historical bird and keeps the month. Remember/Forget is optional browser-local storage, not automatic location selection. Original-point popups retain record, dataset, license, contributor and uncertainty. Empty samples, errors and unavailable location have distinct recovery paths.
- **Journey links:** map selection is carried in a validated local `returnTo` URL through profiles, Collection and Lights Out. Nearby location, selected species and month/layer, or historical species/month/layer, survive the return. Both scopes use the same `month` and `layer` query model. Legacy `view=nearby`, `nearbyMonth` and `nearbyLayer` links are accepted and normalized; a nearby link without coordinates opens place search without requesting location. A bird profile states whether the app has tracking, observations or no sample; unavailable artwork is not replaced by invented evidence.
- **Bird profiles:** twenty profiles share field notes, habitat, movement and care context with cited sources; each has a real map sample. Three have archived individual tracking and seventeen have independent observations. Living bird footage leads the page, with a caption distinguishing shared archival footage or unverified exact species. The keepsake section follows below: seven illustrated stamps and thirteen licensed photographic stamps share the same earned state. Locked stamps remain sealed and direct visitors to Lights Out, while the complete profile and map stay freely available. The media map in `web/lib/bird-video.ts` remains separate from catalog/data identity.
- **Timeline and opacity:** the default historical view is Osprey, September, Density, 85% opacity. Desktop and mobile share one continuous native range from January to December, with twelve labels, an All months action and a play/pause control. Dragging or keyboard-changing the range pauses playback. Month selection pools the same calendar month across source years and persists when entering or leaving a nearby area. Playback advances every 1,800ms and pauses when the document becomes hidden; local month changes filter loaded records without refitting or requerying. A 320ms cubic-out density crossfade applies only to data changes within the same geographic selection; pan, zoom, resize, view reset and refitting cancel it. Reduced motion disables the crossfade. Opacity spans 20–100% in steps of 5.
- **Sources:** the footer opens a scrollable source panel with historical context, methods, citations, licenses and a full provenance link. Escape closes it and restores focus. A source label, date range and sample counts remain visible on the atlas itself; source metadata is not a decorative badge.
- **Stamp and finish:** stamps are rewards for explicit Lights Out participation. The default state is sealed paper: no revealed artwork, foil layers or pointer tilt. Unlocked stamps expose Original, Foil, Holo and Polychrome as cosmetic finish choices, with a date and earned mark. Pointer position shifts light and restrained 3D tilt with a 950px perspective; departure resets the pose, while touch and reduced motion do not require tilt. The three-stamp fan retains previous/next, keyboard arrows and side-stamp selection, with a 440ms arrival on its centre. All / Unlocked / Locked filters govern the twenty-stamp gallery and show specific empty states. Every bird’s name, field notes and map remain accessible even when its stamp is locked.
- **Reward state and old bookmarks:** `useNightRewards` is the shared source for the ritual, gallery, profiles and map. Beginning a night assigns one bird for that device-local calendar date, favouring eligible species not yet earned; its identity stays hidden in the ritual. Explicit action confirmation earns that assignment once. Refresh, replay, location changes and undo do not reroll it. Removing the night revokes its reward, unless the same species was earned on another retained date. Cross-tab merges preserve assignments and removals. Storage failure keeps a shared visit-only state across these pages and explains that it will not persist. Older journal entries and field-note bookmarks remain readable but do not grant rewards; earlier quiz flags and finish choices cannot unlock stamps.
- **Lights Out:** Mystery bird → after-dark action → real flight film → species reveal → earned stamp → bird information. Explain why escaped artificial light matters, then offer unnecessary outdoor lights, unused-room lights and curtains/blinds as practical choices. “My lights are down” requires at least one chosen action and explicit confirmation that it was completed after dark. Record the night and reward before the eight-second film opens, but keep the bird’s identity concealed until the film ends or the visitor activates “Reveal tonight’s bird” / Escape. Pause, manual playback and replay remain available; a failed or skipped film does not discard the action. Reveal the bird’s name, scientific name, summary and Holo stamp, followed by Meet this bird, gallery and map links. The stage arrives over 420ms and the stamp over 800ms; both entry animations are absent under reduced motion. The warm ambient glow fades over 800ms, or 80ms with reduced motion. The night journal shows the connection between actions and rewards and provides removal. This is a self-reported participation reward, not proof of birds overhead or measured lives saved.
- **Optional seasonal discovery:** `NightAreaPicker` opens a small optional place search, approximate-location action or remembered-area choice before beginning the ritual; it never requests location automatically. Only catalog scientific names exactly matching actual nearby records from the same calendar month enter the local candidate set. With no matching sample, no selected area or unavailable records, a clearly labelled global discovery remains available. The assignment keeps its evidence label and area once prepared. Local historical observations inspire a discovery; they do not identify tonight’s birds above the visitor’s home.
- **Living bird film:** `LivingBirdFilm` shares poster, muted inline playback, caption and Play / Pause behavior between profiles, the initial Lights Out city scene and the post-action film. It reveals video only after playback begins, with a 500ms opacity transition (80ms under reduced motion). Reduced motion starts on the poster and requires manual Play, including the eight-second sequence. Films pause when the page is hidden or the film is offscreen, retain the poster on failure and leave other actions available. The post-action film bridges action and reveal without disclosing the assigned species during playback. It is archival connection, not evidence that the action caused birds to fly.
- **Home film:** Home keeps a poster beneath a muted, looping, inline background film, fading the film in only after playback starts. Play/pause stays available. Reduced motion starts on the still image; failed video retains the still and exposes an unavailable state. Collection uses a still landscape backdrop.

Illustrations and archival films are visual assets, not evidence of a bird’s location or individual identity. The thirteen species photographs have their own verified Commons provenance; they depict the named species, not the tracked individual or a visitor’s local bird. Retain visible creator, source, license and crop disclosure from `web/docs/PHOTO_PROVENANCE.md` wherever a photograph appears. Footage provenance and identity limits are recorded in `web/docs/BIRD_FILMS.md`; archived Australian GPS coverage is described in `web/docs/AUSTRALIAN_TRACKING.md`. Preserve their existing provenance files when replacing or moving them. Data/source behavior is defined in `web/docs/DATA_PROVENANCE.md`, `web/docs/NEARBY_DATA.md`, their library modules, and the historical snapshot; do not infer broader study coverage from a composition.

## Do's and Don'ts

### Do
- Do preserve the locally bundled Geom face, oversized headings and generous open space.
- Do keep terrain, geographic labels, legends and attribution legible beneath and around the density field.
- Do derive visible coverage, dates and sample counts from the selected real records.
- Do preserve perforated stamp edges and keep revealed identity, photography and printed artwork readable through each unlocked finish.
- Do retain visible focus, native keyboard controls, pause controls and reduced-motion behavior.
- Do keep map context intact across the bird, collection and night-action journey.
- Do preserve the same map, bird chooser and month control when moving between historical journeys and nearby observations.
- Do keep living footage visible, its identity limits legible, and flight playback optional after recording.
- Do keep the nightly bird concealed until action and film/reveal, and connect each earned stamp to its recorded night.
- Do make location requests explicit and label local seasonal inspiration separately from global discovery.
- Do preserve old bookmarks and journal entries without inventing rewards.

### Don't
- Don't replace the cinematic world with boxed dashboard panels or pervasive hard dividers.
- Don't turn UI headings into serif type; fine print embedded in stamp artwork is a separate material.
- Don't label historical samples live, join independent observations into routes, or read brightness as abundance.
- Don't invent routes or flowing particles to match a mockup, or crossfade data across a changed geographic frame.
- Don't let a bookmark, old quiz flag, finish change or film replay unlock a stamp or reroll the nightly bird.
- Don't interpret a Lights Out journal entry as sensor evidence, a bird-presence forecast or a measured conservation outcome.
