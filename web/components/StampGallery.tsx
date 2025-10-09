'use client';

import { useBirdInteraction } from '@/contexts/BirdInteractionContext';
import { useRef } from 'react';

const StampGallery = () => {
  const { selectedBird, setSelectedLocation } = useBirdInteraction();
  const hoverTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const stamps = [
    { name: "Latham's Snipe", image: "/assets/LATHAM'S SNIPE.png", date: "Oct 5, 2024", unlocked: true, location: [-33.8464, 151.0686] as [number, number] },
    { name: "Painted Snipe", image: "/assets/PAINTED SNIPE.png", date: "Locked", unlocked: false, location: [-33.8968, 151.2294] as [number, number] },
    { name: "Pacific Plover", image: "/assets/plover.png", date: "Sep 28, 2024", unlocked: true, location: [-33.9961, 151.1956] as [number, number] },
    { name: "Red-necked Stint", image: "/assets/Red-necked Stint.png", date: "Locked", unlocked: false, location: [-33.7589, 151.1406] as [number, number] },
    { name: "Rainbow Bee-eater", image: "/assets/Rainbow Bee-eater.png", date: "Oct 8, 2024", unlocked: true, location: [-33.8968, 151.2294] as [number, number] },
    { name: "Black-faced Spoonbill", image: "/assets/Black-faced Spoonbill.png", date: "Oct 9, 2024", unlocked: true, location: [-33.8477, 151.0766] as [number, number] },
  ];

  const handleMouseEnter = (stamp: typeof stamps[0], index: number) => {
    if (stamp.unlocked) {
      // Set a timeout for 2 seconds
      hoverTimeoutRef.current[index] = setTimeout(() => {
        setSelectedLocation(stamp.location);
        // Auto-clear after 5 seconds
        setTimeout(() => setSelectedLocation(null), 5000);
      }, 2000);
    }
  };

  const handleMouseLeave = (index: number) => {
    // Clear the timeout if user leaves before 2 seconds
    if (hoverTimeoutRef.current[index]) {
      clearTimeout(hoverTimeoutRef.current[index]);
      delete hoverTimeoutRef.current[index];
    }
  };

  return (
    <div className="w-full px-12 pt-8 pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-white mb-2">
          Your Stamp Collection
        </h2>
        <p className="text-slate-400 text-xs">
          Turn off lights during migration nights to unlock bird stamps
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl font-semibold text-blue-400">4</span>
          <span className="text-slate-500 text-sm">/ 6 stamps collected</span>
        </div>
      </div>

      {/* Stamps Grid */}
      <div className="grid grid-cols-3 gap-6">
        {stamps.map((stamp, index) => {
          const isHighlighted = selectedBird === stamp.name;

          return (
            <div
              key={index}
              onMouseEnter={() => handleMouseEnter(stamp, index)}
              onMouseLeave={() => handleMouseLeave(index)}
              className={`${stamp.unlocked ? 'group cursor-pointer' : 'cursor-not-allowed'} text-center transition-all duration-300 ${
                isHighlighted ? 'ring-4 ring-blue-400 ring-opacity-100 scale-110 rounded-lg' : ''
              }`}
            >
              <div className={`aspect-[3/4] rounded overflow-hidden mb-3 transition-transform duration-300 ${
                stamp.unlocked ? 'hover:scale-105' : ''
              } ${isHighlighted ? 'animate-pulse' : ''} relative`}>
                {stamp.unlocked ? (
                  <img
                    src={stamp.image}
                    alt={stamp.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    <img
                      src={stamp.image}
                      alt={stamp.name}
                      className="w-full h-full object-contain filter blur-sm grayscale opacity-20"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-60">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </>
                )}
                {isHighlighted && (
                  <div className="absolute inset-0 pointer-events-none border-4 border-blue-400 rounded animate-pulse" />
                )}
              </div>
              <h3 className={`text-sm font-medium mb-1 ${stamp.unlocked ? 'text-white' : 'text-slate-600'} ${
                isHighlighted ? 'text-blue-300' : ''
              }`}>
                {stamp.name}
              </h3>
              <p className={`text-xs ${stamp.unlocked ? 'text-slate-500' : 'text-slate-700'}`}>
                {stamp.date}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress info */}
      <div className="mt-8 p-3 bg-blue-500/10 rounded-lg">
        <p className="text-blue-300 text-xs leading-relaxed">
          💡 Turn off lights during peak migration hours (8pm-11pm) to unlock more stamps!
        </p>
      </div>
    </div>
  );
};

export default StampGallery;
