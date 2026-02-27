"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://alpa-be-1.onrender.com";

// Country list: { code, flag, name, dialCode, digits: [min, max] }
const COUNTRIES = [
  {
    code: "AU",
    flag: "🇦🇺",
    name: "Australia",
    dialCode: "+61",
    digits: [9, 9],
  },
  {
    code: "US",
    flag: "🇺🇸",
    name: "United States",
    dialCode: "+1",
    digits: [10, 10],
  },
  {
    code: "GB",
    flag: "🇬🇧",
    name: "United Kingdom",
    dialCode: "+44",
    digits: [10, 10],
  },
  { code: "IN", flag: "🇮🇳", name: "India", dialCode: "+91", digits: [10, 10] },
  { code: "CA", flag: "🇨🇦", name: "Canada", dialCode: "+1", digits: [10, 10] },
  {
    code: "NZ",
    flag: "🇳🇿",
    name: "New Zealand",
    dialCode: "+64",
    digits: [8, 9],
  },
  {
    code: "SG",
    flag: "🇸🇬",
    name: "Singapore",
    dialCode: "+65",
    digits: [8, 8],
  },
  { code: "AE", flag: "🇦🇪", name: "UAE", dialCode: "+971", digits: [9, 9] },
  {
    code: "SA",
    flag: "🇸🇦",
    name: "Saudi Arabia",
    dialCode: "+966",
    digits: [9, 9],
  },
  {
    code: "DE",
    flag: "🇩🇪",
    name: "Germany",
    dialCode: "+49",
    digits: [10, 11],
  },
  { code: "FR", flag: "🇫🇷", name: "France", dialCode: "+33", digits: [9, 9] },
  { code: "JP", flag: "🇯🇵", name: "Japan", dialCode: "+81", digits: [10, 11] },
  { code: "CN", flag: "🇨🇳", name: "China", dialCode: "+86", digits: [11, 11] },
  { code: "BR", flag: "🇧🇷", name: "Brazil", dialCode: "+55", digits: [10, 11] },
  {
    code: "ZA",
    flag: "🇿🇦",
    name: "South Africa",
    dialCode: "+27",
    digits: [9, 10],
  },
  {
    code: "PK",
    flag: "🇵🇰",
    name: "Pakistan",
    dialCode: "+92",
    digits: [10, 10],
  },
  {
    code: "NG",
    flag: "🇳🇬",
    name: "Nigeria",
    dialCode: "+234",
    digits: [10, 10],
  },
  {
    code: "PH",
    flag: "🇵🇭",
    name: "Philippines",
    dialCode: "+63",
    digits: [10, 10],
  },
  {
    code: "MY",
    flag: "🇲🇾",
    name: "Malaysia",
    dialCode: "+60",
    digits: [9, 10],
  },
  {
    code: "ID",
    flag: "🇮🇩",
    name: "Indonesia",
    dialCode: "+62",
    digits: [9, 12],
  },
] as const;

type Country = (typeof COUNTRIES)[number];

