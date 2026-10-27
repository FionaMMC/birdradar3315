import type { Metadata } from "next";
import BirdDetail from "@/components/atlas/BirdDetail";
import { getBird } from "@/lib/birds";

const bird = getBird("curlew-sandpiper")!;
export const metadata: Metadata = { title: `${bird.name} · BirdRadar`, description: bird.summary };

export default function SpeciesPage() {
  return <BirdDetail bird={bird} />;
}
