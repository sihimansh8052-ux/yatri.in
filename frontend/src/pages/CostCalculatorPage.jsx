import { useState, useEffect } from "react";
import { BadgeIndianRupee, Bus, Calendar, Landmark, Navigation, Plane, Train, Users, Wallet } from "lucide-react";
import useSeo from "../hooks/useSeo";

const destinations = [
  { name: "New Delhi", factor: 1.0 },
  { name: "Agra", factor: 0.95 },
  { name: "Jaipur", factor: 0.9 },
  { name: "Mumbai", factor: 1.2 },
  { name: "Goa", factor: 1.15 }
];

export default function CostCalculatorPage() {
  useSeo("Travel Cost Calculator | Yatri.in");

  const [destination, setDestination] = useState("New Delhi");
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [transport, setTransport] = useState("train");
  const [stayClass, setStayClass] = useState("mid");
  const [foodStyle, setFoodStyle] = useState("mid");
  const [includeGuide, setIncludeGuide] = useState(false);
  const [sightseeingDays, setSightseeingDays] = useState(2);
  const [shoppingBudget, setShoppingBudget] = useState(1500);

  const [costs, setCosts] = useState({
    transport: 0,
    accommodation: 0,
    food: 0,
    guide: 0,
    sightseeing: 0,
    shopping: 0,
    total: 0,
    perPerson: 0
  });

  useEffect(() => {
    const dest = destinations.find((d) => d.name === destination) || destinations[0];
    
    // Transport costs (fixed per person)
    let transPrice = 1500; // train
    if (transport === "flight") transPrice = 5500;
    if (transport === "bus") transPrice = 800;
    const transportTotal = transPrice * travelers;

    // Accommodation costs (per night, room counts: ceil(travelers / 2))
    let roomPrice = 4000; // mid
    if (stayClass === "budget") roomPrice = 1600;
    if (stayClass === "luxury") roomPrice = 9000;
    const rooms = Math.ceil(travelers / 2);
    const accommodationTotal = roomPrice * (days - 1 || 1) * rooms * dest.factor;

    // Food costs (per person per day)
    let foodPrice = 1200; // mid
    if (foodStyle === "budget") foodPrice = 500;
    if (foodStyle === "luxury") foodPrice = 2800;
    const foodTotal = foodPrice * days * travelers * dest.factor;

    // Guide costs (flat daily rate)
    const guideTotal = includeGuide ? 2000 * days : 0;

    // Sightseeing costs (per person per sightseeing day)
    const sightseeingTotal = 500 * sightseeingDays * travelers;

    // Shopping budget (total flat)
    const shoppingTotal = Number(shoppingBudget) || 0;

    // Sum
    const total = transportTotal + accommodationTotal + foodTotal + guideTotal + sightseeingTotal + shoppingTotal;
    const perPerson = total / travelers;

    setCosts({
      transport: transportTotal,
      accommodation: accommodationTotal,
      food: foodTotal,
      guide: guideTotal,
      sightseeing: sightseeingTotal,
      shopping: shoppingTotal,
      total,
      perPerson
    });
  }, [destination, days, travelers, transport, stayClass, foodStyle, includeGuide, sightseeingDays, shoppingBudget]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-sky-500">Budget Tools</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">Travel Cost Calculator</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
          Plan your expenses beforehand. Adjust sliders and toggles to receive a custom per-person split estimate.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Controls Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 border-b pb-4 dark:border-slate-800">
            <Wallet className="h-5 w-5 text-sky-500" /> Customize Your Journey
          </h2>

          <div className="space-y-6">
            {/* Destination & Travelers count */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Destination</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {destinations.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex justify-between">
                  <span>Number of Travelers</span>
                  <span className="font-bold text-sky-500">{travelers}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full accent-sky-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex justify-between">
                <span>Trip Duration (Days)</span>
                <span className="font-bold text-sky-500">{days} days</span>
              </label>
              <input
                type="range"
                min="1"
                max="21"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-sky-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Transport Options */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Mode of Transport</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "bus", label: "Bus/Road", icon: Bus },
                  { key: "train", label: "Train", icon: Train },
                  { key: "flight", label: "Flight", icon: Plane }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTransport(item.key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition ${
                      transport === item.key
                        ? "border-sky-500 bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accommodation & Food Quality */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Stay Standard</label>
                <select
                  value={stayClass}
                  onChange={(e) => setStayClass(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="budget">Budget Lodging (Rs. 1,600/n)</option>
                  <option value="mid">3-Star Standard Hotel (Rs. 4,000/n)</option>
                  <option value="luxury">5-Star Luxury Resort (Rs. 9,000/n)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Food / Dining</label>
                <select
                  value={foodStyle}
                  onChange={(e) => setFoodStyle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="budget">Budget / Street Food (Rs. 500/day)</option>
                  <option value="mid">Standard Dining (Rs. 1,200/day)</option>
                  <option value="luxury">Gourmet & Fine Dining (Rs. 2,800/day)</option>
                </select>
              </div>
            </div>

            {/* Sightseeing and Guide add-on */}
            <div className="grid gap-4 sm:grid-cols-2 items-center">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex justify-between">
                  <span>Sightseeing (Days)</span>
                  <span className="font-bold text-sky-500">{sightseeingDays} days</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={days}
                  value={sightseeingDays}
                  onChange={(e) => setSightseeingDays(Number(e.target.value))}
                  className="w-full accent-sky-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 mt-4 sm:mt-0 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <input
                  type="checkbox"
                  id="guideToggle"
                  checked={includeGuide}
                  onChange={(e) => setIncludeGuide(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                />
                <label htmlFor="guideToggle" className="text-sm font-medium text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                  Hire Tour Guide (Rs. 2,000/day)
                </label>
              </div>
            </div>

            {/* Shopping Budget input */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Shopping / Misc Budget (Total)</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 sm:text-sm">Rs.</span>
                </div>
                <input
                  type="number"
                  value={shoppingBudget}
                  onChange={(e) => setShoppingBudget(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 p-6 text-white shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-sky-400 mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <BadgeIndianRupee className="h-5 w-5" /> Cost Breakdown
            </h2>

            {/* Per person display */}
            <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10 mb-6">
              <p className="text-sm uppercase tracking-wider text-slate-400">Estimated Cost Per Person</p>
              <h3 className="mt-2 text-5xl font-black text-white">Rs. {Math.round(costs.perPerson).toLocaleString("en-IN")}</h3>
              <p className="mt-2 text-xs text-sky-300">Total: Rs. {costs.total.toLocaleString("en-IN")} for {travelers} travelers</p>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
              <CostBar label="Accommodation" amount={costs.accommodation} total={costs.total} color="bg-emerald-500" />
              <CostBar label="Transport" amount={costs.transport} total={costs.total} color="bg-sky-500" />
              <CostBar label="Food & Snacks" amount={costs.food} total={costs.total} color="bg-amber-500" />
              <CostBar label="Guide Hired" amount={costs.guide} total={costs.total} color="bg-purple-500" />
              <CostBar label="Sightseeing" amount={costs.sightseeing} total={costs.total} color="bg-rose-500" />
              <CostBar label="Shopping / Misc" amount={costs.shopping} total={costs.total} color="bg-blue-400" />
            </div>
          </div>

          <div className="mt-8 space-y-3 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Landmark className="h-4 w-4 text-sky-400" />
              <span>Calculated based on average regional pricing patterns.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CostBar({ label, amount, total, color }) {
  if (amount <= 0) return null;
  const percentage = Math.max(2, Math.round((amount / total) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-1 text-slate-300">
        <span>{label}</span>
        <span className="font-semibold text-white">
          Rs. {amount.toLocaleString("en-IN")} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
