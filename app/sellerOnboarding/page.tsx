'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';


export default function ArtistOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Email/Phone Verification
    email: '',
    phone: '',
    verificationCode: '',
    
    // Step 2: ABN & Business Details
    abn: '',
    businessName: '',
    contactPerson: '',
    businessPhone: '',
    businessEmail: '',
    
    // Step 3: Bank Details
    accountName: '',
    bsb: '',
    accountNumber: '',
    bankName: '',
    
    // Step 4: Store Details
    storeLogo: null as File | null,
    storeBio: '',
    storeName: '',
    
    // Step 5: Artist/Clan Affiliation
    artistName: '',
    clanAffiliation: '',
    culturalStory: '',
    
    // Step 6: KYC Documents
    idDocument: null as File | null,

    // Additional fields for Step 2
    sellerId: '',
    otp: '',
    password: '',
    businessType: '',
    street: '',
    city: '',
    state: '',
    postcode: '',
    country: '',

    // Step 6: KYC fields
    firstName: '',
    lastName: '',
    dob: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerified, setIsVerified] = useState(false);

  const totalSteps = 6;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [fieldName]: file }));
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // ABN Validation (basic check: 11 digits)
  const validateABN = (abn: string): boolean => {
    const abnDigits = abn.replace(/\s/g, '');
    if (abnDigits.length !== 11 || !/^\d+$/.test(abnDigits)) {
      return false;
    }
    
    // ABN validation algorithm
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    let sum = 0;
    const digits = abnDigits.split('').map(Number);
    digits[0] -= 1; // Subtract 1 from first digit
    
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * weights[i];
    }
    
    return sum % 89 === 0;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.phone) newErrors.phone = 'Phone is required';
        else if (!/^[\d\s+()-]+$/.test(formData.phone)) {
          newErrors.phone = 'Invalid phone format';
        }
        if (!isVerified) {
          newErrors.verificationCode = 'Please verify your email/phone';
        }
        break;

      case 2:
        if (!formData.abn) {
          newErrors.abn = 'ABN is required';
        } else if (!validateABN(formData.abn)) {
          newErrors.abn = 'Invalid ABN';
        }
        if (!formData.businessName) newErrors.businessName = 'Business name is required';
        if (!formData.contactPerson) newErrors.contactPerson = 'Contact person is required';
        if (!formData.businessPhone) newErrors.businessPhone = 'Business phone is required';
        if (!formData.businessEmail) newErrors.businessEmail = 'Business email is required';
        break;

      case 3:
        if (!formData.accountName) newErrors.accountName = 'Account name is required';
        if (!formData.bsb) newErrors.bsb = 'BSB is required';
        else if (!/^\d{6}$/.test(formData.bsb.replace(/-/g, ''))) {
          newErrors.bsb = 'BSB must be 6 digits';
        }
        if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
        if (!formData.bankName) newErrors.bankName = 'Bank name is required';
        break;

      case 4:
        if (!formData.storeLogo) newErrors.storeLogo = 'Store logo is required';
        if (!formData.storeBio) newErrors.storeBio = 'Store bio is required';
        else if (formData.storeBio.length < 50) {
          newErrors.storeBio = 'Bio should be at least 50 characters';
        }
        break;

      case 5:
        if (!formData.artistName) newErrors.artistName = 'Artist name is required';
        if (!formData.clanAffiliation) newErrors.clanAffiliation = 'Clan affiliation is required';
        if (!formData.culturalStory) newErrors.culturalStory = 'Cultural story is required';
        else if (formData.culturalStory.length < 100) {
          newErrors.culturalStory = 'Cultural story should be at least 100 characters';
        }
        break;

      case 6:
        if (!formData.idDocument) newErrors.idDocument = 'ID document is required for KYC';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // Validation disabled for form preview
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleVerify = () => {
    // Simulate verification
    if (formData.verificationCode === '123456') {
      setIsVerified(true);
      setErrors(prev => ({ ...prev, verificationCode: '' }));
    } else {
      setErrors(prev => ({ ...prev, verificationCode: 'Invalid verification code' }));
    }
  };

  const handleSubmit = () => {
    // Validation disabled for form preview
    console.log('Form submitted:', formData);
    alert('Application submitted successfully!');
  };

  return (
<div>
    <Link href="/" className="absolute top-8 left-8">
              <Image
                src="/images/navbarLogo.png"
                alt="Logo"
                width={90}
                height={90}
              />
            </Link>
    {/* <div className="relative min-h-[70vh]  overflow-hidden bg-[url('/images/main.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Seller Onboarding Form</h1>
          <p className="text-lg max-w-2xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Facilis excepturi sed ab aut tempora vitae.
          </p>
        </div>
      </div> */}

    <div className="min-h-screen bg-linear-to-br from-[#FFF8F3] to-[#F3E7DF] py-12 px-4">
      <div className='flex flex-col justify-center items-center'>
      <h2 className="text-3xl font-extrabold text-[#440C03] mb-2 tracking-tight">
            Start your journey as a Seller
          </h2>
          <p className="text-[#6F433A] mb-8">
            Complete all steps to start selling your artwork
          </p>
          </div>
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#6F433A]">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-[#A48068]">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-[#E6CFAF] rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#440C03] to-[#A48068] transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#E6CFAF]">
          

          {/* Step 1: Email/Phone Verification */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
                📧 Account Verification
              </h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.contactPerson ? 'border-red-500' : ''}`}
                  placeholder="Full Name"
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+61 4XX XXX XXX"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              {formData.email && formData.phone && !isVerified && (
                <div className="bg-[#EFE7DA] border border-[#E6CFAF] rounded-xl p-4">
                  <p className="text-sm text-[#6F433A] mb-3">
                    A verification code has been sent to your email and phone.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="verificationCode"
                      value={formData.verificationCode}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <button
                      onClick={handleVerify}
                      className="px-6 py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold shadow hover:from-[#6F433A] hover:to-[#A48068] transition-all"
                    >
                      Verify
                    </button>
                  </div>
                  {errors.verificationCode && (
                    <p className="mt-2 text-sm text-red-600">{errors.verificationCode}</p>
                  )}
                  <p className="mt-2 text-xs text-[#A48068]">
                    Demo code: 123456
                  </p>
                </div>
              )}
              {isVerified && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800 flex items-center">
                    <span className="mr-2">✓</span>
                    Verification successful!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: ABN & Business Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
                🔑 Seller Verification
              </h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">
                  Seller ID
                </label>
                <input
                  type="text"
                  name="sellerId"
                  value={formData.sellerId || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl bg-[#F3E7DF] text-[#440C03] placeholder-[#A48068] opacity-80 cursor-not-allowed"
                  placeholder="Seller ID from step 1 response"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">
                  OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]"
                  placeholder="Enter OTP received"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]"
                  placeholder="Set your password"
                />
              </div>
            </div>
          )}

          {/* Step 3: Business Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
                🏢 Business Details
              </h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Name *</label>
                <input type="text" name="businessName" value={formData.businessName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Business Name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">ABN *</label>
                <div className="flex gap-2">
                  <input type="text" name="abn" value={formData.abn || ''} onChange={handleInputChange} className="flex-1 px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="ABN" />
                  <button type="button" className="px-4 py-2 border bg-linear-to-rrom-[#440C03] to-[#A48068] text-black rounded-xl font-semibold shadow hover:from-[#6F433A] hover:to-[#A48068] transition-all">Verify ABN</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Type *</label>
                <input type="text" name="businessType" value={formData.businessType || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Business Type" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Address *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="street" value={formData.street || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Street" />
                  <input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="City" />
                  <input type="text" name="state" value={formData.state || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="State" />
                  <input type="text" name="postcode" value={formData.postcode || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Postcode" />
                  <input type="text" name="country" value={formData.country || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Country" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Store Details */}
         

          {/* Step 4: Store Profile */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
                🏬 Store Profile
              </h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Name *</label>
                <input type="text" name="storeName" value={formData.storeName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Store Name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Logo *</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'storeLogo')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                {formData.storeLogo && (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mt-2">
                    <img src={URL.createObjectURL(formData.storeLogo)} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Bio *</label>
                <textarea name="storeBio" value={formData.storeBio || ''} onChange={handleInputChange} rows={6} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Tell customers about your art, your inspiration, and what makes your work unique..." />
              </div>
            </div>
          )}

          {/* Step 5: Artist/Clan Affiliation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
                🪃 Artist & Cultural Story
              </h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Artist Name *</label>
                <input type="text" name="artistName" value={formData.artistName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Artist Name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Clan/Tribe Affiliation *</label>
                <input type="text" name="clanAffiliation" value={formData.clanAffiliation || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Clan/Tribe Affiliation" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Cultural Story *</label>
                <textarea name="culturalStory" value={formData.culturalStory || ''} onChange={handleInputChange} rows={6} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Share the story behind your art, your connection to country, cultural traditions, and what your artwork represents..." />
              </div>
            </div>
          )}

          {/* Step 6: KYC Documents */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
                🆔 Identity Verification (KYC)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#6F433A] mb-2">First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="First Name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6F433A] mb-2">Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Last Name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Date of Birth *</label>
                <input type="date" name="dob" value={formData.dob || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Upload ID Document *</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'idDocument')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                {formData.idDocument && (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mt-2">
                    <span className="text-2xl">📄</span>
                    <span className="ml-2 text-sm">{formData.idDocument.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 7: Bank Details */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
                🏦 Bank Details
              </h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Bank Name *</label>
                <input type="text" name="bankName" value={formData.bankName || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Bank Name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Account Name *</label>
                <input type="text" name="accountName" value={formData.accountName || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Account Name" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#6F433A] mb-2">BSB *</label>
                  <input type="text" name="bsb" value={formData.bsb || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="BSB" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6F433A] mb-2">Account Number *</label>
                  <input type="text" name="accountNumber" value={formData.accountNumber || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Account Number" />
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button onClick={handleSubmit} className="px-10 py-3 bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold shadow hover:from-green-700 hover:to-emerald-600 transition-all">
                  Submit Application
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#E6CFAF]">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm border border-[#E6CFAF] ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#EFE7DA] text-[#440C03] hover:bg-[#E6CFAF] hover:text-[#6F433A]'
              }`}
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold shadow hover:from-[#6F433A] hover:to-[#A48068] transition-all"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-10 py-3 bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold shadow hover:from-green-700 hover:to-emerald-600 transition-all"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="mt-8 flex justify-center space-x-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index + 1 === currentStep
                  ? 'bg-orange-500 w-8'
                  : index + 1 < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}