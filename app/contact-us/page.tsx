// "use client";
// import React from "react";
// import Image from "next/image";
// import Testimonials from "@/components/cards/Testimonials";

// export default function Page() {
//   return (
//     <>
//       {/* Hero Section */}
//       <section className="bg-[#ebe2d5]">
//         {/* HERO SECTION */}
//         <div className="relative min-h-[70vh] overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center ">
//         <div className="absolute inset-0 bg-black/50"></div>

//         <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-60 ">
//           <h1 className="text-5xl font-bold mb-2">Contact Us</h1>
//           <p className="text-lg max-w-2xl">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit.
//             Facilis excepturi sed ab aut tempora vitae.
//           </p>
//         </div>
//       </div>
//       </section>

//       {/* Map and Form section */}
//       <section className="flex items-start my-16 px-14 gap-24 max-w-screen-2xl mx-auto">
//         {/* LEFT FORM */}
//         <div className="w-3/5">
//           <form className="space-y-6">
//             {/* ROW 1: TWO INPUTS */}
//             <div className="flex gap-6">
//               <input
//                 type="text"
//                 placeholder="Enter your Name *"
//                 required
//                 className="w-1/2 bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
//               />

//               <input
//                 type="text"
//                 placeholder="Enter your Phone"
//                 className="w-1/2 bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
//               />
//             </div>

//             {/* ROW 2: EMAIL (FULL WIDTH) */}
//             <input
//               type="email"
//               placeholder="Enter your Email Address *"
//               required
//               className="w-full bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
//             />

//             {/* ROW 3: MESSAGE */}
//             <textarea
//               placeholder="Enter your Message *"
//               required
//               rows={5}
//               className="w-full bg-[#F1E4D3] px-6 py-4 rounded-3xl outline-none resize-none"
//             />

//             {/* SUBMIT BUTTON */}
//             <button
//               type="submit"
//               className="bg-[#3b0f06] text-white px-20 py-2 rounded-full font-medium"
//             >
//               Submit
//             </button>
//           </form>
//         </div>

//         {/* RIGHT IMAGE */}
//         <div className="w-2/5">
//           <div className="w-full h-105 rounded-3xl overflow-hidden">
//             <iframe
//               src="https://www.google.com/maps?q=India&z=5&output=embed"
//               className="w-full h-full border-0"
//               loading="lazy"
//               referrerPolicy="no-referrer-when-downgrade"
//             ></iframe>
//           </div>
//         </div>
//       </section>

//       {/* User Reviews / Testimonials */}
//       <section className="flex items-start py-14 gap-16 ">
//         <Testimonials />
//       </section>

//       {/* Explore Section*/}
//       <section className="pb-12 text-white max-w-screen-2xl mx-auto">
//         <div className="relative bg-[url('/images/contact-us.jpg')] bg-cover bg-center h-120 w-full rounded-3xl overflow-hidden flex flex-col justify-center items-center">
//           {/* BLACK OVERLAY */}
//           <div className="absolute inset-0 bg-black/30"></div>

//           {/* CONTENT */}
//           <Image
//             src="/images/navbarLogo.png"
//             alt="Logo"
//             height={200}
//             width={200}
//             className="relative z-10 w-20"
//           />

//           <h1 className="relative z-10 text-4xl font-bold mb-5">
//             Enter Heading Here
//           </h1>
//           <p className="  z-30 w-170 text-center  items-center justify-center mb-5">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis
//             tenetur quam voluptatibus numquam inventore officiis quibusdam,
//             nesciunt sit optio quidem Lorem, ipsum dolor. Lorem ipsum dolor
//             consectetur.!
//           </p>

//           <button className="z-30 px-14 py-2.5 rounded-4xl bg-[#d3b994] text-[#582419]">
//             Explore Marketplace
//           </button>
//         </div>
//       </section>
//     </>
//   );
// }


"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Testimonials from "@/components/cards/Testimonials";
import { MapPin, Phone, Mail, Send, ArrowRight, ChevronDown } from "lucide-react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const FAQS = [
  {
    question: "How do I become a verified seller on the marketplace?",
    answer: "Becoming a seller is easy! Click on 'Seller Onboarding' at the bottom of the page, fill out your business profile, verify your identity, and set up your storefront. Once approved, you can start listing products immediately."
  },
  {
    question: "How are shipping and commissions handled?",
    answer: "Our platform takes a small flat commission on every successful sale. Sellers have the freedom to set their own shipping rates or use our integrated logistics partners for standardized global delivery."
  },
  {
    question: "What happens if a buyer requests a refund?",
    answer: "If a buyer is unsatisfied, they can initiate a return within our 30-day buyer protection window. The dispute is first handled directly between the buyer and seller. If unresolved, our support team steps in to mediate based on marketplace policies."
  },
  {
    question: "How often do sellers receive their payouts?",
    answer: "Seller payouts are processed automatically via Stripe Connect. Once an order is delivered and the dispute window closes, funds are transferred directly to your registered bank account on a bi-weekly schedule."
  },
  {
    question: "Can I manage my store inventory from a mobile device?",
    answer: "Absolutely! Our seller dashboard is fully responsive. You can add new products, track active orders, respond to customer inquiries, and view analytics directly from your smartphone or tablet."
  }
];

