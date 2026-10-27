export type BirdDataStatus = "tracking" | "observations" | "none";

export interface BirdProfile {
  id: string;
  name: string;
  scientificName: string;
  image?: string;
  /** Verified species photograph, separate from an illustrated stamp. */
  photo?: string;
  photoCredit?: string;
  photoLicense?: string;
  photoLicenseUrl?: string;
  photoSource?: string;
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

const observationSample = "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.";

/** Editorial species facts and atlas coverage are deliberately separate. */
export const BIRDS: BirdProfile[] = [
  {
    id: "lathams-snipe", name: "Latham’s Snipe", scientificName: "Gallinago hardwickii", image: "/assets/atlas/lathams-snipe-stamp.png", color: "#80cdd7",
    summary: "A quiet wetland visitor with a long journey between northern breeding grounds and an Australian summer.",
    identification: "A long, straight bill and intricately patterned brown plumage help this snipe disappear into wet grass. A flushed bird often leaves in a rapid zigzag.",
    habitat: "Shallow freshwater wetlands with low, dense vegetation, including some modified wetlands.",
    movement: "Breeds in northern Japan and nearby far-eastern Russian islands, then travels to south-eastern Australia for the non-breeding season.",
    care: "Keep a distance from wetland cover. Quiet edges give resting and feeding birds space.",
    dataStatus: "observations", mapSummary: observationSample,
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
    dataStatus: "observations", mapSummary: observationSample,
    sources: [{ label: "New Zealand Birds Online · Red-necked Stint", href: "https://www.nzbirdsonline.org.nz/species/red-necked-stint" }],
  },
  {
    id: "painted-snipe", name: "Australian Painted-snipe", scientificName: "Rostratula australis", image: "/assets/PAINTED SNIPE.png", color: "#d8b5ef",
    summary: "A secretive Australian wetland bird, moving with the changing availability of water.",
    identification: "A patterned wader with a long bill and conspicuous pale markings around the eye and across its body. Females are larger and more strongly coloured.",
    habitat: "Swamp margins, shallow wetlands and marshy areas with grasses or other low cover.",
    movement: "Restricted to Australia. Its movements follow suitable wetland conditions; it should not be presented as a regular international migrant.",
    care: "Protect wetland edges and avoid disturbing birds concealed in vegetation or feeding in shallow water.",
    dataStatus: "observations", mapSummary: observationSample,
    sources: [{ label: "NSW Government · Australian Painted Snipe profile", href: "https://threatenedspecies.bionet.nsw.gov.au/profile?id=10734" }, { label: "New Zealand Birds Online · Australian Painted Snipe", href: "https://www.nzbirdsonline.org.nz/species/australian-painted-snipe" }],
  },
  {
    id: "pacific-golden-plover", name: "Pacific Golden Plover", scientificName: "Pluvialis fulva", image: "/assets/plover.png", color: "#edc87d",
    summary: "Golden-flecked plumage, open tundra and a migration stretching across the Pacific region.",
    identification: "A long-legged plover with a short dark bill and gold-speckled upperparts. Breeding adults develop a striking dark face and underside edged with white.",
    habitat: "Arctic tundra for breeding; grasslands, saltmarshes and the upper parts of tidal mudflats farther south.",
    movement: "Breeds in Siberia and Alaska, then travels south to coasts and islands across Australasia and the Pacific. Individual journeys vary.",
    care: "Share coastal feeding and roosting places quietly; avoid repeatedly making flocks take flight.",
    dataStatus: "observations", mapSummary: observationSample,
    sources: [{ label: "New Zealand Birds Online · Pacific Golden Plover", href: "https://www.nzbirdsonline.org.nz/species/pacific-golden-plover" }],
  },
  {
    id: "rainbow-bee-eater", name: "Rainbow Bee-eater", scientificName: "Merops ornatus", image: "/assets/Rainbow Bee-eater.png", color: "#a7dca0",
    summary: "A flash of green, gold and blue, turning in the air after flying insects.",
    identification: "A slender curved bill, dark eye stripe and long tail streamers accompany its richly coloured plumage.",
    habitat: "Open woodland and lightly timbered areas, often near water. Sandy banks provide sites for nesting tunnels.",
    movement: "Many birds return from northern wintering areas to summer breeding sites. Some northern populations remain resident.",
    care: "Watch feeding birds from a distance and keep clear of nesting tunnels in sandy banks.",
    dataStatus: "observations", mapSummary: observationSample,
    sources: [{ label: "BirdLife Australia · Rainbow Bee-eater", href: "https://birdlife.org.au/bird-profiles/rainbow-bee-eater/" }],
  },
  {
    id: "black-faced-spoonbill", name: "Black-faced Spoonbill", scientificName: "Platalea minor", image: "/assets/Black-faced Spoonbill.png", color: "#b3c9ef",
    summary: "A coastal wetland traveller, recognised by the slow sweep of its extraordinary bill.",
    identification: "White plumage, bare black facial skin and a broad spoon-shaped bill. It sweeps the bill from side to side through shallow water.",
    habitat: "Coastal wetlands, marshes and fishponds, including the wintering grounds of Hong Kong’s Inner Deep Bay.",
    movement: "Birds wintering in Hong Kong return north toward breeding islands around the western Korean Peninsula and China’s Liaoning Province.",
    care: "Respect wetland reserve boundaries and give feeding and resting flocks space.",
    dataStatus: "observations", mapSummary: observationSample,
    sources: [{ label: "Hong Kong Biodiversity Information Hub · Black-faced Spoonbill", href: "https://bih.gov.hk/en/fast-facts/iconic-species/index-id-6.html" }],
  },
  {
    id: "waved-albatross", photo: "/assets/birds/waved-albatross.jpg", photoCredit: "D. Gordon E. Robertson", photoLicense: "CC BY-SA 3.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", photoSource: "https://commons.wikimedia.org/wiki/File:Waved_Albatross_pair.jpg", name: "Waved Albatross", scientificName: "Phoebastria irrorata", color: "#a1e8cd",
    summary: "An ocean-going bird seen here through a small, carefully bounded tracking study.",
    identification: "This profile accompanies the archived Waved Albatross records. Use the linked study for its study population and methods.",
    habitat: "The Galápagos and eastern tropical Pacific, as represented in this study sample.",
    movement: "The 2008 records include local foraging movements. A line in this dataset does not necessarily represent seasonal migration.",
    care: "Keep your distance from seabird nesting areas and follow local wildlife guidance.",
    dataStatus: "tracking", mapSummary: "28 tracked individuals · 1,057 daily positions · 2008 · eastern Pacific. Includes foraging as well as longer movements; this is not a live feed.",
    sources: [{ label: "Movebank · archived Waved Albatross study", href: "https://doi.org/10.5441/001/1.3hp3s250" }],
  },
  {
    id: "eastern-curlew", photo: "/assets/birds/eastern-curlew.jpg", photoCredit: "JJ Harrison ( https://www.jjharrison.com.au/ )", photoLicense: "CC BY-SA 4.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", photoSource: "https://commons.wikimedia.org/wiki/File:Numenius_madagascariensis_1_-_Stockton_Sandspit.jpg", name: "Far Eastern Curlew", scientificName: "Numenius madagascariensis", color: "#edb69e",
    summary: "From Australian tidal flats to northern breeding grounds, a long journey carried on broad wings.",
    identification: "A large, long-legged shorebird with a very long, downward-curving bill. It probes soft coastal mud for food.",
    habitat: "Coastal mudflats, estuaries and sheltered wetlands, with undisturbed places to rest at high tide.",
    movement: "The archived study follows birds from Australian non-breeding grounds along the East Asian–Australasian flyway. Birds from south-eastern and north-western Australia differed in migration timing and breeding destinations.",
    care: "Give feeding birds and high-tide roosts space. Repeated disturbance takes time away from resting and feeding before a long flight.",
    dataStatus: "tracking", mapSummary: "17 GPS-tracked individuals · 6,800 daily positions · 2017–2021 · Australia and East Asia. This is the archive’s GPS subset, with gaps retained; it is not a live migration feed.",
    sources: [{ label: "BirdLife Australia · Far Eastern Curlew", href: "https://birdlife.org.au/bird-profiles/far-eastern-curlew/" }, { label: "Movebank · archived Far Eastern Curlew GPS study", href: "https://doi.org/10.5441/001/1.v8r49083" }, { label: "Morrick et al. · Migratory connectivity study", href: "https://doi.org/10.1111/csp2.594" }],
  },
  {
    id: "bar-tailed-godwit", photo: "/assets/birds/bar-tailed-godwit.jpg", photoCredit: "Andreas Trepte", photoLicense: "CC BY-SA 2.5", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/2.5", photoSource: "https://commons.wikimedia.org/wiki/File:Bar-tailed_Godwit.jpg", name: "Bar-tailed Godwit", scientificName: "Limosa lapponica", color: "#e6bf8c",
    summary: "A long-billed shorebird whose far-reaching migrations connect northern tundra and southern estuaries.",
    identification: "Look for long legs and a long, slightly upturned bill, pink at the base and darker at the tip. Non-breeding birds are mostly brown and pale grey.",
    habitat: "Intertidal feeding grounds and estuaries; breeding habitats are in the far north.",
    movement: "The population reaching New Zealand mostly breeds in Alaska. Different populations use different journeys and stopovers.",
    care: "Avoid disturbing high-tide roosts, where birds gather to rest between feeding periods.",
    dataStatus: "observations", mapSummary: "599 published observations · 2024–2025 · selected East Asian and Australasian records. These sightings are separate records, not connected tracks or a population estimate.",
    sources: [{ label: "New Zealand Birds Online · Bar-tailed Godwit", href: "https://www.nzbirdsonline.org.nz/species/bar-tailed-godwit" }, { label: "BirdRadar · dataset citations and methods", href: "/sources" }],
  },
  {
    "id": "ruddy-turnstone", photo: "/assets/birds/ruddy-turnstone.jpg", photoCredit: "Chuck Homler d/b/a Focus On Wildlife", photoLicense: "CC BY-SA 4.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", photoSource: "https://commons.wikimedia.org/wiki/File:Ruddy_turnstone_(Arenaria_interpres)_Breeding_Plumage_Heislerville_WMA,_Cumberland_County,_New_Jersey,_USA.jpg",
    "name": "Ruddy Turnstone",
    "scientificName": "Arenaria interpres",
    "color": "#d49d89",
    "summary": "A small coastal traveller that turns shells, seaweed and stones in its search for food.",
    "identification": "A stocky shorebird with short orange legs and a short, stout bill. Breeding birds have a bold black-and-white head and chestnut patches across the back.",
    "habitat": "Rocky shores, sandy beaches and tidal feeding grounds; Arctic and subarctic tundra during breeding.",
    "movement": "Breeds around the northern Arctic and subarctic, then spreads to southern coasts. Different populations use different routes; the individual sightings here do not establish those journeys.",
    "care": "Give feeding shorebirds room and keep dogs away from high-tide roosts.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "New Zealand Birds Online · Ruddy Turnstone",
        "href": "https://www.nzbirdsonline.org.nz/species/ruddy-turnstone"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
  },
  {
    "id": "sanderling", photo: "/assets/birds/sanderling.jpg", photoCredit: "Chuck Homler, Focus On Wildlife", photoLicense: "CC BY-SA 4.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", photoSource: "https://commons.wikimedia.org/wiki/File:Sanderling_(Calidris_alba)_in_Breeding_Plumage_in_the_Delaware_Bay_-_Heislerville_WMA_-_Cumberland_County_-_New_Jersey_-_May_2026.jpg",
    "name": "Sanderling",
    "scientificName": "Calidris alba",
    "color": "#c1dae9",
    "summary": "A pale little runner, moving back and forth with the water along an open beach.",
    "identification": "Look for a compact pale-grey shorebird with a straight dark bill and dark legs. Its busy runs along the edge of the surf are distinctive.",
    "habitat": "Exposed sandy beaches outside the breeding season; high Arctic tundra for nesting.",
    "movement": "An Arctic breeder that reaches coastlines far to the south. Seasonal observations reveal recorded places and months, not the presence of a particular migrating bird.",
    "care": "Walk around feeding flocks and leave the strip of wet sand undisturbed.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "New Zealand Birds Online · Sanderling",
        "href": "https://www.nzbirdsonline.org.nz/species/sanderling"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
  },
  {
    "id": "red-knot", photo: "/assets/birds/red-knot.jpg", photoCredit: "Chuck Homler d/b/a Focus On Wildlife", photoLicense: "CC BY-SA 4.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", photoSource: "https://commons.wikimedia.org/wiki/File:Rufa_red_knot_(Calidris_canutus_rufa)_in_Delaware_Bay,_New_Jersey.jpg",
    "name": "Red Knot",
    "scientificName": "Calidris canutus",
    "color": "#d5a29a",
    "summary": "A flocking shorebird whose quiet grey plumage changes to warm red before its northern breeding season.",
    "identification": "A medium-sized sandpiper with a straight dark bill and grey upperparts outside breeding. Adults develop reddish underparts as the breeding season approaches.",
    "habitat": "Extensive tidal sandflats and mudflats, with shellbanks or sandspits for resting.",
    "movement": "Different subspecies connect Arctic breeding grounds with different southern regions. Birds reaching Australia and New Zealand breed in northern Russia and depend on staging areas in East Asia.",
    "care": "Allow uninterrupted feeding and rest at estuaries, particularly before birds depart on long journeys.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "New Zealand Birds Online · Red Knot",
        "href": "https://www.nzbirdsonline.org.nz/species/lesser-knot"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
  },
  {
    "id": "great-knot", photo: "/assets/birds/great-knot.jpg", photoCredit: "Original: tcager ; this edit: User:MPF", photoLicense: "CC0", photoLicenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en", photoSource: "https://commons.wikimedia.org/wiki/File:Calidris_tenuirostris,_Nadezhdinsky,_Primorsky_Krai,_Russia_1_(crop).jpg",
    "name": "Great Knot",
    "scientificName": "Calidris tenuirostris",
    "color": "#cab5ed",
    "summary": "A sturdy shorebird connecting northern breeding country with the tidal flats of Australia and Asia.",
    "identification": "Larger than a Red Knot, with a longer bill, a streaked head and a dark-spotted breast. Breeding plumage brings stronger black and reddish markings.",
    "habitat": "Intertidal mudflats and sheltered coasts outside the breeding season.",
    "movement": "Breeds in Russia and spends the non-breeding season largely in Australia. This map contains published observation points, with no individual identities connecting them.",
    "care": "Keep high-tide roosts quiet and avoid walking through resting flocks.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "New Zealand Birds Online · Great Knot",
        "href": "https://www.nzbirdsonline.org.nz/species/great-knot"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
  },
  {
    "id": "curlew-sandpiper", photo: "/assets/birds/curlew-sandpiper.jpg", photoCredit: "Imran Shah from Islamabad, Pakistan", photoLicense: "CC BY-SA 2.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/2.0", photoSource: "https://commons.wikimedia.org/wiki/File:Curlew_Sandpiper_(Calidris_ferruginea)_(44855173205).jpg",
    "name": "Curlew Sandpiper",
    "scientificName": "Calidris ferruginea",
    "color": "#edaca6",
    "summary": "A slender shorebird whose gently curved bill follows food beneath shallow water and soft mud.",
    "identification": "A long, fine, downward-curving bill, black legs and a white rump help distinguish it. Breeding plumage is reddish; non-breeding plumage is much paler.",
    "habitat": "Coastal mudflats, shallow pools and some inland wetlands.",
    "movement": "Breeds in high Arctic Siberia and disperses to non-breeding grounds in Africa and Australasia. Records in different months cannot by themselves trace an individual journey.",
    "care": "Protect shallow feeding areas and avoid flushing birds repeatedly.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "New Zealand Birds Online · Curlew Sandpiper",
        "href": "https://www.nzbirdsonline.org.nz/species/curlew-sandpiper"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
  },
  {
    "id": "sharp-tailed-sandpiper", photo: "/assets/birds/sharp-tailed-sandpiper.jpg", photoCredit: "Alpsdake", photoLicense: "CC BY-SA 4.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", photoSource: "https://commons.wikimedia.org/wiki/File:Calidris_acuminata_(s4).JPG",
    "name": "Sharp-tailed Sandpiper",
    "scientificName": "Calidris acuminata",
    "color": "#d5c98b",
    "summary": "A patterned wetland visitor with a reddish cap, pausing at shallow water during a long seasonal journey.",
    "identification": "A speckled brown-and-white wader with a short straight bill, reddish cap and a pale eyebrow extending behind the eye.",
    "habitat": "Shallow wetlands, marsh edges and coastal feeding areas.",
    "movement": "Breeds in Arctic Siberia and travels south, with Australia an important non-breeding region. Its arrival and passage vary by place, age and year.",
    "care": "Leave low wetland vegetation and quiet feeding margins undisturbed.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "New Zealand Birds Online · Sharp-tailed Sandpiper",
        "href": "https://www.nzbirdsonline.org.nz/species/sharp-tailed-sandpiper"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
  },
  {
    "id": "whimbrel", photo: "/assets/birds/whimbrel.jpg", photoCredit: "Andreas Trepte", photoLicense: "CC BY-SA 2.5", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/2.5", photoSource: "https://commons.wikimedia.org/wiki/File:Whimbrel_Numenius_phaeopus.jpg",
    "name": "Eurasian Whimbrel",
    "scientificName": "Numenius phaeopus",
    "color": "#d1baa0",
    "summary": "A coastal migrant with a sweeping curved bill and a boldly striped crown.",
    "identification": "Mottled brown plumage, a strong down-curved bill and pale stripes above the eye and along the centre of the crown.",
    "habitat": "Coastal flats, estuaries and other feeding grounds along its migration.",
    "movement": "Breeds in northern regions and reaches southern coasts, including Australia and New Zealand. This profile follows Numenius phaeopus, separate from the American Whimbrel in taxonomies that split them.",
    "care": "Give roosting groups room and keep tidal feeding habitat free of disturbance.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "New Zealand Birds Online · Eurasian Whimbrel",
        "href": "https://www.nzbirdsonline.org.nz/species/whimbrel"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
  },
  {
    "id": "common-tern", photo: "/assets/birds/common-tern.jpg", photoCredit: "MPF", photoLicense: "CC BY-SA 4.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", photoSource: "https://commons.wikimedia.org/wiki/File:2014-05-18_Sterna_hirundo,_Killingworth_Lake,_Northumberland_04.jpg",
    "name": "Common Tern",
    "scientificName": "Sterna hirundo",
    "color": "#a9dbe2",
    "summary": "A light-winged fish hunter, hovering briefly before diving toward the water.",
    "identification": "A slender grey-and-white seabird with long pointed wings and a forked tail. Breeding adults have a black cap; bill colours vary by population.",
    "habitat": "Coasts, islands, estuaries and freshwater lakes, with open ground for colonial nesting.",
    "movement": "A seasonal migrant across a broad range. North American birds can travel as far south as Argentina and Chile; other populations follow different journeys.",
    "care": "Stay outside marked nesting colonies and leave resting birds on beaches undisturbed.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "Cornell Lab · Common Tern",
        "href": "https://www.allaboutbirds.org/guide/Common_Tern/overview"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
  },
  {
    "id": "arctic-tern", photo: "/assets/birds/arctic-tern.jpg", photoCredit: "Charles J. Sharp", photoLicense: "CC BY-SA 4.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", photoSource: "https://commons.wikimedia.org/wiki/File:Arctic_tern_(Sterna_paradisaea)_Flatey_3.jpg",
    "name": "Arctic Tern",
    "scientificName": "Sterna paradisaea",
    "color": "#aabff0",
    "summary": "A delicate seabird whose yearly journey connects northern breeding grounds with the Antarctic summer.",
    "identification": "A slim grey-and-white tern with long angular wings. Breeding adults have a black cap, red bill and short red legs.",
    "habitat": "Northern coasts and islands for breeding; open seas and Antarctic pack-ice edges in the southern summer.",
    "movement": "Migrates over great distances between northern breeding areas and southern oceans, often offshore. The sparse shore-based observations here do not describe the whole ocean journey.",
    "care": "Respect nesting-colony boundaries and watch from far enough away that birds remain settled.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "Cornell Lab · Arctic Tern",
        "href": "https://www.allaboutbirds.org/guide/Arctic_Tern/overview"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
  },
  {
    "id": "barn-swallow", photo: "/assets/birds/barn-swallow.jpg", photoCredit: "Andreas Trepte", photoLicense: "CC BY-SA 2.5", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/2.5", photoSource: "https://commons.wikimedia.org/wiki/File:Rauchschwalbe_Hirundo_rustica.jpg",
    "name": "Barn Swallow",
    "scientificName": "Hirundo rustica",
    "color": "#b0b8ed",
    "summary": "A swift, low flight over open ground, with a deeply forked tail tracing the turns.",
    "identification": "Glossy blue upperparts, a reddish throat and a long forked tail. Underpart colours vary across its wide range.",
    "habitat": "Open countryside, wetlands and settled landscapes, often nesting on sheltered buildings or bridges.",
    "movement": "Breeds widely across the Northern Hemisphere and spends the non-breeding season across much of the Southern Hemisphere. Local timing differs between populations.",
    "care": "Leave active nests undisturbed and support insect-rich open spaces.",
    "dataStatus": "observations",
    "mapSummary": "Published 2024–2025 observations · small monthly global and Australian samples. These are independent sightings, not connected flight tracks, complete ranges or a prediction of birds overhead tonight.",
    "sources": [
      {
        "label": "Cornell Lab · Barn Swallow",
        "href": "https://www.allaboutbirds.org/guide/Barn_Swallow/overview"
      },
      {
        "label": "BirdRadar · dataset citations and methods",
        "href": "/sources"
      }
    ]
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
