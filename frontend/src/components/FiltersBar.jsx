export default function FiltersBar({ filters, setFilters }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-5">
      <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={filters.category} onChange={(e) => update("category", e.target.value)}>
        <option value="all">All categories</option>
        <option value="hotel">Hotels</option>
        <option value="restaurant">Restaurants</option>
        <option value="attraction">Tourist places</option>
        <option value="local-experience">Local experiences</option>
        <option value="guide">Tour Guides</option>
      </select>
      <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={filters.budget} onChange={(e) => update("budget", e.target.value)}>
        <option value="all">Any budget</option>
        <option value="budget">Budget</option>
        <option value="mid">Mid-range</option>
        <option value="premium">Premium</option>
      </select>
      <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={filters.rating} onChange={(e) => update("rating", e.target.value)}>
        <option value="">Any rating</option>
        <option value="4">4.0+</option>
        <option value="4.5">4.5+</option>
      </select>
      <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={filters.distance} onChange={(e) => update("distance", e.target.value)}>
        <option value="">Any distance</option>
        <option value="5000">Within 5 km</option>
        <option value="15000">Within 15 km</option>
        <option value="30000">Within 30 km</option>
      </select>
      <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={filters.sort} onChange={(e) => update("sort", e.target.value)}>
        <option value="popularity">Popularity</option>
        <option value="rating">Top rated</option>
        <option value="nearest">Nearest</option>
      </select>
    </div>
  );
}
