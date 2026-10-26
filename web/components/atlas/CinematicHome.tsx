"use client";

import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SiteNav from "./SiteNav";
import StampCard from "./StampCard";
import { BIRD_STAMPS } from "./StampCollection";
import "./cinematic.css";

export function Arrow({ direction = "up" }: { direction?: "up" | "right" | "down" | "left" }) {
  return <svg className={`cinematic-arrow cinematic-arrow--${direction}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg>;
}

export default function CinematicHome() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wantsPlay = useRef(true);
  const [filmEnabled, setFilmEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      wantsPlay.current = !query.matches;
      setFilmEnabled(!query.matches);
      if (query.matches) videoRef.current?.pause();
    };
    applyPreference();
    query.addEventListener("change", applyPreference);
    return () => query.removeEventListener("change", applyPreference);
  }, []);

  function playWhenReady() {
    if (wantsPlay.current) videoRef.current?.play().catch(() => setIsPlaying(false));
  }

  function toggleFilm() {
    if (isPlaying) {
      wantsPlay.current = false;
      videoRef.current?.pause();
    } else {
      wantsPlay.current = true;
      setFilmEnabled(true);
      videoRef.current?.play().catch(() => setIsPlaying(false));
    }
  }

  return (
    <main className="cinematic-page cinematic-home">
      <section className="cinematic-hero" aria-labelledby="home-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cinematic-backdrop" src={assetUrl("/assets/atlas/home-poster.webp")} alt="" fetchPriority="high" />
        {filmEnabled && !videoError && <video ref={videoRef} className={`cinematic-backdrop cinematic-film${hasPlayed ? " cinematic-film--playing" : ""}`} muted loop playsInline preload="metadata" poster={assetUrl("/assets/atlas/home-poster.webp")} onCanPlay={playWhenReady} onPlay={() => { setIsPlaying(true); setHasPlayed(true); }} onPause={() => setIsPlaying(false)} onError={() => { setVideoError(true); setIsPlaying(false); }} src={assetUrl("/assets/atlas/migration-flight.mp4")} />}
        <div className="cinematic-mask" aria-hidden="true" />
        <div className="cinematic-nav"><SiteNav active="home" /></div>
        <div className="cinematic-home__intro">
          <h1 id="home-title">A world<br />in flight.</h1>
          <p>Follow the journeys that connect us.</p>
          <div className="cinematic-home__links">
            <Link className="cinematic-primary-link" href="/track-migration">Explore migration <Arrow /></Link>
            <Link className="cinematic-secondary-link" href="/track-migration?view=nearby">Birds near home</Link>
          </div>
        </div>
        <div className="cinematic-home__stamps" aria-label="Discover the stamp collection">
          <div className="cinematic-home__stamp-pair">
            {[BIRD_STAMPS[1], BIRD_STAMPS[2]].map((stamp) => <div key={stamp.id} className="cinematic-home__stamp"><StampCard stamp={stamp} finish="holographic" showCaption={false} eager onSave={() => {}} /></div>)}
          </div>
          <Link href="/collection">Every journey leaves a mark. <Arrow /></Link>
        </div>
        <div className="cinematic-home__foot">
          <button className="cinematic-film-toggle" onClick={toggleFilm} type="button" disabled={videoError} aria-label={videoError ? "Background film unavailable; showing still image" : isPlaying ? "Pause background film" : "Play background film"}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">{isPlaying ? <><path d="M3 2h3v14H3z" /><path d="M12 2h3v14h-3z" /></> : <path d="m5 2 11 7-11 7z" />}</svg>
            <span>{videoError ? "Still frame" : isPlaying ? "Pause film" : "Play film"}</span>
          </button>
          <a className="cinematic-scroll" href="#journeys">Scroll to discover <Arrow direction="down" /></a>
        </div>
      </section>
      <section id="journeys" className="cinematic-home__story" aria-labelledby="journeys-title">
        <h2 id="journeys-title">No borders.<br />Just a way home.</h2>
        <div className="cinematic-home__story-copy">
          <p>Across oceans, coastlines and continents, birds follow journeys far bigger than the places we call home.</p>
          <p>Explore historical tracking data and recorded sightings on a shared atlas. Follow a bird’s route, discover the places it returns to, and keep a small reminder of its journey.</p>
          <Link className="cinematic-primary-link" href="/track-migration">Open the atlas <Arrow /></Link>
          <Link className="cinematic-secondary-link" href="/lights-out">Make room for a darker night <Arrow /></Link>
        </div>
      </section>
    </main>
  );
}
