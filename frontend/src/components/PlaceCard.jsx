import { MapPin, Star, Wallet, Heart } from "lucide-react";

export default function PlaceCard({ item, onSave, onBook, onSelect }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <img
        src={item.images?.[0]}
        alt={item.name}
        className="h-44 w-full object-cover"
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-500">{item.entityType}</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.name}</h3>
          </div>
          <button
            className="rounded-md border border-slate-200 p-2 text-slate-500 dark:border-slate-700 dark:text-slate-300"
            onClick={() => onSave(item)}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1"><Star className="h-4 w-4" /> {item.rating}</span>
          <span className="inline-flex items-center gap-1"><Wallet className="h-4 w-4" /> {item.priceLevel || item.type}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {Math.round((item.distance || 0) / 1000)} km</span>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md bg-sky-500 px-3 py-2 text-sm text-white" onClick={() => onSelect(item)}>
            View details
          </button>
          {item.entityType === "hotel" && (
            <button
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
              onClick={() => onBook(item)}
            >
              Book stay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
