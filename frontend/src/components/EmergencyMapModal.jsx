import { useState, useEffect } from "react";
import { ShieldAlert, Crosshair, Phone, MapPin, X } from "lucide-react";
import api from "../utils/api";

export default function EmergencyMapModal({ isOpen, onClose }) {
  const [serviceType, setServiceType] = useState("hospital");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.get("/utility/nearby-services", { params: { serviceType } })
      .then(({ data }) => setServices(data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [isOpen, serviceType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-500 font-extrabold text-lg">
            <ShieldAlert className="h-6 w-6" /> Nearby Emergency & Essential Services
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Emergency Numbers */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div className="rounded-xl bg-rose-50 p-2 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            National Emergency: 112
          </div>
          <div className="rounded-xl bg-sky-50 p-2 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            Police: 100
          </div>
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Ambulance: 102
          </div>
        </div>

        {/* Service Type Tabs */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "hospital", label: "Hospitals" },
            { id: "police", label: "Police Stations" },
            { id: "atm", label: "ATMs" },
            { id: "petrol", label: "Petrol Pumps" }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setServiceType(type.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
                serviceType === type.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-center text-xs text-slate-500 py-6">Locating nearby {serviceType}s...</p>
          ) : (
            services.map((srv) => (
              <div key={srv._id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{srv.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" /> {srv.address} • {srv.distanceKm} km away
                  </p>
                </div>
                <a
                  href={`tel:${srv.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow hover:bg-emerald-600 transition"
                >
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
