import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Calendar, CreditCard, Download, MapPin, Printer, Users } from "lucide-react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nearbyFood, setNearbyFood] = useState([]);

  useSeo("Booking Confirmed | Yatri.in");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get("/bookings");
        const found = data.find((b) => b._id === id);
        if (!found) {
          setError("Booking not found");
        } else {
          setBooking(found);
          if (found.bookingType === "hotel" && found.hotel?._id) {
            const foodRes = await api.get("/discover/street-food", {
              params: { hotelId: found.hotel._id }
            });
            setNearbyFood(foodRes.data.slice(0, 3));
          }
        }
      } catch (err) {
        setError("Unable to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Loading confirmation...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-600 dark:border-rose-950 dark:bg-rose-950/20">
          <p className="font-semibold text-lg">Error</p>
          <p className="mt-2 text-sm">{error || "Something went wrong."}</p>
        </div>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  const isHotel = booking.bookingType === "hotel";
  const isBus = booking.bookingType === "bus";
  const isTrain = booking.bookingType === "train";
  const isPackage = booking.bookingType === "package";
  const isGuide = booking.bookingType === "guide";

  const title = isHotel 
    ? booking.hotelName || booking.hotel?.name || "Hotel Stay"
    : isBus 
      ? booking.bus?.operatorName || "Intercity Bus"
      : isTrain
        ? booking.train?.trainName || "Train Ticket"
      : isPackage
        ? booking.package?.title || "Holiday Package"
        : booking.guide?.name || "Local Guide";

  const address = isHotel 
    ? booking.hotel?.address 
    : isBus 
      ? (booking.bus ? `${booking.bus.from} to ${booking.bus.to}` : "Intercity Bus Route")
      : isTrain
        ? (booking.train ? `${booking.train.from} to ${booking.train.to}` : "Rail Route")
      : isPackage
        ? booking.package?.destination || "Destination Hub"
        : `${booking.guide?.city || "New Delhi"}, ${booking.guide?.state || "Delhi"}`;

  const image = isHotel
    ? booking.hotel?.images?.[0]
    : isBus
      ? "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"
      : isTrain
        ? "https://images.unsplash.com/photo-1474487548417-781cb71495f3"
      : isPackage
        ? booking.package?.images?.[0]
        : booking.guide?.profilePhoto || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 print:py-0 print:px-0">
      {/* Visual Header */}
      <div className="text-center print:hidden">
        <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 fill-emerald-50 dark:fill-slate-900" />
        <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Booking Confirmed!</h1>
        <p className="mt-2 text-slate-500">Your reservation details are below. A confirmation has been saved to your profile.</p>
      </div>

      {/* Boarding Pass Ticket */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Ticket Header Image */}
        <div className="relative h-44 w-full bg-cover bg-center print:hidden" style={{ backgroundImage: `url(${image})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <span className="inline-block rounded-full bg-sky-500 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {booking.bookingType === "hotel" ? "Hotel Stay" : booking.bookingType === "bus" ? "Bus Ticket" : booking.bookingType === "train" ? "Train Ticket" : booking.bookingType === "package" ? "Holiday Package" : "Tour Guide"}
            </span>
            <h2 className="mt-2 text-2xl font-black">{title}</h2>
          </div>
        </div>

        {/* Print-only Header */}
        <div className="hidden print:block border-b p-6">
          <h1 className="text-2xl font-black">YATRI.IN BOOKING CONFIRMATION</h1>
          <p className="text-sm text-slate-500">Booking Reference: #{booking._id}</p>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left side */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reservation For</p>
                <h3 className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0 text-sky-500" /> {address}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Booking Reference</p>
                <p className="mt-1 text-base font-mono font-bold text-slate-800 dark:text-slate-200">#{booking._id}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Passenger / Traveler</p>
                <p className="mt-1 text-base font-bold text-slate-800 dark:text-slate-200">
                  {booking.passengerName || booking.user?.name || "Demo Traveler"}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {isHotel ? "Check In" : isBus || isTrain ? "Travel Date" : "Tour Date"}
                  </p>
                   <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-sky-500" />
                    {(() => {
                      const dStr = isHotel ? booking.checkIn : booking.date;
                      if (!dStr) return "N/A";
                      const d = new Date(dStr);
                      if (Number.isNaN(d.getTime())) return "N/A";
                      return d.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      });
                    })()}
                  </p>
                </div>
                {isHotel && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Check Out</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-sky-500" />
                      {(() => {
                        const dStr = booking.checkOut;
                        if (!dStr) return "N/A";
                        const d = new Date(dStr);
                        if (Number.isNaN(d.getTime())) return "N/A";
                        return d.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        });
                      })()}
                    </p>
                  </div>
                )}
                {!isHotel && !isBus && !isTrain && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Duration</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                      {booking.durationDays || 1} {booking.durationDays > 1 ? "Days" : "Day"}
                    </p>
                  </div>
                )}
                {(isBus || isTrain) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Seat Number</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                      {booking.seatNumber || "L-4"}
                    </p>
                  </div>
                )}
                {isHotel && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Room Type</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                      {booking.roomType || booking.room?.type || "Standard Room"}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Guests</p>
                  <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-sky-500" /> {booking.guests} {booking.guests > 1 ? "People" : "Person"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
                  <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bus/Train Journey details */}
          {(isBus || isTrain) && (
            <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{isTrain ? "Boarding Station" : "Boarding Point"}</p>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{booking.boardingPoint || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{isTrain ? "Dropping Station" : "Dropping Point"}</p>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{booking.droppingPoint || "N/A"}</p>
              </div>
            </div>
          )}

          {/* Payment receipt row */}
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-sky-500" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Payment Information</p>
                  <p className="text-sm font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                    Ref: {booking.paymentId || "pay_mock_direct"} (Razorpay Test Mode)
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-400 font-semibold uppercase">Amount Paid</p>
                <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
                  Rs. {booking.totalPrice?.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Perforation/Cut style row */}
        <div className="relative border-t border-dashed border-slate-200 dark:border-slate-800 h-px bg-transparent w-full print:hidden">
          <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-50 border-r border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
          <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-50 border-l border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
        </div>

        {/* Ticket Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 dark:bg-slate-900/50 flex flex-wrap gap-3 justify-between items-center print:hidden">
          <div className="flex gap-2">
            <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <Printer className="h-4 w-4" /> Print Ticket
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <Download className="h-4 w-4" /> Invoice PDF
            </button>
          </div>
          <Link to="/dashboard" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600">
            Go to User Dashboard
          </Link>
        </div>
      </div>

      {nearbyFood.length > 0 && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block rounded-full bg-luxury-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-luxury-gold mb-1.5">
                🍲 Premium Local Gastronomy
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Culinary Discoveries Near Your Hotel
              </h2>
            </div>
            <Link
              to={`/food-discovery?hotelId=${booking.hotel?._id || ""}`}
              className="text-xs font-bold text-sky-500 hover:underline"
            >
              View All ➔
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {nearbyFood.map((food) => (
              <div
                key={food._id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xs">{food.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">{food.cuisine?.slice(0, 2).join(" • ") || "Indian"}</p>
                  {food.aiReason && (
                    <p className="mt-2 text-[10px] text-sky-600 dark:text-sky-400 leading-relaxed font-semibold">
                      💡 {food.aiReason}
                    </p>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.name + " " + (food.address || ""))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block text-center rounded-lg bg-sky-500 hover:bg-sky-600 py-1 text-[10px] font-bold text-white transition"
                >
                  Locate Spot
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
