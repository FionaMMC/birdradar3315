"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseAtlasArea, roundAtlasArea, updateAtlasSelection, validAtlasArea, type ChosenArea } from "@/lib/atlas-selection";
import type { NearbyResponse, PlaceResult } from "@/lib/nearby-data";
import { browserData } from "@/lib/browser-data";

const AREA_KEY = "birdradar:chosen-area:v1";
type NearbyRequestState = { key: string; data: NearbyResponse | null; loading: boolean; error: string };

/** Location changes data and viewport inside the atlas; it never mounts a second exploration UI. */
export function useAtlasLocation() {
  const router = useRouter();
  const params = useSearchParams();
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const lat = params.getAll("lat").join("|"), lon = params.getAll("lon").join("|"), name = params.get("place");
  const area = useMemo(() => parseAtlasArea(paramsRef.current), [lat, lon, name]);
  const areaKey = area ? `${area.latitude},${area.longitude}` : "";
  const [savedArea, setSavedArea] = useState<ChosenArea | null>(null);
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [requestState, setRequestState] = useState<NearbyRequestState>({ key: "", data: null, loading: false, error: "" });
  const searchController = useRef<AbortController | null>(null);
  const locationRequest = useRef(0);
  const dataRequest = useRef(0);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(AREA_KEY) || "null");
      if (validAtlasArea(stored)) setSavedArea(roundAtlasArea(stored));
    } catch { /* Remembering an area is optional. */ }
    return () => { searchController.current?.abort(); locationRequest.current += 1; dataRequest.current += 1; };
  }, []);

  useEffect(() => {
    const request = ++dataRequest.current;
    if (!areaKey) { setRequestState({ key: "", data: null, loading: false, error: "" }); return; }
    const controller = new AbortController();
    const [latitude, longitude] = areaKey.split(",");
    setRequestState({ key: areaKey, data: null, loading: true, error: "" });
    browserData.loadNearby({ latitude: Number(latitude), longitude: Number(longitude) }, controller.signal)
      .then((data) => { if (!controller.signal.aborted && request === dataRequest.current) setRequestState({ key: areaKey, data, loading: false, error: "" }); })
      .catch((cause: unknown) => { if (!controller.signal.aborted && request === dataRequest.current) setRequestState({ key: areaKey, data: null, loading: false, error: cause instanceof Error ? cause.message : "The records could not be loaded." }); });
    return () => controller.abort();
  }, [areaKey, retryCount]);

  const chooseArea = useCallback((next: ChosenArea) => {
    locationRequest.current += 1; setLocating(false);
    if (!validAtlasArea(next)) { setSearchMessage("This map supports locations between 85° south and 85° north. Try a nearby city within this range."); return; }
    searchController.current?.abort(); setSearching(false);
    // A profile's location-less discovery link may intentionally request its bird.
    // An ordinary move from a tracked journey should start with all local birds.
    const current = paramsRef.current;
    const requestedProfile = current.get("view") === "nearby" && !parseAtlasArea(current) ? current.get("species") : null;
    const selection = updateAtlasSelection(current, { area: next, layer: "observation-heat", species: requestedProfile });
    router.replace(`/track-migration?${selection}`, { scroll: false });
    setPlaces([]); setSearchMessage("");
  }, [router]);

  async function searchPlaces(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    searchController.current?.abort();
    locationRequest.current += 1; setLocating(false);
    if (query.trim().length < 2) { setSearching(false); setPlaces([]); setSearchMessage("Enter at least two letters of a city or suburb."); return; }
    const controller = new AbortController(); searchController.current = controller;
    setSearching(true); setPlaces([]); setSearchMessage("");
    try {
      const results = await browserData.searchPlaces(query.trim(), controller.signal);
      if (!controller.signal.aborted) {
        setPlaces(results);
        if (!results.length) setSearchMessage("No matching place. Try a nearby city, or move the map and search that area.");
      }
    } catch (cause: unknown) { if (!controller.signal.aborted) setSearchMessage(cause instanceof Error ? cause.message : "Place search is unavailable. Try again."); }
    finally { if (!controller.signal.aborted) setSearching(false); }
  }

  function locate() {
    searchController.current?.abort(); setSearching(false); setPlaces([]);
    const request = ++locationRequest.current;
    if (!navigator.geolocation) { setLocating(false); setSearchMessage("Location is unavailable in this browser. Search for a city or suburb instead."); return; }
    setLocating(true); setSearchMessage("");
    navigator.geolocation.getCurrentPosition((position) => {
      if (request !== locationRequest.current) return;
      chooseArea({ latitude: position.coords.latitude, longitude: position.coords.longitude, name: "My approximate area" });
    }, (cause) => {
      if (request !== locationRequest.current) return;
      setLocating(false);
      setSearchMessage(cause.code === 1 ? "Location was not shared. Search for a city or suburb instead." : "Your location could not be found. Try a city or suburb.");
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
  }

  function cancelLocate() {
    // Browser geolocation has no AbortSignal; invalidate both late callbacks.
    locationRequest.current += 1;
    setLocating(false);
  }

  function rememberArea() {
    if (!area) return;
    try { localStorage.setItem(AREA_KEY, JSON.stringify(area)); setSavedArea(area); setNotice("Approximate area remembered on this device."); }
    catch { setNotice("Browser storage is unavailable. You can still explore this area."); }
  }
  function forgetArea() {
    try { localStorage.removeItem(AREA_KEY); setSavedArea(null); setNotice("Remembered area removed from this device."); }
    catch { setNotice("Could not remove the saved area. Check this browser’s storage settings."); }
  }
  const isRemembered = Boolean(area && savedArea?.latitude === area.latitude && savedArea?.longitude === area.longitude);
  // Drop old-area records synchronously, before an effect has time to start the next request.
  const matchingRequest = requestState.key === areaKey;
  return {
    area, data: matchingRequest ? requestState.data : null,
    loading: Boolean(areaKey) && (!matchingRequest || requestState.loading), error: matchingRequest ? requestState.error : "",
    retry: () => setRetryCount((value) => value + 1),
    query, setQuery, places, searching, searchMessage, locating, searchPlaces, locate, cancelLocate, chooseArea,
    rememberArea, forgetArea, savedArea, isRemembered, notice,
  };
}

export default useAtlasLocation;
