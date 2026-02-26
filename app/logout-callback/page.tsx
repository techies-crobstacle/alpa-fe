"use client";
export const dynamic = "force-dynamic";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

function LogoutCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const doLogout = async () => {
      const token = localStorage.getItem("alpa_token");

      // 1. Invalidate the token server-side so it can't be reused for SSO tickets
      if (token) {
        try {
          await fetch("https://alpa-be-1.onrender.com/api/auth/logout", {
            method: "POST",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (_) {
          // Best-effort — never block the logout flow
        }
      }

      // 2. Clear ALL Webapp session data (auth + seller-specific keys)
      localStorage.removeItem("alpa_token");
      localStorage.removeItem("user");
      localStorage.removeItem("sellerToken");
      localStorage.removeItem("sellerOnboardingStep");
      localStorage.removeItem("sellerOnboardingFormData");
      localStorage.removeItem("sellerAbnVerified");

      // 3. Notify any in-tab listeners (e.g. CartContext)
      window.dispatchEvent(new CustomEvent("alpa-logout"));

      if (window.parent !== window) {
        // Legacy iframe path — notify the parent that we're done
        window.parent.postMessage("alpa-logout-done", "https://alpa-dashboard.vercel.app");
        return;
      }

      // 4. Redirect-based path — validate the redirect param against known origins
      const redirectParam = searchParams.get("redirect");
      const allowedOrigins = [
        "https://apla-fe.vercel.app",
        "https://alpa-dashboard.vercel.app",
      ];
      const isSafe =
        redirectParam && allowedOrigins.some((o) => redirectParam.startsWith(o));
      window.location.replace(isSafe ? redirectParam : "/");
    };

    doLogout();
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#440C03] relative overflow-hidden">
      {/* Decorative blurred orbs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-[#873007]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full bg-[#5A1E12]/50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7A2F12]/20 blur-[100px] pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl shadow-2xl px-12 py-14 flex flex-col items-center gap-7 w-[90vw] max-w-sm"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <Image
            src="/images/navbarLogo.png"
            alt="Alpa Logo"
            width={72}
            height={72}
            className="drop-shadow-lg"
          />
        </motion.div>

        {/* Spinner ring */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Outer pulsing ring */}
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-white/20"
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Spinning arc */}
          <svg
            className="w-full h-full animate-spin"
            viewBox="0 0 56 56"
            fill="none"
          >
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="white"
              strokeOpacity="0.15"
              strokeWidth="4"
            />
            <path
              d="M28 6a22 22 0 0 1 22 22"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <p className="text-white font-bold text-xl tracking-tight">
            Signing you out
          </p>
          <p className="text-white/55 text-sm mt-1.5">
            Clearing your session, please wait…
          </p>
        </motion.div>

        {/* Animated dots */}
        <div className="flex gap-2 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function LogoutCallbackPage() {
  return (
    <Suspense>
      <LogoutCallbackContent />
    </Suspense>
  );
}
