// 'use client';

// import React, { useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';


// export default function ArtistOnboardingForm() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     // Step 1: Email/Phone Verification
//     email: '',
//     phone: '',
//     verificationCode: '',
    
//     // Step 2: ABN & Business Details
//     abn: '',
//     businessName: '',
//     contactPerson: '',
//     businessPhone: '',
//     businessEmail: '',
    
//     // Step 3: Bank Details
//     accountName: '',
//     bsb: '',
//     accountNumber: '',
//     bankName: '',
    
//     // Step 4: Store Details
//     storeLogo: null as File | null,
//     storeBio: '',
//     storeName: '',
    
//     // Step 5: Artist/Clan Affiliation
//     artistName: '',
//     clanAffiliation: '',
//     culturalStory: '',
    
//     // Step 6: KYC Documents
//     idDocument: null as File | null,

//     // Additional fields for Step 2
//     sellerId: '',
//     otp: '',
//     password: '',
//     businessType: '',
//     street: '',
//     city: '',
//     state: '',
//     postcode: '',
//     country: '',

//     // Step 6: KYC fields
//     firstName: '',
//     lastName: '',
//     dob: '',
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isVerified, setIsVerified] = useState(false);
//   const [isLoadingStep1, setIsLoadingStep1] = useState(false);
//   const [showVerificationInput, setShowVerificationInput] = useState(false);

//   const totalSteps = 6;
//   const baseURL = 'http://127.0.0.1:5000';

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
//     const file = e.target.files?.[0] || null;
//     setFormData(prev => ({ ...prev, [fieldName]: file }));
//     if (errors[fieldName]) {
//       setErrors(prev => ({ ...prev, [fieldName]: '' }));
//     }
//   };

//   // ABN Validation (basic check: 11 digits)
//   const validateABN = (abn: string): boolean => {
//     const abnDigits = abn.replace(/\s/g, '');
//     if (abnDigits.length !== 11 || !/^\d+$/.test(abnDigits)) {
//       return false;
//     }
    
//     // ABN validation algorithm
//     const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
//     let sum = 0;
//     const digits = abnDigits.split('').map(Number);
//     digits[0] -= 1; // Subtract 1 from first digit
    
//     for (let i = 0; i < 11; i++) {
//       sum += digits[i] * weights[i];
//     }
    
//     return sum % 89 === 0;
//   };

//   const validateStep = (step: number): boolean => {
//     const newErrors: Record<string, string> = {};

//     switch (step) {
//       case 1:
//         if (!formData.email) newErrors.email = 'Email is required';
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//           newErrors.email = 'Invalid email format';
//         }
//         if (!formData.phone) newErrors.phone = 'Phone is required';
//         else if (!/^[\d\s+()-]+$/.test(formData.phone)) {
//           newErrors.phone = 'Invalid phone format';
//         }
//         if (!isVerified) {
//           newErrors.verificationCode = 'Please verify your email/phone';
//         }
//         break;

//       case 2:
//         if (!formData.abn) {
//           newErrors.abn = 'ABN is required';
//         } else if (!validateABN(formData.abn)) {
//           newErrors.abn = 'Invalid ABN';
//         }
//         if (!formData.businessName) newErrors.businessName = 'Business name is required';
//         if (!formData.contactPerson) newErrors.contactPerson = 'Contact person is required';
//         if (!formData.businessPhone) newErrors.businessPhone = 'Business phone is required';
//         if (!formData.businessEmail) newErrors.businessEmail = 'Business email is required';
//         break;

//       case 3:
//         if (!formData.accountName) newErrors.accountName = 'Account name is required';
//         if (!formData.bsb) newErrors.bsb = 'BSB is required';
//         else if (!/^\d{6}$/.test(formData.bsb.replace(/-/g, ''))) {
//           newErrors.bsb = 'BSB must be 6 digits';
//         }
//         if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
//         if (!formData.bankName) newErrors.bankName = 'Bank name is required';
//         break;

//       case 4:
//         if (!formData.storeLogo) newErrors.storeLogo = 'Store logo is required';
//         if (!formData.storeBio) newErrors.storeBio = 'Store bio is required';
//         else if (formData.storeBio.length < 50) {
//           newErrors.storeBio = 'Bio should be at least 50 characters';
//         }
//         break;

