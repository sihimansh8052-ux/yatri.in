import { useState } from "react";

const starter = {
  title: "",
  startDate: "",
  endDate: "",
  days: [{ dayLabel: "Day 1", notes: "", items: [] }]
};

export default function ItineraryPlanner({ itineraries, onCreate }) {
  const [draft, setDraft] = useState(starter);

  const addDay = () => {
    setDraft((current) => ({
      ...current,
      days: [...current.days, { dayLabel: `Day ${current.days.length + 1}`, notes: "", items: [] }]
    }));
  };

  const save = () => {
    onCreate(draft);
    setDraft(starter);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Build itinerary</h3>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            placeholder="Trip title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              value={draft.startDate}
              onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
            />
            <input
              type="date"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              value={draft.endDate}
              onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
            />
          </div>
          {draft.days.map((day, index) => (
            <textarea
              key={day.dayLabel}
              className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder={`${day.dayLabel} notes`}
              value={day.notes}
              onChange={(e) => {
                const nextDays = [...draft.days];
                nextDays[index].notes = e.target.value;
                setDraft({ ...draft, days: nextDays });
              }}
            />
          ))}
          <div className="flex gap-2">
            <button className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-200" onClick={addDay}>
              Add day
            </button>
            <button className="rounded-md bg-sky-500 px-3 py-2 text-sm text-white" onClick={save}>
              Save itinerary
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {itineraries.map((itinerary) => (
          <div key={itinerary._id || itinerary.title} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">{itinerary.title}</h4>
              <span className="text-xs text-slate-500">{itinerary.startDate} - {itinerary.endDate}</span>
            </div>
            <div className="mt-3 space-y-2">
              {itinerary.days.map((day) => (
                <div key={day.dayLabel} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  <p className="font-medium text-slate-900 dark:text-white">{day.dayLabel}</p>
                  <p className="mt-1">{day.notes}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
