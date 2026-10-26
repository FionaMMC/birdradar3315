'use client';

import { assetUrl } from "@/lib/site-path";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NoMigrationToday = () => {
  const router = useRouter();
  const [videoSrc, setVideoSrc] = useState('');
  const [showLocationPermission, setShowLocationPermission] = useState(true);
  const [postcode, setPostcode] = useState('');

  const videos = [
    '/assets/109996_Wildlife Flock Cranes Crane_By_Omri_Ohana_Artlist_4.6K.mp4',
    '/assets/59014_Flock of birds flying in the sky_By_Ami_Bornstein_Artlist_HD.mp4',
    '/assets/6523493_Netherlands Bird Aves Feathers_By_Edwin_Haighton_Artlist_4K.mp4',
  ];

  useEffect(() => {
    // Randomly select a video on component mount
    const randomIndex = Math.floor(Math.random() * videos.length);
    setVideoSrc(videos[randomIndex]);
  }, []);

  const handleExplore = () => {
    router.push('/');
  };

  const handleAllowLocation = () => {
    setShowLocationPermission(false);
  };

  const handlePostcodeSubmit = () => {
    if (postcode.trim()) {
      setShowLocationPermission(false);
    }
  };

  const handleSkipLocation = () => {
    router.push('/');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a2540]">
      {/* Background Video */}
      <div className="absolute inset-0">
        {videoSrc && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-70"
          >
            <source src={assetUrl(videoSrc)} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-950/60" />
      </div>

      {/* Location Permission Modal */}
      {showLocationPermission && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-8">
          <div className="max-w-lg bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-light text-white mb-3">
                Location Access
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                We need your location to identify which migratory birds are
                passing through your area tonight.
              </p>
              <p className="text-blue-200/80 text-sm leading-relaxed">
                Your location is only used for this core feature and is never
                stored or shared.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAllowLocation}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Allow Location Access
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/10 text-blue-200">or</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="Enter postcode"
                  className="flex-1 bg-white/10 text-white placeholder-blue-200/50 px-4 py-3 rounded-lg border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePostcodeSubmit();
                    }
                  }}
                />
                <button
                  onClick={handlePostcodeSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Confirm
                </button>
              </div>

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
        <div className="max-w-4xl text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-light text-white mb-8 leading-tight">
            No Birds Visiting Today
          </h1>
          <p className="text-2xl md:text-3xl text-blue-100 mb-16 font-light leading-relaxed">
            Explore freely, learn about birds, and protect them
          </p>

          <button
            onClick={handleExplore}
            className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-medium text-lg py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <span>Explore Bird World</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoMigrationToday;
