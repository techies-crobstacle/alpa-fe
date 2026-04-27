"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2, Tag, X, CheckCircle, ChevronRight } from "lucide-react";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { couponsApi, ValidatedCoupon } from "@/lib/api";
import { guestCartUtils } from "@/lib/guestCartUtils";
import GuestStripePaymentForm from "@/components/checkout/GuestStripePaymentForm";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

// Add Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
}

// ─── Dynamic location types ───────────────────────────────────────────────
interface ApiCountry {
  id: number; name: string; iso2: string; phone_code: string;
}
interface ApiState {
  id: number; name: string; iso2: string;
}
interface ApiCity {
  id: number; name: string;
}

// Module-level cache shared with addressCart
let cachedGuestCountries: ApiCountry[] = [];

// Dynamic label terminology
const addressTerminology: Record<string, { state: string; city: string }> = {
  AU: { state: "State/Territory", city: "Suburb" },
  US: { state: "State", city: "City" },
  CA: { state: "Province", city: "City" },
  GB: { state: "County", city: "Town/City" },
  IN: { state: "State", city: "City" },
  default: { state: "State/Province", city: "City" },
};

// ─── Country data from react-phone-number-input ───────────────────────────
const countryCodeList = getCountries();

// Generate flag emoji from ISO2 code using Unicode regional indicator symbols.
// Works for every valid ISO 3166-1 alpha-2 code without a manual map.
const getFlagEmoji = (iso2: string): string =>
  iso2.toUpperCase().replace(/./g, ch =>
    String.fromCodePoint(127397 + ch.charCodeAt(0))
  );

// Use Intl.DisplayNames for localised country names (available in all modern runtimes).
const _regionNames = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;
const getCountryName = (iso2: string): string =>
  (_regionNames?.of(iso2)) ?? iso2;

// Build COUNTRIES array — all countries supported by react-phone-number-input
const COUNTRIES_RAW = countryCodeList.map(code => ({
  code,
  flag: getFlagEmoji(code),
  name: getCountryName(code),
  dialCode: `+${getCountryCallingCode(code as CountryCode)}`,
}));

// Reorder to put Australia first
const auIndex = COUNTRIES_RAW.findIndex(country => country.code === 'AU');
const COUNTRIES = auIndex !== -1 
  ? [COUNTRIES_RAW[auIndex], ...COUNTRIES_RAW.filter(country => country.code !== 'AU')]
  : COUNTRIES_RAW;

type Country = typeof COUNTRIES[number];

// Phone validation using react-phone-number-input
function validatePhone(digits: string, country: Country): string | null {
  if (!digits.trim()) return 'Phone number is required.';
  
  // Create a full phone number with country calling code for validation
  const fullNumber = `${country.dialCode}${digits.replace(/\D/g, '')}`;
  
  try {
    const phoneNumber = parsePhoneNumberFromString(fullNumber);
    if (!phoneNumber) return 'Invalid phone number format.';
    
    const isValid = isValidPhoneNumber(fullNumber);
    if (!isValid) return `Invalid ${country.name} phone number.`;
    
    return null;
  } catch (error) {
    return 'Invalid phone number format.';
  }
}

const stripePromise = loadStripe(
  "pk_test_51SzBiiFXXR0MHwRIutvfNBi6ADMB8qZ5UNXswOwLzlIOgLfy1qVuTciKWGaBtWyJrDBkkZVVclg477Wv8KuEGdp800PKT4ny3K"
);

interface OrderSummary {
  subtotal: string;
  subtotalExGST?: string;
  shippingCost: string;
  gstPercentage: string;
  gstAmount: string;
  grandTotal: string;
  originalTotal?: string;
  couponCode?: string;
  discountAmount?: string;
}

