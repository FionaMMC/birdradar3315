"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { filterMigrationData, getMigrationSummary, type MigrationDataset } from "@/lib/migration-data";
import { BIRDS, getBird } from "@/lib/birds";
import { parseAtlasSelection, updateAtlasSelection, type AreaCenter } from "@/lib/atlas-selection";
import SiteNav from "./SiteNav";
import StampCard from "./StampCard";
import { useNightRewards } from "./useNightRewards";
import { useAtlasLocation } from "./useAtlasLocation";
import { browserData } from "@/lib/browser-data";
import type { MigrationMapLayer } from "./MigrationMap";
import { DENSITY_SATURATION, densityTransfer, pearlColor } from "./map-palette";
import { uniqueObservationPoints } from "./observation-heat";
import "./atlas.css";

const MigrationMap = dynamic(() => import("./MigrationMap"), { ssr: false });
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TRACK_LAYERS: { id: MigrationMapLayer; label: string }[] = [{ id: "density", label: "Density" }, { id: "tracks", label: "Tracks" }];
const OBSERVATION_LAYERS: { id: MigrationMapLayer; label: string }[] = [{ id: "observation-heat", label: "Observation heat" }, { id: "observations", label: "Recorded sightings" }];
function Arrow() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M6 5h13v13" /></svg>; }
function LocateIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="6" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /></svg>; }
function CloseIcon() { return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" /></svg>; }
function readableDate(date: string) { return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); }

