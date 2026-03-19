"use client";

import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

declare global {
  interface Window {
    google: any;
  }
}

// Address interface matching API structure
interface SavedAddress {
  id?: string;
  _id?: string;
  shippingAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  mobileNumber: string;
  isDefault: boolean;
}

interface AddressCartProps {
  onAddressChange: (data: {
    address: string;
    city: string;
    zip: string;
    state: string;
    country: string;
    phoneNumber: string;
  }) => void;
}

// ── Country data from react-phone-number-input ────────────────────────
const countryCodeList = getCountries();

// Country flags mapping
const countryFlags: Record<string, string> = {
  'AU': '🇦🇺', 'US': '🇺🇸', 'GB': '🇬🇧', 'IN': '🇮🇳', 'CA': '🇨🇦', 'NZ': '🇳🇿', 
  'SG': '🇸🇬', 'AE': '🇦🇪', 'SA': '🇸🇦', 'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵',
  'CN': '🇨🇳', 'BR': '🇧🇷', 'PK': '🇵🇰', 'MY': '🇲🇾', 'PH': '🇵🇭', 'ID': '🇮🇩',
  'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱', 'CH': '🇨🇭', 'AT': '🇦🇹', 'BE': '🇧🇪',
  'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'IE': '🇮🇪', 'PT': '🇵🇹',
  'GR': '🇬🇷', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'TR': '🇹🇷', 'RU': '🇷🇺',
  'KR': '🇰🇷', 'TH': '🇹🇭', 'VN': '🇻🇳', 'ZA': '🇿🇦', 'EG': '🇪🇬', 'NG': '🇳🇬',
  'KE': '🇰🇪', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪',
};

// Country names mapping
const countryNames: Record<string, string> = {
  'AU': 'Australia', 'US': 'United States', 'GB': 'United Kingdom', 'IN': 'India', 
  'CA': 'Canada', 'NZ': 'New Zealand', 'SG': 'Singapore', 'AE': 'United Arab Emirates',
  'SA': 'Saudi Arabia', 'DE': 'Germany', 'FR': 'France', 'JP': 'Japan', 'CN': 'China',
  'BR': 'Brazil', 'PK': 'Pakistan', 'MY': 'Malaysia', 'PH': 'Philippines', 'ID': 'Indonesia',
  'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands', 'CH': 'Switzerland', 'AT': 'Austria',
  'BE': 'Belgium', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
  'IE': 'Ireland', 'PT': 'Portugal', 'GR': 'Greece', 'PL': 'Poland', 'CZ': 'Czech Republic',
  'HU': 'Hungary', 'TR': 'Turkey', 'RU': 'Russia', 'KR': 'South Korea', 'TH': 'Thailand',
  'VN': 'Vietnam', 'ZA': 'South Africa', 'EG': 'Egypt', 'NG': 'Nigeria', 'KE': 'Kenya',
  'MX': 'Mexico', 'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia', 'PE': 'Peru',
};

// Build COUNTRIES array from react-phone-number-input data
const COUNTRIES = countryCodeList.map(code => ({
  code,
  flag: countryFlags[code] || '🏳️',
  name: countryNames[code] || code,
  dialCode: `+${getCountryCallingCode(code as CountryCode)}`,
})).filter(country => countryFlags[country.code]); // Only include countries with flags

type Country = typeof COUNTRIES[number];

