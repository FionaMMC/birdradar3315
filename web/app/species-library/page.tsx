"use client";
import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import SiteNav from "@/components/atlas/SiteNav";
import StampCard from "@/components/atlas/StampCard";
import { BIRD_STAMPS } from "@/components/atlas/StampCollection";
import { useNightRewards } from "@/components/atlas/useNightRewards";
import { Arrow } from "@/components/atlas/CinematicHome";
import "@/components/atlas/editorial.css";
import "@/components/atlas/stamps.css";

export default function SpeciesLibraryPage() {
  const nights = useNightRewards();
  return <main className="editorial-page"><SiteNav />
    <header className="editorial-hero"><img className="editorial-backdrop" src={assetUrl("/assets/atlas/home-poster.webp")} alt="" /><h1>Meet the<br />travellers.</h1><p>Different wings, shared skies. Every bird’s field notes are open to explore. Stamps are earned through Lights Out.</p></header>
    <section className="bird-library bird-library--rewards" aria-label="Bird species">{BIRD_STAMPS.map((bird) => <div key={bird.id}><StampCard stamp={bird} finish="holographic" unlocked={nights.unlocked.has(bird.id)} rewardDate={nights.rewards.find((night) => night.species === bird.id)?.date} /><Link className="bird-library-field-link" href={`/species/${bird.id}`}>Open field notes<Arrow /></Link></div>)}</section>
    <footer className="editorial-footer"><Link href="/track-migration">Explore the migration atlas <Arrow /></Link><Link href="/collection">Open your stamp gallery <Arrow /></Link></footer>
  </main>;
}
