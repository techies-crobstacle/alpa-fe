"use client";

import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface AddressCartProps {
  onAddressChange: (address: string) => void;
}

// Country list: { code, flag, name, dialCode, digits: [min, max] }
const COUNTRIES = [
  { code: "AU", flag: "🇦🇺", name: "Australia",       dialCode: "+61",  digits: [9,  9]  },
  { code: "US", flag: "🇺🇸", name: "United States",   dialCode: "+1",   digits: [10, 10] },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom",  dialCode: "+44",  digits: [10, 10] },
  { code: "IN", flag: "🇮🇳", name: "India",           dialCode: "+91",  digits: [10, 10] },
  { code: "CA", flag: "🇨🇦", name: "Canada",          dialCode: "+1",   digits: [10, 10] },
  { code: "NZ", flag: "🇳🇿", name: "New Zealand",     dialCode: "+64",  digits: [8,  9]  },
  { code: "SG", flag: "🇸🇬", name: "Singapore",       dialCode: "+65",  digits: [8,  8]  },
  { code: "AE", flag: "🇦🇪", name: "UAE",             dialCode: "+971", digits: [9,  9]  },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia",    dialCode: "+966", digits: [9,  9]  },
  { code: "DE", flag: "🇩🇪", name: "Germany",         dialCode: "+49",  digits: [10, 11] },
  { code: "FR", flag: "🇫🇷", name: "France",          dialCode: "+33",  digits: [9,  9]  },
  { code: "JP", flag: "🇯🇵", name: "Japan",           dialCode: "+81",  digits: [10, 11] },
  { code: "CN", flag: "🇨🇳", name: "China",           dialCode: "+86",  digits: [11, 11] },
  { code: "BR", flag: "🇧🇷", name: "Brazil",          dialCode: "+55",  digits: [10, 11] },
  { code: "ZA", flag: "🇿🇦", name: "South Africa",    dialCode: "+27",  digits: [9,  10] },
  { code: "PK", flag: "🇵🇰", name: "Pakistan",        dialCode: "+92",  digits: [10, 10] },
  { code: "NG", flag: "🇳🇬", name: "Nigeria",         dialCode: "+234", digits: [10, 10] },
  { code: "PH", flag: "🇵🇭", name: "Philippines",     dialCode: "+63",  digits: [10, 10] },
  { code: "MY", flag: "🇲🇾", name: "Malaysia",        dialCode: "+60",  digits: [9,  10] },
  { code: "ID", flag: "🇮🇩", name: "Indonesia",       dialCode: "+62",  digits: [9,  12] },
];

function validatePhone(digits: string, country: typeof COUNTRIES[number]): string | null {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return null;
  const [min, max] = country.digits;
  if (clean.length < min) return `Too short — ${country.name} numbers need ${min} digits`;
  if (clean.length > max) return `Too long — ${country.name} numbers need ${max} digits`;
  return null;
}

const inputBase = "w-full bg-white/70 border border-[#d6b896] rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400";
const inputNormal = `${inputBase} hover:border-[#a08050] focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 focus:bg-white/90`;
const inputError  = `${inputBase} border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-300/30`;
const inputValid  = `${inputBase} border-emerald-500/70 bg-emerald-50/20 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/30`;

function fieldClass(touched: boolean, error: string | null, value: string) {
  if (!touched) return inputNormal;
  if (error)    return inputError;
  if (value)    return inputValid;
  return inputNormal;
}


