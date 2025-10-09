'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BirdInteractionContextType {
  selectedBird: string | null;
  setSelectedBird: (bird: string | null) => void;
  selectedLocation: [number, number] | null;
  setSelectedLocation: (location: [number, number] | null) => void;
}

const BirdInteractionContext = createContext<BirdInteractionContextType>({
  selectedBird: null,
  setSelectedBird: () => {},
  selectedLocation: null,
  setSelectedLocation: () => {},
});

export const useBirdInteraction = () => useContext(BirdInteractionContext);

export function BirdInteractionProvider({ children }: { children: ReactNode }) {
  const [selectedBird, setSelectedBird] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  return (
    <BirdInteractionContext.Provider value={{ selectedBird, setSelectedBird, selectedLocation, setSelectedLocation }}>
      {children}
    </BirdInteractionContext.Provider>
  );
}
