export type BirdDataStatus = "tracking" | "observations" | "none";

export interface BirdProfile {
  id: string;
  name: string;
  scientificName: string;
  image?: string;
  color: string;
  summary: string;
  identification: string;
  habitat: string;
  movement: string;
  care: string;
  dataStatus: BirdDataStatus;
  mapSummary: string;
  sources: { label: string; href: string }[];
}

const noTracking = "No tracking sample yet. This atlas does not currently contain individual tracks for this species. Nearby observations can show where people recorded birds, but cannot establish a flight route or a bird’s presence today.";

/** Editorial species facts and atlas coverage are deliberately separate. */
export const BIRDS: BirdProfile[] = [
  {
    id: "lathams-snipe", name: "Latham’s Snipe", scientificName: "Gallinago hardwickii", image: "/assets/atlas/lathams-snipe-stamp.png", color: "#80cdd7",
    summary: "A quiet wetland visitor with a long journey between northern breeding grounds and an Australian summer.",
    identification: "A long, straight bill and intricately patterned brown plumage help this snipe disappear into wet grass. A flushed bird often leaves in a rapid zigzag.",
    habitat: "Shallow freshwater wetlands with low, dense vegetation, including some modified wetlands.",
    movement: "Breeds in northern Japan and nearby far-eastern Russian islands, then travels to south-eastern Australia for the non-breeding season.",
    care: "Keep a distance from wetland cover. Quiet edges give resting and feeding birds space.",
    dataStatus: "none", mapSummary: noTracking,
    sources: [{ label: "ACT Government · Latham’s Snipe conservation advice", href: "https://legislation.act.gov.au/DownloadFile/ni/2025-304/current/PDF/2025-304.PDF" }],
  },
  {
    id: "osprey", name: "Osprey", scientificName: "Pandion haliaetus", image: "/assets/atlas/osprey-stamp.png", color: "#a8cbf1",
    summary: "A fish hunter whose life follows the meeting of open sky and water.",
    identification: "Watch for a large raptor hunting over water, pausing above the surface before a feet-first dive.",
    habitat: "Rivers, lakes, reservoirs and coastal shallows with accessible fish and open nest sites.",
    movement: "The atlas follows an archived North American tracking study, connecting breeding and non-breeding areas across the Americas. It is one regional sample, not the species’ entire range.",
    care: "Give nesting birds room, and remove discarded fishing line safely: it can become entangled in nests.",
    dataStatus: "tracking", mapSummary: "112 tracked individuals · 16,125 daily positions · 1995–2002 · Americas. Colours show use within this historical sample, not birds flying overhead now.",
    sources: [{ label: "Cornell Lab · Osprey life history", href: "https://www.allaboutbirds.org/guide/Osprey/lifehistory" }, { label: "Movebank · archived Osprey study", href: "https://doi.org/10.5441/001/1.sv6335t3" }],
  },
  {
    id: "red-necked-stint", name: "Red-necked Stint", scientificName: "Calidris ruficollis", image: "/assets/atlas/red-necked-stint-stamp.png", color: "#e9a8af",
    summary: "A tiny shorebird linking Arctic breeding grounds with southern coasts.",
    identification: "Small and delicate, with dark legs and a short black bill. Its rusty-red breeding colours fade to a quieter grey-brown outside the breeding season.",
    habitat: "Sheltered coasts, estuaries and muddy feeding areas, often in the company of other shorebirds.",
    movement: "Breeds in north-eastern Siberia and, less commonly, north-west Alaska. Its non-breeding range includes south-east Asia, Australia and New Zealand.",
    care: "Leave high-tide roosts undisturbed and watch from a distance rather than approaching a flock.",
    dataStatus: "none", mapSummary: noTracking,
    sources: [{ label: "New Zealand Birds Online · Red-necked Stint", href: "https://www.nzbirdsonline.org.nz/species/red-necked-stint" }],
  },
  {
    id: "painted-snipe", name: "Australian Painted-snipe", scientificName: "Rostratula australis", image: "/assets/PAINTED SNIPE.png", color: "#d8b5ef",
    summary: "A secretive Australian wetland bird, moving with the changing availability of water.",
    identification: "A patterned wader with a long bill and conspicuous pale markings around the eye and across its body. Females are larger and more strongly coloured.",
    habitat: "Swamp margins, shallow wetlands and marshy areas with grasses or other low cover.",
    movement: "Restricted to Australia. Its movements follow suitable wetland conditions; it should not be presented as a regular international migrant.",
    care: "Protect wetland edges and avoid disturbing birds concealed in vegetation or feeding in shallow water.",
    dataStatus: "none", mapSummary: noTracking,
    sources: [{ label: "NSW Government · Australian Painted Snipe profile", href: "https://threatenedspecies.bionet.nsw.gov.au/profile?id=10734" }, { label: "New Zealand Birds Online · Australian Painted Snipe", href: "https://www.nzbirdsonline.org.nz/species/australian-painted-snipe" }],
  },
  {
    id: "pacific-golden-plover", name: "Pacific Golden Plover", scientificName: "Pluvialis fulva", image: "/assets/plover.png", color: "#edc87d",
    summary: "Golden-flecked plumage, open tundra and a migration stretching across the Pacific region.",
    identification: "A long-legged plover with a short dark bill and gold-speckled upperparts. Breeding adults develop a striking dark face and underside edged with white.",
    habitat: "Arctic tundra for breeding; grasslands, saltmarshes and the upper parts of tidal mudflats farther south.",
    movement: "Breeds in Siberia and Alaska, then travels south to coasts and islands across Australasia and the Pacific. Individual journeys vary.",
    care: "Share coastal feeding and roosting places quietly; avoid repeatedly making flocks take flight.",
    dataStatus: "none", mapSummary: noTracking,
    sources: [{ label: "New Zealand Birds Online · Pacific Golden Plover", href: "https://www.nzbirdsonline.org.nz/species/pacific-golden-plover" }],
  },
  {
    id: "rainbow-bee-eater", name: "Rainbow Bee-eater", scientificName: "Merops ornatus", image: "/assets/Rainbow Bee-eater.png", color: "#a7dca0",
    summary: "A flash of green, gold and blue, turning in the air after flying insects.",
    identification: "A slender curved bill, dark eye stripe and long tail streamers accompany its richly coloured plumage.",
    habitat: "Open woodland and lightly timbered areas, often near water. Sandy banks provide sites for nesting tunnels.",
    movement: "Many birds return from northern wintering areas to summer breeding sites. Some northern populations remain resident.",
    care: "Watch feeding birds from a distance and keep clear of nesting tunnels in sandy banks.",
    dataStatus: "none", mapSummary: noTracking,
    sources: [{ label: "BirdLife Australia · Rainbow Bee-eater", href: "https://birdlife.org.au/bird-profiles/rainbow-bee-eater/" }],
  },
  {
    id: "black-faced-spoonbill", name: "Black-faced Spoonbill", scientificName: "Platalea minor", image: "/assets/Black-faced Spoonbill.png", color: "#b3c9ef",
    summary: "A coastal wetland traveller, recognised by the slow sweep of its extraordinary bill.",
    identification: "White plumage, bare black facial skin and a broad spoon-shaped bill. It sweeps the bill from side to side through shallow water.",
    habitat: "Coastal wetlands, marshes and fishponds, including the wintering grounds of Hong Kong’s Inner Deep Bay.",
    movement: "Birds wintering in Hong Kong return north toward breeding islands around the western Korean Peninsula and China’s Liaoning Province.",
    care: "Respect wetland reserve boundaries and give feeding and resting flocks space.",
    dataStatus: "none", mapSummary: noTracking,
    sources: [{ label: "Hong Kong Biodiversity Information Hub · Black-faced Spoonbill", href: "https://bih.gov.hk/en/fast-facts/iconic-species/index-id-6.html" }],
  },
  {
    id: "waved-albatross", name: "Waved Albatross", scientificName: "Phoebastria irrorata", color: "#a1e8cd",
    summary: "An ocean-going bird seen here through a small, carefully bounded tracking study.",
    identification: "This profile accompanies the archived Waved Albatross records. Use the linked study for its study population and methods.",
    habitat: "The Galápagos and eastern tropical Pacific, as represented in this study sample.",
    movement: "The 2008 records include local foraging movements. A line in this dataset does not necessarily represent seasonal migration.",
    care: "Keep your distance from seabird nesting areas and follow local wildlife guidance.",
    dataStatus: "tracking", mapSummary: "28 tracked individuals · 1,057 daily positions · 2008 · eastern Pacific. Includes foraging as well as longer movements; this is not a live feed.",
    sources: [{ label: "Movebank · archived Waved Albatross study", href: "https://doi.org/10.5441/001/1.3hp3s250" }],
  },
  {
    id: "eastern-curlew", name: "Far Eastern Curlew", scientificName: "Numenius madagascariensis", color: "#edb69e",
    summary: "From Australian tidal flats to northern breeding grounds, a long journey carried on broad wings.",
    identification: "A large, long-legged shorebird with a very long, downward-curving bill. It probes soft coastal mud for food.",
    habitat: "Coastal mudflats, estuaries and sheltered wetlands, with undisturbed places to rest at high tide.",
    movement: "The archived study follows birds from Australian non-breeding grounds along the East Asian–Australasian flyway. Birds from south-eastern and north-western Australia differed in migration timing and breeding destinations.",
    care: "Give feeding birds and high-tide roosts space. Repeated disturbance takes time away from resting and feeding before a long flight.",
    dataStatus: "tracking", mapSummary: "17 GPS-tracked individuals · 6,800 daily positions · 2017–2021 · Australia and East Asia. This is the archive’s GPS subset, with gaps retained; it is not a live migration feed.",
    sources: [{ label: "BirdLife Australia · Far Eastern Curlew", href: "https://birdlife.org.au/bird-profiles/far-eastern-curlew/" }, { label: "Movebank · archived Far Eastern Curlew GPS study", href: "https://doi.org/10.5441/001/1.v8r49083" }, { label: "Morrick et al. · Migratory connectivity study", href: "https://doi.org/10.1111/csp2.594" }],
  },
  {
    id: "bar-tailed-godwit", name: "Bar-tailed Godwit", scientificName: "Limosa lapponica", color: "#e6bf8c",
    summary: "A long-billed shorebird whose far-reaching migrations connect northern tundra and southern estuaries.",
    identification: "Look for long legs and a long, slightly upturned bill, pink at the base and darker at the tip. Non-breeding birds are mostly brown and pale grey.",
    habitat: "Intertidal feeding grounds and estuaries; breeding habitats are in the far north.",
    movement: "The population reaching New Zealand mostly breeds in Alaska. Different populations use different journeys and stopovers.",
    care: "Avoid disturbing high-tide roosts, where birds gather to rest between feeding periods.",
    dataStatus: "observations", mapSummary: "599 published observations · 2024–2025 · selected East Asian and Australasian records. These sightings are separate records, not connected tracks or a population estimate.",
    sources: [{ label: "New Zealand Birds Online · Bar-tailed Godwit", href: "https://www.nzbirdsonline.org.nz/species/bar-tailed-godwit" }, { label: "BirdRadar · dataset citations and methods", href: "/sources" }],
  },
];

