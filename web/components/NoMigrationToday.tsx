'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NoMigrationToday = () => {
  const router = useRouter();
  const [videoSrc, setVideoSrc] = useState('');

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
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-950/60" />
      </div>

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
