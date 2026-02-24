"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const url = "https://alpa-be-1.onrender.com";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { setUserDirect } = useAuth(); // Use setUserDirect instead of fetchUser
  const { notifyLogin } = useCart();
  const { fetchCartData } = useSharedEnhancedCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowModal(true);

    try {
      const res = await fetch(`${url}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setShowModal(false);
        return;
      }

      /**
       * CASE 1: OTP REQUIRED
       */
      if (data.requiresVerification) {
        router.push(`/login-verify-otp?email=${data.email || email}`);
        return;
      }

      /**
       * CASE 2: TOKEN ALREADY VALID (NO OTP)
       */
      if (data.token && data.user) {
        localStorage.setItem("alpa_token", data.token);
        setUserDirect(data.user);
        // Reload server cart into both cart stores.
        await notifyLogin(data.token);
        await fetchCartData(true);
        router.push("/");
        return;
      }

      console.log("LOGIN RESPONSE:", data);

      // fallback safety
      setError("Unexpected login response");
    } catch (err) {
      setError("Something went wrong");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex overflow-hidden">
      {/* ── Login Loading Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl w-[90vw] max-w-sm overflow-hidden"
            >
              <div className="flex flex-col items-center justify-center px-8 py-12 gap-5">
                <div className="w-16 h-16 rounded-full bg-[#5A1E12]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#5A1E12] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800 text-lg">Logging you in…</p>
                  <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* LEFT PANEL */}
      <section
        className="relative w-1/2 flex flex-col justify-center px-20 text-white
        bg-linear-to-r from-[#440C03] via-[#440C03] to-[#440C03]"
      >
        {/* Logo */}
        <Link href="/" className="absolute top-8 left-8">
          <Image
            src="/images/navbarLogo.png"
            alt="Logo"
            width={90}
            height={90}
          />
        </Link>

        {/* Content */}
        <div className="max-w-md">
          <p className="uppercase text-xs tracking-widest mb-4 opacity-80">
            Start for free
          </p>

          <h1 className="text-4xl font-bold mb-2">Log into your account</h1>

          <p className="text-sm mb-10 opacity-80">
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold underline hover:opacity-100 transition"
            >
              Sign up
            </Link>
          </p>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              className="w-120 rounded-3xl px-5 py-3 bg-[#873007] placeholder-white/70 outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Password"
                className="w-120 rounded-3xl px-5 py-3 bg-[#873007] placeholder-white/70 outline-none"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="text-red-200 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-120 mt-6 bg-white text-[#7A2F12] font-semibold
              rounded-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>
        </div>
      </section>

      {/* RIGHT IMAGE PANEL */}
      <section className="relative w-1/2">
        <Image
          src="/images/top2.jpg"
          alt="Auth Visual"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient blend */}
        <div
          className="absolute inset-0 bg-linear-to-r
          from-[#440C03] via-[#440C03]/40 to-transparent"
        ></div>
      </section>
    </main>
  );
}


// "use client";

// import { useAuth } from "@/context/AuthContext";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// // Device Fingerprinting Class
// class DeviceFingerprint {
//   private fingerprint: string | null = null;

//   async generate(): Promise<string> {
//     if (this.fingerprint) {
//       return this.fingerprint;
//     }

//     const components = await this.collectFingerprints();
//     const fingerprintString = Object.values(components).join('|');
//     this.fingerprint = await this.createHash(fingerprintString);
    
//     return this.fingerprint;
//   }

//   private async collectFingerprints() {
//     const components: Record<string, any> = {};

//     // Screen characteristics
//     components.screen = `${screen.width}x${screen.height}x${screen.colorDepth}`;
//     components.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//     components.language = navigator.language;
//     components.platform = navigator.platform;
//     components.hardwareConcurrency = navigator.hardwareConcurrency || 'unknown';

//     // Memory if available
//     if ('deviceMemory' in navigator) {
//       components.deviceMemory = (navigator as any).deviceMemory;
//     }

//     // WebGL renderer info
//     try {
//       const canvas = document.createElement('canvas');
//       const gl = canvas.getContext('webgl');
//       if (gl) {
//         const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
//         if (debugInfo) {
//           components.webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
//           components.webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
//         }
//       }
//     } catch (e) {
//       // Ignore WebGL errors
//     }

//     // Canvas fingerprinting
//     try {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       if (ctx) {
//         ctx.textBaseline = 'top';
//         ctx.font = '14px Arial';
//         ctx.fillText('Device fingerprint test 🔐', 2, 2);
//         components.canvas = canvas.toDataURL().slice(-50);
//       }
//     } catch (e) {
//       // Ignore canvas errors
//     }

//     // Storage capabilities
//     try {
//       const testKey = '_fp_test';
//       localStorage.setItem(testKey, '1');
//       components.localStorage = localStorage.getItem(testKey) === '1';
//       localStorage.removeItem(testKey);
//     } catch (e) {
//       components.localStorage = false;
//     }

//     components.touchSupport = 'ontouchstart' in window;
//     components.indexedDB = !!window.indexedDB;

//     return components;
//   }

//   private async createHash(str: string): Promise<string> {
//     if (crypto.subtle) {
//       const encoder = new TextEncoder();
//       const data = encoder.encode(str);
//       const hashBuffer = await crypto.subtle.digest('SHA-256', data);
//       const hashArray = Array.from(new Uint8Array(hashBuffer));
//       return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
//     } else {
//       // Fallback hash
//       let hash = 0;
//       for (let i = 0; i < str.length; i++) {
//         const char = str.charCodeAt(i);
//         hash = ((hash << 5) - hash) + char;
//         hash = hash & hash;
//       }
//       return Math.abs(hash).toString(16).padStart(8, '0');
//     }
//   }

//   async getFingerprint(): Promise<string> {
//     try {
//       const stored = localStorage.getItem('_device_fp');
//       if (stored && stored.length > 20) {
//         this.fingerprint = stored;
//         return stored;
//       }
//     } catch (e) {
//       // Continue without stored fingerprint
//     }

//     const fp = await this.generate();
    
//     try {
//       localStorage.setItem('_device_fp', fp);
//     } catch (e) {
//       // Continue without storing
//     }

//     return fp;
//   }
// }

// export default function LoginPage() {
//   const url = "https://alpa-be-1.onrender.com";
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const { setUserDirect } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       // Generate device fingerprint
//       const deviceFp = new DeviceFingerprint();
//       const clientFingerprint = await deviceFp.getFingerprint();
      
//       // Get stored trusted device token
//       const trustedDeviceToken = localStorage.getItem('trustedDeviceToken');
      
//       console.log('🔐 Login attempt with:', {
//         hasFingerprint: !!clientFingerprint,
//         hasTrustedToken: !!trustedDeviceToken,
//         fingerprintPrefix: clientFingerprint?.substring(0, 8) + '...'
//       });

//       const res = await fetch(`${url}/api/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//           email, 
//           password,
//           clientFingerprint,
//           trustedDeviceToken
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.message || "Login failed");
//         return;
//       }

//       console.log('📱 Login response:', {
//         requiresVerification: data.requiresVerification,
//         deviceTrusted: data.deviceTrusted,
//         trustLevel: data.trustLevel,
//         verificationReason: data.verificationReason
//       });

//       /**
//        * CASE 1: OTP VERIFICATION REQUIRED
//        */
//       if (data.requiresVerification) {
//         // Store verification context for OTP page
//         sessionStorage.setItem('verificationContext', JSON.stringify({
//           email: data.email || email,
//           verificationReason: data.verificationReason,
//           isSevenDayCheck: data.isSevenDayCheck,
//           message: data.message
//         }));
        
//         router.push(`/login-verify-otp?email=${data.email || email}&reason=${data.verificationReason}`);
//         return;
//       }

//       /**
//        * CASE 2: DIRECT LOGIN SUCCESS (TRUSTED DEVICE)
//        */
//       if (data.success && data.token && data.user) {
//         // Store JWT token
//         localStorage.setItem("alpa_token", data.token);
        
//         // Store/update trusted device token if provided
//         if (data.trustedDeviceToken) {
//           localStorage.setItem('trustedDeviceToken', data.trustedDeviceToken);
//           console.log('🔐 Trusted device token updated');
//         }
        
//         // Store trust validity period if provided
//         if (data.trustValidUntil) {
//           localStorage.setItem('trustValidUntil', data.trustValidUntil);
//         }
        
//         // Set user in context and redirect
//         setUserDirect(data.user);
        
//         // Show appropriate success message based on trust level
//         const welcomeMessage = data.trustLevel === 'trusted_device' 
//           ? 'Welcome back! Trusted device recognized.' 
//           : 'Login successful!';
        
//         // You can show a toast notification here if you have a toast system
//         console.log('✅', welcomeMessage);
        
//         router.push("/");
//         return;
//       }

//       // Fallback for unexpected responses
//       console.error('Unexpected login response:', data);
//       setError("Unexpected login response. Please try again.");

//     } catch (err) {
//       console.error('Login error:', err);
//       setError("Network error. Please check your connection and try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Clear any verification context when component mounts
//   useEffect(() => {
//     sessionStorage.removeItem('verificationContext');
//   }, []);

//   return (
//     <main className="min-h-screen w-full flex overflow-hidden">
//       {/* LEFT PANEL */}
//       <section
//         className="relative w-1/2 flex flex-col justify-center px-20 text-white
//         bg-linear-to-r from-[#440C03] via-[#440C03] to-[#440C03]"
//       >
//         {/* Logo */}
//         <div className="absolute top-8 left-8">
//           <Image
//             src="/images/navbarLogo.png"
//             alt="Logo"
//             width={90}
//             height={90}
//           />
//         </div>

//         {/* Content */}
//         <div className="max-w-md">
//           <p className="uppercase text-xs tracking-widest mb-4 opacity-80">
//             Start for free
//           </p>

//           <h1 className="text-4xl font-bold mb-2">Log into your account</h1>

//           <p className="text-sm mb-10 opacity-80">
//             New here?{" "}
//             <Link
//               href="/signup"
//               className="font-semibold underline hover:opacity-100 transition"
//             >
//               Sign up
//             </Link>
//           </p>

//           {/* Form */}
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               className="w-120 rounded-3xl px-5 py-3 bg-[#873007] placeholder-white/70 outline-none"
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             <input
//               type="password"
//               value={password}
//               placeholder="Password"
//               className="w-120 rounded-3xl px-5 py-3 bg-[#873007] placeholder-white/70 outline-none" 
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />

//             {error && (
//               <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
//                 <p className="text-red-200 text-sm">{error}</p>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-120 mt-6 bg-white text-[#7A2F12] font-semibold
//               rounded-full py-3 flex items-center justify-center gap-2
//               disabled:opacity-70 disabled:cursor-not-allowed
//               hover:bg-gray-100 transition-colors"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin h-4 w-4 border-2 border-[#7A2F12] border-t-transparent rounded-full"></div>
//                   Logging in...
//                 </>
//               ) : (
//                 "Login →"
//               )}
//             </button>
//           </form>

//           {/* Additional Security Info */}
//           <div className="mt-8 text-xs opacity-60">
//             <p>🔐 Your device will be remembered for faster logins</p>
//             <p>📧 Periodic verification required for security</p>
//           </div>
//         </div>
//       </section>

//       {/* RIGHT IMAGE PANEL */}
//       <section className="relative w-1/2">
//         <Image
//           src="/images/top2.jpg"
//           alt="Auth Visual"
//           fill
//           className="object-cover"
//           priority
//         />

//         {/* Gradient blend */}
//         <div
//           className="absolute inset-0 bg-linear-to-r
//           from-[#440C03] via-[#440C03]/40 to-transparent"
//         ></div>
//       </section>
//     </main>
//   );
// }