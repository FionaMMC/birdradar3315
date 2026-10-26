"use client";

import { useEffect, useRef } from "react";
import { FLIGHT_FILM } from "@/lib/bird-video";
import LivingBirdFilm from "./LivingBirdFilm";

export default function LightsFlight({ onFinish }: { onFinish: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = priorOverflow; element?.close(); };
  }, []);

  return <dialog ref={dialog} className="lights-flight" aria-labelledby="lights-flight-title" onCancel={(event) => { event.preventDefault(); onFinish(); }}>
    <LivingBirdFilm film={FLIGHT_FILM} className="lights-flight__film" loop={false} endAfter={8} onEnded={onFinish} />
    <div className="lights-flight__shade" aria-hidden="true" />
    <header className="lights-flight__heading"><div><h2 id="lights-flight-title">Room for their journey.</h2><p>Your night is recorded. Take a moment with birds in flight.</p></div><button type="button" className="lights-flight__skip" onClick={onFinish} autoFocus>Skip to your night <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7" /></svg></button></header>
    <p className="lights-flight__note">Archival wildlife film · a moment of connection, not a sighting above your home.</p>
  </dialog>;
}
