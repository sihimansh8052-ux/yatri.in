import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDarkMode } from "./hooks/useDarkMode";
import api from "./utils/api";
import Shell from "./components/Shell";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import DetailsPage from "./pages/DetailsPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import CostCalculatorPage from "./pages/CostCalculatorPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import BusBookingPage from "./pages/BusBookingPage";
import TrainBookingPage from "./pages/TrainBookingPage";
import PackagesPage from "./pages/PackagesPage";
import AiTripPlannerPage from "./pages/AiTripPlannerPage";
import HotelOwnerPage from "./pages/HotelOwnerPage";
import GuidePortalPage from "./pages/GuidePortalPage";
import FoodDiscoveryPage from "./pages/FoodDiscoveryPage";
import LocationIntelligencePage from "./pages/LocationIntelligencePage";
import PaymentCenterPage from "./pages/PaymentCenterPage";
import CommunicationCenterPage from "./pages/CommunicationCenterPage";

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/auth" replace />;
}

function AdminRoute({ user, children }) {
  return user?.role === "admin" ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { darkMode, setDarkMode } = useDarkMode();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (_error) {
      localStorage.removeItem("yatri_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const logout = () => setUser(null);
    window.addEventListener("yatri:logout", logout);
    if (localStorage.getItem("yatri_token")) {
      loadProfile();
    } else {
      setLoading(false);
    }
    return () => window.removeEventListener("yatri:logout", logout);
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-white">Loading Yatri.in...</div>;
  }

  return (
    <Shell user={user} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={() => {
      localStorage.removeItem("yatri_token");
      localStorage.removeItem("yatri_refresh");
      api.post("/auth/logout").catch(() => {});
      setUser(null);
    }}>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/results" element={<ResultsPage user={user} onUserRefresh={loadProfile} />} />
        <Route path="/details/:type/:id" element={<DetailsPage user={user} onUserRefresh={loadProfile} />} />
        <Route path="/auth" element={<AuthPage user={user} onAuthenticated={setUser} />} />
        <Route path="/calculator" element={<CostCalculatorPage />} />
        <Route path="/booking-confirmation/:id" element={<BookingConfirmationPage user={user} />} />
        <Route path="/buses" element={<BusBookingPage user={user} />} />
        <Route path="/trains" element={<TrainBookingPage user={user} />} />
        <Route path="/packages" element={<PackagesPage user={user} />} />
        <Route path="/ai-planner" element={<AiTripPlannerPage />} />
        <Route path="/hotel-owner" element={<HotelOwnerPage user={user} />} />
        <Route path="/guide-portal" element={<GuidePortalPage user={user} />} />
        <Route path="/food-discovery" element={<FoodDiscoveryPage />} />
        <Route path="/location-intelligence" element={<LocationIntelligencePage />} />
        <Route path="/payment-center" element={<PaymentCenterPage />} />
        <Route path="/communication" element={<CommunicationCenterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <DashboardPage user={user} onUserRefresh={loadProfile} darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute user={user}>
              <ResultsPage user={user} savedOnly onUserRefresh={loadProfile} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Shell>
  );
}
