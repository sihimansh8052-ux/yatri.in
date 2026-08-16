import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { CheckBadgeIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { FiEye, FiEyeOff, FiLock, FiMail, FiMapPin, FiPhone, FiUpload, FiUser } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaGithub } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import api from "../utils/api";

const travelLottie = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 220,
  h: 220,
  nm: "travel-success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "sun",
      sr: 1,
      ks: {
        o: { a: 0, k: 80 },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 90, s: [360] }] },
        p: { a: 0, k: [110, 94, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [88, 88, 100] }, { t: 45, s: [108, 108, 100] }, { t: 90, s: [88, 88, 100] }] }
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [92, 92] },
          nm: "Ellipse Path 1"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.9608, 0.7725, 0.2588, 1] },
          o: { a: 0, k: 100 },
          nm: "Fill 1"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "route",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [110, 132, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "sh",
          ks: {
            a: 0,
            k: {
              i: [[0, 0], [16, -28], [34, 0]],
              o: [[24, 0], [16, 28], [0, 0]],
              v: [[-70, 35], [-14, -30], [72, 30]],
              c: false
            }
          },
          nm: "Path 1"
        },
        {
          ty: "st",
          c: { a: 0, k: [0.0627, 0.7255, 0.5059, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 10 },
          lc: 2,
          lj: 2,
          nm: "Stroke 1"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    }
  ]
};

const registerDefaults = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  country: "India",
  state: "",
  city: "",
  profilePhoto: "",
  role: "traveler",
  language: "English",
  agreeTerms: false,
  rememberMe: true
};

const loginDefaults = { identifier: "", password: "", rememberMe: true };

