"use client";

import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getBird, birdCollectionHref, birdMapHref, safeMapReturnTo, withMapReturn } from "@/lib/birds";
import {
  importLegacyNight, LEGACY_LIGHTS_OUT_STORAGE_KEY, LIGHTS_OUT_ACTIONS,
  LIGHTS_OUT_STORAGE_KEY, LIGHTS_OUT_UPDATED_EVENT, localNightKey,
  nightDateLabel, parseLightsOutJournal, recordLightsOutNight,
  type LightsOutAction, type LightsOutNight,
} from "@/lib/lights-out";
import SiteNav from "./SiteNav";
import LightsFlight from "./LightsFlight";
import LivingBirdFilm from "./LivingBirdFilm";
import { CITY_FILM } from "@/lib/bird-video";
import "./lights-out.css";

function Arrow({ back = false }: { back?: boolean }) {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={back ? "M20 12H4m7-7-7 7 7 7" : "M4 12h16m-7-7 7 7-7 7"} /></svg>;
}

function Check() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

export default function LightsOutExperience() {
  const [journal, setJournal] = useState<LightsOutNight[]>([]);
  const [today, setToday] = useState("");
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<"understand" | "act">("understand");
  const [actions, setActions] = useState<LightsOutAction[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [notice, setNotice] = useState("");
  const [speciesId, setSpeciesId] = useState<string>();
  const [from, setFrom] = useState<string>();
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showFlight, setShowFlight] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);
  const bird = getBird(speciesId);
  const tonight = journal.find((entry) => entry.date === today);
  const step = tonight ? 2 : stage === "act" ? 1 : 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryBird = getBird(params.get("species"));
    if (queryBird) setSpeciesId(queryBird.id);
    setReturnTo(safeMapReturnTo(params.get("returnTo")));
    if (["map", "collection", "species"].includes(params.get("from") || "")) setFrom(params.get("from")!);
    function load() {
      setToday(localNightKey());
      try {
        let next = parseLightsOutJournal(localStorage.getItem(LIGHTS_OUT_STORAGE_KEY));
        const legacy = importLegacyNight(localStorage.getItem(LEGACY_LIGHTS_OUT_STORAGE_KEY));
        if (legacy) {
          if (!next.some((entry) => entry.date === legacy.date)) next = recordLightsOutNight(next, legacy);
          setJournal(next);
          // Remove the old key only after its record is safely in the new journal.
          localStorage.setItem(LIGHTS_OUT_STORAGE_KEY, JSON.stringify(next));
          localStorage.removeItem(LEGACY_LIGHTS_OUT_STORAGE_KEY);
        }
        setJournal(next);
        setStorageAvailable(true);
      } catch { setStorageAvailable(false); }
      setReady(true);
    }
    load();
    const onStorage = (event: StorageEvent) => { if ([LIGHTS_OUT_STORAGE_KEY, LEGACY_LIGHTS_OUT_STORAGE_KEY, null].includes(event.key)) load(); };
    const onDayChange = () => setToday(localNightKey());
    window.addEventListener("storage", onStorage);
    window.addEventListener(LIGHTS_OUT_UPDATED_EVENT, load);
    document.addEventListener("visibilitychange", onDayChange);
    const interval = window.setInterval(onDayChange, 60_000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LIGHTS_OUT_UPDATED_EVENT, load);
      document.removeEventListener("visibilitychange", onDayChange);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setConfirmed(false);
  }, [today]);

  useEffect(() => {
    if (shouldFocus.current && !showFlight) { headingRef.current?.focus({ preventScroll: true }); shouldFocus.current = false; }
  }, [step, showFlight]);

  function persist(change: (entries: LightsOutNight[]) => LightsOutNight[], message: string) {
    let next = change(journal);
    try {
      // Merge against the latest stored journal so another tab's night is retained.
      // A failed write can leave older data readable. Preserve our visit-only
      // journal on later actions instead of replacing it with that stale copy.
      if (storageAvailable) next = change(parseLightsOutJournal(localStorage.getItem(LIGHTS_OUT_STORAGE_KEY)));
      localStorage.setItem(LIGHTS_OUT_STORAGE_KEY, JSON.stringify(next));
      setJournal(next);
      setStorageAvailable(true);
      setNotice(message);
      window.dispatchEvent(new Event(LIGHTS_OUT_UPDATED_EVENT));
    } catch {
      setJournal(next);
      setStorageAvailable(false);
      setNotice(`${message} Browser storage is unavailable; this change lasts for this visit.`);
    }
  }

  function recordNight() {
    if (!actions.length || !confirmed || !ready) return;
    const now = new Date();
    const date = localNightKey(now);
    if (date !== today) {
      setToday(date);
      setConfirmed(false);
      setNotice("The calendar date has changed. Confirm your actions for this new night before recording.");
      return;
    }
    shouldFocus.current = true;
    persist((entries) => recordLightsOutNight(entries, { date, actions, recordedAt: now.toISOString(), ...(bird ? { species: bird.id } : {}) }), "Tonight is recorded in your personal journal.");
    setShowFlight(true);
  }

  function removeNight(date: string) {
    if (date === today) { shouldFocus.current = true; setStage("act"); setConfirmed(false); }
    persist((entries) => entries.filter((entry) => entry.date !== date), `${nightDateLabel(date)} removed from your journal.`);
  }

  function changeAction(action: LightsOutAction) {
    setActions((current) => current.includes(action) ? current.filter((id) => id !== action) : [...current, action]);
    setConfirmed(false);
  }

  const galleryHref = bird ? birdCollectionHref(bird, returnTo) : withMapReturn("/collection", returnTo);
  const mapHref = bird ? birdMapHref(bird, returnTo) : returnTo || "/track-migration";
  const backHref = from === "collection" ? galleryHref : from === "species" && bird ? withMapReturn(`/species/${bird.id}`, returnTo) : mapHref;
  const backLabel = from === "collection" ? "Back to your gallery" : from === "species" && bird ? `Back to ${bird.name}` : "Back to the map";

  return <main className={`lights-experience${tonight ? " lights-experience--recorded" : ""}`}>
    <section className="lights-hero" aria-labelledby="lights-title">
      {!tonight ? <LivingBirdFilm film={CITY_FILM} className="lights-landscape-film" /> : <img src={assetUrl("/assets/films/city-birds.jpg")} alt="" className="lights-landscape" fetchPriority="high" />}
      <div className="lights-night-mask" aria-hidden="true" />
      <div className="lights-ambient" aria-hidden="true" />
      <SiteNav active="lights-out" />
      <div className="lights-intro">
        <Link href={backHref} className="lights-back"><Arrow back />{backLabel}</Link>
        <h1 id="lights-title">{tonight ? <>Let the night<br />be night.</> : <>Make room<br />for the night.</>}</h1>
        <p>Some journeys continue while we sleep.<br className="lights-desktop-break" /> Give night-flying birds a little less light to navigate.</p>
        <a href="#why-lights-out" className="lights-quiet-link">Why a darker night matters <Arrow /></a>
        {bird && <p className="lights-context">Inspired by your time with <Link href={withMapReturn(`/species/${bird.id}`, returnTo)}>{bird.name}</Link>. This action supports bird-friendly nights; it does not establish that this species is nearby.</p>}
      </div>

      <div className="lights-journey" aria-label="Your Lights Out journey">
        <ol className="lights-steps" aria-label="Journey progress">
          {["Understand", "Take action", "Remember"].map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={index < step ? "is-complete" : ""}><span className="lights-step-point" aria-hidden="true">{index < step && <Check />}</span>{label}</li>)}
        </ol>
        {!tonight && stage === "understand" && <div className="lights-flow-body">
          <h2 tabIndex={-1} ref={headingRef}>A small change.<br />A quieter sky.</h2>
          <p>Bright artificial light can attract and disorient birds travelling at night. At home, you can reduce the light that escapes into their sky.</p>
          <p>When it’s dark, take a moment to check your lights and curtains. Then return here to record what you did.</p>
          <button className="lights-primary" type="button" disabled={!ready} onClick={() => { shouldFocus.current = true; setStage("act"); }}>Choose tonight’s actions <Arrow /></button>
          <span className="lights-small">A real-world action. No location or account needed.</span>
        </div>}

        {!tonight && stage === "act" && <div className="lights-flow-body">
          <h2 tabIndex={-1} ref={headingRef}>Start with your space.</h2>
          <p className="lights-action-intro">Choose what you can do after dark. Keep the lighting you need for safe movement.</p>
          <fieldset className="lights-actions">
            <legend className="lights-sr-only">Choose at least one action to complete tonight</legend>
            {LIGHTS_OUT_ACTIONS.map((action) => <label className={`lights-action${actions.includes(action.id) ? " is-selected" : ""}`} key={action.id}>
              <input type="checkbox" checked={actions.includes(action.id)} onChange={() => changeAction(action.id)} />
              <span className="lights-checkbox" aria-hidden="true"><Check /></span>
              <span><strong>{action.title}</strong><span>{action.detail}</span></span>
            </label>)}
          </fieldset>
          <label className="lights-confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={!actions.length} /><span>I’ve completed my selected actions after dark.</span></label>
          <button className="lights-primary" type="button" disabled={!actions.length || !confirmed || !ready} onClick={recordNight}>Record tonight <Arrow /></button>
          <span className="lights-small">{!actions.length ? "Choose at least one action to begin." : !confirmed ? "Come back and confirm when you’ve done them." : "Ready to record your actions for tonight."}</span>
        </div>}

        {tonight && <div className="lights-flow-body lights-completion">
          <h2 tabIndex={-1} ref={headingRef}>A night<br />to remember.</h2>
          <p className="lights-recorded-date"><Check /><time dateTime={today}>{nightDateLabel(today)}</time></p>
          <ul className="lights-done-actions">{tonight.imported && !tonight.actions.length ? <li>Your earlier Lights Out check-in</li> : tonight.actions.map((id) => <li key={id}>{LIGHTS_OUT_ACTIONS.find((action) => action.id === id)?.recorded}</li>)}</ul>
          <p>You made a little less light in your own space. Let this be a reminder to return tomorrow.</p>
          <button className="lights-watch-flight" type="button" onClick={() => { shouldFocus.current = true; setShowFlight(true); }}><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m6 3 10 7-10 7Z" /></svg>Watch the birds again</button>
          <Link className="lights-primary" href={galleryHref}>Continue to your gallery <Arrow /></Link>
          <div className="lights-completion-links"><Link href={mapHref}>Return to the map</Link><button type="button" onClick={() => removeNight(today)}>Undo tonight’s record</button></div>
          <span className="lights-small">A personal remembrance, separate from bird sightings and stamps.</span>
        </div>}
        <p className="lights-status" role="status">{notice || (!storageAvailable ? "Browser storage is unavailable. Your journal lasts for this visit." : "")}</p>
      </div>
      <footer className="lights-hero-footer"><a href="#night-journal">Your night journal <Arrow /></a><p>After dark, wherever you call home.</p></footer>
    </section>

    <section className="lights-reason" id="why-lights-out" aria-labelledby="lights-why-title">
      <h2 id="lights-why-title">A connection<br />worth caring for.</h2>
      <div>
        <p>Many migratory birds travel at night. Bright artificial lights and skyglow can disrupt their navigation, draw them toward buildings and increase the risk of collisions.</p>
        <p>Audubon recommends switching off unnecessary lights and using window coverings. BirdLife’s work also supports lighting only where it is needed, directing it downward and reducing its intensity.</p>
        <p>Our historical map helps you discover journeys. It cannot tell you which birds are above your home tonight. Your check-in records a habit you chose, rather than a measured change in bird survival.</p>
        <div className="lights-sources"><a href="https://www.audubon.org/our-work/cities-and-towns/lights-out" target="_blank" rel="noreferrer">Audubon · Lights Out <Arrow /></a><a href="https://www.birdlife.org/news/2026/07/29/no-more-blind-birds-reducing-light-pollution-saves-birds-and-energy/" target="_blank" rel="noreferrer">BirdLife · Better light, safer nights <Arrow /></a></div>
      </div>
    </section>

    <section className="lights-journal" id="night-journal" aria-labelledby="lights-journal-title">
      <header><div><h2 id="lights-journal-title">Your night journal.</h2><p>{storageAvailable ? "Saved on this device, one entry per local calendar date." : "Stored for this visit. Your browser cannot save the journal."}</p></div>{journal.length > 0 && <span>{journal.length} {journal.length === 1 ? "night" : "nights"} remembered</span>}</header>
      {!ready ? <p className="lights-empty">Opening your journal…</p> : !journal.length ? <div className="lights-empty"><p>Leave a little room for the dark.<br />Your first night can start here.</p><a href="#lights-title" onClick={() => setStage("act")}>Choose your actions <Arrow /></a></div> : <>
        <ol className="lights-journal-list">{(showAll ? journal : journal.slice(0, 5)).map((entry) => <li key={entry.date}>
          <time dateTime={entry.date}>{nightDateLabel(entry.date)}</time>
          <div><p>{entry.imported && !entry.actions.length ? "Earlier Lights Out check-in" : entry.actions.map((id) => LIGHTS_OUT_ACTIONS.find((action) => action.id === id)?.recorded).join(" · ")}</p>{entry.species && getBird(entry.species) && <Link href={withMapReturn(`/species/${entry.species}`, returnTo)}>Remembering {getBird(entry.species)!.name}</Link>}</div>
          <button type="button" aria-label={`Remove night of ${nightDateLabel(entry.date)}`} onClick={() => removeNight(entry.date)}>Remove</button>
        </li>)}</ol>
        {journal.length > 5 && <button type="button" className="lights-show-more" onClick={() => setShowAll(!showAll)}>{showAll ? "Show recent nights" : `Show all ${journal.length} nights`}</button>}
      </>}
      <footer><p>Your journal stays in this browser. Clearing site data removes it.<br />Nothing here measures your lights or verifies birds nearby.</p><Link href={mapHref}>Keep exploring <Arrow /></Link></footer>
    </section>
    {showFlight && <LightsFlight onFinish={() => setShowFlight(false)} />}
  </main>;
}
