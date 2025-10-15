"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import map component and Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Create custom icon
const createCustomIcon = (isSelected: boolean) => {
  if (typeof window === 'undefined') return undefined;
  const L = require('leaflet');

  const iconHtml = `
    <div style="position: relative; width: 40px; height: 40px;">
      <svg width="40" height="40" viewBox="0 0 40 40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
        <circle cx="20" cy="20" r="18" fill="${isSelected ? '#10b981' : '#059669'}" opacity="${isSelected ? '1' : '0.9'}"/>
        ${isSelected ? '<circle cx="20" cy="20" r="18" fill="none" stroke="#34d399" stroke-width="3" opacity="0.6"/>' : ''}
        <path d="M20 12 C18 12 16 13 16 15 C16 17 20 22 20 22 C20 22 24 17 24 15 C24 13 22 12 20 12 Z" fill="white"/>
        <circle cx="20" cy="15" r="2" fill="${isSelected ? '#10b981' : '#059669'}"/>
      </svg>
      ${isSelected ? '<div style="position: absolute; top: 0; left: 0; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%); animation: pulse 2s ease-in-out infinite;"></div>' : ''}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

export default function PaintedSnipePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const isLocked = true; // This species is locked

  useEffect(() => {
    setIsClient(true);

    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px'
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in-view');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleQuizAnswer = (answer: string) => {
    setQuizAnswer(answer);
    if (answer === 'correct') {
      setTimeout(() => {
        setShowCelebration(true);
      }, 500);
    }
  };

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  // Bird watching locations in Sydney for Painted Snipe
  const locations = [
    {
      name: "Bicentennial Park",
      lat: -33.8358,
      lng: 151.0689,
      season: "Year-round",
      quality: "Excellent",
      description: "Prime wetland habitat with regular sightings"
    },
    {
      name: "Towra Point Nature Reserve",
      lat: -33.9889,
      lng: 151.1553,
      season: "Year-round",
      quality: "Very Good",
      description: "Protected estuarine wetlands"
    },
    {
      name: "Sydney Olympic Park Wetlands",
      lat: -33.8467,
      lng: 151.0647,
      season: "Year-round",
      quality: "Good",
      description: "Urban wetlands with diverse bird populations"
    }
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
          0%, 100% {
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
          background: radial-gradient(circle,
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
          0%, 100% {
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
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.5);
          }
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
            <a href="/track-migration" className="flex items-center group flex-shrink-0">
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
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group whitespace-nowrap"
              >
                Lights Out
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a
                href="/track-migration"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group whitespace-nowrap"
              >
                Track Migration
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a
                href="/species-library"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group whitespace-nowrap"
              >
                Species Library
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a
                href="/about-us"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group whitespace-nowrap"
              >
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Back Button */}
            <a
              href="/species-library"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Library
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Image */}
      <section ref={heroRef} className="relative h-[70vh] min-h-[600px] bg-gradient-to-br from-purple-600 to-indigo-700 mt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-8 flex items-center justify-between">
          {/* Left - Text Content */}
          <div className="max-w-2xl">
            <span className="hero-badge inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs uppercase tracking-wider mb-6">
              {isLocked ? "🔒 Locked Species" : "Featured Species"}
            </span>
            <h1 className="hero-title text-6xl md:text-7xl font-light text-white mb-6 leading-tight">
              Painted Snipe
            </h1>
            <p className="hero-subtitle text-xl md:text-2xl text-purple-50 font-light leading-relaxed">
              <em>Rostratula australis</em>
            </p>
            <p className="hero-subtitle text-lg text-purple-100 mt-4 leading-relaxed max-w-xl">
              A secretive and beautifully patterned wading bird with distinctive sexual dimorphism, found in shallow freshwater wetlands across Australia.
            </p>
          </div>

          {/* Right - Stamp Display */}
          <div className="hidden lg:block hero-subtitle">
            <div className="relative flex flex-col items-center">
              {/* Stamp Image - Blurred for locked state */}
              <div className="relative w-[280px] h-auto">
                <img
                  src="/assets/PAINTED SNIPE.png"
                  alt="Painted Snipe Stamp"
                  className={`w-full h-auto object-contain drop-shadow-2xl transition-all duration-500 ${isLocked ? 'blur-xl opacity-60' : ''}`}
                />
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-sm rounded-full p-6">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Locked Message */}
              <div className="mt-8 relative text-center max-w-xs">
                <p className="text-white text-lg font-semibold leading-relaxed">
                  {isLocked ? "Actively browse the website and turn off lights to unlock the stamp" : "Read this page and complete the quiz to unlock shimmering stamp effect"}
                </p>
              </div>

              {/* Decorative effects - Purple theme for locked state */}
              <div className="absolute -top-4 -left-4 w-28 h-28 bg-purple-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-36 h-36 bg-indigo-400 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 -right-8 w-24 h-24 bg-purple-300 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="stat-card text-center p-6 rounded-lg bg-gradient-to-br from-purple-50 to-white">
              <div className="text-3xl font-light text-purple-600 mb-2">Resident</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">Migration Status</div>
            </div>
            <div className="stat-card text-center p-6 rounded-lg bg-gradient-to-br from-indigo-50 to-white">
              <div className="text-3xl font-light text-indigo-600 mb-2">Year-round</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">Season in Sydney</div>
            </div>
            <div className="stat-card text-center p-6 rounded-lg bg-gradient-to-br from-amber-50 to-white">
              <div className="text-3xl font-light text-amber-600 mb-2">23-28 cm</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">Body Length</div>
            </div>
            <div className="stat-card text-center p-6 rounded-lg bg-gradient-to-br from-rose-50 to-white">
              <div className="text-3xl font-light text-rose-600 mb-2">Wetlands</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">Habitat Type</div>
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
                <div className="aspect-[4/3]">
                  <img
                    src="/assets/Painted-Snipe.jpeg"
                    alt="Painted Snipe"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Conservation Status */}
              <div className="p-6 rounded-xl bg-orange-50 border-l-4 border-orange-600">
                <h3 className="text-sm uppercase tracking-wider text-orange-600 mb-2 font-semibold">Conservation Status</h3>
                <p className="text-2xl font-light text-gray-800 mb-2">Endangered</p>
                <p className="text-sm text-gray-600">EPBC Act listed - Requires immediate conservation action and habitat protection</p>
              </div>
            </div>

            {/* Right Column - Info */}
            <div className="space-y-8">
              {/* Identification */}
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-6">Identification</h2>
                <div className="prose prose-lg">
                  <p className="text-gray-700 leading-relaxed">
                    Painted Snipe is a stunning wading bird with remarkable sexual dimorphism.
                    Females are more colorful with rich chestnut plumage, while males display
                    more subdued brown and buff tones with intricate patterning.
                  </p>
                  <ul className="space-y-2 text-gray-700 mt-4">
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Long, slightly drooped bill with distinctive coloration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Females: Chestnut head, neck, and breast with white eye-ring</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Males: More cryptic brown plumage with buff streaking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Distinctive bronze-green sheen on wings</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Behavior */}
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-6">Behavior & Diet</h2>
                <div className="prose prose-lg">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    These highly secretive birds are crepuscular and nocturnal. Females are polyandrous,
                    with males taking on primary parenting duties. They feed by probing shallow water
                    and soft mud for invertebrates.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Primary Diet</div>
                      <div className="text-base font-medium text-gray-900">Aquatic invertebrates</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Activity Pattern</div>
                      <div className="text-base font-medium text-gray-900">Nocturnal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Habitat & Lifestyle */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs uppercase tracking-wider mb-4">
              Resident Species
            </span>
            <h2 className="text-5xl md:text-6xl font-light mb-6">Habitat & Lifecycle</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              A year-round resident with unique breeding behavior and habitat requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Habitat */}
            <div className="p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="text-2xl font-light mb-4">Preferred Habitat</h3>
              <p className="text-slate-300 mb-4">Shallow freshwater wetlands</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Depth</span>
                  <span>2-20 cm water</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vegetation</span>
                  <span>Dense reed beds</span>
                </div>
              </div>
            </div>

            {/* Breeding */}
            <div className="p-8 rounded-xl bg-purple-600/20 backdrop-blur-sm border border-purple-500/30">
              <div className="text-4xl mb-4">🥚</div>
              <h3 className="text-2xl font-light mb-4">Breeding Behavior</h3>
              <p className="text-purple-100 mb-4">Unique role reversal</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200">Season</span>
                  <span>Oct - March</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Parental Care</span>
                  <span>Males incubate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Mating System</span>
                  <span>Polyandrous</span>
                </div>
              </div>
            </div>

            {/* Conservation */}
            <div className="p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-2xl font-light mb-4">Conservation Needs</h3>
              <p className="text-slate-300 mb-4">Habitat protection critical</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Main Threat</span>
                  <span>Wetland loss</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Population Trend</span>
                  <span>Declining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Year-round Timeline */}
          <div className="relative">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 rounded-full"></div>
            </div>
            <div className="flex justify-between mt-6 text-sm">
              <div className="text-center">
                <div className="text-slate-400">Oct-Dec</div>
                <div className="mt-1">Breeding</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Jan-Mar</div>
                <div className="mt-1">Chick Rearing</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Apr-Sep</div>
                <div className="mt-1">Non-breeding</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Year-round</div>
                <div className="mt-1">Resident</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where to See */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-light text-center mb-16">Where to See in Sydney</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 h-[500px] z-0">
              {isClient ? (
                <MapContainer
                  center={[-33.8688, 151.2093]}
                  zoom={11}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
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
                        click: () => setSelectedLocation(index)
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-emerald-700 mb-1">{location.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                          <div className="text-xs space-y-1">
                            <div>
                              <span className="text-gray-500">Season: </span>
                              <span className="text-gray-900 font-medium">{location.season}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quality: </span>
                              <span className="text-emerald-600 font-medium">{location.quality}</span>
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
                    ${selectedLocation === index
                      ? 'location-card-highlight border-emerald-500'
                      : 'border-gray-200 hover:shadow-lg hover:border-emerald-300'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300
                      ${selectedLocation === index
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                        : 'bg-emerald-600'
                      }
                    `}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">{location.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{location.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Best Season: </span>
                          <span className="text-gray-900 font-medium">{location.season}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quality: </span>
                          <span className={`font-medium ${selectedLocation === index ? 'text-emerald-600' : 'text-emerald-600'}`}>
                            {location.quality}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedLocation === index && (
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
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

      {/* Quiz Section - Locked */}
      <section className="py-24 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
              🔒 Locked Quiz
            </div>
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-400">Quick Quiz</h2>
            <p className="text-lg text-gray-500">Complete required actions to unlock this quiz!</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Locked Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100/95 to-gray-200/95 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center px-8">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Quiz Locked</h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-md mx-auto">
                  Actively browse the website and participate in "Lights Out" to unlock this quiz
                </p>
                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Browse complete page content</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                    </svg>
                    <span>Participate in "Lights Out" initiative</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blurred Quiz Content */}
            <div className="blur-sm pointer-events-none select-none opacity-30">
              <h3 className="text-2xl font-medium text-gray-900 mb-8">
                What is unique about Painted Snipe breeding behavior?
              </h3>

            <div className="space-y-4">
              {[
                { id: 'a', text: 'Females incubate eggs', value: 'wrong1' },
                { id: 'b', text: 'Males incubate eggs (polyandry)', value: 'correct' },
                { id: 'c', text: 'Both parents share duties equally', value: 'wrong2' },
                { id: 'd', text: 'They build nests in trees', value: 'wrong3' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleQuizAnswer(option.value)}
                  disabled={quizAnswer !== null}
                  className={`w-full p-5 rounded-xl text-left transition-all duration-300 font-medium text-lg
                    ${quizAnswer === null
                      ? 'bg-gray-50 hover:bg-emerald-50 hover:border-emerald-500 border-2 border-gray-200 hover:shadow-md'
                      : quizAnswer === option.value && option.value === 'correct'
                      ? 'bg-emerald-100 border-2 border-emerald-500 shadow-lg'
                      : quizAnswer === option.value
                      ? 'bg-red-100 border-2 border-red-500'
                      : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                    }
                    ${quizAnswer === null ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                >
                  <span className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600">
                      {option.id.toUpperCase()}
                    </span>
                    <span>{option.text}</span>
                    {quizAnswer === option.value && option.value === 'correct' && (
                      <svg className="ml-auto w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    )}
                    {quizAnswer === option.value && option.value !== 'correct' && (
                      <svg className="ml-auto w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </span>
                </button>
              ))}
            </div>

            {quizAnswer === 'correct' && (
              <div className="mt-8 p-6 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <div className="flex items-center gap-3 text-emerald-700">
                  <svg className="w-8 h-8 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-lg">Correct! Well done!</p>
                    <p className="text-sm mt-1">Preparing your premium stamp...</p>
                  </div>
                </div>
              </div>
            )}

            {quizAnswer && quizAnswer !== 'correct' && (
              <div className="mt-8 p-6 bg-red-50 rounded-xl border-2 border-red-200">
                <div className="flex items-center gap-3 text-red-700">
                  <svg className="w-8 h-8 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-lg">Not quite! Try reading the page again.</p>
                    <p className="text-sm mt-1">Hint: Look at the breeding behavior section for role reversal.</p>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </section>

      {/* Celebration Modal - Disabled for locked species */}
      {!isLocked && showCelebration && (
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
                    src="/assets/PAINTED SNIPE.png"
                    alt="Painted Snipe Premium Stamp"
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
                  Thank you for taking the time to learn about and protect our endangered wetland birds.
                  Your knowledge helps make a difference! 🦆
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={closeCelebration}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
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
            <a href="/species-library" className="inline-flex items-center gap-2 text-lg hover:text-blue-200 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
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
              citizen science, education, and conservation efforts across Sydney.
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
