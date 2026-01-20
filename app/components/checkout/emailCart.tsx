"use client";

import { useState, useEffect } from "react";

interface EmailCartProps {
  onEmailChange: (email: string) => void;
}

export default function EmailCart({ onEmailChange }: EmailCartProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  // Update parent component whenever email changes
  useEffect(() => {
    onEmailChange(formData.email);
  }, [formData.email, onEmailChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="p-10 flex flex-col gap-5">

        <h1 className="text-2xl font-extrabold">Who is placing this order? </h1>
        <p className="text-sm text-gray-600 -mt-3">
          Email is optional - you can continue without providing it.
        </p>

      {/* Email */}
      <div className="flex flex-col gap-1 py-5">
        <label htmlFor="email" className="text-sm font-medium">
          Email <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="you@example.com"
          className="border-b px-2 py-1 outline-none"
        />
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="John"
            className="border-b px-2 py-1 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1 mb-5">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Doe"
            className="border-b px-2 py-1 outline-none"
          />
        </div>

      </div>

    </section>
  );
}
