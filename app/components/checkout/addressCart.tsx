"use client";

import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface AddressCartProps {
  onAddressChange: (address: string) => void;
  onValidationChange?: (isValidated: boolean) => void;
}

interface AddressPrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export default function AddressCart({ onAddressChange, onValidationChange }: AddressCartProps) {
  console.log("AddressCart: Component rendering/mounting");
  
  const [formData, setFormData] = useState({
    country: "",
    address: "",
    city: "",
    zip: "",
    state: "",
    countryCode: "",
    phone: "",
  });

  const [suggestions, setSuggestions] = useState<AddressPrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [placeId, setPlaceId] = useState<string>("");
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");
  const [validationMessage, setValidationMessage] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const autocompleteRef = useRef<any>(null);
  const baseURL = "https://alpa-be-1.onrender.com";

  // Load saved address data from localStorage on mount
  useEffect(() => {
    console.log("AddressCart: Loading data on mount...");
    
    const savedAddressData = localStorage.getItem("addressCartData");
    console.log("AddressCart: Saved address data:", savedAddressData);
    
    if (savedAddressData) {
      try {
        const data = JSON.parse(savedAddressData);
        console.log("AddressCart: Parsed data:", data);
        
        // Only restore the form fields, not placeId
        const formOnly = {
          country: data.country || "",
          address: data.address || "",
          city: data.city || "",
          zip: data.zip || "",
          state: data.state || "",
          countryCode: data.countryCode || "",
          phone: data.phone || "",
        };
        console.log("AddressCart: Setting form data:", formOnly);
        setFormData(formOnly);
      } catch (error) {
        console.error("Failed to load saved form data:", error);
      }
    }
    
    // Load placeId separately
    const savedPlaceId = localStorage.getItem("addressPlaceId");
    console.log("AddressCart: Saved place ID:", savedPlaceId);
    if (savedPlaceId) {
      setPlaceId(savedPlaceId);
    }
    
    // Load validation state separately
    const savedValidation = localStorage.getItem("addressValidated");
    console.log("AddressCart: Saved validation:", savedValidation);
    if (savedValidation === "true") {
      setIsAddressValidated(true);
      setValidationStatus("success");
      setValidationMessage("Address validated successfully!");
    }
    
    // Mark data as loaded
    setDataLoaded(true);
  }, []);

  // Component unmount logging
  useEffect(() => {
    return () => {
      console.log("AddressCart: Component unmounting");
    };
  }, []);

  // Save form data to localStorage (only after data is loaded)
  useEffect(() => {
    if (!dataLoaded) return;
    console.log("AddressCart: Saving form data:", formData);
    localStorage.setItem("addressCartData", JSON.stringify(formData));
  }, [formData, dataLoaded]);

  // Save placeId to localStorage (only after data is loaded)
  useEffect(() => {
    if (!dataLoaded) return;
    if (placeId) {
      console.log("AddressCart: Saving place ID:", placeId);
      localStorage.setItem("addressPlaceId", placeId);
    }
  }, [placeId, dataLoaded]);

  // Save validation state to localStorage (only after data is loaded)
  useEffect(() => {
    if (!dataLoaded) return;
    console.log("AddressCart: Saving validation state:", isAddressValidated);
    localStorage.setItem("addressValidated", isAddressValidated.toString());
  }, [isAddressValidated, dataLoaded]);

  // Notify parent component of validation state change
  useEffect(() => {
    onValidationChange?.(isAddressValidated);
  }, [isAddressValidated, onValidationChange]);

