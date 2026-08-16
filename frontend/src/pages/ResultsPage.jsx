import { Bus, Hotel, LocateFixed, MapPinned, SearchX, TrainFront, UtensilsCrossed } from "lucide-react";
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
  const [cityTravel, setCityTravel] = useState({ hotels: [], restaurants: [], places: [], buses: [], trains: [] });

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
    setCityTravel({ hotels: [], restaurants: [], places: [], buses: [], trains: [] });
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
          const [guidesResult, hotelsResult, restaurantsResult, placesResult, busesResult, trainsResult] = await Promise.allSettled([
            api.get("/users/guides", { params: { city: suggestedCity, search: query.search } }),
            api.get("/hotels", { params: { city: suggestedCity, search: query.search } }),
            api.get("/restaurants", { params: { city: suggestedCity, search: query.search } }),
            api.get("/places", { params: { city: suggestedCity, search: query.search } }),
            api.get("/buses", { params: { city: suggestedCity } }),
            api.get("/trains", { params: { city: suggestedCity } })
          ]);
          const guides = guidesResult.status === "fulfilled" ? guidesResult.value.data : [];
          setGuideSuggestions(guides.map((item) => ({ ...item, entityType: "guide" })).slice(0, 4));
          setCityTravel({
            hotels: hotelsResult.status === "fulfilled" ? hotelsResult.value.data.slice(0, 6).map((item) => ({ ...item, entityType: "hotel" })) : [],
            restaurants: restaurantsResult.status === "fulfilled" ? restaurantsResult.value.data.slice(0, 6).map((item) => ({ ...item, entityType: "restaurant" })) : [],
            places: placesResult.status === "fulfilled" ? placesResult.value.data.slice(0, 6).map((item) => ({ ...item, entityType: "place" })) : [],
            buses: busesResult.status === "fulfilled" ? busesResult.value.data.slice(0, 6) : [],
            trains: trainsResult.status === "fulfilled" ? trainsResult.value.data.slice(0, 6) : []
          });
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

      {!savedOnly && !loading && (
        <CityTravelHub cityTravel={cityTravel} onSave={savePlace} />
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

function CityTravelHub({ cityTravel, onSave }) {
  const total =
    cityTravel.hotels.length +
    cityTravel.restaurants.length +
    cityTravel.places.length +
    cityTravel.buses.length +
    cityTravel.trains.length;

  if (!total) return null;

  return (
    <section className="mt-6 space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-500">Complete city travel guide</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hotels, routes, food, directions, buses, and trains</h2>
      </div>

      <ResultSection icon={Hotel} title="Hotels & Stays" count={cityTravel.hotels.length}>
        {cityTravel.hotels.map((item) => <ListingCard key={`hub-hotel-${item._id}`} item={item} onSave={onSave} />)}
      </ResultSection>

      <ResultSection icon={Bus} title="Buses For This City" count={cityTravel.buses.length}>
        {cityTravel.buses.map((bus) => <TransportCard key={`hub-bus-${bus._id}`} item={bus} type="bus" />)}
      </ResultSection>

      <ResultSection icon={TrainFront} title="Trains For This City" count={cityTravel.trains.length}>
        {cityTravel.trains.map((train) => <TransportCard key={`hub-train-${train._id}`} item={train} type="train" />)}
      </ResultSection>

      <ResultSection icon={UtensilsCrossed} title="Local Food" count={cityTravel.restaurants.length}>
        {cityTravel.restaurants.map((item) => <ListingCard key={`hub-food-${item._id}`} item={item} onSave={onSave} />)}
      </ResultSection>

      <ResultSection icon={MapPinned} title="Places & Directions" count={cityTravel.places.length}>
        {cityTravel.places.map((item) => <ListingCard key={`hub-place-${item._id}`} item={item} onSave={onSave} />)}
      </ResultSection>
    </section>
  );
}

function ResultSection({ icon: Icon, title, count, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-sky-500" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-950">{count} found</span>
      </div>
      {count ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      ) : (
        <p className="rounded-md border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800">
          No results in this category yet.
        </p>
      )}
    </section>
  );
}

function TransportCard({ item, type }) {
  const title = type === "train" ? item.trainName : item.operatorName;
  const subtitle = type === "train" ? `${item.trainNumber} • ${item.trainType}` : item.busType;
  const bookingPath = type === "train" ? `/trains?to=${encodeURIComponent(item.to)}` : `/buses?to=${encodeURIComponent(item.to)}`;
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-sky-500">{type === "train" ? "Train" : "Bus"}</p>
          <h4 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">★ {item.rating || 4.5}</span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{item.departureTime}</p>
          <p className="text-xs text-slate-500">{item.from}</p>
        </div>
        <div className="text-[10px] font-bold text-slate-400">{item.duration}</div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{item.arrivalTime}</p>
          <p className="text-xs text-slate-500">{item.to}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-lg font-black text-slate-900 dark:text-white">Rs. {Number(item.price || 0).toLocaleString("en-IN")}</p>
        <a href={bookingPath} className="rounded-md bg-sky-500 px-3 py-2 text-xs font-bold text-white">
          Book {type}
        </a>
      </div>
    </article>
  );
}
