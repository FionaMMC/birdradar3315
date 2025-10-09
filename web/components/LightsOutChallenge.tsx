'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LightsOutChallenge = () => {
  const [showLocationPermission, setShowLocationPermission] = useState(true);
  const [lightsOut, setLightsOut] = useState(false);
  const [stampAnimating, setStampAnimating] = useState(false);
  const router = useRouter();

  const handleCheckboxChange = () => {
    setLightsOut(true);
  };

  const handleStampClick = () => {
    setStampAnimating(true);
    // Wait for animation to complete before navigating
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  const handleAllowLocation = () => {
    // Prototype: just hide the modal without actually requesting location
    setShowLocationPermission(false);
  };

  const handleSkipLocation = () => {
    router.push('/');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a2540]">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
          key={lightsOut ? 'bee-eater' : 'city'}
        >
          <source
            src={lightsOut ? "/assets/rainbow.mp4" : "/assets/6151210_City Buildings Gloomy Flying Birds_By_Lukas_Pich_Artlist_4K.mp4"}
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-blue-950/70" />
      </div>

      {/* Location Permission Modal */}
      {showLocationPermission && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-8">
          <div className="max-w-lg bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-light text-white mb-3">Location Access</h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                We need your location to identify which migratory birds are passing through your area tonight.
              </p>
              <p className="text-blue-200/80 text-sm leading-relaxed">
                Your location is only used for this core feature and is never stored or shared.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAllowLocation}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Allow Location Access
              </button>
              <button
                onClick={handleSkipLocation}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-light py-3 px-6 rounded-lg transition-all duration-300 border border-white/20"
              >
                Skip and Return Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {!lightsOut ? (
          /* Initial State - Call to Action */
          <div className="max-w-3xl text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-light text-white mb-8 leading-tight">
              Tonight, migratory birds are passing through your area
            </h1>
            <p className="text-2xl text-blue-100 mb-16 font-light">
              Turn off your lights to help them navigate safely and discover their identity
            </p>

            {/* Checkbox */}
            <label className="inline-flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  onChange={handleCheckboxChange}
                  className="peer w-8 h-8 rounded border-2 border-white/50 bg-white/10 cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all duration-300 appearance-none hover:border-white hover:bg-white/20"
                />
                <svg
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xl text-white font-light group-hover:text-blue-200 transition-colors">
                I've turned off my lights
              </span>
            </label>
          </div>
        ) : (
          /* After Checkbox - Reveal & Stamp */
          <div className="max-w-4xl text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-6xl md:text-7xl font-light text-white mb-6">
                It's a Rainbow Bee-eater!
              </h1>
              <p className="text-2xl text-blue-100 mb-12 font-light leading-relaxed">
                Congratulations! You've earned the Rainbow Bee-eater stamp.
                <br />
                Thank you for protecting them.
              </p>

              {/* Stamp Card - Clickable */}
              <div
                onClick={handleStampClick}
                className={`inline-block cursor-pointer transition-all duration-500 ${stampAnimating ? 'animate-stamp-fly-away' : 'hover:scale-110 hover:rotate-2'}`}
              >
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-2xl transition-all duration-300">
                  <div className="w-64 aspect-[3/4] rounded overflow-hidden mb-4 bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                    <img
                      src="/assets/Rainbow Bee-eater.png"
                      alt="Rainbow Bee-eater Stamp"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-white text-xl font-medium mb-2">Rainbow Bee-eater</h3>
                  <p className="text-blue-200 text-sm">Oct 8, 2024</p>
                </div>
                <p className="text-white/60 text-sm mt-6 animate-pulse">
                  Click to add to your collection
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes stamp-fly-away {
          0% {
            transform: scale(1) translateX(0) translateY(0);
            opacity: 1;
          }
          50% {
            transform: scale(0.5) translateX(40vw) translateY(-20vh) rotate(15deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.2) translateX(80vw) translateY(-40vh) rotate(25deg);
            opacity: 0;
          }
        }

        .animate-stamp-fly-away {
          animation: stamp-fly-away 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default LightsOutChallenge;
