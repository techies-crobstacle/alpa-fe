// 'use client';

// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// export default function ArtistOnboardingForm() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [abnVerified, setAbnVerified] = useState(false);
//   const baseURL = 'https://alpa-be-1.onrender.com';

//   const [formData, setFormData] = useState({
//     // Step 1
//     email: '',
//     phone: '',
//     contactPerson: '',
//     verificationCode: '',
    
//     // Step 2
//     sellerId: '',
//     otp: '',
//     password: '',
    
//     // Step 3: Business Details
//     businessName: '',
//     abn: '',
//     businessType: '',
//     businessPhone: '',
//     businessEmail: '',
//     street: '',
//     city: '',
//     state: '',
//     postcode: '',
//     country: '',
    
//     // Step 4: Cultural Info
//     artistName: '',
//     clanAffiliation: '',
//     culturalStory: '',
    
//     // Step 5: Store Profile
//     storeName: '',
//     storeLogo: null as File | null,
//     storeBio: '',
    
//     // Step 6: KYC
//     firstName: '',
//     lastName: '',
//     dob: '',
//     idDocument: null as File | null,
    
//     // Bank Details
//     bankName: '',
//     accountName: '',
//     bsb: '',
//     accountNumber: '',
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isVerified, setIsVerified] = useState(false);
//   const [showVerificationInput, setShowVerificationInput] = useState(false);
//   const totalSteps = 6;

//   // Load from localStorage on mount
//   useEffect(() => {
//     const savedStep = localStorage.getItem('sellerOnboardingStep');
//     const savedFormData = localStorage.getItem('sellerOnboardingFormData');
//     const savedToken = localStorage.getItem('sellerToken');
//     const savedIsVerified = localStorage.getItem('sellerIsVerified');
//     const savedAbnVerified = localStorage.getItem('sellerAbnVerified');

//     if (savedStep) {
//       setCurrentStep(parseInt(savedStep, 10));
//     }
//     if (savedFormData) {
//       try {
//         setFormData(JSON.parse(savedFormData));
//       } catch (e) {
//         console.error('Failed to parse saved form data');
//       }
//     }
//     if (savedToken) {
//       setToken(savedToken);
//     }
//     if (savedIsVerified) {
//       setIsVerified(JSON.parse(savedIsVerified));
//     }
//     if (savedAbnVerified) {
//       setAbnVerified(JSON.parse(savedAbnVerified));
//     }
//   }, []);

//   // Save to localStorage whenever step changes
//   useEffect(() => {
//     localStorage.setItem('sellerOnboardingStep', currentStep.toString());
//   }, [currentStep]);

//   // Save to localStorage whenever formData changes
//   useEffect(() => {
//     localStorage.setItem('sellerOnboardingFormData', JSON.stringify(formData));
//   }, [formData]);

//   // Save token to localStorage
//   useEffect(() => {
//     if (token) {
//       localStorage.setItem('sellerToken', token);
//     }
//   }, [token]);

//   // Save verification states
//   useEffect(() => {
//     localStorage.setItem('sellerIsVerified', JSON.stringify(isVerified));
//   }, [isVerified]);

//   useEffect(() => {
//     localStorage.setItem('sellerAbnVerified', JSON.stringify(abnVerified));
//   }, [abnVerified]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
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

//   // STEP 1: Apply
//   const handleApplyStep1 = async () => {
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

//     setLoading(true);
//     try {
//       const response = await fetch(`${baseURL}/api/sellers/apply`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           contactPerson: formData.contactPerson,
//           email: formData.email,
//           phone: formData.phone,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Failed to apply' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to apply' }));
//         return;
//       }

//       const data = await response.json();
//       if (data.sellerId) {
//         setFormData(prev => ({ ...prev, sellerId: data.sellerId }));
//       }
//       setErrors({});
//       // Automatically advance to next step
//       setTimeout(() => setCurrentStep(2), 500);
//     } catch (error) {
//       console.error('Error:', error);
//       setErrors(prev => ({ ...prev, submit: 'An error occurred. Please try again.' }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // STEP 2: Verify OTP & Get Token
//   const handleStep2Submit = async () => {
//     if (!formData.otp?.trim()) {
//       setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
//       return;
//     }
//     if (!formData.password?.trim()) {
//       setErrors(prev => ({ ...prev, password: 'Password is required' }));
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${baseURL}/api/sellers/verify-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sellerId: formData.sellerId,
//           otp: formData.otp,
//           password: formData.password,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Failed to verify' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to verify OTP' }));
//         return;
//       }

//       const data = await response.json();
//       if (data.token) {
//         setToken(data.token);
//         localStorage.setItem('sellerToken', data.token);
//       }
//       setErrors({});
//       setCurrentStep(3);
//     } catch (error) {
//       console.error('Error:', error);
//       setErrors(prev => ({ ...prev, submit: 'An error occurred. Please try again.' }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Resend OTP
//   const handleResendOTP = async () => {
//     if (!formData.sellerId) {
//       setErrors(prev => ({ ...prev, submit: 'Seller ID is missing' }));
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${baseURL}/api/sellers/resend-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sellerId: formData.sellerId,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Failed to resend OTP' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to resend OTP' }));
//         return;
//       }

