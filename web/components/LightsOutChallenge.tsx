"use client";

import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import { useEffect, useState } from "react";
import SiteNav from "./atlas/SiteNav";
import "./atlas/editorial.css";

const KEY = "birdradar:lights-out:v1";
const localDay = () => { const now = new Date(); return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`; };

export default function LightsOutChallenge() {
  const [recorded, setRecorded] = useState(false);
  const [notice, setNotice] = useState("Saved on this device. No location is needed.");
  useEffect(() => { try { setRecorded(localStorage.getItem(KEY) === localDay()); } catch { setNotice("Browser storage is unavailable. Your check-in lasts for this visit."); } }, []);
  function record(value: boolean) {
    setRecorded(value);
    try {
      if (value) localStorage.setItem(KEY, localDay()); else localStorage.removeItem(KEY);
      setNotice(value ? "Today’s Lights Out check-in is saved on this device." : "Check-in removed. You can come back tonight.");
    } catch { setNotice("Your check-in lasts for this visit. Browser storage is unavailable."); }
  }
  return <main className={`editorial-page night-action${recorded ? " night-action--recorded" : ""}`}>
    <SiteNav />
    <section className="editorial-hero">
      <img className="editorial-backdrop" src={assetUrl("/assets/atlas/collection-poster.webp")} alt="" />
      <h1>{recorded ? <>A little darker.<br />A little kinder.</> : <>Make room<br />for the night.</>}</h1>
      <p>Switch off unnecessary lights and close curtains after dark. A small act for the birds that share our skies.</p>
      <label className="night-action__control"><input type="checkbox" checked={recorded} onChange={(event) => record(event.target.checked)} /> I’ve turned off unnecessary lights tonight.</label>
      <div className="night-action__note"><p role="status">{notice}</p><p>This is a personal check-in. Our historical atlas does not identify birds near you tonight.</p></div>
      <div className="night-action__links"><Link href="/collection">Visit your collection ↗</Link><a href="https://www.audubon.org/our-work/cities-and-towns/lights-out" target="_blank" rel="noreferrer">Why Lights Out helps · Audubon ↗</a></div>
    </section>
  </main>;
}
