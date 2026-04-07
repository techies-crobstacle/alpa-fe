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

// Dynamic location interfaces
interface ApiCountry {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  numeric_code: string;
  phone_code: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  subregion: string;
  timezones: any[];
  translations: any;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
}

interface State {
  id: number;
  name: string;
  iso2: string;
  country_code: string;
  country_id: number;
  country_name: string;
  latitude: string;
  longitude: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  state_name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  latitude: string;
  longitude: string;
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
  onValidationChange?: (isValid: boolean) => void;
}

// Module-level cache so countries are only fetched once per page session
let cachedCountries: ApiCountry[] = [];

// Dynamic Label Mapping for localized experience
const addressTerminology: Record<string, { state: string; city: string }> = {
  AU: { state: "State/Territory", city: "Suburb" },
  US: { state: "State", city: "City" },
  CA: { state: "Province", city: "City" },
  GB: { state: "County", city: "Town/City" },
  IN: { state: "State", city: "City" },
  default: { state: "State/Province", city: "City" }
};

// ── Country data from react-phone-number-input ────────────────────────
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

// Select-specific base — appearance-none removes OS chrome, pr-10 keeps room for chevron
const selectBase = `${inputBase} appearance-none cursor-pointer pr-10`;
const selectNormal = `${selectBase} hover:border-[#a08050] focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 focus:bg-white/90`;
const selectError  = `${selectBase} border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-300/30`;
const selectValid  = `${selectBase} border-emerald-500/70 bg-emerald-50/20 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/30`;

function selectClass(touched: boolean, error: string | null, value: string) {
  if (!touched) return selectNormal;
  if (error)    return selectError;
  if (value)    return selectValid;
  return selectNormal;
}

function fieldClass(touched: boolean, error: string | null, value: string) {
  if (!touched) return inputNormal;
  if (error)    return inputError;
  if (value)    return inputValid;
  return inputNormal;
}