//       case 5:
//         if (!formData.artistName) newErrors.artistName = 'Artist name is required';
//         if (!formData.clanAffiliation) newErrors.clanAffiliation = 'Clan affiliation is required';
//         if (!formData.culturalStory) newErrors.culturalStory = 'Cultural story is required';
//         else if (formData.culturalStory.length < 100) {
//           newErrors.culturalStory = 'Cultural story should be at least 100 characters';
//         }
//         break;

//       case 6:
//         if (!formData.idDocument) newErrors.idDocument = 'ID document is required for KYC';
//         break;
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleApplyStep1 = async () => {
//     // Validate Step 1 fields
//     if (!formData.contactPerson?.trim()) {
//       setErrors(prev => ({ ...prev, contactPerson: 'Contact person name is required' }));
//       return;
//     }
//     if (!formData.email?.trim()) {
//       setErrors(prev => ({ ...prev, email: 'Email is required' }));
//       return;
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
//       return;
//     }
//     if (!formData.phone?.trim()) {
//       setErrors(prev => ({ ...prev, phone: 'Phone is required' }));
//       return;
//     }

//     setIsLoadingStep1(true);
//     try {
//       const response = await fetch(`${baseURL}/api/sellers/apply`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           contactPerson: formData.contactPerson,
//           email: formData.email,
//           phone: formData.phone,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Failed to apply' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to apply. Please try again.' }));
//         return;
//       }

//       const data = await response.json();
//       // Store sellerId from response if provided
//       if (data.sellerId) {
//         setFormData(prev => ({ ...prev, sellerId: data.sellerId }));
//       }
//       // Show verification input
//       setShowVerificationInput(true);
//       setErrors({});
//     } catch (error) {
//       console.error('Error applying:', error);
//       setErrors(prev => ({ ...prev, submit: 'An error occurred. Please try again.' }));
//     } finally {
//       setIsLoadingStep1(false);
//     }
//   };

//   const handleNext = () => {
//     if (currentStep === 1) {
//       if (!isVerified) {
//         handleApplyStep1();
//         return;
//       }
//     }
//     // Validation disabled for form preview
//     setCurrentStep(prev => Math.min(prev + 1, totalSteps));
//   };

//   const handlePrevious = () => {
//     setCurrentStep(prev => Math.max(prev - 1, 1));
//   };

//   const handleVerify = () => {
//     // Simulate verification (demo code: 123456)
//     if (formData.verificationCode === '123456') {
//       setIsVerified(true);
//       setErrors(prev => ({ ...prev, verificationCode: '' }));
//       // Auto advance to next step after verification
//       setTimeout(() => setCurrentStep(prev => Math.min(prev + 1, totalSteps)), 500);
//     } else {
//       setErrors(prev => ({ ...prev, verificationCode: 'Invalid verification code' }));
//     }
//   };

//   const handleSubmit = () => {
//     // Validation disabled for form preview
//     console.log('Form submitted:', formData);
//     alert('Application submitted successfully!');
//   };

//   return (
// <div>
//     <Link href="/" className="absolute top-8 left-8">
//               <Image
//                 src="/images/navbarLogo.png"
//                 alt="Logo"
//                 width={90}
//                 height={90}
//               />
//             </Link>
//     {/* <div className="relative min-h-[70vh]  overflow-hidden bg-[url('/images/main.jpg')] bg-cover bg-center">
//         <div className="absolute inset-0 bg-black/50" />

//         <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
//           <h1 className="text-5xl font-bold mb-2">Seller Onboarding Form</h1>
//           <p className="text-lg max-w-2xl">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit.
//             Facilis excepturi sed ab aut tempora vitae.
//           </p>
//         </div>
//       </div> */}

//     <div className="min-h-screen bg-linear-to-br from-[#FFF8F3] to-[#F3E7DF] py-12 px-4">
//       <div className='flex flex-col justify-center items-center'>
//       <h2 className="text-3xl font-extrabold text-[#440C03] mb-2 tracking-tight">
//             Start your journey as a Seller
//           </h2>
//           <p className="text-[#6F433A] mb-8">
//             Complete all steps to start selling your artwork
//           </p>
//           </div>
//       <div className="max-w-2xl mx-auto">
//         {/* Progress Bar */}
//         <div className="mb-8">
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm font-medium text-[#6F433A]">
//               Step {currentStep} of {totalSteps}
//             </span>
//             <span className="text-sm text-[#A48068]">
//               {Math.round((currentStep / totalSteps) * 100)}% Complete
//             </span>
//           </div>
//           <div className="w-full h-2 bg-[#E6CFAF] rounded-full overflow-hidden">
//             <div
//               className="h-full bg-linear-to-r from-[#440C03] to-[#A48068] transition-all duration-300"
//               style={{ width: `${(currentStep / totalSteps) * 100}%` }}
//             />
//           </div>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#E6CFAF]">
          

//           {/* Step 1: Email/Phone Verification */}
//           {currentStep === 1 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
//                 📧 Account Verification
//               </h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">
//                   Contact Person Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="contactPerson"
//                   value={formData.contactPerson}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.contactPerson ? 'border-red-500' : ''}`}
//                   placeholder="Full Name"
//                 />
//                 {errors.contactPerson && (
//                   <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.email ? 'border-red-500' : ''}`}
//                   placeholder="your@email.com"
//                 />
//                 {errors.email && (
//                   <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.phone ? 'border-red-500' : ''}`}
//                   placeholder="+61 4XX XXX XXX"
//                 />
//                 {errors.phone && (
//                   <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
//                 )}
//               </div>
//               {errors.submit && (
//                 <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//                   <p className="text-sm text-red-800">{errors.submit}</p>
//                 </div>
//               )}
//               {formData.email && formData.phone && !isVerified && showVerificationInput && (
//                 <div className="bg-[#EFE7DA] border border-[#E6CFAF] rounded-xl p-4">
//                   <p className="text-sm text-[#6F433A] mb-3">
//                     A verification code has been sent to your email and phone.
//                   </p>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       name="verificationCode"
//                       value={formData.verificationCode}
//                       onChange={handleInputChange}
//                       className="flex-1 px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]"
//                       placeholder="Enter 6-digit code"
//                       maxLength={6}
//                     />
//                     <button
//                       onClick={handleVerify}
//                       className="px-6 py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold shadow hover:from-[#6F433A] hover:to-[#A48068] transition-all"
//                     >
//                       Verify
//                     </button>
//                   </div>
//                   {errors.verificationCode && (
//                     <p className="mt-2 text-sm text-red-600">{errors.verificationCode}</p>
//                   )}
//                   <p className="mt-2 text-xs text-[#A48068]">
//                     Demo code: 123456
//                   </p>
//                 </div>
//               )}
//               {isVerified && (
//                 <div className="bg-green-50 border border-green-200 rounded-xl p-4">
//                   <p className="text-sm text-green-800 flex items-center">
//                     <span className="mr-2">✓</span>
//                     Verification successful!
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Step 2: ABN & Business Details */}
//           {currentStep === 2 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
//                 🔑 Seller Verification
//               </h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">
//                   Seller ID
//                 </label>
//                 <input
//                   type="text"
//                   name="sellerId"
//                   value={formData.sellerId || ''}
//                   readOnly
//                   className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl bg-[#F3E7DF] text-[#440C03] placeholder-[#A48068] opacity-80 cursor-not-allowed"
//                   placeholder="Seller ID from step 1 response"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">
//                   OTP
//                 </label>
//                 <input
//                   type="text"
//                   name="otp"
//                   value={formData.otp || ''}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]"
//                   placeholder="Enter OTP received"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password || ''}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]"
//                   placeholder="Set your password"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Step 3: Business Details */}
//           {currentStep === 3 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
//                 🏢 Business Details
//               </h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Name *</label>
//                 <input type="text" name="businessName" value={formData.businessName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Business Name" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">ABN *</label>
//                 <div className="flex gap-2">
//                   <input type="text" name="abn" value={formData.abn || ''} onChange={handleInputChange} className="flex-1 px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="ABN" />
//                   <button type="button" className="px-4 py-2 border bg-linear-to-rrom-[#440C03] to-[#A48068] text-black rounded-xl font-semibold shadow hover:from-[#6F433A] hover:to-[#A48068] transition-all">Verify ABN</button>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Type *</label>
//                 <input type="text" name="businessType" value={formData.businessType || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Business Type" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Address *</label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <input type="text" name="street" value={formData.street || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Street" />
//                   <input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="City" />
//                   <input type="text" name="state" value={formData.state || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="State" />
//                   <input type="text" name="postcode" value={formData.postcode || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Postcode" />
//                   <input type="text" name="country" value={formData.country || ''} onChange={handleInputChange} className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Country" />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 4: Store Details */}
         

//           {/* Step 4: Store Profile */}
//           {currentStep === 4 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
//                 🏬 Store Profile
//               </h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Name *</label>
//                 <input type="text" name="storeName" value={formData.storeName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Store Name" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Logo *</label>
//                 <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'storeLogo')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
//                 {formData.storeLogo && (
//                   <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mt-2">
//                     <img src={URL.createObjectURL(formData.storeLogo)} alt="Logo preview" className="w-full h-full object-cover" />
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Bio *</label>
//                 <textarea name="storeBio" value={formData.storeBio || ''} onChange={handleInputChange} rows={6} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Tell customers about your art, your inspiration, and what makes your work unique..." />
//               </div>
//             </div>
//           )}

//           {/* Step 5: Artist/Clan Affiliation */}
//           {currentStep === 5 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
//                 🪃 Artist & Cultural Story
//               </h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Artist Name *</label>
//                 <input type="text" name="artistName" value={formData.artistName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Artist Name" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Clan/Tribe Affiliation *</label>
//                 <input type="text" name="clanAffiliation" value={formData.clanAffiliation || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Clan/Tribe Affiliation" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Cultural Story *</label>
//                 <textarea name="culturalStory" value={formData.culturalStory || ''} onChange={handleInputChange} rows={6} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Share the story behind your art, your connection to country, cultural traditions, and what your artwork represents..." />
//               </div>
//             </div>
//           )}

//           {/* Step 6: KYC Documents */}
//           {currentStep === 6 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
//                 🆔 Identity Verification (KYC)
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-[#6F433A] mb-2">First Name *</label>
//                   <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="First Name" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-[#6F433A] mb-2">Last Name *</label>
//                   <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Last Name" />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Date of Birth *</label>
//                 <input type="date" name="dob" value={formData.dob || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Upload ID Document *</label>
//                 <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'idDocument')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
//                 {formData.idDocument && (
//                   <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mt-2">
//                     <span className="text-2xl">📄</span>
//                     <span className="ml-2 text-sm">{formData.idDocument.name}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Step 7: Bank Details */}
//           {currentStep === 7 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">
//                 🏦 Bank Details
//               </h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Bank Name *</label>
//                 <input type="text" name="bankName" value={formData.bankName || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Bank Name" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Account Name *</label>
//                 <input type="text" name="accountName" value={formData.accountName || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Account Name" />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-[#6F433A] mb-2">BSB *</label>
//                   <input type="text" name="bsb" value={formData.bsb || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="BSB" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-[#6F433A] mb-2">Account Number *</label>
//                   <input type="text" name="accountNumber" value={formData.accountNumber || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" placeholder="Account Number" />
//                 </div>
//               </div>
//               <div className="flex justify-end mt-8">
//                 <button onClick={handleSubmit} className="px-10 py-3 bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold shadow hover:from-green-700 hover:to-emerald-600 transition-all">
//                   Submit Application
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Navigation Buttons */}
//           <div className="flex justify-between mt-8 pt-6 border-t border-[#E6CFAF]">
//             <button
//               onClick={handlePrevious}
//               disabled={currentStep === 1}
//               className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm border border-[#E6CFAF] ${
//                 currentStep === 1
//                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   : 'bg-[#EFE7DA] text-[#440C03] hover:bg-[#E6CFAF] hover:text-[#6F433A]'
//               }`}
//             >
//               Previous
//             </button>

//             {currentStep < totalSteps ? (
//               <button
//                 onClick={handleNext}
//                 disabled={currentStep === 1 && isLoadingStep1}
//                 className={`px-8 py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold shadow hover:from-[#6F433A] hover:to-[#A48068] transition-all ${
//                   currentStep === 1 && isLoadingStep1 ? 'opacity-70 cursor-not-allowed' : ''
//                 }`}
//               >
//                 {currentStep === 1 && isLoadingStep1 ? 'Verifying...' : 'Next Step'}
//               </button>
//             ) : (
//               <button
//                 onClick={handleSubmit}
//                 className="px-10 py-3 bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold shadow hover:from-green-700 hover:to-emerald-600 transition-all"
//               >
//                 Submit Application
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Step Indicators */}
//         <div className="mt-8 flex justify-center space-x-2">
//           {Array.from({ length: totalSteps }).map((_, index) => (
//             <div
//               key={index}
//               className={`w-2 h-2 rounded-full transition-colors ${
//                 index + 1 === currentStep
//                   ? 'bg-orange-500 w-8'
//                   : index + 1 < currentStep
//                   ? 'bg-green-500'
//                   : 'bg-gray-300'
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ArtistOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [abnVerified, setAbnVerified] = useState(false);
  const baseURL = 'http://127.0.0.1:5000';

  const [formData, setFormData] = useState({
    // Step 1
    email: '',
    phone: '',
    contactPerson: '',
    verificationCode: '',
    
    // Step 2
    sellerId: '',
    otp: '',
    password: '',
    
    // Step 3: Business Details
    businessName: '',
    abn: '',
    businessType: '',
    businessPhone: '',
    businessEmail: '',
    street: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    
    // Step 4: Cultural Info
    artistName: '',
    clanAffiliation: '',
    culturalStory: '',
    
    // Step 5: Store Profile
    storeName: '',
    storeLogo: null as File | null,
    storeBio: '',
    
    // Step 6: KYC
    firstName: '',
    lastName: '',
    dob: '',
    idDocument: null as File | null,
    
    // Bank Details
    bankName: '',
    accountName: '',
    bsb: '',
    accountNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const totalSteps = 6;

  // Load from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem('sellerOnboardingStep');
    const savedFormData = localStorage.getItem('sellerOnboardingFormData');
    const savedToken = localStorage.getItem('sellerToken');
    const savedIsVerified = localStorage.getItem('sellerIsVerified');
    const savedAbnVerified = localStorage.getItem('sellerAbnVerified');

    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
      } catch (e) {
        console.error('Failed to parse saved form data');
      }
    }
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedIsVerified) {
      setIsVerified(JSON.parse(savedIsVerified));
    }
    if (savedAbnVerified) {
      setAbnVerified(JSON.parse(savedAbnVerified));
    }
  }, []);

  // Save to localStorage whenever step changes
  useEffect(() => {
    localStorage.setItem('sellerOnboardingStep', currentStep.toString());
  }, [currentStep]);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('sellerOnboardingFormData', JSON.stringify(formData));
  }, [formData]);

  // Save token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('sellerToken', token);
    }
  }, [token]);

  // Save verification states
  useEffect(() => {
    localStorage.setItem('sellerIsVerified', JSON.stringify(isVerified));
  }, [isVerified]);

  useEffect(() => {
    localStorage.setItem('sellerAbnVerified', JSON.stringify(abnVerified));
  }, [abnVerified]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // STEP 1: Apply
  const handleApplyStep1 = async () => {
    if (!formData.contactPerson?.trim()) {
      setErrors(prev => ({ ...prev, contactPerson: 'Contact person name is required' }));
      return;
    }
    if (!formData.email?.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return;
    }
    if (!formData.phone?.trim()) {
      setErrors(prev => ({ ...prev, phone: 'Phone is required' }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/sellers/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to apply' }));
        setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to apply' }));
        return;
      }

      const data = await response.json();
      if (data.sellerId) {
        setFormData(prev => ({ ...prev, sellerId: data.sellerId }));
      }
      setErrors({});
      // Automatically advance to next step
      setTimeout(() => setCurrentStep(2), 500);
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({ ...prev, submit: 'An error occurred. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Get Token
  const handleStep2Submit = async () => {
    if (!formData.otp?.trim()) {
      setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
      return;
    }
    if (!formData.password?.trim()) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/sellers/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: formData.sellerId,
          otp: formData.otp,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to verify' }));
        setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to verify OTP' }));
        return;
      }

      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('sellerToken', data.token);
      }
      setErrors({});
      setCurrentStep(3);
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({ ...prev, submit: 'An error occurred. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!formData.sellerId) {
      setErrors(prev => ({ ...prev, submit: 'Seller ID is missing' }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/sellers/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: formData.sellerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to resend OTP' }));
        setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to resend OTP' }));
        return;
      }

      setErrors(prev => ({ ...prev, submit: '' }));
      alert('OTP has been resent to your email and phone');
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({ ...prev, submit: 'An error occurred. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Business Details
  const handleStep3Submit = async () => {
    if (!formData.businessName?.trim()) {
      setErrors(prev => ({ ...prev, businessName: 'Business name is required' }));
      return;
    }
    if (!formData.abn?.trim()) {
      setErrors(prev => ({ ...prev, abn: 'ABN is required' }));
      return;
    }
    if (!abnVerified) {
      setErrors(prev => ({ ...prev, abn: 'Please verify ABN first' }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/sellers/business-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          abn: formData.abn,
          businessType: formData.businessType,
          businessAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed' }));
        setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to save business details' }));
        return;
      }

      setErrors({});
      setCurrentStep(4);
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({ ...prev, submit: 'An error occurred.' }));
    } finally {
      setLoading(false);
    }
  };

  // ABN Verification
  const handleValidateABN = async () => {
    if (!formData.abn?.trim()) {
      setErrors(prev => ({ ...prev, abn: 'ABN is required' }));
      return;
    }

    // Basic ABN format validation (11 digits)
    const abnDigits = formData.abn.replace(/\s/g, '');
    if (abnDigits.length !== 11 || !/^\d+$/.test(abnDigits)) {
      setErrors(prev => ({ ...prev, abn: 'ABN must be 11 digits' }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/sellers/validate-abn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ abn: formData.abn }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Invalid ABN' }));
        setErrors(prev => ({ ...prev, abn: errorData.message || 'Invalid ABN' }));
        return;
      }

      const data = await response.json();
      console.log('ABN Validation Response:', data);

      // Check if validation was successful
      if (data.success && data.abnValidation?.isValid) {
        setAbnVerified(true);
        setErrors(prev => ({ ...prev, abn: '' }));
        
        // Auto-fill business details if available
        const abnData = data.abnValidation.data;
        if (abnData) {
          const updatedFormData: any = {};
          
          // Auto-fill business name (prefer businessName over entityName)
          if (abnData.businessName) {
            updatedFormData.businessName = abnData.businessName;
          } else if (abnData.entityName) {
            updatedFormData.businessName = abnData.entityName;
          }
          
          // Auto-fill business type
          if (abnData.entityType) {
            updatedFormData.businessType = abnData.entityType;
          }
          
          // Update form data with auto-filled values
          if (Object.keys(updatedFormData).length > 0) {
            setFormData(prev => ({ ...prev, ...updatedFormData }));
            console.log('Auto-filled business details:', updatedFormData);
          }
        }
      } else {
        // Handle validation failure
        const errorMessage = data.abnValidation?.message || 'ABN validation failed - Business not found or invalid';
        setErrors(prev => ({ ...prev, abn: errorMessage }));
        setAbnVerified(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({ ...prev, abn: 'ABN validation failed - Please check your connection' }));
      setAbnVerified(false);
    } finally {
      setLoading(false);
    }
  };

  // STEP 4: Cultural Info
  const handleStep4Submit = async () => {
    if (!formData.artistName?.trim()) {
      setErrors(prev => ({ ...prev, artistName: 'Artist name is required' }));
      return;
    }
    if (!formData.culturalStory?.trim()) {
      setErrors(prev => ({ ...prev, culturalStory: 'Cultural story is required' }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/sellers/cultural-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          artistName: formData.artistName,
          clanAffiliation: formData.clanAffiliation,
          culturalStory: formData.culturalStory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed' }));
        setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to save cultural info' }));
        return;
      }

      setErrors({});
      setCurrentStep(5);
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({ ...prev, submit: 'An error occurred.' }));
    } finally {
      setLoading(false);
    }
  };

  // STEP 5: Store Profile
  const handleStep5Submit = async () => {
    if (!formData.storeName?.trim()) {
      setErrors(prev => ({ ...prev, storeName: 'Store name is required' }));
      return;
    }
    if (!formData.storeLogo) {
      setErrors(prev => ({ ...prev, storeLogo: 'Store logo is required' }));
      return;
    }
    if (!formData.storeBio?.trim() || formData.storeBio.length < 50) {
      setErrors(prev => ({ ...prev, storeBio: 'Bio must be at least 50 characters' }));
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('storeName', formData.storeName);
    formDataToSend.append('storeBio', formData.storeBio);
    if (formData.storeLogo) {
      formDataToSend.append('storeLogo', formData.storeLogo);
    }

    try {
      const response = await fetch(`${baseURL}/api/sellers/store-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed' }));
        setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to save store profile' }));
        return;
      }

      setErrors({});
      setCurrentStep(6);
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({ ...prev, submit: 'An error occurred.' }));
    } finally {
      setLoading(false);
    }
  };

  // STEP 6: KYC & Bank Details
  const handleStep6Submit = async () => {
    if (!formData.firstName?.trim()) {
      setErrors(prev => ({ ...prev, firstName: 'First name is required' }));
      return;
    }
    if (!formData.lastName?.trim()) {
      setErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
      return;
    }
    if (!formData.dob) {
      setErrors(prev => ({ ...prev, dob: 'Date of birth is required' }));
      return;
    }
    if (!formData.idDocument) {
      setErrors(prev => ({ ...prev, idDocument: 'ID document is required' }));
      return;
    }
    if (!formData.bankName?.trim()) {
      setErrors(prev => ({ ...prev, bankName: 'Bank name is required' }));
      return;
    }
    if (!formData.accountName?.trim()) {
      setErrors(prev => ({ ...prev, accountName: 'Account name is required' }));
      return;
    }
    if (!formData.bsb?.trim()) {
      setErrors(prev => ({ ...prev, bsb: 'BSB is required' }));
      return;
    }
    if (!formData.accountNumber?.trim()) {
      setErrors(prev => ({ ...prev, accountNumber: 'Account number is required' }));
      return;
    }

    setLoading(true);

    try {
      // Upload KYC
      const kycFormData = new FormData();
      kycFormData.append('firstName', formData.firstName);
      kycFormData.append('lastName', formData.lastName);
      kycFormData.append('dob', formData.dob);
      if (formData.idDocument) {
        kycFormData.append('idDocument', formData.idDocument);
      }

      const kycResponse = await fetch(`${baseURL}/api/sellers/kyc-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: kycFormData,
      });

      if (!kycResponse.ok) {
        const errorData = await kycResponse.json().catch(() => ({ message: 'KYC upload failed' }));
        setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to upload KYC' }));
        return;
      }

      // Submit Bank Details
      const bankResponse = await fetch(`${baseURL}/api/sellers/bank-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankName: formData.bankName,
          accountName: formData.accountName,
          bsb: formData.bsb,
          accountNumber: formData.accountNumber,
        }),
      });

      if (!bankResponse.ok) {
        const errorData = await bankResponse.json().catch(() => ({ message: 'Bank details failed' }));
        setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to save bank details' }));
        return;
      }

      // Submit for Review
      const submitResponse = await fetch(`${baseURL}/api/sellers/submit-for-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json().catch(() => ({ message: 'Submission failed' }));
        setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to submit application' }));
        return;
      }

      alert('Application submitted successfully!');
      window.location.href = '/';
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({ ...prev, submit: 'An error occurred.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      handleApplyStep1();
      return;
    } else if (currentStep === 2) {
      handleStep2Submit();
      return;
    } else if (currentStep === 3) {
      handleStep3Submit();
      return;
    } else if (currentStep === 4) {
      handleStep4Submit();
      return;
    } else if (currentStep === 5) {
      handleStep5Submit();
      return;
    } else if (currentStep === 6) {
      handleStep6Submit();
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Dev helper: Skip to any step (hold Ctrl and click step number)
  const handleStepJump = (step: number) => {
    setCurrentStep(step);
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
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🔑 Seller Verification</h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Seller ID</label>
                <input type="text" value={formData.sellerId} readOnly className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl bg-[#F3E7DF] text-[#440C03] opacity-80 cursor-not-allowed" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-[#6F433A]">OTP *</label>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm font-semibold text-[#440C03] hover:text-[#6F433A] underline disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Resend OTP'}
                  </button>
                </div>
                <input type="text" name="otp" value={formData.otp} onChange={handleInputChange} placeholder="Enter OTP received" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.otp ? 'border-red-500' : ''}`} />
                {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Set your password" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.password ? 'border-red-500' : ''}`} />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
            </div>
          )}

          {/* Step 3: Business Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🏢 Business Details</h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Name *</label>
                <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="Business Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.businessName ? 'border-red-500' : ''}`} />
                {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">ABN *</label>
                <div className="flex gap-2">
                  <input type="text" name="abn" value={formData.abn} onChange={handleInputChange} placeholder="ABN" className={`flex-1 px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.abn ? 'border-red-500' : ''}`} />
                  <button type="button" onClick={handleValidateABN} disabled={loading} className="px-4 py-2 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold hover:from-[#6F433A] hover:to-[#A48068] transition-all disabled:opacity-70">{abnVerified ? '✓ Verified' : 'Verify ABN'}</button>
                </div>
                {errors.abn && <p className="mt-1 text-sm text-red-600">{errors.abn}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Type</label>
                <input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange} placeholder="Business Type" className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Phone</label>
                <input type="tel" name="businessPhone" value={formData.businessPhone} onChange={handleInputChange} placeholder="Business Phone" className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Email</label>
                <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleInputChange} placeholder="Business Email" className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Address</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="Street" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
                  <input type="text" name="postcode" value={formData.postcode} onChange={handleInputChange} placeholder="Postcode" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="Country" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
                </div>
              </div>
              {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
            </div>
          )}

          {/* Step 4: Cultural Info */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🪃 Artist & Cultural Story</h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Artist Name *</label>
                <input type="text" name="artistName" value={formData.artistName} onChange={handleInputChange} placeholder="Artist Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.artistName ? 'border-red-500' : ''}`} />
                {errors.artistName && <p className="mt-1 text-sm text-red-600">{errors.artistName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Clan/Tribe Affiliation</label>
                <input type="text" name="clanAffiliation" value={formData.clanAffiliation} onChange={handleInputChange} placeholder="Clan/Tribe Affiliation" className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Cultural Story *</label>
                <textarea name="culturalStory" value={formData.culturalStory} onChange={handleInputChange} rows={6} placeholder="Share the story behind your art..." className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.culturalStory ? 'border-red-500' : ''}`} />
                {errors.culturalStory && <p className="mt-1 text-sm text-red-600">{errors.culturalStory}</p>}
              </div>
              {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
            </div>
          )}

          {/* Step 5: Store Profile */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🏬 Store Profile</h3>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Name *</label>
                <input type="text" name="storeName" value={formData.storeName} onChange={handleInputChange} placeholder="Store Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.storeName ? 'border-red-500' : ''}`} />
                {errors.storeName && <p className="mt-1 text-sm text-red-600">{errors.storeName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Logo *</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'storeLogo')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                {formData.storeLogo && <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mt-2"><img src={URL.createObjectURL(formData.storeLogo)} alt="Logo preview" className="w-full h-full object-cover" /></div>}
                {errors.storeLogo && <p className="mt-1 text-sm text-red-600">{errors.storeLogo}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Bio *</label>
                <textarea name="storeBio" value={formData.storeBio} onChange={handleInputChange} rows={6} placeholder="Tell customers about your art..." className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.storeBio ? 'border-red-500' : ''}`} />
                {errors.storeBio && <p className="mt-1 text-sm text-red-600">{errors.storeBio}</p>}
              </div>
              {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
            </div>
          )}

          {/* Step 6: KYC & Bank Details */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🆔 Identity & Bank Details</h3>
              <div>
                <h4 className="text-sm font-semibold text-[#6F433A] mb-4">KYC Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#6F433A] mb-2">First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.firstName ? 'border-red-500' : ''}`} />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#6F433A] mb-2">Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.lastName ? 'border-red-500' : ''}`} />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-[#6F433A] mb-2">Date of Birth *</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.dob ? 'border-red-500' : ''}`} />
                  {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-[#6F433A] mb-2">Upload ID Document *</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'idDocument')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                  {errors.idDocument && <p className="mt-1 text-sm text-red-600">{errors.idDocument}</p>}
                </div>
              </div>

              <hr className="my-6" />

              <div>
                <h4 className="text-sm font-semibold text-[#6F433A] mb-4">Bank Details</h4>
                <div>
                  <label className="block text-sm font-semibold text-[#6F433A] mb-2">Bank Name *</label>
                  <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="Bank Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.bankName ? 'border-red-500' : ''}`} />
                  {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-[#6F433A] mb-2">Account Name *</label>
                  <input type="text" name="accountName" value={formData.accountName} onChange={handleInputChange} placeholder="Account Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.accountName ? 'border-red-500' : ''}`} />
                  {errors.accountName && <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#6F433A] mb-2">BSB *</label>
                    <input type="text" name="bsb" value={formData.bsb} onChange={handleInputChange} placeholder="BSB" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.bsb ? 'border-red-500' : ''}`} />
                    {errors.bsb && <p className="mt-1 text-sm text-red-600">{errors.bsb}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#6F433A] mb-2">Account Number *</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="Account Number" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.accountNumber ? 'border-red-500' : ''}`} />
                    {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
                  </div>
                </div>
              </div>

              {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#E6CFAF]">
            <button onClick={handlePrevious} disabled={currentStep === 1} className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm border border-[#E6CFAF] ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#EFE7DA] text-[#440C03] hover:bg-[#E6CFAF]'}`}>Previous</button>

            <button onClick={handleNext} disabled={loading} className={`px-8 py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold shadow hover:from-[#6F433A] hover:to-[#A48068] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {currentStep === totalSteps ? (loading ? 'Submitting...' : 'Submit Application') : (loading ? 'Processing...' : 'Next Step')}
            </button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="mt-8 flex justify-center space-x-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepJump(index + 1)}
              title={`Click to jump to Step ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-colors cursor-pointer hover:scale-150 ${
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