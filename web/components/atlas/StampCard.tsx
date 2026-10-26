"use client";

import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";

export type StampFinish = "original" | "foil" | "holographic" | "polychrome";

export interface BirdStamp {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  color: string;
}

interface StampCardProps {
  stamp: BirdStamp;
  finish: StampFinish;
  active?: boolean;
  saved?: boolean;
  quizCompleted?: boolean;
  showCaption?: boolean;
  eager?: boolean;
  selectionLabel?: string;
  detailHref?: string;
  onSave: (id: string) => void;
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
export default function StampCard({ stamp, finish, active, saved, quizCompleted, onSave, onSelectSpecies, showCaption = true, eager = false, selectionLabel, detailHref }: StampCardProps) {
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
    if (event.pointerType === "touch" || !motionAllowed.current) return;
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

  const artwork = (
    <>
      {/* Original artwork includes its own paper texture and perforations. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bird-stamp__art" src={assetUrl(stamp.image)} alt={`${stamp.name}, illustrated postage stamp`} width={1024} height={1536} loading={eager ? "eager" : "lazy"} draggable={false} />
      <span className="bird-stamp__foil" aria-hidden="true" />
      <span className="bird-stamp__diffraction" aria-hidden="true" />
      <span className="bird-stamp__glare" aria-hidden="true" />
    </>
  );

  return (
    <article className={`bird-stamp${active ? " bird-stamp--active" : ""}`} style={{ "--stamp-accent": stamp.color, "--stamp-image": `url("${assetUrl(stamp.image)}")` } as CSSProperties}>
      <div className="bird-stamp__perspective" onPointerMove={moveLight} onPointerLeave={resetLight} onPointerCancel={resetLight}>
        <div ref={surfaceRef} className={`bird-stamp__surface bird-stamp__surface--${finish}`}>
          {onSelectSpecies ? (
            <button className="bird-stamp__image-button" type="button" onClick={() => onSelectSpecies(stamp.id)} aria-label={selectionLabel || `Show ${stamp.name} on the map`} aria-pressed={Boolean(active)}>
              {artwork}
            </button>
          ) : (
            <Link className="bird-stamp__image-button" href={detailHref || `/species/${stamp.id}`} aria-label={`Read about ${stamp.name}`}>
              {artwork}
            </Link>
          )}
        </div>
        {quizCompleted && <span className="bird-stamp__quiz" title="Species quiz completed on this device" aria-label="Species quiz completed"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3.5 8 3 3 6-6" /></svg></span>}
      </div>
      {showCaption && <div className="bird-stamp__caption">
        <div className="bird-stamp__identity">
          <Link href={detailHref || `/species/${stamp.id}`} className="bird-stamp__name">{stamp.name}</Link>
          <span className="bird-stamp__latin">{stamp.scientificName}</span>
        </div>
        <button type="button" className={`bird-stamp__save${saved ? " bird-stamp__save--saved" : ""}`} onClick={() => onSave(stamp.id)} aria-label={`${saved ? "Remove" : "Save"} ${stamp.name} ${saved ? "from" : "to"} your collection`} aria-pressed={Boolean(saved)} title={saved ? "Remove from collection" : "Save to collection"}>
          <Bookmark saved={Boolean(saved)} />
        </button>
      </div>}
    </article>
  );
}
