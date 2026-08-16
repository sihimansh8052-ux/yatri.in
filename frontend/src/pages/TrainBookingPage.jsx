import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftRight, CalendarDays, MapPin, Search, Star, TrainFront } from "lucide-react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";

export default function TrainBookingPage({ user }) {
  useSeo("Train Search & Booking | Yatri.in");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const from = params.get("from") || "";
  const to = params.get("to") || "Goa";
  const date = params.get("date") || new Date().toISOString().split("T")[0];

  const [searchForm, setSearchForm] = useState({ from, to, date });
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState("T-12");
  const [classType, setClassType] = useState("3A");
  const [boarding, setBoarding] = useState("");
  const [dropping, setDropping] = useState("");
  const [passengerName, setPassengerName] = useState(user?.name || "");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const trainPlatformFee = 19;

  useEffect(() => {
    setSearchForm({ from, to, date });
  }, [from, to, date]);

  useEffect(() => {
    if (user?.name && !passengerName) setPassengerName(user.name);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get("/trains", { params: { ...(from ? { from } : {}), to } })
      .then(({ data }) => {
        setTrains(data);
        if (data.length) {
          setSelectedTrain(data[0]);
          setBoarding(data[0].boardingStations?.[0] || "");
          setDropping(data[0].droppingStations?.[0] || "");
          setClassType(data[0].classes?.[0] || "3A");
        } else {
          setSelectedTrain(null);
          setBoarding("");
          setDropping("");
        }
      })
      .catch((err) => {
        setTrains([]);
        setError(err.response?.data?.message || "Unable to load trains from API.");
      })
      .finally(() => setLoading(false));
  }, [from, to]);

  const handleSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (searchForm.from.trim()) next.set("from", searchForm.from.trim());
    next.set("to", searchForm.to.trim() || "Goa");
    next.set("date", searchForm.date || new Date().toISOString().split("T")[0]);
    setParams(next);
  };

  const swapRoute = () => {
    setSearchForm((prev) => ({ ...prev, from: prev.to, to: prev.from }));
  };

  const selectTrain = (train) => {
    setSelectedTrain(train);
    setBoarding(train.boardingStations?.[0] || "");
    setDropping(train.droppingStations?.[0] || "");
    setClassType(train.classes?.[0] || "3A");
  };

  const handleBookTrain = async () => {
    if (!localStorage.getItem("yatri_token")) {
      alert("Please login first to book your train ticket.");
      navigate("/auth");
      return;
    }
    if (!selectedTrain || booking) return;
    if (!passengerName.trim()) {
      alert("Please enter passenger name.");
      return;
    }
    if (!boarding || !dropping) {
      alert("Please select boarding and dropping stations.");
      return;
    }

    setBooking(true);
    try {
      const { data } = await api.post("/bookings", {
        bookingType: "train",
        trainId: selectedTrain._id,
        seatNumber: selectedSeat,
        classType,
        boardingPoint: boarding,
        droppingPoint: dropping,
        passengerName: passengerName || user?.name || "Passenger",
        date,
        totalPrice: selectedTrain.price
      });
      navigate(`/booking-confirmation/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Train booking failed.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-sky-900 to-emerald-800 p-6 text-white shadow-xl">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Railway Reservation</span>
        <h1 className="mt-1 text-3xl font-extrabold">{from ? `Trains from ${from} to ${to}` : `Trains to ${to}`}</h1>
        <p className="mt-1 text-sm text-slate-200">Search trains by destination, choose class, station, seat, and book instantly.</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_180px_auto] md:items-end">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" /> From
            </label>
            <input
              value={searchForm.from}
              onChange={(e) => setSearchForm((prev) => ({ ...prev, from: e.target.value }))}
              placeholder="Optional: New Delhi, Mumbai, Jaipur..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button type="button" onClick={swapRoute} className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-800 md:flex" title="Swap route" aria-label="Swap route">
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-rose-500" /> To
            </label>
            <input
              value={searchForm.to}
              onChange={(e) => setSearchForm((prev) => ({ ...prev, to: e.target.value }))}
              placeholder="Goa, Jaipur, Agra..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-sky-500" /> Date
            </label>
            <input
              type="date"
              value={searchForm.date}
              onChange={(e) => setSearchForm((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-black text-white shadow-md transition hover:bg-sky-600">
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Searching available trains...</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-12 text-center text-rose-600 dark:border-rose-950 dark:bg-rose-950/20">{error}</div>
      ) : trains.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">No trains found {from ? `from ${from} to ${to}` : `to ${to}`}. Add this train route from Admin, or search another route.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {trains.map((train) => (
              <div key={train._id} className={`rounded-2xl border bg-white p-5 shadow-sm transition dark:bg-slate-900 ${selectedTrain?._id === train._id ? "border-sky-500 ring-2 ring-sky-500/20" : "border-slate-200 dark:border-slate-800"}`}>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      <Star className="h-3 w-3 fill-current text-amber-500" /> {train.rating}
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{train.trainName}</h3>
                    <p className="text-xs font-semibold text-slate-400">#{train.trainNumber} • {train.trainType}</p>
                    <p className="mt-2 text-xs font-semibold text-sky-600 dark:text-sky-300">{train.availableSeats} seats available via API</p>
                  </div>

                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{train.departureTime}</p>
                      <p className="text-xs text-slate-400">{train.from}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400">{train.duration}</span>
                      <div className="my-1 h-0.5 w-20 bg-sky-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{train.arrivalTime}</p>
                      <p className="text-xs text-slate-400">{train.to}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">Rs. {train.price}</p>
                    <button onClick={() => selectTrain(train)} className="mt-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-sky-600">
                      {selectedTrain?._id === train._id ? "Selected" : "Select Train"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24 lg:h-fit">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Train Ticket</h2>
            {selectedTrain ? (
              <div className="mt-4 space-y-4">
                <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Passenger name" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white" />

                <select value={classType} onChange={(e) => setClassType(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
                  {(selectedTrain.classes || ["SL", "3A", "2A"]).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {["T-11", "T-12", "T-13", "T-14", "T-21", "T-22", "T-23", "T-24"].map((seat) => (
                    <button key={seat} onClick={() => setSelectedSeat(seat)} className={`rounded-lg border py-1.5 text-xs font-bold transition ${selectedSeat === seat ? "border-sky-500 bg-sky-500 text-white" : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"}`}>{seat}</button>
                  ))}
                </div>

                <select value={boarding} onChange={(e) => setBoarding(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
                  {(selectedTrain.boardingStations || []).map((station) => <option key={station} value={station}>{station}</option>)}
                </select>
                <select value={dropping} onChange={(e) => setDropping(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
                  {(selectedTrain.droppingStations || []).map((station) => <option key={station} value={station}>{station}</option>)}
                </select>

                <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold text-slate-500"><span>Base fare</span><span>Rs. {selectedTrain.price}</span></div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500"><span>Platform fee</span><span>Rs. {trainPlatformFee}</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm font-semibold">Total Price</span><span className="text-xl font-black text-sky-600 dark:text-sky-400">Rs. {(selectedTrain.price + trainPlatformFee).toLocaleString("en-IN")}</span></div>
                </div>

                <button onClick={handleBookTrain} disabled={booking || !selectedTrain.availableSeats} className="w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-sky-600">
                  {booking ? "Creating booking..." : `Confirm Train Ticket (${classType}, ${selectedSeat})`}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-xs italic text-slate-400">Select a train to choose class, seat, and stations.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
