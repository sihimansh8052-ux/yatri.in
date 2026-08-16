import { useEffect, useState, useRef } from "react";
import { MapPin, Navigation, Compass, CloudSun, Eye, List, Search, ShieldAlert, Heart, Star, QrCode } from "lucide-react";
import useSeo from "../hooks/useSeo";

export default function LocationIntelligencePage() {
  useSeo("Location Intelligence | Yatri.in");

  const [coords, setCoords] = useState({ lat: 26.9124, lng: 75.7873 }); // Defaults to Jaipur
  const [viewMode, setViewMode] = useState("map"); // map, list
  const [routeMode, setRouteMode] = useState("driving"); // walking, driving, cycling
  const [weather, setWeather] = useState({ temp: "31°C", cond: "Mostly Cloudy", uv: "High", wind: "14 km/h" });
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState([]);

  // Mock markers data for nearby discoveries
  const [nearbyPlaces, setNearbyPlaces] = useState([
    { id: "1", name: "Sharma Chaat Stall", type: "food", lat: 26.9150, lng: 75.7890, rating: 4.8, dist: "0.4 km", tag: "AI Recommended" },
    { id: "2", name: "Amber Heritage Fort View", type: "attraction", lat: 26.9200, lng: 75.7820, rating: 4.9, dist: "1.2 km", tag: "Must Visit" },
    { id: "3", name: "City Hospital Clinic", type: "emergency", lat: 26.9100, lng: 75.7850, rating: 4.5, dist: "0.6 km", tag: "24/7 Safety" },
    { id: "4", name: "State Police Station", type: "emergency", lat: 26.9130, lng: 75.7910, rating: 4.3, dist: "0.5 km", tag: "Police Dept" }
  ]);

  const [routePoints, setRoutePoints] = useState([
    { name: "My Current Location", lat: 26.9124, lng: 75.7873 },
    { name: "Sharma Chaat Stall", lat: 26.9150, lng: 75.7890 },
    { name: "Amber Heritage Fort View", lat: 26.9200, lng: 75.7820 }
  ]);

  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);

  // Load Leaflet CDN script and css dynamically
  useEffect(() => {
    // Append Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Append Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      initializeLeafletMap();
    };
    document.head.appendChild(script);

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
      }
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // Initialize or update Leaflet Map
  const initializeLeafletMap = () => {
    if (!window.L || !mapRef.current) return;

    if (leafletMapInstance.current) {
      leafletMapInstance.current.setView([coords.lat, coords.lng], 14);
      return;
    }

    const map = window.L.map(mapRef.current, { zoomControl: false }).setView([coords.lat, coords.lng], 14);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
    }).addTo(map);

    leafletMapInstance.current = map;

    // Draw markers
    drawMarkersOnMap();
  };

  const drawMarkersOnMap = () => {
    const map = leafletMapInstance.current;
    if (!map || !window.L) return;

    // Remove existing markers if any
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add main user marker
    window.L.marker([coords.lat, coords.lng])
      .addTo(map)
      .bindPopup("<b>You are here</b><br/>Coordinates updated.")
      .openPopup();

    // Add nearby places markers
    nearbyPlaces.forEach((p) => {
      const iconColor = p.type === "emergency" ? "red" : p.type === "food" ? "green" : "blue";
      window.L.marker([p.lat, p.lng])
        .addTo(map)
        .bindPopup(`<b>${p.name}</b><br/>Rating: ★ ${p.rating}<br/>Category: ${p.type}`);
    });

    // Draw routing lines
    const polylineCoords = routePoints.map((pt) => [pt.lat, pt.lng]);
    window.L.polyline(polylineCoords, { color: "#0ea5e9", weight: 4, dashArray: "5, 10" }).addTo(map);
  };

  // Trigger geolocation API
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(newCoords);
        setRoutePoints((prev) => {
          const updated = [...prev];
          updated[0] = { name: "Detected Location", ...newCoords };
          return updated;
        });
        setLoadingLoc(false);
        if (leafletMapInstance.current) {
          leafletMapInstance.current.setView([newCoords.lat, newCoords.lng], 14);
          drawMarkersOnMap();
        }
      },
      () => {
        setLoadingLoc(false);
        alert("Permission denied or location retrieval failed. Using mock GPS location.");
      }
    );
  };

  // Trigger map updates when coordinates shift
  useEffect(() => {
    if (leafletMapInstance.current) {
      drawMarkersOnMap();
    }
  }, [coords, nearbyPlaces, routePoints]);

  const handleSavePlace = (placeName) => {
    if (savedPlaces.includes(placeName)) return;
    setSavedPlaces([...savedPlaces, placeName]);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header bar */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-900 via-slate-900 to-slate-900 p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Location Intelligence Hub</span>
          <h1 className="text-3xl font-extrabold mt-1">Smart Route & Attractions Map</h1>
          <p className="text-sm text-slate-300 mt-1">View routing time tables, nearby safety hubs, and AI location recommendations.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={detectUserLocation}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-5 py-3 text-xs font-bold text-white shadow-lg transition"
          >
            <Compass className={`h-4.5 w-4.5 ${loadingLoc ? "animate-spin" : ""}`} />
            {loadingLoc ? "Locating..." : "Detect Location"}
          </button>
          <button
            onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-bold text-white shadow-lg transition"
          >
            {viewMode === "map" ? <List className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            {viewMode === "map" ? "Show List View" : "Show Map View"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2.5fr]">
        {/* Left column: Routing & AI suggestions */}
        <div className="space-y-6">
          {/* Coordinate panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-xs">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Live Coordinate Stream</h3>
            <p className="text-sm font-black text-slate-800 dark:text-white">Latitude: {coords.lat.toFixed(4)}</p>
            <p className="text-sm font-black text-slate-800 dark:text-white mt-1">Longitude: {coords.lng.toFixed(4)}</p>
          </div>

          {/* Weather overlays */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-xs flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-wider">Local Weather</h3>
              <p className="text-base font-black text-slate-800 dark:text-white mt-1">{weather.temp} • {weather.cond}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">UV index: {weather.uv} • Wind: {weather.wind}</p>
            </div>
            <CloudSun className="h-10 w-10 text-sky-500" />
          </div>

          {/* Routing panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-xs">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-3">Multi-Stop Route Itinerary</h3>
            <div className="space-y-3 font-semibold text-slate-700 dark:text-slate-300">
              {routePoints.map((pt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">{idx + 1}</span>
                  <span className="truncate">{pt.name}</span>
                </div>
              ))}
            </div>

            {/* Travel transport selector */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center font-bold">
              {["driving", "walking", "cycling"].map((m) => (
                <button
                  key={m}
                  onClick={() => setRouteMode(m)}
                  className={`rounded-lg py-2 capitalize transition ${routeMode === m ? "bg-sky-500 text-white" : "bg-slate-50 dark:bg-slate-950 text-slate-500"}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-slate-400 uppercase font-bold text-[10px]">Estimated Route Metrics</p>
              <p className="text-base font-black text-slate-800 dark:text-white mt-1">
                {routeMode === "driving" ? "12 mins (3.1 km)" : routeMode === "walking" ? "42 mins (2.9 km)" : "22 mins (3.0 km)"}
              </p>
            </div>
          </div>

          {/* AI Recommended locations */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/30 text-xs">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
              ✨ AI Local Spot Recommendations
            </h3>
            <div className="space-y-2 text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
              <p>📍 **Local Breakfast:** Rawat Mishthan Bhandar (Famous for spicy Pyaz Kachori) is just 0.8 km away.</p>
              <p>📍 **Hidden Viewpoint:** Panna Meena Stepwell (Avoid crowds between 4:00 PM and 6:00 PM).</p>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Map View / Listings List */}
        <div className="space-y-6">
          {viewMode === "map" ? (
            <div className="relative rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-[500px]">
              {/* Map container */}
              <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" style={{ minHeight: "480px" }} />

              {/* Map legend overlays */}
              <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-lg text-[10px] space-y-1.5 font-bold z-[1000]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block" /> Attraction Marker
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-green-500 inline-block" /> Food Marker
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block" /> Safety / Emergency
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Nearby Discoveries List</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {nearbyPlaces.map((p) => (
                  <div key={p.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{p.name}</span>
                        <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{p.tag}</span>
                      </div>
                      <p className="text-slate-400 mt-1 capitalize">Category: {p.type} • Distance: {p.dist}</p>
                    </div>
                    <div className="mt-4 flex gap-2 justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-850">
                      <span className="font-bold text-amber-500">★ {p.rating}</span>
                      <button
                        onClick={() => handleSavePlace(p.name)}
                        className={`rounded-lg px-3 py-1.5 font-bold transition ${savedPlaces.includes(p.name) ? "bg-emerald-100 text-emerald-800" : "bg-sky-50 text-sky-600 hover:bg-sky-100"}`}
                      >
                        {savedPlaces.includes(p.name) ? "Bookmarked" : "Bookmark Spot"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick emergency SOS shortcuts */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 dark:border-rose-950 dark:bg-rose-950/20 text-xs">
            <h3 className="font-bold text-rose-900 dark:text-rose-400 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-500" /> One-Click Emergency Safety Panel
            </h3>
            <div className="grid gap-3 sm:grid-cols-3 text-center font-bold">
              <div className="p-3 bg-white dark:bg-slate-900 border border-rose-150 rounded-xl">
                <p className="text-rose-600">Ambulance Emergency</p>
                <a href="tel:102" className="block text-base font-black text-rose-500 mt-1 underline">Call 102</a>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-rose-150 rounded-xl">
                <p className="text-rose-600">Police Dept Helpline</p>
                <a href="tel:100" className="block text-base font-black text-rose-500 mt-1 underline">Call 100</a>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-rose-150 rounded-xl">
                <p className="text-rose-600">Yatri Safety SOS Desk</p>
                <a href="tel:112" className="block text-base font-black text-rose-500 mt-1 underline">Call 112</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
