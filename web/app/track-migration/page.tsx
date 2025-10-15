"use client";

import React from "react";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { BirdInteractionProvider } from '@/contexts/BirdInteractionContext';
import StampGallery from '@/components/StampGallery';

// Dynamically import map component to avoid SSR issues
const SydneyBirdMap = dynamic(() => import('@/components/SydneyBirdMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-blue-50"><p className="text-gray-500">Loading map...</p></div>
});

export default function TrackMigrationPage() {
  const pathname = usePathname();

  return (
    <BirdInteractionProvider>
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-[100] shadow-sm">
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

      {/* Interactive Map Section */}
      <section className="fixed top-20 left-0 right-0 bottom-0 bg-white">
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
    </div>
    </BirdInteractionProvider>
  );
}
