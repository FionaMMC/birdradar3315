"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBirdInteraction } from "@/contexts/BirdInteractionContext";
import {
  isValidSydneyPostcode,
  getLocationOrDefault,
  getPostcodeErrorMessage,
  DEFAULT_LOCATION
} from "@/utils/postcodeUtils";

const LightsOutChallenge = () => {
  const [showLocationPermission, setShowLocationPermission] = useState(true);
  const [lightsOut, setLightsOut] = useState(false);
  const [stampAnimating, setStampAnimating] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [postcodeError, setPostcodeError] = useState("");
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [showCheckAnimation, setShowCheckAnimation] = useState(false);
  const router = useRouter();
  const { setMapCenter, setMapZoom } = useBirdInteraction();

  const handleCheckboxChange = () => {
    setCheckboxChecked(true);
    setShowCheckAnimation(true);

    // Trigger lights out after check animation
    setTimeout(() => {
      setLightsOut(true);
    }, 800);
  };

  const handleStampClick = () => {
    setStampAnimating(true);
    // Wait for animation to complete before navigating
    setTimeout(() => {
      router.push("/track-migration");
    }, 1500);
  };

  const handleAllowLocation = () => {
    // Use University of Sydney as default location
    const location = DEFAULT_LOCATION;
    setMapCenter([location.lat, location.lng]);
    setMapZoom(13);
    setShowLocationPermission(false);
  };

  const handlePostcodeSubmit = () => {
    const trimmedPostcode = postcode.trim();

    // Clear previous errors
    setPostcodeError("");

    if (!trimmedPostcode) {
      setPostcodeError("Please enter a postcode");
      return;
    }

    // Validate Sydney postcode
    if (!isValidSydneyPostcode(trimmedPostcode)) {
      setPostcodeError(getPostcodeErrorMessage(trimmedPostcode));
      return;
    }

    // Get location (will fallback to default if postcode not in mapping)
    const location = getLocationOrDefault(trimmedPostcode);
    setMapCenter([location.lat, location.lng]);
    setMapZoom(14);

    // Close modal
    setShowLocationPermission(false);
  };

  const handleSkipLocation = () => {
    // Use University of Sydney as default location
    const location = DEFAULT_LOCATION;
    setMapCenter([location.lat, location.lng]);
    setMapZoom(11);
    router.push("/");
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
          key={lightsOut ? "bee-eater" : "city"}
        >
          <source
            src={
              lightsOut
                ? "/assets/rainbow.mp4"
                : "/assets/6151210_City Buildings Gloomy Flying Birds_By_Lukas_Pich_Artlist_4K.mp4"
            }
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

              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      setPostcodeError(""); // Clear error on input
                    }}
                    placeholder="Enter postcode (e.g., 2050)"
                    className={`flex-1 bg-white/10 text-white placeholder-blue-200/50 px-4 py-3 rounded-lg border ${
                      postcodeError
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                        : "border-white/20 focus:border-blue-400 focus:ring-blue-400/20"
                    } focus:outline-none focus:ring-2 transition-all`}
                    onKeyDown={(e) => {
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
                {postcodeError && (
                  <p className="text-red-300 text-sm mt-2 px-1 animate-fade-in">
                    ⚠️ {postcodeError}
                  </p>
                )}
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
        {!lightsOut ? (
          /* Initial State - Call to Action */
          <div className="max-w-3xl text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-light text-white mb-8 leading-tight">
              Tonight, migratory birds are passing through your area
            </h1>
            <p className="text-2xl text-blue-100 mb-16 font-light">
              Turn off your lights to help them navigate safely and discover
              their identity
            </p>

            {/* Checkbox */}
            <label className="inline-flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={checkboxChecked}
                  onChange={handleCheckboxChange}
                  disabled={checkboxChecked}
                  className="peer w-10 h-10 rounded-lg border-2 border-white/50 bg-white/10 cursor-pointer checked:bg-gradient-to-br checked:from-blue-500 checked:to-blue-600 checked:border-blue-400 transition-all duration-300 appearance-none hover:border-white hover:bg-white/20 hover:scale-110 disabled:cursor-default"
                />
                {/* Checkmark with ticket animation */}
                {showCheckAnimation && (
                  <svg
                    className="absolute top-1/2 left-1/2 w-8 h-8 text-white pointer-events-none animate-check-ticket"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3.5"
                      d="M5 13l4 4L19 7"
                      className="drop-shadow-lg"
                    />
                  </svg>
                )}
              </div>
              <span className={`text-xl font-light transition-all duration-500 ${
                checkboxChecked
                  ? "text-blue-300 scale-105"
                  : "text-white group-hover:text-blue-200"
              }`}>
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
                className={`inline-block cursor-pointer transition-all duration-500 ${
                  stampAnimating
                    ? "animate-stamp-fly-away"
                    : "hover:scale-110 hover:rotate-2"
                }`}
              >
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-2xl transition-all duration-300">
                  <div className="w-64 aspect-[3/4] rounded overflow-hidden mb-4 bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                    <img
                      src="/assets/Rainbow Bee-eater.png"
                      alt="Rainbow Bee-eater Stamp"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-white text-xl font-medium mb-2">
                    Rainbow Bee-eater
                  </h3>
                  <p className="text-blue-200 text-sm">Oct 8, 2025</p>
                </div>
                <p className="text-white/60 text-sm mt-6 animate-pulse">
                  Click to add to your collection
                </p>
              </div>

              {/* Share Button */}
              <div className="mt-8">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareCard(true);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share it with friend
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Card Modal */}
      {showShareCard && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-8 animate-fade-in"
          onClick={() => setShowShareCard(false)}
        >
          <div
            className="share-card-container animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Share Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl border border-white/10 max-w-md">
              {/* Bird Image */}
              <div className="text-center mb-6">
                <div className="w-48 aspect-[3/4] mx-auto rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                  <img
                    src="/assets/Rainbow Bee-eater.png"
                    alt="Rainbow Bee-eater"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Call to Action Message */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-medium text-white mb-4 leading-tight">
                  Rainbow Bee-eater is passing through your area tonight
                </h2>
                <p className="text-xl text-blue-100 font-light mb-2">
                  Please turn off your lights to protect them
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-6"></div>

              {/* QR Code Section */}
              <div className="text-center">
                <a
                  href="/about-us?stamp=rainbow-bee-eater"
                  className="block w-48 h-48 mx-auto mb-4 bg-white rounded-lg p-3 hover:scale-105 transition-transform cursor-pointer"
                >
                  {/* Placeholder QR Code - Replace with actual QR code generation */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <rect x="0" y="0" width="100" height="100" fill="white"/>
                    <rect x="10" y="10" width="15" height="15" fill="black"/>
                    <rect x="75" y="10" width="15" height="15" fill="black"/>
                    <rect x="10" y="75" width="15" height="15" fill="black"/>
                    <rect x="30" y="15" width="5" height="5" fill="black"/>
                    <rect x="40" y="15" width="5" height="5" fill="black"/>
                    <rect x="50" y="15" width="5" height="5" fill="black"/>
                    <rect x="60" y="15" width="5" height="5" fill="black"/>
                    <rect x="35" y="30" width="30" height="30" fill="black"/>
                    <rect x="40" y="35" width="20" height="20" fill="white"/>
                    <rect x="45" y="40" width="10" height="10" fill="black"/>
                    <rect x="15" y="35" width="5" height="5" fill="black"/>
                    <rect x="80" y="35" width="5" height="5" fill="black"/>
                    <rect x="15" y="50" width="5" height="5" fill="black"/>
                    <rect x="80" y="50" width="5" height="5" fill="black"/>
                    <rect x="30" y="75" width="5" height="5" fill="black"/>
                    <rect x="40" y="75" width="5" height="5" fill="black"/>
                    <rect x="75" y="80" width="5" height="5" fill="black"/>
                  </svg>
                </a>
                <p className="text-blue-100 text-base font-light mb-2">
                  Scan the QR code to register
                </p>
                <p className="text-white text-lg font-medium">
                  and get this stamp
                </p>
              </div>

              {/* Logo */}
              <div className="text-center mt-6">
                <p className="text-slate-400 text-xs">
                  BirdsRadar • Lights Out Initiative
                </p>
              </div>
            </div>

            {/* Close Instruction */}
            <p className="text-white/60 text-sm text-center mt-6">
              Click anywhere outside to close
            </p>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes stamp-fly-away {
          0% {
            transform: scale(1) translateX(0) translateY(0);
            opacity: 1;
          }
          50% {
            transform: scale(0.5) translateX(40vw) translateY(-20vh)
              rotate(15deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.2) translateX(80vw) translateY(-40vh)
              rotate(25deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        /* Ticket/Checkmark animation - bouncy entrance */
        @keyframes check-ticket {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(-45deg);
            transform-origin: center center;
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.5) rotate(10deg);
            transform-origin: center center;
          }
          65% {
            transform: translate(-50%, -50%) scale(0.85) rotate(-5deg);
            transform-origin: center center;
          }
          80% {
            transform: translate(-50%, -50%) scale(1.15) rotate(3deg);
            transform-origin: center center;
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            transform-origin: center center;
          }
        }

        .animate-stamp-fly-away {
          animation: stamp-fly-away 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-check-ticket {
          animation: check-ticket 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default LightsOutChallenge;
