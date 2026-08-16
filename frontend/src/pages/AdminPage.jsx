import { useEffect, useState } from "react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";
import { ShieldAlert, Activity, CheckCircle, XCircle, Database, FileSpreadsheet, Server, UserCheck, AlertTriangle } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  address: "",
  city: "",
  priceLevel: "mid",
  pricePerNight: "",
  rating: "4.5",
  popularity: "80",
  images: "",
  amenities: "",
  cuisine: "",
  menuHighlights: "",
  tags: "",
  bestTimeToVisit: "",
  type: "famous",
  category: "attraction",
  lat: "28.6139",
  lng: "77.2090"
};

export default function AdminPage() {
  useSeo("Admin Dashboard | Yatri.in");
  const [section, setSection] = useState("hotels");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [revenueSummary, setRevenueSummary] = useState(null);

  // New admin controls states
  const [verifications, setVerifications] = useState([
    { id: "v1", type: "Tour Guide", name: "Amit Sharma", license: "LIC-77890", doc: "Govt-ID-Amit.pdf", status: "Pending" },
    { id: "v2", type: "Hotel Owner", name: "Vikram Singh", license: "HOTEL-2201", doc: "Property-Deed.pdf", status: "Pending" }
  ]);

  const [moderationAlerts, setModerationAlerts] = useState([
    { id: "m1", type: "Fake Review", target: "Grand Horizon Palace", content: "Best hotel in town! Click here to win cash...", score: "92% Suspicious", status: "Flagged" },
    { id: "m2", type: "Spam Profile", target: "User ID #889", content: "Selling custom flight vouchers cheaply.", score: "88% Spam Risk", status: "Flagged" }
  ]);

  const [sysMetrics, setSysMetrics] = useState({
    cpu: "32%",
    memory: "4.2 GB / 8 GB",
    redisHit: "94%",
    activeSockets: "128",
    responseTime: "42ms"
  });

  const loadItems = async () => {
    try {
      const url = ["users", "bookings"].includes(section) ? `/admin/${section}` : `/${section}`;
      const { data } = await api.get(url);
      setItems(data);
    } catch (err) {
      console.error("Failed to load admin items");
    }
  };

  const loadRevenue = async () => {
    try {
      const { data } = await api.get("/admin/revenue");
      setRevenueSummary(data);
    } catch (err) {
      console.error("Failed to load revenue summary");
    }
  };

  useEffect(() => {
    if (["hotels", "restaurants", "places", "users", "bookings"].includes(section)) {
      loadItems();
    }
    if (section === "revenue" || !revenueSummary) {
      loadRevenue();
    }
    setEditingId(null);
    setForm(emptyForm);
  }, [section]);

  const populateForm = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      address: item.address || "",
      city: item.city || "",
      priceLevel: item.priceLevel || "mid",
      pricePerNight: item.pricePerNight || "",
      rating: item.rating || "4.5",
      popularity: item.popularity || "80",
      images: (item.images || []).join(", "),
      amenities: (item.amenities || []).join(", "),
      cuisine: (item.cuisine || []).join(", "),
      menuHighlights: (item.menuHighlights || []).join(", "),
      tags: (item.tags || []).join(", "),
      bestTimeToVisit: item.bestTimeToVisit || "",
      type: item.type || "famous",
      category: item.category || (section === "places" ? "attraction" : section.slice(0, -1)),
      lat: item.location?.coordinates?.[1] || "28.6139",
      lng: item.location?.coordinates?.[0] || "77.2090"
    });
  };

  const payloadForSection = () => ({
    name: form.name,
    description: form.description,
    address: form.address,
    city: form.city,
    priceLevel: form.priceLevel,
    pricePerNight: form.pricePerNight ? Number(form.pricePerNight) : undefined,
    rating: Number(form.rating),
    popularity: Number(form.popularity),
    images: form.images.split(",").map((item) => item.trim()).filter(Boolean),
    amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
    cuisine: form.cuisine.split(",").map((item) => item.trim()).filter(Boolean),
    menuHighlights: form.menuHighlights.split(",").map((item) => item.trim()).filter(Boolean),
    tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
    bestTimeToVisit: form.bestTimeToVisit,
    type: form.type,
    category: form.category,
    location: {
      type: "Point",
      coordinates: [Number(form.lng), Number(form.lat)]
    }
  });

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = payloadForSection();
      if (section === "hotels") {
        payload.category = "hotel";
      } else if (section === "restaurants") {
        payload.category = "restaurant";
      }
      if (editingId) {
        await api.put(`/${section}/${editingId}`, payload);
      } else {
        await api.post(`/${section}`, payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadItems();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const url = ["users", "bookings"].includes(section) ? `/admin/${section}/${id}` : `/${section}/${id}`;
    await api.delete(url);
    await loadItems();
  };

  const handleRoleChange = async (userId, role) => {
    await api.patch(`/admin/users/${userId}`, { role });
    await loadItems();
  };

  const handleBookingStatusChange = async (bookingId, status) => {
    await api.patch(`/admin/bookings/${bookingId}`, { status });
    await loadItems();
  };

  const handleApproveVerification = (id) => {
    setVerifications(verifications.map(v => v.id === id ? { ...v, status: "Verified" } : v));
  };

  const handleRejectVerification = (id) => {
    setVerifications(verifications.map(v => v.id === id ? { ...v, status: "Rejected" } : v));
  };

  const handleModerationAction = (id, action) => {
    setModerationAlerts(moderationAlerts.map(m => m.id === id ? { ...m, status: action } : m));
  };

  const triggerCsvExport = (reportType) => {
    const headers = "TransactionID,User,Amount,Status,Timestamp\n";
    const data = `TXN-8802,Vikram Kumar,3500,Success,2026-07-29T10:00:00Z\nTXN-9021,Neha Sen,4800,Success,2026-07-30T11:30:00Z`;
    const blob = new Blob([headers + data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `${reportType}_report.csv`);
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* KPI Panels Header */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Platform Revenue</span>
          <p className="text-3xl font-black text-emerald-500 mt-2">
            Rs. {(revenueSummary?.totals?.platformRevenue || 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Guides</span>
          <p className="text-3xl font-black text-amber-500 mt-2">
            {verifications.filter(v => v.status === "Pending" && v.type === "Tour Guide").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Sockets</span>
          <p className="text-3xl font-black text-sky-500 mt-2">{sysMetrics.activeSockets}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Server Status</span>
          <p className="text-3xl font-black text-emerald-500 mt-2 flex items-center gap-1.5">
            <span className="h-4.5 w-4.5 bg-emerald-500 rounded-full animate-pulse" /> Healthy
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Navigation Sidebar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 h-fit shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Console Sections</h2>
          <div className="grid gap-1">
            {[
              ["hotels", "Manage Hotels"],
              ["restaurants", "Manage Restaurants"],
              ["places", "Manage Places"],
              ["users", "User Directory"],
              ["bookings", "Transactions Logs"],
              ["revenue", "Revenue Engine"],
              ["verifications", "Verification Desk"],
              ["system_metrics", "Live System Monitor"],
              ["moderation", "AI Moderation Logs"],
              ["reports", "Financial Reports"]
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`rounded-xl px-4 py-3 text-left text-xs font-bold transition ${
                  section === key ? "bg-sky-500 text-white shadow" : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Inline Entry forms for directories */}
          {!["users", "bookings", "revenue", "verifications", "system_metrics", "moderation", "reports"].includes(section) && (
            <form onSubmit={submit} className="mt-6 border-t pt-4 border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</p>
              {[
                ["name", "Name"],
                ["description", "Description"],
                ["address", "Address"],
                ["city", "City"],
                ["images", "Image URLs"],
                ["lat", "Latitude"],
                ["lng", "Longitude"]
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500">{label}</label>
                  {key === "description" ? (
                    <textarea className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 outline-none" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  ) : (
                    <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 outline-none" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  )}
                </div>
              ))}

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950 outline-none" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950 outline-none" placeholder="Popularity" value={form.popularity} onChange={(e) => setForm({ ...form, popularity: e.target.value })} />
              </div>

              {section !== "places" && (
                <>
                  <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none" value={form.priceLevel} onChange={(e) => setForm({ ...form, priceLevel: e.target.value })}>
                    <option value="budget">Budget</option>
                    <option value="mid">Mid</option>
                    <option value="premium">Premium</option>
                  </select>
                  {section === "hotels" && <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 outline-none" placeholder="Price per night" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} />}
                </>
              )}

              <button className="w-full rounded-xl bg-sky-500 py-2.5 text-xs text-white font-bold hover:bg-sky-600 transition">
                {saving ? "Saving..." : editingId ? "Update Listing" : "Add Listing"}
              </button>
            </form>
          )}
        </div>

        {/* Content Workspace Area */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-x-auto">
          {section === "users" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">User Directory</h2>
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((user) => (
                    <tr key={user._id} className="text-slate-700 dark:text-slate-300">
                      <td className="py-3 font-bold">{user.name}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3 font-semibold">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="rounded border border-slate-300 bg-transparent px-2.5 py-1 dark:border-slate-700 outline-none"
                        >
                          <option value="traveler">Traveler</option>
                          <option value="tour_guide">Tour Guide</option>
                          <option value="hotel_owner">Hotel Owner</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => remove(user._id)}
                          className="rounded px-2.5 py-1 bg-red-50 text-red-600 font-bold hover:bg-red-100"
                        >
                          Suspend Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section === "bookings" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Transactions Log</h2>
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">User</th>
                    <th className="pb-3">Merchant Name</th>
                      <th className="pb-3">Amount</th>
                    <th className="pb-3">Platform Revenue</th>
                      <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((booking) => (
                    <tr key={booking._id} className="text-slate-700 dark:text-slate-300">
                      <td className="py-3 font-mono font-bold text-sky-500">#{booking._id}</td>
                      <td className="py-3">{booking.user?.name || "User Deleted"}</td>
                      <td className="py-3 font-bold">{booking.hotel?.name || booking.guide?.name || "Service Deleted"}</td>
                      <td className="py-3 font-semibold">Rs. {booking.totalPrice?.toLocaleString()}</td>
                      <td className="py-3 font-bold text-emerald-600">
                        Rs. {(booking.platformRevenue || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 font-bold">
                        <select
                          value={booking.status}
                          onChange={(e) => handleBookingStatusChange(booking._id, e.target.value)}
                          className="rounded border border-slate-300 bg-transparent px-2.5 py-1 dark:border-slate-700 outline-none"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => remove(booking._id)}
                          className="rounded px-2.5 py-1 bg-rose-50 text-rose-600 font-bold hover:bg-rose-100"
                        >
                          Void Transaction
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section === "revenue" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Engine</h2>
                <p className="mt-1 text-xs text-slate-500">Live monetization from booking commissions, convenience fees, and partner payouts.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["Gross Sales", revenueSummary?.totals?.grossSales || 0, "Total traveler checkout amount"],
                  ["Platform Revenue", revenueSummary?.totals?.platformRevenue || 0, "Commission plus convenience fees"],
                  ["Partner Payouts", revenueSummary?.totals?.partnerPayouts || 0, "Amount payable to hotels, guides, and operators"]
                ].map(([label, value, help]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Rs. {value.toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{help}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Booking Revenue Breakdown</h3>
                  <div className="mt-3 space-y-2">
                    {(revenueSummary?.byType || []).map((row) => (
                      <div key={row.bookingType} className="flex items-center justify-between rounded-lg bg-white p-3 text-xs dark:bg-slate-900">
                        <div>
                          <p className="font-bold capitalize text-slate-800 dark:text-slate-200">{row.bookingType}</p>
                          <p className="text-slate-400">{row.bookings} bookings • Gross Rs. {row.grossSales.toLocaleString("en-IN")}</p>
                        </div>
                        <p className="font-black text-emerald-600">Rs. {row.platformRevenue.toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Paid Promotion Plans</h3>
                  <div className="mt-3 space-y-2">
                    {(revenueSummary?.monetizationPlans || []).map((plan) => (
                      <div key={plan.name} className="rounded-lg bg-white p-3 text-xs dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{plan.name}</p>
                          <p className="font-black text-sky-500">Rs. {plan.price.toLocaleString("en-IN")}/{plan.billing}</p>
                        </div>
                        <p className="mt-1 text-slate-400">{plan.target}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === "verifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Guide & Owner License Verifications</h2>
              <div className="grid gap-3">
                {verifications.map((v) => (
                  <div key={v.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs flex items-center justify-between">
                    <div>
                      <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{v.type}</span>
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5">{v.name}</p>
                      <p className="text-slate-400 mt-0.5">License: {v.license} • Credentials Document: <span className="underline cursor-pointer">{v.doc}</span></p>
                      <p className="mt-2">
                        Status: <span className={`font-bold ${v.status === "Verified" ? "text-emerald-600" : "text-amber-600"}`}>{v.status}</span>
                      </p>
                    </div>
                    {v.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveVerification(v.id)}
                          className="bg-emerald-500 text-white rounded-lg px-3 py-1.5 font-bold hover:bg-emerald-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectVerification(v.id)}
                          className="bg-red-50 text-red-600 rounded-lg px-3 py-1.5 font-bold hover:bg-red-100"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "system_metrics" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Live System Health Monitor</h2>
              <div className="grid gap-4 md:grid-cols-3 text-xs">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 dark:border-slate-800">
                  <p className="font-bold text-slate-400 uppercase">Redis cache hit rate</p>
                  <p className="text-3xl font-black text-sky-500 mt-1">{sysMetrics.redisHit}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 dark:border-slate-800">
                  <p className="font-bold text-slate-400 uppercase">Average response time</p>
                  <p className="text-3xl font-black text-sky-500 mt-1">{sysMetrics.responseTime}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 dark:border-slate-800">
                  <p className="font-bold text-slate-400 uppercase">CPU Usage</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full" style={{ width: "32%" }} />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">32%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === "moderation" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">AI Content Spam & Fraud Warnings</h2>
              <div className="grid gap-3">
                {moderationAlerts.map((m) => (
                  <div key={m.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{m.type}</span>
                        <span className="font-bold text-red-500">⚠️ Risk: {m.score}</span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white mt-2">Target: {m.target}</p>
                      <p className="text-slate-500 dark:text-slate-400 italic mt-1">"{m.content}"</p>
                      <p className="mt-2 text-slate-400">Status: <span className="font-bold">{m.status}</span></p>
                    </div>
                    {m.status === "Flagged" && (
                      <div className="flex gap-2 font-bold">
                        <button
                          onClick={() => handleModerationAction(m.id, "Approved")}
                          className="bg-emerald-500 text-white rounded px-2.5 py-1 hover:bg-emerald-600"
                        >
                          Approve Content
                        </button>
                        <button
                          onClick={() => handleModerationAction(m.id, "Removed")}
                          className="bg-red-50 text-red-600 rounded px-2.5 py-1 hover:bg-red-100"
                        >
                          Remove Content
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "reports" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Export Financial Reports</h2>
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                {[
                  ["revenue", "Revenue ledger log"],
                  ["bookings_audit", "Bookings reconciliation log"],
                  ["ai_usage_stats", "AI consumption audit metrics"]
                ].map(([type, label]) => (
                  <div key={type} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white capitalize">{type.replace("_", " ")}</p>
                      <p className="text-slate-400 mt-0.5">{label}</p>
                    </div>
                    <button
                      onClick={() => triggerCsvExport(type)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 font-bold"
                    >
                      <FileSpreadsheet className="h-4 w-4" /> Export CSV
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard listings CRUD view */}
          {["hotels", "restaurants", "places"].includes(section) && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize mb-4">Manage {section}</h2>
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Rating</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr key={item._id} className="text-slate-700 dark:text-slate-300">
                      <td className="py-3 font-bold">{item.name}</td>
                      <td className="py-3">{item.city}</td>
                      <td className="py-3">★ {item.rating}</td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => populateForm(item)}
                          className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-950"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(item._id)}
                          className="rounded px-2.5 py-1 bg-red-50 text-red-600 font-bold hover:bg-red-100 animate-pulse"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
