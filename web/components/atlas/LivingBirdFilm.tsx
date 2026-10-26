"use client";

import { assetUrl } from "@/lib/site-path";
import { useEffect, useRef, useState } from "react";
import type { BirdFilm } from "@/lib/bird-video";
import "./living-bird-film.css";

type Props = {
  film: BirdFilm;
  className?: string;
  loop?: boolean;
  endAfter?: number;
  onEnded?: () => void;
  showDescription?: boolean;
};

export default function LivingBirdFilm({ film, className = "", loop = true, endAfter, onEnded, showDescription = false }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const wantsPlay = useRef(false);
  const inView = useRef(true);
  const ended = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [loading, setLoading] = useState(false);

  function syncPlayback() {
    const element = video.current;
    if (!element) return;
    if (wantsPlay.current && inView.current && !document.hidden && !ended.current) {
      element.play().catch(() => { setPlaying(false); setLoading(false); });
    } else element.pause();
  }

  useEffect(() => {
    ended.current = false;
    setHasPlayed(false);
    setPlaying(false);
    setFailed(false);
    setLoading(false);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => {
      setReduced(preference.matches);
      wantsPlay.current = !preference.matches;
      if (!preference.matches) setEnabled(true);
      syncPlayback();
    };
    onPreference();
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", syncPlayback);
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.08 });
    if (root.current) observer.observe(root.current);
    return () => {
      preference.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", syncPlayback);
      observer.disconnect();
    };
  }, [film.src]);

  function toggle() {
    if (failed) return;
    wantsPlay.current = !playing;
    if (!playing) {
      ended.current = false;
      if (video.current?.ended) video.current.currentTime = 0;
      setEnabled(true);
      setLoading(true);
    }
    syncPlayback();
  }

  function finish() {
    if (ended.current) return;
    ended.current = true;
    wantsPlay.current = false;
    video.current?.pause();
    onEnded?.();
  }

  return <div ref={root} className={`living-film ${className}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="living-film__image" src={assetUrl(film.poster)} alt="" style={{ objectPosition: film.position }} fetchPriority="high" />
    {enabled && !failed && <video key={film.src} ref={video} className={`living-film__video${hasPlayed ? " is-visible" : ""}`} style={{ objectPosition: film.position }} src={assetUrl(film.src)} poster={assetUrl(film.poster)} muted playsInline loop={loop} preload="metadata" aria-label={film.label}
      onCanPlay={() => { setLoading(false); syncPlayback(); }} onPlaying={() => { setPlaying(true); setHasPlayed(true); setLoading(false); }} onPause={() => setPlaying(false)}
      onWaiting={() => setLoading(true)} onError={() => { setFailed(true); setPlaying(false); setLoading(false); }} onEnded={finish}
      onTimeUpdate={(event) => { if (endAfter && event.currentTarget.currentTime >= endAfter) finish(); }} />}
    <div className="living-film__controls">
      <div className="living-film__caption"><span>{film.label}</span>{showDescription && <p>{film.description}</p>}</div>
      <button type="button" onClick={toggle} disabled={failed} aria-label={failed ? "Film unavailable; showing a still frame" : playing ? "Pause bird film" : "Play bird film"}>
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{playing ? <path d="M7 4v12M13 4v12" /> : <path d="m6 3 10 7-10 7Z" />}</svg>
        {failed ? "Still frame" : loading ? "Loading film…" : playing ? "Pause film" : "Play film"}
      </button>
      {reduced && !hasPlayed && <span className="living-film__preference">Motion is paused. Play when you’re ready.</span>}
      {failed && <span className="living-film__preference" role="status">The film could not load. Your other actions still work.</span>}
    </div>
  </div>;
}