function validatePhone(digits: string, country: Country): string | null {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "Mobile number is required";
  const [min, max] = country.digits;
  if (clean.length < min)
    return `Too short — ${country.name} numbers need ${min} digits`;
  if (clean.length > max)
    return `Too long — ${country.name} numbers need ${max} digits`;
  return null;
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Please enter a valid email address";
  return null;
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-level touched state
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
  });

  // Phone state
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const role = "customer";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Inline validation errors
  const emailError = validateEmail(formData.email);
  const phoneError = validatePhone(phoneNumber, selectedCountry);
  const passwordError =
    formData.password.length > 0 && formData.password.length < 6
      ? "Password must be at least 6 characters"
      : null;
  const confirmPwError =
    formData.confirmPassword && formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : null;

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch),
  );

  const touchField = (f: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [f]: true }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value.replace(/[^\d\s\-().]/g, ""));
  };

  const validateForm = () => {
    // Touch all fields to show errors
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
    });

    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (emailError) {
      setError(emailError);
      return false;
    }
    if (phoneError) {
      setError(phoneError);
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (passwordError) {
      setError(passwordError);
      return false;
    }
    if (!formData.confirmPassword) {
      setError("Please confirm your password");
      return false;
    }
    if (confirmPwError) {
      setError(confirmPwError);
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
          mobile: `${selectedCountry.dialCode} ${phoneNumber}`.trim(),
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      router.push(`/signup-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: input border class
  const inputClass = (
    touchedFlag: boolean,
    err: string | null,
    value: string,
  ) => {
    const base =
      "w-full rounded-full px-4 py-3 bg-[#873007] text-white placeholder-gray-400 border focus:outline-none focus:ring-1 transition-all text-sm";
    if (!touchedFlag)
      return `${base} border-white/10 focus:border-white/30 focus:ring-white/20`;
    if (err)
      return `${base} border-red-400 focus:border-red-400 focus:ring-red-400/20`;
    if (value)
      return `${base} border-emerald-400/70 focus:border-emerald-400 focus:ring-emerald-400/20`;
    return `${base} border-white/10 focus:border-white/30 focus:ring-white/20`;
  };

  return (
    
    <main className="min-h-screen w-full overflow-hidden bg-linear-to-r
  from-[#440C03]
  via-[#440C03]
  to-[#440C03]">
      {/* Left side - Form */}
      <div className="flex min-h-screen max-w-screen-2xl ml-auto pl-20">
      <section
        className="
  w-full md:w-1/2 
  px-1 md:px-20 text-white
"
      >
        <div className="absolute top-6 left-4 md:left-8">
          <Link href="/">
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              width={90}
              height={90}
              className="hover:opacity-90 transition-opacity w-20"
            />
          </Link>
        </div>

        <div className="max-w-lg py-20">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Create new Account
          </h1>
          <div className="pt-4 border-t border-white/10">
            <p className="text-left text-white/80 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white font-semibold hover:text-gray-200 hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>

          <form className="space-y-4 mt-12" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Name</p>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => touchField("name")}
                placeholder="Enter your full name"
                required
                className={inputClass(
                  touched.name,
                  !formData.name.trim() ? "required" : null,
                  formData.name,
                )}
              />
              {touched.name && !formData.name.trim() && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ Name is required
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Email</p>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => touchField("email")}
                placeholder="Enter your email address"
                type="text"
                required
                className={inputClass(
                  touched.email,
                  emailError,
                  formData.email,
                )}
              />
              {touched.email && emailError && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ {emailError}
                </p>
              )}
              {touched.email && !emailError && formData.email && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 pl-2">
                  ✓ Looks good
                </p>
              )}
            </div>

            {/* Mobile — country code + number */}
            <div className="space-y-1" ref={countryDropdownRef}>
              <p className="text-white/90 text-sm font-medium">Mobile No</p>
              <div
                className={`flex items-stretch rounded-full overflow-visible border transition-all ${
                  touched.phone && phoneError
                    ? "border-red-400"
                    : touched.phone && !phoneError && phoneNumber.trim()
                      ? "border-emerald-400/70"
                      : "border-white/10 focus-within:border-white/30"
                } bg-[#873007]`}
              >
                {/* Country picker button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCountryDropdown((v) => !v);
                      setCountrySearch("");
                    }}
                    className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-white/20 hover:bg-white/10 transition rounded-l-full"
                  >
                    <span className="text-lg leading-none">
                      {selectedCountry.flag}
                    </span>
                    <span className="text-white/80 text-xs">
                      {selectedCountry.dialCode}
                    </span>
                    <span className="text-white/50 text-xs">▾</span>
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white border border-[#d6b896] rounded-xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-[#e8d5bc]">
                        <input
                          type="text"
                          autoFocus
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search country…"
                          className="w-full px-3 py-2 text-sm border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] bg-white text-gray-900"
                        />
                      </div>
                      <ul className="max-h-52 overflow-y-auto">
                        {filteredCountries.map((c) => (
                          <li key={c.code}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setShowCountryDropdown(false);
                                setCountrySearch("");
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#5A1E12]/5 text-left transition ${
                                c.code === selectedCountry.code
                                  ? "bg-[#5A1E12]/10 font-medium text-[#5A1E12]"
                                  : "text-gray-700"
                              }`}
                            >
                              <span className="text-base w-6 shrink-0">
                                {c.flag}
                              </span>
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-gray-400 text-xs shrink-0">
                                {c.dialCode}
                              </span>
                            </button>
                          </li>
                        ))}
                        {filteredCountries.length === 0 && (
                          <li className="px-3 py-4 text-sm text-gray-400 text-center">
                            No countries found
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => touchField("phone")}
                  placeholder={`${selectedCountry.digits[0]}-digit number`}
                  className="flex-1 px-4 py-3 text-sm text-white bg-transparent outline-none placeholder:text-gray-400 rounded-r-full"
                />
              </div>
              {touched.phone && phoneError && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ {phoneError}
                </p>
              )}
              {touched.phone && !phoneError && phoneNumber.trim() && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 pl-2">
                  ✓ Looks good
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Password</p>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => touchField("password")}
                  placeholder="Create a password (min 6 characters)"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className={`${inputClass(touched.password, passwordError, formData.password)} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {touched.password && passwordError && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ {passwordError}
                </p>
              )}
              {touched.password && !passwordError && formData.password && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 pl-2">
                  ✓ Strong enough
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">
                Confirm Password
              </p>
              <div className="relative">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => touchField("confirmPassword")}
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`${inputClass(touched.confirmPassword, confirmPwError, formData.confirmPassword)} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && confirmPwError && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ {confirmPwError}
                </p>
              )}
              {touched.confirmPassword &&
                !confirmPwError &&
                formData.confirmPassword && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 pl-2">
                    ✓ Passwords match
                  </p>
                )}
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
              className="w-full bg-white text-[#7A2F12] font-semibold rounded-full py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-2"
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
        <div
          className="absolute inset-0 bg-linear-to-r
               from-[#440C03] via-[#440C03]/40 to-transparent"
        ></div>
      </section>
      </div>
    </main>
    
  );
}
