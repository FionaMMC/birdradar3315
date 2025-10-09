"use client";

import React, { useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { BirdInteractionProvider } from '@/contexts/BirdInteractionContext';
import StampGallery from './StampGallery';

// Dynamically import map component to avoid SSR issues
const SydneyBirdMap = dynamic(() => import('./SydneyBirdMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-blue-50"><p className="text-gray-500">Loading map...</p></div>
});

const HempelFoundation = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLElement>(null);

  useEffect(() => {
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
    if (missionRef.current) {
      observer.observe(missionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <BirdInteractionProvider>
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex items-center group">
              <img
                src="/assets/logo.png"
                alt="BirdsRadar Logo"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </a>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/lights-out"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group"
              >
                Lights Out
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a
                href="/track-migration"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group"
              >
                Track Migration
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a
                href="/species-library"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group"
              >
                Species Library
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors">
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

      {/* Interactive Map Section */}
      <section className="h-screen relative bg-white mt-20">
        <div className="w-full h-full flex">
          {/* Left: Interactive Map Container */}
          <div className="w-1/2 h-full relative bg-gradient-to-br from-blue-50/30 to-white">
            <SydneyBirdMap />
          </div>

          {/* Right: Stamp Collection Gallery */}
          <div className="w-1/2 h-full bg-gradient-to-br from-slate-900 to-slate-800 overflow-y-auto">
            <StampGallery />
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[1080px] bg-[#0a2540]">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-70"
          >
            <source src="/assets/birds-flying-city.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-950/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-8 pt-32">
          <h1 className="text-white text-7xl md:text-8xl font-light leading-tight max-w-3xl">
            <span className="inline-block opacity-0 hero-line-1">
              Protect Our
            </span>
            <br />
            <span className="inline-block opacity-0 hero-line-2">
              Migratory Birds
            </span>
          </h1>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-32 right-24 max-w-md">
          <p className="text-white text-lg leading-relaxed">
            Join Sydney's citizen-science movement to track bird migrations and
            reduce light pollution. Together, we create safer skies for our
            feathered travelers.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="relative py-32 overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50">
        {/* Background Image - Right Side */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-22">
          <img
            src="/assets/93ea1d4d9247330d98b7cce1e59238fb.jpg"
            alt="Bird illustration"
            className="h-2/4 w-auto object-contain opacity-100"
          />
        </div>

        {/* Content - Left Side */}
        <div className="container mx-auto px-8 relative z-10  pr-22">
          <div className="max-w-3xl">
            <h2 className="text-xs uppercase tracking-wider text-blue-600 mb-12 font-semibold opacity-0 mission-title">
              Why Lights Out Matters
            </h2>
            <p className="text-4xl md:text-5xl leading-relaxed text-gray-800 font-light">
              <span className="inline-block opacity-0 mission-text-1">
                Every year, millions of migratory birds navigate through Sydney's
                skies.
              </span>{" "}
              <span className="inline-block opacity-0 mission-text-2">
                Artificial lights disorient them, leading to collisions and
                exhaustion.
              </span>{" "}
              <span className="inline-block opacity-0 mission-text-3">
                By turning off non-essential lights during peak
                migration nights, we create safer passage for these travelers and
                reduce our environmental footprint together.
              </span>
            </p>
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
            Discover the remarkable bird species that journey through Sydney's skies each year. Learn about their migration patterns, habitats, and how we can protect them.
          </p>

          {/* Birds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-16">
            {/* Latham's Snipe - Large Featured */}
            <article className="lg:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs mb-2 uppercase tracking-wider opacity-80">Featured Species</p>
                <h3 className="text-3xl mb-4 font-light">
                  Latham's Snipe
                </h3>
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
            </article>

            {/* Painted Snipe */}
            <article className="lg:col-span-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer p-5 transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex flex-col h-full justify-between text-white">
                <div>
                  <p className="text-xs mb-4 uppercase tracking-wider opacity-80">Rare Visitor</p>
                  <h3 className="text-2xl font-light leading-tight mb-3">
                    Painted Snipe
                  </h3>
                  <p className="text-sm opacity-90">
                    Colorful wader found in shallow freshwater habitats
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    Freshwater
                  </span>
                </div>
              </div>
            </article>

            {/* Pacific Golden Plover */}
            <article className="lg:col-span-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer p-5 transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex flex-col h-full justify-between text-white">
                <div>
                  <p className="text-xs mb-4 uppercase tracking-wider opacity-80">Long Distance</p>
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
            </article>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-16">
            {/* Red-necked Stint */}
            <article className="lg:col-span-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer p-5 transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex flex-col h-full justify-between text-white">
                <div>
                  <p className="text-xs mb-4 uppercase tracking-wider opacity-80">Shorebird</p>
                  <h3 className="text-2xl font-light mb-3">Red-necked Stint</h3>
                  <p className="text-sm opacity-90">
                    Tiny wader with distinctive rust-colored breeding plumage
                  </p>
                </div>
                <span className="inline-block px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs w-fit">
                  Mudflats
                </span>
              </div>
            </article>

            {/* Rainbow Bee-eater */}
            <article className="lg:col-span-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer p-5 transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex flex-col h-full justify-between text-white">
                <div>
                  <p className="text-xs mb-4 uppercase tracking-wider opacity-80">Colorful Migrant</p>
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
            </article>

            {/* Black-faced Spoonbill - Large Featured */}
            <article className="lg:col-span-5 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg overflow-hidden h-[682px] relative group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs mb-2 uppercase tracking-wider opacity-80">Endangered</p>
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
            </article>
          </div>

          {/* See All Link */}
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Explore all species
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4a5f7a] text-white py-24">
        <div className="container mx-auto px-8">
          {/* Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
            {/* About Us Links */}
            <div>
              <h3 className="text-sm mb-12">About us</h3>
              <nav className="space-y-4">
                {[
                  "Ownership of Hempel Group",
                  "Our Acceleration Strategy",
                  "Contact",
                  "Whistleblower",
                  "Associated Foundations",
                  "Vacancies",
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

            {/* Stay Updated Links */}
            <div>
              <h3 className="text-sm mb-12">Stay updated</h3>
              <nav className="space-y-4">
                {[
                  { name: "News", external: false },
                  { name: "LinkedIn", external: true },
                  { name: "Instagram", external: true },
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
                Accelerating
                <br />
                Change Together
              </h2>
              <p className="text-base leading-relaxed max-w-md mb-12">
                Hempel Foundation is the majority owner of the Hempel Group and
                a dedicated philanthropist working to accelerate change.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-12 border-t border-white/20 text-sm">
            <p>CVR 21518018</p>
            <p>© Hempel Foundation 2025</p>
          </div>
        </div>
      </footer>
    </div>
    </BirdInteractionProvider>
  );
};

export default HempelFoundation;