export function getBird(id: string | null | undefined): BirdProfile | undefined {
  return BIRDS.find((bird) => bird.id === id);
}

export function safeMapReturnTo(value: string | null | undefined): string | null {
  if (!value?.startsWith("/track-migration?")) return null;
  try {
    const url = new URL(value, "https://birdradar.local");
    const view = url.searchParams.get("view");
    if (url.origin !== "https://birdradar.local" || url.pathname !== "/track-migration" || (view !== null && view !== "nearby")) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return null; }
}

export function withMapReturn(href: string, returnTo?: string | null): string {
  const map = safeMapReturnTo(returnTo);
  if (!map) return href;
  const url = new URL(href, "https://birdradar.local");
  url.searchParams.set("returnTo", map);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function birdMapHref(bird: Pick<BirdProfile, "id" | "dataStatus">, returnTo?: string | null): string {
  const map = safeMapReturnTo(returnTo);
  if (map) return map;
  return bird.dataStatus === "none"
    ? `/track-migration?view=nearby&species=${encodeURIComponent(bird.id)}`
    : `/track-migration?species=${encodeURIComponent(bird.id)}&month=all`;
}

export function birdCollectionHref(bird: Pick<BirdProfile, "id">, returnTo?: string | null): string {
  return withMapReturn(`/collection?species=${encodeURIComponent(bird.id)}`, returnTo);
}

export function birdDataLabel(bird: Pick<BirdProfile, "dataStatus">): string {
  return bird.dataStatus === "tracking" ? "Historical tracking" : bird.dataStatus === "observations" ? "Published observations" : "No tracking sample yet";
}
