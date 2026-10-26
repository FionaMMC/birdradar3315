import { assetUrl } from "@/lib/site-path";
import Link from "next/link";
import SiteNav from "@/components/atlas/SiteNav";
import "@/components/atlas/editorial.css";

export default function AboutPage() {
  return <main className="editorial-page">
    <SiteNav />
    <header className="editorial-hero">
      <img src={assetUrl("/assets/atlas/home-poster.webp")} alt="" className="editorial-backdrop" />
      <h1>One sky.<br />Many journeys.</h1>
      <p>BirdRadar brings bird journeys into view, through an open atlas and a collection of illustrated keepsakes.</p>
    </header>
    <section className="editorial-section">
      <h2>Follow the evidence.</h2>
      <div><p>The atlas connects published tracking studies with recorded sightings. Every layer has a source, a time period and a limit. The first collection follows Ospreys across the Americas, Waved Albatrosses in the eastern Pacific, and Bar-tailed Godwit sightings in East Asia and Australasia.</p>
      <p>These are historical samples. They show where observed birds were recorded; they do not predict which birds are overhead tonight. Blank areas mean that this collection has no records there.</p>
      <Link href="/sources">Read the data and methods ↗</Link></div>
    </section>
    <section className="editorial-section">
      <h2>Keep a little<br />of the journey.</h2>
      <div><p>Illustrated stamps offer another way to meet the birds. Explore the species stories, try a light-catching finish, and save your favourites on this device. Bookmarks and finishes are personal choices; completed species quizzes keep their own mark.</p>
      <Link href="/collection">Explore the collection ↗</Link></div>
    </section>
    <footer className="editorial-footer"><Link href="/track-migration">Open the atlas ↗</Link><Link href="/lights-out">Make room for the night ↗</Link></footer>
  </main>;
}
