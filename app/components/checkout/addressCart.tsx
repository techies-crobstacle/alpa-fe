"use client";

import { useState, useEffect } from "react";

interface AddressCartProps {
  onAddressChange: (address: string) => void;
}

export default function AddressCart({ onAddressChange }: AddressCartProps) {
  const [formData, setFormData] = useState({
    country: "",
    address: "",
    city: "",
    zip: "",
    state: "",
    countryCode: "",
    phone: "",
  });

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
      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-medium">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Street address"
          className="border-b px-2 py-1 outline-none"
          required
        />
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
