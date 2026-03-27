'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const baseURL = 'https://alpa-be.onrender.com';

// ─── Country phone data ───────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'AU', flag: '🇦🇺', name: 'Australia',     dialCode: '+61',  digits: [9,  9]  },
  { code: 'US', flag: '🇺🇸', name: 'United States', dialCode: '+1',   digits: [10, 10] },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom',dialCode: '+44',  digits: [10, 10] },
  { code: 'IN', flag: '🇮🇳', name: 'India',         dialCode: '+91',  digits: [10, 10] },
  { code: 'CA', flag: '🇨🇦', name: 'Canada',        dialCode: '+1',   digits: [10, 10] },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand',   dialCode: '+64',  digits: [8,  9]  },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore',     dialCode: '+65',  digits: [8,  8]  },
  { code: 'AE', flag: '🇦🇪', name: 'UAE',           dialCode: '+971', digits: [9,  9]  },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia',  dialCode: '+966', digits: [9,  9]  },
  { code: 'DE', flag: '🇩🇪', name: 'Germany',       dialCode: '+49',  digits: [10, 11] },
  { code: 'FR', flag: '🇫🇷', name: 'France',        dialCode: '+33',  digits: [9,  9]  },
  { code: 'JP', flag: '🇯🇵', name: 'Japan',         dialCode: '+81',  digits: [10, 11] },
  { code: 'CN', flag: '🇨🇳', name: 'China',         dialCode: '+86',  digits: [11, 11] },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil',        dialCode: '+55',  digits: [10, 11] },
  { code: 'PK', flag: '🇵🇰', name: 'Pakistan',      dialCode: '+92',  digits: [10, 10] },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia',      dialCode: '+60',  digits: [9,  10] },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines',   dialCode: '+63',  digits: [10, 10] },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia',     dialCode: '+62',  digits: [9,  12] },
] as const;
type Country = typeof COUNTRIES[number];