//       setErrors(prev => ({ ...prev, submit: '' }));
//       alert('OTP has been resent to your email and phone');
//     } catch (error) {
//       console.error('Error:', error);
//       setErrors(prev => ({ ...prev, submit: 'An error occurred. Please try again.' }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // STEP 3: Business Details
//   const handleStep3Submit = async () => {
//     if (!formData.businessName?.trim()) {
//       setErrors(prev => ({ ...prev, businessName: 'Business name is required' }));
//       return;
//     }
//     if (!formData.abn?.trim()) {
//       setErrors(prev => ({ ...prev, abn: 'ABN is required' }));
//       return;
//     }
//     if (!abnVerified) {
//       setErrors(prev => ({ ...prev, abn: 'Please verify ABN first' }));
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${baseURL}/api/sellers/business-details`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           businessName: formData.businessName,
//           abn: formData.abn,
//           businessType: formData.businessType,
//           businessAddress: {
//             street: formData.street,
//             city: formData.city,
//             state: formData.state,
//             postcode: formData.postcode,
//             country: formData.country,
//           },
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Failed' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to save business details' }));
//         return;
//       }

//       setErrors({});
//       setCurrentStep(4);
//     } catch (error) {
//       console.error('Error:', error);
//       setErrors(prev => ({ ...prev, submit: 'An error occurred.' }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ABN Verification
//   const handleValidateABN = async () => {
//     if (!formData.abn?.trim()) {
//       setErrors(prev => ({ ...prev, abn: 'ABN is required' }));
//       return;
//     }

//     // Basic ABN format validation (11 digits)
//     const abnDigits = formData.abn.replace(/\s/g, '');
//     if (abnDigits.length !== 11 || !/^\d+$/.test(abnDigits)) {
//       setErrors(prev => ({ ...prev, abn: 'ABN must be 11 digits' }));
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${baseURL}/api/sellers/validate-abn`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({ abn: formData.abn }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Invalid ABN' }));
//         setErrors(prev => ({ ...prev, abn: errorData.message || 'Invalid ABN' }));
//         return;
//       }

//       const data = await response.json();
//       console.log('ABN Validation Response:', data);

//       // Check if validation was successful
//       if (data.success && data.abnValidation?.isValid) {
//         setAbnVerified(true);
//         setErrors(prev => ({ ...prev, abn: '' }));
        
//         // Auto-fill business details if available
//         const abnData = data.abnValidation.data;
//         if (abnData) {
//           const updatedFormData: any = {};
          
//           // Auto-fill business name (prefer businessName over entityName)
//           if (abnData.businessName) {
//             updatedFormData.businessName = abnData.businessName;
//           } else if (abnData.entityName) {
//             updatedFormData.businessName = abnData.entityName;
//           }
          
//           // Auto-fill business type
//           if (abnData.entityType) {
//             updatedFormData.businessType = abnData.entityType;
//           }
          
//           // Update form data with auto-filled values
//           if (Object.keys(updatedFormData).length > 0) {
//             setFormData(prev => ({ ...prev, ...updatedFormData }));
//             console.log('Auto-filled business details:', updatedFormData);
//           }
//         }
//       } else {
//         // Handle validation failure
//         const errorMessage = data.abnValidation?.message || 'ABN validation failed - Business not found or invalid';
//         setErrors(prev => ({ ...prev, abn: errorMessage }));
//         setAbnVerified(false);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setErrors(prev => ({ ...prev, abn: 'ABN validation failed - Please check your connection' }));
//       setAbnVerified(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // STEP 4: Cultural Info
//   const handleStep4Submit = async () => {
//     if (!formData.artistName?.trim()) {
//       setErrors(prev => ({ ...prev, artistName: 'Artist name is required' }));
//       return;
//     }
//     if (!formData.culturalStory?.trim()) {
//       setErrors(prev => ({ ...prev, culturalStory: 'Cultural story is required' }));
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${baseURL}/api/sellers/cultural-info`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           artistName: formData.artistName,
//           clanAffiliation: formData.clanAffiliation,
//           culturalStory: formData.culturalStory,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Failed' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to save cultural info' }));
//         return;
//       }

//       setErrors({});
//       setCurrentStep(5);
//     } catch (error) {
//       console.error('Error:', error);
//       setErrors(prev => ({ ...prev, submit: 'An error occurred.' }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // STEP 5: Store Profile
//   const handleStep5Submit = async () => {
//     if (!formData.storeName?.trim()) {
//       setErrors(prev => ({ ...prev, storeName: 'Store name is required' }));
//       return;
//     }
//     if (!formData.storeLogo) {
//       setErrors(prev => ({ ...prev, storeLogo: 'Store logo is required' }));
//       return;
//     }
//     if (!formData.storeBio?.trim() || formData.storeBio.length < 50) {
//       setErrors(prev => ({ ...prev, storeBio: 'Bio must be at least 50 characters' }));
//       return;
//     }

//     setLoading(true);
//     const formDataToSend = new FormData();
//     formDataToSend.append('storeName', formData.storeName);
//     formDataToSend.append('storeBio', formData.storeBio);
//     if (formData.storeLogo) {
//       formDataToSend.append('storeLogo', formData.storeLogo);
//     }

//     try {
//       const response = await fetch(`${baseURL}/api/sellers/store-profile`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formDataToSend,
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Failed' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to save store profile' }));
//         return;
//       }

//       setErrors({});
//       setCurrentStep(6);
//     } catch (error) {
//       console.error('Error:', error);
//       setErrors(prev => ({ ...prev, submit: 'An error occurred.' }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // STEP 6: KYC & Bank Details
//   const handleStep6Submit = async () => {
//     if (!formData.firstName?.trim()) {
//       setErrors(prev => ({ ...prev, firstName: 'First name is required' }));
//       return;
//     }
//     if (!formData.lastName?.trim()) {
//       setErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
//       return;
//     }
//     if (!formData.dob) {
//       setErrors(prev => ({ ...prev, dob: 'Date of birth is required' }));
//       return;
//     }
//     if (!formData.idDocument) {
//       setErrors(prev => ({ ...prev, idDocument: 'ID document is required' }));
//       return;
//     }
//     if (!formData.bankName?.trim()) {
//       setErrors(prev => ({ ...prev, bankName: 'Bank name is required' }));
//       return;
//     }
//     if (!formData.accountName?.trim()) {
//       setErrors(prev => ({ ...prev, accountName: 'Account name is required' }));
//       return;
//     }
//     if (!formData.bsb?.trim()) {
//       setErrors(prev => ({ ...prev, bsb: 'BSB is required' }));
//       return;
//     }
//     if (!formData.accountNumber?.trim()) {
//       setErrors(prev => ({ ...prev, accountNumber: 'Account number is required' }));
//       return;
//     }

//     setLoading(true);

//     try {
//       // Upload KYC
//       const kycFormData = new FormData();
//       kycFormData.append('firstName', formData.firstName);
//       kycFormData.append('lastName', formData.lastName);
//       kycFormData.append('dob', formData.dob);
//       if (formData.idDocument) {
//         kycFormData.append('idDocument', formData.idDocument);
//       }

//       const kycResponse = await fetch(`${baseURL}/api/sellers/kyc-upload`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: kycFormData,
//       });

//       if (!kycResponse.ok) {
//         const errorData = await kycResponse.json().catch(() => ({ message: 'KYC upload failed' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to upload KYC' }));
//         return;
//       }

//       // Submit Bank Details
//       const bankResponse = await fetch(`${baseURL}/api/sellers/bank-details`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           bankName: formData.bankName,
//           accountName: formData.accountName,
//           bsb: formData.bsb,
//           accountNumber: formData.accountNumber,
//         }),
//       });

//       if (!bankResponse.ok) {
//         const errorData = await bankResponse.json().catch(() => ({ message: 'Bank details failed' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to save bank details' }));
//         return;
//       }

//       // Submit for Review
//       const submitResponse = await fetch(`${baseURL}/api/sellers/submit-for-review`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({}),
//       });

//       if (!submitResponse.ok) {
//         const errorData = await submitResponse.json().catch(() => ({ message: 'Submission failed' }));
//         setErrors(prev => ({ ...prev, submit: errorData.message || 'Failed to submit application' }));
//         return;
//       }

//       alert('Application submitted successfully!');
//       window.location.href = '/';
//     } catch (error) {
//       console.error('Error:', error);
//       setErrors(prev => ({ ...prev, submit: 'An error occurred.' }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNext = () => {
//     if (currentStep === 1) {
//       handleApplyStep1();
//       return;
//     } else if (currentStep === 2) {
//       handleStep2Submit();
//       return;
//     } else if (currentStep === 3) {
//       handleStep3Submit();
//       return;
//     } else if (currentStep === 4) {
//       handleStep4Submit();
//       return;
//     } else if (currentStep === 5) {
//       handleStep5Submit();
//       return;
//     } else if (currentStep === 6) {
//       handleStep6Submit();
//       return;
//     }
//     setCurrentStep(prev => Math.min(prev + 1, totalSteps));
//   };

//   const handlePrevious = () => {
//     setCurrentStep(prev => Math.max(prev - 1, 1));
//   };

//   // Dev helper: Skip to any step (hold Ctrl and click step number)
//   const handleStepJump = (step: number) => {
//     setCurrentStep(step);
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
//     {/* <div className="relative min-h-[70vh]  overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center">
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
//             </div>
//           )}

//           {/* Step 2: OTP Verification */}
//           {currentStep === 2 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🔑 Seller Verification</h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Seller ID</label>
//                 <input type="text" value={formData.sellerId} readOnly className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl bg-[#F3E7DF] text-[#440C03] opacity-80 cursor-not-allowed" />
//               </div>
//               <div>
//                 <div className="flex justify-between items-center mb-2">
//                   <label className="block text-sm font-semibold text-[#6F433A]">OTP *</label>
//                   <button
//                     type="button"
//                     onClick={handleResendOTP}
//                     disabled={loading}
//                     className="text-sm font-semibold text-[#440C03] hover:text-[#6F433A] underline disabled:opacity-50"
//                   >
//                     {loading ? 'Sending...' : 'Resend OTP'}
//                   </button>
//                 </div>
//                 <input type="text" name="otp" value={formData.otp} onChange={handleInputChange} placeholder="Enter OTP received" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.otp ? 'border-red-500' : ''}`} />
//                 {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Password *</label>
//                 <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Set your password" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.password ? 'border-red-500' : ''}`} />
//                 {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
//               </div>
//               {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
//             </div>
//           )}

