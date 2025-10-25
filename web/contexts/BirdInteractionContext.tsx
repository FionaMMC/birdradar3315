'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BirdInteractionContextType {
  selectedBird: string | null;
  setSelectedBird: (bird: string | null) => void;
  selectedLocation: [number, number] | null;
  setSelectedLocation: (location: [number, number] | null) => void;
  mapCenter: [number, number] | null;
  setMapCenter: (center: [number, number] | null) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
}

const BirdInteractionContext = createContext<BirdInteractionContextType>({
  selectedBird: null,
  setSelectedBird: () => {},
  selectedLocation: null,
  setSelectedLocation: () => {},
  mapCenter: null,
  setMapCenter: () => {},
  mapZoom: 11,
  setMapZoom: () => {},
});

export const useBirdInteraction = () => useContext(BirdInteractionContext);

export function BirdInteractionProvider({ children }: { children: ReactNode }) {
  const [selectedBird, setSelectedBird] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(11);

  return (
    <BirdInteractionContext.Provider
      value={{
        selectedBird,
        setSelectedBird,
        selectedLocation,
        setSelectedLocation,
        mapCenter,
        setMapCenter,
        mapZoom,
        setMapZoom
      }}
    >
      {children}
    </BirdInteractionContext.Provider>
  );
}
