"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
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

// Migration route type
interface MigrationPoint {
  lat: number;
  lng: number;
  timestamp: string; // Simulated time
  opacity: number;
}

// Bird migration hotspots in Sydney with detailed migration routes
const birdHotspots = [
  {
    id: "lathams-snipe",
    name: "Sydney Olympic Park Wetlands",
    lat: -33.8464,
    lng: 151.0686,
    species: "Latham's Snipe, Red-necked Stint",
    stampName: "Latham's Snipe",
    intensity: 0.9,
    migrationRoute: [
      { lat: -32.9283, lng: 151.7817, timestamp: "Oct 26 06:00", opacity: 0.25 }, // Port Macquarie coast
      { lat: -33.0152, lng: 151.6312, timestamp: "Oct 26 14:00", opacity: 0.35 }, // Taree wetlands
      { lat: -33.2164, lng: 151.5503, timestamp: "Oct 27 07:30", opacity: 0.45 }, // Forster lakes
      { lat: -33.4324, lng: 151.4356, timestamp: "Oct 27 16:00", opacity: 0.55 }, // Hunter Wetlands
      { lat: -33.5812, lng: 151.3845, timestamp: "Oct 28 08:00", opacity: 0.65 }, // Lake Macquarie
      { lat: -33.7123, lng: 151.2567, timestamp: "Oct 28 18:00", opacity: 0.75 }, // Tuggerah Lakes
      { lat: -33.7856, lng: 151.1823, timestamp: "Oct 29 06:00", opacity: 0.85 }, // Ku-ring-gai Chase
      { lat: -33.8464, lng: 151.0686, timestamp: "Oct 29 11:30", opacity: 1.0 }, // Sydney Olympic Park (current)
    ],
  },
  {
    id: "rainbow-bee-eater",
    name: "Centennial Park",
    lat: -33.8968,
    lng: 151.2294,
    species: "Rainbow Bee-eater",
    stampName: "Rainbow Bee-eater",
    intensity: 0.7,
    migrationRoute: [
      { lat: -33.4856, lng: 150.9123, timestamp: "Oct 18 07:00", opacity: 0.2 }, // Blue Mountains foothills
      { lat: -33.5645, lng: 150.9856, timestamp: "Oct 18 13:00", opacity: 0.3 }, // Penrith area
      { lat: -33.6523, lng: 151.0234, timestamp: "Oct 19 08:30", opacity: 0.4 }, // Parramatta River corridor
      { lat: -33.7234, lng: 151.0567, timestamp: "Oct 19 15:00", opacity: 0.5 }, // Ryde parks
      { lat: -33.7856, lng: 151.1123, timestamp: "Oct 20 07:00", opacity: 0.6 }, // Lane Cove River
      { lat: -33.8234, lng: 151.1567, timestamp: "Oct 20 11:00", opacity: 0.7 }, // Chatswood bushland
      { lat: -33.8645, lng: 151.1956, timestamp: "Oct 20 14:30", opacity: 0.85 }, // Rushcutters Bay
      { lat: -33.8968, lng: 151.2294, timestamp: "Oct 20 17:00", opacity: 1.0 }, // Centennial Park (current)
    ],
  },
  {
    id: "pacific-plover",
    name: "Botany Bay",
    lat: -33.9961,
    lng: 151.1956,
    species: "Pacific Golden Plover",
    stampName: "Pacific Plover",
    intensity: 0.85,
    migrationRoute: [
      { lat: -33.5234, lng: 151.5123, timestamp: "Oct 10 06:00", opacity: 0.2 }, // Newcastle coastline
      { lat: -33.6156, lng: 151.4856, timestamp: "Oct 10 12:00", opacity: 0.3 }, // Lake Macquarie shores
      { lat: -33.7234, lng: 151.4123, timestamp: "Oct 11 07:30", opacity: 0.4 }, // The Entrance beaches
      { lat: -33.7856, lng: 151.3567, timestamp: "Oct 11 13:00", opacity: 0.5 }, // Terrigal coastal path
      { lat: -33.8456, lng: 151.3012, timestamp: "Oct 11 18:00", opacity: 0.6 }, // Palm Beach headland
      { lat: -33.8945, lng: 151.2734, timestamp: "Oct 12 06:30", opacity: 0.7 }, // Manly Beach
      { lat: -33.9356, lng: 151.2456, timestamp: "Oct 12 11:00", opacity: 0.8 }, // Maroubra coastline
      { lat: -33.9734, lng: 151.2156, timestamp: "Oct 12 14:00", opacity: 0.9 }, // La Perouse
      { lat: -33.9961, lng: 151.1956, timestamp: "Oct 12 16:30", opacity: 1.0 }, // Botany Bay (current)
    ],
  },
  {
    id: "red-necked-stint",
    name: "Lane Cove National Park",
    lat: -33.7589,
    lng: 151.1406,
    species: "Red-necked Stint",
    stampName: "Red-necked Stint",
    intensity: 0.8,
    migrationRoute: [
      { lat: -33.4234, lng: 151.3456, timestamp: "Oct 15 05:30", opacity: 0.2 }, // Swansea wetlands
      { lat: -33.4856, lng: 151.3123, timestamp: "Oct 15 10:00", opacity: 0.3 }, // Wyong Creek
      { lat: -33.5645, lng: 151.2734, timestamp: "Oct 16 06:00", opacity: 0.4 }, // Gosford waterways
      { lat: -33.6234, lng: 151.2456, timestamp: "Oct 16 12:30", opacity: 0.5 }, // Brisbane Water
      { lat: -33.6756, lng: 151.2123, timestamp: "Oct 17 07:00", opacity: 0.6 }, // Pittwater estuary
      { lat: -33.7156, lng: 151.1856, timestamp: "Oct 17 13:00", opacity: 0.7 }, // Middle Harbour
      { lat: -33.7423, lng: 151.1645, timestamp: "Oct 18 08:00", opacity: 0.85 }, // Roseville Chase
      { lat: -33.7589, lng: 151.1406, timestamp: "Oct 18 11:00", opacity: 1.0 }, // Lane Cove National Park (current)
    ],
  },
  {
    id: "black-faced-spoonbill",
    name: "Homebush Bay",
    lat: -33.8477,
    lng: 151.0766,
    species: "Black-faced Spoonbill",
    stampName: "Black-faced Spoonbill",
    intensity: 0.75,
    migrationRoute: [
      { lat: -33.6123, lng: 150.7856, timestamp: "Oct 12 06:00", opacity: 0.2 }, // Grose River wetlands
      { lat: -33.6756, lng: 150.8645, timestamp: "Oct 12 14:00", opacity: 0.3 }, // Hawkesbury River
      { lat: -33.7234, lng: 150.9234, timestamp: "Oct 13 07:30", opacity: 0.4 }, // Castle Hill area
      { lat: -33.7645, lng: 150.9756, timestamp: "Oct 13 15:00", opacity: 0.5 }, // Parramatta River upper
      { lat: -33.7956, lng: 151.0156, timestamp: "Oct 14 08:00", opacity: 0.6 }, // Silverwater wetlands
      { lat: -33.8156, lng: 151.0423, timestamp: "Oct 14 14:30", opacity: 0.7 }, // Newington Nature Reserve
      { lat: -33.8334, lng: 151.0612, timestamp: "Oct 15 09:00", opacity: 0.85 }, // Bicentennial Park
      { lat: -33.8477, lng: 151.0766, timestamp: "Oct 15 12:00", opacity: 1.0 }, // Homebush Bay (current)
    ],
  },
];