// Phone validation using react-phone-number-input
function validatePhone(digits: string, country: Country): string | null {
  if (!digits.trim()) return null;
  
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
  const authContext = useContext(AuthContext) as { user?: any } | null;
  const user = authContext?.user;
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

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Refs for the address input and the Google Autocomplete instance
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);

  // API functions for addresses
  const fetchSavedAddresses = async () => {
    if (!user) {
      console.log('No user found, skipping address fetch');
      return;
    }
    
    try {
      setLoadingSavedAddresses(true);
      console.log('Fetching saved addresses for user:', user.id || user.email);
      
      const response = await apiClient.get<SavedAddress[] | { data?: SavedAddress[]; addresses?: SavedAddress[] }>('/users/addresses');
      console.log('Saved addresses response:', response);
      
      // Handle both array response and object with data property
      const addressData = Array.isArray(response) ? response : (response as any)?.data || (response as any)?.addresses || [];
      console.log('Processed address data:', addressData);
      
      setSavedAddresses(addressData);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      console.error('Error details:', {
        message: (error as any)?.message,
        status: (error as any)?.status,
        response: (error as any)?.response
      });
    } finally {
      setLoadingSavedAddresses(false);
    }
  };

  const saveAddress = async () => {
    if (!user) return;
    
    // Validate form before saving
    const hasErrors = Object.values(fieldErrors).some(error => error !== null);
    const phoneValidationError = validatePhone(phoneNumber, selectedCountry);
    
    if (hasErrors || phoneValidationError || !formData.address.trim()) {
      toast.error("📋 Please fill all required fields correctly before saving the address.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#FEF2F2",
          color: "#991B1B",
          borderLeft: "4px solid #EF4444"
        }
      });
      return;
    }

    // Check for duplicate addresses before saving
    const newAddressData = {
      shippingAddress: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      zipCode: formData.zip.trim(),
      mobileNumber: `${selectedCountry.dialCode} ${phoneNumber}`.trim(),
    };

    const isDuplicate = savedAddresses.some(existing => 
      existing.shippingAddress.toLowerCase().trim() === newAddressData.shippingAddress.toLowerCase() &&
      existing.city.toLowerCase().trim() === newAddressData.city.toLowerCase() &&
      existing.state.toLowerCase().trim() === newAddressData.state.toLowerCase() &&
      existing.country.toLowerCase().trim() === newAddressData.country.toLowerCase() &&
      existing.zipCode.trim() === newAddressData.zipCode &&
      existing.mobileNumber.trim() === newAddressData.mobileNumber
    );

    if (isDuplicate) {
      toast.warning("📍 You have already saved this address!", {
        position: "top-center",
        autoClose: 3500,
        hideProgressBar: false, 
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "white",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(245, 158, 11, 0.4)",
          fontWeight: "600"
        }
      });
      return;
    }

    try {
      setSavingAddress(true);
      const addressData = {
        ...newAddressData,
        isDefault: saveAsDefault
      };
      
      await apiClient.post('/users/addresses', addressData);
      await fetchSavedAddresses(); // Refresh the saved addresses list
      setSaveAsDefault(false);
      toast.success("✅ Address saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "linear-gradient(135deg, #10B981, #059669)",
          color: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)"
        }
      });
    } catch (error: any) {
      console.error('Error saving address:', error);
      
      // Check if it's a duplicate error from the backend
      const errorMessage = error?.response?.data?.message || error?.message || '';
      const isDuplicateError = errorMessage.toLowerCase().includes('already') || 
                              errorMessage.toLowerCase().includes('duplicate') ||
                              errorMessage.toLowerCase().includes('exists');
      
      if (isDuplicateError) {
        toast.warning("📍 This address already exists in your saved addresses!", {
          position: "top-center",
          autoClose: 3500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "white",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(245, 158, 11, 0.4)",
            fontWeight: "600"
          }
        });
      } else {
        toast.error("❌ Failed to save address. Please try again.", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "#FEF2F2",
            color: "#991B1B",
            borderLeft: "4px solid #EF4444"
          }
        });
      }
    } finally {
      setSavingAddress(false);
    }
  };

  const selectSavedAddress = (address: SavedAddress) => {
    // Auto-fill the form with selected address
    setFormData({
      address: address.shippingAddress,
      city: address.city,
      state: address.state,
      country: address.country,
      zip: address.zipCode
    });
    
    // Parse and set phone number with country selection
    const phoneWithCountry = address.mobileNumber;
    const matchingCountry = COUNTRIES.find(c => phoneWithCountry.startsWith(c.dialCode));
    if (matchingCountry) {
      setSelectedCountry(matchingCountry);
      const phoneWithoutCode = phoneWithCountry.replace(matchingCountry.dialCode, '').trim();
      setPhoneNumber(phoneWithoutCode);
      // Reset phone validation state
      setPhoneTouched(false);
      setPhoneError(null);
    }
    
    // Reset field touched states since we're auto-filling
    setFieldTouched({
      country: false,
      city: false, 
      zip: false,
      state: false
    });
    
    setShowSavedAddresses(false);
    
    // Show success feedback
    const addressLabel = `Address ${savedAddresses.indexOf(address) + 1}`;
    setTimeout(() => {
      toast.success(`🎯 ${addressLabel} has been auto-filled successfully!`, {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "linear-gradient(135deg, #5A1E12, #8B5E3C)",
          color: "white",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(90, 30, 18, 0.4)",
          fontWeight: "600"
        }
      });
    }, 100);
  };

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

  // Fetch saved addresses when user is authenticated
  useEffect(() => {
    if (user && dataLoaded) {
      fetchSavedAddresses();
    }
  }, [user, dataLoaded]);

  // Auto-expand saved addresses when they are loaded
  useEffect(() => {
    if (savedAddresses.length > 0 && !loadingSavedAddresses) {
      setShowSavedAddresses(true);
    }
  }, [savedAddresses, loadingSavedAddresses]);

  // Debug: Log user state changes
  useEffect(() => {
    console.log('User state changed:', { user: !!user, userId: user?.id || user?.email });
  }, [user]);

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
    onAddressChange({
      address: formData.address,
      city: formData.city,
      zip: formData.zip,
      state: formData.state,
      country: formData.country,
      phoneNumber: `${selectedCountry.dialCode} ${phoneNumber}`.trim(),
    });
  }, [formData, phoneNumber, selectedCountry, onAddressChange]);

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
            placeholder="Enter phone number"
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

      {/* Save Address & Action Buttons Section - only show for authenticated users */}
      {user && (
        <div className="bg-linear-to-br from-[#5A1E12]/5 to-[#d6b896]/10 rounded-xl p-4 border border-[#d6b896]/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#5A1E12] border-[#d6b896] rounded focus:ring-[#5A1E12] focus:ring-2"
                />
                <span className="text-sm text-gray-700">Save as default address</span>
              </label>
            </div>
            <div className="flex items-start">
              <button
                type="button"
                onClick={saveAddress}
                disabled={savingAddress}
                className="px-6 py-3 bg-[#5A1E12] hover:bg-[#5A1E12]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {savingAddress ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving Address...
                  </>
                ) : (
                  <>
                    Save Address
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses Section - show for authenticated users */}
      {user && (
        <div className="bg-linear-to-br from-[#f8f4f0] to-[#faf7f4] rounded-xl border border-[#d6b896]/40 overflow-hidden shadow-lg">
          <div className="p-4 bg-linear-to-r from-[#5A1E12] to-[#4a1810] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Saved Addresses</h3>
                {savedAddresses.length > 0 && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-medium">{savedAddresses.length}</span>
                )}
              </div>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                  className="text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center gap-1 hover:bg-white/10 px-3 py-1 rounded-lg transform hover:scale-105"
                >
                  {showSavedAddresses ? 'Hide' : 'Show'}
                  <motion.span
                    animate={{ rotate: showSavedAddresses ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-sm"
                  >
                    ▼
                  </motion.span>
                </button>
              )}
            </div>
              {savedAddresses.length === 0 && !loadingSavedAddresses && (
                <div className="text-center py-4">
                  <p className="text-white/60 text-sm mb-3">No saved addresses found</p>
                  <button
                    onClick={fetchSavedAddresses}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-all"
                  >
                    Refresh Addresses
                  </button>
                </div>
              )}
              {loadingSavedAddresses && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white/80 text-sm">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          
          <AnimatePresence>
            {savedAddresses.length > 0 && showSavedAddresses && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="divide-y divide-[#d6b896]/30 overflow-hidden"
              >
                {loadingSavedAddresses ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 text-center"
                  >
                    <div className="inline-flex items-center gap-3 text-[#5A1E12]">
                      <div className="w-5 h-5 border-2 border-[#5A1E12]/20 border-t-[#5A1E12] rounded-full animate-spin"></div>
                      <span className="text-sm">Loading saved addresses...</span>
                    </div>
                  </motion.div>
                ) : (
                  savedAddresses.map((address, index) => (
                    <motion.div
                      key={address.id || address._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-3 hover:bg-[#5A1E12]/8 transition-all duration-300 cursor-pointer group"
                      onClick={() => selectSavedAddress(address)}
                      whileHover={{ backgroundColor: "rgba(90, 30, 18, 0.1)" }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#5A1E12] font-medium text-sm">Address {index + 1}</span>
                            {address.isDefault && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-linear-to-r from-[#5A1E12] to-[#4a1810] text-white text-xs px-2 py-1 rounded-full font-medium"
                              >
                                Default
                              </motion.span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 font-medium">{address.shippingAddress}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectSavedAddress(address);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-linear-to-r from-[#5A1E12] to-[#4a1810] hover:from-[#4a1810] hover:to-[#5A1E12] text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            Use This
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {user && loadingSavedAddresses && savedAddresses.length === 0 && (
        <div className="bg-linear-to-br from-[#5A1E12]/5 to-[#d6b896]/10 rounded-xl p-6 border border-[#d6b896]/30">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-3 border-[#5A1E12]/20 border-t-[#5A1E12] rounded-full animate-spin"></div>
            <span className="text-[#5A1E12] font-medium">Loading your saved addresses...</span>
          </div>
        </div>
      )}
    </section>
  );
}
