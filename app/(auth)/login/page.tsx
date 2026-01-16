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
        credentials: "include",
      });

      

      const data = await res.json();

      // console.log("testing 1.0")
      // console.log(data)

      


      // invalid credentials
      if (!res.ok) {
        setError(data.message || "Login Failed");
        return;
      }
      // token for session
      localStorage.setItem("token", data.token);

      // Use setUserDirect with the user data from login response
      // Assuming your backend returns user object in response
      if (data.user) {
        setUserDirect(data.user);
      } else if (data.id && data.name && data.email) {
        // If user data is at root level of response
        setUserDirect({
          id: data.id,
          name: data.name,
          email: data.email
        });
      } else {
        // If backend returns different structure, adjust accordingly
        console.log("Login response:", data); // 
        setUserDirect({
          id: data.id || data._id || "user-id",
          name: data.name || data.username || "User",
          email: data.email || email
        });
      }
      
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
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
        bg-linear-to-r from-[#7A2F12] via-[#8E3A18] to-[#9B3F1A]"
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
              className="w-full rounded-full px-5 py-3 bg-black/20 placeholder-white/70 outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              value={password}
              placeholder="Password"
              className="w-full rounded-full px-5 py-3 bg-black/20 placeholder-white/70 outline-none"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-200 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-white text-[#7A2F12] font-semibold
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
          from-[#9B3F1A] via-[#9B3F1A]/40 to-transparent"
        ></div>
      </section>
    </main>
  );
}