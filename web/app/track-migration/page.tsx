import MigrationAtlas from "@/components/atlas/MigrationAtlas";
import { Suspense } from "react";

export default function TrackMigrationPage() {
  return <Suspense fallback={<main style={{ minHeight: "100svh", background: "#07141e" }} />}><MigrationAtlas /></Suspense>;
}