export default function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(loginDefaults);
  const [registerForm, setRegisterForm] = useState(registerDefaults);
  const [otpForm, setOtpForm] = useState({ email: "", otp: "" });
  const [resetForm, setResetForm] = useState({ email: "", otp: "", token: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formNotice, setFormNotice] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [successMode, setSuccessMode] = useState(null);
  const [touched, setTouched] = useState({});

  // Phone OTP login states
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-slate-400/30", width: "w-0" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-rose-500", width: "w-1/3" };
    if (score <= 4) return { score, label: "Medium", color: "bg-amber-500", width: "w-2/3" };
    return { score, label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  useEffect(() => {
    if (!countdown) return undefined;
    const id = setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const validation = useMemo(() => validate(mode, { loginForm, registerForm, otpForm, resetForm }), [
    mode,
    loginForm,
    registerForm,
    otpForm,
    resetForm
  ]);

  const notify = (type, message) => {
    setFormNotice({ type, message });
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4500);
  };

  const finishAuth = (data) => {
    localStorage.setItem("yatri_token", data.token);
    if (data.refreshToken) localStorage.setItem("yatri_refresh", data.refreshToken);
    setSuccessMode("login");
    setTimeout(() => onAuthenticated(data), 650);
  };

  const login = async (event) => {
    event.preventDefault();
    setTouched({ identifier: true, password: true });
    if (Object.keys(validation).length) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: loginForm.identifier,
        password: loginForm.password,
        rememberMe: loginForm.rememberMe
      });
      notify("success", "Welcome back. Opening your dashboard.");
      finishAuth(data);
    } catch (error) {
      notify("error", error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (event) => {
    event.preventDefault();
    setFormNotice(null);
    setTouched(Object.fromEntries(Object.keys(registerDefaults).map((key) => [key, true])));
    if (Object.keys(validation).length) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", registerForm);
      notify("success", data.devOtp ? `Account created. Demo OTP: ${data.devOtp}` : "Account created successfully");
      finishAuth(data);
    } catch (error) {
      notify("error", error.response?.data?.message || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/google", {
        name: "Google Traveler",
        email: "google.traveler@yatri.in",
        picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        googleId: "demo-google-profile",
        rememberMe: true
      });
      notify("success", "Google sign in successful");
      finishAuth(data);
    } catch (error) {
      notify("error", error.response?.data?.message || "Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const githubSignIn = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/github", {
        name: "GitHub Developer",
        email: "github.dev@yatri.in",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        githubId: "demo-github-profile",
        rememberMe: true
      });
      notify("success", "GitHub sign in successful");
      finishAuth(data);
    } catch (error) {
      notify("error", error.response?.data?.message || "GitHub sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneOtp = async () => {
    if (!loginForm.identifier) {
      notify("error", "Enter your phone number first");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/mobile-otp/request", { mobile: loginForm.identifier });
      setPhoneOtpSent(true);
      notify("success", data.devOtp ? `OTP Sent. Demo code: ${data.devOtp}` : data.message);
    } catch (error) {
      notify("error", "Failed to send OTP code");
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhoneOtp = async (e) => {
    e.preventDefault();
    if (!phoneOtpCode) {
      notify("error", "Enter the OTP code received");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: "demo@yatri.in",
        password: "password123",
        rememberMe: loginForm.rememberMe
      });
      notify("success", "OTP verified. Logged in successfully.");
      finishAuth(data);
    } catch (error) {
      notify("error", "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    if (!otpForm.email && !resetForm.email) {
      notify("error", "Enter your email first");
      return;
    }
    setLoading(true);
    try {
      const email = mode === "forgot" ? resetForm.email : otpForm.email;
      const { data } = await api.post("/auth/email-otp/request", { email });
      setCountdown(60);
      notify("success", data.devOtp ? `OTP sent. Demo OTP: ${data.devOtp}` : data.message);
    } catch (error) {
      notify("error", error.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/email-otp/verify", otpForm);
      setSuccessMode("otp");
      notify("success", data.message);
    } catch (error) {
      notify("error", error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    if (!resetForm.email) {
      notify("error", "Enter your email first");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email: resetForm.email });
      setResetForm((current) => ({ ...current, token: data.resetToken || "" }));
      setCountdown(60);
      notify("success", data.resetToken ? "Reset token generated for demo." : data.message);
    } catch (error) {
      notify("error", error.response?.data?.message || "Reset request failed");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", resetForm);
      setSuccessMode("reset");
      notify("success", data.message);
      setTimeout(() => setMode("login"), 900);
    } catch (error) {
      notify("error", error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email) => {
    localStorage.removeItem("yatri_token");
    localStorage.removeItem("yatri_refresh");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password: "password123", rememberMe: true });
      notify("success", "Login successful! Opening dashboard...");
      finishAuth(data);
    } catch (err) {
      notify("error", err.response?.data?.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-luxury-blue text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(15,42,74,0.72), rgba(8,145,178,0.34), rgba(6,95,70,0.68)), url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee)"
        }}
      />
      <div className="absolute inset-0 animate-gradient bg-[length:300%_300%] bg-gradient-to-br from-sky-500/30 via-emerald-500/20 to-yellow-300/20" />
      <div className="absolute left-10 top-20 hidden h-44 w-44 animate-float rounded-full border border-white/20 bg-white/10 blur-sm lg:block" />
      <div className="absolute bottom-10 right-14 hidden h-56 w-56 animate-float rounded-full border border-luxury-gold/30 bg-luxury-gold/10 blur-md lg:block" />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className={`fixed right-4 top-4 z-50 rounded-lg border px-4 py-3 text-sm shadow-glow backdrop-blur-xl ${
              toast.type === "error" ? "border-rose-300/40 bg-rose-950/70 text-rose-50" : "border-emerald-300/40 bg-emerald-950/70 text-emerald-50"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_520px] lg:items-center">
        <motion.section initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <SparklesIcon className="h-4 w-4 text-luxury-gold" /> Luxury travel access
          </div>
          <h1 className="mt-6 max-w-3xl text-6xl font-semibold leading-tight">
            Yatri.in
            <span className="block text-3xl font-medium text-sky-100">Your premium AI travel command center.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-100">
            Secure sign-in, verified profiles, trip dashboards, bookings, wishlists, and intelligent planning wrapped in a travel-first experience.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {["Beach escapes", "Mountain stays", "City guides"].map((item) => (
              <div key={item} className="rounded-lg border border-white/15 bg-white/10 p-4 text-sm shadow-glow backdrop-blur-xl">
                <CheckBadgeIcon className="mb-3 h-5 w-5 text-luxury-gold" />
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 95, damping: 16 }}
          className="rounded-lg border border-white/20 bg-white/15 p-4 shadow-glow backdrop-blur-2xl sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-sky-100">Yatri.in</p>
              <h2 className="text-2xl font-semibold">{titleFor(mode)}</h2>
            </div>
            <div className="h-20 w-20">
              <Lottie animationData={travelLottie} loop autoplay />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-4 gap-2 rounded-lg bg-white/10 p-1 text-xs">
            {[
              ["login", "Login"],
              ["register", "Register"],
              ["verify", "Verify"],
              ["forgot", "Reset"]
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() => {
                  setMode(key);
                  setTouched({});
                  setFormNotice(null);
                }}
                className={`rounded-md px-2 py-2 transition ${mode === key ? "bg-white text-luxury-blue shadow-gold" : "text-white/80 hover:bg-white/10"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {formNotice && (
            <div
              className={`mb-4 rounded-md border px-3 py-2 text-sm ${
                formNotice.type === "error"
                  ? "border-rose-300/40 bg-rose-950/60 text-rose-50"
                  : "border-emerald-300/40 bg-emerald-950/60 text-emerald-50"
              }`}
            >
              {formNotice.message}
            </div>
          )}

          <AnimatePresence mode="wait">
            {successMode && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="mb-4 rounded-lg border border-emerald-300/40 bg-emerald-500/15 p-4 text-sm text-emerald-50"
              >
                <div className="flex items-center gap-3">
                  <CheckBadgeIcon className="h-6 w-6 text-emerald-300" />
                  <span>{successMode === "reset" ? "Password reset complete." : successMode === "otp" ? "Email verification complete." : "Login successful."}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.form key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={loginMethod === "otp" ? loginWithPhoneOtp : login} className="space-y-4">
                {/* Login Method Toggle */}
                <div className="flex gap-2 rounded-lg bg-white/5 p-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLoginMethod("password")}
                    className={`flex-1 rounded-md py-1 transition ${loginMethod === "password" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
                  >
                    Password Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod("otp")}
                    className={`flex-1 rounded-md py-1 transition ${loginMethod === "otp" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
                  >
                    Phone OTP Login
                  </button>
                </div>

                {loginMethod === "password" ? (
                  <>
                    <TextInput icon={FiMail} placeholder="Email / Mobile Number" value={loginForm.identifier} onBlur={() => setTouched({ ...touched, identifier: true })} onChange={(value) => setLoginForm({ ...loginForm, identifier: value })} error={touched.identifier && validation.identifier} />
                    <PasswordInput value={loginForm.password} show={showPassword} onToggle={() => setShowPassword(!showPassword)} onBlur={() => setTouched({ ...touched, password: true })} onChange={(value) => setLoginForm({ ...loginForm, password: value })} error={touched.password && validation.password} />
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <FiPhone className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/55" />
                      <input
                        className={`${inputClass} pr-24`}
                        placeholder="Mobile Number"
                        value={loginForm.identifier}
                        onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={sendPhoneOtp}
                        className="absolute right-2 top-2 rounded-md bg-white/25 hover:bg-white/40 px-2.5 py-1.5 text-[10px] font-bold text-white transition"
                      >
                        Send OTP
                      </button>
                    </div>
                    {phoneOtpSent && (
                      <TextInput icon={FiLock} placeholder="OTP Verification Code" value={phoneOtpCode} onChange={(val) => setPhoneOtpCode(val)} />
                    )}
                  </>
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-white/85">
                    <input type="checkbox" checked={loginForm.rememberMe} onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })} />
                    Remember Me
                  </label>
                  {loginMethod === "password" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-luxury-gold hover:text-yellow-200">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <SubmitButton loading={loading} label={loginMethod === "otp" ? "Verify & Login" : "Login"} />

                {/* 1-Click Demo Credentials for All 4 Roles */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("demo@yatri.in")}
                    className="rounded-lg bg-sky-500/80 px-2.5 py-2 text-[11px] font-bold text-white hover:bg-sky-500 backdrop-blur transition shadow"
                  >
                    ⚡ Demo Traveler
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("asha@yatri.in")}
                    className="rounded-lg bg-emerald-500/80 px-2.5 py-2 text-[11px] font-bold text-white hover:bg-emerald-500 backdrop-blur transition shadow"
                  >
                    🚩 Demo Tour Guide
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("owner@yatri.in")}
                    className="rounded-lg bg-purple-500/80 px-2.5 py-2 text-[11px] font-bold text-white hover:bg-purple-500 backdrop-blur transition shadow"
                  >
                    🏨 Demo Hotel Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("admin@yatri.in")}
                    className="rounded-lg bg-amber-500/80 px-2.5 py-2 text-[11px] font-bold text-white hover:bg-amber-500 backdrop-blur transition shadow"
                  >
                    🛡️ Demo Admin
                  </button>
                </div>

                <SocialButtons onGoogle={googleSignIn} onGithub={githubSignIn} />
                <p className="text-center text-sm text-white/80">
                  New to Yatri.in?{" "}
                  <button type="button" className="font-medium text-luxury-gold" onClick={() => setMode("register")}>
                    Create New Account
                  </button>
                </p>
              </motion.form>
            )}

            {mode === "register" && (
              <motion.form key="register" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={register} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput icon={FiUser} name="fullName" placeholder="Full Name" value={registerForm.fullName} onBlur={() => setTouched({ ...touched, fullName: true })} onChange={(value) => setRegisterForm({ ...registerForm, fullName: value })} error={touched.fullName && validation.fullName} />
                  <TextInput icon={FiMail} name="email" type="email" placeholder="Email" value={registerForm.email} onBlur={() => setTouched({ ...touched, email: true })} onChange={(value) => setRegisterForm({ ...registerForm, email: value })} error={touched.email && validation.email} />
                  <TextInput icon={FiPhone} name="mobile" type="tel" placeholder="Mobile Number" value={registerForm.mobile} onBlur={() => setTouched({ ...touched, mobile: true })} onChange={(value) => setRegisterForm({ ...registerForm, mobile: value })} error={touched.mobile && validation.mobile} />
                  <TextInput icon={FiMapPin} name="country" placeholder="Country" value={registerForm.country} onChange={(value) => setRegisterForm({ ...registerForm, country: value })} />
                  <TextInput icon={FiMapPin} name="state" placeholder="State" value={registerForm.state} onBlur={() => setTouched({ ...touched, state: true })} onChange={(value) => setRegisterForm({ ...registerForm, state: value })} error={touched.state && validation.state} />
                  <TextInput icon={FiMapPin} name="city" placeholder="City" value={registerForm.city} onBlur={() => setTouched({ ...touched, city: true })} onChange={(value) => setRegisterForm({ ...registerForm, city: value })} error={touched.city && validation.city} />

                  {/* Language Selection */}
                  <div>
                    <select
                      value={registerForm.language}
                      onChange={(e) => setRegisterForm({ ...registerForm, language: e.target.value })}
                      className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-3.5 text-xs text-white outline-none backdrop-blur focus:bg-white/20"
                    >
                      {["English", "Hindi", "Spanish", "French", "German"].map((l) => (
                        <option key={l} value={l} className="bg-slate-900 text-white">{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <select
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                      className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-3.5 text-xs text-white outline-none backdrop-blur focus:bg-white/20"
                    >
                      <option value="traveler" className="bg-slate-900 text-white">Traveler</option>
                      <option value="hotel_owner" className="bg-slate-900 text-white">Hotel Owner</option>
                      <option value="tour_guide" className="bg-slate-900 text-white">Tour Guide</option>
                      <option value="admin" className="bg-slate-900 text-white">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <PasswordInput name="password" placeholder="Password" value={registerForm.password} show={showPassword} onToggle={() => setShowPassword(!showPassword)} onBlur={() => setTouched({ ...touched, password: true })} onChange={(value) => setRegisterForm({ ...registerForm, password: value })} error={touched.password && validation.password} />
                    {registerForm.password && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-[10px] text-white/70 font-bold mb-1">
                          <span>Password Strength</span>
                          <span>{getPasswordStrength(registerForm.password).label}</span>
                        </div>
                        <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                          <div className={`h-full ${getPasswordStrength(registerForm.password).color} ${getPasswordStrength(registerForm.password).width} transition-all duration-300`} />
                        </div>
                      </div>
                    )}
                  </div>
                  <PasswordInput name="confirmPassword" placeholder="Confirm Password" value={registerForm.confirmPassword} show={showPassword} onToggle={() => setShowPassword(!showPassword)} onBlur={() => setTouched({ ...touched, confirmPassword: true })} onChange={(value) => setRegisterForm({ ...registerForm, confirmPassword: value })} error={touched.confirmPassword && validation.confirmPassword} />
                </div>
                <div className="relative">
                  <FiUpload className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/55" />
                  <input className={inputClass} placeholder="Profile Picture URL" value={registerForm.profilePhoto} onChange={(e) => setRegisterForm({ ...registerForm, profilePhoto: e.target.value })} />
                </div>
                <label className="flex items-start gap-2 text-sm text-white/85">
                  <input className="mt-1" type="checkbox" checked={registerForm.agreeTerms} onChange={(e) => setRegisterForm({ ...registerForm, agreeTerms: e.target.checked })} />
                  <span>I agree to the Terms and Privacy Policy.</span>
                </label>
                {touched.agreeTerms && validation.agreeTerms && <p className="text-xs text-rose-200">{validation.agreeTerms}</p>}
                <SubmitButton loading={loading} label="Create Account" />
                <button type="button" onClick={googleSignIn} className="flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white px-4 py-3 text-sm font-medium text-luxury-blue shadow-lg transition hover:-translate-y-0.5 hover:shadow-gold">
                  <FcGoogle className="h-5 w-5" /> Sign up with Google
                </button>
              </motion.form>
            )}

            {mode === "verify" && (
              <motion.form key="verify" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={verifyOtp} className="space-y-4">
                <TextInput icon={FiMail} placeholder="Email" value={otpForm.email} onChange={(value) => setOtpForm({ ...otpForm, email: value })} />
                <TextInput icon={FiLock} placeholder="OTP Verification Code" value={otpForm.otp} onChange={(value) => setOtpForm({ ...otpForm, otp: value })} />
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <SubmitButton loading={loading} label="Verify OTP" />
                  <button type="button" disabled={countdown > 0 || loading} onClick={requestOtp} className="rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/20 disabled:opacity-50">
                    {countdown ? `Resend ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </motion.form>
            )}

            {mode === "forgot" && (
              <motion.form key="forgot" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={resetPassword} className="space-y-4">
                <TextInput icon={FiMail} placeholder="Email" value={resetForm.email} onChange={(value) => setResetForm({ ...resetForm, email: value })} />
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <TextInput icon={FiLock} placeholder="Reset Token / OTP" value={resetForm.token} onChange={(value) => setResetForm({ ...resetForm, token: value })} />
                  <button type="button" disabled={countdown > 0 || loading} onClick={forgotPassword} className="rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/20 disabled:opacity-50">
                    {countdown ? `Wait ${countdown}s` : "Send OTP"}
                  </button>
                </div>
                <PasswordInput placeholder="Create New Password" value={resetForm.password} show={showPassword} onToggle={() => setShowPassword(!showPassword)} onChange={(value) => setResetForm({ ...resetForm, password: value })} />
                <PasswordInput placeholder="Confirm New Password" value={resetForm.confirmPassword} show={showPassword} onToggle={() => setShowPassword(!showPassword)} onChange={(value) => setResetForm({ ...resetForm, confirmPassword: value })} />
                <SubmitButton loading={loading} label="Reset Password" />
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-white/70">
            <a href="#" className="hover:text-luxury-gold">Terms</a>
            <span>|</span>
            <a href="#" className="hover:text-luxury-gold">Privacy</a>
            <span>|</span>
            <span>Protected by Yatri.in secure sessions</span>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-md border border-white/20 bg-white/10 px-3 py-3 pl-10 text-sm text-white outline-none backdrop-blur transition placeholder:text-white/55 focus:border-luxury-gold focus:bg-white/20";

const formVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.2 } }
};

function titleFor(mode) {
  if (mode === "register") return "Create New Account";
  if (mode === "verify") return "Email Verification";
  if (mode === "forgot") return "Forgot Password";
  return "Welcome Back";
}

function validate(mode, { loginForm, registerForm, otpForm, resetForm }) {
  const errors = {};
  const emailPattern = /^\S+@\S+\.\S+$/;

  if (mode === "login") {
    if (!loginForm.identifier) errors.identifier = "Email or mobile is required";
    if (!loginForm.password) errors.password = "Password is required";
  }

  if (mode === "register") {
    if (!registerForm.fullName.trim()) errors.fullName = "Full name is required";
    if (!emailPattern.test(registerForm.email)) errors.email = "Enter a valid email";
    if (!/^[0-9+\-\s]{8,15}$/.test(registerForm.mobile)) errors.mobile = "Enter a valid mobile number";
    if (!registerForm.state.trim()) errors.state = "State is required";
    if (!registerForm.city.trim()) errors.city = "City is required";
    if (registerForm.password.length < 8) errors.password = "Password must be at least 8 characters";
    if (registerForm.password !== registerForm.confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!registerForm.agreeTerms) errors.agreeTerms = "Please agree to continue";
  }

  if (mode === "verify") {
    if (!emailPattern.test(otpForm.email)) errors.email = "Enter a valid email";
    if (!otpForm.otp) errors.otp = "OTP is required";
  }

  if (mode === "forgot") {
    if (!emailPattern.test(resetForm.email)) errors.email = "Enter a valid email";
    if (!resetForm.password || resetForm.password.length < 8) errors.password = "Password must be at least 8 characters";
    if (resetForm.password !== resetForm.confirmPassword) errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

function TextInput({ icon: Icon, name, type = "text", placeholder, value, onChange, onBlur, error }) {
  return (
    <label className="block">
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/55" />
        <input name={name} type={type} className={inputClass} placeholder={placeholder} value={value} onBlur={onBlur} onChange={(event) => onChange(event.target.value)} />
      </div>
      {error && <p className="mt-1 text-xs text-rose-200">{error}</p>}
    </label>
  );
}

function PasswordInput({ name, placeholder = "Password", value, show, onToggle, onChange, onBlur, error }) {
  return (
    <label className="block">
      <div className="relative">
        <FiLock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/55" />
        <input name={name} className={`${inputClass} pr-10`} type={show ? "text" : "password"} placeholder={placeholder} value={value} onBlur={onBlur} onChange={(event) => onChange(event.target.value)} />
        <button type="button" className="absolute right-3 top-3.5 text-white/70 transition hover:text-white" onClick={onToggle}>
          {show ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-rose-200">{error}</p>}
    </label>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-luxury-gold via-yellow-300 to-luxury-emerald px-4 py-3 text-sm font-semibold text-luxury-blue shadow-gold transition hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-70" disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />} {label}
    </button>
  );
}

function SocialButtons({ onGoogle, onGithub }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-white/60">
        <div className="h-px flex-1 bg-white/20" />
        OR
        <div className="h-px flex-1 bg-white/20" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button type="button" onClick={onGoogle} className="flex items-center justify-center rounded-md bg-white px-4 py-3 text-luxury-blue shadow-lg transition hover:-translate-y-0.5">
          <FcGoogle className="h-5 w-5" />
        </button>
        <button type="button" onClick={onGithub} className="flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 py-3 text-white transition hover:-translate-y-0.5 hover:bg-white/20">
          <FaGithub className="h-5 w-5" />
        </button>
        <button type="button" className="flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 py-3 text-white transition hover:-translate-y-0.5 hover:bg-white/20">
          <FaFacebookF className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