export default function AddressCart({ onAddressChange, onValidationChange }: AddressCartProps) {
  const authContext = useContext(AuthContext) as { user?: any } | null;
  const user = authContext?.user;
  
  // ── Dynamic Location State ────────────────────────────────────────────────
  const [countries, setCountries] = useState<ApiCountry[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Selected ISO Codes (For API calls)
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  // Custom dropdown open/search state
  const [countryOpen, setCountryOpen]                       = useState(false);
  const [locationCountrySearch, setLocationCountrySearch]   = useState("");
  const [countryHighlight, setCountryHighlight]             = useState(0);
  const [stateOpen, setStateOpen]                           = useState(false);
  const [stateSearch, setStateSearch]                       = useState("");
  const [stateHighlight, setStateHighlight]                 = useState(0);
  const [cityOpen, setCityOpen]                             = useState(false);
  const [citySearch, setCitySearch]                         = useState("");
  const [cityHighlight, setCityHighlight]                   = useState(0);
  const countryDropRef  = useRef<HTMLDivElement>(null);
  const stateDropRef    = useRef<HTMLDivElement>(null);
  const cityDropRef     = useRef<HTMLDivElement>(null);
  const countryListRef  = useRef<HTMLUListElement>(null);
  const stateListRef    = useRef<HTMLUListElement>(null);
  const cityListRef     = useRef<HTMLUListElement>(null);

  // Form Data (To be sent to database)
  const [formData, setFormData] = useState({
    country: "",  // Store Name, e.g., "Australia"
    address: "",
    city: "",     // Store Name, e.g., "Sydney"
    zip: "",
    state: "",    // Store Name, e.g., "New South Wales"
  });

  // Get dynamic labels based on selected country
  const labels = addressTerminology[selectedCountryCode] || addressTerminology.default;

  // Field touched state for validation
  const [fieldTouched, setFieldTouched] = useState({ country: false, city: false, zip: false, state: false });
  const [zipCodeStateError, setZipCodeStateError] = useState<string | null>(null);

  const fieldErrors = {
    country: formData.country.trim().length < 2 ? "Country is required" : null,
    city:    formData.city.trim().length < 2    ? `${labels.city} is required`    : null,
    zip:     !formData.zip.trim()               ? "Postal code is required" : !/^[\w\s-]{3,10}$/.test(formData.zip.trim()) ? "Invalid postal code" : null,
    state:   formData.state.trim().length < 2  ? `${labels.state} is required`   : null,
  };

  const touchField = (f: keyof typeof fieldTouched) =>
    setFieldTouched(prev => ({ ...prev, [f]: true }));

  // ── Dynamic Location API Functions ────────────────────────────────────────
  const fetchCountries = async () => {
    // Use module-level cache to avoid re-fetching on every remount
    if (cachedCountries.length > 0) {
      setCountries(cachedCountries);
      return;
    }
    try {
      const data = await apiClient.get('/location/countries') as { data: ApiCountry[] };
      cachedCountries = data.data || [];
      setCountries(cachedCountries);
    } catch (error) {
      console.error("Failed to fetch countries", error);
      toast.error("Failed to load countries. Please refresh the page.");
    }
  };

  const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso2 = e.target.value;
    const countryObj = countries.find(c => c.iso2 === iso2);
    const countryName = countryObj?.name || e.target.options?.[e.target.selectedIndex]?.text || "";

    // Set the selected country code and update form data
    setSelectedCountryCode(iso2);
    setFormData(prev => ({ ...prev, country: countryName, state: "", city: "" }));

    // Reset dependent dropdowns and state
    setStates([]);
    setCities([]);
    setSelectedStateCode("");
    setFieldTouched(prev => ({ ...prev, state: false, city: false }));
    setZipCodeStateError(null);

    // Sync phone country selector
    const phoneCountry = COUNTRIES.find(c => c.code === iso2);
    if (phoneCountry) {
      setSelectedCountry(phoneCountry);
    }

    // Fetch states for the newly selected country
    if (iso2) {
      try {
        const data = await apiClient.get(`/location/countries/${iso2}/states`) as { data: State[] };
        setStates(data.data || []);
      } catch (error) {
        console.error("Failed to fetch states", error);
        toast.error("Failed to load states/provinces. Please try again.");
      }
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso2 = e.target.value;
    const stateObj = states.find(s => s.iso2 === iso2);
    const stateName = stateObj?.name || e.target.options?.[e.target.selectedIndex]?.text || "";
    
    setSelectedStateCode(iso2);
    
    // Update DB model with Name, reset city
    setFormData(prev => ({ ...prev, state: stateName, city: "" }));
    setCities([]);
    
    // Reset touched state for city field
    setFieldTouched(prev => ({ ...prev, city: false }));
    setZipCodeStateError(null);

    if (!iso2 || !selectedCountryCode) return;

    try {
      const data = await apiClient.get(`/location/countries/${selectedCountryCode}/states/${iso2}/cities`) as { data: City[] };
      setCities(data.data || []);
    } catch (error) {
      console.error("Failed to fetch cities", error);
      toast.error("Failed to load cities. Please try again.");
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const cityName = e.target.value;
    setFormData(prev => ({ ...prev, city: cityName }));
  };

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [phoneHighlight, setPhoneHighlight] = useState(0);
  const phoneListRef = useRef<HTMLUListElement>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Touch all fields at once — called when user tries to move to next step
  const touchAllFields = () => {
    setFieldTouched({ country: true, city: true, zip: true, state: true });
    setPhoneTouched(true);
    setPhoneError(validatePhone(phoneNumber, selectedCountry));
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
          return `Please enter a valid postcode for ${stateVal}.`;
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

  // Derived validity — all required fields must be filled
  const isFormValid = (
    !fieldErrors.country &&
    !fieldErrors.state &&
    !fieldErrors.city &&
    !fieldErrors.zip &&
    !zipCodeStateError &&
    formData.address.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    !validatePhone(phoneNumber, selectedCountry)
  );

  // ── Initial Countries Load ──────────────────────────────────────────────────
  useEffect(() => {
    fetchCountries();
  }, []);

  // ── Auto-select Australia and load states on initial load only ──────────
  useEffect(() => {
    if (isInitialLoad && countries.length > 0 && !formData.country) {
      const australia = countries.find(c => c.iso2.toLowerCase() === 'au');
      if (australia) {
        setSelectedCountryCode(australia.iso2);
        setFormData(prev => ({ ...prev, country: australia.name }));
        
        const loadStates = async () => {
          try {
            const data = await apiClient.get(`/location/countries/${australia.iso2}/states`) as { data: State[] };
            setStates(data.data || []);
          } catch (error) {
            console.error("Failed to fetch Australia states", error);
          }
        };
        loadStates();
        setIsInitialLoad(false); // Mark initial load as complete
      }
    }
  }, [countries, formData.country, isInitialLoad]);

  // ── Auto-load states when country is restored from localStorage ──────────────
  useEffect(() => {
    if (dataLoaded && selectedCountryCode && countries.length > 0 && states.length === 0) {
      const loadStates = async () => {
        try {
          const data = await apiClient.get(`/location/countries/${selectedCountryCode}/states`) as { data: State[] };
          setStates(data.data || []);
        } catch (error) {
          console.error("Failed to fetch states for restored country", error);
        }
      };
      loadStates();
    }
  }, [dataLoaded, selectedCountryCode, countries, states.length]);

  // ── Auto-load cities when state is restored from localStorage ───────────────
  useEffect(() => {
    if (dataLoaded && selectedStateCode && selectedCountryCode && states.length > 0 && cities.length === 0) {
      const loadCities = async () => {
        try {
          const data = await apiClient.get(`/location/countries/${selectedCountryCode}/states/${selectedStateCode}/cities`) as { data: City[] };
          setCities(data.data || []);
        } catch (error) {
          console.error("Failed to fetch cities for restored state", error);
        }
      };
      loadCities();
    }
  }, [dataLoaded, selectedStateCode, selectedCountryCode, states.length, cities.length]);

  // ── Sync phone country with address country selection ─────────────────────────
  useEffect(() => {
    if (selectedCountryCode && countries.length > 0) {
      const selectedAddressCountry = countries.find(c => c.iso2 === selectedCountryCode);
      if (selectedAddressCountry) {
        // Find matching phone country by ISO2 code
        const matchingPhoneCountry = COUNTRIES.find(c => c.code === selectedCountryCode);
        if (matchingPhoneCountry) {
          setSelectedCountry(matchingPhoneCountry);
        }
      }
    }
  }, [selectedCountryCode, countries]);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Refs for the address input and the Google Autocomplete instance
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);
  // Always-current refs so the place_changed closure never goes stale
  const statesRef = useRef(states);
  useEffect(() => { statesRef.current = states; }, [states]);
  const selectedCountryCodeRef = useRef(selectedCountryCode);
  useEffect(() => { selectedCountryCodeRef.current = selectedCountryCode; }, [selectedCountryCode]);
  // Holds the suburb/city from Google Autocomplete until city list loads
  const pendingCityRef = useRef<string>("");

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

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiClient.delete(`/users/addresses/${id}`);
      setSavedAddresses(prev => prev.filter(a => (a._id || a.id) !== id));
      toast.success("Address deleted", {
        position: "top-right",
        autoClose: 2500,
        style: { background: "linear-gradient(135deg, #10B981, #059669)", color: "white", borderRadius: "12px" }
      });
    } catch {
      toast.error("Failed to delete address", {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#FEF2F2", color: "#991B1B", borderLeft: "4px solid #EF4444" }
      });
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

  const selectSavedAddress = async (address: SavedAddress) => {
    // Auto-fill the form with selected address
    setFormData({
      address: address.shippingAddress,
      city: address.city,
      state: address.state,
      country: address.country,
      zip: address.zipCode
    });
    
    // Find and set the country based on the saved address
    const matchingCountry = countries.find(c => 
      c.name.toLowerCase() === address.country.toLowerCase()
    );
    
    if (matchingCountry) {
      setSelectedCountryCode(matchingCountry.iso2);
      
      // Fetch states for the country
      try {
        const statesResponse = await apiClient.get(`/location/countries/${matchingCountry.iso2}/states`) as { data: State[] };
        const countryStates = statesResponse.data || [];
        setStates(countryStates);
        
        // Find and set the state
        const matchingState = countryStates.find((s: State) => 
          s.name.toLowerCase() === address.state.toLowerCase()
        );
        
        if (matchingState) {
          setSelectedStateCode(matchingState.iso2);
          
          // Fetch cities for the state
          try {
            const citiesResponse = await apiClient.get(`/location/countries/${matchingCountry.iso2}/states/${matchingState.iso2}/cities`) as { data: City[] };
            setCities(citiesResponse.data || []);
          } catch (error) {
            console.error("Failed to fetch cities for saved address", error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch states for saved address", error);
      }
    }
    
    // Parse and set phone number with country selection
    const phoneWithCountry = address.mobileNumber;
    const matchingPhoneCountry = COUNTRIES.find(c => phoneWithCountry.startsWith(c.dialCode));
    if (matchingPhoneCountry) {
      setSelectedCountry(matchingPhoneCountry);
      const phoneWithoutCode = phoneWithCountry.replace(matchingPhoneCountry.dialCode, '').trim();
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
    setZipCodeStateError(null);
    
    setShowSavedAddresses(false);
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
        
        // Restore ISO codes — use the address-specific keys (not phone country)
        if (data.selectedCountryIso2) setSelectedCountryCode(data.selectedCountryIso2);
        if (data.selectedStateIso2) setSelectedStateCode(data.selectedStateIso2);
        
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
      selectedCountryIso2: selectedCountryCode,
      selectedStateIso2: selectedStateCode,
    }));
  }, [formData, phoneNumber, selectedCountry, selectedCountryCode, selectedStateCode, dataLoaded]);

  // Load Google Maps script and init autocomplete ONCE after data loads
  useEffect(() => {
    if (!dataLoaded) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local');
      return;
    }

    const attachAutocomplete = () => {
      if (!addressInputRef.current || autocompleteInstanceRef.current) return;
      if (!window.google?.maps?.places?.Autocomplete) return;

      const ac = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["address"],
        fields: ["address_components", "formatted_address"],
        ...(selectedCountryCodeRef.current && {
          componentRestrictions: { country: selectedCountryCodeRef.current.toLowerCase() }
        }),
      });

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place?.address_components) return;

        const getComponent = (type: string) =>
          place.address_components.find((c: any) => c.types.includes(type))?.long_name || "";
        const getShortComponent = (type: string) =>
          place.address_components.find((c: any) => c.types.includes(type))?.short_name || "";

        // Try multiple types — Australian suburbs can be locality OR sublocality
        const city       = getComponent("locality") ||
                           getComponent("sublocality_level_1") ||
                           getComponent("sublocality") ||
                           getComponent("administrative_area_level_2");
        const stateLong  = getComponent("administrative_area_level_1");
        const stateShort = getShortComponent("administrative_area_level_1");
        const postalCode = getComponent("postal_code");
        const countryName = getComponent("country");
        const countryISO = getShortComponent("country");
        const formattedAddr = place.formatted_address || "";

        const stripTerms = new Set(
          [city, stateLong, stateShort, postalCode, countryName]
            .filter(Boolean)
            .map((t: string) => t.toLowerCase())
        );
        const streetParts = formattedAddr
          .split(",")
          .map((p: string) => p.trim())
          .filter((p: string) => p && !stripTerms.has(p.toLowerCase()));
        const streetAddress = streetParts.join(", ") || formattedAddr.split(",")[0].trim();

        if (addressInputRef.current) addressInputRef.current.value = streetAddress;
        pendingCityRef.current = city;

        setFormData(prev => ({
          ...prev,
          address: streetAddress,
          city,
          state: stateShort || stateLong,
          zip: postalCode,
          country: countries.find(c => c.iso2 === countryISO)?.name || prev.country,
        }));

        // Sync country dropdown if it changed
        if (countryISO && countryISO !== selectedCountryCodeRef.current) {
          const newCountry = countries.find(c => c.iso2 === countryISO);
          if (newCountry) {
            handleCountryChange({ target: { value: newCountry.iso2 } } as React.ChangeEvent<HTMLSelectElement>);
          }
        }

        // Sync state + city dropdowns inline (avoid handleStateChange which resets city)
        setTimeout(async () => {
          const stateObj = statesRef.current.find(s =>
            s.iso2.toLowerCase() === stateShort.toLowerCase() ||
            s.name.toLowerCase() === stateLong.toLowerCase()
          );
          if (!stateObj) return;

          setSelectedStateCode(stateObj.iso2);
          setFormData(prev => ({ ...prev, state: stateObj.name }));

          try {
            const data = await apiClient.get(`/location/countries/${selectedCountryCodeRef.current}/states/${stateObj.iso2}/cities`) as { data: City[] };
            const newCities = data.data || [];
            setCities(newCities);

            const pendingCity = pendingCityRef.current;
            if (pendingCity) {
              const matchingCity = newCities.find(c =>
                c.name.toLowerCase() === pendingCity.toLowerCase()
              );
              setFormData(prev => ({ ...prev, city: matchingCity?.name || pendingCity }));
              pendingCityRef.current = "";
            }
          } catch (error) {
            console.error("Failed to fetch cities for autocompleted state", error);
          }
        }, 200);
      });

      autocompleteInstanceRef.current = ac;
    };

    if (window.google?.maps?.places?.Autocomplete) {
      attachAutocomplete();
      return;
    }

    if (document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)) {
      const poll = setInterval(() => {
        if (window.google?.maps?.places?.Autocomplete) {
          attachAutocomplete();
          clearInterval(poll);
        }
      }, 150);
      return () => clearInterval(poll);
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = attachAutocomplete;
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  // Update country restriction on the existing instance when country dropdown changes
  useEffect(() => {
    if (!autocompleteInstanceRef.current) return;
    autocompleteInstanceRef.current.setComponentRestrictions(
      selectedCountryCode
        ? { country: selectedCountryCode.toLowerCase() }
        : null
    );
  }, [selectedCountryCode]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
      if (countryDropRef.current && !countryDropRef.current.contains(e.target as Node)) { setCountryOpen(false); setLocationCountrySearch(""); }
      if (stateDropRef.current   && !stateDropRef.current.contains(e.target as Node))   setStateOpen(false);
      if (cityDropRef.current    && !cityDropRef.current.contains(e.target as Node))     setCityOpen(false);
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

  // Notify parent whenever validity changes
  useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-[#5A1E12]">Where should we send your order?</h1>
        <p className="text-sm text-gray-500 mt-1">Fields marked <span className="text-red-500">*</span> are required.</p>
      </div>

      {/* Country Dropdown */}
      <div className="flex flex-col gap-1.5" ref={countryDropRef}>
        <label className="text-sm font-medium text-gray-600">
          Country/Region <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => { setCountryOpen(o => !o); setCountrySearch(""); }}
            onBlur={() => touchField("country")}
            className={`${selectClass(fieldTouched.country, fieldErrors.country, formData.country)} flex items-center justify-between text-left`}
          >
            <span className={formData.country ? "text-gray-900" : "text-gray-400"}>
              {formData.country || "Select Country"}
            </span>
            <svg className={`w-4 h-4 text-[#a08050] transition-transform ${countryOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {countryOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-[#d6b896] rounded-xl shadow-lg overflow-hidden">
              <div className="p-2 border-b border-[#d6b896]/50">
                <input
                  autoFocus
                  type="text"
                  value={locationCountrySearch}
                  onChange={e => { setLocationCountrySearch(e.target.value); setCountryHighlight(0); }}
                  onKeyDown={e => {
                    const filtered = countries.filter(c => c.name.toLowerCase().includes(locationCountrySearch.toLowerCase()));
                    if (e.key === "ArrowDown") { e.preventDefault(); setCountryHighlight(i => { const next = Math.min(i + 1, filtered.length - 1); countryListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setCountryHighlight(i => { const prev = Math.max(i - 1, 0); countryListRef.current?.children[prev]?.scrollIntoView({ block: "nearest" }); return prev; }); }
                    else if (e.key === "Enter" && filtered[countryHighlight]) { e.preventDefault(); handleCountryChange({ target: { value: filtered[countryHighlight].iso2 } } as React.ChangeEvent<HTMLSelectElement>); setCountryOpen(false); touchField("country"); }
                    else if (e.key === "Escape") setCountryOpen(false);
                  }}
                  placeholder="Search country..."
                  className="w-full px-3 py-2 text-sm bg-[#fdf6ee] border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] placeholder:text-gray-400"
                />
              </div>
              <ul ref={countryListRef} className="max-h-52 overflow-y-auto">
                {countries
                  .filter(c => c.name.toLowerCase().includes(locationCountrySearch.toLowerCase()))
                  .map((c, idx) => (
                    <li
                      key={c.iso2}
                      onMouseEnter={() => setCountryHighlight(idx)}
                      onMouseDown={() => {
                        handleCountryChange({ target: { value: c.iso2 } } as React.ChangeEvent<HTMLSelectElement>);
                        setCountryOpen(false);
                        touchField("country");
                      }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                        idx === countryHighlight
                          ? "bg-[#f5e6d3] text-[#5A1E12]"
                          : selectedCountryCode === c.iso2
                          ? "bg-[#5A1E12] text-white"
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
        {fieldTouched.country && fieldErrors.country && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.country}</p>
        )}
      </div>

      

      {/* State Dropdown - Only show if states exist */}
      {states.length > 0 && (
        <div className="flex flex-col gap-1.5" ref={stateDropRef}>
          <label className="text-sm font-medium text-gray-600">
            {labels.state} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => { setStateOpen(o => !o); setStateSearch(""); }}
              onBlur={() => touchField("state")}
              className={`${selectClass(fieldTouched.state, fieldErrors.state, formData.state)} flex items-center justify-between text-left`}
            >
              <span className={formData.state ? "text-gray-900" : "text-gray-400"}>
                {formData.state || `Select ${labels.state}`}
              </span>
              <svg className={`w-4 h-4 text-[#a08050] transition-transform ${stateOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {stateOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-[#d6b896] rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-[#d6b896]/50">
                <input
                    autoFocus
                    type="text"
                    value={stateSearch}
                    onChange={e => { setStateSearch(e.target.value); setStateHighlight(0); }}
                    onKeyDown={e => {
                      const filtered = states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
                      if (e.key === "ArrowDown") { e.preventDefault(); setStateHighlight(i => Math.min(i + 1, filtered.length - 1)); stateListRef.current?.children[Math.min(stateHighlight + 1, filtered.length - 1)]?.scrollIntoView({ block: "nearest" }); }
                      else if (e.key === "ArrowUp") { e.preventDefault(); setStateHighlight(i => Math.max(i - 1, 0)); stateListRef.current?.children[Math.max(stateHighlight - 1, 0)]?.scrollIntoView({ block: "nearest" }); }
                      else if (e.key === "Enter" && filtered[stateHighlight]) { e.preventDefault(); handleStateChange({ target: { value: filtered[stateHighlight].iso2 } } as React.ChangeEvent<HTMLSelectElement>); setStateOpen(false); touchField("state"); }
                      else if (e.key === "Escape") setStateOpen(false);
                    }}
                    placeholder={`Search ${labels.state}...`}
                    className="w-full px-3 py-2 text-sm bg-[#fdf6ee] border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] placeholder:text-gray-400"
                  />
                </div>
                <ul ref={stateListRef} className="max-h-52 overflow-y-auto">
                  {states
                    .filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()))
                    .map((s, idx) => (
                      <li
                        key={s.iso2}
                        onMouseEnter={() => setStateHighlight(idx)}
                        onMouseDown={() => {
                          handleStateChange({ target: { value: s.iso2 } } as React.ChangeEvent<HTMLSelectElement>);
                          setStateOpen(false);
                          touchField("state");
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          idx === stateHighlight
                            ? "bg-[#f5e6d3] text-[#5A1E12]"
                            : selectedStateCode === s.iso2
                            ? "bg-[#5A1E12] text-white"
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
          {fieldTouched.state && fieldErrors.state && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.state}</p>
          )}
        </div>
      )}

      {/* City/Suburb - manual text input (auto-filled by street address autocomplete) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-medium text-gray-600">
            {labels.city} <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleCityChange}
            onBlur={() => touchField("city")}
            placeholder={`Enter your ${labels.city}`}
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
            onChange={(e) => { setFormData(prev => ({ ...prev, zip: e.target.value })); setZipCodeStateError(null); }}
            onBlur={async () => {
              touchField("zip");
              if (formData.zip.trim() && formData.state.trim() && selectedCountryCode) {
                const err = await validateZipForState(formData.zip, formData.state, selectedCountryCode);
                setZipCodeStateError(err);
              }
            }}
            placeholder="2000"
            className={fieldClass(fieldTouched.zip, fieldErrors.zip || zipCodeStateError, formData.zip)}
          />
          {((fieldTouched.zip && fieldErrors.zip) || zipCodeStateError) && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.zip || zipCodeStateError}</p>
          )}
        </div>
      </div>

      {/* Street address autocomplete */}
      <div className="flex flex-col gap-1.5 relative">
        <label htmlFor="address" className="text-sm font-medium text-gray-600">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          ref={addressInputRef}
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder={
            formData.city && formData.state 
              ? `Start typing street address in ${formData.country}...` 
              : "e.g., 123 Collins Street, Unit 5A"
          }
          className={inputNormal}
          required
        />
        <p className="text-xs text-gray-500">
          {selectedCountryCode 
            ? "💡 Start typing for address suggestions" 
            : "Include street number, name, unit/apartment number"}
        </p>
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
              <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-[#d6b896] rounded-xl overflow-hidden">
                <div className="p-2 border-b border-[#d6b896]/50">
                  <input
                    type="text"
                    autoFocus
                    value={countrySearch}
                    onChange={e => { setCountrySearch(e.target.value); setPhoneHighlight(0); }}
                    onKeyDown={e => {
                      if (e.key === "ArrowDown") { e.preventDefault(); setPhoneHighlight(i => { const next = Math.min(i + 1, filteredCountries.length - 1); phoneListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                      else if (e.key === "ArrowUp") { e.preventDefault(); setPhoneHighlight(i => { const prev = Math.max(i - 1, 0); phoneListRef.current?.children[prev]?.scrollIntoView({ block: "nearest" }); return prev; }); }
                      else if (e.key === "Enter" && filteredCountries[phoneHighlight]) { e.preventDefault(); setSelectedCountry(filteredCountries[phoneHighlight]); setShowCountryDropdown(false); setCountrySearch(""); setPhoneError(validatePhone(phoneNumber, filteredCountries[phoneHighlight])); }
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
                        onMouseDown={() => {
                          setSelectedCountry(c);
                          setShowCountryDropdown(false);
                          setCountrySearch("");
                          setPhoneError(validatePhone(phoneNumber, c));
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                          idx === phoneHighlight
                            ? "bg-[#f5e6d3] text-[#5A1E12]"
                            : c.code === selectedCountry.code
                            ? "bg-[#5A1E12] text-white"
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
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              const id = address._id || address.id;
                              if (id) handleDeleteAddress(id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete address"
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
