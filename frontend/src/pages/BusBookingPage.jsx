import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeftRight, CalendarDays, MapPin, Search, Star } from "lucide-react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";

export default function BusBookingPage({ user }) {
  useSeo("Bus Search & Booking | Yatri.in");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState("L-4");
  const [boarding, setBoarding] = useState("");
  const [dropping, setDropping] = useState("");
  const [passengerName, setPassengerName] = useState(user?.name || "");

  const from = params.get("from") || "";
  const to = params.get("to") || "Jaipur";
  const date = params.get("date") || new Date().toISOString().split("T")[0];
  const [searchForm, setSearchForm] = useState({ from, to, date });

  useEffect(() => {
    setSearchForm({ from, to, date });
  }, [from, to, date]);

  useEffect(() => {
    if (user?.name && !passengerName) {
      setPassengerName(user.name);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get("/buses", { params: { ...(from ? { from } : {}), to } })
      .then(({ data }) => {
        setBuses(data);
        if (data.length > 0) {
          setSelectedBus(data[0]);
          setBoarding(data[0].boardingPoints?.[0] || "");
          setDropping(data[0].droppingPoints?.[0] || "");
        } else {
          setSelectedBus(null);
          setBoarding("");
          setDropping("");
        }
      })
      .catch((err) => {
        setBuses([]);
        setError(err.response?.data?.message || "Unable to load buses from API.");
      })
      .finally(() => setLoading(false));
  }, [from, to]);

  const handleBookBus = async () => {
    if (!localStorage.getItem("yatri_token")) {
      alert("Please login first to book your bus ticket.");
      navigate("/auth");
      return;
    }
    if (!selectedBus || booking) return;
    if (!passengerName.trim()) {
      alert("Please enter passenger name.");
      return;
    }
    if (!boarding || !dropping) {
      alert("Please select boarding and dropping points.");
      return;
    }
    setBooking(true);
    try {
      const { data } = await api.post("/bookings", {
        bookingType: "bus",
        busId: selectedBus._id,
        seatNumber: selectedSeat,
        boardingPoint: boarding,
        droppingPoint: dropping,
        passengerName: passengerName || user?.name || "Passenger",
        date: date,
        totalPrice: selectedBus.price
      });
      navigate(`/booking-confirmation/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Bus booking failed.");
    } finally {
      setBooking(false);
    }
  };
  const busPlatformFee = 29;

  const handleSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (searchForm.from.trim()) next.set("from", searchForm.from.trim());
    next.set("to", searchForm.to.trim() || "Jaipur");
    next.set("date", searchForm.date || new Date().toISOString().split("T")[0]);
    setParams(next);
  };

  const swapRoute = () => {
    setSearchForm((prev) => ({ ...prev, from: prev.to, to: prev.from }));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-slate-900 p-6 text-white shadow-xl mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Intercity Bus Reservation</span>
        <h1 className="text-3xl font-extrabold mt-1">{from ? `Buses from ${from} to ${to}` : `Buses to ${to}`}</h1>
        <p className="text-sm text-slate-300 mt-1">AC Sleeper, Volvo Luxury & Express buses with live seat selection.</p>
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_180px_auto] md:items-end">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" /> From
            </label>
            <input
              value={searchForm.from}
              onChange={(e) => setSearchForm((prev) => ({ ...prev, from: e.target.value }))}
              placeholder="Optional: New Delhi, Jaipur, Mumbai..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={swapRoute}
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-800 md:flex"
            title="Swap route"
            aria-label="Swap route"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-rose-500" /> To
            </label>
            <input
              value={searchForm.to}
              onChange={(e) => setSearchForm((prev) => ({ ...prev, to: e.target.value }))}
              placeholder="Jaipur, Goa, Agra..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-black text-white shadow-md transition hover:bg-emerald-600"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Searching available buses...</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-12 text-center text-rose-600 dark:border-rose-950 dark:bg-rose-950/20">
          {error}
        </div>
      ) : buses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          No buses found {from ? `from ${from} to ${to}` : `to ${to}`}. Add this route from Admin, or search another route.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
            {buses.map((bus) => (
              <div
                key={bus._id}
                className={`rounded-2xl border p-5 bg-white dark:bg-slate-900 transition shadow-sm ${
                  selectedBus?._id === bus._id
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2 py-0.5">
                      <Star className="h-3 w-3 fill-current text-amber-500" /> {bus.rating}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{bus.operatorName}</h3>
                    <p className="text-xs text-slate-400 font-semibold">{bus.busType}</p>
                    <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                      {bus.availableSeats} seats available via API
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{bus.departureTime}</p>
                      <p className="text-xs text-slate-400">{bus.from}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400">{bus.duration}</span>
                      <div className="w-20 h-0.5 bg-emerald-500 relative my-1" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{bus.arrivalTime}</p>
                      <p className="text-xs text-slate-400">{bus.to}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">Rs. {bus.price}</p>
                    <button
                      onClick={() => {
                        setSelectedBus(bus);
                        setBoarding(bus.boardingPoints?.[0] || "");
                        setDropping(bus.droppingPoints?.[0] || "");
                      }}
                      className="mt-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                    >
                      {selectedBus?._id === bus._id ? "Select Seats" : "View Seats"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Seat Layout & Points selector */}
            <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-md sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bus Seat Selector</h2>
              {selectedBus ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Passenger Name</label>
                    <input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Enter passenger name"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Lower Deck Seats</label>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {["L-1", "L-2", "L-3", "L-4", "L-5", "L-6", "L-7", "L-8"].map((seat) => (
                        <button
                          key={seat}
                          onClick={() => setSelectedSeat(seat)}
                          className={`rounded-lg py-1.5 text-xs font-bold border transition ${
                            selectedSeat === seat
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                          }`}
                        >
                          {seat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Boarding Point</label>
                    <select
                      value={boarding}
                      onChange={(e) => setBoarding(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                    >
                      {(selectedBus.boardingPoints || []).map((pt) => (
                        <option key={pt} value={pt}>{pt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Dropping Point</label>
                    <select
                      value={dropping}
                      onChange={(e) => setDropping(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                    >
                      {(selectedBus.droppingPoints || []).map((pt) => (
                        <option key={pt} value={pt}>{pt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Base fare</span>
                      <span>Rs. {selectedBus.price}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Platform fee</span>
                      <span>Rs. {busPlatformFee}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Total Price</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {(selectedBus.price + busPlatformFee).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBookBus}
                    disabled={booking || !selectedBus?.availableSeats}
                    className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 transition"
                  >
                    {booking ? "Creating booking..." : `Confirm Bus Ticket (Seat ${selectedSeat})`}
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400 italic">Select a bus operator to choose seats and boarding points.</p>
              )}
            </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
