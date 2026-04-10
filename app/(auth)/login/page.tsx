"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { syncGuestCartAfterLogin } from "@/lib/guestCartUtils";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const url = "https://alpa-be.onrender.com";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { setUserDirect } = useAuth();
  const { notifyLogin } = useCart();
  const { fetchCartData } = useSharedEnhancedCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowModal(true);

    try {
      const res = await fetch(`${url}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setShowModal(false);
        return;
      }

      if (data.requiresVerification) {
        router.push(`/login-verify-otp?email=${data.email || email}`);
        return;
      }

      if (data.token && data.user) {
        if (data.role === "ADMIN" || data.user?.role === "ADMIN") {
          setError("This portal is not for Admin login. Please use the Admin dashboard.");
          setShowModal(false);
          return;
        }

        localStorage.setItem("alpa_token", data.token);
        setUserDirect(data.user);
        await syncGuestCartAfterLogin(data.token);
        await notifyLogin(data.token);
        await fetchCartData(true);
        router.push("/");
        return;
      }

      console.log("LOGIN RESPONSE:", data);
      setError("Unexpected login response");
    } catch (err) {
      setError("Something went wrong");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white min-[1360px]:bg-[#440C03]">
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl w-[90vw] max-w-sm overflow-hidden"
            >
              <div className="flex flex-col items-center justify-center px-8 py-12 gap-5">
                <div className="w-16 h-16 rounded-full bg-[#5A1E12]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#5A1E12] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800 text-lg">Logging you in...</p>
                  <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Image
        src="/images/top2.jpg"
        alt="Auth Visual"
        fill
        className="hidden object-contain object-[130%_center] lg:block"
        priority
      />

      <div className="absolute inset-0 bg-[#440C03] lg:hidden" />
      <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(90deg,_#440C03_0%,_#440C03_44%,_rgba(68,12,3,0.55)_68%,_rgba(68,12,3,0)_100%)]" />

      <section className="relative z-10 flex min-h-screen w-full items-center px-6 py-20 sm:px-10 md:px-16 lg:px-20">
        <Link href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8">
          <Image
            src="/images/navbarLogo.png"
            alt="Logo"
            width={90}
            height={90}
            className="w-14 h-14 md:w-[90px] md:h-[90px]"
          />
        </Link>

        <div className="w-full max-w-md">
          <p className="uppercase text-xs tracking-widest mb-4 opacity-80">Start for free</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Log into your account</h1>

          <p className="text-sm mb-10 opacity-80">
            New here?{" "}
            <Link href="/signup" className="font-semibold underline hover:opacity-100 transition">
              Sign up
            </Link>
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              className="w-full rounded-3xl px-5 py-3 bg-[#873007] placeholder-white/70 outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Password"
                className="w-full rounded-3xl px-5 py-3 bg-[#873007] placeholder-white/70 outline-none"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="text-red-200 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-white text-[#7A2F12] font-semibold rounded-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? "Logging in..." : "Login \u2192"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