//           {/* Step 3: Business Details */}
//           {currentStep === 3 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🏢 Business Details</h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Name *</label>
//                 <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="Business Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.businessName ? 'border-red-500' : ''}`} />
//                 {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">ABN *</label>
//                 <div className="flex gap-2">
//                   <input type="text" name="abn" value={formData.abn} onChange={handleInputChange} placeholder="ABN" className={`flex-1 px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.abn ? 'border-red-500' : ''}`} />
//                   <button type="button" onClick={handleValidateABN} disabled={loading} className="px-4 py-2 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold hover:from-[#6F433A] hover:to-[#A48068] transition-all disabled:opacity-70">{abnVerified ? '✓ Verified' : 'Verify ABN'}</button>
//                 </div>
//                 {errors.abn && <p className="mt-1 text-sm text-red-600">{errors.abn}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Type</label>
//                 <input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange} placeholder="Business Type" className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Phone</label>
//                 <input type="tel" name="businessPhone" value={formData.businessPhone} onChange={handleInputChange} placeholder="Business Phone" className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Email</label>
//                 <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleInputChange} placeholder="Business Email" className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Business Address</label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <input type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="Street" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//                   <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//                   <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//                   <input type="text" name="postcode" value={formData.postcode} onChange={handleInputChange} placeholder="Postcode" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//                   <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="Country" className="px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//                 </div>
//               </div>
//               {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
//             </div>
//           )}

//           {/* Step 4: Cultural Info */}
//           {currentStep === 4 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🪃 Artist & Cultural Story</h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Artist Name *</label>
//                 <input type="text" name="artistName" value={formData.artistName} onChange={handleInputChange} placeholder="Artist Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.artistName ? 'border-red-500' : ''}`} />
//                 {errors.artistName && <p className="mt-1 text-sm text-red-600">{errors.artistName}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Clan/Tribe Affiliation</label>
//                 <input type="text" name="clanAffiliation" value={formData.clanAffiliation} onChange={handleInputChange} placeholder="Clan/Tribe Affiliation" className="w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068]" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Cultural Story *</label>
//                 <textarea name="culturalStory" value={formData.culturalStory} onChange={handleInputChange} rows={6} placeholder="Share the story behind your art..." className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.culturalStory ? 'border-red-500' : ''}`} />
//                 {errors.culturalStory && <p className="mt-1 text-sm text-red-600">{errors.culturalStory}</p>}
//               </div>
//               {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
//             </div>
//           )}

//           {/* Step 5: Store Profile */}
//           {currentStep === 5 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🏬 Store Profile</h3>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Name *</label>
//                 <input type="text" name="storeName" value={formData.storeName} onChange={handleInputChange} placeholder="Store Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.storeName ? 'border-red-500' : ''}`} />
//                 {errors.storeName && <p className="mt-1 text-sm text-red-600">{errors.storeName}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Logo *</label>
//                 <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'storeLogo')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
//                 {formData.storeLogo && <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mt-2"><img src={URL.createObjectURL(formData.storeLogo)} alt="Logo preview" className="w-full h-full object-cover" /></div>}
//                 {errors.storeLogo && <p className="mt-1 text-sm text-red-600">{errors.storeLogo}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-[#6F433A] mb-2">Store Bio *</label>
//                 <textarea name="storeBio" value={formData.storeBio} onChange={handleInputChange} rows={6} placeholder="Tell customers about your art..." className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.storeBio ? 'border-red-500' : ''}`} />
//                 {errors.storeBio && <p className="mt-1 text-sm text-red-600">{errors.storeBio}</p>}
//               </div>
//               {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
//             </div>
//           )}

