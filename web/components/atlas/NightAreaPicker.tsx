"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { BIRDS } from "@/lib/birds";
import { browserData } from "@/lib/browser-data";
import { roundAtlasArea, validAtlasArea, type ChosenArea } from "@/lib/atlas-selection";
import type { NearbyResponse, PlaceResult } from "@/lib/nearby-data";
import type { NightCandidate } from "@/lib/night-rewards";
import { seasonalNightCandidates } from "@/lib/night-discovery";

export interface NightDiscovery { candidates: NightCandidate[]; area: ChosenArea | null; loading: boolean }
export const GLOBAL_NIGHT_CANDIDATES: NightCandidate[] = BIRDS.map((bird) => ({ id: bird.id, evidence: "global-discovery" }));
const AREA_KEY = "birdradar:chosen-area:v1";

export default function NightAreaPicker({ month, onChange }: { month: number; onChange: (discovery: NightDiscovery) => void }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<ChosenArea | null>(null);
  const [area, setArea] = useState<ChosenArea | null>(null);
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NearbyResponse | null>(null);
  const [error, setError] = useState("");
  const searchRequest = useRef<AbortController | null>(null);
  const locationRequest = useRef(0);

  useEffect(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(AREA_KEY) || "null");
      if (validAtlasArea(value)) setSaved(roundAtlasArea(value));
    } catch { /* An area is optional and only used when selected. */ }
    return () => { searchRequest.current?.abort(); locationRequest.current += 1; };
  }, []);

  useEffect(() => {
    setData(null); setError("");
    if (!area) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    browserData.loadNearby(area, controller.signal).then((result) => {
      if (!controller.signal.aborted) { setData(result); setLoading(false); }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) { setLoading(false); setError(cause instanceof Error ? cause.message : "Nearby records are unavailable."); }
    });
    return () => controller.abort();
  }, [area]);

  const localCandidates = useMemo(() => area && data ? seasonalNightCandidates(BIRDS, data.points, month, area.name) : [], [area, data, month]);
  useEffect(() => { onChange({ candidates: localCandidates.length ? localCandidates : GLOBAL_NIGHT_CANDIDATES, area, loading: loading || locating }); }, [localCandidates, area, loading, locating, onChange]);

  function choose(next: ChosenArea | null) {
    locationRequest.current += 1; setLocating(false);
    searchRequest.current?.abort(); setSearching(false); setPlaces([]); setMessage("");
    if (next && !validAtlasArea(next)) { setMessage("Choose a place between 85° south and 85° north."); return; }
    setData(null); setLoading(Boolean(next)); setArea(next ? roundAtlasArea(next) : null);
  }
  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); searchRequest.current?.abort(); locationRequest.current += 1; setLocating(false);
    if (query.trim().length < 2) { setSearching(false); setPlaces([]); setMessage("Enter at least two letters of a city or suburb."); return; }
    const controller = new AbortController(); searchRequest.current = controller;
    setSearching(true); setPlaces([]); setMessage("");
    try {
      const results = await browserData.searchPlaces(query.trim(), controller.signal);
      if (!controller.signal.aborted) { setPlaces(results); setMessage(results.length ? "" : "No matching place. Try a nearby city."); }
    } catch (cause: unknown) { if (!controller.signal.aborted) setMessage(cause instanceof Error ? cause.message : "Search unavailable. Try again."); }
    finally { if (!controller.signal.aborted) setSearching(false); }
  }
  function locate() {
    searchRequest.current?.abort(); setSearching(false); setPlaces([]);
    if (!navigator.geolocation) { setMessage("Location is unavailable. Search for a city instead."); return; }
    const request = ++locationRequest.current; setLocating(true); setMessage("");
    navigator.geolocation.getCurrentPosition((position) => {
      if (request !== locationRequest.current) return;
      choose({ latitude: position.coords.latitude, longitude: position.coords.longitude, name: "Your chosen area" });
    }, () => {
      if (request !== locationRequest.current) return;
      setLocating(false); setMessage("Location was unavailable. Search for a city or continue with a global discovery.");
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
  }

  return <div className="night-area">
    <button type="button" className="night-area__toggle" aria-expanded={open} aria-controls="night-area-options" onClick={() => setOpen(!open)}>{area ? area.name : "Connect this night to a place"} <span>{open ? "−" : "+"}</span></button>
    {open && <div id="night-area-options" className="night-area__options">
      <form onSubmit={search}><label htmlFor="night-city" className="lights-sr-only">City or suburb</label><input id="night-city" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="City or suburb" autoComplete="address-level2" /><button type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button></form>
      <div className="night-area__shortcuts"><button type="button" onClick={locate} disabled={locating}>{locating ? "Locating…" : "Use my location"}</button>{saved && <button type="button" onClick={() => choose(saved)}>Use {saved.name}</button>}{(area || locating) && <button type="button" onClick={() => choose(null)}>Use global discovery</button>}</div>
      {places.length > 0 && <ul>{places.map((place) => <li key={place.id}><button type="button" onClick={() => choose({ latitude: place.latitude, longitude: place.longitude, name: [place.name, place.country].filter(Boolean).join(", ") })}>{place.name}<span>{[place.admin, place.country].filter(Boolean).join(", ")}</span></button></li>)}</ul>}
      <p className="night-area__privacy">Optional. Only an approximate area is sent to the records service. Location does not verify a bird above your home.</p>
    </div>}
    <p className="night-area__status" role="status">{message || (locating ? "Waiting for your location choice…" : loading ? "Looking for records from this calendar month…" : localCandidates.length ? `Seasonal discovery · inspired by ${localCandidates.length} catalogued ${localCandidates.length === 1 ? "species" : "species"} observed near ${area!.name} in this calendar month. Historical records, not a live sighting.` : error ? `${error} You can still earn a global discovery.` : area ? "No matching seasonal records in this sample. Tonight will be a global discovery." : "Global discovery · a bird from our real-data atlas, revealed after your action.")}</p>
  </div>;
}
