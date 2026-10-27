"use client";

import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";

export type StampFinish = "original" | "foil" | "holographic" | "polychrome";

export interface BirdStamp {
  id: string;
  name: string;
  scientificName: string;
  image?: string;
  photo?: string;
  photoCredit?: string;
  photoLicense?: string;
  photoLicenseUrl?: string;
  photoSource?: string;
  color: string;
}

interface StampCardProps {
  stamp: BirdStamp;
  finish: StampFinish;
  active?: boolean;
  unlocked?: boolean;
  rewardDate?: string;
  saved?: boolean;
  quizCompleted?: boolean;
  showCaption?: boolean;
  eager?: boolean;
  selectionLabel?: string;
  detailHref?: string;
  onSave?: (id: string) => void;
  onSelectSpecies?: (id: string) => void;
}

function Bookmark({ saved }: { saved: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6.5 4.5h11v15L12 16l-5.5 3.5z" strokeLinejoin="round" />
    </svg>
  );
}

/** The artwork stays intact; the finish is a separate optical layer. */
export default function StampCard({ stamp, finish, active, unlocked = false, rewardDate, saved, onSave, onSelectSpecies, showCaption = true, eager = false, selectionLabel, detailHref }: StampCardProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const motionAllowed = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      motionAllowed.current = !query.matches;
      if (query.matches && surfaceRef.current) {
        surfaceRef.current.style.setProperty("--stamp-rx", "0deg");
        surfaceRef.current.style.setProperty("--stamp-ry", "0deg");
      }
    };
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => {
      query.removeEventListener("change", updatePreference);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function moveLight(event: PointerEvent<HTMLDivElement>) {
    if (!unlocked || event.pointerType === "touch" || !motionAllowed.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const surface = surfaceRef.current;
      if (!surface) return;
      surface.style.setProperty("--stamp-x", `${(x * 100).toFixed(2)}%`);
      surface.style.setProperty("--stamp-y", `${(y * 100).toFixed(2)}%`);
      surface.style.setProperty("--stamp-rx", `${((0.5 - y) * 16).toFixed(2)}deg`);
      surface.style.setProperty("--stamp-ry", `${((x - 0.5) * 18).toFixed(2)}deg`);
      frameRef.current = null;
    });
  }

  function resetLight() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const surface = surfaceRef.current;
    if (!surface) return;
    surface.style.setProperty("--stamp-x", "38%");
    surface.style.setProperty("--stamp-y", "30%");
    surface.style.setProperty("--stamp-rx", "0deg");
    surface.style.setProperty("--stamp-ry", "0deg");
  }

  const artwork = !unlocked ? (
    <span className="bird-stamp__paper bird-stamp__sealed" aria-hidden="true">
      <span className="bird-stamp__paper-brand">BIRDRADAR</span>
      <span className="bird-stamp__sealed-message"><svg width="28" height="32" viewBox="0 0 28 32" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="5" y="13" width="18" height="15" rx="2" /><path d="M9 13V8a5 5 0 0 1 10 0v5M14 19v4" /></svg><strong>A night<br />still to come.</strong><span>LIGHTS OUT COLLECTION</span></span>
      <span className="bird-stamp__paper-footer">A small act. A story to keep.</span>
    </span>
  ) : (
    <>
      {stamp.image ? <img className="bird-stamp__art" src={assetUrl(stamp.image)} alt={`${stamp.name}, illustrated postage stamp`} width={1024} height={1536} loading={eager ? "eager" : "lazy"} draggable={false} /> : <span className={`bird-stamp__paper${stamp.photo ? " bird-stamp__paper--photo" : " bird-stamp__paper--type"}`}>
        <span className="bird-stamp__paper-brand">BIRDRADAR · LIGHTS OUT</span>
        {stamp.photo ? <img className="bird-stamp__photo" src={assetUrl(stamp.photo)} alt={stamp.name} loading={eager ? "eager" : "lazy"} draggable={false} /> : <span className="bird-stamp__type-mark" aria-hidden="true">{stamp.scientificName.split(" ").map((word) => word[0]).join(".") + "."}</span>}
        <span className="bird-stamp__paper-name">{stamp.name}<small>{stamp.scientificName}</small></span>
        <span className="bird-stamp__paper-footer">{stamp.photo ? "A life beneath the open sky." : "FIELD NOTES EDITION"}</span>
      </span>}
      <span className="bird-stamp__foil" aria-hidden="true" />
      <span className="bird-stamp__diffraction" aria-hidden="true" />
      <span className="bird-stamp__glare" aria-hidden="true" />
    </>
  );

  return (
    <article className={`bird-stamp${active ? " bird-stamp--active" : ""}${unlocked ? " bird-stamp--unlocked" : " bird-stamp--locked"}${!stamp.image || !unlocked ? " bird-stamp--paper" : ""}`} style={{ "--stamp-accent": stamp.color, "--stamp-image": stamp.image && unlocked ? `url("${assetUrl(stamp.image)}")` : "none" } as CSSProperties}>
      <div className="bird-stamp__perspective" onPointerMove={moveLight} onPointerLeave={resetLight} onPointerCancel={resetLight}>
        <div ref={surfaceRef} className={`bird-stamp__surface bird-stamp__surface--${unlocked ? finish : "original"}`}>
          {onSelectSpecies ? (
            <button className="bird-stamp__image-button" type="button" onClick={() => onSelectSpecies(stamp.id)} aria-label={selectionLabel || `${unlocked ? "Unlocked" : "Locked"} stamp: ${stamp.name}`} aria-pressed={Boolean(active)}>
              {artwork}
            </button>
          ) : (
            <Link className="bird-stamp__image-button" href={detailHref || `/species/${stamp.id}`} aria-label={`Read about ${stamp.name}. Stamp ${unlocked ? "unlocked" : "locked"}`}>
              {artwork}
            </Link>
          )}
        </div>
        {unlocked && <span className="bird-stamp__earned" title={rewardDate ? `Unlocked through Lights Out · ${rewardDate}` : "Unlocked through Lights Out"} aria-label="Unlocked through Lights Out"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3.5 8 3 3 6-6" /></svg></span>}
      </div>
      {showCaption && <div className="bird-stamp__caption">
        <div className="bird-stamp__identity">
          <Link href={detailHref || `/species/${stamp.id}`} className="bird-stamp__name">{stamp.name}</Link>
          <span className="bird-stamp__latin">{stamp.scientificName}</span>
          <span className="bird-stamp__status">{unlocked ? rewardDate ? `Unlocked · ${rewardDate}` : "Unlocked through Lights Out" : "Locked · Lights Out reward"}</span>
        </div>
        {onSave && <button type="button" className={`bird-stamp__save${saved ? " bird-stamp__save--saved" : ""}`} onClick={() => onSave(stamp.id)} aria-label={`${saved ? "Remove" : "Save"} ${stamp.name} ${saved ? "from" : "to"} your bookmarks`} aria-pressed={Boolean(saved)} title={saved ? "Remove bookmark" : "Bookmark field notes"}>
          <Bookmark saved={Boolean(saved)} />
        </button>}
      </div>}
      {showCaption && unlocked && stamp.photo && stamp.photoCredit && <p className="bird-stamp__photo-credit">Photo: {stamp.photoSource ? <a href={stamp.photoSource} target="_blank" rel="noreferrer">{stamp.photoCredit}</a> : stamp.photoCredit}{stamp.photoLicense && <> · {stamp.photoLicenseUrl ? <a href={stamp.photoLicenseUrl} target="_blank" rel="noreferrer">{stamp.photoLicense}</a> : stamp.photoLicense}</>} · Cropped for display</p>}
    </article>
  );
}
