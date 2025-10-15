"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from 'next/navigation';

export default function SpeciesLibraryPage() {
  const pathname = usePathname();
  const [videoSrc, setVideoSrc] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

  const videos = [
    "/assets/109996_Wildlife Flock Cranes Crane_By_Omri_Ohana_Artlist_4.6K.mp4",
    "/assets/59014_Flock of birds flying in the sky_By_Ami_Bornstein_Artlist_HD.mp4",
    "/assets/6523493_Netherlands Bird Aves Feathers_By_Edwin_Haighton_Artlist_4K.mp4",
  ];

  useEffect(() => {
    // Randomly select a video on component mount
    const randomIndex = Math.floor(Math.random() * videos.length);
    setVideoSrc(videos[randomIndex]);

    // Add scroll-triggered animations
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

        .hero-title {
          animation: fadeInUp 1s ease-out 0.3s forwards;
          opacity: 0;
        }

        .hero-subtitle {
          animation: fadeInUp 1s ease-out 0.6s forwards;
          opacity: 0;
        }

        .hero-description {
          animation: fadeInUp 1s ease-out 0.9s forwards;
          opacity: 0;
        }

        .species-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .species-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .animate-in-view {
          animation: fadeIn 1s ease-out forwards;
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
                  pathname === "/species-library"
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Species Library
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-200 ${
                    pathname === "/species-library"
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

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors flex-shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen bg-[#0a2540]">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          {videoSrc && (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-70"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-950/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center">
          <div className="max-w-5xl">
            <h1 className="hero-title text-6xl md:text-8xl font-light text-white mb-6 leading-tight">
              Discover Sydney's
              <br />
              Migratory Birds
            </h1>
            <p className="hero-subtitle text-xl md:text-2xl text-blue-100 mb-8 font-light leading-relaxed max-w-3xl mx-auto">
              A Journey Through the Skies
            </p>
            <p className="hero-description text-base md:text-lg text-blue-200/90 font-light leading-relaxed max-w-2xl mx-auto">
              Explore the remarkable species that grace Sydney's skies each
              year, learn about their unique behaviors, and discover how we can
              protect their migration routes.
            </p>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 hero-description">
            <div className="flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors cursor-pointer">
              <span className="text-sm uppercase tracking-wider">
                Scroll to explore
              </span>
              <svg
                className="w-6 h-6 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Bird Species Gallery */}
      <section className="py-32 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-8">
          <h2 className="text-xs uppercase tracking-wider text-blue-600 mb-12 font-semibold">
            Migratory Birds of Sydney
          </h2>
          <p className="text-2xl leading-relaxed text-gray-900 mb-24 max-w-4xl">
            Discover the remarkable bird species that journey through Sydney's
            skies each year. Learn about their migration patterns, habitats, and
            how we can protect them.
          </p>

          {/* Birds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-16">
            {/* Latham's Snipe - Large Featured */}
            <a
              href="/species/lathams-snipe"
              className="species-card lg:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer block"
            >
              {/* Background Video */}
              <div className="absolute inset-0">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs mb-2 uppercase tracking-wider opacity-80">
                  Featured Species
                </p>
                <h3 className="text-3xl mb-4 font-light">Latham's Snipe</h3>
                <p className="text-sm opacity-90 mb-4">
                  Migrates from Japan to Australian wetlands
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Wetlands
                  </span>
                  <span className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Sep - Apr
                  </span>
                </div>
              </div>
            </a>

            {/* Painted Snipe */}
            <a
              href="/species/painted-snipe"
              className="species-card lg:col-span-3 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer p-5 block"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/assets/Painted-Snipe.jpeg"
                  alt="Painted Snipe"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
              <div className="relative flex flex-col h-full justify-between text-white">
                <div>
                  <p className="text-xs mb-4 uppercase tracking-wider opacity-80 flex items-center gap-2">
                    🔒 Locked Species
                  </p>
                  <h3 className="text-2xl font-light leading-tight mb-3">
                    Painted Snipe
                  </h3>
                  <p className="text-sm opacity-90">
                    Endangered wader with unique role-reversal breeding behavior
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Wetlands
                  </span>
                  <br />
                  <span className="inline-block px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Year-round
                  </span>
                </div>
              </div>
            </a>

            {/* Pacific Golden Plover */}
            <a
              href="/species/pacific-golden-plover"
              className="species-card lg:col-span-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer p-5 block"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/assets/Pacific-Golden-Plover-161024-106EOS1D-F1X22771-W.jpg"
                  alt="Pacific Golden Plover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
              <div className="relative flex flex-col h-full justify-between text-white">
                <div>
                  <p className="text-xs mb-4 uppercase tracking-wider opacity-80">
                    Long Distance
                  </p>
                  <h3 className="text-2xl font-light leading-tight mb-3">
                    Pacific Golden Plover
                  </h3>
                  <p className="text-sm opacity-90">
                    Travels over 10,000 km from Arctic to Australia
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Coastal
                  </span>
                  <br />
                  <span className="inline-block px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Aug - Apr
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-16">
            {/* Red-necked Stint */}
            <a
              href="/species/red-necked-stint"
              className="species-card lg:col-span-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer p-5"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/assets/rednecked stint.jpg"
                  alt="Red-necked Stint"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
              <div className="relative flex flex-col h-full justify-between text-white">
                <div>
                  <p className="text-xs mb-4 uppercase tracking-wider opacity-80">
                    Shorebird
                  </p>
                  <h3 className="text-2xl font-light mb-3">Red-necked Stint</h3>
                  <p className="text-sm opacity-90">
                    Tiny wader with distinctive rust-colored breeding plumage
                  </p>
                </div>
                <span className="inline-block px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs w-fit">
                  Mudflats
                </span>
              </div>
            </a>

            {/* Rainbow Bee-eater */}
            <a
              href="/species/rainbow-bee-eater"
              className="species-card lg:col-span-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer p-5"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/assets/rainbow-bee-eater-by72.jpg"
                  alt="Rainbow Bee-eater"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
              <div className="relative flex flex-col h-full justify-between text-white">
                <div>
                  <p className="text-xs mb-4 uppercase tracking-wider opacity-80">
                    Colorful Migrant
                  </p>
                  <h3 className="text-2xl font-light leading-tight mb-3">
                    Rainbow Bee-eater
                  </h3>
                  <p className="text-sm opacity-90">
                    Australia's most colorful bird, feeds on flying insects
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Woodlands
                  </span>
                  <br />
                  <span className="inline-block px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Sep - Mar
                  </span>
                </div>
              </div>
            </a>

            {/* Black-faced Spoonbill - Large Featured */}
            <a
              href="/species/black-faced-spoonbill"
              className="species-card lg:col-span-5 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer block"
            >
              {/* Background Video */}
              <div className="absolute inset-0">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/75588_Spoonbill scratching under its wing with its beak _By_Studio_Non_Artlist_4K.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs mb-2 uppercase tracking-wider opacity-80">
                  Endangered
                </p>
                <h3 className="text-3xl mb-4 font-light">
                  Black-faced Spoonbill
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  Rare and threatened species with distinctive spoon-shaped bill
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Wetlands
                  </span>
                  <span className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Protected
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4a5f7a] text-white py-24">
        <div className="container mx-auto px-8">
          {/* Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
            {/* Resources Links */}
            <div>
              <h3 className="text-sm mb-12 uppercase tracking-wider">
                Resources
              </h3>
              <nav className="space-y-4">
                {[
                  "Bird Species Guide",
                  "Migration Patterns",
                  "Conservation Tips",
                  "Research & Data",
                  "Educational Materials",
                  "Get Involved",
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="flex items-center gap-2 text-2xl font-light hover:opacity-70 transition-opacity"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Connect Links */}
            <div>
              <h3 className="text-sm mb-12 uppercase tracking-wider">
                Connect
              </h3>
              <nav className="space-y-4">
                {[
                  { name: "Contact Us", external: false },
                  { name: "Newsletter", external: false },
                  { name: "Community Forum", external: true },
                  { name: "Twitter", external: true },
                ].map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    className="flex items-center gap-2 text-2xl font-light hover:opacity-70 transition-opacity"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {item.external ? (
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                      ) : (
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      )}
                    </svg>
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-6xl md:text-7xl font-light leading-tight mb-8">
                Protecting
                <br />
                Birds Together
              </h2>
              <p className="text-base leading-relaxed max-w-md mb-12">
                BirdsRadar is dedicated to protecting migratory birds through
                citizen science, education, and conservation efforts across
                Sydney.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-12 border-t border-white/20 text-sm">
            <p>BirdsRadar Project</p>
            <p>© BirdsRadar 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
