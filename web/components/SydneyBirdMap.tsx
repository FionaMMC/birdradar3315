"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useBirdInteraction } from "@/contexts/BirdInteractionContext";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Bird migration hotspots in Sydney
const birdHotspots = [
  {
    id: "lathams-snipe",
    name: "Sydney Olympic Park Wetlands",
    lat: -33.8464,
    lng: 151.0686,
    species: "Latham's Snipe, Red-necked Stint",
    stampName: "Latham's Snipe",
    intensity: 0.9,
  },
  {
    id: "rainbow-bee-eater",
    name: "Centennial Park",
    lat: -33.8968,
    lng: 151.2294,
    species: "Rainbow Bee-eater",
    stampName: "Rainbow Bee-eater",
    intensity: 0.7,
  },
  {
    id: "pacific-plover",
    name: "Botany Bay",
    lat: -33.9961,
    lng: 151.1956,
    species: "Pacific Golden Plover",
    stampName: "Pacific Plover",
    intensity: 0.85,
  },
  {
    id: "red-necked-stint",
    name: "Lane Cove National Park",
    lat: -33.7589,
    lng: 151.1406,
    species: "Red-necked Stint",
    stampName: "Red-necked Stint",
    intensity: 0.8,
  },
  {
    id: "black-faced-spoonbill",
    name: "Homebush Bay",
    lat: -33.8477,
    lng: 151.0766,
    species: "Black-faced Spoonbill",
    stampName: "Black-faced Spoonbill",
    intensity: 0.75,
  },
];

// Component to handle map fly-to on stamp hover
function MapController() {
  const map = useMap();
  const { selectedLocation } = useBirdInteraction();

  useEffect(() => {
    if (selectedLocation && map) {
      map.flyTo(selectedLocation, 13, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [selectedLocation, map]);

  return null;
}

const SydneyBirdMap = () => {
  const { setSelectedBird } = useBirdInteraction();

  const handleMarkerClick = (stampName: string) => {
    setSelectedBird(stampName);
    // Auto-clear after 3 seconds
    setTimeout(() => setSelectedBird(null), 3000);
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[-33.8688, 151.2093]}
        zoom={11}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Controller for stamp hover */}
        <MapController />

        {/* Bird hotspot markers */}
        {birdHotspots.map((spot, index) => (
          <Marker
            key={index}
            position={[spot.lat, spot.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(spot.stampName),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{spot.name}</h3>
                <p className="text-xs text-gray-600 mb-1">{spot.species}</p>
                <div className="flex items-center gap-1 text-xs mb-2">
                  <span className="text-blue-600 font-medium">Activity:</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < spot.intensity * 5 ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-blue-600 font-medium">
                  📮 Click to highlight stamp →
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SydneyBirdMap;
