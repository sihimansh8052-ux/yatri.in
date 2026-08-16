import { CalendarCheck, ExternalLink, Heart, MapPin, Route, Star, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function ListingCard({ item, onSave }) {
  const isGuide = item.role === "tour_guide" || item.entityType === "guide";
  const image =
    item.profilePhoto ||
    item.images?.[0] ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
  const detailType = isGuide
    ? "guide"
    : item.entityType || (item.category === "hotel" ? "hotel" : item.category === "restaurant" ? "restaurant" : "place");
  const isHotel = detailType === "hotel";
  const directionsUrl = getDirectionsUrl(item);
  const featureList = isGuide
    ? (Array.isArray(item.languagesSpoken) ? item.languagesSpoken : [])
    : (Array.isArray(item.features) ? item.features
       : Array.isArray(item.amenities) ? item.amenities
       : Array.isArray(item.menuHighlights) ? item.menuHighlights
       : Array.isArray(item.cuisine) ? item.cuisine
       : Array.isArray(item.tags) ? item.tags
       : []);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="relative">
        <img src={image} alt={item.name} className="h-44 w-full object-cover" />
        {item.googlePlaceId && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white shadow">
            Live Google Places
          </span>
        )}
        {item.openNow !== undefined && (
          <span className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-medium text-white shadow ${item.openNow ? "bg-emerald-500" : "bg-slate-700"}`}>
            {item.openNow ? "Open now" : "Hours vary"}
          </span>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-500">
              {isGuide ? `Guide • ${item.experience || 5} yrs exp` : item.entityType || item.category || item.type}
            </p>
            <h3 className="text-lg font-semibold">{item.name}</h3>
          </div>
          {onSave && (
            <button className="rounded-md border border-slate-200 p-2 dark:border-slate-700" onClick={() => onSave(item)}>
              <Heart className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{item.description || item.bio}</p>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1"><Star className="h-4 w-4" /> {item.rating || "New"} {item.userRatingCount ? `(${item.userRatingCount})` : ""}</span>
          {(item.priceLevel || item.pricePerNight || item.pricePerDay) && (
            <span className="inline-flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              {isGuide ? `Rs. ${item.pricePerDay}/day` : item.pricePerNight ? `Rs. ${item.pricePerNight}` : item.priceLevel}
            </span>
          )}
          {item.distance !== undefined && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {Math.max(1, Math.round(item.distance / 1000))} km</span>
          )}
        </div>
        {featureList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {featureList.slice(0, 4).map((feature) => (
              <span key={feature} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {String(feature).replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.city}</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                title="Get directions"
                className="rounded-md border border-slate-300 p-2 text-slate-500 transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300"
              >
                <Route className="h-4 w-4" />
              </a>
            )}
            {item.googleMapsUri && (
              <a href={item.googleMapsUri} target="_blank" rel="noreferrer" className="rounded-md border border-slate-300 p-2 text-slate-500 dark:border-slate-700 dark:text-slate-300">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <Link
              to={`/details/${detailType}/${item._id}`}
              className="rounded-md bg-sky-500 px-3 py-2 text-sm text-white font-semibold"
            >
              View details
            </Link>
            {isHotel && (
              <Link
                to={`/details/hotel/${item._id}?book=1`}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <CalendarCheck className="h-4 w-4" /> Book hotel
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function getDirectionsUrl(item) {
  if (item.googleMapsUri) return item.googleMapsUri;
  if (item?.location?.coordinates?.length === 2) {
    const [lng, lat] = item.location.coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}&travelmode=driving`;
  }
  const query = [item.name, item.address, item.city].filter(Boolean).join(" ");
  return query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving` : null;
}