// Component to handle map fly-to on stamp hover and initial center
function MapController() {
  const map = useMap();
  const { selectedLocation, mapCenter, mapZoom } = useBirdInteraction();

  // Handle initial map center from location permission
  useEffect(() => {
    if (mapCenter && map) {
      map.flyTo(mapCenter, mapZoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [mapCenter, mapZoom, map]);

  // Handle stamp hover fly-to
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

// Custom icon creator for migration path points
const createMigrationIcon = (opacity: number) => {
  return L.divIcon({
    className: "custom-migration-icon",
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        opacity: ${opacity};
        transition: all 0.3s ease;
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const SydneyBirdMap = () => {
  const { setSelectedBird } = useBirdInteraction();
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);

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
        {birdHotspots.map((spot) => (
          <div key={spot.id}>
            {/* Main current location marker */}
            <Marker
              position={[spot.lat, spot.lng]}
              eventHandlers={{
                click: () => handleMarkerClick(spot.stampName),
                mouseover: () => setHoveredSpotId(spot.id),
                mouseout: () => setHoveredSpotId(null),
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
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    📮 Click to highlight stamp →
                  </p>
                  <p className="text-xs text-purple-600 font-medium">
                    🦅 Hover to see migration route
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Migration route visualization - shown on hover */}
            {hoveredSpotId === spot.id && spot.migrationRoute && (
              <>
                {/* Polyline connecting migration points */}
                <Polyline
                  positions={spot.migrationRoute.map((point) => [
                    point.lat,
                    point.lng,
                  ])}
                  pathOptions={{
                    color: "#8b5cf6",
                    weight: 3,
                    opacity: 0.6,
                    dashArray: "10, 10",
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />

                {/* Historical migration point markers */}
                {spot.migrationRoute.slice(0, -1).map((point, pointIndex) => (
                  <Marker
                    key={`${spot.id}-route-${pointIndex}`}
                    position={[point.lat, point.lng]}
                    icon={createMigrationIcon(point.opacity)}
                    eventHandlers={{
                      mouseover: () => setHoveredSpotId(spot.id),
                      mouseout: () => setHoveredSpotId(null),
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold text-xs mb-1 text-purple-600">
                          📍 Migration Point {pointIndex + 1}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">
                          <strong>{spot.species}</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                          Date: <strong>{point.timestamp}</strong>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {pointIndex === 0 && "🌏 Origin point"}
                          {pointIndex > 0 &&
                            pointIndex < spot.migrationRoute.length - 2 &&
                            "✈️ En route"}
                          {pointIndex === spot.migrationRoute.length - 2 &&
                            "🎯 Almost at Sydney"}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            )}
          </div>
        ))}
      </MapContainer>
    </div>
  );
};

export default SydneyBirdMap;
