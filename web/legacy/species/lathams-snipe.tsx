"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from 'next/navigation';
import "leaflet/dist/leaflet.css";

// Dynamically import map component and Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Create custom icon
const createCustomIcon = (isSelected: boolean) => {
  if (typeof window === "undefined") return undefined;
  const L = require("leaflet");

  const iconHtml = `
    <div style="position: relative; width: 40px; height: 40px;">
      <svg width="40" height="40" viewBox="0 0 40 40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
        <circle cx="20" cy="20" r="18" fill="${
          isSelected ? "#10b981" : "#059669"
        }" opacity="${isSelected ? "1" : "0.9"}"/>
        ${
          isSelected
            ? '<circle cx="20" cy="20" r="18" fill="none" stroke="#34d399" stroke-width="3" opacity="0.6"/>'
            : ""
        }
        <path d="M20 12 C18 12 16 13 16 15 C16 17 20 22 20 22 C20 22 24 17 24 15 C24 13 22 12 20 12 Z" fill="white"/>
        <circle cx="20" cy="15" r="2" fill="${
          isSelected ? "#10b981" : "#059669"
        }"/>
      </svg>
      ${
        isSelected
          ? '<div style="position: absolute; top: 0; left: 0; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%); animation: pulse 2s ease-in-out infinite;"></div>'
          : ""
      }
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: "custom-marker-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

export default function LathamSnipePage() {
  const pathname = usePathname();
  const heroRef = useRef<HTMLDivElement>(null);
  const [q1Answer, setQ1Answer] = useState<string | null>(null);
  const [q2Answer, setQ2Answer] = useState<string | null>(null);
  const [q3Answer, setQ3Answer] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);

    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px",
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in-view");
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Check if all questions are answered correctly
  useEffect(() => {
    if (q1Answer === "q1-correct" && q2Answer === "q2-correct" && q3Answer === "correct") {
      // Save premium stamp status to localStorage
      const premiumStamps = JSON.parse(
        localStorage.getItem("premiumStamps") || "[]"
      );
      if (!premiumStamps.includes("lathams-snipe")) {
        premiumStamps.push("lathams-snipe");
        localStorage.setItem("premiumStamps", JSON.stringify(premiumStamps));

        // Dispatch custom event for same-page updates
        window.dispatchEvent(new Event("premiumStampUnlocked"));
      }

      setTimeout(() => {
        setShowCelebration(true);
      }, 500);
    }
  }, [q1Answer, q2Answer, q3Answer]);

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  // Bird watching locations in Sydney
  const locations = [
    {
      name: "Centennial Park",
      lat: -33.8973,
      lng: 151.2352,
      season: "Sep - Apr",
      quality: "Excellent",
      description: "Large wetland areas with excellent habitat",
    },
    {
      name: "Sydney Olympic Park Wetlands",
      lat: -33.8358,
      lng: 151.0689,
      season: "Sep - Apr",
      quality: "Very Good",
      description: "Protected wetland reserve with viewing platforms",
    },
    {
      name: "Botany Bay Wetlands",
      lat: -33.9961,
      lng: 151.2094,
      season: "Oct - Mar",
      quality: "Good",
      description: "Coastal wetlands with seasonal populations",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .hero-badge {
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .hero-title {
          animation: fadeInUp 1s ease-out 0.4s forwards;
          opacity: 0;
        }

        .hero-subtitle {
          animation: fadeInUp 1s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-in-view {
          animation: fadeIn 1s ease-out forwards;
        }

        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .shimmer-text {
          background: linear-gradient(
            110deg,
            #ffd700 0%,
            #ffed4e 15%,
            #ffd700 30%,
            #fff4a3 45%,
            #ffd700 60%,
            #ffed4e 75%,
            #ffd700 90%,
            #fff9cc 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s ease-in-out infinite;
          filter: drop-shadow(0 2px 8px rgba(255, 215, 0, 0.4))
            drop-shadow(0 4px 16px rgba(255, 215, 0, 0.3))
            drop-shadow(0 8px 32px rgba(255, 237, 78, 0.2));
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        @keyframes glow-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        .stamp-glow {
          position: absolute;
          inset: -20%;
          background: radial-gradient(
            circle,
            rgba(255, 215, 0, 0.4) 0%,
            rgba(255, 237, 78, 0.3) 25%,
            rgba(255, 244, 163, 0.2) 50%,
            transparent 70%
          );
          filter: blur(40px);
          animation: glow-pulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.5);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .shake {
          animation: shake 0.5s ease-in-out;
        }

        .custom-marker-icon {
          background: transparent;
          border: none;
        }

        .location-card-highlight {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
          border-color: #10b981 !important;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a
              href="/track-migration"
              className="flex items-center group flex-shrink-0"
            >
              <img
                src="/assets/logo.png"
                alt="BirdsRadar Logo"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </a>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
              <a
                href="/lights-out"
                className={`text-sm font-medium transition-colors duration-200 relative group whitespace-nowrap ${
                  pathname === "/lights-out"
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Lights Out
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-200 ${
                    pathname === "/lights-out"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="/track-migration"
                className={`text-sm font-medium transition-colors duration-200 relative group whitespace-nowrap ${
                  pathname === "/track-migration"
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Track Migration
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-200 ${
                    pathname === "/track-migration"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="/species-library"
                className={`text-sm font-medium transition-colors duration-200 relative group whitespace-nowrap ${
                  pathname === "/species-library" || pathname.startsWith("/species/")
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Species Library
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-200 ${
                    pathname === "/species-library" || pathname.startsWith("/species/")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="/about-us"
                className={`text-sm font-medium transition-colors duration-200 relative group whitespace-nowrap ${
                  pathname === "/about-us"
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                About Us
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-200 ${
                    pathname === "/about-us"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
            </nav>

            {/* Back Button */}
            <a
              href="/species-library"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Library
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Image */}
      <section
        ref={heroRef}
        className="relative h-[70vh] min-h-[600px] bg-gradient-to-br from-emerald-600 to-teal-700 mt-20"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-8 flex items-center justify-between">
          {/* Left - Text Content */}
          <div className="max-w-2xl">
            <span className="hero-badge inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs uppercase tracking-wider mb-6">
              Featured Species
            </span>
            <h1 className="hero-title text-6xl md:text-7xl font-light text-white mb-6 leading-tight">
              Latham's Snipe
            </h1>
            <p className="hero-subtitle text-xl md:text-2xl text-emerald-50 font-light leading-relaxed">
              <em>Gallinago hardwickii</em>
            </p>
            <p className="hero-subtitle text-lg text-emerald-100 mt-4 leading-relaxed max-w-xl">
              A remarkable migratory wader that travels over 10,000 kilometers
              from Japan to Australian wetlands each year.
            </p>
          </div>

          {/* Right - Stamp Display */}
          <div className="hidden lg:block hero-subtitle">
            <div className="relative flex flex-col items-center">
              {/* Stamp Image - Direct display */}
              <div className="relative w-[280px] h-auto">
                <img
                  src="/assets/LATHAM'S SNIPE.png"
                  alt="Latham's Snipe Stamp"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Shimmering Text */}
              <div className="mt-8 relative text-center max-w-xs">
                <p className="shimmer-text text-lg font-semibold leading-relaxed">
                  Read this page and complete the quiz to unlock shimmering
                  stamp effect
                </p>
              </div>

              {/* Decorative sparkles - Premium gold theme */}
              <div className="absolute -top-4 -left-4 w-28 h-28 bg-yellow-300 rounded-full opacity-25 blur-3xl animate-pulse"></div>
              <div
                className="absolute -bottom-4 -right-4 w-36 h-36 bg-amber-300 rounded-full opacity-25 blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 -right-8 w-24 h-24 bg-yellow-200 rounded-full opacity-20 blur-3xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="stat-card text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-white">
              <div className="text-3xl font-light text-blue-600 mb-2">
                10,000 km
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">
                Migration Distance
              </div>
            </div>
            <div className="stat-card text-center p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-white">
              <div className="text-3xl font-light text-emerald-600 mb-2">
                Sep - Apr
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">
                Season in Sydney
              </div>
            </div>
            <div className="stat-card text-center p-6 rounded-lg bg-gradient-to-br from-amber-50 to-white">
              <div className="text-3xl font-light text-amber-600 mb-2">
                25-27 cm
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">
                Body Length
              </div>
            </div>
            <div className="stat-card text-center p-6 rounded-lg bg-gradient-to-br from-rose-50 to-white">
              <div className="text-3xl font-light text-rose-600 mb-2">
                Wetlands
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">
                Habitat Type
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column - Image */}
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] relative">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/assets/Latham's Snipe.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>

              {/* Conservation Status */}
              <div className="p-6 rounded-xl bg-blue-50 border-l-4 border-blue-600">
                <h3 className="text-sm uppercase tracking-wider text-blue-600 mb-2 font-semibold">
                  Conservation Status
                </h3>
                <p className="text-2xl font-light text-gray-800 mb-2">
                  Least Concern
                </p>
                <p className="text-sm text-gray-600">
                  IUCN Red List status - Population stable but requires
                  monitoring
                </p>
              </div>
            </div>

            {/* Right Column - Info */}
            <div className="space-y-8">
              {/* Identification */}
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-6">
                  Identification
                </h2>
                <div className="prose prose-lg">
                  <p className="text-gray-700 leading-relaxed">
                    Latham's Snipe is a medium-sized wading bird with
                    distinctive cryptic plumage. The bird features brown and
                    buff coloring with intricate patterns that provide excellent
                    camouflage in wetland vegetation.
                  </p>
                  <ul className="space-y-2 text-gray-700 mt-4">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Long, straight bill perfect for probing mud</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Dark brown crown with pale median stripe</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Boldly striped face and head pattern</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>
                        Relatively short tail with distinctive white edges
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Behavior */}
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-6">
                  Behavior & Diet
                </h2>
                <div className="prose prose-lg">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    These secretive birds are most active during dawn and dusk.
                    They feed by probing soft mud with their sensitive bills,
                    detecting prey through touch.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">
                        Primary Diet
                      </div>
                      <div className="text-base font-medium text-gray-900">
                        Invertebrates
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">
                        Feeding Style
                      </div>
                      <div className="text-base font-medium text-gray-900">
                        Probing
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Journey */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs uppercase tracking-wider mb-4">
              Epic Journey
            </span>
            <h2 className="text-5xl md:text-6xl font-light mb-6">
              Migration Route
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              One of the longest migrations of any wader, spanning two
              continents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Departure */}
            <div className="p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-4xl mb-4">🇯🇵</div>
              <h3 className="text-2xl font-light mb-4">Breeding Grounds</h3>
              <p className="text-slate-300 mb-4">
                Northern Japan & Eastern Russia
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Season</span>
                  <span>May - August</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Altitude</span>
                  <span>Lowland wetlands</span>
                </div>
              </div>
            </div>

            {/* Journey */}
            <div className="p-8 rounded-xl bg-emerald-600/20 backdrop-blur-sm border border-emerald-500/30">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-2xl font-light mb-4">The Journey</h3>
              <p className="text-emerald-100 mb-4">Non-stop flight south</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Distance</span>
                  <span>~10,000 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Duration</span>
                  <span>4-6 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Peak Month</span>
                  <span>September</span>
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div className="p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-4xl mb-4">🇦🇺</div>
              <h3 className="text-2xl font-light mb-4">Non-breeding Grounds</h3>
              <p className="text-slate-300 mb-4">Eastern Australia</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Season</span>
                  <span>September - April</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Habitat</span>
                  <span>Freshwater wetlands</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Visualization */}
          <div className="relative">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 rounded-full"></div>
            </div>
            <div className="flex justify-between mt-6 text-sm">
              <div className="text-center">
                <div className="text-slate-400">May-Aug</div>
                <div className="mt-1">Breeding</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Sep</div>
                <div className="mt-1">Migration South</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Oct-Mar</div>
                <div className="mt-1">Australia</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Apr</div>
                <div className="mt-1">Migration North</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where to See */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-light text-center mb-16">
            Where to See in Sydney
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 h-[500px] z-0">
              {isClient ? (
                <MapContainer
                  center={[-33.8688, 151.2093]}
                  zoom={11}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.map((location, index) => (
                    <Marker
                      key={index}
                      position={[location.lat, location.lng]}
                      icon={createCustomIcon(selectedLocation === index)}
                      eventHandlers={{
                        click: () => setSelectedLocation(index),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-emerald-700 mb-1">
                            {location.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {location.description}
                          </p>
                          <div className="text-xs space-y-1">
                            <div>
                              <span className="text-gray-500">Season: </span>
                              <span className="text-gray-900 font-medium">
                                {location.season}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quality: </span>
                              <span className="text-emerald-600 font-medium">
                                {location.quality}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-emerald-100">
                  <p className="text-gray-500">Loading map...</p>
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg z-[1000]">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
                  <span className="text-gray-700">Best Viewing Locations</span>
                </div>
              </div>
            </div>

            {/* Location Cards */}
            <div className="space-y-6">
              {locations.map((location, index) => (
                <div
                  key={location.name}
                  onClick={() => setSelectedLocation(index)}
                  className={`p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border-2 transition-all duration-300 cursor-pointer
                    ${
                      selectedLocation === index
                        ? "location-card-highlight border-emerald-500"
                        : "border-gray-200 hover:shadow-lg hover:border-emerald-300"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300
                      ${
                        selectedLocation === index
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                          : "bg-emerald-600"
                      }
                    `}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {location.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {location.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Best Season: </span>
                          <span className="text-gray-900 font-medium">
                            {location.season}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quality: </span>
                          <span
                            className={`font-medium ${
                              selectedLocation === index
                                ? "text-emerald-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {location.quality}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedLocation === index && (
                      <div className="flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-emerald-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-semibold uppercase tracking-wider mb-4 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Unlock Premium Stamp
            </div>
            <h2 className="text-5xl md:text-6xl font-light mb-6 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              Test Your Knowledge
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Complete this 3-question quiz to unlock the <span className="shimmer-text text-xl">shimmering stamp effect</span> for Latham's Snipe!
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-14 border border-emerald-100">
            {/* Question 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  1
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Where does Latham's Snipe breed?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-13">
                {[
                  { id: "1a", text: "Northern Japan & Eastern Russia", value: "q1-correct", isCorrect: true },
                  { id: "1b", text: "Southern China", value: "q1-wrong1", isCorrect: false },
                  { id: "1c", text: "New Zealand", value: "q1-wrong2", isCorrect: false },
                  { id: "1d", text: "Tasmania", value: "q1-wrong3", isCorrect: false },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setQ1Answer(option.value)}
                    disabled={q1Answer === "q1-correct"}
                    className={`p-5 rounded-xl text-left transition-all duration-300 font-medium text-base
                      ${
                        q1Answer === null
                          ? "bg-gray-50 hover:bg-emerald-50 hover:border-emerald-400 border-2 border-gray-200 hover:shadow-lg hover:scale-[1.02]"
                          : q1Answer === option.value && option.isCorrect
                          ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-xl scale-105"
                          : q1Answer === option.value
                          ? "bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-400 shake"
                          : q1Answer === "q1-correct"
                          ? "bg-gray-50 border-2 border-gray-200 opacity-40"
                          : "bg-gray-50 border-2 border-gray-200"
                      }
                      ${q1Answer === "q1-correct" ? "cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        q1Answer === option.value && option.isCorrect
                          ? "bg-emerald-500 text-white"
                          : q1Answer === option.value
                          ? "bg-red-400 text-white"
                          : "bg-white border-2 border-gray-300 text-gray-600"
                      }`}>
                        {option.id.replace("1", "")}
                      </span>
                      <span className="flex-1">{option.text}</span>
                      {q1Answer === option.value && option.isCorrect && (
                        <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {q1Answer === option.value && !option.isCorrect && (
                        <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Wrong Answer Message for Q1 */}
              {q1Answer && q1Answer !== "q1-correct" && (
                <div className="mt-6 p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-300 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-red-700">
                      <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium">Not quite! Try again.</p>
                    </div>
                    <button
                      onClick={() => setQ1Answer(null)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm rounded-full font-medium hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            {q1Answer === "q1-correct" && <div className="border-t-2 border-gray-100 my-10"></div>}

            {/* Question 2 */}
            {q1Answer === "q1-correct" && (
              <div className="mb-12 animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    2
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    What is the primary feeding behavior of Latham's Snipe?
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-13">
                  {[
                    { id: "2a", text: "Swimming and diving", value: "q2-wrong1", isCorrect: false },
                    { id: "2b", text: "Probing mud with sensitive bill", value: "q2-correct", isCorrect: true },
                    { id: "2c", text: "Catching insects in flight", value: "q2-wrong2", isCorrect: false },
                    { id: "2d", text: "Grazing on grass", value: "q2-wrong3", isCorrect: false },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setQ2Answer(option.value)}
                      disabled={q2Answer === "q2-correct"}
                      className={`p-5 rounded-xl text-left transition-all duration-300 font-medium text-base
                        ${
                          q2Answer === null
                            ? "bg-gray-50 hover:bg-emerald-50 hover:border-emerald-400 border-2 border-gray-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                            : q2Answer === option.value && option.isCorrect
                            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-xl scale-105 cursor-not-allowed"
                            : q2Answer === option.value
                            ? "bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-400 shake cursor-pointer"
                            : q2Answer === "q2-correct"
                            ? "bg-gray-50 border-2 border-gray-200 opacity-40 cursor-not-allowed"
                            : "bg-gray-50 border-2 border-gray-200 cursor-pointer"
                        }
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          q2Answer === option.value && option.isCorrect
                            ? "bg-emerald-500 text-white"
                            : q2Answer === option.value
                            ? "bg-red-400 text-white"
                            : "bg-white border-2 border-gray-300 text-gray-600"
                        }`}>
                          {option.id.replace("2", "")}
                        </span>
                        <span className="flex-1">{option.text}</span>
                        {q2Answer === option.value && option.isCorrect && (
                          <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {q2Answer === option.value && !option.isCorrect && (
                          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Wrong Answer Message for Q2 */}
                {q2Answer && q2Answer !== "q2-correct" && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-300 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-red-700">
                        <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">Not quite! Try again.</p>
                      </div>
                      <button
                        onClick={() => setQ2Answer(null)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm rounded-full font-medium hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            {q2Answer === "q2-correct" && <div className="border-t-2 border-gray-100 my-10"></div>}

            {/* Question 3 */}
            {q2Answer === "q2-correct" && (
              <div className="mb-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    3
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Approximately how far does Latham's Snipe migrate each year?
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-13">
                  {[
                    { id: "3a", text: "~5,000 km", value: "q3-wrong1", isCorrect: false },
                    { id: "3b", text: "~10,000 km", value: "correct", isCorrect: true },
                    { id: "3c", text: "~15,000 km", value: "q3-wrong2", isCorrect: false },
                    { id: "3d", text: "~20,000 km", value: "q3-wrong3", isCorrect: false },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setQ3Answer(option.value)}
                      disabled={q3Answer === "correct"}
                      className={`p-5 rounded-xl text-left transition-all duration-300 font-medium text-base
                        ${
                          q3Answer === null
                            ? "bg-gray-50 hover:bg-emerald-50 hover:border-emerald-400 border-2 border-gray-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                            : q3Answer === option.value && option.isCorrect
                            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-xl scale-105 cursor-not-allowed"
                            : q3Answer === option.value
                            ? "bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-400 shake cursor-pointer"
                            : q3Answer === "correct"
                            ? "bg-gray-50 border-2 border-gray-200 opacity-40 cursor-not-allowed"
                            : "bg-gray-50 border-2 border-gray-200 cursor-pointer"
                        }
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          q3Answer === option.value && option.isCorrect
                            ? "bg-emerald-500 text-white"
                            : q3Answer === option.value
                            ? "bg-red-400 text-white"
                            : "bg-white border-2 border-gray-300 text-gray-600"
                        }`}>
                          {option.id.replace("3", "")}
                        </span>
                        <span className="flex-1">{option.text}</span>
                        {q3Answer === option.value && option.isCorrect && (
                          <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {q3Answer === option.value && !option.isCorrect && (
                          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Wrong Answer Message for Q3 */}
                {q3Answer && q3Answer !== "correct" && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-300 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-red-700">
                        <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">Not quite! Try again.</p>
                      </div>
                      <button
                        onClick={() => setQ3Answer(null)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm rounded-full font-medium hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {q1Answer === "q1-correct" && q2Answer === "q2-correct" && q3Answer === "correct" && (
              <div className="mt-10 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 shadow-lg animate-scaleIn">
                <div className="flex flex-col md:flex-row items-center gap-4 text-emerald-700">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="font-bold text-2xl mb-2">Perfect! All Questions Correct! 🎉</p>
                    <p className="text-base">
                      You've demonstrated excellent knowledge about Latham's Snipe. Your premium stamp is being prepared...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hint Section */}
          {!q1Answer && (
            <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-emerald-700 mb-1">💡 Hint</p>
                  <p className="text-sm text-gray-700">
                    All the answers can be found by reading through the content above. Take your time and explore the migration route, identification, and behavior sections!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={closeCelebration}
          ></div>

          {/* Modal Content */}
          <div className="relative z-10 max-w-lg w-full animate-scaleIn">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center shadow-2xl border border-white/10">
              {/* Stamp with Glow */}
              <div className="relative inline-block mb-8">
                <div className="stamp-glow"></div>
                <div className="relative w-64 h-auto animate-float">
                  <img
                    src="/assets/LATHAM'S SNIPE.png"
                    alt="Latham's Snipe Premium Stamp"
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-4">
                <h2 className="text-4xl font-light text-white mb-2">
                  Congratulations!
                </h2>
                <div className="shimmer-text text-2xl mb-4">
                  You've Unlocked the Premium Stamp
                </div>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Thank you for taking the time to learn about and protect our
                  migratory birds. Your knowledge helps make a difference! 🦅
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={closeCelebration}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#4a5f7a] text-white py-24">
        <div className="container mx-auto px-8">
          <div className="text-center mb-12">
            <a
              href="/species-library"
              className="inline-flex items-center gap-2 text-lg hover:text-blue-200 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Species Library
            </a>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-light leading-tight mb-6">
              Protecting Birds Together
            </h2>
            <p className="text-base leading-relaxed text-blue-100">
              BirdsRadar is dedicated to protecting migratory birds through
              citizen science, education, and conservation efforts across
              Sydney.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 mt-12 border-t border-white/20 text-sm">
            <p>BirdsRadar Project</p>
            <p>© BirdsRadar 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
