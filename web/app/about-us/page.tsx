"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";

const AboutUs = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [showStampModal, setShowStampModal] = useState(false);

  useEffect(() => {
    // Check if accessed via stamp link
    const stamp = searchParams.get("stamp");
    if (stamp) {
      setShowStampModal(true);
    }

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
    if (missionRef.current) {
      observer.observe(missionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      {/* Stamp Congratulations Modal */}
      {showStampModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in"
          onClick={() => setShowStampModal(false)}
        >
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 max-w-lg w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stamp Display */}
            <div className="text-center mb-8">
              <div className="w-56 aspect-[3/4] mx-auto rounded-lg overflow-hidden mb-6 bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                <img
                  src="/assets/Rainbow Bee-eater.png"
                  alt="Rainbow Bee-eater"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-4xl font-light text-white mb-4">
                Congratulations!
              </h2>
              <h3 className="text-2xl font-medium text-white mb-3">
                Rainbow Bee-eater
              </h3>
              <p className="text-blue-200 text-lg mb-6">
                You've earned this stamp
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-6"></div>

            {/* Encouragement Message */}
            <div className="text-center">
              <p className="text-blue-100 text-base leading-relaxed mb-4">
                This beautiful bird is visiting your area tonight! Register now to save your stamp and learn more about these amazing little visitors.
              </p>
              <p className="text-blue-200 text-sm">
                Explore our website to discover migration patterns, conservation tips, and how you can help protect them.
              </p>
            </div>
          </div>
        </div>
      )}
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
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
      </section>

      {/* Mission Section */}
      <section
        ref={missionRef}
        className="relative py-32 overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50"
      >
        {/* Background Image - Right Side */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-22">
          <img
            src="/assets/93ea1d4d9247330d98b7cce1e59238fb.jpg"
            alt="Bird illustration"
            className="h-2/4 w-auto object-contain opacity-100"
          />
        </div>

        {/* Content - Left Side */}
        <div className="container mx-auto px-8 relative z-10 pr-22">
          <div className="max-w-3xl">
            <h2 className="text-xs uppercase tracking-wider text-blue-600 mb-12 font-semibold opacity-0 mission-title">
              Our Mission
            </h2>
            <div className="space-y-6 text-lg md:text-xl leading-relaxed text-gray-700 font-light">
              <p className="opacity-0 mission-text-1">
                BirdsRadar is a citizen science initiative dedicated to
                protecting migratory birds through community action and
                education. We believe that small changes in our daily habits can
                create significant impact for wildlife conservation.
              </p>
              <p className="opacity-0 mission-text-2">
                Our platform combines real-time migration tracking with
                actionable insights, empowering Sydneysiders to make informed
                decisions about light usage during critical migration periods.
                Every participant contributes to a growing database that helps
                researchers understand and protect these incredible journeys.
              </p>
              <p className="opacity-0 mission-text-3">
                Through the Lights Out movement, we've already helped thousands
                of residents reduce unnecessary lighting during peak migration
                nights. Together, we're not just observing nature—we're actively
                protecting it, one light switch at a time.
              </p>
              <p className="opacity-0 mission-text-4">
                Join us in creating a safer sky for the remarkable species that
                travel thousands of kilometers to visit our city each year. Your
                participation matters, and every action counts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Light Pollution in Sydney Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-8">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="text-xs uppercase tracking-wider text-blue-600 mb-8 font-semibold">
              Sydney's Light Pollution Crisis
            </h2>
            <h3 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight mx-auto">
              A City That Never Sleeps
            </h3>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Text Content */}
            <div className="lg:col-span-5">
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  As one of Australia's brightest cities, Sydney's artificial
                  lighting has grown exponentially over the past decades. Our
                  skyline, while beautiful to humans, creates a dangerous maze
                  of light for migrating birds.
                </p>
                <p>
                  Studies show that Sydney's CBD alone produces over 10,000 lux
                  of light pollution during peak hours—bright enough to
                  completely disorient nocturnal migrants who rely on stars and
                  moonlight for navigation.
                </p>
                <p>
                  From office towers left illuminated overnight to decorative
                  building lights and sports facilities, our city's glow can be
                  seen from space—and it's taking a toll on wildlife.
                </p>
              </div>
            </div>

            {/* Right: Video */}
            <div className="lg:col-span-7">
              <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/sydney——light.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact on Birds Section */}
      <section className="py-32 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-xs uppercase tracking-wider text-blue-600 mb-8 font-semibold">
              The Impact on Our Feathered Friends
            </h2>
            <h3 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
              How Light Pollution Affects Birds
            </h3>
          </div>

          {/* Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Card 1: Navigation Disruption */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-light text-gray-900 mb-4">
                Navigation Disruption
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Migratory birds use celestial cues to navigate. Bright city
                lights confuse their internal compasses, causing them to circle
                buildings repeatedly until exhausted.
              </p>
            </div>

            {/* Card 2: Fatal Collisions */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-light text-gray-900 mb-4">
                Fatal Collisions
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Attracted to illuminated buildings, birds fly into glass windows
                and structures. In Sydney alone, an estimated 10,000+ birds die
                from building strikes annually.
              </p>
            </div>

            {/* Card 3: Habitat Disruption */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-light text-gray-900 mb-4">
                Habitat Disruption
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Constant artificial light disrupts birds' natural circadian
                rhythms, affecting feeding, breeding, and resting patterns
                crucial for successful migration.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stat Block 1 */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 border border-blue-100">
              <div className="text-6xl font-light text-blue-600 mb-4">60%</div>
              <p className="text-xl text-gray-700">
                of migratory bird species in Sydney are affected by light
                pollution during their journey
              </p>
            </div>

            {/* Stat Block 2 */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 border border-blue-100">
              <div className="text-6xl font-light text-blue-600 mb-4">
                2-4 AM
              </div>
              <p className="text-xl text-gray-700">
                Peak migration hours when birds are most vulnerable to
                artificial lighting in urban areas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative min-h-[120vh] bg-[#0a2540] overflow-hidden py-20 md:py-32">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-70"
          >
            <source
              src="/assets/467575_Water River Bank Wings River_By_Ami_Bornstein_Artlist_4K.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-950/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4 md:px-8">
          <div className="w-full max-w-6xl mx-auto text-center">
            <h2 className="text-xs uppercase tracking-wider text-blue-200 mb-8 md:mb-12 font-semibold">
              Join the Movement
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-12 md:mb-16 leading-tight">
              Turn Off Lights,
              <br />
              Save Lives
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-blue-100 mb-16 md:mb-20 font-light leading-relaxed max-w-3xl mx-auto px-4">
              The solution is simple yet powerful: turning off unnecessary
              lights during peak migration seasons can reduce bird collisions by
              up to 80%.
            </p>

            {/* Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-16 md:mb-20 px-4">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 md:p-10 border border-white/20 hover:bg-white/15 transition-all">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                  <span className="text-white text-2xl md:text-3xl font-light">
                    1
                  </span>
                </div>
                <h4 className="text-xl md:text-2xl font-medium text-white mb-3 md:mb-4">
                  Register Your Participation
                </h4>
                <p className="text-blue-100 text-base leading-relaxed">
                  Sign up to receive migration alerts and track your impact
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 md:p-10 border border-white/20 hover:bg-white/15 transition-all">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                  <span className="text-white text-2xl md:text-3xl font-light">
                    2
                  </span>
                </div>
                <h4 className="text-xl md:text-2xl font-medium text-white mb-3 md:mb-4">
                  Turn Off Non-Essential Lights
                </h4>
                <p className="text-blue-100 text-base leading-relaxed">
                  During migration season, switch off decorative and unnecessary
                  lighting
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 md:p-10 border border-white/20 hover:bg-white/15 transition-all">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                  <span className="text-white text-2xl md:text-3xl font-light">
                    3
                  </span>
                </div>
                <h4 className="text-xl md:text-2xl font-medium text-white mb-3 md:mb-4">
                  Spread the Word
                </h4>
                <p className="text-blue-100 text-base leading-relaxed">
                  Share your stamps and encourage friends to join the movement
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="/no-migration"
              className="inline-block px-10 py-5 bg-white text-blue-600 rounded-full font-medium text-lg md:text-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Start Your Journey
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
};

export default AboutUs;
