"use client";

import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getBird, birdCollectionHref, birdMapHref, safeMapReturnTo, withMapReturn } from "@/lib/birds";
import { LIGHTS_OUT_ACTIONS, localNightKey, nightDateLabel, type LightsOutAction } from "@/lib/lights-out";
import type { NightAssignment } from "@/lib/night-rewards";
import { CITY_FILM } from "@/lib/bird-video";
import SiteNav from "./SiteNav";
import LightsFlight from "./LightsFlight";
import LivingBirdFilm from "./LivingBirdFilm";
import StampCard from "./StampCard";
import { BIRD_STAMPS } from "./StampCollection";
import { useNightRewards } from "./useNightRewards";
import NightAreaPicker, { GLOBAL_NIGHT_CANDIDATES, type NightDiscovery } from "./NightAreaPicker";
import "./lights-out.css";
import "./stamps.css";

function Arrow({ back = false }: { back?: boolean }) {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={back ? "M20 12H4m7-7-7 7 7 7" : "M4 12h16m-7-7 7 7-7 7"} /></svg>;
}
function Check() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

export default function LightsOutExperience() {
  const { ready, today, journal, rewards, storageAvailable, prepareNight, recordNight, removeNight } = useNightRewards();
  const [stage, setStage] = useState<"mystery" | "act">("mystery");
  const [actions, setActions] = useState<LightsOutAction[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState("");
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showFlight, setShowFlight] = useState(false);
  const [assignment, setAssignment] = useState<NightAssignment | null>(null);
  const [discovery, setDiscovery] = useState<NightDiscovery>({ candidates: GLOBAL_NIGHT_CANDIDATES, area: null, loading: false });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);
  const priorNight = useRef("");
  const reward = rewards.find((entry) => entry.date === today);
  const revealed = Boolean(reward && !showFlight);
  const bird = revealed ? getBird(reward?.species) : undefined;
  const stamp = bird && BIRD_STAMPS.find((item) => item.id === bird.id);
  const step = reward ? 2 : stage === "act" ? 1 : 0;

  useEffect(() => { setReturnTo(safeMapReturnTo(new URLSearchParams(window.location.search).get("returnTo"))); }, []);
  useEffect(() => {
    setConfirmed(false);
    if (priorNight.current && today && priorNight.current !== today) {
      setStage("mystery"); setAssignment(null); setShowFlight(false); setActions([]);
      setNotice("A new calendar night has begun. Tonight’s discovery is waiting for a new action.");
      shouldFocus.current = true;
    }
    priorNight.current = today;
  }, [today]);
  useEffect(() => {
    if (shouldFocus.current && !showFlight) {
      headingRef.current?.focus({ preventScroll: true });
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
      if (window.matchMedia("(max-width: 760px)").matches) headingRef.current?.scrollIntoView({ block: "start", behavior });
      else window.scrollTo({ top: 0, behavior });
      shouldFocus.current = false;
    }
  }, [step, showFlight]);

  function beginNight() {
    if (!ready || discovery.loading) return;
    const next = prepareNight(discovery.candidates);
    if (!next) { setNotice("Tonight’s discovery could not be prepared. Please try again."); return; }
    setAssignment(next); setStage("act"); setNotice(""); shouldFocus.current = true;
  }
  function completeNight() {
    if (!actions.length || !confirmed || !ready || !assignment) return;
    const next = recordNight({ candidates: discovery.candidates, actions, confirmedAfterDark: true, expectedDate: assignment.date });
    if (!next) {
      setConfirmed(false); setStage("mystery"); setAssignment(null);
      setNotice("A new calendar night has begun. Start this night and confirm your actions again.");
      return;
    }
    shouldFocus.current = true; setNotice(""); setShowFlight(true);
  }
  function undoNight(date: string) {
    const hadReward = rewards.some((entry) => entry.date === date);
    removeNight(date);
    if (date === today) { setStage("mystery"); setAssignment(null); setConfirmed(false); shouldFocus.current = true; }
    setNotice(`${nightDateLabel(date)} removed.${hadReward ? " Its stamp is locked again unless earned on another night. Tonight’s mystery bird stays the same." : ""}`);
  }
  function changeAction(action: LightsOutAction) {
    setActions((current) => current.includes(action) ? current.filter((id) => id !== action) : [...current, action]); setConfirmed(false);
  }

  const galleryHref = bird ? birdCollectionHref(bird, returnTo) : withMapReturn("/collection", returnTo);
  const mapHref = bird ? birdMapHref(bird, returnTo) : returnTo || "/track-migration";
  const month = Number((today || localNightKey()).slice(5, 7));

  return <main className={`lights-experience${reward ? " lights-experience--recorded" : ""}`}>
    <section className="lights-hero" aria-labelledby="lights-title">
      {!reward ? <LivingBirdFilm film={CITY_FILM} className="lights-landscape-film" /> : <img src={assetUrl("/assets/films/city-birds.jpg")} alt="" className="lights-landscape" fetchPriority="high" />}
      <div className="lights-night-mask" aria-hidden="true" /><div className="lights-ambient" aria-hidden="true" />
      <SiteNav active="lights-out" />
      <div className="lights-intro">
        <Link href={returnTo || "/track-migration"} className="lights-back"><Arrow back />Explore the map</Link>
        <h1 id="lights-title">{reward ? <>A little darker.<br />A little closer.</> : <>Someone new.<br />After dark.</>}</h1>
        <p>{reward ? <>You made room for the night.<br />Let one bird’s story stay with you.</> : <>A mystery bird is waiting to be discovered.<br className="lights-desktop-break" /> Dim your space after dark. Then meet tonight’s bird.</>}</p>
        {!reward && stage === "mystery" && <button type="button" className="lights-primary lights-mobile-start" disabled={!ready || discovery.loading} onClick={beginNight}>Begin tonight <Arrow /></button>}
        <a href="#why-lights-out" className="lights-quiet-link">Why a darker night matters <Arrow /></a>
        <p className="lights-context">A nightly discovery inspired by real bird records. We can’t confirm which birds are above your home tonight.</p>
      </div>

      <div className="lights-journey" aria-label="Your Lights Out journey">
        <ol className="lights-steps" aria-label="Journey progress">{["A mystery", "Lights out", "A bird to keep"].map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={index < step ? "is-complete" : ""}><span className="lights-step-point" aria-hidden="true">{index < step && <Check />}</span>{label}</li>)}</ol>
        {!reward && stage === "mystery" && <div className="lights-flow-body lights-mystery">
          <div className="lights-sealed-night" aria-hidden="true"><span>?</span><span>A story, still sealed.</span></div>
          <h2 tabIndex={-1} ref={headingRef}>Who will you<br />meet tonight?</h2>
          <p>The name stays a secret until you’ve taken care of your lights. A flight, a reveal, and a stamp earned by what you did.</p>
          <NightAreaPicker month={month} onChange={setDiscovery} />
          <button className="lights-primary" type="button" disabled={!ready || discovery.loading} onClick={beginNight}>{discovery.loading ? "Finding tonight’s inspiration…" : "Begin Lights Out"}<Arrow /></button>
          <span className="lights-small">One discovery per local calendar night. No account needed.</span>
        </div>}
        {!reward && stage === "act" && <div className="lights-flow-body">
          <h2 tabIndex={-1} ref={headingRef}>First, make<br />a little less light.</h2>
          <p className="lights-action-intro">Do what you can after dark. Keep the lighting you need for safe movement.</p>
          <fieldset className="lights-actions"><legend className="lights-sr-only">Choose at least one action to complete tonight</legend>{LIGHTS_OUT_ACTIONS.map((action) => <label className={`lights-action${actions.includes(action.id) ? " is-selected" : ""}`} key={action.id}>
            <input type="checkbox" checked={actions.includes(action.id)} onChange={() => changeAction(action.id)} /><span className="lights-checkbox" aria-hidden="true"><Check /></span><span><strong>{action.title}</strong><span>{action.detail}</span></span>
          </label>)}</fieldset>
          <label className="lights-confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={!actions.length} /><span>I’ve completed my selected actions after dark.</span></label>
          <button className="lights-primary" type="button" disabled={!actions.length || !confirmed || !ready} onClick={completeNight}>My lights are down <Arrow /></button>
          <span className="lights-small">{!actions.length ? "Choose an action, then take a moment away from the screen." : !confirmed ? "Come back and confirm after you’ve done it." : "Your action will unlock tonight’s bird and its stamp."}</span>
          <p className="lights-discovery-note">{assignment?.evidence === "local-seasonal-observations" ? `Tonight’s inspiration: seasonal records near ${assignment.areaLabel || "your chosen area"}.` : "Tonight’s inspiration: a bird from our global atlas."} Its identity stays sealed until you act.</p>
        </div>}
        {showFlight && <div className="lights-flow-body"><h2>Your night<br />has begun.</h2><p>Your action is recorded. A bird’s story is about to open.</p></div>}
        {revealed && bird && reward && <div className="lights-flow-body lights-completion">
          <p className="lights-recorded-date"><Check /><time dateTime={today}>{nightDateLabel(today)}</time> · Earned</p>
          <h2 tabIndex={-1} ref={headingRef}>{bird.name}</h2>
          <p className="lights-bird-latin">{bird.scientificName}</p>
          {stamp && <div className="lights-earned-stamp"><StampCard stamp={stamp} finish="holographic" unlocked rewardDate={today} showCaption={false} detailHref={withMapReturn(`/species/${bird.id}`, returnTo)} /></div>}
          <p className="lights-reward-caption">A stamp for the night you made darker.</p>
          {!bird.image && bird.photo && bird.photoSource && <p className="lights-photo-credit">Photo: <a href={bird.photoSource} target="_blank" rel="noreferrer">{bird.photoCredit}</a> · <a href={bird.photoLicenseUrl || bird.photoSource} target="_blank" rel="noreferrer">{bird.photoLicense}</a> · Cropped for display</p>}
          <p>{bird.summary}</p>
          <p className="lights-discovery-note">{reward.evidence === "local-seasonal-observations" ? `Inspired by this month’s historical observations near ${reward.areaLabel || "your chosen area"}.` : "A global discovery from our real-data atlas."} This is your action reward, not a confirmed visit.</p>
          <Link className="lights-primary" href={withMapReturn(`/species/${bird.id}`, returnTo)}>Meet {bird.name}<Arrow /></Link>
          <div className="lights-completion-links"><Link href={galleryHref}>See your stamp in the gallery</Link><Link href={mapHref}>Follow this bird on the map</Link></div>
          <button className="lights-watch-flight" type="button" onClick={() => { shouldFocus.current = true; setShowFlight(true); }}>Watch the flight again <Arrow /></button>
          <span className="lights-small">Already kept for tonight. Come back on another night for a new discovery.</span>
        </div>}
        <p className="lights-status" role="status">{notice}</p>
        {!storageAvailable && <p className="lights-status" role="status">Browser storage is unavailable. Your nights and stamps last for this visit.</p>}
      </div>
      <footer className="lights-hero-footer"><a href="#night-journal">Your night journal <Arrow /></a><p>After dark, wherever you call home.</p></footer>
    </section>

    <section className="lights-reason" id="why-lights-out" aria-labelledby="lights-why-title">
      <h2 id="lights-why-title">A connection<br />worth caring for.</h2>
      <div><p>Many migratory birds travel at night. Bright artificial lights and skyglow can disrupt their navigation, draw them toward buildings and increase the risk of collisions.</p><p>Switch off unnecessary lights and close curtains or blinds. Your stamp remembers that choice. It doesn’t measure a change in bird survival or prove a bird flew over your home.</p><p>The map and every bird’s field notes are open to explore. Historical records can show where birds were observed in different months. Only a Lights Out action unlocks a stamp.</p>
        <div className="lights-sources"><a href="https://www.audubon.org/our-work/cities-and-towns/lights-out" target="_blank" rel="noreferrer">Audubon · Lights Out <Arrow /></a><a href="https://www.birdlife.org/news/2026/07/29/no-more-blind-birds-reducing-light-pollution-saves-birds-and-energy/" target="_blank" rel="noreferrer">BirdLife · Better light, safer nights <Arrow /></a></div>
      </div>
    </section>
    <section className="lights-journal" id="night-journal" aria-labelledby="lights-journal-title">
      <header><div><h2 id="lights-journal-title">Your night journal.</h2><p>{storageAvailable ? "Your actions, and the birds they helped you discover. Saved on this device." : "Stored for this visit. Your browser cannot save the journal."}</p></div>{journal.length > 0 && <span>{journal.length} {journal.length === 1 ? "night" : "nights"} remembered</span>}</header>
      {!ready ? <p className="lights-empty">Opening your journal…</p> : !journal.length ? <div className="lights-empty"><p>Your first small act.<br />Your first bird to keep.</p><a href="#lights-title">Begin above <Arrow /></a></div> : <>
        <ol className="lights-journal-list">{(showAll ? journal : journal.slice(0, 5)).map((entry) => {
          const earned = rewards.find((item) => item.date === entry.date);
          const earnedBird = earned && getBird(earned.species);
          return <li key={entry.date}><time dateTime={entry.date}>{nightDateLabel(entry.date)}</time><div><p>{entry.imported && !entry.actions.length ? "Earlier Lights Out check-in" : entry.actions.map((id) => LIGHTS_OUT_ACTIONS.find((action) => action.id === id)?.recorded).join(" · ")}</p>{earnedBird && !showFlight ? <Link href={birdCollectionHref(earnedBird, returnTo)}>{earnedBird.name} · stamp earned</Link> : !earned ? <p>Earlier journal entry · no reward was recorded</p> : null}</div><button type="button" aria-label={`Remove night of ${nightDateLabel(entry.date)}`} onClick={() => undoNight(entry.date)}>Remove</button></li>;
        })}</ol>{journal.length > 5 && <button type="button" className="lights-show-more" onClick={() => setShowAll(!showAll)}>{showAll ? "Show recent nights" : `Show all ${journal.length} nights`}</button>}
      </>}
      <footer><p>Clearing this site’s data removes your nights and stamps.<br />Removing a night also removes its reward, unless earned on another night.</p><Link href={withMapReturn("/collection", returnTo)}>Your gallery <Arrow /></Link></footer>
    </section>
    {showFlight && <LightsFlight onFinish={() => setShowFlight(false)} />}
  </main>;
}
