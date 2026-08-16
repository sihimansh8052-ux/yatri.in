import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Calendar, CalendarCheck, Heart, MapPin, MessageSquare, Star, Users, Wallet } from "lucide-react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";
import MapView from "../components/MapView";
import ChatPanel from "../components/ChatPanel";

export default function DetailsPage({ user, onUserRefresh }) {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [error, setError] = useState("");
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Rooms list and selected room states
  const [rooms, setRooms] = useState([]);
  const [roomsError, setRoomsError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Booking states
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [date, setDate] = useState("");
  const [durationDays, setDurationDays] = useState(1);
  const [guests, setGuests] = useState(1);
  
  // Custom integrated checkout modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(0);
  const [checkoutPayload, setCheckoutPayload] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("stripe"); // stripe, wallet
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardName, setCardName] = useState("Vikram Malhotra");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const shouldFocusBooking = searchParams.get("book") === "1";

  useSeo(item ? `${item.name} | Yatri.in` : "Details | Yatri.in");

  const getResourceUrl = () => {
    if (type === "guide") return `/users/guides/${id}`;
    if (type === "place") return `/places/${id}`;
    return `/${type}s/${id}`;
  };

  const loadItem = async () => {
    try {
      const url = getResourceUrl();
      const { data } = await api.get(url);
      setItem({ ...data, entityType: type });

      if (type === "hotel") {
        try {
          const { data: roomList } = await api.get(`/hotels/${id}/rooms`);
          setRooms(roomList);
          setRoomsError("");
          if (roomList.length > 0) {
            setSelectedRoom(roomList[0]);
          }
        } catch (_roomError) {
          setRooms([]);
          setSelectedRoom(null);
          setRoomsError("Unable to load hotel rooms from API.");
        }
      }
      
      // Load nearby places if coordinates exist
      if (data.location?.coordinates) {
        const [lng, lat] = data.location.coordinates;
        const response = await api.get("/discover/nearby", {
          params: { lat, lng, radius: 25000 }
        });
        // Filter out current item
        const list = response.data.filter((n) => n._id !== id);
        setNearby(list.slice(0, 4));
      }
    } catch (_error) {
      setError("Unable to load details.");
    }
  };

  useEffect(() => {
    loadItem();
    setShowChat(false);
  }, [type, id]);

  const savePlace = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    await api.post("/users/saved", { placeId: id, placeType: type });
    onUserRefresh?.();
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) return;
    setSubmittingReview(true);
    try {
      const url = type === "guide" ? `/users/guides/${id}/reviews` : `${getResourceUrl()}/reviews`;
      await api.post(url, review);
      setReview({ rating: 5, comment: "" });
      await loadItem();
    } catch (err) {
      console.error("Failed to post review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Integrated payment checkout handler
  const handleBooking = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    if (type === "hotel" && user.role !== "traveler") {
      alert("Please login as a traveler to book a hotel stay.");
      return;
    }

    const isHotel = type === "hotel";
    let totalPrice = 0;

    if (isHotel) {
      if (!checkIn || !checkOut) {
        alert("Please select check-in and check-out dates");
        return;
      }
      if (new Date(checkOut).getTime() <= new Date(checkIn).getTime()) {
        alert("Check-out date must be after check-in date");
        return;
      }
      if (!selectedRoom) {
        alert("Please select a room layout first");
        return;
      }
      const nights = Math.max(
        1,
        Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
      );
      totalPrice = nights * selectedRoom.pricePerNight + 99;
    } else {
      if (!date) {
        alert("Please select a tour booking date");
        return;
      }
      totalPrice = durationDays * item.pricePerDay;
    }

    const payload = isHotel
      ? { bookingType: "hotel", hotelId: id, roomId: selectedRoom._id, hotelName: item.name, roomType: selectedRoom.type, checkIn, checkOut, guests }
      : { bookingType: "guide", guideId: id, date, durationDays, guests };

    setCheckoutPayload(payload);
    setCheckoutPrice(totalPrice);
    setShowCheckoutModal(true);
  };

  const handleProcessCustomPayment = async (e) => {
    e.preventDefault();
    setPaymentProcessing(true);
    setBookingError("");
    setTimeout(async () => {
      try {
        const txId = paymentMethod === "stripe" 
          ? `pay_stripe_${Math.random().toString(36).slice(2, 8).toUpperCase()}`
          : `pay_wallet_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        const { data } = await api.post("/bookings", {
          ...checkoutPayload,
          paymentId: txId,
          totalPrice: checkoutPrice
        });
        
        setShowCheckoutModal(false);
        setPaymentProcessing(false);
        navigate(`/booking-confirmation/${data._id}`);
      } catch (err) {
        const message = err.response?.data?.message || "Payment authorization failed. Check your wallet balance.";
        setBookingError(message);
        alert(message);
        setPaymentProcessing(false);
      }
    }, 1500);
  };

  if (error) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-sm text-rose-500">{error}</div>;
  }

  if (!item) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-sm text-slate-500">Loading details...</div>;
  }

  const isHotel = type === "hotel";
  const isGuide = type === "guide";
  const address = isGuide ? `${item.city}, ${item.state}` : item.address;
  const price = isHotel ? item.pricePerNight : item.pricePerDay;
  const selectedNights = isHotel && checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const estimatedHotelTotal = selectedRoom ? selectedNights * selectedRoom.pricePerNight : price || 0;
  const hotelPlatformFee = isHotel ? 99 : 0;
  const estimatedCheckoutTotal = estimatedHotelTotal + hotelPlatformFee;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <img
            src={
              item.images?.[0] ||
              item.profilePhoto ||
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            }
            alt={item.name}
            className="h-[420px] w-full rounded-2xl object-cover shadow-md"
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <span className="inline-block rounded bg-sky-100 dark:bg-sky-950 px-2 py-0.5 text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                  {type === "place" ? "attraction" : type}
                </span>
                <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{item.name}</h1>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.description || item.bio}</p>
              </div>
              <div className="flex gap-2">
                {isGuide && (
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-sky-600 transition"
                  >
                    <MessageSquare className="h-4 w-4" /> Chat
                  </button>
                )}
                <button
                  onClick={savePlace}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 transition"
                >
                  <Heart className="h-4 w-4 text-rose-500 fill-current" /> Save
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-500">
                <Star className="h-4 w-4 fill-current" /> {item.rating || 4.5}
              </span>
              {price && (
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                  <Wallet className="h-4 w-4 text-sky-500" /> Rs. {price} / {isHotel ? "night" : "day"}
                </span>
              )}
              {isGuide && (
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  Experience: {item.experience} years
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <MapPin className="h-4 w-4 text-sky-500" /> {address}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(item.amenities || item.languagesSpoken || item.cuisine || item.tags || []).map((detail) => (
                <span
                  key={detail}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  {detail}
                </span>
              ))}
            </div>

            {item.bestTimeToVisit && (
              <p className="mt-5 text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-300">Best time to visit:</span> {item.bestTimeToVisit}
              </p>
            )}
          </div>

          {/* Chat Floating Overlay */}
          {showChat && (
            <div className="fixed bottom-6 right-6 z-50">
              <ChatPanel guide={item} onClose={() => setShowChat(false)} />
            </div>
          )}

          {/* Reviews list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Traveler reviews & ratings</h2>
            <div className="mt-4 space-y-4">
              {(item.reviews || []).length ? (
                item.reviews.map((reviewItem) => (
                  <div key={reviewItem._id} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{reviewItem.user?.name || "Traveler"}</p>
                      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" /> {reviewItem.rating}/5
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{reviewItem.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No reviews posted yet.</p>
              )}
            </div>

            {user && (
              <form onSubmit={submitReview} className="mt-6 space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add your review</p>
                <div className="flex gap-4">
                  <select
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950"
                    value={review.rating}
                    onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map((score) => (
                      <option key={score} value={score}>{score} stars</option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950"
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  placeholder="What did you like or dislike?"
                  required
                />
                <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600 transition" disabled={submittingReview}>
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          {/* Booking Card Form */}
          {(isHotel || isGuide) && (
            <div className={`rounded-2xl border-2 bg-gradient-to-b from-sky-50/50 to-white p-5 shadow-lg dark:from-sky-950/20 dark:to-slate-900 ${shouldFocusBooking && isHotel ? "border-emerald-400 ring-4 ring-emerald-100 dark:ring-emerald-950/50" : "border-sky-500/25"}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-500 p-2 text-white">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isHotel ? "Book this hotel" : "Book reservation"}</h3>
                  <p className="text-xs text-slate-500 mt-1">{isHotel ? "Choose a room, dates, and guests to confirm your stay." : "Payment processed securely in test mode."}</p>
                </div>
              </div>
              {isHotel && (
                <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-[11px] font-semibold text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                  Hotel details, room inventory, and booking creation are connected to the backend API.
                </p>
              )}

              <form onSubmit={handleBooking} className="mt-4 space-y-4">
                {isHotel && rooms.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Select Room Type</label>
                    <select
                      value={selectedRoom?._id || ""}
                      onChange={(e) => {
                        const found = rooms.find((r) => r._id === e.target.value);
                        if (found) setSelectedRoom(found);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    >
                      {rooms.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.type} - Rs. {r.pricePerNight}/night ({r.capacity} Guests)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isHotel && roomsError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:border-rose-950 dark:bg-rose-950/20">
                    {roomsError}
                  </div>
                )}

                {isHotel ? (
                  <div className="grid gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Check In</label>
                      <input
                        type="date"
                        required
                        value={checkIn}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Check Out</label>
                      <input
                        type="date"
                        required
                        value={checkOut}
                        min={checkIn || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Tour Date</label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Duration (Days)</label>
                      <select
                        value={durationDays}
                        onChange={(e) => setDurationDays(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <option key={d} value={d}>{d} {d > 1 ? "Days" : "Day"}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Number of Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>{g} {g > 1 ? "Guests" : "Guest"}</option>
                    ))}
                  </select>
                </div>

                {isHotel && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">Estimated stay total</span>
                      <span className="text-base font-black">Rs. {estimatedCheckoutTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="mt-1 text-[11px]">
                      Room Rs. {estimatedHotelTotal.toLocaleString("en-IN")} + Rs. {hotelPlatformFee} platform fee • {selectedRoom?.type || "Selected room"} • {selectedNights} {selectedNights > 1 ? "nights" : "night"}
                    </p>
                  </div>
                )}

                {bookingError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:border-rose-950 dark:bg-rose-950/20">
                    {bookingError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isHotel && (!rooms.length || Boolean(roomsError))}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-600"
                >
                  {isHotel ? "Continue to hotel booking" : "Continue to payment"}
                </button>
              </form>
            </div>
          )}

          {/* Map view */}
          {item.location?.coordinates && (
            <MapView
              center={{ lat: item.location.coordinates[1], lng: item.location.coordinates[0] }}
              places={[item]}
            />
          )}

          {/* Nearby Suggestions panel */}
          {nearby.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <h3 className="text-base font-bold text-slate-950 dark:text-white mb-4">Nearby things to check out</h3>
              <div className="space-y-3">
                {nearby.map((nearItem) => (
                  <Link
                    key={nearItem._id}
                    to={`/details/${nearItem.category === "hotel" ? "hotel" : nearItem.category === "restaurant" ? "restaurant" : "place"}/${nearItem._id}`}
                    className="flex gap-3 items-center rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-950 transition border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                  >
                    <img
                      src={nearItem.images?.[0] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"}
                      alt={nearItem.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{nearItem.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{nearItem.category || nearItem.type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Checkout Modal Overlay */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 text-xs text-slate-800 dark:text-slate-200">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 border-b pb-2">
              Secure Checkout & Booking Payment
            </h3>
            
            <div className="mb-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Price Due</span>
              <p className="text-2xl font-black text-sky-500">Rs. {checkoutPrice.toLocaleString("en-IN")}</p>
            </div>

            <form onSubmit={handleProcessCustomPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-center font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`rounded-xl py-2.5 border transition ${
                    paymentMethod === "stripe" 
                      ? "bg-sky-500 text-white border-sky-500" 
                      : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800"
                  }`}
                >
                  Stripe Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`rounded-xl py-2.5 border transition ${
                    paymentMethod === "wallet" 
                      ? "bg-sky-500 text-white border-sky-500" 
                      : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800"
                  }`}
                >
                  Yatri Wallet
                </button>
              </div>

              {paymentMethod === "stripe" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 mb-1">Cardholder Name</label>
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-955 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 mb-1">Card Number (Simulated)</label>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-955 dark:text-white"
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  <p>Payment will be deducted directly from your traveler wallet balance. Ensure you have topped up in the Payments dashboard.</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-1/3 rounded-xl border border-slate-300 py-2.5 font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-2/3 rounded-xl bg-sky-500 py-2.5 font-black text-white hover:bg-sky-600 transition flex items-center justify-center"
                >
                  {paymentProcessing ? "Authorizing..." : "Confirm & Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
