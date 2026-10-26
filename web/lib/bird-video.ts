export type BirdFilm = {
  src: string;
  poster: string;
  label: string;
  description: string;
  credit: string;
  position?: string;
};

export const FLIGHT_FILM: BirdFilm = {
  src: "/assets/atlas/migration-flight.mp4",
  poster: "/assets/films/birds-in-flight.jpg",
  label: "Birds in flight",
  description: "Archival flock footage. This film does not identify the bird on this page or show a journey from the map.",
  credit: "Ami Bornstein, as credited in the original archive",
};

export const CITY_FILM: BirdFilm = {
  src: "/assets/films/city-birds.mp4",
  poster: "/assets/films/city-birds.jpg",
  label: "Birds above the city",
  description: "Archival footage, not a view of your location or tonight’s birds.",
  credit: "Lukas Pich, as credited in the original archive",
};

// The original filenames are not independent evidence of species identity.
// Keep these films at family-level until their production provenance is verified.
const PROFILE_FILMS: Record<string, BirdFilm> = {
  "lathams-snipe": {
    src: "/assets/films/snipe.mp4", poster: "/assets/films/snipe.jpg",
    label: "A snipe, up close", position: "62% center",
    description: "Snipe footage from the original project. The exact species has not been independently verified.",
    credit: "Original BirdRadar film archive",
  },
  "black-faced-spoonbill": {
    src: "/assets/films/spoonbill.mp4", poster: "/assets/films/spoonbill.jpg",
    label: "A spoonbill, at rest", position: "65% center",
    description: "Spoonbill footage from the original project. The exact species has not been independently verified.",
    credit: "Studio Non, as credited in the original archive",
  },
  "rainbow-bee-eater": {
    src: "/assets/films/bee-eaters.mp4", poster: "/assets/films/bee-eaters.jpg",
    label: "Bee-eaters, together", position: "60% center",
    description: "Archival footage of other bee-eaters, not a confirmed Rainbow Bee-eater.",
    credit: "Original BirdRadar film archive",
  },
};

export function birdFilm(id: string): BirdFilm {
  return PROFILE_FILMS[id] || FLIGHT_FILM;
}
