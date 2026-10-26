"use client";

import { useEffect, useId, useState } from "react";
import StampCard, { type BirdStamp, type StampFinish } from "./StampCard";
import { BIRDS } from "@/lib/birds";
import "./stamps.css";

export const BIRD_STAMPS: BirdStamp[] = BIRDS.filter((bird): bird is typeof bird & { image: string } => Boolean(bird.image));

const STORAGE_KEY = "birdradar:saved-stamps:v1";
const FINISH_KEY = "birdradar:stamp-finish:v1";
const SAVED_EVENT = "birdradar:collection-updated";
export const STAMP_FINISHES: { id: StampFinish; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "foil", label: "Foil" },
  { id: "holographic", label: "Holo" },
  { id: "polychrome", label: "Polychrome" },
];

function readIds(key: string): Set<string> {
  const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
  if (!Array.isArray(value)) return new Set();
  return new Set(value.filter((id): id is string => typeof id === "string" && BIRD_STAMPS.some((stamp) => stamp.id === id)));
}

export function useStampCollection() {
  const [finish, setFinish] = useState<StampFinish>("polychrome");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [quizCompleted, setQuizCompleted] = useState<Set<string>>(new Set());
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    function loadCollection() {
      try {
        setSaved(readIds(STORAGE_KEY));
        const storedFinish = localStorage.getItem(FINISH_KEY);
        if (STAMP_FINISHES.some(({ id }) => id === storedFinish)) setFinish(storedFinish as StampFinish);
        setStorageAvailable(true);
      } catch { setStorageAvailable(false); }
      // Bookmarks and cosmetic previews never unlock a genuine quiz completion.
      try { setQuizCompleted(readIds("premiumStamps")); } catch { setQuizCompleted(new Set()); }
    }
    function onStorage(event: StorageEvent) {
      if ([STORAGE_KEY, FINISH_KEY, "premiumStamps", null].includes(event.key)) loadCollection();
    }
    loadCollection();
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAVED_EVENT, loadCollection);
    window.addEventListener("premiumStampUnlocked", loadCollection);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAVED_EVENT, loadCollection);
      window.removeEventListener("premiumStampUnlocked", loadCollection);
    };
  }, []);

  function changeFinish(next: StampFinish) {
    setFinish(next);
    try {
      localStorage.setItem(FINISH_KEY, next);
      window.dispatchEvent(new Event(SAVED_EVENT));
    } catch { setStorageAvailable(false); }
  }

  function toggleSaved(id: string) {
    const next = new Set(saved);
    const removing = next.has(id);
    if (removing) next.delete(id); else next.add(id);
    const name = BIRD_STAMPS.find((stamp) => stamp.id === id)?.name || "Stamp";
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      setStorageAvailable(true);
      setNotice(`${name} ${removing ? "removed from" : "saved to"} your collection.`);
      window.dispatchEvent(new Event(SAVED_EVENT));
    } catch {
      setStorageAvailable(false);
      setNotice(`${name} ${removing ? "removed" : "saved"} for this visit. Browser storage is unavailable.`);
    }
  }

  return { finish, saved, quizCompleted, storageAvailable, notice, changeFinish, toggleSaved };
}

export function StampFinishes({ finish, onChange }: { finish: StampFinish; onChange: (finish: StampFinish) => void }) {
  return (
    <fieldset className="stamp-collection__finishes">
      <legend className="stamp-collection__announcement">Choose a stamp finish</legend>
      <div className="stamp-collection__finish-options">
        {STAMP_FINISHES.map((option) => (
          <button key={option.id} type="button" className={`stamp-collection__finish${finish === option.id ? " stamp-collection__finish--active" : ""}`} onClick={() => onChange(option.id)} aria-pressed={finish === option.id}>{option.label}</button>
        ))}
      </div>
    </fieldset>
  );
}

interface StampCollectionProps {
  activeSpecies?: string;
  onSelectSpecies?: (id: string) => void;
  compact?: boolean;
}

export default function StampCollection({ activeSpecies, onSelectSpecies, compact = false }: StampCollectionProps) {
  const titleId = useId();
  const collection = useStampCollection();
  return (
    <section className={`stamp-collection${compact ? " stamp-collection--compact" : ""}`} aria-labelledby={titleId}>
      <header className="stamp-collection__header">
        <div><h2 id={titleId}>Small wonders.</h2><p>A collection of journeys.</p></div>
        <span className="stamp-collection__count"><strong>{collection.saved.size}</strong><span>/ {BIRD_STAMPS.length} saved</span></span>
      </header>
      <StampFinishes finish={collection.finish} onChange={collection.changeFinish} />
      <div className="stamp-collection__grid">
        {BIRD_STAMPS.map((stamp) => <StampCard key={stamp.id} stamp={stamp} finish={collection.finish} active={activeSpecies === stamp.id} saved={collection.saved.has(stamp.id)} quizCompleted={collection.quizCompleted.has(stamp.id)} onSave={collection.toggleSaved} onSelectSpecies={onSelectSpecies} />)}
      </div>
      <footer className="stamp-collection__footer">
        <p>{onSelectSpecies ? "Select a stamp to explore its data. " : "Open a stamp to meet the species. "}Save your favourites with the bookmark.</p>
        <p>{collection.storageAvailable ? "Saved on this device. Finishes are visual previews." : "Browser storage is unavailable. Bookmarks last for this visit."}</p>
        {collection.quizCompleted.size > 0 && <p>A check marks a species quiz you previously completed.</p>}
      </footer>
      <span className="stamp-collection__announcement" role="status">{collection.notice}</span>
    </section>
  );
}
