import { LocateFixed, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";
import FiltersBar from "../components/FiltersBar";
import ListingCard from "../components/ListingCard";
import MapView from "../components/MapView";

export default function ResultsPage({ user, savedOnly = false, onUserRefresh }) {
  useSeo(savedOnly ? "Wishlist | Yatri.in" : "Explore | Yatri.in");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState({ items: [], topPlaces: [], trendingDestinations: [] });
  const [savedDetails, setSavedDetails] = useState([]);
  const [guideSuggestions, setGuideSuggestions] = useState([]);

  const filters = useMemo(
    () => ({
      category: params.get("category") || "all",
      budget: params.get("budget") || "all",
      rating: params.get("rating") || "",
      distance: params.get("distance") || "",
      sort: params.get("sort") || "popularity"
    }),
    [params]
  );

  const setFilters = (updater) => {
    const next = typeof updater === "function" ? updater(filters) : updater;
    const nextParams = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    setParams(nextParams);
  };

  const fetchExplore = async () => {
    setLoading(true);
    setError("");
    setGuideSuggestions([]);
    try {
      const query = Object.fromEntries(params.entries());
      if (query.category === "guide") {
        const { data } = await api.get("/users/guides", { params: query });
        setPayload({
          items: data.map((item) => ({ ...item, entityType: "guide" })),
          provider: "local",
          message: "Showing available local tour guides."
        });
      } else {
        if (!query.city && !query.search && !query.lat) {
          query.city = "New Delhi";
        }
        const { data } = await api.get("/discover/explore", { params: query });
        setPayload(data);
        const suggestedCity = query.city || data.items?.find((item) => item.city)?.city || query.search || "";
        if (suggestedCity) {
          const { data: guides } = await api.get("/users/guides", {
            params: { city: suggestedCity, search: query.search }
          });
          setGuideSuggestions(guides.map((item) => ({ ...item, entityType: "guide" })).slice(0, 4));
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load travel results right now.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    if (!savedOnly || !user?.savedPlaces?.length) {
      setSavedDetails([]);
      return;
    }
    const calls = user.savedPlaces.map((item) =>
      api.get(`/${item.placeType === "place" ? "places" : `${item.placeType}s`}/${item.placeId}`)
        .then(({ data }) => ({ ...data, entityType: item.placeType }))
        .catch(() => null)
    );
    const items = (await Promise.all(calls)).filter(Boolean);
    setSavedDetails(items);
  };

  useEffect(() => {
    if (!savedOnly) fetchExplore();
  }, [params.toString(), savedOnly]);

  useEffect(() => {
    fetchSaved();
  }, [savedOnly, user]);

  const savePlace = async (item) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    await api.post("/users/saved", {
      placeId: item._id,
      placeType: item.entityType || (item.category === "hotel" ? "hotel" : item.category === "restaurant" ? "restaurant" : "place")
    });
    onUserRefresh?.();
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const next = new URLSearchParams(params);
      next.set("lat", String(position.coords.latitude));
      next.set("lng", String(position.coords.longitude));
      next.set("distance", next.get("distance") || "15000");
      next.set("sort", "nearest");
      setParams(next);
    });
  };

  const items = savedOnly ? savedDetails : payload.items;
  const mapCenter = params.get("lat") && params.get("lng")
    ? { lat: Number(params.get("lat")), lng: Number(params.get("lng")) }
    : items[0]?.location?.coordinates?.length === 2
      ? { lat: items[0].location.coordinates[1], lng: items[0].location.coordinates[0] }
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-sky-500">{savedOnly ? "Your wishlist" : "Travel results"}</p>
          <h1 className="text-3xl font-semibold">{savedOnly ? "Saved places" : "Find what fits the day"}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {savedOnly ? "Places you marked for later." : "Compare listings by budget, rating, distance, and what is nearby."}
          </p>
        </div>
        {!savedOnly && (
          <button onClick={detectLocation} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">
            <LocateFixed className="h-4 w-4" /> Detect my location
          </button>
        )}
      </div>

      {!savedOnly && <div className="mt-6"><FiltersBar filters={filters} setFilters={setFilters} /></div>}

      {!savedOnly && payload.provider && (
        <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
          payload.provider === "google"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        }`}>
          {payload.message || (payload.provider === "google" ? "Showing live Google Places results." : "Showing sample fallback results.")}
        </div>
      )}

      {error && <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">{error}</div>}

      {loading ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />)}</div>
          <div className="h-[460px] animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : items.length ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => <ListingCard key={`${item.entityType || item.category}-${item._id}`} item={item} onSave={savePlace} />)}
            </div>
            {!savedOnly && guideSuggestions.length > 0 && (
              <div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-sky-500">Local guide recommendations</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Guides matched to your destination</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {guideSuggestions.map((guide) => (
                    <ListingCard key={`guide-${guide._id}`} item={guide} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <MapView center={mapCenter} places={items} />
          </div>
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <SearchX className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold">No matches yet</h2>
          <p className="mt-2 text-sm text-slate-500">Try a broader city search, a lower rating filter, or use current location.</p>
        </div>
      )}
    </div>
  );
}
