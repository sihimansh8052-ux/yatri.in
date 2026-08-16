import { DirectionsRenderer, GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { useMemo, useState } from "react";

const containerStyle = { width: "100%", height: "100%" };
const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const hasUsableMapsKey = mapsApiKey && !/your_|placeholder|api_key/i.test(mapsApiKey);

export default function MapView({ center, places = [] }) {
  if (!hasUsableMapsKey) {
    return <MapFallback center={center} places={places} />;
  }

  return <InteractiveMap center={center} places={places} apiKey={mapsApiKey} />;
}

function InteractiveMap({ center, places = [], apiKey }) {
  const [directions, setDirections] = useState(null);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey
  });

  const mapCenter = useMemo(() => center || { lat: 28.6139, lng: 77.209 }, [center]);

  const validPlaces = useMemo(() => {
    return places.filter((p) => p?.location?.coordinates?.length === 2);
  }, [places]);

  const requestDirections = (place) => {
    if (!window.google || !center) return;
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: center,
        destination: { lat: place.location.coordinates[1], lng: place.location.coordinates[0] },
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
      }
    );
  };

  if (loadError) {
    return <MapFallback center={center} places={places} />;
  }

  if (!isLoaded) {
    return <div className="flex h-full min-h-[460px] items-center justify-center text-sm text-slate-500">Loading map...</div>;
  }

  return (
    <div className="h-full min-h-[460px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={12}>
        {center && <MarkerF position={center} />}
        {validPlaces.map((place) => (
          <MarkerF
            key={place._id}
            position={{ lat: place.location.coordinates[1], lng: place.location.coordinates[0] }}
            onClick={() => requestDirections(place)}
          />
        ))}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}

function MapFallback({ center, places = [] }) {
  const firstPlace = places.find((place) => place?.location?.coordinates?.length === 2);
  const target = firstPlace
    ? `${firstPlace.location.coordinates[1]},${firstPlace.location.coordinates[0]}`
    : center
      ? `${center.lat},${center.lng}`
      : "New Delhi";
  const directionsUrl = center && firstPlace
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${center.lat},${center.lng}`)}&destination=${encodeURIComponent(target)}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;

  return (
    <div className="flex h-full min-h-[460px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <p className="font-semibold text-slate-800 dark:text-white">Map preview is unavailable.</p>
      <p className="max-w-md text-xs leading-relaxed">
        Add a valid `VITE_GOOGLE_MAPS_API_KEY` for the embedded map, or open directions directly in Google Maps.
      </p>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-md bg-sky-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-sky-600"
      >
        Open Google Maps
      </a>
    </div>
  );
}
