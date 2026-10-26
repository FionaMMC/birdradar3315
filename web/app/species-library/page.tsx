"use client";
import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import SiteNav from "@/components/atlas/SiteNav";
import { BIRD_STAMPS } from "@/components/atlas/StampCollection";
import "@/components/atlas/editorial.css";

export default function SpeciesLibraryPage() {
  return <main className="editorial-page"><SiteNav />
    <header className="editorial-hero"><img className="editorial-backdrop" src={assetUrl("/assets/atlas/home-poster.webp")} alt="" /><h1>Meet the<br />travellers.</h1><p>Different wings, shared skies. Open a stamp to discover the bird behind it.</p></header>
    <section className="bird-library" aria-label="Bird species">{BIRD_STAMPS.map((bird) => <Link key={bird.id} href={`/species/${bird.id}`}><img src={assetUrl(bird.image)} alt={`Illustrated ${bird.name} stamp`} loading="lazy" /><h2>{bird.name}</h2><p>{bird.scientificName}</p></Link>)}</section>
    <footer className="editorial-footer"><Link href="/track-migration">Explore available tracking data ↗</Link><Link href="/collection">Try the stamp finishes ↗</Link></footer>
  </main>;
}