function validatePhone(digits: string, country: Country): string | null {
  const clean = digits.replace(/\D/g, '');
  if (!clean) return null;
  const [min, max] = country.digits;
  if (clean.length < min) return `Too short — ${country.name} numbers need ${min} digits`;
  if (clean.length > max) return `Too long — ${country.name} numbers need ${max} digits`;
  return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = 'onboarding' | 'login' | 'resume' | 'forgot-password' | 'reset-password';

interface FormData {
  email: string; phone: string; contactPerson: string;
  sellerId: string; otp: string; password: string; confirmPassword: string;
  businessName: string; abn: string; businessType: string;
  businessPhone: string;
  street: string; city: string; state: string; postcode: string; country: string;
  artistName: string; description: string;
  storeName: string; storeLogo: File | null; storeBio: string;
  firstName: string; lastName: string; dob: string; idDocument: File | null; documentType: string;
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
  const totalSteps = 7;

  const [formData, setFormData] = useState<FormData>({
    email: '', phone: '', contactPerson: '',
    sellerId: '', otp: '', password: '', confirmPassword: '',
    businessName: '', abn: '', businessType: '',
    businessPhone: '',
    street: '', city: '', state: '', postcode: '', country: '',
    artistName: '', description: '',
    storeName: '', storeLogo: null, storeBio: '',
    firstName: '', lastName: '', dob: '', idDocument: null, documentType: 'passport',
    bankName: '', accountName: '', bsb: '', accountNumber: '',
    loginEmail: '', loginPassword: '',
    resetOtp: '', newPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [tcAccepted, setTcAccepted] = useState(false);

  // ─── Phone picker — Step 1 ────────────────────────────────────────────────
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneInputError, setPhoneInputError] = useState<string | null>(null);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

  // ─── Phone picker — Step 3 (business phone) ───────────────────────────────
  const [bizPhoneCountry, setBizPhoneCountry] = useState<Country>(COUNTRIES[0]);
  const [bizPhoneSearch, setBizPhoneSearch] = useState('');
  const [showBizPhoneDropdown, setShowBizPhoneDropdown] = useState(false);
  const [bizPhoneTouched, setBizPhoneTouched] = useState(false);
  const [bizPhoneInputError, setBizPhoneInputError] = useState<string | null>(null);
  const bizPhoneDropdownRef = useRef<HTMLDivElement>(null);

  // ─── Persist to localStorage ──────────────────────────────────────────────
  useEffect(() => {
    const savedStep = localStorage.getItem('sellerOnboardingStep');
    const savedFormData = localStorage.getItem('sellerOnboardingFormData');
    const savedToken = localStorage.getItem('sellerToken');

    if (savedToken) setToken(savedToken);
    if (savedStep) setCurrentStep(parseInt(savedStep, 10));
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

  // ─── Close phone dropdowns on outside click ───────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setShowPhoneDropdown(false); setPhoneSearch('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (bizPhoneDropdownRef.current && !bizPhoneDropdownRef.current.contains(e.target as Node)) {
        setShowBizPhoneDropdown(false); setBizPhoneSearch('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    const newErrors: Record<string, string> = {};
    
    if (!formData.loginEmail?.trim()) {
      newErrors.loginEmail = 'Email is required';
    }
    if (!formData.loginPassword?.trim()) {
      newErrors.loginPassword = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
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
    const newErrors: Record<string, string> = {};
    
    if (!formData.resetOtp?.trim()) {
      newErrors.resetOtp = 'OTP is required';
    }
    if (!formData.newPassword || formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
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

  // ─── STEP 1: just validate + move forward ────────────────────────────────
  const handleApplyStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone is required';
    } else {
      const phoneErr = validatePhone(formData.phone, phoneCountry);
      if (phoneErr) {
        newErrors.phone = phoneErr;
        setPhoneTouched(true);
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Store full number with dial code
    setFormData(prev => ({ ...prev, phone: `${phoneCountry.dialCode} ${prev.phone.replace(/\D/g, '')}` }));
    setErrors({});
    setCurrentStep(2);
  };

  // ─── STEP 2: validate password + move forward ────────────────────────────
  const handleStep2Submit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword?.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(3);
  };

  // ─── STEP 3: validate business details + move forward ────────────────────
  const handleStep3Submit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName?.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.abn?.trim()) {
      newErrors.abn = 'ABN is required';
    } else if (!abnVerified) {
      newErrors.abn = 'Please verify ABN first';
    }
    if (!formData.businessType?.trim()) {
      newErrors.businessType = 'Business type is required';
    }
    if (!formData.businessPhone?.trim()) {
      newErrors.businessPhone = 'Business phone is required';
    } else {
      const bizErr = validatePhone(formData.businessPhone, bizPhoneCountry);
      if (bizErr) {
        newErrors.businessPhone = bizErr;
        setBizPhoneTouched(true);
      }
    }
    if (!formData.street?.trim())    newErrors.street    = 'Street is required';
    if (!formData.city?.trim())      newErrors.city      = 'City is required';
    if (!formData.state?.trim())     newErrors.state     = 'State is required';
    if (!formData.postcode?.trim())  newErrors.postcode  = 'Postcode is required';
    if (!formData.country?.trim())   newErrors.country   = 'Country is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setFormData(prev => ({ ...prev, businessPhone: `${bizPhoneCountry.dialCode} ${prev.businessPhone.replace(/\D/g, '')}` }));
    setErrors({});
    setCurrentStep(4);
  };

  const handleValidateABN = async () => {
    if (!formData.abn?.trim()) { setError('abn', 'ABN is required'); return; }
    const abnDigits = formData.abn.replace(/\s/g, '');
    if (abnDigits.length !== 11 || !/^\d+$/.test(abnDigits)) { setError('abn', 'ABN must be 11 digits'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/validate-abn-public?abn=${encodeURIComponent(formData.abn)}`, {
        method: 'GET',
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('abn', d.message || 'Invalid ABN'); return; }
      const data = await res.json();
      if (data.success && data.abnValidation?.isValid) {
        setAbnVerified(true);
        setErrors(prev => ({ ...prev, abn: '' }));
        const abnData = data.abnValidation.data;
        if (abnData) {
          const updates: Partial<FormData> = {};

          // Business name
          if (abnData.businessName) updates.businessName = abnData.businessName;
          else if (abnData.entityName) updates.businessName = abnData.entityName;

          // Business type
          if (abnData.entityType) updates.businessType = abnData.entityType;

          // Address — ABR may nest address or return flat fields
          const addr = abnData.address || abnData.businessAddress || abnData;
          if (addr.postcode || addr.postalCode || addr.addressPostcode)
            updates.postcode = addr.postcode || addr.postalCode || addr.addressPostcode;
          if (addr.state || addr.stateCode || addr.addressState)
            updates.state = addr.state || addr.stateCode || addr.addressState;
          if (addr.suburb || addr.city || addr.locality || addr.addressSuburb)
            updates.city = addr.suburb || addr.city || addr.locality || addr.addressSuburb;
          if (addr.street || addr.streetAddress || addr.addressLine1)
            updates.street = addr.street || addr.streetAddress || addr.addressLine1;
          if (addr.country || addr.countryCode)
            updates.country = addr.country || addr.countryCode;

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
  const handleStep4Submit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.artistName?.trim()) {
      newErrors.artistName = 'Artist name is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(5);
  };

  // ─── STEP 5 ───────────────────────────────────────────────────────────────
  const handleStep5Submit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.storeName?.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    if (!formData.storeLogo) {
      newErrors.storeLogo = 'Store logo is required';
    }
    if (!formData.storeBio?.trim()) {
      newErrors.storeBio = 'Store bio is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(6);
  };

  // ─── STEP 6 — unified submit ─────────────────────────────────────────────
  const handleStep6Submit = async () => {
    const newErrors: Record<string, string> = {};
    
    const required: [keyof FormData, string][] = [
      ['firstName', 'First name'], ['lastName', 'Last name'], ['dob', 'Date of birth'],
      ['bankName', 'Bank name'], ['accountName', 'Account name'], ['bsb', 'BSB'], ['accountNumber', 'Account number'],
    ];
    for (const [key, label] of required) {
      if (!formData[key]?.toString().trim()) {
        newErrors[key] = `${label} is required`;
      }
    }
    if (!formData.idDocument) {
      newErrors.idDocument = 'ID document is required';
    }
    if (!tcAccepted) {
      newErrors.tc = 'You must accept the Terms & Conditions to proceed';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('contactPerson', formData.contactPerson);
      fd.append('password', formData.password);
      fd.append('businessName', formData.businessName);
      fd.append('abn', formData.abn);
      fd.append('businessAddress', JSON.stringify({
        street: formData.street, city: formData.city,
        state: formData.state, postcode: formData.postcode, country: formData.country,
      }));
      fd.append('businessType', formData.businessType);
      fd.append('artistName', formData.artistName);
      fd.append('description', formData.description);
      fd.append('storeName', formData.storeName);
      fd.append('storeDescription', formData.storeBio);
      if (formData.storeLogo) fd.append('storeLogo', formData.storeLogo);
      fd.append('firstName', formData.firstName);
      fd.append('lastName', formData.lastName);
      fd.append('dateOfBirth', formData.dob);
      fd.append('documentType', formData.documentType);
      if (formData.idDocument) fd.append('idDocument', formData.idDocument);
      fd.append('bankName', formData.bankName);
      fd.append('accountName', formData.accountName);
      fd.append('bsb', formData.bsb);
      fd.append('accountNumber', formData.accountNumber);

      const res = await fetch(`${baseURL}/api/sellers/submit-onboarding`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('submit', d.message || 'Submission failed'); return; }
      setErrors({});
      setCurrentStep(7);
    } catch { setError('submit', 'An error occurred. Please try again.'); }
    finally { setLoading(false); }
  };

  // ─── STEP 7 — OTP verify ──────────────────────────────────────────────────
  const handleStep7Submit = async () => {
    if (!formData.otp?.trim()) { setError('otp', 'OTP is required'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/verify-and-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError('otp', d.message || 'Invalid or expired OTP'); return; }
      ['sellerOnboardingStep', 'sellerOnboardingFormData', 'sellerToken'].forEach(k => localStorage.removeItem(k));
      window.location.href = '/';
    } catch { setError('submit', 'An error occurred. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleNext = () => {
    setErrors({});
    const handlers: Record<number, () => void> = {
      1: handleApplyStep1, 2: handleStep2Submit, 3: handleStep3Submit,
      4: handleStep4Submit, 5: handleStep5Submit, 6: handleStep6Submit,
      7: handleStep7Submit,
    };
    handlers[currentStep]?.();
  };

  const handlePrevious = () => { setErrors({}); setCurrentStep(prev => Math.max(prev - 1, 1)); };

  // ─── Shared input classes ─────────────────────────────────────────────────
  const inputCls = (field?: string) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 transition-all ${field && errors[field] ? 'border-red-400 bg-red-50' : 'border-[#5A1E12]/20'}`;

  const labelCls = 'block text-sm font-semibold text-[#5A1E12] mb-1.5';

  // ─── AUTH SCREEN (Login / Resume / Forgot / Reset) ────────────────────────
  if (mode !== 'onboarding') {
    return (
      <div className="min-h-screen bg-[#EAD7B7] flex items-center justify-center px-4 py-16">
        <Link href="/" className="absolute top-8 left-8">
          <Image src="/images/navbarLogo.png" alt="Logo" width={90} height={90} />
        </Link>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#5A1E12]/15">

            {/* RESUME MODE */}
            {mode === 'resume' && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">Resume Onboarding</h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">Enter your email to check your progress</p>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange}
                      placeholder="your@email.com" className={inputCls('loginEmail')} />
                    {errors.loginEmail && <p className="mt-1 text-xs text-red-600">{errors.loginEmail}</p>}
                  </div>
                  {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}

                  <button onClick={handleCheckResume} disabled={loading}
                    className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60">
                    {loading ? 'Checking…' : 'Check Progress'}
                  </button>
                </div>

                <div className="mt-6 text-center space-y-2">
                  <button onClick={() => { setMode('onboarding'); setErrors({}); }} className="text-sm text-[#5A1E12] hover:underline cursor-pointer">
                    ← Start a new application
                  </button>
                </div>
              </>
            )}

            {/* LOGIN MODE */}
            {mode === 'login' && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">Welcome Back</h2>
                {resumeInfo && (
                  <div className="mb-4 bg-[#5A1E12]/5 border border-[#5A1E12]/20 rounded-xl p-3">
                    <p className="text-sm text-[#5A1E12]">
                      📍 You left off at <strong>Step {resumeInfo.step}</strong>: {resumeInfo.stepName}
                    </p>
                  </div>
                )}
                <p className="text-sm text-[#5A1E12]/60 mb-6">Log in to continue your application</p>

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
                    className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60">
                    {loading ? 'Logging in…' : 'Continue Application'}
                  </button>
                </div>

                <div className="mt-6 flex flex-col items-center gap-2 text-sm">
                  <button onClick={() => { setMode('forgot-password'); setErrors({}); }} className="text-[#5A1E12] hover:underline font-medium">
                    Forgot password?
                  </button>
                  <button onClick={() => { setMode('onboarding'); setCurrentStep(1); setErrors({}); }} className="text-[#5A1E12]/60 hover:underline">
                    ← Start a new application
                  </button>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD */}
            {mode === 'forgot-password' && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">Reset Password</h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">We'll send a one-time code to your email</p>

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
                    className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60">
                    {loading ? 'Sending OTP…' : 'Send Reset OTP'}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button onClick={() => { setMode('login'); setErrors({}); }} className="text-sm text-[#5A1E12] hover:underline">
                    ← Back to login
                  </button>
                </div>
              </>
            )}

            {/* RESET PASSWORD */}
            {mode === 'reset-password' && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">Set New Password</h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">Enter the OTP sent to <strong>{formData.loginEmail}</strong></p>

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
                    className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60">
                    {loading ? 'Resetting…' : 'Reset & Continue'}
                  </button>

                  <button onClick={handleForgotPassword} disabled={loading}
                    className="w-full py-2 text-sm text-[#5A1E12] hover:underline">
                    Resend OTP
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button onClick={() => { setMode('login'); setErrors({}); }} className="text-sm text-[#5A1E12]/70 hover:underline">
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

  // ─── MAIN ONBOARDING FORM ─────────────────────────────────────────────────
  return (
    <div>
      <Link href="/" className="absolute top-8 left-8">
        <Image src="/images/navbarLogo.png" alt="Logo" width={90} height={90} />
      </Link>

      <div className="min-h-screen bg-[#EAD7B7] py-12 px-4">
        <div className="flex flex-col justify-center items-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#5A1E12] mb-2 tracking-tight">
            Start your journey as a Seller
          </h2>
          <p className="text-[#5A1E12]/70 mb-1">Complete all steps to start selling your artwork</p>

          {/* Resume / Login CTA */}
          {/* <div className="mt-3 flex gap-3">
            <button
              onClick={() => { setErrors({}); setMode('resume'); }}
              className="text-sm text-[#5A1E12] border border-[#5A1E12]/30 rounded-lg px-4 py-1.5 hover:bg-[#5A1E12]/10 transition-all"
            >
              🔄 Resume application
            </button>
            <button
              onClick={() => { setErrors({}); setMode('login'); }}
              className="text-sm text-white bg-[#5A1E12] border border-[#5A1E12] rounded-lg px-4 py-1.5 hover:bg-[#4a180f] transition-all font-semibold"
            >
              🔑 Log in
            </button>
          </div> */}
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#5A1E12]">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-[#5A1E12]/60">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full h-2 bg-[#5A1E12]/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5A1E12] transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#5A1E12]/15">

            {/* Accuracy Notice */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-6">
              <span className="text-amber-500 text-lg mt-0.5">ⓘ</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-semibold">Please ensure all details are accurate.</span>{' '}
                The information you provide including your business name, store profile, and contact details may be
                visible to buyers and other users on the platform. Incorrect or misleading information may result in
                delays to your application or account suspension.
              </p>
            </div>

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Account Verification</h3>
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
                  <div ref={phoneDropdownRef} className="relative">
                    <div className={`flex bg-white items-center border rounded-xl overflow-visible transition-all ${
                      errors.phone ? 'border-red-400 ring-2 ring-red-200'
                      : phoneTouched && !phoneInputError && formData.phone.trim() ? 'border-[#5A1E12]/60'
                      : 'border-[#5A1E12]/20 focus-within:border-[#5A1E12] focus-within:ring-2 focus-within:ring-[#5A1E12]/20'
                    }`}>
                      {/* Country picker */}
                      <button
                        type="button"
                        onClick={() => { setShowPhoneDropdown(v => !v); setPhoneSearch(''); }}
                        className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-[#5A1E12]/20 hover:bg-[#5A1E12]/5 transition rounded-l-xl shrink-0"
                      >
                        <span className="text-lg leading-none">{phoneCountry.flag}</span>
                        <span className="text-[#5A1E12] text-xs font-semibold">{phoneCountry.dialCode}</span>
                        <span className="text-[#5A1E12]/40 text-xs">▾</span>
                      </button>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d\s\-().]/g, '');
                          setFormData(prev => ({ ...prev, phone: v }));
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                          if (phoneTouched) setPhoneInputError(validatePhone(v, phoneCountry));
                        }}
                        onBlur={() => { setPhoneTouched(true); setPhoneInputError(validatePhone(formData.phone, phoneCountry)); }}
                        placeholder={`${phoneCountry.digits[0]}-digit number`}
                        className="flex-1 px-4 py-2.5 text-sm text-[#5A1E12] bg-transparent outline-none placeholder-[#5A1E12]/40"
                      />
                    </div>
                    {/* Dropdown */}
                    {showPhoneDropdown && (
                      <div className="absolute top-full left-0 z-50 mt-1 w-68 bg-white border border-[#5A1E12]/20 rounded-xl shadow-xl overflow-hidden" style={{ minWidth: '260px' }}>
                        <div className="p-2 border-b border-[#5A1E12]/10">
                          <input
                            type="text"
                            autoFocus
                            value={phoneSearch}
                            onChange={(e) => setPhoneSearch(e.target.value)}
                            placeholder="Search country…"
                            className="w-full px-3 py-2 text-sm border border-[#5A1E12]/20 rounded-lg outline-none focus:border-[#5A1E12] bg-white text-[#5A1E12]"
                          />
                        </div>
                        <ul className="max-h-52 overflow-y-auto">
                          {COUNTRIES.filter(c => c.name.toLowerCase().includes(phoneSearch.toLowerCase()) || c.dialCode.includes(phoneSearch)).map(c => (
                            <li key={c.code}>
                              <button
                                type="button"
                                onClick={() => {
                                  setPhoneCountry(c);
                                  setShowPhoneDropdown(false);
                                  setPhoneSearch('');
                                  if (phoneTouched) setPhoneInputError(validatePhone(formData.phone, c));
                                  if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#5A1E12]/5 text-left transition ${c.code === phoneCountry.code ? 'bg-[#5A1E12]/10 font-medium text-[#5A1E12]' : 'text-gray-700'}`}
                              >
                                <span className="text-base w-6 shrink-0">{c.flag}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="text-[#5A1E12]/50 text-xs shrink-0">{c.dialCode}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  {!errors.phone && phoneTouched && phoneInputError && <p className="mt-1 text-xs text-red-500">{phoneInputError}</p>}
                  {!errors.phone && phoneTouched && !phoneInputError && formData.phone.trim() && <p className="mt-1 text-xs text-[#5A1E12]">✓ Looks good</p>}
                </div>
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Set Your Password</h3>
                <div>
                  <label className={labelCls}>Password *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                    placeholder="Set your password (min. 6 characters)" className={inputCls('password')} />
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>
                <div>
                  <label className={labelCls}>Confirm Password *</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
                    placeholder="Re-enter your password" className={inputCls('confirmPassword')} />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Business Details</h3>
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
                      placeholder="11-digit ABN" className={`flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 transition-all ${errors.abn ? 'border-red-400' : 'border-[#5A1E12]/20'}`} />
                    <button type="button" onClick={handleValidateABN} disabled={loading || abnVerified}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${abnVerified ? 'bg-[#5A1E12]/10 text-[#5A1E12] border border-[#5A1E12]/30' : 'bg-[#5A1E12] hover:bg-[#4a180f] text-white disabled:opacity-60'}`}>
                      {abnVerified ? '✓ Verified' : loading ? 'Checking…' : 'Verify ABN'}
                    </button>
                  </div>
                  {errors.abn && <p className="mt-1 text-xs text-red-600">{errors.abn}</p>}
                </div>
                <div>
                  <label className={labelCls}>Business Type *</label>
                  <input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange}
                    placeholder="e.g. Sole Trader, Company" className={inputCls('businessType')} />
                  {errors.businessType && <p className="mt-1 text-xs text-red-600">{errors.businessType}</p>}
                </div>
                <div>
                  <label className={labelCls}>Business Phone *</label>
                  <div ref={bizPhoneDropdownRef} className="relative">
                    <div className={`flex bg-white border rounded-xl items-center overflow-visible transition-all ${
                      errors.businessPhone ? 'border-red-400 ring-2 ring-red-200'
                      : bizPhoneTouched && !bizPhoneInputError && formData.businessPhone.trim() ? 'border-[#5A1E12]/60'
                      : 'border-[#5A1E12]/20 focus-within:border-[#5A1E12] focus-within:ring-2 focus-within:ring-[#5A1E12]/20'
                    }`}>
                      {/* Country picker */}
                      <button
                        type="button"
                        onClick={() => { setShowBizPhoneDropdown(v => !v); setBizPhoneSearch(''); }}
                        className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-[#5A1E12]/20 hover:bg-[#5A1E12]/5 transition rounded-l-xl shrink-0"
                      >
                        <span className="text-lg leading-none">{bizPhoneCountry.flag}</span>
                        <span className="text-[#5A1E12] text-xs font-semibold">{bizPhoneCountry.dialCode}</span>
                        <span className="text-[#5A1E12]/40 text-xs">▾</span>
                      </button>
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d\s\-().]/g, '');
                          setFormData(prev => ({ ...prev, businessPhone: v }));
                          if (errors.businessPhone) setErrors(prev => ({ ...prev, businessPhone: '' }));
                          if (bizPhoneTouched) setBizPhoneInputError(validatePhone(v, bizPhoneCountry));
                        }}
                        onBlur={() => { setBizPhoneTouched(true); setBizPhoneInputError(validatePhone(formData.businessPhone, bizPhoneCountry)); }}
                        placeholder={`${bizPhoneCountry.digits[0]}-digit number`}
                        className="flex-1 px-4 py-2.5 text-sm text-[#5A1E12] bg-transparent outline-none placeholder-[#5A1E12]/40"
                      />
                    </div>
                    {/* Dropdown */}
                    {showBizPhoneDropdown && (
                      <div className="absolute top-full left-0 z-50 mt-1 w-68 bg-white border border-[#5A1E12]/20 rounded-xl shadow-xl overflow-hidden" style={{ minWidth: '260px' }}>
                        <div className="p-2 border-b border-[#5A1E12]/10">
                          <input
                            type="text"
                            autoFocus
                            value={bizPhoneSearch}
                            onChange={(e) => setBizPhoneSearch(e.target.value)}
                            placeholder="Search country…"
                            className="w-full px-3 py-2 text-sm border border-[#5A1E12]/20 rounded-lg outline-none focus:border-[#5A1E12] bg-white text-[#5A1E12]"
                          />
                        </div>
                        <ul className="max-h-52 overflow-y-auto">
                          {COUNTRIES.filter(c => c.name.toLowerCase().includes(bizPhoneSearch.toLowerCase()) || c.dialCode.includes(bizPhoneSearch)).map(c => (
                            <li key={c.code}>
                              <button
                                type="button"
                                onClick={() => {
                                  setBizPhoneCountry(c);
                                  setShowBizPhoneDropdown(false);
                                  setBizPhoneSearch('');
                                  if (bizPhoneTouched) setBizPhoneInputError(validatePhone(formData.businessPhone, c));
                                  if (errors.businessPhone) setErrors(prev => ({ ...prev, businessPhone: '' }));
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#5A1E12]/5 text-left transition ${c.code === bizPhoneCountry.code ? 'bg-[#5A1E12]/10 font-medium text-[#5A1E12]' : 'text-gray-700'}`}
                              >
                                <span className="text-base w-6 shrink-0">{c.flag}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="text-[#5A1E12]/50 text-xs shrink-0">{c.dialCode}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.businessPhone && <p className="mt-1 text-xs text-red-600">{errors.businessPhone}</p>}
                  {!errors.businessPhone && bizPhoneTouched && bizPhoneInputError && <p className="mt-1 text-xs text-red-500">{bizPhoneInputError}</p>}
                  {!errors.businessPhone && bizPhoneTouched && !bizPhoneInputError && formData.businessPhone.trim() && <p className="mt-1 text-xs text-[#5A1E12]">✓ Looks good</p>}
                </div>
                <div>
                  <label className={labelCls}>Business Address *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[['street','Street'],['city','City'],['state','State'],['postcode','Postcode'],['country','Country']].map(([name, placeholder]) => (
                      <div key={name} className={name === 'street' ? 'col-span-full' : ''}>
                        <input type="text" name={name} value={(formData as any)[name]} onChange={handleInputChange}
                          placeholder={placeholder} className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 transition-all ${(errors as any)[name] ? 'border-red-400 bg-red-50' : 'border-[#5A1E12]/20'}`} />
                        {(errors as any)[name] && <p className="mt-1 text-xs text-red-600">{(errors as any)[name]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Artist Profile</h3>
                <div>
                  <label className={labelCls}>Artist Name *</label>
                  <input type="text" name="artistName" value={formData.artistName} onChange={handleInputChange}
                    placeholder="e.g. Electronics Store, Traditional Antique" className={inputCls('artistName')} />
                  {errors.artistName && <p className="mt-1 text-xs text-red-600">{errors.artistName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6}
                    placeholder="Story about your work…" className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 resize-none transition-all ${errors.description ? 'border-red-400' : 'border-[#5A1E12]/20'}`} />
                  {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                </div>
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 5 */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Store Profile</h3>
                <div>
                  <label className={labelCls}>Store Name *</label>
                  <input type="text" name="storeName" value={formData.storeName} onChange={handleInputChange}
                    placeholder="Store Name" className={inputCls('storeName')} />
                  {errors.storeName && <p className="mt-1 text-xs text-red-600">{errors.storeName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Store Logo *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'storeLogo')}
                    className="block w-full text-sm text-[#5A1E12]/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#5A1E12]/10 file:text-[#5A1E12] hover:file:bg-[#5A1E12]/20 cursor-pointer" />
                  {formData.storeLogo && (
                    <div className="w-20 h-20 bg-[#EAD7B7]/40 rounded-lg overflow-hidden mt-2 border border-[#5A1E12]/20">
                      <img src={URL.createObjectURL(formData.storeLogo)} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {errors.storeLogo && <p className="mt-1 text-xs text-red-600">{errors.storeLogo}</p>}
                </div>
                <div>
                  <label className={labelCls}>Store Bio *</label>
                  <textarea name="storeBio" value={formData.storeBio} onChange={handleInputChange} rows={6}
                    placeholder="Tell customers about your art…" className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 resize-none transition-all ${errors.storeBio ? 'border-red-400' : 'border-[#5A1E12]/20'}`} />
                  {errors.storeBio && <p className="mt-1 text-xs text-red-600">{errors.storeBio}</p>}
                </div>
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 6 */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Identity & Bank Details</h3>

                <div>
                  <h4 className="text-sm font-bold text-[#5A1E12] mb-3 pb-1 border-b border-[#5A1E12]/20">KYC Information</h4>
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
                    <label className={labelCls}>Document Type *</label>
                    <select name="documentType" value={formData.documentType} onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                      className={inputCls('documentType')}>
                      <option value="passport">Passport</option>
                      <option value="driver_licence">Driver Licence</option>
                      <option value="national_id">National ID</option>
                    </select>
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>Upload ID Document * <span className="text-[#5A1E12]/60 font-normal">(PDF, JPG, PNG)</span></label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'idDocument')}
                      className="block w-full text-sm text-[#5A1E12]/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#5A1E12]/10 file:text-[#5A1E12] hover:file:bg-[#5A1E12]/20 cursor-pointer" />
                    {errors.idDocument && <p className="mt-1 text-xs text-red-600">{errors.idDocument}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#5A1E12] mb-3 pb-1 border-b border-[#5A1E12]/20">Bank Details</h4>
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

                {/* Terms & Conditions Agreement */}
                <div className="mt-2 p-4 bg-[#5A1E12]/5 border border-[#5A1E12]/20 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={tcAccepted}
                        onChange={(e) => {
                          setTcAccepted(e.target.checked);
                          if (e.target.checked && errors.tc) setErrors(prev => ({ ...prev, tc: '' }));
                        }}
                        className="sr-only peer"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        errors.tc
                          ? 'border-red-400 bg-red-50'
                          : tcAccepted
                          ? 'bg-[#5A1E12] border-[#5A1E12]'
                          : 'border-[#5A1E12]/40 bg-white group-hover:border-[#5A1E12]'
                      }`}>
                        {tcAccepted && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-[#5A1E12] leading-relaxed">
                      I confirm that all the information provided is accurate and complete. I have read, understood, and
                      agree to the{' '}
                      <Link href="/term-and-conditions" target="_blank" className="font-semibold underline hover:text-[#4a180f] transition-colors">
                        Terms &amp; Conditions
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" target="_blank" className="font-semibold underline hover:text-[#4a180f] transition-colors">
                        Privacy Policy
                      </Link>
                      {' '}of the platform, and I acknowledge that the details submitted may be visible to buyers and
                      other users on the platform.
                    </span>
                  </label>
                  {errors.tc && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><span>⚠</span>{errors.tc}</p>}
                </div>

                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Step 7 — OTP Verification */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Verify Your Application</h3>
                <div className="bg-[#5A1E12]/5 border border-[#5A1E12]/20 rounded-xl p-4">
                  <p className="text-sm text-[#5A1E12]">
                    An OTP has been sent to <strong>{formData.email}</strong>. Enter it below to complete your application.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelCls}>OTP *</label>
                    <button type="button" onClick={handleResendOTP} disabled={loading}
                      className="text-sm font-semibold text-[#5A1E12] hover:text-[#5A1E12]/70 underline disabled:opacity-50">
                      {loading ? 'Sending…' : 'Resend OTP'}
                    </button>
                  </div>
                  <input type="text" name="otp" value={formData.otp} onChange={handleInputChange}
                    placeholder="Enter OTP received" className={inputCls('otp')} />
                  {errors.otp && <p className="mt-1 text-xs text-red-600">{errors.otp}</p>}
                </div>
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                )}
                {errors.submit && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-800">{errors.submit}</p></div>}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#5A1E12]/15">
              <button onClick={handlePrevious} disabled={currentStep === 1 || currentStep === 7}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm border ${currentStep === 1 || currentStep === 7 ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-[#5A1E12]/30 bg-[#EAD7B7] text-[#5A1E12] hover:bg-[#5A1E12]/10'}`}>
                Previous
              </button>
              <button onClick={handleNext} disabled={loading || (currentStep === 6 && !tcAccepted)}
                className={`px-8 py-3 text-white rounded-xl font-semibold shadow transition-all ${
                  loading || (currentStep === 6 && !tcAccepted)
                    ? 'bg-[#5A1E12]/40 cursor-not-allowed'
                    : 'bg-[#5A1E12] hover:bg-[#4a180f]'
                }`}>
                {currentStep === 7
                  ? (loading ? 'Verifying…' : 'Verify and Submit')
                  : (loading ? 'Processing…' : 'Next Step')}
              </button>
            </div>
          </div>

          {/* Step Dots */}
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button key={index} onClick={() => setCurrentStep(index + 1)} title={`Step ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-150 ${index + 1 === currentStep ? 'bg-[#5A1E12] w-8' : index + 1 < currentStep ? 'bg-[#5A1E12]/50 w-2' : 'bg-[#5A1E12]/20 w-2'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}