// ─── Country phone data from react-phone-number-input ────────────────────────
const countryCodeList = getCountries();

// Country flag emojis mapping
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

export default function Page() {
  const [fields, setFields] = useState({ name: "", phone: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Phone country picker
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneInputError, setPhoneInputError] = useState<string | null>(null);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setShowPhoneDropdown(false);
        setPhoneSearch('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!fields.name.trim())    newErrors.name    = 'Full name is required.';
    if (!fields.email.trim())   newErrors.email   = 'Email address is required.';
    if (!fields.message.trim()) newErrors.message = 'Message is required.';
    const phoneErr = validatePhone(fields.phone, phoneCountry);
    if (phoneErr) newErrors.phone = phoneErr;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitted(true);
  };

  const inputBase = "w-full px-5 py-4 rounded-xl outline-none transition-all";
  const inputNormal = `${inputBase} bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#3b0f06]/20 focus:border-[#3b0f06]`;
  const inputError  = `${inputBase} bg-red-50 border border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500`;

  return (
    <main className="bg-[#ebe2d5] min-h-screen font-sans">
      
      {/* --- HERO SECTION --- */}
      {/* Added a subtle gradient overlay for better text readability */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/main.png')] bg-cover bg-center bg-fixed animate-slow-zoom">
          {/* Layered gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-amber-900/70 via-amber-900/40 to-black/80" />
          <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <span className="mb-4 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-sm font-medium backdrop-blur-md">
             We'd love to hear from you
          </span>
          <h1 className="text-6xl font-bold mb-6 tracking-tight">Contact Us</h1>
          <p className="text-base text-gray-200 max-w-2xl leading-relaxed">
            Have a question or need assistance? Reach out to our team and we'll get back to you shortly.
          </p>
        </div>
      </section>

      {/* We pull this section UP to overlap the hero for a modern look (-mt-20) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 mb-20">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* LEFT: THE FORM (Takes up 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#3b0f06]/5">
            <h2 className="text-3xl font-bold text-[#3b0f06] mb-2">Send us a message</h2>
            <p className="text-gray-500 mb-2">Fill out the form below and our team will get back to you within 24 hours.</p>
            <p className="text-xs text-gray-400 mb-8"><span className="text-red-500 font-bold">*</span> Required fields</p>
            
            <form className="space-y-6" noValidate onSubmit={handleSubmit}>

              {submitted && (
                <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
                  <svg className="w-5 h-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Message sent! We'll get back to you within 24 hours.
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-600 ml-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="name"
                        value={fields.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={errors.name ? inputError : inputNormal}
                    />
                    {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-600 ml-1">Phone Number <span className="text-red-500">*</span></label>
                    <div ref={phoneDropdownRef} className="relative">
                      <div className={`flex items-center bg-gray-50 border rounded-xl overflow-visible transition-all ${
                        errors.phone
                          ? 'border-red-400 ring-2 ring-red-200 bg-red-50'
                          : phoneTouched && !phoneInputError && fields.phone.trim()
                          ? 'border-[#3b0f06]/60'
                          : 'border-gray-200 focus-within:border-[#3b0f06] focus-within:ring-2 focus-within:ring-[#3b0f06]/20'
                      }`}>
                        {/* Country picker button */}
                        <button
                          type="button"
                          onClick={() => { setShowPhoneDropdown(v => !v); setPhoneSearch(''); }}
                          className="flex items-center gap-1.5 px-3 py-4 text-sm font-medium border-r border-gray-200 hover:bg-gray-100 transition rounded-l-xl shrink-0"
                        >
                          <span className="text-lg leading-none">{phoneCountry.flag}</span>
                          <span className="text-gray-700 text-xs font-semibold">{phoneCountry.dialCode}</span>
                          <span className="text-gray-400 text-xs">▾</span>
                        </button>
                        <input
                          type="tel"
                          name="phone"
                          value={fields.phone}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^\d\s\-().]/g, '');
                            setFields(prev => ({ ...prev, phone: v }));
                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                            if (phoneTouched) setPhoneInputError(validatePhone(v, phoneCountry));
                          }}
                          onBlur={() => { setPhoneTouched(true); setPhoneInputError(validatePhone(fields.phone, phoneCountry)); }}
                          placeholder="Enter phone number"
                          className="flex-1 px-4 py-4 text-sm bg-transparent outline-none placeholder-gray-400 text-gray-700"
                        />
                      </div>
                      {/* Country dropdown */}
                      {showPhoneDropdown && (
                        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden" style={{ minWidth: '260px' }}>
                          <div className="p-2 border-b border-gray-100">
                            <input
                              type="text"
                              autoFocus
                              value={phoneSearch}
                              onChange={(e) => setPhoneSearch(e.target.value)}
                              placeholder="Search country…"
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#3b0f06] bg-white text-gray-700"
                            />
                          </div>
                          <ul className="max-h-52 overflow-y-auto">
                            {COUNTRIES
                              .filter(c => c.name.toLowerCase().includes(phoneSearch.toLowerCase()) || c.dialCode.includes(phoneSearch))
                              .map(c => (
                                <li key={c.code}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPhoneCountry(c);
                                      setShowPhoneDropdown(false);
                                      setPhoneSearch('');
                                      if (phoneTouched) setPhoneInputError(validatePhone(fields.phone, c));
                                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 text-left transition ${
                                      c.code === phoneCountry.code ? 'bg-[#3b0f06]/8 font-medium text-[#3b0f06]' : 'text-gray-700'
                                    }`}
                                  >
                                    <span className="text-base w-6 shrink-0">{c.flag}</span>
                                    <span className="flex-1 truncate">{c.name}</span>
                                    <span className="text-gray-400 text-xs shrink-0">{c.dialCode}</span>
                                  </button>
                                </li>
                              ))
                            }
                          </ul>
                        </div>
                      )}
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone}</p>}
                    {!errors.phone && phoneTouched && phoneInputError && <p className="text-xs text-red-500 ml-1">{phoneInputError}</p>}
                    {!errors.phone && phoneTouched && !phoneInputError && fields.phone.trim() && <p className="text-xs text-green-600 ml-1">✓ Looks good</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-600 ml-1">Email Address <span className="text-red-500">*</span></label>
                <input
                    type="email"
                    name="email"
                    value={fields.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={errors.email ? inputError : inputNormal}
                />
                {errors.email && <p className="text-xs text-red-500 ml-1">Email address is required.</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-600 ml-1">Message <span className="text-red-500">*</span></label>
                <textarea
                    name="message"
                    value={fields.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={6}
                    className={errors.message ? inputError : inputNormal + " resize-none"}
                />
                {errors.message && <p className="text-xs text-red-500 ml-1">Message is required.</p>}
              </div>

              <button
                type="submit"
                className="group flex items-center justify-center gap-2 w-full md:w-auto bg-[#3b0f06] text-white px-10 py-4 rounded-xl font-semibold hover:bg-[#582419] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Send Message
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* RIGHT: CONTACT INFO & MAP (Takes up 1 col) */}
          <div className="space-y-8">
            
            {/* Contact Details Card */}
            <div className="bg-[#3b0f06] text-[#ebe2d5] rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-6">Contact Info</h3>
                
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <MapPin className="w-6 h-6 text-[#d3b994]" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Our Location</p>
                            <p className="text-sm text-white/70 leading-relaxed mt-1">
                                123 Business Avenue,<br />
                                Suite 400, New York, NY 10012
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <Phone className="w-6 h-6 text-[#d3b994]" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Phone Number</p>
                            <p className="text-sm text-white/70 mt-1">+1 (800) 123-4567</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <Mail className="w-6 h-6 text-[#d3b994]" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Email Address</p>
                            <p className="text-sm text-white/70 mt-1">support@yourdomain.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Widget */}
            <div className="h-80 w-full rounded-3xl overflow-hidden shadow-lg border-4 border-white">
               <iframe
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.98!3d40.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40zMCcxNS42Ilc!5e0!3m2!1sen!2sus!4v1234567890"
                 className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#3b0f06] mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Find answers to some of the most common questions below.</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#3b0f06]/40 shadow-md' : 'border-gray-100 hover:border-[#3b0f06]/20'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <h3 className={`font-bold text-lg transition-colors ${isOpen ? 'text-[#3b0f06]' : 'text-gray-800'}`}>
                    {faq.question}
                  </h3>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-[#3b0f06] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- EXPLORE SECTION --- */}
      <section className="pb-12 px-4">
        <div className="max-w-7xl mx-auto relative bg-[url('/images/contact-us.jpg')] bg-cover bg-center h-125 w-full rounded-[2.5rem] overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/30 transition-opacity duration-500"></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              height={120}
              width={120}
              className="w-24 mb-6 drop-shadow-lg"
            />

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 transform transition-transform duration-500 group-hover:-translate-y-2">
              Ready to get started?
            </h1>
            <p className="text-gray-200 max-w-xl mb-8 leading-relaxed">
               Discover our marketplace and find exactly what you need with our curated collection of premium items.
            </p>

            <button className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#d3b994] text-[#3b0f06] font-bold hover:bg-white transition-all duration-300 shadow-lg hover:shadow-orange-500/20">
              Explore Marketplace
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}