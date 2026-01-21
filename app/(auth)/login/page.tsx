"use client";

import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const url = "https://alpa-be-1.onrender.com";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUserDirect } = useAuth(); // Use setUserDirect instead of fetchUser

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        return;
      }

      /**
       * CASE 1: OTP REQUIRED
       */
      if (data.requiresVerification) {
        router.push(`/login-verify-otp?email=${data.email || email}`);
        return;
      }

      /**
       * CASE 2: TOKEN ALREADY VALID (NO OTP)
       */
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        setUserDirect(data.user);
        router.push("/");
        return;
      }

      console.log("LOGIN RESPONSE:", data);

      // fallback safety
      setError("Unexpected login response");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex overflow-hidden">
      {/* LEFT PANEL */}
      <section
        className="relative w-1/2 flex flex-col justify-center px-20 text-white
        bg-linear-to-r from-[#440C03] via-[#440C03] to-[#440C03]"
      >
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <Image
            src="/images/navbarLogo.png"
            alt="Logo"
            width={90}
            height={90}
          />
        </div>

        {/* Content */}
        <div className="max-w-md">
          <p className="uppercase text-xs tracking-widest mb-4 opacity-80">
            Start for free
          </p>

          <h1 className="text-4xl font-bold mb-2">Log into your account</h1>

          <p className="text-sm mb-10 opacity-80">
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold underline hover:opacity-100 transition"
            >
              Sign up
            </Link>
          </p>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              className="w-120 rounded-3xl px-5 py-3 bg-[#873007] placeholder-white/70 outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              value={password}
              placeholder="Password"
              className="w-120 rounded-3xl px-5 py-3 bg-[#873007] placeholder-white/70 outline-none" 
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-200 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-120 mt-6 bg-white text-[#7A2F12] font-semibold
              rounded-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>
        </div>
      </section>

      {/* RIGHT IMAGE PANEL */}
      <section className="relative w-1/2">
        <Image
          src="/images/top2.jpg"
          alt="Auth Visual"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient blend */}
        <div
          className="absolute inset-0 bg-linear-to-r
          from-[#440C03] via-[#440C03]/40 to-transparent"
        ></div>
      </section>
    </main>
  );
}
