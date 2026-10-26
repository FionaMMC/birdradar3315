"use client";

import { assetUrl } from "@/lib/site-path";
import { useBirdInteraction } from "@/contexts/BirdInteractionContext";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

const StampGallery = () => {
  const { selectedBird, setSelectedLocation } = useBirdInteraction();
  const hoverTimeoutRef = useRef<{
    [key: number]: ReturnType<typeof setTimeout>;
  }>({});
  const [premiumStamps, setPremiumStamps] = useState<Set<string>>(new Set());

  const stamps = [
    {
      id: "lathams-snipe",
      name: "Latham's Snipe",
      image: "/assets/LATHAM'S SNIPE.png",
      date: "Oct 5, 2025",
      unlocked: true,
      location: [-33.8464, 151.0686] as [number, number],
    },
    {
      id: "painted-snipe",
      name: "Painted Snipe",
      image: "/assets/PAINTED SNIPE.png",
      date: "Locked",
      unlocked: false,
      location: [-33.8968, 151.2294] as [number, number],
    },
    {
      id: "pacific-golden-plover",
      name: "Pacific Golden Plover",
      image: "/assets/plover.png",
      date: "Sep 28, 2025",
      unlocked: true,
      location: [-33.9961, 151.1956] as [number, number],
    },
    {
      id: "red-necked-stint",
      name: "Red-necked Stint",
      image: "/assets/Red-necked Stint.png",
      date: "Oct 12, 2025",
      unlocked: true,
      location: [-33.7589, 151.1406] as [number, number],
    },
    {
      id: "rainbow-bee-eater",
      name: "Rainbow Bee-eater",
      image: "/assets/Rainbow Bee-eater.png",
      date: "Oct 8, 2025",
      unlocked: true,
      location: [-33.8968, 151.2294] as [number, number],
    },
    {
      id: "black-faced-spoonbill",
      name: "Black-faced Spoonbill",
      image: "/assets/Black-faced Spoonbill.png",
      date: "Oct 9, 2025",
      unlocked: true,
      location: [-33.8477, 151.0766] as [number, number],
    },
  ];

  // Load premium stamps from localStorage
  useEffect(() => {
    const loadPremiumStamps = () => {
      const stored = localStorage.getItem("premiumStamps");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPremiumStamps(new Set(parsed));
        } catch (e) {
          console.error("Error loading premium stamps:", e);
        }
      }
    };
    loadPremiumStamps();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "premiumStamps") loadPremiumStamps();
    };
    window.addEventListener("storage", handleStorageChange);

    const handlePremiumUnlock = () => loadPremiumStamps();
    window.addEventListener("premiumStampUnlocked", handlePremiumUnlock);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("premiumStampUnlocked", handlePremiumUnlock);
    };
  }, []);

  const handleMouseEnter = (stamp: (typeof stamps)[0], index: number) => {
    if (stamp.unlocked) {
      hoverTimeoutRef.current[index] = setTimeout(() => {
        setSelectedLocation(stamp.location);
        setTimeout(() => setSelectedLocation(null), 5000);
      }, 300);
    }
  };

  const handleMouseLeave = (index: number) => {
    if (hoverTimeoutRef.current[index]) {
      clearTimeout(hoverTimeoutRef.current[index]);
      delete hoverTimeoutRef.current[index];
    }
  };

  return (
    <div className="w-full px-12 pt-8 pb-12">
      {/* 标题与提示文字 */}
      <div className="mb-8">
        <h2 className="text-2xl font-light text-white mb-2">
          Your Stamp Collection
        </h2>
        <p className="text-slate-400 text-xs leading-relaxed">
          Collect stamps by participating in Sydney’s{" "}
          <span className="text-blue-300">bird-friendly nights</span>. Each time
          you turn off unnecessary lights during migration hours, you help birds
          travel safely — and earn a new stamp in your collection.
        </p>
        <p className="text-slate-500 text-xs mt-1 italic">
          💡 Tip: Hover over a stamp to view its migration location on the map.
        </p>
        <p className="text-slate-400 text-xs mt-1 italic">
          🔍 Click on a stamp to view detailed information about the bird
          species.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl font-semibold text-blue-400">5</span>
          <span className="text-slate-500 text-sm">/ 6 stamps collected</span>
        </div>
      </div>

      {/* 邮票网格 */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        {stamps.map((stamp, index) => {
          const isHighlighted = selectedBird === stamp.name;
          const isPremium = premiumStamps.has(stamp.id);

          const CardInner = (
            <>
              <div
                className={`aspect-[3/4] rounded overflow-hidden mb-3 transition-transform duration-300 ${
                  stamp.unlocked ? "hover:scale-105" : ""
                } ${isHighlighted ? "animate-pulse" : ""} relative`}
              >
                {stamp.unlocked ? (
                  <div className="relative w-full h-full">
                    <img
                      src={assetUrl(stamp.image)}
                      alt={stamp.name}
                      className="w-full h-full object-contain"
                    />
                    {isPremium && (
                      <div className="absolute inset-0 premium-sweep-light pointer-events-none" />
                    )}
                  </div>
                ) : (
                  <>
                    <img
                      src={assetUrl(stamp.image)}
                      alt={stamp.name}
                      className="w-full h-full object-contain filter blur-sm grayscale opacity-20"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        className="opacity-60"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </>
                )}
                {isHighlighted && (
                  <div className="absolute inset-0 pointer-events-none border-4 border-blue-400 rounded animate-pulse" />
                )}
              </div>
              <h3
                className={`text-sm font-medium mb-1 ${
                  stamp.unlocked ? "text-white" : "text-slate-600"
                } ${isHighlighted ? "text-blue-300" : ""}`}
              >
                {stamp.name}
              </h3>
              <p
                className={`text-xs ${
                  stamp.unlocked ? "text-slate-500" : "text-slate-700"
                }`}
              >
                {stamp.date}
              </p>
            </>
          );

          const wrapperClasses = `${
            stamp.unlocked ? "group cursor-pointer" : "cursor-not-allowed"
          } text-center transition-all duration-300 ${
            isHighlighted
              ? "ring-4 ring-blue-400 ring-opacity-100 scale-110 rounded-lg"
              : ""
          }`;

          return (
            <div
              key={stamp.id}
              onMouseEnter={() => handleMouseEnter(stamp, index)}
              onMouseLeave={() => handleMouseLeave(index)}
              className={wrapperClasses}
            >
              {stamp.unlocked ? (
                <Link href={`/species/${stamp.id}`} prefetch>
                  {CardInner}
                </Link>
              ) : (
                <div aria-disabled>{CardInner}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Premium 动画样式 */}
      <style jsx>{`
        @keyframes sweep-light {
          0% {
            transform: translateX(-150%) translateY(-150%) rotate(45deg);
          }
          100% {
            transform: translateX(250%) translateY(250%) rotate(45deg);
          }
        }
        .premium-sweep-light::before {
          content: "";
          position: absolute;
          top: -100%;
          left: -100%;
          width: 120%;
          height: 300%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.15) 15%,
            rgba(255, 215, 0, 0.5) 35%,
            rgba(255, 237, 78, 0.7) 50%,
            rgba(255, 215, 0, 0.5) 65%,
            rgba(255, 255, 255, 0.15) 85%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-150%) translateY(-150%) rotate(45deg);
          animation: sweep-light 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default StampGallery;
