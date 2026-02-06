"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://alpa-be-1.onrender.com";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const role = "customer";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Redirect to OTP verification
      router.push(`/signup-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex overflow-hidden">
      {/* Left side - Form */}
      <section
        className="
  relative w-full md:w-1/2 flex flex-col justify-center
  px-1 md:px-20 text-white
  bg-linear-to-r
  from-[#440C03]
  via-[#440C03]
  to-[#440C03]
"
      >
        <div className="absolute top-6 left-4 md:left-8">
          <Link href="/">
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              width={90}
              height={90}
              className="hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        <div className="max-w-7xl mt-20">
          {/* <p className="text-sm text-white/80 mb-1">START FOR FREE</p> */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Create new Account
          </h1>
          <div className="pt-4 border-t border-white/10">
            <p className="text-center text-white/80 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white font-semibold hover:text-gray-200 hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Name</p>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-120 rounded-full px-4 py-3 bg-[#873007] text-white placeholder-gray-400 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
              />
            </div>

            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Email</p>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                type="email"
                required
                className="w-120 rounded-full px-4 py-3 bg-[#873007] text-white placeholder-gray-400 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
              />
            </div>

            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Mobile No</p>
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                required
                className="w-120 rounded-full px-4 py-3 bg-[#873007] text-white placeholder-gray-400 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
              />
            </div>

            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Password</p>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min 6 characters)"
                type="password"
                required
                minLength={6}
                className="w-120 rounded-full px-4 py-3 bg-[#873007]  text-white placeholder-gray-400 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
              />
            </div>

            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">
                Confirm Password
              </p>
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                type="password"
                required
                className="w-120 rounded-full px-4 py-3 bg-[#873007]  text-white placeholder-gray-400 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-red-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-300 text-xs font-medium">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-120 bg-white text-[#7A2F12] font-semibold rounded-full py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Sign Up
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Right side - Image */}
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
