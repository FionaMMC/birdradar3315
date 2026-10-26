"use client";

import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { birdDataLabel, birdMapHref, getBird, safeMapReturnTo, withMapReturn } from "@/lib/birds";
import { LIGHTS_OUT_STORAGE_KEY, LIGHTS_OUT_UPDATED_EVENT, parseLightsOutJournal, type LightsOutNight } from "@/lib/lights-out";
import SiteNav from "./SiteNav";
import StampCard from "./StampCard";
import { BIRD_STAMPS, StampFinishes, useStampCollection } from "./StampCollection";
import { Arrow } from "./CinematicHome";
import "./cinematic.css";
import "./collection-flow.css";

export default function CollectionExperience() {
  const search = useSearchParams();
  const router = useRouter();
  const requestedId = search.get("species");
  const returnTo = safeMapReturnTo(search.get("returnTo"));
  const requestedBird = getBird(requestedId);
  const requestedIndex = BIRD_STAMPS.findIndex((bird) => bird.id === requestedId);
  const [selectedIndex, setSelectedIndex] = useState(requestedIndex >= 0 ? requestedIndex : 1);
  const [filter, setFilter] = useState<"all" | "saved">(search.get("filter") === "saved" ? "saved" : "all");
  const [nights, setNights] = useState<LightsOutNight[]>([]);
  const collection = useStampCollection();
  const stamp = BIRD_STAMPS[selectedIndex];
  const bird = getBird(stamp.id)!;
  const unillustratedBird = requestedBird && !requestedBird.image ? requestedBird : undefined;
  const neighbour = (offset: number) => (selectedIndex + offset + BIRD_STAMPS.length) % BIRD_STAMPS.length;
  const visibleStamps = BIRD_STAMPS.filter((item) => filter === "all" || collection.saved.has(item.id));

  useEffect(() => {
    setSelectedIndex(requestedIndex >= 0 ? requestedIndex : 1);
    setFilter(search.get("filter") === "saved" ? "saved" : "all");
  }, [requestedIndex, search]);

  useEffect(() => {
    function readJournal() {
      try { setNights(parseLightsOutJournal(localStorage.getItem(LIGHTS_OUT_STORAGE_KEY))); }
      catch { setNights([]); }
    }
    readJournal();
    window.addEventListener("storage", readJournal);
    window.addEventListener(LIGHTS_OUT_UPDATED_EVENT, readJournal);
    return () => { window.removeEventListener("storage", readJournal); window.removeEventListener(LIGHTS_OUT_UPDATED_EVENT, readJournal); };
  }, []);

  function updateUrl(id: string, nextFilter = filter) {
    const params = new URLSearchParams();
    params.set("species", id);
    if (returnTo) params.set("returnTo", returnTo);
    if (nextFilter === "saved") params.set("filter", "saved");
    router.replace(`/collection?${params}`, { scroll: false });
  }
  function selectSpecies(id: string) {
    const index = BIRD_STAMPS.findIndex((item) => item.id === id);
    if (index >= 0) { setSelectedIndex(index); updateUrl(id); }
  }
  function changeFilter(next: "all" | "saved") { setFilter(next); updateUrl(stamp.id, next); }
  function handleCarouselKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    selectSpecies(BIRD_STAMPS[neighbour(event.key === "ArrowLeft" ? -1 : 1)].id);
  }
  function featureFromGallery(id: string) {
    selectSpecies(id);
    const heading = document.getElementById("collection-title");
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }

  return (
    <main className="cinematic-page collection-experience">
      <section className="collection-hero" aria-labelledby="collection-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cinematic-backdrop" src={assetUrl("/assets/atlas/collection-poster.webp")} alt="" fetchPriority="high" />
        <div className="collection-mask" aria-hidden="true" />
        <div className="cinematic-nav"><SiteNav active="collection" /></div>
        <header className="collection-intro">
          <h1 id="collection-title" tabIndex={-1}>Small stamps.<br />Immense journeys.</h1>
          <p>A field collection of the birds that connect our world.</p>
          <div className="collection-finish-controls">
            <StampFinishes finish={collection.finish} onChange={collection.changeFinish} />
            <span className="collection-motion-hint">Move to catch the light · Arrow keys change birds</span>
            <span className="collection-touch-hint">Choose a finish. Find your bird.</span>
          </div>
          {unillustratedBird && <div className="collection-request-note"><p>{unillustratedBird.name} has a field profile, but no illustrated stamp yet.</p><Link href={withMapReturn(`/species/${unillustratedBird.id}?from=collection`, returnTo)}>Return to {unillustratedBird.name}<Arrow /></Link></div>}
          {requestedId && !requestedBird && <p className="collection-request-note" role="status">That bird is not in the collection yet. Explore the available stamps below.</p>}
        </header>
        <div className="collection-fan" aria-label="Featured stamps" aria-roledescription="carousel" onKeyDown={handleCarouselKeys}>
          {([-1, 1, 0] as const).map((offset) => {
            const featured = BIRD_STAMPS[neighbour(offset)];
            return <div key={featured.id} className={`collection-fan__item collection-fan__item--${offset === 0 ? "centre" : offset === -1 ? "left" : "right"}`}>
              <StampCard stamp={featured} finish={collection.finish} showCaption={false} eager quizCompleted={collection.quizCompleted.has(featured.id)} onSave={collection.toggleSaved} onSelectSpecies={offset === 0 ? undefined : selectSpecies} selectionLabel={`Feature ${featured.name}`} detailHref={withMapReturn(`/species/${featured.id}?from=collection`, returnTo)} />
            </div>;
          })}
          <div className="collection-feature-caption">
            <div className="collection-feature-navigation">
              <button type="button" onClick={() => selectSpecies(BIRD_STAMPS[neighbour(-1)].id)} aria-label="Previous bird"><Arrow direction="left" /></button>
              <div aria-live="polite" aria-atomic="true"><Link href={withMapReturn(`/species/${stamp.id}?from=collection`, returnTo)} className="collection-feature-name">{stamp.name}</Link><p>{stamp.scientificName}</p><span className="collection-position">{selectedIndex + 1} / {BIRD_STAMPS.length}</span></div>
              <button type="button" onClick={() => selectSpecies(BIRD_STAMPS[neighbour(1)].id)} aria-label="Next bird"><Arrow direction="right" /></button>
            </div>
            <button className="collection-feature-save" type="button" onClick={() => collection.toggleSaved(stamp.id)} aria-pressed={collection.saved.has(stamp.id)}>
              {collection.saved.has(stamp.id) ? "Saved to collection" : "Save to collection"}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{collection.saved.has(stamp.id) ? <path d="m4 10 4 4 8-8" /> : <path d="M10 3v14M3 10h14" />}</svg>
            </button>
            <span className="collection-feature-notice" role="status">{collection.notice}</span>
          </div>
        </div>
        <footer className="collection-hero-footer">
          <a href="#all-stamps">Open the gallery <Arrow /></a>
          <p>{collection.storageAvailable ? "Your favourites, saved on this device." : "Storage is unavailable. Saves last for this visit."}</p>
        </footer>
      </section>
      <section className="collection-bird-context" aria-label={`Continue with ${bird.name}`}>
        <div><h2>Beyond the stamp.</h2><p><strong>{bird.name}</strong> · {birdDataLabel(bird)}</p><p>{bird.dataStatus === "none" ? "Meet the bird, then explore published observations near a place you know. A stamp does not imply a tracking record." : "Follow this bird into the historical atlas, or get to know its habitat and habits."}</p></div>
        <div className="collection-context-links"><Link href={withMapReturn(`/species/${bird.id}?from=collection`, returnTo)}>Meet {bird.name}<Arrow /></Link><Link href={birdMapHref(bird, returnTo)}>{returnTo ? "Return to your map" : bird.dataStatus === "none" ? "Explore nearby records" : "Find it on the map"}<Arrow /></Link></div>
      </section>
      <section className="collection-library" id="all-stamps" aria-labelledby="library-title">
        <header>
          <div><h2 id="library-title">A bird for every journey.</h2><p>Select a stamp to bring it into the light, or open its field notes.</p></div>
          <span>{collection.saved.size} of {BIRD_STAMPS.length} saved</span>
        </header>
        <div className="collection-library-filters" role="group" aria-label="Filter stamps">
          <button type="button" aria-pressed={filter === "all"} onClick={() => changeFilter("all")}>All stamps <span>{BIRD_STAMPS.length}</span></button>
          <button type="button" aria-pressed={filter === "saved"} onClick={() => changeFilter("saved")}>Saved <span>{collection.saved.size}</span></button>
        </div>
        {visibleStamps.length > 0 ? <div className="collection-library-grid">
          {visibleStamps.map((item) => <div key={item.id} className="collection-library-item"><StampCard stamp={item} finish={collection.finish} saved={collection.saved.has(item.id)} quizCompleted={collection.quizCompleted.has(item.id)} onSave={collection.toggleSaved} onSelectSpecies={featureFromGallery} selectionLabel={`Feature ${item.name}`} detailHref={withMapReturn(`/species/${item.id}?from=collection`, returnTo)} /><Link className="collection-field-link" href={withMapReturn(`/species/${item.id}?from=collection`, returnTo)}>Field notes<Arrow /></Link></div>)}
        </div> : <div className="collection-empty" role="status"><h3>Your collection starts with a bird.</h3><p>Save a stamp that catches your eye. You can return to its field notes and map from here.</p><button type="button" onClick={() => changeFilter("all")}>Browse all stamps<Arrow /></button><Link href="/track-migration?view=nearby">Start near home<Arrow /></Link></div>}
        <footer className="collection-library-footer"><p>Illustrated keepsakes, saved on this device. Finishes are visual choices, not conservation rewards. A check marks a species quiz previously completed on this device.</p><Link href="/species-library">Meet all the birds <Arrow /></Link></footer>
      </section>
      <section className="collection-night-journal" aria-labelledby="collection-night-title">
        <div><h2 id="collection-night-title">Some things you keep.<br />Some things you do.</h2><p>A saved bird is a beginning. Make a small change at home, and keep a separate record of the evenings you take part.</p></div>
        <div className="collection-night-journal__actions">
          <p>{nights.length ? `${nights.length} ${nights.length === 1 ? "night" : "nights"} in your Lights Out journal` : "Your Lights Out journal is ready when you are."}</p>
          {nights.length > 0 && <span>Latest entry · {[...nights].sort((a, b) => b.date.localeCompare(a.date))[0].date}</span>}
          <Link href={withMapReturn(`/lights-out?species=${bird.id}&from=collection`, returnTo)}>Make tonight a little darker<Arrow /></Link>
          {nights.length > 0 && <Link href={withMapReturn(`/lights-out?species=${bird.id}&from=collection#night-journal`, returnTo)}>Read your night journal<Arrow /></Link>}
          <small>Self-reported actions, kept on this device. Separate from your stamps.</small>
        </div>
      </section>
    </main>
  );
}