export default function AddressCart({ onAddressChange }: AddressCartProps) {
  const [formData, setFormData] = useState({
    country: "",
    address: "",
    city: "",
    zip: "",
    state: "",
  });

  // Field touched state for validation
  const [fieldTouched, setFieldTouched] = useState({ country: false, city: false, zip: false, state: false });

  const fieldErrors = {
    country: formData.country.trim().length < 2 ? "Country is required" : null,
    city:    formData.city.trim().length < 2    ? "City is required"    : null,
    zip:     !formData.zip.trim()               ? "Postal code is required" : !/^[\w\s-]{3,10}$/.test(formData.zip.trim()) ? "Invalid postal code" : null,
    state:   formData.state.trim().length < 2  ? "State is required"   : null,
  };

  const touchField = (f: keyof typeof fieldTouched) =>
    setFieldTouched(prev => ({ ...prev, [f]: true }));

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Refs for the address input and the Google Autocomplete instance
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);

  // Load saved address data from localStorage on mount
  useEffect(() => {
    const savedAddressData = localStorage.getItem("addressCartData");
    if (savedAddressData) {
      try {
        const data = JSON.parse(savedAddressData);
        setFormData({
          country: data.country || "",
          address: data.address || "",
          city:    data.city    || "",
          zip:     data.zip     || "",
          state:   data.state   || "",
        });
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.selectedCountryCode) {
          const found = COUNTRIES.find(c => c.code === data.selectedCountryCode);
          if (found) setSelectedCountry(found);
        }
      } catch {}
    }
    setDataLoaded(true);
  }, []);

  // Save form data to localStorage (only after initial load)
  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem("addressCartData", JSON.stringify({
      ...formData,
      phoneNumber,
      selectedCountryCode: selectedCountry.code,
    }));
  }, [formData, phoneNumber, selectedCountry, dataLoaded]);

  // Load Google Maps script once, then attach Autocomplete to input
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const attachAutocomplete = () => {
      if (!addressInputRef.current || autocompleteInstanceRef.current) return;
      if (!window.google?.maps?.places?.Autocomplete) return;

      const ac = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["address"],
        fields: ["formatted_address", "address_components"],
      });

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place?.address_components) return;

        const get = (type: string) =>
          place.address_components.find((c: any) => c.types.includes(type))?.long_name || "";

        setFormData(prev => ({
          ...prev,
          address: place.formatted_address || prev.address,
          city:    get("locality") || get("administrative_area_level_2") || prev.city,
          state:   get("administrative_area_level_1") || prev.state,
          zip:     get("postal_code") || prev.zip,
          country: get("country") || prev.country,
        }));
      });

      autocompleteInstanceRef.current = ac;
    };

    // Already loaded
    if (window.google?.maps?.places?.Autocomplete) {
      attachAutocomplete();
      return;
    }

    // Script already injected — wait for it
    if (document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)) {
      const poll = setInterval(() => {
        if (window.google?.maps?.places?.Autocomplete) {
          attachAutocomplete();
          clearInterval(poll);
        }
      }, 150);
      return () => clearInterval(poll);
    }

    // Inject script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = attachAutocomplete;
    document.head.appendChild(script);
  }, []);

  // Re-attach autocomplete after the input mounts (after localStorage restore)
  useEffect(() => {
    if (!dataLoaded) return;
    if (!autocompleteInstanceRef.current && window.google?.maps?.places?.Autocomplete && addressInputRef.current) {
      const ac = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["address"],
        fields: ["formatted_address", "address_components"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place?.address_components) return;
        const get = (type: string) =>
          place.address_components.find((c: any) => c.types.includes(type))?.long_name || "";
        setFormData(prev => ({
          ...prev,
          address: place.formatted_address || prev.address,
          city:    get("locality") || get("administrative_area_level_2") || prev.city,
          state:   get("administrative_area_level_1") || prev.state,
          zip:     get("postal_code") || prev.zip,
          country: get("country") || prev.country,
        }));
      });
      autocompleteInstanceRef.current = ac;
    }
  }, [dataLoaded]);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneChange = (value: string) => {
    // Only allow digits, spaces, hyphens
    const cleaned = value.replace(/[^\d\s\-().]/g, "");
    setPhoneNumber(cleaned);
    if (phoneTouched) {
      setPhoneError(validatePhone(cleaned, selectedCountry));
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    setPhoneError(validatePhone(phoneNumber, selectedCountry));
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch)
  );

  // Update parent component whenever address fields change
  useEffect(() => {
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
    onAddressChange(fullAddress);
  }, [formData, onAddressChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-[#5A1E12]">Where should we send your order?</h1>
        <p className="text-sm text-gray-500 mt-1">Fields marked <span className="text-red-500">*</span> are required.</p>
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="country" className="text-sm font-medium text-gray-600">
          Country <span className="text-red-500">*</span>
        </label>
        <input
          id="country"
          name="country"
          type="text"
          value={formData.country}
          onChange={(e) => handleInputChange("country", e.target.value)}
          onBlur={() => touchField("country")}
          placeholder="Australia"
          className={fieldClass(fieldTouched.country, fieldErrors.country, formData.country)}
        />
        {fieldTouched.country && fieldErrors.country && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.country}</p>
        )}
      </div>

      {/* Address autocomplete */}
      <div className="flex flex-col gap-1.5 relative">
        <label htmlFor="address" className="text-sm font-medium text-gray-600">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          ref={addressInputRef}
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Start typing your street address…"
          className={inputNormal}
          required
        />
      </div>

      {/* City & Zip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-medium text-gray-600">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            onBlur={() => touchField("city")}
            placeholder="Sydney"
            className={fieldClass(fieldTouched.city, fieldErrors.city, formData.city)}
          />
          {fieldTouched.city && fieldErrors.city && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.city}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="zip" className="text-sm font-medium text-gray-600">
            Zip / Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            id="zip"
            name="zip"
            type="text"
            value={formData.zip}
            onChange={(e) => handleInputChange("zip", e.target.value)}
            onBlur={() => touchField("zip")}
            placeholder="2000"
            className={fieldClass(fieldTouched.zip, fieldErrors.zip, formData.zip)}
          />
          {fieldTouched.zip && fieldErrors.zip && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.zip}</p>
          )}
        </div>
      </div>

      {/* State */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="state" className="text-sm font-medium text-gray-600">
          State / Province <span className="text-red-500">*</span>
        </label>
        <input
          id="state"
          name="state"
          type="text"
          value={formData.state}
          onChange={(e) => handleInputChange("state", e.target.value)}
          onBlur={() => touchField("state")}
          placeholder="New South Wales"
          className={fieldClass(fieldTouched.state, fieldErrors.state, formData.state)}
        />
        {fieldTouched.state && fieldErrors.state && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.state}</p>
        )}
      </div>

      {/* Phone — single cohesive input row */}
      <div className="flex flex-col gap-1.5" ref={countryDropdownRef}>
        <label className="text-sm font-medium text-gray-600">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className={`flex items-stretch bg-white/70 border rounded-xl overflow-visible transition-all ${
          phoneTouched && phoneError
            ? "border-red-400 bg-red-50/40"
            : phoneTouched && !phoneError && phoneNumber.trim()
            ? "border-emerald-500/70 bg-emerald-50/20"
            : "border-[#d6b896] hover:border-[#a08050] focus-within:border-[#5A1E12] focus-within:ring-2 focus-within:ring-[#5A1E12]/10 focus-within:bg-white/90"
        }`}>
          {/* Country picker */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => { setShowCountryDropdown(v => !v); setCountrySearch(""); }}
              className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-[#d6b896] hover:bg-black/5 transition rounded-l-xl"
            >
              <span className="text-lg leading-none">{selectedCountry.flag}</span>
              <span className="text-gray-700 text-xs">{selectedCountry.dialCode}</span>
              <span className="text-gray-400 text-xs">▾</span>
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
                    className="w-full px-3 py-2 text-sm border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] bg-white"
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
                          setPhoneError(validatePhone(phoneNumber, c));
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#5A1E12]/5 text-left transition ${
                          c.code === selectedCountry.code ? "bg-[#5A1E12]/10 font-medium text-[#5A1E12]" : "text-gray-700"
                        }`}
                      >
                        <span className="text-base w-6 shrink-0">{c.flag}</span>
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="text-gray-400 text-xs shrink-0">{c.dialCode}</span>
                      </button>
                    </li>
                  ))}
                  {filteredCountries.length === 0 && (
                    <li className="px-3 py-4 text-sm text-gray-400 text-center">No countries found</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={handlePhoneBlur}
            placeholder={`${selectedCountry.digits[0]}-digit number`}
            className="flex-1 px-4 py-3 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        {phoneTouched && phoneError && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{phoneError}</p>
        )}
        {phoneTouched && !phoneError && phoneNumber.trim() && (
          <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1"><span>✓</span> Looks good</p>
        )}
      </div>
    </section>
  );
}