export default function GuestCheckoutForm() {
  const router = useRouter();

  // ── Stripe redirect-return detection ─────────────────────────────────────
  // When a redirect-based method (Klarna, Zip, Link) completes, Stripe lands
  // back on this page with ?payment_intent=...&redirect_status=succeeded.
  // We must handle this BEFORE any other Stripe logic runs.
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);
  const [redirectError,        setRedirectError]        = useState<string | null>(null);

  useEffect(() => {
    const params         = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");
    const paymentIntentId = params.get("payment_intent");

    if (!redirectStatus || !paymentIntentId) return; // normal first load

    if (redirectStatus === "succeeded") {
      setIsProcessingRedirect(true);
      const customerEmail = sessionStorage.getItem("guestEmail");
      const storedOrderId = sessionStorage.getItem("guestOrderId");

      if (!customerEmail) {
        setRedirectError("Could not find your session. Please check your email for order confirmation.");
        setIsProcessingRedirect(false);
        return;
      }

      // Confirm with backend — do NOT call stripe.confirmPayment() again
      fetch("https://alpa-be.onrender.com/api/payments/guest/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, customerEmail }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            sessionStorage.removeItem("guestEmail");
            sessionStorage.removeItem("guestOrderId");
            guestCartUtils.clearGuestCart();
            sessionStorage.setItem("guestOrderId",    data.orderId || storedOrderId || "");
            sessionStorage.setItem("guestOrderEmail", customerEmail);
            if (data.displayId) sessionStorage.setItem("guestOrderDisplayId", data.displayId);
            router.push("/guest/order-success");
          } else {
            setRedirectError(data.message || "Payment confirmation failed. Please contact support.");
            setIsProcessingRedirect(false);
          }
        })
        .catch(() => {
          setRedirectError("Network error confirming payment. Please contact support.");
          setIsProcessingRedirect(false);
        });

    } else if (redirectStatus === "failed") {
      setRedirectError("Your payment was declined. Please try a different payment method.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Use the same cart hook the cart page uses ─────────────────────────────
  const {
    cartData,
    selectedShipping,
    setSelectedShipping,
    loading: cartLoading,
    calculateTotals,
  } = useSharedEnhancedCart();

  const cartItems = cartData?.cart || [];
  // Filter out COD options so guests only see real shipping methods
  const shippingMethods = (cartData?.availableShipping || []).filter(
    (s) => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name)
  );
  const { subtotal, shippingCost, gstAmount, gstPercentage, grandTotal } = calculateTotals;

  // ── Form fields ───────────────────────────────────────────────────────────
  const [customerName,  setCustomerName]  = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine,   setAddressLine]   = useState("");
  const [zipCode,       setZipCode]       = useState("");

  // ── Dynamic location state ────────────────────────────────────────────────
  const [locationCountries,   setLocationCountries]   = useState<ApiCountry[]>([]);
  const [locationStates,      setLocationStates]      = useState<ApiState[]>([]);
  const [locationCities,      setLocationCities]      = useState<ApiCity[]>([]);
  const [selectedCountryIso,  setSelectedCountryIso]  = useState("AU");
  const [selectedStateIso,    setSelectedStateIso]    = useState("");
  const [country,             setCountry]             = useState("Australia");
  const [state,               setState]               = useState("");
  const [city,                setCity]                = useState("");
  const locationLabels = addressTerminology[selectedCountryIso] || addressTerminology.default;
  // ── Location custom dropdowns ─────────────────────────────────────────────
  const [locCountryOpen,   setLocCountryOpen]   = useState(false);
  const [locStateOpen,     setLocStateOpen]     = useState(false);
  const [locCityOpen,      setLocCityOpen]      = useState(false);
  const [locCountrySearch, setLocCountrySearch] = useState("");
  const [locStateSearch,   setLocStateSearch]   = useState("");
  const [locCitySearch,    setLocCitySearch]    = useState("");
  const [locCountryHL,     setLocCountryHL]     = useState(0);
  const [locStateHL,       setLocStateHL]       = useState(0);
  const [locCityHL,        setLocCityHL]        = useState(0);
  const locCountryRef  = useRef<HTMLDivElement>(null);
  const locStateRef    = useRef<HTMLDivElement>(null);
  const locCityRef     = useRef<HTMLDivElement>(null);
  const locCountryListRef = useRef<HTMLUListElement>(null);
  const locStateListRef   = useRef<HTMLUListElement>(null);
  const locCityListRef    = useRef<HTMLUListElement>(null);

  // ── Phone number with country code ──────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default to Australia
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneHighlight, setPhoneHighlight] = useState(0);
  const phoneListRef = useRef<HTMLUListElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  // ── Google Places Autocomplete ────────────────────────────────────────────
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);

  // ── Coupon ────────────────────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Pre-populate coupon applied on the cart page (only if cart still meets minimum)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cartAppliedCoupon");
      if (saved) {
        const parsed = JSON.parse(saved);
        setAppliedCoupon(parsed);
      }
    } catch {}
  }, []);

  // Auto-invalidate coupon if cart subtotal drops below the coupon's minimum
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minCartValue) {
      const removedCode = appliedCoupon.code;
      const minVal = appliedCoupon.minCartValue;
      setAppliedCoupon(null);
      setCouponCode(removedCode);
      setCouponError(
        `Coupon "${removedCode}" requires a minimum cart value of $${minVal.toFixed(2)}. It has been removed.`
      );
      localStorage.removeItem("cartAppliedCoupon");
    }
  }, [subtotal, appliedCoupon]);

  // ── Steps ─────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<"form" | "payment">("form");

  // ── Stripe state ──────────────────────────────────────────────────────────
  const [clientSecret,          setClientSecret]          = useState<string | null>(null);
  const [paymentIntentId,       setPaymentIntentId]       = useState<string | null>(null);
  const [stripeAmount,          setStripeAmount]          = useState(0);
  const [stripeCurrency,        setStripeCurrency]        = useState("aud");
  const [confirmedOrderId,      setConfirmedOrderId]      = useState("");
  const [confirmedOrderSummary, setConfirmedOrderSummary] = useState<OrderSummary | null>(null);
  const [isCreatingIntent,      setIsCreatingIntent]      = useState(false);

  // ── Field errors ──────────────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [zipCodeStateError, setZipCodeStateError] = useState<string | null>(null);
  // ── Phone number handlers ───────────────────────────────────────────────────
  const handlePhoneChange = (value: string) => {
    // Only allow digits, spaces, hyphens, parentheses
    const cleaned = value.replace(/[^\d\s\-().]/g, "");
    setPhoneNumber(cleaned);
    if (phoneTouched) {
      setPhoneError(validatePhone(cleaned, selectedCountry));
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setCountrySearch("");
    if (phoneTouched && phoneNumber) {
      setPhoneError(validatePhone(phoneNumber, country));
    }
  };

  // ── Close country dropdown on outside click ────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
      if (locCountryRef.current && !locCountryRef.current.contains(e.target as Node)) { setLocCountryOpen(false); setLocCountrySearch(""); }
      if (locStateRef.current   && !locStateRef.current.contains(e.target as Node))   setLocStateOpen(false);
      if (locCityRef.current    && !locCityRef.current.contains(e.target as Node))     setLocCityOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // ── Dynamic location: fetch countries once ────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (cachedGuestCountries.length > 0) {
        setLocationCountries(cachedGuestCountries);
        return;
      }
      try {
        const data = await apiClient.get('/location/countries') as { data: ApiCountry[] };
        cachedGuestCountries = data.data || [];
        setLocationCountries(cachedGuestCountries);
      } catch { /* silently skip */ }
    };
    load();
  }, []);

  // ── Dynamic location: auto-select Australia and load its states ───────────
  useEffect(() => {
    if (locationCountries.length === 0) return;
    const au = locationCountries.find(c => c.iso2 === 'AU');
    if (au && !selectedStateIso) {
      apiClient.get(`/location/countries/AU/states`)
        .then((d: any) => setLocationStates(d.data || []))
        .catch(() => {});
    }
  }, [locationCountries]);

  // ── Dynamic location: handlers ────────────────────────────────────────────
  const handleLocationCountryChange = async (iso2: string) => {
    const found = locationCountries.find(c => c.iso2 === iso2);
    const name = found?.name || iso2;
    setSelectedCountryIso(iso2);
    setCountry(name);
    setState("");
    setCity("");
    setSelectedStateIso("");
    setLocationStates([]);
    setLocationCities([]);
    setZipCodeStateError(null);
    // Sync phone country code
    const phoneC = COUNTRIES.find(c => c.code === iso2);
    if (phoneC) setSelectedCountry(phoneC);
    if (!iso2) return;
    try {
      const data = await apiClient.get(`/location/countries/${iso2}/states`) as { data: ApiState[] };
      setLocationStates(data.data || []);
    } catch { /* silently skip */ }
  };

  const handleLocationStateChange = async (iso2: string) => {
    const found = locationStates.find(s => s.iso2 === iso2);
    const name = found?.name || iso2;
    setSelectedStateIso(iso2);
    setState(name);
    setCity("");
    setLocationCities([]);
    setZipCodeStateError(null);
    if (!iso2 || !selectedCountryIso) return;
    try {
      const data = await apiClient.get(`/location/countries/${selectedCountryIso}/states/${iso2}/cities`) as { data: ApiCity[] };
      setLocationCities(data.data || []);
    } catch { /* silently skip */ }
  };
  // ── Google Places Autocomplete Setup ──────────────────────────────────────
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found. Address autocomplete will not work.');
      return;
    }

    const attachAutocomplete = () => {
      if (!addressInputRef.current || autocompleteInstanceRef.current) return;
      if (!window.google?.maps?.places?.Autocomplete) return;

      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["address"],
        fields: ["formatted_address", "address_components"],
        componentRestrictions: selectedCountryIso ? { country: selectedCountryIso.toLowerCase() } : undefined,
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place?.address_components) return;

        const getComponent = (type: string) =>
          place.address_components.find((c: any) => c.types.includes(type))?.long_name || "";
        
        const getShortComponent = (type: string) =>
          place.address_components.find((c: any) => c.types.includes(type))?.short_name || "";

        // Build street address: split by comma, strip only the parts that exactly
        // match city, state, postcode or country — keep everything else (neighbourhoods,
        // sublocalities, landmarks, etc.)
        const cityName     = getComponent("locality") || getComponent("administrative_area_level_2");
        const stateLong    = getComponent("administrative_area_level_1");
        const stateShort   = getShortComponent("administrative_area_level_1");
        const postalCode   = getComponent("postal_code");
        const countryName  = getComponent("country");
        const formattedAddr = place.formatted_address || "";

        const stripTerms = new Set(
          [cityName, stateLong, stateShort, postalCode, countryName]
            .filter(Boolean)
            .map((t: string) => t.toLowerCase())
        );
        const streetParts = formattedAddr
          .split(",")
          .map((p: string) => p.trim())
          .filter((p: string) => p && !stripTerms.has(p.toLowerCase()));
        const streetOnly = streetParts.join(", ") || formattedAddr.split(",")[0].trim();

        // Override Google's full-address fill directly on the DOM node
        // so the controlled input never shows the extra city/state/country
        if (addressInputRef.current) addressInputRef.current.value = streetOnly;
        setAddressLine(streetOnly);
        setCity(cityName);
        setState(getComponent("administrative_area_level_1"));
        setZipCode(getComponent("postal_code"));
        setCountry(getComponent("country"));

        // Clear any existing field errors when autocomplete fills the form
        setFieldErrors({});
      });

      autocompleteInstanceRef.current = autocomplete;
    };

    // Check if Google Maps is already loaded
    if (window.google?.maps?.places?.Autocomplete) {
      attachAutocomplete();
      return;
    }

    // Check if script is already injected
    if (document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)) {
      const poll = setInterval(() => {
        if (window.google?.maps?.places?.Autocomplete) {
          attachAutocomplete();
          clearInterval(poll);
        }
      }, 150);
      return () => clearInterval(poll);
    }

    // Inject Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = attachAutocomplete;
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (autocompleteInstanceRef.current) {
        window.google?.maps?.event?.clearInstanceListeners?.(autocompleteInstanceRef.current);
        autocompleteInstanceRef.current = null;
      }
    };
  }, []);

  // ── Update autocomplete country restriction when country dropdown changes ─
  useEffect(() => {
    if (!autocompleteInstanceRef.current || !selectedCountryIso) return;
    autocompleteInstanceRef.current.setComponentRestrictions({
      country: selectedCountryIso.toLowerCase(),
    });
  }, [selectedCountryIso]);

  // Final total after coupon — recomputed dynamically whenever grandTotal changes
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? (appliedCoupon.maxDiscount > 0
          ? Math.min((grandTotal * appliedCoupon.discountValue) / 100, appliedCoupon.maxDiscount)
          : (grandTotal * appliedCoupon.discountValue) / 100)
      : Math.min(appliedCoupon.discountValue, grandTotal)
    : 0;
  const finalTotal     = Math.max(0, grandTotal - discountAmount);

  // ── Coupon handlers ───────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) { setCouponError("Please enter a coupon code."); return; }
    setCouponError("");
    setIsValidatingCoupon(true);
    try {
      const data = await couponsApi.validateCoupon(code, grandTotal);
      if (!data.success || !data.coupon) {
        setCouponError(data.message || "Invalid coupon code.");
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(data.coupon);
      localStorage.setItem("cartAppliedCoupon", JSON.stringify(data.coupon));
    } catch {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    localStorage.removeItem("cartAppliedCoupon");
  };

  // ── Postcode ↔ State validation (fully dynamic, no hardcoding) ─────────────
  // Strategy (ordered by reliability):
  //   1. Google Geocoder   — primary: already loaded, most accurate, current data.
  //                          Crucially, it can return multiple results for shared postcodes.
  //   2. api.zippopotam.us — fallback: free, no key, 60+ countries
  //   3. Silent pass       — if both unavailable (network error / timeout)
  const validateZipForState = async (zip: string, stateVal: string, countryIso: string): Promise<string | null> => {
    if (!zip.trim() || !stateVal.trim() || !countryIso) return null;
    const entered = stateVal.toLowerCase().trim();

    // ── Helper: normalised string match ───────────────────────────────────
    const isMatch = (a: string, b: string) =>
      a === b || a.includes(b) || b.includes(a);

    // ── 1. Google Geocoder (primary) ───────────────────────────────────────
    if (typeof window !== "undefined") {
      const geocoder = await new Promise<any | null>((resolve) => {
        if (window.google?.maps?.Geocoder) { resolve(new window.google.maps.Geocoder()); return; }
        let elapsed = 0;
        const poll = setInterval(() => {
          elapsed += 200;
          if (window.google?.maps?.Geocoder) { clearInterval(poll); resolve(new window.google.maps.Geocoder()); }
          else if (elapsed >= 5000) { clearInterval(poll); resolve(null); }
        }, 200);
      });

      if (geocoder) {
        const googleStates: string[] = await new Promise((resolve) => {
          geocoder.geocode(
            { componentRestrictions: { country: countryIso.toLowerCase(), postalCode: zip.trim() } },
            (results: any[], status: any) => {
              if (status !== "OK" || !results?.length) { resolve([]); return; }
              // For shared postcodes, Google returns multiple results. Collect all unique state names.
              const states = new Set<string>();
              for (const result of results) {
                const adminArea = result.address_components?.find(
                  (c: any) => c.types.includes("administrative_area_level_1")
                );
                if (adminArea?.long_name) {
                  states.add(adminArea.long_name.toLowerCase().trim());
                }
              }
              resolve(Array.from(states));
            }
          );
        });

        if (googleStates.length > 0) {
          const isValid = googleStates.some(gState => isMatch(gState, entered));
          if (isValid) return null; // ✓ Google confirms valid

          // Invalid: show a generic error message
          return `Please enter a valid postcode for the selected state.`;
        }
        // Google returned no result for this postcode — fall through to zippopotam
      }
    }

    // ── 2. Zippopotam (fallback when Google is unavailable) ────────────────
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `https://api.zippopotam.us/${countryIso.toLowerCase()}/${zip.trim()}`,
        { signal: controller.signal }
      );
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const places: Array<{ state: string; "state abbreviation": string }> = data.places || [];
        if (places.length > 0) {
          const matched = places.some((p) => {
            const full = (p.state || "").toLowerCase().trim();
            const abbr = (p["state abbreviation"] || "").toLowerCase().trim();
            return isMatch(full, entered) || isMatch(abbr, entered);
          });
          if (!matched) {
            return `Please enter a valid postcode for ${stateVal}.`;
          }
          return null; // ✓ zippopotam confirms valid
        }
      } else if (res.status === 404) {
        return `The entered postcode was not found for the selected country.`;
      }
    } catch {
      // Network / timeout — fall through to silent pass
    }

    // Both sources unavailable — don't block the user
    return null;
  };

  // ── Form validation ───────────────────────────────────────────────────────
  const validateForm = (overrideZipError?: string | null): boolean | string => {
    const errors: Record<string, string> = {};
    if (!customerName.trim())  errors.customerName  = "Full name is required.";
    if (!customerEmail.trim()) errors.customerEmail = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
      errors.customerEmail = "Invalid email address.";
    
    // Enhanced phone validation
    if (!phoneNumber.trim()) {
      errors.customerPhone = "Phone number is required.";
    } else {
      const phoneValidationError = validatePhone(phoneNumber, selectedCountry);
      if (phoneValidationError) {
        errors.customerPhone = phoneValidationError;
      }
    }
    
    if (!country.trim())       errors.country       = "Country is required.";
    if (!addressLine.trim())   errors.addressLine   = "Address is required.";
    if (!state.trim())         errors.state         = `${locationLabels.state} is required.`;
    if (!city.trim())          errors.city          = `${locationLabels.city} is required.`;
    if (!zipCode.trim())       errors.zipCode       = "Postcode is required.";
    // Postcode ↔ state cross-field validation
    const zipErr = overrideZipError !== undefined ? overrideZipError : zipCodeStateError;
    if (!errors.zipCode && zipErr) errors.zipCode = zipErr;
    if (!selectedShipping)     errors.shippingMethodId = "Please select a shipping method.";
    setFieldErrors(errors);
    
    // Return the first error message for toast display, or true if no errors
    const errorMessages = Object.values(errors);
    if (errorMessages.length > 0) {
      return errorMessages[0]; // Return first error message
    }
    return true; // No errors
  };

  // ── Step A: Create PaymentIntent ──────────────────────────────────────────
  const handleContinueToPayment = async () => {
    // Run async postcode ↔ state validation before the synchronous form check
    let asyncZipError: string | null = null;
    if (zipCode.trim() && state.trim() && selectedCountryIso) {
      asyncZipError = await validateZipForState(zipCode, state, selectedCountryIso);
      setZipCodeStateError(asyncZipError);
    }
    const validationResult = validateForm(asyncZipError);
    if (validationResult !== true) { 
      toast.error(typeof validationResult === 'string' ? validationResult : "Please fill in all required fields."); 
      return; 
    }
    if (cartItems.length === 0) { toast.error("Your cart is empty."); return; }

    setIsCreatingIntent(true);
    try {
      const gstId = cartData?.gst?.id;
      const body: Record<string, unknown> = {
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerName:  customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: `${selectedCountry.dialCode} ${phoneNumber}`.trim(),
        shippingAddress: {
          addressLine: addressLine.trim(),
          city:   city.trim(),
          state:  state.trim(),
          country,
          zipCode: zipCode.trim(),
        },
        shippingMethodId: selectedShipping!.id,
        country,
        city:         city.trim(),
        state:        state.trim(),
        zipCode:      zipCode.trim(),
        mobileNumber: `${selectedCountry.dialCode} ${phoneNumber}`.trim(),
        paymentMethod: "credit/debit card",
        ...(gstId && { gstId }),
        ...(appliedCoupon?.code && { couponCode: appliedCoupon.code }),
      };

      console.log("=== GUEST ORDER DEBUG ===");
      console.log("Frontend calculated totals:", { subtotal, shippingCost, gstAmount, grandTotal });
      console.log("Cart items:", cartItems);
      console.log("Request body being sent:", body);

      const res  = await fetch("https://alpa-be.onrender.com/api/payments/guest/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      console.log("Backend response:", data);
      console.log("Backend order summary:", data.orderSummary);

      if (!res.ok || !data.success) {
        const msg = data.message || data.error || "Failed to create payment. Please try again.";
        toast.error(msg);
        if (msg.toLowerCase().includes("coupon")) {
          setCouponError(msg); setAppliedCoupon(null); setCouponCode("");
        }
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setStripeAmount(data.amount);
      setStripeCurrency(data.currency || "aud");
      setConfirmedOrderId(data.orderId);
      setConfirmedOrderSummary(data.orderSummary);
      
      // Validation: Check if backend returned proper totals
      const backendTotal = parseFloat(data.orderSummary?.grandTotal || "0");
      const frontendTotal = parseFloat(String(grandTotal) || "0");
      if (backendTotal === 0 && frontendTotal > 0) {
        console.error("❌ TOTAL MISMATCH: Backend returned $0 but frontend calculated $" + frontendTotal);
        toast.error(`Order total calculation error. Expected $${frontendTotal.toFixed(2)} but received $0.00. Please contact support.`);
      }
      
      setCurrentStep("payment");

      sessionStorage.setItem("guestOrderId",    data.orderId);
      sessionStorage.setItem("guestOrderEmail", customerEmail.trim());
      if (data.displayId) sessionStorage.setItem("guestOrderDisplayId", data.displayId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment.");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  // ── Loading / empty states ────────────────────────────────────────────────
  // Redirect return: show a full-screen loader while we confirm with the backend
  if (isProcessingRedirect) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#5A1E12]/70">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A1E12]" />
        <p className="text-lg font-medium">Confirming your payment…</p>
        <p className="text-sm">Please do not close this page.</p>
      </div>
    );
  }

  // Redirect return: payment failed or session expired
  if (redirectError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-md mx-auto text-center">
        <p className="text-[#5A1E12] text-lg font-semibold">Payment issue</p>
        <p className="text-sm text-[#5A1E12]/70">{redirectError}</p>
        <Link href="/checkout" className="px-6 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] transition">
          Try Again
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#5A1E12]/60">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading checkout...</span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[#5A1E12] text-lg font-medium">Your cart is empty.</p>
        <Link href="/shop" className="px-6 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-screen bg-[#ead7b7]">

      {/* ================= LEFT: FORM / PAYMENT ================= */}
      <div className="flex-1 px-4 md:px-8 lg:px-12 pt-20 pb-8">

        {/* Breadcrumb + header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[#5A1E12]/60 mb-4">
            <span className={currentStep === "form" ? "font-bold text-[#5A1E12]" : ""}>1. Your Details</span>
            <ChevronRight className="w-4 h-4" />
            <span className={currentStep === "payment" ? "font-bold text-[#5A1E12]" : ""}>2. Payment</span>
          </div>
          <h2 className="text-2xl font-bold text-[#5A1E12]">
            {currentStep === "form" ? "Guest Checkout" : "Complete Payment"}
          </h2>
          <p className="text-[#5A1E12]/60 text-sm mt-1">
            {currentStep === "form"
              ? "Fill in your details below to proceed."
              : "Enter your card details to securely complete your order."}
          </p>
          {/* <p className="text-sm mt-2 text-[#5A1E12]/70">
            Have an account?{" "}
            <Link href="/login" className="underline font-semibold text-[#5A1E12] hover:text-[#441208]">Log in</Link>
            {" "}or{" "}
            <Link href="/signup" className="underline font-semibold text-[#5A1E12] hover:text-[#441208]">Create Account</Link>
          </p> */}
        </div>

        {/* STEP 1: FORM */}
        {currentStep === "form" && (
          <div className="space-y-6 bg-white rounded-2xl p-6 shadow-sm">

            {/* Personal Details */}
            <div>
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Doe"
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.customerName ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                  {fieldErrors.customerName && <p className="mt-1 text-xs text-red-500">{fieldErrors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <div className={`flex items-stretch bg-white border rounded-lg overflow-visible transition-all ${
                    fieldErrors.customerPhone || phoneError ? "border-red-400" : "border-[#5A1E12]/20 hover:border-[#5A1E12]/50 focus-within:border-[#5A1E12] focus-within:ring-1 focus-within:ring-[#5A1E12]"
                  }`}>
                    {/* Country Code Dropdown */}
                    <div className="relative shrink-0" ref={countryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => { setShowCountryDropdown(v => !v); setCountrySearch(""); setPhoneHighlight(0); }}
                        className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-[#5A1E12]/20 hover:bg-black/5 transition rounded-l-lg"
                      >
                        <span className="text-lg leading-none">{selectedCountry.flag}</span>
                        <span className="text-gray-700 text-xs">{selectedCountry.dialCode}</span>
                        <span className="text-gray-400 text-xs">▾</span>
                      </button>

                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-[#d6b896] rounded-xl overflow-hidden shadow-lg">
                          <div className="p-2 border-b border-[#d6b896]/50">
                            <input
                              type="text"
                              autoFocus
                              value={countrySearch}
                              onChange={e => { setCountrySearch(e.target.value); setPhoneHighlight(0); }}
                              onKeyDown={e => {
                                if (e.key === "ArrowDown") { e.preventDefault(); setPhoneHighlight(i => { const next = Math.min(i + 1, filteredCountries.length - 1); phoneListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                                else if (e.key === "ArrowUp") { e.preventDefault(); setPhoneHighlight(i => { const prev = Math.max(i - 1, 0); phoneListRef.current?.children[prev]?.scrollIntoView({ block: "nearest" }); return prev; }); }
                                else if (e.key === "Enter" && filteredCountries[phoneHighlight]) { e.preventDefault(); handleCountrySelect(filteredCountries[phoneHighlight]); }
                                else if (e.key === "Escape") setShowCountryDropdown(false);
                              }}
                              placeholder="Search country…"
                              className="w-full px-3 py-2 text-sm bg-[#fdf6ee] border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] placeholder:text-gray-400"
                            />
                          </div>
                          <ul ref={phoneListRef} className="max-h-52 overflow-y-auto">
                            {filteredCountries.map((c, idx) => (
                              <li key={c.code} onMouseEnter={() => setPhoneHighlight(idx)}>
                                <button
                                  type="button"
                                  onMouseDown={() => handleCountrySelect(c)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                                    idx === phoneHighlight ? "bg-[#f5e6d3] text-[#5A1E12]"
                                    : c.code === selectedCountry.code ? "bg-[#5A1E12] text-white"
                                    : "text-gray-800 hover:bg-[#f5e6d3] hover:text-[#5A1E12]"
                                  }`}
                                >
                                  <span className="text-base w-6 shrink-0">{c.flag}</span>
                                  <span className="flex-1 truncate">{c.name}</span>
                                  <span className={`text-xs shrink-0 ${idx === phoneHighlight || c.code === selectedCountry.code ? "opacity-80" : "text-gray-400"}`}>{c.dialCode}</span>
                                </button>
                              </li>
                            ))}
                            {filteredCountries.length === 0 && (
                              <li className="px-4 py-4 text-sm text-gray-400 text-center">No countries found</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={() => {
                        setPhoneTouched(true);
                        if (phoneNumber) {
                          setPhoneError(validatePhone(phoneNumber, selectedCountry));
                        }
                      }}
                      placeholder="400 000 000"
                      className="flex-1 px-4 py-3 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                    />
                  </div>
                  {(fieldErrors.customerPhone || phoneError) && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.customerPhone || phoneError}</p>
                  )}
                  {!fieldErrors.customerPhone && !phoneError && phoneTouched && phoneNumber && (
                    <p className="mt-1 text-xs text-green-600">✓ Valid phone number</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#5A1E12] mb-1">Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="jane@example.com"
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.customerEmail ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                {fieldErrors.customerEmail && <p className="mt-1 text-xs text-red-500">{fieldErrors.customerEmail}</p>}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t border-[#5A1E12]/10 pt-6">
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Shipping Address</h3>
              <div className="space-y-4">
                {/* Country custom dropdown */}
                <div ref={locCountryRef}>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">Country <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setLocCountryOpen(o => !o); setLocCountrySearch(""); }}
                      className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-lg text-sm text-left transition-all focus:outline-none focus:ring-1 focus:ring-[#5A1E12] ${fieldErrors.country ? "border-red-400" : "border-[#5A1E12]/20 hover:border-[#5A1E12]/50"}`}
                    >
                      <span className={country ? "text-gray-900" : "text-gray-400"}>{country || "Select Country"}</span>
                      <svg className={`w-4 h-4 text-[#a08050] transition-transform ${locCountryOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {locCountryOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-[#d6b896] rounded-xl shadow-lg overflow-hidden">
                        <div className="p-2 border-b border-[#d6b896]/50">
                          <input
                            autoFocus
                            type="text"
                            value={locCountrySearch}
                            onChange={e => { setLocCountrySearch(e.target.value); setLocCountryHL(0); }}
                            onKeyDown={e => {
                              const filtered = locationCountries.filter(c => c.name.toLowerCase().includes(locCountrySearch.toLowerCase()));
                              if (e.key === "ArrowDown") { e.preventDefault(); setLocCountryHL(i => { const next = Math.min(i + 1, filtered.length - 1); locCountryListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                              else if (e.key === "ArrowUp") { e.preventDefault(); setLocCountryHL(i => { const prev = Math.max(i - 1, 0); locCountryListRef.current?.children[prev]?.scrollIntoView({ block: "nearest" }); return prev; }); }
                              else if (e.key === "Enter" && filtered[locCountryHL]) { e.preventDefault(); handleLocationCountryChange(filtered[locCountryHL].iso2); setLocCountryOpen(false); }
                              else if (e.key === "Escape") setLocCountryOpen(false);
                            }}
                            placeholder="Search country..."
                            className="w-full px-3 py-2 text-sm bg-[#fdf6ee] border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] placeholder:text-gray-400"
                          />
                        </div>
                        <ul ref={locCountryListRef} className="max-h-52 overflow-y-auto">
                          {locationCountries
                            .filter(c => c.name.toLowerCase().includes(locCountrySearch.toLowerCase()))
                            .map((c, idx) => (
                              <li
                                key={c.iso2}
                                onMouseEnter={() => setLocCountryHL(idx)}
                                onMouseDown={() => { handleLocationCountryChange(c.iso2); setLocCountryOpen(false); }}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                  idx === locCountryHL ? "bg-[#f5e6d3] text-[#5A1E12]"
                                  : selectedCountryIso === c.iso2 ? "bg-[#5A1E12] text-white"
                                  : "text-gray-800 hover:bg-[#f5e6d3] hover:text-[#5A1E12]"
                                }`}
                              >
                                {c.name}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {fieldErrors.country && <p className="mt-1 text-xs text-red-500">{fieldErrors.country}</p>}
                </div>

                {/* State custom dropdown (shown when states are available) */}
                {locationStates.length > 0 && (
                  <div ref={locStateRef}>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">{locationLabels.state} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setLocStateOpen(o => !o); setLocStateSearch(""); }}
                        className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-lg text-sm text-left transition-all focus:outline-none focus:ring-1 focus:ring-[#5A1E12] ${fieldErrors.state ? "border-red-400" : "border-[#5A1E12]/20 hover:border-[#5A1E12]/50"}`}
                      >
                        <span className={state ? "text-gray-900" : "text-gray-400"}>{state || `Select ${locationLabels.state}`}</span>
                        <svg className={`w-4 h-4 text-[#a08050] transition-transform ${locStateOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {locStateOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-[#d6b896] rounded-xl shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-[#d6b896]/50">
                            <input
                              autoFocus
                              type="text"
                              value={locStateSearch}
                              onChange={e => { setLocStateSearch(e.target.value); setLocStateHL(0); }}
                              onKeyDown={e => {
                                const filtered = locationStates.filter(s => s.name.toLowerCase().includes(locStateSearch.toLowerCase()));
                                if (e.key === "ArrowDown") { e.preventDefault(); setLocStateHL(i => { const next = Math.min(i + 1, filtered.length - 1); locStateListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                                else if (e.key === "ArrowUp") { e.preventDefault(); setLocStateHL(i => { const prev = Math.max(i - 1, 0); locStateListRef.current?.children[prev]?.scrollIntoView({ block: "nearest" }); return prev; }); }
                                else if (e.key === "Enter" && filtered[locStateHL]) { e.preventDefault(); handleLocationStateChange(filtered[locStateHL].iso2); setLocStateOpen(false); }
                                else if (e.key === "Escape") setLocStateOpen(false);
                              }}
                              placeholder={`Search ${locationLabels.state}...`}
                              className="w-full px-3 py-2 text-sm bg-[#fdf6ee] border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] placeholder:text-gray-400"
                            />
                          </div>
                          <ul ref={locStateListRef} className="max-h-52 overflow-y-auto">
                            {locationStates
                              .filter(s => s.name.toLowerCase().includes(locStateSearch.toLowerCase()))
                              .map((s, idx) => (
                                <li
                                  key={s.iso2}
                                  onMouseEnter={() => setLocStateHL(idx)}
                                  onMouseDown={() => { handleLocationStateChange(s.iso2); setLocStateOpen(false); }}
                                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                    idx === locStateHL ? "bg-[#f5e6d3] text-[#5A1E12]"
                                    : selectedStateIso === s.iso2 ? "bg-[#5A1E12] text-white"
                                    : "text-gray-800 hover:bg-[#f5e6d3] hover:text-[#5A1E12]"
                                  }`}
                                >
                                  {s.name}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {fieldErrors.state && <p className="mt-1 text-xs text-red-500">{fieldErrors.state}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City/Suburb — manual or auto-filled by street address */}
                  <div>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">{locationLabels.city} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={locationLabels.city}
                      className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.city ? "border-red-400" : "border-[#5A1E12]/20"}`}
                    />
                    {fieldErrors.city && <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">Postcode <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => { setZipCode(e.target.value); setZipCodeStateError(null); setFieldErrors(prev => ({ ...prev, zipCode: "" })); }}
                      onBlur={async () => {
                        if (zipCode.trim() && state.trim() && selectedCountryIso) {
                          const err = await validateZipForState(zipCode, state, selectedCountryIso);
                          setZipCodeStateError(err);
                          if (err) setFieldErrors(prev => ({ ...prev, zipCode: err }));
                        }
                      }}
                      placeholder="2000"
                      className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.zipCode || zipCodeStateError ? "border-red-400" : "border-[#5A1E12]/20"}`}
                    />
                    {(fieldErrors.zipCode || zipCodeStateError) && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.zipCode || zipCodeStateError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

<div>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Start typing your address..."
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm transition-all ${
                      fieldErrors.addressLine ? "border-red-400" : "border-[#5A1E12]/20"
                    }`}
                  />
                  {fieldErrors.addressLine && <p className="mt-1 text-xs text-red-500">{fieldErrors.addressLine}</p>}
                  <p className="mt-1 text-xs text-[#5A1E12]/60">💡 Start typing for address suggestions</p>
                </div>



            {/* Shipping Method */}
            <div className="border-t border-[#5A1E12]/10 pt-6">
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Shipping Method</h3>
              {fieldErrors.shippingMethodId && <p className="mb-2 text-xs text-red-500">{fieldErrors.shippingMethodId}</p>}
              <div className="space-y-3">
                {shippingMethods.map((method) => {
                  const calc = cartData?.shippingCalculations?.[method.id];
                  const displayCost = calc?.totalShippingCost != null
                    ? Number(calc.totalShippingCost)
                    : parseFloat(method.cost || "0");
                  const sellerCount = calc?.sellerCount ?? 1;
                  return (
                  <label key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedShipping?.id === method.id ? "border-[#5A1E12] bg-[#5A1E12]/5" : "border-[#5A1E12]/15 hover:border-[#5A1E12]/40"
                    }`}>
                    <input type="radio" name="shippingMethod" checked={selectedShipping?.id === method.id}
                      onChange={() => setSelectedShipping(method)} className="accent-[#5A1E12]" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#3b1a08]">{method.name}</p>
                      {method.estimatedDays && (
                        <p className="text-xs text-[#5A1E12]/60">
                          Est. {method.estimatedDays.replace(/\s*business\s*days?\s*$/i, "")} business days
                        </p>
                      )}
                      {/* {sellerCount > 1 && (
                        <p className="text-xs text-[#5A1E12]/50">×{sellerCount} sellers · ${parseFloat(method.cost).toFixed(2)} each</p>
                      )} */}
                    </div>
                    <span className="font-semibold text-sm text-[#5A1E12]">${displayCost.toFixed(2)}</span>
                  </label>
                  );
                })}
              </div>
            </div>

            {/* Coupon */}
            <div className="border-t border-[#5A1E12]/10 pt-6">
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Coupon Code (Optional)</h3>
              {appliedCoupon ? (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-300 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="flex-1 text-sm font-medium text-green-700">
                    {appliedCoupon.code} — -${appliedCoupon.discountAmount.toFixed(2)} discount applied
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-green-600 hover:text-red-500 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Enter coupon code" disabled={isValidatingCoupon}
                    className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                      couponError ? "border-red-400 focus:ring-red-400" : "border-[#5A1E12]/20 focus:ring-[#5A1E12]"
                    }`} />
                  <button onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                    {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Tag className="w-3.5 h-3.5 mr-1" />Apply</>}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-1.5 text-xs text-red-500">{couponError}</p>}
            </div>

            {/* Continue button */}
            <div className="pt-2">
              <button onClick={handleContinueToPayment} disabled={isCreatingIntent}
                className="w-full py-4 bg-[#5A1E12] text-white font-bold rounded-xl hover:bg-[#3b1a08] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2">
                {isCreatingIntent ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Creating Order...</>
                ) : "Continue to Payment"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT */}
        {currentStep === "payment" && clientSecret && paymentIntentId && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {/* COMMENTED OUT: Backend returning $0.00 total issue 
            {confirmedOrderSummary && (
              <div className="mb-6 p-4 bg-[#5A1E12]/5 rounded-xl border border-[#5A1E12]/15">
                <p className="text-sm text-[#5A1E12]/70">Amount to pay</p>
                <p className="text-3xl font-bold text-[#5A1E12]">
                  ${parseFloat(confirmedOrderSummary.grandTotal || "0").toFixed(2)} AUD
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                    <strong>DEBUG:</strong> Backend total: {confirmedOrderSummary.grandTotal}, 
                    Frontend total: {grandTotal}
                  </div>
                )}
                {confirmedOrderSummary.discountAmount && parseFloat(confirmedOrderSummary.discountAmount) > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Includes {confirmedOrderSummary.couponCode} coupon saving of ${parseFloat(confirmedOrderSummary.discountAmount).toFixed(2)}
                  </p>
                )}
              </div>
            )}
            */}
            <Elements stripe={stripePromise} options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: "#5A1E12", colorBackground: "#ffffff", colorText: "#3b1a08", borderRadius: "12px", fontFamily: "inherit" },
              },
            }}>
              <GuestStripePaymentForm
                paymentIntentId={paymentIntentId}
                customerEmail={customerEmail}
                amount={stripeAmount}
                currency={stripeCurrency}
                orderId={confirmedOrderId}
                onSuccess={() => router.push("/guest/order-success")}
                onError={(msg) => toast.error(msg)}
              />
            </Elements>
            <button onClick={() => setCurrentStep("form")}
              className="mt-4 w-full py-2.5 text-sm text-[#5A1E12]/70 hover:text-[#5A1E12] transition-colors">
              Back to Details
            </button>
          </div>
        )}
      </div>

      {/* ================= RIGHT: ORDER SUMMARY ================= */}
      <div className="w-full lg:w-96 xl:w-105 shrink-0">
        <div className="bg-white lg:rounded-tl-xl shadow-sm lg:sticky lg:top-0 lg:h-screen flex flex-col">

          <div className="px-6 pt-6 pb-4 border-b shrink-0">
            <h2 className="text-xl font-bold">Order Summary</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
            <h3 className="font-medium mb-4 text-sm text-gray-500 uppercase tracking-wide">Items ({cartItems.length})</h3>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={item.product?.images?.[0] || "/images/placeholder.png"} alt={item.product?.title || "Product"} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{item.product?.title || "Product"}</p>
                    <p className="text-sm text-gray-500">Qty {item.quantity} x ${(item.effectivePrice ?? parseFloat(item.product?.price || '0')).toFixed(2)}</p>
                  </div>
                  <p className="font-medium text-sm">${(item.quantity * (item.effectivePrice ?? parseFloat(item.product?.price || '0'))).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 border-t shrink-0 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (incl. {gstPercentage?.toFixed(1)}%)</span>
              <span>${gstAmount.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />Coupon {appliedCoupon.code}</span>
                <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
