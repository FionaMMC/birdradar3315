import type { Metadata } from "next";
import { Suspense } from "react";
import CollectionExperience from "@/components/atlas/CollectionExperience";

export const metadata: Metadata = {
  title: "The collection · BirdRadar",
  description: "A field collection of migratory birds. Discover each species and explore illustrated stamps with light-responsive finishes.",
};

export default function CollectionPage() {
  return <Suspense fallback={<main style={{ minHeight: "100svh", background: "#08131f", color: "#f7f6f0", padding: "15vh 7%" }}><p>Opening your collection…</p></main>}><CollectionExperience /></Suspense>;
}
