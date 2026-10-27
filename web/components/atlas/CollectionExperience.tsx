"use client";

import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { birdDataLabel, birdMapHref, getBird, safeMapReturnTo, withMapReturn } from "@/lib/birds";
import SiteNav from "./SiteNav";
import StampCard from "./StampCard";
import { BIRD_STAMPS, StampFinishes, useStampCollection } from "./StampCollection";
import { useNightRewards } from "./useNightRewards";
import { Arrow } from "./CinematicHome";
import "./cinematic.css";
import "./collection-flow.css";

type GalleryFilter = "all" | "unlocked" | "locked";
function readFilter(value: string | null): GalleryFilter { return value === "unlocked" || value === "locked" ? value : "all"; }

export default function CollectionExperience() {
  const search = useSearchParams();
  const router = useRouter();
  const requestedId = search.get("species");
  const returnTo = safeMapReturnTo(search.get("returnTo"));
  const requestedIndex = BIRD_STAMPS.findIndex((bird) => bird.id === requestedId);
  const [selectedIndex, setSelectedIndex] = useState(requestedIndex >= 0 ? requestedIndex : 1);
  const [filter, setFilter] = useState<GalleryFilter>(readFilter(search.get("filter")));
  const collection = useStampCollection();
  const nights = useNightRewards();
  const stamp = BIRD_STAMPS[selectedIndex];
  const bird = getBird(stamp.id)!;
  const unlocked = nights.unlocked.has(stamp.id);
  const earnedNight = nights.rewards.find((night) => night.species === stamp.id);
  const neighbour = (offset: number) => (selectedIndex + offset + BIRD_STAMPS.length) % BIRD_STAMPS.length;
  const visibleStamps = BIRD_STAMPS.filter((item) => filter === "all" || (filter === "unlocked" ? nights.unlocked.has(item.id) : !nights.unlocked.has(item.id)));
  const bookmarks = BIRD_STAMPS.filter((item) => collection.saved.has(item.id));
  const lightsOutHref = withMapReturn("/lights-out?from=collection", returnTo);

  useEffect(() => {
    setSelectedIndex(requestedIndex >= 0 ? requestedIndex : 1);
    setFilter(readFilter(search.get("filter")));
  }, [requestedIndex, search]);

  function updateUrl(id: string, nextFilter = filter) {
    const params = new URLSearchParams({ species: id });
    if (returnTo) params.set("returnTo", returnTo);
    if (nextFilter !== "all") params.set("filter", nextFilter);
    router.replace(`/collection?${params}`, { scroll: false });
  }
  function selectSpecies(id: string) {
    const index = BIRD_STAMPS.findIndex((item) => item.id === id);
    if (index >= 0) { setSelectedIndex(index); updateUrl(id); }
  }
  function changeFilter(next: GalleryFilter) { setFilter(next); updateUrl(stamp.id, next); }
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
        <img className="cinematic-backdrop" src={assetUrl("/assets/atlas/collection-poster.webp")} alt="" fetchPriority="high" />
        <div className="collection-mask" aria-hidden="true" />
        <div className="cinematic-nav"><SiteNav active="collection" /></div>
        <header className="collection-intro">
          <h1 id="collection-title" tabIndex={-1}>A darker sky.<br />A story to keep.</h1>
          <p>Every unlocked stamp begins with a night you took part.</p>
          <div className="collection-finish-controls">
            {unlocked ? <><StampFinishes finish={collection.finish} onChange={collection.changeFinish} /><span className="collection-motion-hint">Move to catch the light · Arrow keys change birds</span><span className="collection-touch-hint">Choose a finish for your earned stamp.</span></> : <p className="collection-unlock-intro">Turn off unnecessary lights after dark.<br />Reveal a bird. Keep its stamp.</p>}
          </div>
          {requestedId && !getBird(requestedId) && <p className="collection-request-note" role="status">That bird is not in the gallery yet. Explore the available birds below.</p>}
        </header>
        <div className="collection-fan" aria-label="Featured stamps" aria-roledescription="carousel" onKeyDown={handleCarouselKeys}>
          {([-1, 1, 0] as const).map((offset) => {
            const featured = BIRD_STAMPS[neighbour(offset)];
            const isUnlocked = nights.unlocked.has(featured.id);
            return <div key={featured.id} className={`collection-fan__item collection-fan__item--${offset === 0 ? "centre" : offset === -1 ? "left" : "right"}`}>
              <StampCard stamp={featured} finish={collection.finish} unlocked={isUnlocked} showCaption={false} eager onSelectSpecies={offset === 0 ? undefined : selectSpecies} selectionLabel={`Feature ${featured.name}, ${isUnlocked ? "unlocked" : "locked"}`} detailHref={withMapReturn(`/species/${featured.id}?from=collection`, returnTo)} />
            </div>;
          })}
          <div className="collection-feature-caption">
            <div className="collection-feature-navigation">
              <button type="button" onClick={() => selectSpecies(BIRD_STAMPS[neighbour(-1)].id)} aria-label="Previous bird"><Arrow direction="left" /></button>
              <div aria-live="polite" aria-atomic="true"><Link href={withMapReturn(`/species/${stamp.id}?from=collection`, returnTo)} className="collection-feature-name">{stamp.name}</Link><p>{stamp.scientificName}</p><span className="collection-position">{selectedIndex + 1} / {BIRD_STAMPS.length}</span></div>
              <button type="button" onClick={() => selectSpecies(BIRD_STAMPS[neighbour(1)].id)} aria-label="Next bird"><Arrow direction="right" /></button>
            </div>
            {unlocked ? <p className="collection-earned-note">Unlocked through Lights Out · {earnedNight?.date}</p> : <Link className="collection-feature-save" href={lightsOutHref}>Join Lights Out to earn stamps<Arrow /></Link>}
            <span className="collection-feature-notice" role="status">{!nights.ready ? "Opening this device’s collection…" : unlocked ? "A keepsake of your care for the night sky." : "The next bird is a surprise. Explore its field notes freely."}</span>
          </div>
        </div>
        <footer className="collection-hero-footer">
          <a href="#all-stamps">Open the gallery <Arrow /></a>
          <p>{nights.storageAvailable ? `${nights.unlocked.size} of ${BIRD_STAMPS.length} stamps unlocked on this device.` : "Storage is unavailable. This visit’s rewards cannot be kept."}</p>
        </footer>
      </section>
      <section className="collection-bird-context" aria-label={`Continue with ${bird.name}`}>
        <div><h2>The bird beyond the stamp.</h2><p><strong>{bird.name}</strong> · {birdDataLabel(bird)}</p><p>Field notes and the map are always open. Explore where birds have been recorded and when, whether or not you have earned their stamps.</p></div>
        <div className="collection-context-links"><Link href={withMapReturn(`/species/${bird.id}?from=collection`, returnTo)}>Meet {bird.name}<Arrow /></Link><Link href={birdMapHref(bird, returnTo)}>{returnTo ? "Return to your map" : bird.dataStatus === "none" ? "Explore nearby records" : "Find it on the map"}<Arrow /></Link></div>
      </section>
      <section className="collection-library" id="all-stamps" aria-labelledby="library-title">
        <header>
          <div><h2 id="library-title">Your nights, in birds.</h2><p>Unlocked stamps hold a night of action. Locked stamps hold a story still to come.</p></div>
          <span>{nights.unlocked.size} of {BIRD_STAMPS.length} unlocked</span>
        </header>
        <div className="collection-library-filters" role="group" aria-label="Filter stamps">
          <button type="button" aria-pressed={filter === "all"} onClick={() => changeFilter("all")}>All <span>{BIRD_STAMPS.length}</span></button>
          <button type="button" aria-pressed={filter === "unlocked"} onClick={() => changeFilter("unlocked")}>Unlocked <span>{nights.unlocked.size}</span></button>
          <button type="button" aria-pressed={filter === "locked"} onClick={() => changeFilter("locked")}>Locked <span>{BIRD_STAMPS.length - nights.unlocked.size}</span></button>
        </div>
        {visibleStamps.length > 0 ? <div className="collection-library-grid">
          {visibleStamps.map((item) => <div key={item.id} className="collection-library-item"><StampCard stamp={item} finish={collection.finish} unlocked={nights.unlocked.has(item.id)} rewardDate={nights.rewards.find((night) => night.species === item.id)?.date} onSelectSpecies={featureFromGallery} selectionLabel={`Feature ${item.name}, ${nights.unlocked.has(item.id) ? "unlocked" : "locked"}`} detailHref={withMapReturn(`/species/${item.id}?from=collection`, returnTo)} /><div className="collection-library-item-links"><Link className="collection-field-link" href={withMapReturn(`/species/${item.id}?from=collection`, returnTo)}>Field notes<Arrow /></Link><Link className="collection-field-link" href={birdMapHref(getBird(item.id)!, returnTo)}>On the map<Arrow /></Link></div></div>)}
        </div> : <div className="collection-empty" role="status"><h3>{filter === "unlocked" ? "Your first night is waiting." : "Every story has opened."}</h3><p>{filter === "unlocked" ? "Join Lights Out after dark, confirm the lights you switched off, and reveal your first bird. Its stamp will be waiting here." : "You have unlocked every bird in this collection. You can still take part in Lights Out each night."}</p><Link href={lightsOutHref}>Join Lights Out<Arrow /></Link><button type="button" onClick={() => changeFilter("all")}>Explore all birds<Arrow /></button></div>}
        <footer className="collection-library-footer"><p>One surprise bird for each evening you take part. Stamps record your self-reported action; they do not verify a bird flying over your home. Your collection is kept on this device.</p><Link href="/species-library">Meet all the birds <Arrow /></Link></footer>
      </section>
      {bookmarks.length > 0 && <section className="collection-bookmarks" aria-labelledby="collection-bookmarks-title"><div><h2 id="collection-bookmarks-title">Saved for later.</h2><p>Your earlier favourites are still here as field-note bookmarks. They are separate from the stamps you earn through Lights Out.</p></div><div className="collection-bookmark-links">{bookmarks.map((item) => <Link key={item.id} href={withMapReturn(`/species/${item.id}?from=collection`, returnTo)}>{item.name}<Arrow /></Link>)}</div></section>}
      <section className="collection-night-journal" aria-labelledby="collection-night-title">
        <div><h2 id="collection-night-title">Come back tonight.<br />Leave a little darkness.</h2><p>A mysterious bird, one small action, a story revealed. Your next stamp starts with the lights you choose to turn off.</p></div>
        <div className="collection-night-journal__actions">
          <p>{nights.rewards.length ? `${nights.rewards.length} ${nights.rewards.length === 1 ? "night" : "nights"} of action in your collection` : "Your first Lights Out night is still ahead."}</p>
          {nights.rewards.length > 0 && <span>Latest night · {nights.rewards[0].date}</span>}
          <Link href={lightsOutHref}>Make tonight a little darker<Arrow /></Link>
          {nights.journal.length > 0 && <Link href={withMapReturn("/lights-out?from=collection#night-journal", returnTo)}>Read your night journal<Arrow /></Link>}
          <small>Historical observations suggest seasonal visitors. They cannot confirm who is overhead tonight.</small>
        </div>
      </section>
    </main>
  );
}