//           {/* Step 6: KYC & Bank Details */}
//           {currentStep === 6 && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🆔 Identity & Bank Details</h3>
//               <div>
//                 <h4 className="text-sm font-semibold text-[#6F433A] mb-4">KYC Information</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-[#6F433A] mb-2">First Name *</label>
//                     <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.firstName ? 'border-red-500' : ''}`} />
//                     {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-[#6F433A] mb-2">Last Name *</label>
//                     <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.lastName ? 'border-red-500' : ''}`} />
//                     {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <label className="block text-sm font-semibold text-[#6F433A] mb-2">Date of Birth *</label>
//                   <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.dob ? 'border-red-500' : ''}`} />
//                   {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
//                 </div>
//                 <div className="mt-4">
//                   <label className="block text-sm font-semibold text-[#6F433A] mb-2">Upload ID Document *</label>
//                   <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'idDocument')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
//                   {errors.idDocument && <p className="mt-1 text-sm text-red-600">{errors.idDocument}</p>}
//                 </div>
//               </div>

//               <hr className="my-6" />

//               <div>
//                 <h4 className="text-sm font-semibold text-[#6F433A] mb-4">Bank Details</h4>
//                 <div>
//                   <label className="block text-sm font-semibold text-[#6F433A] mb-2">Bank Name *</label>
//                   <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="Bank Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.bankName ? 'border-red-500' : ''}`} />
//                   {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>}
//                 </div>
//                 <div className="mt-4">
//                   <label className="block text-sm font-semibold text-[#6F433A] mb-2">Account Name *</label>
//                   <input type="text" name="accountName" value={formData.accountName} onChange={handleInputChange} placeholder="Account Name" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.accountName ? 'border-red-500' : ''}`} />
//                   {errors.accountName && <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>}
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-[#6F433A] mb-2">BSB *</label>
//                     <input type="text" name="bsb" value={formData.bsb} onChange={handleInputChange} placeholder="BSB" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.bsb ? 'border-red-500' : ''}`} />
//                     {errors.bsb && <p className="mt-1 text-sm text-red-600">{errors.bsb}</p>}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-[#6F433A] mb-2">Account Number *</label>
//                     <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="Account Number" className={`w-full px-4 py-2 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${errors.accountNumber ? 'border-red-500' : ''}`} />
//                     {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
//                   </div>
//                 </div>
//               </div>

//               {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-800">{errors.submit}</p></div>}
//             </div>
//           )}

//           {/* Navigation Buttons */}
//           <div className="flex justify-between mt-8 pt-6 border-t border-[#E6CFAF]">
//             <button onClick={handlePrevious} disabled={currentStep === 1} className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm border border-[#E6CFAF] ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#EFE7DA] text-[#440C03] hover:bg-[#E6CFAF]'}`}>Previous</button>

//             <button onClick={handleNext} disabled={loading} className={`px-8 py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold shadow hover:from-[#6F433A] hover:to-[#A48068] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
//               {currentStep === totalSteps ? (loading ? 'Submitting...' : 'Submit Application') : (loading ? 'Processing...' : 'Next Step')}
//             </button>
//           </div>
//         </div>

//         {/* Step Indicators */}
//         <div className="mt-8 flex justify-center space-x-2">
//           {Array.from({ length: totalSteps }).map((_, index) => (
//             <button
//               key={index}
//               onClick={() => handleStepJump(index + 1)}
//               title={`Click to jump to Step ${index + 1}`}
//               className={`w-2 h-2 rounded-full transition-colors cursor-pointer hover:scale-150 ${
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

const baseURL = 'https://alpa-be-1.onrender.com';

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = 'onboarding' | 'login' | 'resume' | 'forgot-password' | 'reset-password';

interface FormData {
  email: string; phone: string; contactPerson: string;
  sellerId: string; otp: string; password: string;
  businessName: string; abn: string; businessType: string;
  businessPhone: string; businessEmail: string;
  street: string; city: string; state: string; postcode: string; country: string;
  artistName: string; clanAffiliation: string; culturalStory: string;
  storeName: string; storeLogo: File | null; storeBio: string;
  firstName: string; lastName: string; dob: string; idDocument: File | null;
  bankName: string; accountName: string; bsb: string; accountNumber: string;
  loginEmail: string; loginPassword: string;
  resetOtp: string; newPassword: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────
/** Map backend onboardingStep (1-8) to frontend step (1-6) */
const backendStepToFrontend = (backendStep: number): number => {
  if (backendStep <= 2) return 2; // already verified, show business details next
  if (backendStep === 3) return 4; // business done, go cultural
  if (backendStep === 4) return 5; // cultural done, go store
  if (backendStep === 5) return 6; // store done, go KYC+bank
  return 6;
};

export default function ArtistOnboardingForm() {
  const [mode, setMode] = useState<Mode>('onboarding');
  const [currentStep, setCurrentStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [abnVerified, setAbnVerified] = useState(false);
  const [resumeInfo, setResumeInfo] = useState<{ step?: number; stepName?: string } | null>(null);
  const totalSteps = 6;

  const [formData, setFormData] = useState<FormData>({
    email: '', phone: '', contactPerson: '',
    sellerId: '', otp: '', password: '',
    businessName: '', abn: '', businessType: '',
    businessPhone: '', businessEmail: '',
    street: '', city: '', state: '', postcode: '', country: '',
    artistName: '', clanAffiliation: '', culturalStory: '',
    storeName: '', storeLogo: null, storeBio: '',
    firstName: '', lastName: '', dob: '', idDocument: null,
    bankName: '', accountName: '', bsb: '', accountNumber: '',
    loginEmail: '', loginPassword: '',
    resetOtp: '', newPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // ─── Persist to localStorage ──────────────────────────────────────────────
  useEffect(() => {
    const savedStep = localStorage.getItem('sellerOnboardingStep');
    const savedFormData = localStorage.getItem('sellerOnboardingFormData');
    const savedToken = localStorage.getItem('sellerToken');
    const savedAbnVerified = localStorage.getItem('sellerAbnVerified');

    if (savedToken) setToken(savedToken);
    if (savedStep) setCurrentStep(parseInt(savedStep, 10));
    if (savedAbnVerified) setAbnVerified(JSON.parse(savedAbnVerified));
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        // File objects can't be serialized — restore everything except files
        setFormData(prev => ({ ...prev, ...parsed, storeLogo: null, idDocument: null }));
      } catch {}
    }
  }, []);

  useEffect(() => { localStorage.setItem('sellerOnboardingStep', currentStep.toString()); }, [currentStep]);
  useEffect(() => {
    const { storeLogo, idDocument, ...rest } = formData;
    localStorage.setItem('sellerOnboardingFormData', JSON.stringify(rest));
  }, [formData]);
  useEffect(() => { if (token) localStorage.setItem('sellerToken', token); }, [token]);
  useEffect(() => { localStorage.setItem('sellerAbnVerified', JSON.stringify(abnVerified)); }, [abnVerified]);

  // ─── Inputs ───────────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [fieldName]: file }));
    if (errors[fieldName]) setErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  const setError = (key: string, msg: string) => setErrors(prev => ({ ...prev, [key]: msg }));

  // ─── RESUME ONBOARDING ────────────────────────────────────────────────────
  const handleCheckResume = async () => {
    if (!formData.loginEmail?.trim()) { setError('loginEmail', 'Email is required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.loginEmail }),
      });
      const data = await res.json();
      if (data.action === 'verify_otp') {
        // Still in step 1 — send them to start over
        setFormData(prev => ({ ...prev, email: formData.loginEmail }));
        setMode('onboarding');
        setCurrentStep(1);
      } else if (data.action === 'login_required') {
        setResumeInfo({ step: data.currentStep, stepName: data.stepName });
        setMode('login');
      } else if (!res.ok) {
        setError('loginEmail', data.message || 'No account found');
      }
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!formData.loginEmail?.trim()) { setError('loginEmail', 'Email is required'); return; }
    if (!formData.loginPassword?.trim()) { setError('loginPassword', 'Password is required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.loginEmail, password: formData.loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError('submit', data.message || 'Login failed'); return; }

      setToken(data.token);
      localStorage.setItem('sellerToken', data.token);

      // Navigate to the correct step based on backend onboarding status
      const backendStep = data.onboardingStatus?.currentStep ?? 3;
      const frontendStep = backendStepToFrontend(backendStep);
      setCurrentStep(frontendStep);
      setMode('onboarding');
      setErrors({});
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!formData.loginEmail?.trim()) { setError('loginEmail', 'Email is required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.loginEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError('submit', data.message || 'Failed to send OTP'); return; }
      setSuccessMessage('OTP sent to your email');
      setMode('reset-password');
      setErrors({});
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!formData.resetOtp?.trim()) { setError('resetOtp', 'OTP is required'); return; }
    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError('newPassword', 'Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.loginEmail, otp: formData.resetOtp, newPassword: formData.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError('submit', data.message || 'Reset failed'); return; }

      setToken(data.token);
      localStorage.setItem('sellerToken', data.token);
      const backendStep = data.onboardingStatus?.currentStep ?? 3;
      setCurrentStep(backendStepToFrontend(backendStep));
      setMode('onboarding');
      setErrors({});
      setSuccessMessage('');
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  // ─── STEP 1 ───────────────────────────────────────────────────────────────
  const handleApplyStep1 = async () => {
    if (!formData.contactPerson?.trim()) { setError('contactPerson', 'Contact person name is required'); return; }
    if (!formData.email?.trim()) { setError('email', 'Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('email', 'Invalid email format'); return; }
    if (!formData.phone?.trim()) { setError('phone', 'Phone is required'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactPerson: formData.contactPerson, email: formData.email, phone: formData.phone }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('submit', d.message || 'Failed to apply'); return; }
      const data = await res.json();
      if (data.sellerId) setFormData(prev => ({ ...prev, sellerId: data.sellerId }));
      setErrors({});
      setCurrentStep(2);
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  // ─── STEP 2 ───────────────────────────────────────────────────────────────
  const handleStep2Submit = async () => {
    if (!formData.otp?.trim()) { setError('otp', 'OTP is required'); return; }
    if (!formData.password?.trim()) { setError('password', 'Password is required'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: formData.sellerId, otp: formData.otp, password: formData.password }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('submit', d.message || 'Failed to verify OTP'); return; }
      const data = await res.json();
      if (data.token) { setToken(data.token); localStorage.setItem('sellerToken', data.token); }
      setErrors({});
      setCurrentStep(3);
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (!formData.sellerId) { setError('submit', 'Seller ID is missing'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: formData.sellerId }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('submit', d.message || 'Failed to resend OTP'); return; }
      setErrors({});
      setSuccessMessage('OTP resent to your email');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  // ─── STEP 3 ───────────────────────────────────────────────────────────────
  const handleStep3Submit = async () => {
    if (!formData.businessName?.trim()) { setError('businessName', 'Business name is required'); return; }
    if (!formData.abn?.trim()) { setError('abn', 'ABN is required'); return; }
    if (!abnVerified) { setError('abn', 'Please verify ABN first'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/business-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessName: formData.businessName, abn: formData.abn, businessType: formData.businessType,
          businessAddress: { street: formData.street, city: formData.city, state: formData.state, postcode: formData.postcode, country: formData.country },
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('submit', d.message || 'Failed to save business details'); return; }
      setErrors({});
      setCurrentStep(4);
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  const handleValidateABN = async () => {
    if (!formData.abn?.trim()) { setError('abn', 'ABN is required'); return; }
    const abnDigits = formData.abn.replace(/\s/g, '');
    if (abnDigits.length !== 11 || !/^\d+$/.test(abnDigits)) { setError('abn', 'ABN must be 11 digits'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/validate-abn?abn=${encodeURIComponent(formData.abn)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('abn', d.message || 'Invalid ABN'); return; }
      const data = await res.json();
      if (data.success && data.abnValidation?.isValid) {
        setAbnVerified(true);
        setErrors(prev => ({ ...prev, abn: '' }));
        const abnData = data.abnValidation.data;
        if (abnData) {
          const updates: Partial<FormData> = {};
          if (abnData.businessName) updates.businessName = abnData.businessName;
          else if (abnData.entityName) updates.businessName = abnData.entityName;
          if (abnData.entityType) updates.businessType = abnData.entityType;
          if (Object.keys(updates).length) setFormData(prev => ({ ...prev, ...updates }));
        }
      } else {
        setError('abn', data.abnValidation?.message || 'ABN validation failed');
        setAbnVerified(false);
      }
    } catch { setError('abn', 'ABN validation failed – check your connection'); setAbnVerified(false); }
    finally { setLoading(false); }
  };

  // ─── STEP 4 ───────────────────────────────────────────────────────────────
  const handleStep4Submit = async () => {
    if (!formData.artistName?.trim()) { setError('artistName', 'Artist name is required'); return; }
    if (!formData.culturalStory?.trim()) { setError('culturalStory', 'Cultural story is required'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/cultural-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ artistName: formData.artistName, clanAffiliation: formData.clanAffiliation, culturalStory: formData.culturalStory }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('submit', d.message || 'Failed to save cultural info'); return; }
      setErrors({});
      setCurrentStep(5);
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  // ─── STEP 5 ───────────────────────────────────────────────────────────────
  const handleStep5Submit = async () => {
    if (!formData.storeName?.trim()) { setError('storeName', 'Store name is required'); return; }
    if (!formData.storeLogo) { setError('storeLogo', 'Store logo is required'); return; }
    if (!formData.storeBio?.trim() || formData.storeBio.length < 50) { setError('storeBio', 'Bio must be at least 50 characters'); return; }

    setLoading(true);
    const fd = new FormData();
    fd.append('storeName', formData.storeName);
    fd.append('storeBio', formData.storeBio);
    if (formData.storeLogo) fd.append('storeLogo', formData.storeLogo);

    try {
      const res = await fetch(`${baseURL}/api/sellers/store-profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('submit', d.message || 'Failed to save store profile'); return; }
      setErrors({});
      setCurrentStep(6);
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  // ─── STEP 6 ───────────────────────────────────────────────────────────────
  const handleStep6Submit = async () => {
    const required: [keyof FormData, string][] = [
      ['firstName', 'First name'], ['lastName', 'Last name'], ['dob', 'Date of birth'],
      ['bankName', 'Bank name'], ['accountName', 'Account name'], ['bsb', 'BSB'], ['accountNumber', 'Account number'],
    ];
    for (const [key, label] of required) {
      if (!formData[key]?.toString().trim()) { setError(key, `${label} is required`); return; }
    }
    if (!formData.idDocument) { setError('idDocument', 'ID document is required'); return; }

    setLoading(true);
    try {
      // KYC
      const kycFD = new FormData();
      kycFD.append('firstName', formData.firstName);
      kycFD.append('lastName', formData.lastName);
      kycFD.append('dob', formData.dob);
      if (formData.idDocument) kycFD.append('idDocument', formData.idDocument);

      const kycRes = await fetch(`${baseURL}/api/sellers/kyc-upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: kycFD,
      });
      if (!kycRes.ok) { const d = await kycRes.json().catch(() => ({})); setError('submit', d.message || 'KYC upload failed'); return; }

      // Bank
      const bankRes = await fetch(`${baseURL}/api/sellers/bank-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bankName: formData.bankName, accountName: formData.accountName, bsb: formData.bsb, accountNumber: formData.accountNumber }),
      });
      if (!bankRes.ok) { const d = await bankRes.json().catch(() => ({})); setError('submit', d.message || 'Bank details failed'); return; }

      // Submit for review
      const submitRes = await fetch(`${baseURL}/api/sellers/submit-for-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (!submitRes.ok) { const d = await submitRes.json().catch(() => ({})); setError('submit', d.message || 'Submission failed'); return; }

      // Clear local storage on success
      ['sellerOnboardingStep', 'sellerOnboardingFormData', 'sellerToken', 'sellerAbnVerified'].forEach(k => localStorage.removeItem(k));
      alert('Application submitted successfully! We will review and get back to you.');
      window.location.href = '/';
    } catch { setError('submit', 'An error occurred.'); }
    finally { setLoading(false); }
  };

  const handleNext = () => {
    setErrors({});
    const handlers: Record<number, () => void> = {
      1: handleApplyStep1, 2: handleStep2Submit, 3: handleStep3Submit,
      4: handleStep4Submit, 5: handleStep5Submit, 6: handleStep6Submit,
    };
    handlers[currentStep]?.();
  };

  const handlePrevious = () => { setErrors({}); setCurrentStep(prev => Math.max(prev - 1, 1)); };

  // ─── Shared input classes ─────────────────────────────────────────────────
  const inputCls = (field?: string) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] transition-all ${field && errors[field] ? 'border-red-400 bg-red-50' : 'border-[#E6CFAF]'}`;

  const labelCls = 'block text-sm font-semibold text-[#6F433A] mb-1.5';

  // ─── AUTH SCREEN (Login / Resume / Forgot / Reset) ────────────────────────
  if (mode !== 'onboarding') {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#FFF8F3] to-[#F3E7DF] flex items-center justify-center px-4 py-16">
        <Link href="/" className="absolute top-8 left-8">
          <Image src="/images/navbarLogo.png" alt="Logo" width={90} height={90} />
        </Link>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#E6CFAF]">

            {/* RESUME MODE */}
            {mode === 'resume' && (
              <>
                <h2 className="text-2xl font-extrabold text-[#440C03] mb-1">Resume Onboarding</h2>
                <p className="text-sm text-[#A48068] mb-6">Enter your email to check your progress</p>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange}
                      placeholder="your@email.com" className={inputCls('loginEmail')} />
                    {errors.loginEmail && <p className="mt-1 text-xs text-red-600">{errors.loginEmail}</p>}
                  </div>
                  {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}

                  <button onClick={handleCheckResume} disabled={loading}
                    className="w-full py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                    {loading ? 'Checking…' : 'Check Progress'}
                  </button>
                </div>

                <div className="mt-6 text-center space-y-2">
                  <button onClick={() => { setMode('onboarding'); setErrors({}); }} className="text-sm text-[#6F433A] hover:underline">
                    ← Start a new application
                  </button>
                </div>
              </>
            )}

            {/* LOGIN MODE */}
            {mode === 'login' && (
              <>
                <h2 className="text-2xl font-extrabold text-[#440C03] mb-1">Welcome Back</h2>
                {resumeInfo && (
                  <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <p className="text-sm text-[#6F433A]">
                      📍 You left off at <strong>Step {resumeInfo.step}</strong>: {resumeInfo.stepName}
                    </p>
                  </div>
                )}
                <p className="text-sm text-[#A48068] mb-6">Log in to continue your application</p>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange}
                      placeholder="your@email.com" className={inputCls('loginEmail')} />
                    {errors.loginEmail && <p className="mt-1 text-xs text-red-600">{errors.loginEmail}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Password *</label>
                    <input type="password" name="loginPassword" value={formData.loginPassword} onChange={handleInputChange}
                      placeholder="Your password" className={inputCls('loginPassword')} />
                    {errors.loginPassword && <p className="mt-1 text-xs text-red-600">{errors.loginPassword}</p>}
                  </div>
                  {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}

                  <button onClick={handleLogin} disabled={loading}
                    className="w-full py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                    {loading ? 'Logging in…' : 'Continue Application'}
                  </button>
                </div>

                <div className="mt-6 flex flex-col items-center gap-2 text-sm">
                  <button onClick={() => { setMode('forgot-password'); setErrors({}); }} className="text-[#6F433A] hover:underline">
                    Forgot password?
                  </button>
                  <button onClick={() => { setMode('onboarding'); setCurrentStep(1); setErrors({}); }} className="text-[#A48068] hover:underline">
                    ← Start a new application
                  </button>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD */}
            {mode === 'forgot-password' && (
              <>
                <h2 className="text-2xl font-extrabold text-[#440C03] mb-1">Reset Password</h2>
                <p className="text-sm text-[#A48068] mb-6">We'll send a one-time code to your email</p>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange}
                      placeholder="your@email.com" className={inputCls('loginEmail')} />
                    {errors.loginEmail && <p className="mt-1 text-xs text-red-600">{errors.loginEmail}</p>}
                  </div>
                  {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
                  {successMessage && <div className="bg-green-50 border border-green-200 rounded-xl p-3"><p className="text-sm text-green-800">{successMessage}</p></div>}

                  <button onClick={handleForgotPassword} disabled={loading}
                    className="w-full py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                    {loading ? 'Sending OTP…' : 'Send Reset OTP'}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button onClick={() => { setMode('login'); setErrors({}); }} className="text-sm text-[#6F433A] hover:underline">
                    ← Back to login
                  </button>
                </div>
              </>
            )}

            {/* RESET PASSWORD */}
            {mode === 'reset-password' && (
              <>
                <h2 className="text-2xl font-extrabold text-[#440C03] mb-1">Set New Password</h2>
                <p className="text-sm text-[#A48068] mb-6">Enter the OTP sent to <strong>{formData.loginEmail}</strong></p>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>OTP Code *</label>
                    <input type="text" name="resetOtp" value={formData.resetOtp} onChange={handleInputChange}
                      placeholder="Enter OTP" className={inputCls('resetOtp')} />
                    {errors.resetOtp && <p className="mt-1 text-xs text-red-600">{errors.resetOtp}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>New Password *</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange}
                      placeholder="Min. 6 characters" className={inputCls('newPassword')} />
                    {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>}
                  </div>
                  {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
                  {successMessage && <div className="bg-green-50 border border-green-200 rounded-xl p-3"><p className="text-sm text-green-800">{successMessage}</p></div>}

                  <button onClick={handleResetPassword} disabled={loading}
                    className="w-full py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                    {loading ? 'Resetting…' : 'Reset & Continue'}
                  </button>

                  <button onClick={handleForgotPassword} disabled={loading}
                    className="w-full py-2 text-sm text-[#6F433A] hover:underline">
                    Resend OTP
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button onClick={() => { setMode('login'); setErrors({}); }} className="text-sm text-[#A48068] hover:underline">
                    ← Back to login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN ONBOARDING FORM ─────────────────────────────────────────────────
  return (
    <div>
      <Link href="/" className="absolute top-8 left-8">
        <Image src="/images/navbarLogo.png" alt="Logo" width={90} height={90} />
      </Link>

      <div className="min-h-screen bg-linear-to-br from-[#FFF8F3] to-[#F3E7DF] py-12 px-4">
        <div className="flex flex-col justify-center items-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#440C03] mb-2 tracking-tight">
            Start your journey as a Seller
          </h2>
          <p className="text-[#6F433A] mb-1">Complete all steps to start selling your artwork</p>

          {/* Resume / Login CTA */}
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => { setErrors({}); setMode('resume'); }}
              className="text-sm text-[#6F433A] border border-[#E6CFAF] rounded-lg px-4 py-1.5 hover:bg-[#F3E7DF] transition-all"
            >
              🔄 Resume application
            </button>
            <button
              onClick={() => { setErrors({}); setMode('login'); }}
              className="text-sm text-[#440C03] border border-[#A48068] rounded-lg px-4 py-1.5 hover:bg-[#F3E7DF] transition-all font-semibold"
            >
              🔑 Log in
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#6F433A]">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-[#A48068]">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full h-2 bg-[#E6CFAF] rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#440C03] to-[#A48068] transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#E6CFAF]">

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#6F433A] mb-4">📧 Account Verification</h3>
                <div>
                  <label className={labelCls}>Contact Person Name *</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange}
                    placeholder="Full Name" className={inputCls('contactPerson')} />
                  {errors.contactPerson && <p className="mt-1 text-xs text-red-600">{errors.contactPerson}</p>}
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    placeholder="your@email.com" className={inputCls('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                    placeholder="+61 4XX XXX XXX" className={inputCls('phone')} />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🔑 Seller Verification</h3>
                <div>
                  <label className={labelCls}>Seller ID</label>
                  <input type="text" value={formData.sellerId} readOnly
                    className="w-full px-4 py-2.5 border border-[#E6CFAF] rounded-xl bg-[#F3E7DF] text-[#440C03] opacity-70 cursor-not-allowed" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelCls}>OTP *</label>
                    <button type="button" onClick={handleResendOTP} disabled={loading}
                      className="text-sm font-semibold text-[#440C03] hover:text-[#6F433A] underline disabled:opacity-50">
                      {loading ? 'Sending…' : 'Resend OTP'}
                    </button>
                  </div>
                  <input type="text" name="otp" value={formData.otp} onChange={handleInputChange}
                    placeholder="Enter OTP received" className={inputCls('otp')} />
                  {errors.otp && <p className="mt-1 text-xs text-red-600">{errors.otp}</p>}
                </div>
                <div>
                  <label className={labelCls}>Password *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                    placeholder="Set your password (min. 6 characters)" className={inputCls('password')} />
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>
                {successMessage && <div className="bg-green-50 border border-green-200 rounded-xl p-3"><p className="text-sm text-green-800">{successMessage}</p></div>}
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🏢 Business Details</h3>
                <div>
                  <label className={labelCls}>Business Name *</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange}
                    placeholder="Business Name" className={inputCls('businessName')} />
                  {errors.businessName && <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>}
                </div>
                <div>
                  <label className={labelCls}>ABN *</label>
                  <div className="flex gap-2">
                    <input type="text" name="abn" value={formData.abn} onChange={(e) => { handleInputChange(e); setAbnVerified(false); }}
                      placeholder="11-digit ABN" className={`flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] transition-all ${errors.abn ? 'border-red-400' : 'border-[#E6CFAF]'}`} />
                    <button type="button" onClick={handleValidateABN} disabled={loading || abnVerified}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${abnVerified ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-linear-to-r from-[#440C03] to-[#A48068] text-white hover:opacity-90 disabled:opacity-60'}`}>
                      {abnVerified ? '✓ Verified' : loading ? 'Checking…' : 'Verify ABN'}
                    </button>
                  </div>
                  {errors.abn && <p className="mt-1 text-xs text-red-600">{errors.abn}</p>}
                </div>
                <div>
                  <label className={labelCls}>Business Type</label>
                  <input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange}
                    placeholder="e.g. Sole Trader, Company" className={inputCls()} />
                </div>
                <div>
                  <label className={labelCls}>Business Phone</label>
                  <input type="tel" name="businessPhone" value={formData.businessPhone} onChange={handleInputChange}
                    placeholder="Business Phone" className={inputCls()} />
                </div>
                <div>
                  <label className={labelCls}>Business Email</label>
                  <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleInputChange}
                    placeholder="business@email.com" className={inputCls()} />
                </div>
                <div>
                  <label className={labelCls}>Business Address</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[['street','Street'],['city','City'],['state','State'],['postcode','Postcode'],['country','Country']].map(([name, placeholder]) => (
                      <input key={name} type="text" name={name} value={(formData as any)[name]} onChange={handleInputChange}
                        placeholder={placeholder} className={`px-4 py-2.5 border border-[#E6CFAF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] ${name === 'street' ? 'col-span-full' : ''}`} />
                    ))}
                  </div>
                </div>
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🪃 Artist & Cultural Story</h3>
                <div>
                  <label className={labelCls}>Artist Name *</label>
                  <input type="text" name="artistName" value={formData.artistName} onChange={handleInputChange}
                    placeholder="Artist Name" className={inputCls('artistName')} />
                  {errors.artistName && <p className="mt-1 text-xs text-red-600">{errors.artistName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Clan / Tribe Affiliation</label>
                  <input type="text" name="clanAffiliation" value={formData.clanAffiliation} onChange={handleInputChange}
                    placeholder="Clan or Tribe" className={inputCls()} />
                </div>
                <div>
                  <label className={labelCls}>Cultural Story *</label>
                  <textarea name="culturalStory" value={formData.culturalStory} onChange={handleInputChange} rows={6}
                    placeholder="Share the story behind your art…" className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] resize-none transition-all ${errors.culturalStory ? 'border-red-400' : 'border-[#E6CFAF]'}`} />
                  {errors.culturalStory && <p className="mt-1 text-xs text-red-600">{errors.culturalStory}</p>}
                </div>
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 5 */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🏬 Store Profile</h3>
                <div>
                  <label className={labelCls}>Store Name *</label>
                  <input type="text" name="storeName" value={formData.storeName} onChange={handleInputChange}
                    placeholder="Store Name" className={inputCls('storeName')} />
                  {errors.storeName && <p className="mt-1 text-xs text-red-600">{errors.storeName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Store Logo *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'storeLogo')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                  {formData.storeLogo && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mt-2 border border-[#E6CFAF]">
                      <img src={URL.createObjectURL(formData.storeLogo)} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {errors.storeLogo && <p className="mt-1 text-xs text-red-600">{errors.storeLogo}</p>}
                </div>
                <div>
                  <label className={labelCls}>Store Bio * <span className="text-[#A48068] font-normal">(min. 50 characters)</span></label>
                  <textarea name="storeBio" value={formData.storeBio} onChange={handleInputChange} rows={6}
                    placeholder="Tell customers about your art…" className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A48068] bg-[#FFF8F3] text-[#440C03] placeholder-[#A48068] resize-none transition-all ${errors.storeBio ? 'border-red-400' : 'border-[#E6CFAF]'}`} />
                  <div className="flex justify-between mt-1">
                    {errors.storeBio && <p className="text-xs text-red-600">{errors.storeBio}</p>}
                    <p className="text-xs text-[#A48068] ml-auto">{formData.storeBio.length} chars</p>
                  </div>
                </div>
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 6 */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#6F433A] mb-4">🆔 Identity & Bank Details</h3>

                <div>
                  <h4 className="text-sm font-bold text-[#440C03] mb-3 pb-1 border-b border-[#E6CFAF]">KYC Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>First Name *</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        placeholder="First Name" className={inputCls('firstName')} />
                      {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Last Name *</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        placeholder="Last Name" className={inputCls('lastName')} />
                      {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>Date of Birth *</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inputCls('dob')} />
                    {errors.dob && <p className="mt-1 text-xs text-red-600">{errors.dob}</p>}
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>Upload ID Document * <span className="text-[#A48068] font-normal">(PDF, JPG, PNG)</span></label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'idDocument')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                    {errors.idDocument && <p className="mt-1 text-xs text-red-600">{errors.idDocument}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#440C03] mb-3 pb-1 border-b border-[#E6CFAF]">Bank Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Bank Name *</label>
                      <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange}
                        placeholder="e.g. Commonwealth Bank" className={inputCls('bankName')} />
                      {errors.bankName && <p className="mt-1 text-xs text-red-600">{errors.bankName}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Account Name *</label>
                      <input type="text" name="accountName" value={formData.accountName} onChange={handleInputChange}
                        placeholder="Name on account" className={inputCls('accountName')} />
                      {errors.accountName && <p className="mt-1 text-xs text-red-600">{errors.accountName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>BSB *</label>
                        <input type="text" name="bsb" value={formData.bsb} onChange={handleInputChange}
                          placeholder="XXX-XXX" className={inputCls('bsb')} />
                        {errors.bsb && <p className="mt-1 text-xs text-red-600">{errors.bsb}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Account Number *</label>
                        <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange}
                          placeholder="Account Number" className={inputCls('accountNumber')} />
                        {errors.accountNumber && <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#E6CFAF]">
              <button onClick={handlePrevious} disabled={currentStep === 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm border border-[#E6CFAF] ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#EFE7DA] text-[#440C03] hover:bg-[#E6CFAF]'}`}>
                Previous
              </button>
              <button onClick={handleNext} disabled={loading}
                className="px-8 py-3 bg-linear-to-r from-[#440C03] to-[#A48068] text-white rounded-xl font-semibold shadow hover:opacity-90 transition-all disabled:opacity-60">
                {currentStep === totalSteps ? (loading ? 'Submitting…' : 'Submit Application') : (loading ? 'Processing…' : 'Next Step')}
              </button>
            </div>
          </div>

          {/* Step Dots */}
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button key={index} onClick={() => setCurrentStep(index + 1)} title={`Step ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-150 ${index + 1 === currentStep ? 'bg-orange-500 w-8' : index + 1 < currentStep ? 'bg-green-500 w-2' : 'bg-gray-300 w-2'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}