export default function MigrationAtlas() {
  const params = useSearchParams();
  const router = useRouter();
  const selection = parseAtlasSelection(params);
  const location = useAtlasLocation();
  const isNearby = selection.scope === "nearby";
  const month = selection.month;
  const [snapshot, setSnapshot] = useState<MigrationDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [opacity, setOpacity] = useState(85);
  const [playing, setPlaying] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [locatorOpen, setLocatorOpen] = useState(selection.locatorRequested);
  const [mapCenter, setMapCenter] = useState<AreaCenter | null>(null);
  const sourceButton = useRef<HTMLButtonElement>(null);
  const closeSourceButton = useRef<HTMLButtonElement>(null);
  const placeButton = useRef<HTMLButtonElement>(null);
  const placeInput = useRef<HTMLInputElement>(null);
  const lastHistoricalSpecies = useRef("osprey");
  const nightRewards = useNightRewards();

  const requestedSpecies = params.get("species");
  const requestedProfile = getBird(requestedSpecies);
  const speciesId = requestedSpecies === "all" || requestedSpecies && (snapshot ? snapshot.species.some((item) => item.id === requestedSpecies) : requestedProfile && requestedProfile.dataStatus !== "none") ? requestedSpecies! : "osprey";
  const historicalSpecies = snapshot?.species.find((species) => species.id === speciesId);
  const wantedBird = isNearby ? getBird(requestedSpecies) : undefined;
  const requestedRecord = selection.recordSpecies;
  const localSpeciesId = requestedRecord ? requestedRecord === "all" ? null : requestedRecord : wantedBird ? location.data?.species.find((bird) => bird.scientificName.toLowerCase() === wantedBird.scientificName.toLowerCase())?.id ?? "unrecorded" : null;
  const localSpecies = location.data?.species.find((bird) => bird.id === localSpeciesId);
  const isObservation = isNearby || historicalSpecies?.kind === "occurrence" || !snapshot && speciesId === "bar-tailed-godwit";
  const layer: MigrationMapLayer = isObservation ? selection.layer === "observations" ? "observations" : "observation-heat" : selection.layer === "tracks" ? "tracks" : "density";
  const profile = isNearby ? localSpecies ? BIRDS.find((bird) => bird.scientificName.toLowerCase() === localSpecies.scientificName.toLowerCase()) : localSpeciesId === "unrecorded" ? wantedBird : undefined : getBird(speciesId);
  const birdName = isNearby ? localSpecies?.commonName || localSpecies?.scientificName || (localSpeciesId ? localSpeciesId === "unrecorded" ? wantedBird?.name ?? "Selected bird" : "Bird outside this sample" : "All recorded birds") : historicalSpecies?.name ?? (speciesId === "all" ? "All tracked birds" : "Osprey");
  const scientificName = isNearby ? localSpecies?.scientificName ?? (localSpeciesId === "unrecorded" ? wantedBird?.scientificName : null) : historicalSpecies?.scientificName;
  const options = isNearby ? [{ id: "all", name: "All recorded birds" }, ...(location.data?.species.map((bird) => ({ id: bird.id, name: `${bird.commonName || bird.scientificName} · ${bird.count}` })) ?? [])] : [...(snapshot?.species.map((bird) => ({ id: bird.id, name: bird.name })) ?? [{ id: "osprey", name: "Osprey" }]), { id: "all", name: "All tracked birds" }];
  const optionValue = isNearby ? localSpeciesId ?? "all" : speciesId;
  const selectedIndex = options.findIndex((bird) => bird.id === optionValue);
  const mapReturn = encodeURIComponent(`/track-migration?${updateAtlasSelection(params, { month, layer })}`);
  const profileHref = profile ? `/species/${profile.id}?from=map&returnTo=${mapReturn}` : null;

  function updateSelection(next: Parameters<typeof updateAtlasSelection>[1]) {
    router.replace(`/track-migration?${updateAtlasSelection(params, next)}`, { scroll: false });
  }
  function setMonth(next: number | null) { updateSelection({ month: next }); }
  function chooseBird(id: string) {
    setPlaying(false);
    if (isNearby) updateSelection({ recordSpecies: id, species: "all" });
    else updateSelection({ species: id, layer: snapshot?.species.find((bird) => bird.id === id)?.kind === "occurrence" ? "observation-heat" : isObservation ? "density" : layer });
  }
  function stepBird(direction: number) {
    if (options.length > 1) chooseBird(options[(Math.max(0, selectedIndex) + direction + options.length) % options.length].id);
  }
  function showMigration() {
    setPlaying(false); setLocatorOpen(false); location.cancelLocate();
    updateSelection({ scope: "historical", species: lastHistoricalSpecies.current, layer: "density" });
  }
  function closeSources() { setSourcesOpen(false); sourceButton.current?.focus(); }
  function closeLocator() { setLocatorOpen(false); placeButton.current?.focus(); }

  useEffect(() => {
    if (!isNearby) lastHistoricalSpecies.current = speciesId;
  }, [isNearby, speciesId]);
  useEffect(() => {
    if (selection.locatorRequested) setLocatorOpen(true);
  }, [selection.locatorRequested]);
  useEffect(() => { setPlaying(false); }, [isNearby, location.area?.latitude, location.area?.longitude]);
  useEffect(() => {
    if (location.searchMessage) setLocatorOpen(true);
  }, [location.searchMessage]);
  useEffect(() => {
    if (location.area) setLocatorOpen(false);
  }, [location.area]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    async function load() {
      try {
        const payload = await browserData.loadMigration(controller.signal);
        if (!controller.signal.aborted) setSnapshot(payload);
      } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "The tracking snapshot could not be loaded."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      router.replace(`/track-migration?${updateAtlasSelection(params, { month: month == null || month === 12 ? 1 : month + 1 })}`, { scroll: false });
    }, 1800);
    const pauseWhenHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", pauseWhenHidden); };
  }, [playing, month, params, router]);
  useEffect(() => {
    if (!sourcesOpen && !locatorOpen) return;
    if (sourcesOpen) closeSourceButton.current?.focus(); else placeInput.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (sourcesOpen) { setSourcesOpen(false); sourceButton.current?.focus(); }
      else { setLocatorOpen(false); placeButton.current?.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sourcesOpen, locatorOpen]);

  const historicalData = useMemo(() => snapshot ? filterMigrationData(snapshot, { species: speciesId, month }) : null, [snapshot, speciesId, month]);
  const summary = useMemo(() => historicalData ? getMigrationSummary(historicalData) : null, [historicalData]);
  const selectedLocalPoints = useMemo(() => uniqueObservationPoints((location.data?.points ?? []).filter((point) => !localSpeciesId || point.speciesId === localSpeciesId)), [location.data, localSpeciesId]);
  const localVisibleCount = useMemo(() => uniqueObservationPoints((location.data?.points ?? []).filter((point) => (!localSpeciesId || point.speciesId === localSpeciesId) && (month === null || Number(point.eventDate.slice(5, 7)) === month))).length, [location.data, localSpeciesId, month]);
  const historicalDenominator = useMemo(() => snapshot ? uniqueObservationPoints(filterMigrationData(snapshot, { species: speciesId }).occurrences).length : 0, [snapshot, speciesId]);
  const observationDenominator = isNearby ? selectedLocalPoints.length : historicalDenominator;
  const displayedDates = useMemo(() => {
    if (isNearby) return location.data ? `Observations · ${location.data.period.from.slice(0, 4)}–${location.data.period.to.slice(0, 4)}` : "Public observations within 25 km";
    if (!snapshot) return "Historical tracking sample";
    const full = filterMigrationData(snapshot, { species: speciesId });
    const fullSummary = getMigrationSummary(full);
    let start = fullSummary.period?.start, end = fullSummary.period?.end;
    if (!start && full.occurrences.length) { const dates = full.occurrences.map((record) => record.timestamp).sort(); start = dates[0]; end = dates.at(-1); }
    const first = start?.slice(0, 4), last = end?.slice(0, 4);
    return `${isObservation ? "Historical observations" : "Historical tracks"}${first ? ` · ${first}${last && last !== first ? `–${last}` : ""}` : ""}`;
  }, [snapshot, speciesId, isObservation, isNearby, location.data]);
  const activeLoading = isNearby ? location.loading : loading;
  const activeError = isNearby ? location.error : error;
  const ready = isNearby ? Boolean(location.data) : Boolean(snapshot);
  const hasData = isNearby ? localVisibleCount > 0 : isObservation ? Boolean(historicalData?.occurrences.length) : Boolean(summary?.pointCount);
  const paletteId = isObservation ? "bar-tailed-godwit" : speciesId;
  const legendGradient = useMemo(() => `linear-gradient(90deg, ${Array.from({ length: 21 }, (_, index) => {
    const color = pearlColor(paletteId, densityTransfer(index / 20 * DENSITY_SATURATION));
    return `rgb(${color.map(Math.round).join(",")}) ${index * 5}%`;
  }).join(", ")})`, [paletteId]);
  const moved = isNearby && mapCenter && location.area && (Math.abs(mapCenter.latitude - location.area.latitude) > .025 || Math.abs(mapCenter.longitude - location.area.longitude) > .025);
  const stamp = profile ? { ...profile, image: profile.id === "osprey" ? "/assets/atlas/atlas-osprey-stamp.png" : profile.image } : null;

  return <main className={`migration-atlas${isNearby ? " migration-atlas--located" : ""}`}>
    <MigrationMap data={historicalData} layer={layer} opacity={opacity / 100} observationDenominator={historicalDenominator} focusKey={`${speciesId}-${isObservation ? "observations" : "telemetry"}`} nearby={isNearby ? { center: location.area, data: location.data, selectedSpecies: localSpeciesId, month, onSelectSpecies: chooseBird, onMove: setMapCenter } : undefined} />
    <div className="migration-atlas__shade" aria-hidden="true" />
    <SiteNav active="explore" />
    <div className="migration-atlas__layers" role="group" aria-label="Map layer">{(isObservation ? OBSERVATION_LAYERS : TRACK_LAYERS).map((item) => <button type="button" key={item.id} aria-pressed={layer === item.id} onClick={() => { setPlaying(false); updateSelection({ layer: item.id }); }}>{item.label}</button>)}</div>

    <header className="migration-atlas__intro">
      <h1><span>Migration,</span><span>in motion.</span></h1>
      <p className="migration-atlas__area-name">{isNearby ? location.area?.name : "Follow a world in flight."}</p>
      <p className="migration-atlas__dates">{displayedDates}</p>
      <p className="migration-atlas__sample" aria-live="polite">{isNearby ? location.data ? `${localVisibleCount.toLocaleString()} records shown · within 25 km` : "Looking through public records…" : summary ? isObservation ? `${summary.occurrenceCount.toLocaleString()} independent observations` : `${summary.individualCount.toLocaleString()} tracked individuals · ${summary.pointCount.toLocaleString()} positions` : "Loading the historical sample…"}</p>
      <div className="migration-atlas__location-actions">
        <button type="button" onClick={() => { setPlaying(false); location.locate(); }} disabled={location.locating} aria-label="Near home — use my approximate location"><LocateIcon />{location.locating ? "Locating…" : "Near home"}</button>
        <button ref={placeButton} type="button" aria-expanded={locatorOpen} aria-controls="atlas-locator" onClick={() => { setSourcesOpen(false); setLocatorOpen(!locatorOpen); }}>{isNearby ? "Change place" : "Find a place"}</button>
      </div>
      {isNearby && <button className="migration-atlas__world" type="button" onClick={showMigration}>Back to migration data <Arrow /></button>}
    </header>

    {locatorOpen && <section className="migration-atlas__locator" id="atlas-locator" aria-labelledby="atlas-locator-title">
      <div className="migration-atlas__panel-heading"><h2 id="atlas-locator-title">Find your place.</h2><button type="button" onClick={closeLocator} aria-label="Close place search"><CloseIcon /></button></div>
      <form onSubmit={location.searchPlaces} role="search" aria-label="Find an area" className="migration-atlas__place-form">
        <label className="migration-atlas__sr-only" htmlFor="atlas-place">City or suburb</label>
        <input ref={placeInput} id="atlas-place" type="search" value={location.query} onChange={(event) => location.setQuery(event.target.value)} placeholder="City or suburb" autoComplete="off" maxLength={100} />
        <button type="submit" disabled={location.searching}>{location.searching ? "Searching…" : "Search"}</button>
      </form>
      {location.places.length > 0 && <><ul className="migration-atlas__places" aria-label="Matching places">{location.places.map((place) => <li key={place.id}><button type="button" onClick={() => location.chooseArea({ ...place, name: [place.name, place.country].filter(Boolean).join(", ") })}><span>{place.name}<small>{[place.admin, place.country].filter(Boolean).join(", ")}</small></span><Arrow /></button></li>)}</ul><p className="migration-atlas__small">Places by <a href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noopener noreferrer">Open-Meteo</a> / GeoNames</p></>}
      {location.searchMessage && <p role="status">{location.searchMessage}</p>}
      <p className="migration-atlas__small">Near home asks for your location only when you choose. Coordinates are rounded to about 1 km before the GBIF lookup.</p>
      {location.savedArea && <div className="migration-atlas__remember"><button type="button" onClick={() => location.savedArea && location.chooseArea(location.savedArea)}>Return to {location.savedArea.name}</button><button type="button" onClick={location.forgetArea}>Forget</button></div>}
      {location.area && <button className="migration-atlas__text-action" type="button" onClick={location.rememberArea} disabled={Boolean(location.isRemembered)}>{location.isRemembered ? "Area remembered on this device" : "Remember this area"}</button>}
    </section>}

    <aside className={`migration-atlas__bird${stamp ? " migration-atlas__bird--stamp" : ""}`} aria-label="Choose and explore a bird">
      <div className="migration-atlas__bird-switch">
        <button type="button" onClick={() => stepBird(-1)} disabled={options.length < 2 || !ready} aria-label="Previous bird"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m14 5-7 7 7 7" /></svg></button>
        <span>{isNearby ? "Birds around here" : "Explore the birds"}</span>
        <button type="button" onClick={() => stepBird(1)} disabled={options.length < 2 || !ready} aria-label="Next bird"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m10 5 7 7-7 7" /></svg></button>
      </div>
      {stamp && <div className="migration-atlas__bird-art" key={stamp.id}><StampCard stamp={stamp} finish="holographic" eager showCaption={false} unlocked={nightRewards.unlocked.has(stamp.id)} onSelectSpecies={() => profileHref && router.push(profileHref)} selectionLabel={`Meet ${stamp.name}`} /></div>}
      <div className="migration-atlas__bird-identity">
        <label className="migration-atlas__species"><span className="migration-atlas__sr-only">Choose a bird species</span><span className="migration-atlas__species-name" aria-hidden="true">{birdName}</span><select value={optionValue} onChange={(event) => chooseBird(event.target.value)} disabled={!ready}>{selectedIndex < 0 && <option value={optionValue}>{birdName}</option>}{options.map((bird) => <option key={bird.id} value={bird.id}>{bird.name}</option>)}</select><svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 7 6 6 6-6" /></svg></label>
        {profile && <Link className="migration-atlas__save" href={nightRewards.unlocked.has(profile.id) ? `/collection?species=${profile.id}&from=map&returnTo=${mapReturn}` : `/lights-out?from=map&returnTo=${mapReturn}`} aria-label={nightRewards.unlocked.has(profile.id) ? `View ${profile.name} stamp earned through Lights Out` : "Join Lights Out to earn stamps"} title={nightRewards.unlocked.has(profile.id) ? "Stamp unlocked" : "Stamps are earned through Lights Out"}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{nightRewards.unlocked.has(profile.id) ? <path d="m5 12 4 4L19 6" /> : <><rect x="5.5" y="10" width="13" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>}</svg></Link>}
      </div>
      {scientificName && <p className="migration-atlas__latin">{scientificName}</p>}
      <p className="migration-atlas__bird-note">{isNearby ? localSpecies ? `${localSpecies.count} records in this sample. Latest: ${localSpecies.lastObserved.slice(0, 10)}.` : location.data ? `${location.data.species.length} recorded species. Choose a bird to follow its story.` : "Choose a recorded bird once the area loads." : isObservation ? "Independent sightings, shown as observation heat. These records do not establish flight paths." : "Individual journeys from a historical research sample."}</p>
      <div className="migration-atlas__next">{profileHref ? <Link href={profileHref}>Meet this bird <Arrow /></Link> : localSpecies ? <a href={localSpecies.sourceUrl} target="_blank" rel="noopener noreferrer">GBIF bird profile <Arrow /></a> : <Link href="/species-library">Meet the birds <Arrow /></Link>}{profile && <Link href={`/collection?species=${profile.id}&from=map&returnTo=${mapReturn}`}>{nightRewards.unlocked.has(profile.id) ? "Your unlocked stamp" : "View locked stamp"} <Arrow /></Link>}</div>
    </aside>

    {moved && !locatorOpen && <button className="migration-atlas__search-area" type="button" onClick={() => mapCenter && location.chooseArea({ ...mapCenter, name: "Map area" })}>Search this area <LocateIcon /></button>}
    {(activeLoading || activeError || ready && !hasData) && <div className="migration-atlas__map-status" role={activeError ? "alert" : "status"}>{activeLoading ? <p>{isNearby ? "Looking through public observations…" : "Opening the historical atlas…"}</p> : activeError ? <><h2>Unable to load records.</h2><p>{activeError}</p><button type="button" onClick={() => isNearby ? location.retry() : setRetry((value) => value + 1)}>Try again</button></> : <><h2>No matching records.</h2><p>{isNearby ? "No records for this selection in the sample. Birds may still be here." : `This study has no ${isObservation ? "observations" : "tracked positions"} in ${month ? MONTHS[month - 1] : "the selected period"}.`}</p>{month !== null ? <button type="button" onClick={() => { setMonth(null); setPlaying(false); }}>Show all months</button> : isNearby && localSpeciesId ? <button type="button" onClick={() => chooseBird("all")}>Show all recorded birds</button> : isNearby ? <button type="button" onClick={() => setLocatorOpen(true)}>Choose another area</button> : null}</>}</div>}

    <section className="migration-atlas__legend" aria-label="Map legend">
      {layer === "density" || layer === "observation-heat" ? <><div className="migration-atlas__legend-ramp" style={{ background: legendGradient }} aria-hidden="true" /><div className="migration-atlas__legend-values"><span>0</span><span>5%</span><span>10%+</span></div><p>{isObservation ? "Observation heat · record share" : "Smoothed sample share"}</p>{isObservation && <p className="migration-atlas__denominator">Of {observationDenominator.toLocaleString()} records · all months</p>}</> : <p className="migration-atlas__line-key"><span style={{ background: historicalSpecies?.color ?? "#a5d9d5" }} aria-hidden="true" />{layer === "tracks" ? "Consecutive recorded positions" : "Independent observations"}</p>}
      <label className="migration-atlas__opacity"><span>Opacity</span><input type="range" min="20" max="100" step="5" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /><output>{opacity}%</output></label>
    </section>

    <section className="migration-atlas__timeline" aria-label="Twelve-month timeline">
      <button className="migration-atlas__play" type="button" disabled={!ready || activeLoading} aria-label={playing ? "Pause monthly playback" : "Play months across source years"} aria-pressed={playing} onClick={() => { if (month == null) setMonth(1); setPlaying((value) => !value); }}><svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="m7 3 14 9L7 21z" />}</svg></button>
      <div className={`migration-atlas__month-controls${month === null ? " is-all-months" : ""}`} style={{ "--month-progress": `${month === null ? 0 : (month - 1) / 11 * 100}%` } as CSSProperties}>
        <input className="migration-atlas__month-slider" aria-label="Month of year" aria-valuetext={month ? `${MONTHS[month - 1]}, across source years` : "All months; move to select a month"} type="range" min="1" max="12" step="1" value={month ?? 1} onChange={(event) => { setMonth(Number(event.target.value)); setPlaying(false); }} />
        <div className="migration-atlas__month-labels" aria-hidden="true">{MONTHS.map((name, index) => <span className={month === index + 1 ? "is-active" : ""} key={name}>{name}</span>)}</div>
        <div className="migration-atlas__timeline-caption"><span>{month ? `${MONTHS[month - 1]} across source years` : "All months across source years"}</span><button type="button" onClick={() => { setMonth(null); setPlaying(false); }} aria-pressed={month === null}>All months</button></div>
      </div>
    </section>

    <footer className="migration-atlas__footer"><span>{isNearby ? "GBIF · limited observation sample" : "Movebank & GBIF · historical sample"}</span><Link className="migration-atlas__night-link" href={`/lights-out?${profile ? `species=${profile.id}&` : ""}from=map&returnTo=${mapReturn}`}>A darker sky starts at home <Arrow /></Link><button ref={sourceButton} type="button" aria-expanded={sourcesOpen} aria-controls="atlas-sources" onClick={() => { setLocatorOpen(false); setSourcesOpen(!sourcesOpen); }}>Data &amp; sources <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5M10 5.5v1" /></svg></button></footer>

    {sourcesOpen && <section className="migration-atlas__sources" id="atlas-sources" aria-labelledby="atlas-sources-title">
      <div className="migration-atlas__panel-heading"><h2 id="atlas-sources-title">Journeys, with evidence.</h2><button ref={closeSourceButton} type="button" onClick={closeSources} aria-label="Close data and sources"><CloseIcon /></button></div>
      {isNearby ? <><p>Published observations within 25 km of {location.area?.name}. These are independent records, not a live radar or migration tracks.</p><p>The map uses a limited, at-most-300-record sample from the past two years. Missing records do not imply an absence of birds.{location.data?.sampling.truncated ? " More records exist than this view can show." : ""}</p>{location.data && <p>{readableDate(location.data.period.from)} – {readableDate(location.data.period.to)} · {location.data.totalRecords} retained records</p>}<h3>Reading observation heat</h3><p>Records are grouped into .01° cells and smoothed within about 6 km. The fixed colour scale saturates at 10% of the selected birds’ full-period record count. Changing the month does not change that denominator. Heat reflects observer effort and sample coverage, not bird abundance.</p><p>Choose Recorded sightings and open a point for its original record, dataset, license and location uncertainty.</p>{location.data && <a href={location.data.source.url} target="_blank" rel="noopener noreferrer">{location.data.source.attribution} <Arrow /></a>}</> : <><p>These are historical research samples, not a live radar or a census of migrating birds. The studies cover different years.</p><h3>Reading the map</h3><p>Density gives each tracked individual one vote per 1° cell, divided by the selected species’ active individuals. A smooth, local kernel blends neighbouring measured cells. The fixed colour scale saturates at 10%; brightness does not measure bird abundance or flight frequency. Stopovers and residency are included.</p><p>Tracks connect consecutive recorded positions. They interpolate between fixes; gaps longer than 72 hours, implausible speeds and antimeridian crossings remain split.</p><p>Observation heat smooths records grouped into 1° cells with a bounded local kernel (about 267 km). The denominator stays at the selected species’ full-period record count when months change. Recorded sightings opens the same evidence as individual points.</p>{snapshot?.sources.map((source) => <article key={source.id} className="migration-atlas__source"><h3><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name} <Arrow /></a></h3><p>{readableDate(source.period.start)} – {readableDate(source.period.end)}</p><p>{source.citation}</p><p className="migration-atlas__small">{source.license} · {source.retainedRecordCount.toLocaleString()} retained records</p></article>)}</>}
      <Link className="migration-atlas__all-sources" href="/sources">Full citations and methods <Arrow /></Link>
    </section>}
    <span className="migration-atlas__sr-only" role="status">{location.notice}</span>
  </main>;
}
