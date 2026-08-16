import { useEffect, useState } from "react";
import { Hotel, Plus, Wallet, Star, Calendar, CheckCircle2 } from "lucide-react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";

export default function HotelOwnerPage({ user }) {
  useSeo("Hotel Owner Portal | Yatri.in");
  const [hotels, setHotels] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState(null);
  const [hotelRooms, setHotelRooms] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [form, setForm] = useState({
    name: "Grand Horizon Palace",
    city: "Jaipur",
    address: "Bani Park, Jaipur",
    pricePerNight: "4500",
    rating: "4.8",
    description: "Luxury heritage stay with swimming pool and rooftop dining."
  });
  const [roomForm, setRoomForm] = useState({
    type: "Deluxe Room",
    pricePerNight: "3500",
    capacity: "2",
    beds: "1",
    availability: true
  });

  const [activeTab, setActiveTab] = useState("overview");

  const [coupons, setCoupons] = useState([
    { code: "YATRI15", discount: 15, type: "percentage", active: true },
    { code: "WELCOME20", discount: 20, type: "percentage", active: true }
  ]);
  const [couponForm, setCouponForm] = useState({ code: "", discount: "15" });

  const [foodPartners, setFoodPartners] = useState([
    { name: "Sharma Chaat Bhandar", type: "Street Food", distance: "0.2 km", recommendation: "Highly recommended for spicy golgappas." },
    { name: "Rawat Mishthan Bhandar", type: "Dessert Shop", distance: "0.8 km", recommendation: "Famous for Onion Pyaz Kachoris and sweet Ghevar." }
  ]);
  const [partnerForm, setPartnerForm] = useState({ name: "", type: "Street Food", distance: "0.5 km", recommendation: "" });

  const [reservations, setReservations] = useState([
    { id: "109", guest: "Rohan Varma", hotel: "Grand Horizon Palace", room: "Deluxe Room", dates: "Aug 12 - Aug 15", amount: "Rs. 10,500", status: "Confirmed" },
    { id: "110", guest: "Kriti Sharma", hotel: "Grand Horizon Palace", room: "Luxury Suite", dates: "Aug 16 - Aug 19", amount: "Rs. 24,000", status: "Pending" }
  ]);

  // Host Reviews States
  const [reviews, setReviews] = useState([
    { id: "1", author: "Siddharth S.", rating: 5, comment: "Fabulous stay, the staff was extremely friendly and room service was prompt.", hotel: "Grand Horizon Palace", date: "July 28, 2026", reply: "", reported: false },
    { id: "2", author: "Neha G.", rating: 4, comment: "Clean rooms and beautiful rooftop dining. Recommended!", hotel: "Grand Horizon Palace", date: "July 26, 2026", reply: "", reported: false }
  ]);
  const [reviewReplyText, setReviewReplyText] = useState({});
  const [reviewsFilter, setReviewsFilter] = useState("all");

  // Host AI Assistant States
  const [hostAiQuery, setHostAiQuery] = useState("");
  const [hostAiChat, setHostAiChat] = useState([
    { role: "assistant", content: "Hello! I am your Yatri Host AI Advisor. Ask me anything about pricing optimization, occupancies, or review feedback!" }
  ]);
  const [loadingHostAi, setLoadingHostAi] = useState(false);

  const triggerHostAi = async (queryText) => {
    setLoadingHostAi(true);
    setHostAiChat(prev => [...prev, { role: "user", content: queryText }]);
    try {
      const response = await api.post("/assistant/chat", {
        message: `As a hotel owner on Yatri.in, answer my query: "${queryText}". Suggest business optimizations.`
      });
      setHostAiChat(prev => [...prev, { role: "assistant", content: response.data.reply }]);
    } catch (_) {
      let reply = "Here is optimization advice: Your Deluxe Suite rooms are currently booked at 90% occupancy. We suggest a 10-15% pricing increase during weekend demand surges.";
      if (queryText.toLowerCase().includes("pricing")) {
        reply = " Jaipurs average hotel rates peak at Rs. 4,800 in August. Aligning your Deluxe Suite rates to Rs. 4,600 with coupon WELCOME20 will yield maximum returns.";
      } else if (queryText.toLowerCase().includes("reviews") || queryText.toLowerCase().includes("customer")) {
        reply = "Review sentiment analysis highlights clean bedding (4.9/5) but notes occasional Wi-Fi disconnects. We recommend upgrading room routers.";
      }
      setHostAiChat(prev => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setLoadingHostAi(false);
    }
  };

  const handleReplyReview = (id, text) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, reply: text } : r));
    setReviewReplyText({ ...reviewReplyText, [id]: "" });
  };

  const handleReportReview = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, reported: true } : r));
  };

  const loadHotels = async () => {
    try {
      const { data } = await api.get("/hotels");
      setHotels(data);
    } catch (err) {
      setHotels([]);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const handleAddHotel = async (e) => {
    e.preventDefault();
    try {
      await api.post("/hotels", {
        ...form,
        pricePerNight: Number(form.pricePerNight),
        rating: Number(form.rating),
        category: "hotel",
        entityType: "hotel"
      });
      setShowAddModal(false);
      await loadHotels();
    } catch (err) {
      alert("Failed to add hotel.");
    }
  };

  const handleManageRooms = async (hotel) => {
    setSelectedHotelForRooms(hotel);
    try {
      const { data } = await api.get(`/hotels/${hotel._id}/rooms`);
      setHotelRooms(data);
      setShowRoomModal(true);
    } catch (err) {
      alert("Failed to fetch rooms list.");
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!selectedHotelForRooms) return;
    try {
      await api.post(`/hotels/${selectedHotelForRooms._id}/rooms`, {
        ...roomForm,
        pricePerNight: Number(roomForm.pricePerNight),
        capacity: Number(roomForm.capacity),
        beds: Number(roomForm.beds)
      });
      const { data } = await api.get(`/hotels/${selectedHotelForRooms._id}/rooms`);
      setHotelRooms(data);
      setRoomForm({
        type: "Deluxe Room",
        pricePerNight: "3500",
        capacity: "2",
        beds: "1",
        availability: true
      });
    } catch (err) {
      alert("Failed to add room layout.");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!selectedHotelForRooms) return;
    try {
      await api.delete(`/hotels/${selectedHotelForRooms._id}/rooms/${roomId}`);
      const { data } = await api.get(`/hotels/${selectedHotelForRooms._id}/rooms`);
      setHotelRooms(data);
    } catch (err) {
      alert("Failed to delete room layout.");
    }
  };

  const handleUpdateStatus = (resId, nextStatus) => {
    setReservations(reservations.map(r => r.id === resId ? { ...r, status: nextStatus } : r));
  };

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code) return;
    setCoupons([...coupons, { code: couponForm.code.toUpperCase(), discount: Number(couponForm.discount), type: "percentage", active: true }]);
    setCouponForm({ code: "", discount: "15" });
  };

  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!partnerForm.name) return;
    setFoodPartners([...foodPartners, { ...partnerForm }]);
    setPartnerForm({ name: "", type: "Street Food", distance: "0.5 km", recommendation: "" });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Hotel Partner Portal</span>
          <h1 className="text-3xl font-extrabold mt-1">Property & Inventory Control</h1>
          <p className="text-sm text-slate-300 mt-1">Manage rooms, rate plans, guest check-ins, and monthly revenue metrics.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-sky-600 transition"
        >
          <Plus className="h-4 w-4" /> Add New Property
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 text-xs font-bold">
        {[
          ["overview", "Overview"],
          ["hotels", "My Properties"],
          ["reservations", "Guest Bookings"],
          ["coupons", "Promo Coupons"],
          ["food_partners", "Local Culinary Partners"],
          ["reviews", "Customer Reviews"],
          ["analytics", "Revenue Analytics"],
          ["ai_assistant", "AI Business Assistant"]
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-lg px-4 py-2.5 transition ${activeTab === key ? "bg-sky-500 text-white shadow" : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-200"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-xs text-slate-400 font-bold">Total Properties</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{hotels.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-xs text-slate-400 font-bold">Occupancy Rate</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">84%</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-xs text-slate-400 font-bold">Today's Check-ins</p>
              <p className="text-3xl font-black text-amber-500 mt-2">12</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-xs text-slate-400 font-bold">Monthly Revenue</p>
              <p className="text-3xl font-black text-sky-600 mt-2">Rs. 1,48,200</p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/30">
            <h3 className="text-sm font-bold text-sky-900 dark:text-sky-400 mb-3 flex items-center gap-2">
              💡 AI Business Growth Insights
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <p>• **Demand Surge Advisory:** An upcoming literature festival is expected to increase hotel occupancy by **35%** starting next Tuesday. We suggest raising Deluxe Room rates by 12% to capture premium margins.</p>
              <p>• **Weekend Promo Opportunity:** Standard rooms saw a decline in weekend stays. Offering a weekend promo coupon code (e.g. `WEEKEND10`) can boost checkout conversion rates.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "hotels" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Property Listings</h2>
          <div className="space-y-3">
            {hotels.map((hotel) => (
              <div key={hotel._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945"}
                    alt={hotel.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white">{hotel.name}</h3>
                    <p className="text-xs text-slate-400">{hotel.city} • Rs. {hotel.pricePerNight}/night</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleManageRooms(hotel)}
                    className="rounded-lg bg-sky-500 hover:bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white transition"
                  >
                    Manage Rooms
                  </button>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "reservations" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Guest Reservations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Booking ID</th>
                  <th className="pb-3 font-bold">Guest</th>
                  <th className="pb-3 font-bold">Hotel / Room</th>
                  <th className="pb-3 font-bold">Dates</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reservations.map((res) => (
                  <tr key={res.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-4 font-mono font-bold text-sky-500">#{res.id}</td>
                    <td className="py-4 font-extrabold">{res.guest}</td>
                    <td className="py-4">
                      <p className="font-bold">{res.hotel}</p>
                      <p className="text-[10px] text-slate-400">{res.room}</p>
                    </td>
                    <td className="py-4">{res.dates}</td>
                    <td className="py-4 font-bold">{res.amount}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${res.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" : res.status === "Checked In" ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"}`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-1.5 font-bold">
                      {res.status === "Pending" && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, "Confirmed")}
                          className="bg-emerald-500 text-white rounded px-2.5 py-1 hover:bg-emerald-600 transition"
                        >
                          Confirm
                        </button>
                      )}
                      {res.status === "Confirmed" && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, "Checked In")}
                          className="bg-sky-500 text-white rounded px-2.5 py-1 hover:bg-sky-600 transition"
                        >
                          Check In
                        </button>
                      )}
                      {res.status === "Checked In" && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, "Checked Out")}
                          className="bg-slate-500 text-white rounded px-2.5 py-1 hover:bg-slate-600 transition"
                        >
                          Check Out
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(res.id, "Cancelled")}
                        className="bg-red-50 text-red-600 rounded px-2.5 py-1 hover:bg-red-100 transition"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "coupons" && (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Create Promotion Coupon</h3>
            <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Coupon Code</label>
                <input
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  placeholder="E.g. SAVE20"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Discount Value (%)</label>
                <input
                  type="number"
                  value={couponForm.discount}
                  onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
              <button className="w-full rounded-xl bg-emerald-500 py-2.5 text-white font-bold hover:bg-emerald-600 transition">
                Create Coupon
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Active Promotional Coupons</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {coupons.map((c) => (
                <div key={c.code} className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-black text-sky-500 text-sm tracking-wider">{c.code}</span>
                    <p className="text-slate-400 mt-0.5">{c.discount}% Discount • Status: Active</p>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "food_partners" && (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Endorse Local Partner</h3>
            <form onSubmit={handleAddPartner} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Establishment Name</label>
                <input
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  placeholder="E.g. Rawat Mishthan Bhandar"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Category</label>
                  <select
                    value={partnerForm.type}
                    onChange={(e) => setPartnerForm({ ...partnerForm, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  >
                    {["Street Food", "Cafe", "Restaurant", "Tea Stall", "Dessert Shop"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Distance</label>
                  <input
                    value={partnerForm.distance}
                    onChange={(e) => setPartnerForm({ ...partnerForm, distance: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">AI Recommendation Detail</label>
                <textarea
                  value={partnerForm.recommendation}
                  onChange={(e) => setPartnerForm({ ...partnerForm, recommendation: e.target.value })}
                  placeholder="Explain why guests should visit this stall..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  rows={3}
                  required
                />
              </div>
              <button className="w-full rounded-xl bg-emerald-500 py-2.5 text-white font-bold hover:bg-emerald-600 transition">
                Recommend Partner
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Your Recommended Culinary Highlights</h3>
            <div className="space-y-3">
              {foodPartners.map((p) => (
                <div key={p.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-xs flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-950 dark:text-white">{p.name}</span>
                      <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-bold">{p.type}</span>
                    </div>
                    <p className="text-slate-500 mt-1 font-semibold">💡 {p.recommendation}</p>
                  </div>
                  <span className="font-bold text-slate-400 whitespace-nowrap">{p.distance} away</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Reviews & Ratings</h2>
              <div className="flex gap-2 text-xs">
                {["all", "reported"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setReviewsFilter(f)}
                    className={`px-3 py-1.5 rounded-lg border font-bold capitalize ${reviewsFilter === f ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-50 text-slate-500"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {reviews
                .filter(r => reviewsFilter === "all" || (reviewsFilter === "reported" && r.reported))
                .map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white">{r.author}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{r.hotel} • {r.date}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        ★ {r.rating}
                      </div>
                    </div>
                    <p className="mt-2 text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{r.comment}</p>
                    
                    {r.reply && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-sky-600">Your Response:</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{r.reply}</p>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2 justify-end">
                      {!r.reply && (
                        <div className="flex gap-2 w-full max-w-md">
                          <input
                            value={reviewReplyText[r.id] || ""}
                            onChange={(e) => setReviewReplyText({ ...reviewReplyText, [r.id]: e.target.value })}
                            placeholder="Write reply to guest..."
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 outline-none text-xs dark:border-slate-700 dark:bg-slate-900"
                          />
                          <button
                            onClick={() => handleReplyReview(r.id, reviewReplyText[r.id])}
                            className="bg-sky-500 hover:bg-sky-600 text-white rounded px-3 py-1 font-bold"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleReportReview(r.id)}
                        disabled={r.reported}
                        className={`rounded px-3 py-1 font-bold ${r.reported ? "bg-red-100 text-red-800 opacity-60" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                      >
                        {r.reported ? "Reported Fake" : "Report Fake"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Daily/Weekly revenue graph */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Daily Occupancy & Booking Trends</h3>
              <div className="h-44 w-full flex items-center justify-center">
                <svg viewBox="0 0 400 150" className="w-full h-full">
                  <rect x="20" y="30" width="30" height="90" fill="#0ea5e9" rx="3" />
                  <rect x="80" y="50" width="30" height="70" fill="#0ea5e9" rx="3" />
                  <rect x="140" y="20" width="30" height="100" fill="#0ea5e9" rx="3" />
                  <rect x="200" y="40" width="30" height="80" fill="#0ea5e9" rx="3" />
                  <rect x="260" y="10" width="30" height="110" fill="#10b981" rx="3" />
                  <rect x="320" y="35" width="30" height="85" fill="#0ea5e9" rx="3" />
                  <text x="25" y="140" fill="#94a3b8" className="text-[8px] font-bold">Mon</text>
                  <text x="85" y="140" fill="#94a3b8" className="text-[8px] font-bold">Tue</text>
                  <text x="145" y="140" fill="#94a3b8" className="text-[8px] font-bold">Wed</text>
                  <text x="205" y="140" fill="#94a3b8" className="text-[8px] font-bold">Thu</text>
                  <text x="265" y="140" fill="#94a3b8" className="text-[8px] font-bold">Fri</text>
                  <text x="325" y="140" fill="#94a3b8" className="text-[8px] font-bold">Sat</text>
                </svg>
              </div>
            </div>

            {/* Performance analysis */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue Cancel Ratio</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Ratio of cancellations to booked revenues</p>
              </div>
              <div className="my-3 flex items-center justify-center relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle cx="48" cy="48" r="40" stroke="#f43f5e" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset="210" strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <p className="text-base font-black text-slate-800 dark:text-white">16%</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Cancels</p>
                </div>
              </div>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold text-center">
                ⚠️ Cancel rate went up by 2% due to rains.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ai_assistant" && (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">AI Quick Suggestions</h3>
            <div className="flex flex-col gap-2">
              {[
                "How can I increase bookings?",
                "Which rooms perform best?",
                "Suggest better pricing.",
                "Analyze customer reviews."
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => triggerHostAi(q)}
                  className="w-full text-left rounded-xl bg-slate-100 p-3 hover:bg-sky-500 hover:text-white transition text-xs font-bold text-slate-700 dark:bg-slate-950 dark:text-slate-300"
                >
                  ⚡ {q}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col h-[400px] justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2 mb-3">Host Business AI Assistant</h3>
              <div className="space-y-3 overflow-y-auto max-h-[280px] pr-2 text-xs">
                {hostAiChat.map((m, idx) => (
                  <div key={idx} className={`p-3 rounded-xl max-w-[85%] ${m.role === "user" ? "bg-sky-100 text-sky-900 ml-auto" : "bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-300"}`}>
                    <p className="font-bold text-[10px] uppercase mb-0.5">{m.role === "user" ? "You" : "Yatri AI"}</p>
                    <p className="leading-relaxed font-semibold">{m.content}</p>
                  </div>
                ))}
                {loadingHostAi && (
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 italic">
                    AI is analyzing occupancy data...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={hostAiQuery}
                onChange={(e) => setHostAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && triggerHostAi(hostAiQuery)}
                placeholder="Ask Host AI helper..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
              <button
                onClick={() => {
                  triggerHostAi(hostAiQuery);
                  setHostAiQuery("");
                }}
                className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-2 font-bold text-xs"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Add Property</h2>
            <form onSubmit={handleAddHotel} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hotel Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Price per Night (Rs)</label>
                  <input
                    type="number"
                    value={form.pricePerNight}
                    onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 rounded-xl border border-slate-300 py-2.5 text-xs font-bold dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-white hover:bg-sky-600 transition"
                >
                  Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRoomModal && selectedHotelForRooms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Manage Rooms - {selectedHotelForRooms.name}
              </h2>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-extrabold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Room lists */}
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Room Categories</p>
              {hotelRooms.length > 0 ? (
                hotelRooms.map((room) => (
                  <div key={room._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs">
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{room.type}</p>
                      <p className="text-slate-500 mt-0.5">
                        Capacity: {room.capacity} Guests • Beds: {room.beds} • Rs. {room.pricePerNight}/night
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold px-2 py-1 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No room layouts defined yet. Add one below!</p>
              )}
            </div>

            {/* Add Room Form */}
            <form onSubmit={handleAddRoom} className="mt-6 border-t pt-4 border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Room Category</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Room Type</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  >
                    {["Standard Room", "Deluxe Room", "Executive Room", "Family Room", "Luxury Suite", "Presidential Suite"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Price per Night (Rs)</label>
                  <input
                    type="number"
                    value={roomForm.pricePerNight}
                    onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Max Capacity (Guests)</label>
                  <input
                    type="number"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Number of Beds</label>
                  <input
                    type="number"
                    value={roomForm.beds}
                    onChange={(e) => setRoomForm({ ...roomForm, beds: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg transition"
              >
                Add Room Layout
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
