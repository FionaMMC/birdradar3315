"use client";

import Link from "next/link";
import { sitePath } from "@/lib/site-path";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { type BirdProfile, birdCollectionHref, birdDataLabel, birdMapHref, safeMapReturnTo, withMapReturn } from "@/lib/birds";
import SiteNav from "./SiteNav";
import StampCard from "./StampCard";
import { BIRD_STAMPS, StampFinishes, useStampCollection } from "./StampCollection";
import { Arrow } from "./CinematicHome";
import { birdFilm } from "@/lib/bird-video";
import LivingBirdFilm from "./LivingBirdFilm";
import "./bird-detail.css";

export default function BirdDetail({ bird }: { bird: BirdProfile }) {
  return <Suspense fallback={<main className="bird-detail" style={{ padding: "15vh 7%" }}><h1>{bird.name}</h1><p>Opening field notes…</p></main>}><BirdDetailContent bird={bird} /></Suspense>;
}

function BirdDetailContent({ bird }: { bird: BirdProfile }) {
  const search = useSearchParams();
  const returnTo = safeMapReturnTo(search.get("returnTo"));
  const returnIsNearby = returnTo ? new URL(returnTo, "https://birdradar.local").searchParams.get("view") === "nearby" : false;
  const mapReturnLabel = returnIsNearby ? "Return to your nearby map" : "Return to your map";
  const fromCollection = search.get("from") === "collection";
  const collection = useStampCollection();
  const stamp = BIRD_STAMPS.find((item) => item.id === bird.id);
  const saved = collection.saved.has(bird.id);
  const film = birdFilm(bird.id);
  return (
    <main className="bird-detail">
      <section className={`bird-detail-hero${stamp ? "" : " bird-detail-hero--field"}`} aria-labelledby="bird-name">
        <LivingBirdFilm key={bird.id} film={film} className="bird-detail-film" showDescription />
        <div className="bird-detail-mask" aria-hidden="true" />
        <div className="bird-detail-nav"><SiteNav /></div>
        <div className="bird-detail-intro">
          <Link className="bird-detail-back" href={fromCollection ? birdCollectionHref(bird, returnTo) : returnTo || "/species-library"}><Arrow direction="left" /> {fromCollection ? "Back to your gallery" : returnTo ? returnIsNearby ? "Back to nearby map" : "Back to map" : "All birds"}</Link>
          <h1 id="bird-name">{bird.name}</h1>
          <p className="bird-detail-latin">{bird.scientificName}</p>
          <p className="bird-detail-summary">{bird.summary}</p>
          <div className="bird-detail-actions">
            <Link href={birdMapHref(bird, returnTo)}>{returnTo ? mapReturnLabel : bird.dataStatus === "none" ? "Explore nearby records" : bird.dataStatus === "tracking" ? "Follow the study on the map" : "View published observations"}<Arrow /></Link>
            {stamp && <button type="button" aria-pressed={saved} onClick={() => collection.toggleSaved(bird.id)}>{saved ? "Saved to your collection" : "Save this bird"}<svg width="18" height="18" viewBox="0 0 20 20" stroke="currentColor" fill="none" aria-hidden="true">{saved ? <path d="m4 10 4 4 8-8" /> : <path d="M10 3v14M3 10h14" />}</svg></button>}
          </div>
          <span className="bird-detail-notice" role="status">{collection.notice}</span>
          <a className="bird-detail-read" href="#field-notes">Meet the bird <Arrow /></a>
        </div>
      </section>
      <section className="bird-detail-keepsake-story" aria-labelledby="bird-keepsake-title">
        <div><h2 id="bird-keepsake-title">A moment<br />to keep.</h2><p>A living bird, a distant journey, a small reminder to care. {stamp ? "Keep this bird in your collection and find your way back to its story." : "Follow the field notes and get to know the life behind the data."}</p><p className="bird-detail-film-credit">Film: {film.credit}.</p></div>
        {stamp ? <div className="bird-detail-keepsake">
          <StampCard stamp={stamp} finish={collection.finish} showCaption={false} onSave={collection.toggleSaved} onSelectSpecies={collection.toggleSaved} selectionLabel={`${saved ? "Remove" : "Save"} ${bird.name} ${saved ? "from" : "to"} your collection`} active={saved} eager />
          <StampFinishes finish={collection.finish} onChange={collection.changeFinish} />
          <Link href={birdCollectionHref(bird, returnTo)}>See it in the gallery <Arrow /></Link>
        </div> : <aside className="bird-detail-field-note"><p>{birdDataLabel(bird)}</p><h2>A life recorded<br />in the field.</h2><p>{bird.mapSummary}</p><span>A stamp for this species is not available yet.</span></aside>}
      </section>
      <section className="bird-detail-notes" id="field-notes" aria-labelledby="field-notes-title">
        <header><h2 id="field-notes-title">Look a little closer.</h2><p>Get to know the bird behind the map.</p></header>
        <div className="bird-detail-facts">
          <div><h3>In the field</h3><p>{bird.identification}</p></div>
          <div><h3>Where it lives</h3><p>{bird.habitat}</p></div>
          <div><h3>How it moves</h3><p>{bird.movement}</p></div>
          <div><h3>Give it room</h3><p>{bird.care}</p></div>
        </div>
        <div className="bird-detail-coverage">
          <div><h3>{birdDataLabel(bird)}</h3><p>{bird.mapSummary}</p></div>
          <Link href={birdMapHref(bird, returnTo)}>{returnTo ? mapReturnLabel : bird.dataStatus === "none" ? "Look around your neighbourhood" : "Open this species on the map"}<Arrow /></Link>
        </div>
        <div className="bird-detail-sources"><span>Field notes from</span>{bird.sources.map((source) => <a key={source.href} href={sitePath(source.href)} target={source.href.startsWith("http") ? "_blank" : undefined} rel={source.href.startsWith("http") ? "noreferrer" : undefined}>{source.label}<Arrow /></a>)}</div>
      </section>
      <section className="bird-detail-next" aria-labelledby="bird-next-title">
        <div><h2 id="bird-next-title">Keep the wonder.<br />Leave a darker sky.</h2><p>Learning about one bird can be the beginning of a wider habit. Lights Out helps you reduce unnecessary light at home, one evening at a time.</p><p className="bird-detail-next-note">This is a practical action for the shared night sky. It does not mean this species is above your home tonight.</p></div>
        <div className="bird-detail-next-actions"><Link href={withMapReturn(`/lights-out?species=${bird.id}&from=species`, returnTo)}>Make a Lights Out plan<Arrow /></Link>{stamp && <Link href={birdCollectionHref(bird, returnTo)}>Back to this stamp<Arrow /></Link>}<Link href={returnTo || "/track-migration?view=nearby"}>{returnTo ? mapReturnLabel : "Explore near home"}<Arrow /></Link></div>
      </section>
    </main>
  );
}