  // Initialize Google Places services
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error("Google Maps API key is not set");
      return;
    }

    // Check if script is already loaded or being loaded
    if (window.google?.maps?.places?.AutocompleteService) {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    
    if (existingScript) {
      // Script already exists, wait for it to load
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteService) {
          autocompleteRef.current = new window.google.maps.places.AutocompleteService();
          clearInterval(checkGoogle);
        }
      }, 100);
      return;
    }

    // Load the script only once
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        autocompleteRef.current = new window.google.maps.places.AutocompleteService();
      }
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps API");
    };
    document.head.appendChild(script);
  }, []);

  // Update parent component whenever address fields change
  useEffect(() => {
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
    onAddressChange(fullAddress);
  }, [formData, onAddressChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressInput = async (value: string) => {
    handleInputChange("address", value);

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!autocompleteRef.current) return;

    setLoading(true);
    try {
      const response = await autocompleteRef.current.getPlacePredictions({
        input: value,
        componentRestrictions: { country: "au" },
      });

      console.log("API Response:", response);

      if (response && response.predictions && Array.isArray(response.predictions)) {
        setSuggestions(
          response.predictions.map((pred: any) => ({
            place_id: pred.place_id,
            description: pred.description,
            main_text: pred.main_text || pred.description,
            secondary_text: pred.secondary_text || "",
          }))
        );
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching address predictions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (suggestion: AddressPrediction) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.description,
    }));
    setPlaceId(suggestion.place_id);
    setIsAddressValidated(false); // Reset validation when new address is selected
    setValidationStatus("idle");
    setValidationMessage("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleValidateAddress = async () => {
    if (!placeId) {
      setValidationStatus("error");
      setValidationMessage("Please select an address first");
      return;
    }

    // Don't allow validation if already validated
    if (isAddressValidated) {
      return;
    }

    setValidating(true);
    setValidationStatus("idle");
    
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("sellerToken");
      
      if (!token) {
        setValidationStatus("error");
        setValidationMessage("Authentication required");
        setValidating(false);
        return;
      }

      const response = await fetch(`${baseURL}/api/validate-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          place_id: placeId,
        }),
      });

      if (response.ok) {
        setValidationStatus("success");
        setValidationMessage("Address validated successfully!");
        setIsAddressValidated(true); // Mark as validated
      } else {
        const errorData = await response.json().catch(() => ({ message: "Validation failed" }));
        setValidationStatus("error");
        setValidationMessage(errorData.message || "Address validation failed");
      }
    } catch (error) {
      console.error("Error validating address:", error);
      setValidationStatus("error");
      setValidationMessage("Failed to validate address");
    } finally {
      setValidating(false);
    }
  };

  return (
    <section className="p-10 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        Where should we send your order?
      </h1>

      {/* Country */}
      <div className="flex flex-col gap-1">
        <label htmlFor="country" className="text-sm font-medium">
          Country
        </label>
        <input
          id="country"
          name="country"
          type="text"
          value={formData.country}
          onChange={(e) => handleInputChange("country", e.target.value)}
          placeholder="Australia"
          className="border-b px-2 py-1 outline-none"
        />
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1 relative">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="address" className="text-sm font-medium">
            Address <span className="text-red-500">*</span>
          </label>
          <button
            onClick={handleValidateAddress}
            disabled={validating || !placeId || isAddressValidated}
            className={`text-sm px-4 py-1.5 rounded font-medium transition ${
              isAddressValidated
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed"
            }`}
          >
            {validating ? "Validating..." : isAddressValidated ? "Validated" : "Validate"}
          </button>
        </div>
        <input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={(e) => handleAddressInput(e.target.value)}
          onFocus={() => formData.address.length >= 3 && setShowSuggestions(true)}
          placeholder="Street address"
          className="border-b px-2 py-1 outline-none"
          required
        />

        {/* Validation Status Message */}
        {validationStatus === "success" && (
          <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
            <span>✓</span>
            <span>{validationMessage}</span>
          </div>
        )}
        {validationStatus === "error" && (
          <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <span>✗</span>
            <span>{validationMessage}</span>
          </div>
        )}

        {/* Address Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 shadow-lg z-50 max-h-64 overflow-y-auto mt-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                onClick={() => handleSelectAddress(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 transition"
              >
                <div className="font-medium text-sm">{suggestion.main_text || suggestion.description}</div>
                {suggestion.secondary_text && (
                  <div className="text-xs text-gray-500">{suggestion.secondary_text}</div>
                )}
              </button>
            ))}
            {loading && (
              <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
            )}
          </div>
        )}
      </div>

      {/* City & Zip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="Sydney"
            className="border-b px-2 py-1 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="zip" className="text-sm font-medium">
            Zip / Postal Code
          </label>
          <input
            id="zip"
            name="zip"
            type="text"
            value={formData.zip}
            onChange={(e) => handleInputChange("zip", e.target.value)}
            placeholder="2000"
            className="border-b px-2 py-1 outline-none"
          />
        </div>
      </div>

      {/* State */}
      <div className="flex flex-col gap-1">
        <label htmlFor="state" className="text-sm font-medium">
          State / Province
        </label>
        <input
          id="state"
          name="state"
          type="text"
          value={formData.state}
          onChange={(e) => handleInputChange("state", e.target.value)}
          placeholder="New South Wales"
          className="border-b px-2 py-1 outline-none"
        />
      </div>

      {/* Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="countryCode" className="text-sm font-medium">
            Country Code
          </label>
          <input
            id="countryCode"
            name="countryCode"
            type="text"
            value={formData.countryCode}
            onChange={(e) => handleInputChange("countryCode", e.target.value)}
            placeholder="+61"
            className="border-b px-2 py-1 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium">
            Mobile Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="9876543210"
            className="border-b px-2 py-1 outline-none"
          />
        </div>
      </div>
      {/* <button className="bg-black px-10 py-3 text-white">Proceed to checkout</button> */}

    </section>
  );
}
