// "use client";
// import React, { useRef } from "react";
// import Image from "next/image";
// import { useProducts } from "@/hooks/useProducts";
// import OptimisticProductCard from "@/components/cards/OptimisticProductCard";
// import Link from "next/link";

// const Page = () => {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const { data: products = [] } = useProducts();
//   const limitedProducts = products.slice(0, 4);

//   const scrollByAmount = (amount: number) => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
//     }
//   };

//   return (
//     <main className="min-h-screen bg-[#EAD7B7] ">
//       {/* ================= HERO ================= */}
//       <section>
//         <div className="relative min-h-screen overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center bg-fixed">
//           {/* Using standard Tailwind v3 gradient syntax for compatibility */}
//           <div className="absolute inset-0 bg-linear-to-b from-amber-900/60 via-amber-900/30 to-black/70"></div>

//           <div className="relative z-10 flex flex-col justify-center text-white px-4 sm:px-6 lg:px-24 py-32 md:py-40 lg:py-60">
//             <h1 className="text-3xl sm:text-4xl font-bold mb-2">
//               Discover the Spirit of
//             </h1>
//             <h1 className="text-3xl sm:text-4xl font-bold mb-6 md:mb-8 text-amber-100">
//               Arnhem Land
//             </h1>
//             <p className="text-sm sm:text-base max-w-2xl mb-8 leading-relaxed text-gray-100/90">
//               Discover authentic Aboriginal products and experiences, each
//               carrying stories passed down through thousands of generations.
//             </p>

//             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
//               <button className="px-8 py-3 bg-[#803512] hover:bg-[#a0451a] text-white font-medium transition-all duration-300 rounded-sm tracking-wide uppercase text-xs sm:text-sm">
//                 Start Your Journey
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ================= FEATURES & SPONSOR CAROUSEL ================= */}
//       <section className="relative bg-[#632013] p-4 sm:p-6 lg:p-10 rounded-2xl lg:rounded-4xl mx-2 sm:mx-4 lg:mx-10 -mt-8 sm:-mt-12 lg:-mt-20 mb-8 lg:mb-16">
//         <div className="flex flex-col w-full mb-8 sm:mb-12 lg:mb-20">
//           {/* CAROUSEL WRAPPER */}
//           <div className="relative group w-full px-0 sm:px-6 mb-16">
//             {/* Arrows */}
//             <button
//               onClick={() => scrollByAmount(-400)}
//               className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full hidden md:block transition-all shadow-lg cursor-pointer"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6 text-white"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 19l-7-7 7-7"
//                 />
//               </svg>
//             </button>

//             <button
//               onClick={() => scrollByAmount(400)}
//               className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full hidden md:block transition-all shadow-lg cursor-pointer"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6 text-white"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 5l7 7-7 7"
//                 />
//               </svg>
//             </button>

//             {/* Scrolling Container */}
//             <div
//               ref={scrollRef}
//               className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth gap-4 pb-4"
//               style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//             >
//               {/* SLIDE 1: Australia Post */}
//               <div className="min-w-full snap-center px-1">
//                 <div className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512]">
//                   <div className="relative w-full md:w-1/2  bg-[url('/images/ap.jpg')] bg-cover bg-right shrink-0">
//                     <div className="absolute inset-0 bg-black/5"></div>
//                   </div>
//                   <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-white">
//                     <div className="absolute top-0 bottom-0 -left-10 lg:-left-16 w-12 lg:w-20 hidden md:block text-[#803512]">
//                       <svg
//                         viewBox="0 0 100 100"
//                         preserveAspectRatio="none"
//                         className="h-full w-full fill-[#803512]"
//                       >
//                         <path d="M 100 0 L 100 100 L 0 100 Q 50 50 0 0 Z" />
//                       </svg>
//                     </div>
//                     <div className="relative z-10">
//                       <div className="mb-6 absolute top-0 right-4">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-100">
//                           <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2 animate-pulse"></span>
//                           Sponsored
//                         </span>
//                       </div>
//                       <h2 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
//                         Delivering <br />
//                         <span className="text-orange-200">For Australia</span>
//                       </h2>
//                       <p className="text-orange-50/80 text-sm lg:text-base leading-relaxed mb-8 max-w-md">
//                         Connecting you to more of what you love. Making every
//                         delivery count across the country.
//                       </p>
//                       <button className="bg-white text-[#803512] px-8 py-3 rounded-full text-xs font-bold uppercase shadow-lg hover:bg-orange-50 transition-colors">
//                         View Now
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* SLIDE 2: Government Services (Medicare / Service Australia) */}
//               <div className="min-w-full snap-center px-1">
//                 <div className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512]">
//                   <div className="relative w-full md:w-1/2 bg-[url('/images/medicare.jpg')] bg-cover bg-center shrink-0">
//                     <div className="absolute inset-0 bg-black/10"></div>
//                   </div>
//                   <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-white">
//                     <div className="absolute top-0 bottom-0 -left-10 lg:-left-16 w-12 lg:w-20 hidden md:block text-[#803512]">
//                       <svg
//                         viewBox="0 0 100 100"
//                         preserveAspectRatio="none"
//                         className="h-full w-full fill-[#803512]"
//                       >
//                         <path d="M 100 0 L 100 100 L 0 100 Q 50 50 0 0 Z" />
//                       </svg>
//                     </div>
//                     <div className="relative z-10">
//                       <div className="mb-6 absolute top-0 right-4">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-100">
//                           <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2 animate-pulse"></span>
//                           Government
//                         </span>
//                       </div>
//                       <h2 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
//                         Support For <br />
//                         <span className="text-orange-200">Your Wellbeing</span>
//                       </h2>
//                       <p className="text-orange-50/80 text-sm lg:text-base leading-relaxed mb-8 max-w-md">
//                         Accessing essential healthcare and community services.
//                         We're here to support every Australian's health journey.
//                       </p>
//                       <button className="bg-white text-[#803512] px-8 py-3 rounded-full text-xs font-bold uppercase shadow-lg hover:bg-orange-50 transition-colors">
//                         Access Services
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Fetch the Product cards dynamically  */}
//           <div>
//             <h2 className="text-center text-4xl font-bold text-[#e5d3b3] underline">
//               Explore Our Products
//             </h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-10">
//               {limitedProducts.map((product) => (
//                 <OptimisticProductCard
//                   key={product.id}
//                   id={product.id}
//                   photo={product.featuredImage || product.images?.[0] || "/images/placeholder.png"}
//                   name={product.title}
//                   description={product.description}
//                   amount={parseFloat(product.price)}
//                   stock={product.stock}
//                   slug={product.slug}
//                   rating={product.rating}
//                   tags={product.tags}
//                   featured={product.featured}
//                   artistName={product.artistName}
//                 />
//               ))}
//             </div>
//             <div className="flex justify-center mt-10">
//               <Link 
//                 href="/shop" 
//                 className="px-8 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition"
//               >
//                 View All
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* STATIC VIDEO SECTION */}
//         <div className="flex flex-col justify-center items-center text-center mt-12 sm:mt-16 lg:mt-20">
//           <h2 className="font-bold text-white text-lg sm:text-xl lg:text-3xl max-w-4xl mb-8 leading-relaxed">
//             Journey through the heartof{" "}
//             <span className="text-amber-100">Arnhem Land.</span>
//           </h2>
//           <div className="relative w-full max-w-5xl h-48 sm:h-64 lg:h-96 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
//             <Image
//               src="/images/video-temp.jpg"
//               alt="Video preview"
//               fill
//               className="object-cover"
//             />
//           </div>
//         </div>
//       </section>

//       {/* Cultural Section */}
//       <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 px-4 sm:px-6 lg:px-16 xl:px-20 py-12 sm:py-16 lg:py-24 items-end mb-12 sm:mb-20">
//         <div className="max-w-2xl">
//           <p className="text-sm sm:text-base lg:text-lg font-medium leading-relaxed text-gray-700">
//             Discover authentic Aboriginal products and experiences, each
//             carrying stories passed down through thousands of generations.
//           </p>

//           <svg
//             className="mt-6 lg:mt-8 w-full h-6 lg:h-8"
//             viewBox="0 0 400 30"
//             fill="none"
//           >
//             <path
//               d="M5 15 C60 5, 120 25, 180 15 C240 5, 300 25, 395 15"
//               stroke="#6B2C1A"
//               strokeWidth="4"
//               strokeLinecap="round"
//               className="animate-pulse"
//             />
//           </svg>

//           <p className="mt-6 lg:mt-8 text-lg sm:text-xl lg:text-2xl font-bold text-[#6B2C1A] mb-8 lg:mb-12">
//             01/07
//           </p>

//           <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
//             Explore our{" "}
//             <span className="text-amber-900">Cultural Categories</span>
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
//           {/* Image Cards */}
//           {[1, 2, 3].map((item) => (
//             <div
//               key={item}
//               className="relative h-64 lg:h-80 xl:h-96 rounded-2xl lg:rounded-3xl overflow-hidden group cursor-pointer"
//             >
//               <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
//               <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
//               <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 text-center">
//                 <h3 className="text-xs font-bold text-gray-900">
//                   Category {item}
//                 </h3>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </main>
//   );
// };

// export default Page;






"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import OptimisticProductCard from "@/components/cards/OptimisticProductCard";
import Link from "next/link";
import { motion } from "framer-motion";

const SLIDE_COUNT = 2;

const Page = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const limitedProducts = products.slice(0, 12);

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      });
      setActiveSlide(index);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const index = Math.round(el.scrollLeft / el.offsetWidth);
      setActiveSlide(index);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollProductByOne = (direction: 1 | -1) => {
    if (productScrollRef.current) {
      const card = productScrollRef.current.children[0] as HTMLElement;
      const gap = 24; // gap-6 = 1.5rem = 24px
      const cardWidth = card ? card.offsetWidth + gap : 300;
      productScrollRef.current.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-[#EAD7B7]">

      {/* ================= HERO ================= */}
      <section>
        <div className="relative min-h-screen overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center bg-fixed">
          {/* Layered gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-amber-900/70 via-amber-900/40 to-black/80" />
          <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

          {/* Aboriginal waterhole — top right */}
          {/* <svg aria-hidden="true" viewBox="0 0 180 180" fill="none" className="absolute top-6 right-6 md:top-10 md:right-12 w-36 h-36 md:w-52 md:h-52 text-white opacity-[0.08] pointer-events-none">
            {[80,60,42,26,12].map((r, i) => (
              <circle key={r} cx="90" cy="90" r={r} stroke="currentColor" strokeWidth="1.3" strokeDasharray="4 3" opacity={1 - i * 0.15} />
            ))}
            <circle cx="90" cy="90" r="5" fill="currentColor" />
            {[[90,4],[90,176],[4,90],[176,90]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" />))}
            {[[90,22],[90,158],[22,90],[158,90]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" />))}
            {[[90,40],[90,140],[40,90],[140,90]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" />))}
            {[[32,32],[148,32],[32,148],[148,148]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" opacity="0.6" />))}
            {[[51,51],[129,51],[51,129],[129,129]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="1.5" fill="currentColor" opacity="0.5" />))}
          </svg> */}

          {/* Aboriginal spiral — bottom left */}
          {/* <svg aria-hidden="true" viewBox="0 0 120 120" fill="none" className="absolute bottom-20 left-4 md:bottom-28 md:left-10 w-24 h-24 md:w-36 md:h-36 text-amber-200 opacity-[0.10] pointer-events-none">
            <path d="M60,60 C65,60 70,55 70,50 C70,45 65,40 60,40 C50,40 40,50 40,60 C40,72 50,82 62,82 C76,82 90,70 90,56 C90,38 76,24 58,22 C36,20 18,38 18,60 C18,84 38,102 62,102" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2" strokeLinecap="round" />
            <circle cx="60" cy="60" r="4" fill="currentColor" />
            {[{cx:70,cy:50},{cx:40,cy:60},{cx:62,cy:82},{cx:90,cy:56},{cx:18,cy:60},{cx:58,cy:22}].map((d,i)=>(<circle key={i} cx={d.cx} cy={d.cy} r="2" fill="currentColor" opacity="0.7" />))}
          </svg> */}

          {/* Dot field — scattered right side */}
          {/* <svg aria-hidden="true" viewBox="0 0 160 280" fill="none" className="absolute right-0 top-1/4 w-28 md:w-40 h-auto text-amber-100 opacity-[0.07] pointer-events-none">
            {[
              [20,20,3],[50,12,2],[80,28,2.5],[110,16,2],[140,30,3],
              [10,55,2],[45,48,2.5],[78,62,2],[105,50,2.5],[138,58,3],
              [25,88,2.5],[58,80,2],[90,95,3],[118,84,2],[148,92,2.5],
              [15,122,2],[52,115,2.5],[82,128,2],[112,118,3],[145,126,2],
              [30,158,3],[60,148,2],[92,162,2.5],[122,152,2],[150,160,2.5],
              [18,192,2],[55,185,3],[85,198,2],[116,188,2.5],[148,195,2],
            ].map(([cx,cy,r],i)=>(<circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" />))}
          </svg> */}

          {/* Hero content */}
          <div className="relative z-10 flex flex-col justify-center min-h-screen text-white px-6 sm:px-10 lg:px-24 pt-40 pb-24">

            {/* Animated badge */}
            {/* <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/40 bg-amber-900/30 backdrop-blur-sm text-amber-200 text-xs font-semibold tracking-[0.18em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                Authentic Aboriginal Art &amp; Culture
              </span>
            </motion.div> */}

            {/* Headline */}
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight"
              >
                Discover the Spirit of
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-6 md:mb-8">
              <motion.h1
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-amber-200"
              >
                Arnhem Land
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.58, ease: "easeOut" }}
              className="text-sm sm:text-base lg:text-lg max-w-lg mb-10 leading-relaxed text-white/75"
            >
              Authentic Aboriginal products and experiences — each carrying
              stories passed down through thousands of generations.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.74, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16 md:mb-20"
            >
              <Link
                href="/shop"
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-[#5A1E12] hover:bg-[#7a2a1a] text-white font-semibold text-sm tracking-wide uppercase rounded-full transition-all duration-300 shadow-[0_8px_24px_rgba(90,30,18,0.45)] hover:shadow-[0_12px_32px_rgba(90,30,18,0.55)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Your Journey
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 hover:border-white/70 text-white/80 hover:text-white font-medium text-sm tracking-wide uppercase rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Art
              </Link>
            </motion.div>

            {/* Stats strip */}
            {/* <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-6 sm:gap-10"
            >
              {[
                { value: "8,000+", label: "Happy Customers" },
                { value: "30,000+", label: "Products Listed" },
                { value: "100%", label: "Locally Operated" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="hidden sm:block w-px h-8 bg-white/20" />}
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-amber-200 leading-none">{s.value}</p>
                    <p className="text-xs text-white/50 mt-0.5 tracking-wide">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div> */}
          </div>

          {/* Scroll indicator */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
          >
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
          </motion.div> */}
        </div>
      </section>

      {/* ================= FEATURES & SPONSOR CAROUSEL ================= */}
      <section className="relative bg-[#632013] p-4 sm:p-6 lg:p-8  lg:pt-12 rounded-2xl lg:rounded-4xl mx-2 sm:mx-4 lg:mx-10 -mt-8 sm:-mt-12 lg:-mt-20 ">
        <div className="flex flex-col w-full">
          {/* CAROUSEL WRAPPER */}
          <div className="relative group w-full px-0 sm:px-6">
            {/* Scrolling Container */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth gap-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* SLIDE 1: Australia Post */}
              <div className="min-w-full snap-center px-1">
                <div className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512]">
                  <div className="relative w-full md:w-1/2  bg-[url('/images/ap.jpg')] bg-cover bg-right shrink-0">
                    <div className="absolute inset-0 bg-black/5"></div>
                  </div>
                  <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-white">
                    <div className="absolute top-0 bottom-0 -left-10 lg:-left-16 w-12 lg:w-20 hidden md:block text-[#803512]">
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="h-full w-full fill-[#803512]"
                      >
                        <path d="M 100 0 L 100 100 L 0 100 Q 50 50 0 0 Z" />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <div className="mb-6 absolute top-0 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2 animate-pulse"></span>
                          Sponsored
                        </span>
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                        Delivering <br />
                        <span className="text-orange-200">For Australia</span>
                      </h2>
                      <p className="text-orange-50/80 text-sm lg:text-base leading-relaxed mb-8 max-w-md">
                        Connecting you to more of what you love. Making every
                        delivery count across the country.
                      </p>
                      <button className="bg-[#5A1E12] text-white px-8 py-3 rounded-full text-xs font-bold uppercase shadow-lg hover:bg-[#7a2a1a] transition-colors">
                        View Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 2: Government Services (Medicare / Service Australia) */}
              <div className="min-w-full snap-center px-1">
                <div className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512]">
                  <div className="relative w-full md:w-1/2 bg-[url('/images/medicare.jpg')] bg-cover bg-center shrink-0">
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                  <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-white">
                    <div className="absolute top-0 bottom-0 -left-10 lg:-left-16 w-12 lg:w-20 hidden md:block text-[#803512]">
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="h-full w-full fill-[#803512]"
                      >
                        <path d="M 100 0 L 100 100 L 0 100 Q 50 50 0 0 Z" />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <div className="mb-6 absolute top-0 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2 animate-pulse"></span>
                          Government
                        </span>
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                        Support For <br />
                        <span className="text-orange-200">Your Wellbeing</span>
                      </h2>
                      <p className="text-orange-50/80 text-sm lg:text-base leading-relaxed mb-8 max-w-md">
                        Accessing essential healthcare and community services.
                        We're here to support every Australian's health journey.
                      </p>
                      <button className="bg-[#5A1E12] text-white px-8 py-3 rounded-full text-xs font-bold uppercase shadow-lg hover:bg-[#7a2a1a] transition-colors">
                        Access Services
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot Navigation */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`transition-all duration-300 rounded-full ${
                    activeSlide === i
                      ? "w-6 h-2.5 bg-white"
                      : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* STATIC CARDS GRID */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-white">
            <div className="relative col-span-1 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden bg-[url('/images/woodenfluet.jpg')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500">
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                  Artisan Crafts
                </h1>
                <p className="text-xs opacity-90">
                  Traditional techniques meets modern design.
                </p>
              </div>
            </div>

            <div className="relative col-span-1 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden bg-[url('/images/color-rock.jpg')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h3 className="text-lg font-bold mb-2">Ancient Lore</h3>
                <p className="text-xs opacity-90">
                  Stories passed down through generations.
                </p>
              </div>
            </div>

            <div className="relative col-span-1 md:col-span-2 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden bg-[url('/images/mid3.jpg')] bg-cover bg-center hover:scale-[1.01] transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 p-6 lg:p-10 h-full flex flex-col justify-end">
                <h3 className="text-xl lg:text-3xl font-bold mb-2">
                  Cultural Heritage
                </h3>
                <p className="text-sm opacity-90">
                  Explore the oldest living culture on Earth.
                </p>
              </div>
            </div>
          </div> */}
      </section>

      {/* Fetch the Product cards dynamically  */}
      <section className="relative max-w-screen-2xl mx-auto py-20 px-12 overflow-hidden">

        {/* ── ABORIGINAL PATTERN: TOP-RIGHT ── */}
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none opacity-[0.13]" aria-hidden="true">
          <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {[40,80,120,160,200,240,280,330].map((r, i) => (
              <path
                key={r}
                d={`M ${380} ${380 - r} A ${r} ${r} 0 0 0 ${380 - r} ${380}`}
                stroke="#632013"
                strokeWidth={i % 2 === 0 ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (Math.PI / 2) * (i / 9);
              const r = 60;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="4" fill="#803512" />;
            })}
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (Math.PI / 2) * (i / 13);
              const r = 140;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="3" fill="#632013" />;
            })}
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (Math.PI / 2) * (i / 17);
              const r = 220;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="2.5" fill="#a0451a" />;
            })}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (Math.PI / 2) * ((i + 0.5) / 6);
              const r = 100;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return (
                <g key={i} transform={`translate(${cx},${cy}) rotate(${(angle * 180) / Math.PI - 45})`}>
                  <line x1="-5" y1="0" x2="5" y2="0" stroke="#632013" strokeWidth="2" strokeLinecap="round" />
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="#632013" strokeWidth="2" strokeLinecap="round" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── ABORIGINAL PATTERN: BOTTOM-LEFT ── */}
        <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none opacity-[0.13]" aria-hidden="true">
          {/* <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {[0, 28, 56, 84, 112, 140, 168, 196].map((offset, i) => (
              <path
                key={offset}
                d={`M -20 ${320 - offset} C 40 ${310 - offset}, 90 ${330 - offset}, 150 ${318 - offset} S 240 ${305 - offset}, 300 ${320 - offset} S 370 ${330 - offset}, 410 ${318 - offset}`}
                stroke="#632013"
                strokeWidth={i % 3 === 0 ? 3 : 1.8}
                strokeLinecap="round"
              />
            ))}
            {[
              [30,295],[75,280],[130,300],[190,285],[250,295],[310,278],
              [55,265],[115,252],[175,268],[235,255],[295,265],
              [20,240],[80,228],[145,242],[210,230],[270,244],
              [50,215],[110,200],[170,216],[240,205],[300,218],
              [35,188],[100,175],[165,190],[225,178],[285,192],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={i % 4 === 0 ? 5 : 3} fill="#803512" />
            ))}
            {[[40,360],[90,355],[140,358]].map(([x, y], i) => (
              <path
                key={i}
                d={`M ${x - 12} ${y - 20} Q ${x} ${y + 8} ${x + 12} ${y - 20}`}
                stroke="#632013"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </svg> */}
        </div>

        <div>
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#803512]/60 mb-3">Handpicked Collection</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#3a1208] leading-tight mb-3">
              Explore Our <span className="text-[#803512]">Products</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="w-10 h-px bg-[#803512]/40" />
              <span className="w-2 h-2 rounded-full bg-[#803512]/50" />
              <span className="w-10 h-px bg-[#803512]/40" />
            </div>
          </div>
            {/* Exmaple */}
          {/* Product Carousel */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollProductByOne(-1)}
              className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 bg-[#5A1E12] hover:bg-[#7a2a1a] text-white p-2 rounded-full hidden md:flex items-center justify-center transition-all shadow-lg cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollProductByOne(1)}
              className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 bg-[#5A1E12] hover:bg-[#7a2a1a] text-white p-2 rounded-full hidden md:flex items-center justify-center transition-all shadow-lg cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Cards */}
            <div
              ref={productScrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="shrink-0 snap-start w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] animate-pulse rounded-xl border border-stone-100 shadow-sm overflow-hidden bg-white flex flex-col"
                    >
                      {/* ── IMAGE SECTION ── */}
                      <div className="relative aspect-[6/4 bg-stone-100 overflow-hidden">
                        {/* Logo placeholder (top-left) */}
                        <div className="absolute top-3 left-3 z-10 w-10 h-10 rounded-md bg-stone-200" />
                        {/* Full image wash */}
                        <div className="absolute inset-0 bg-stone-200" />
                      </div>

                      {/* ── DETAILS SECTION ── */}
                      <div className="flex flex-col grow p-4 bg-white gap-y-3">
                        {/* Row: artist label + 5 stars */}
                        <div className="flex justify-between items-center">
                          <div className="h-2.5 w-20 rounded bg-stone-200" />
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <div key={j} className="h-3 w-3 rounded-sm bg-stone-200" />
                            ))}
                          </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-1.5">
                          <div className="h-4 w-4/5 rounded bg-stone-200" />
                          <div className="h-4 w-2/5 rounded bg-stone-200" />
                        </div>

                        {/* Description — 2 lines */}
                        <div className="space-y-1.5">
                          <div className="h-3 w-full rounded bg-stone-200" />
                          <div className="h-3 w-3/4 rounded bg-stone-200" />
                        </div>

                        {/* Tags */}
                        <div className="flex gap-1.5">
                          <div className="h-5 w-14 rounded-sm bg-stone-200" />
                          <div className="h-5 w-16 rounded-sm bg-stone-200" />
                        </div>

                        {/* Footer: price + buttons */}
                        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
                          {/* Price block */}
                          <div className="space-y-1">
                            <div className="h-2.5 w-8 rounded bg-stone-200" />
                            <div className="h-5 w-16 rounded bg-stone-200" />
                          </div>
                          {/* Wishlist circle + Cart pill */}
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-full bg-stone-200" />
                            <div className="h-10 w-24 rounded-full bg-stone-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : limitedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="shrink-0 snap-start w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                    >
                      <OptimisticProductCard
                        id={product.id}
                        photo={product.featuredImage || product.images?.[0] || "/images/placeholder.png"}
                        name={product.title}
                        description={product.description}
                        amount={parseFloat(product.price)}
                        stock={product.stock}
                        slug={product.slug}
                        rating={product.rating}
                        tags={product.tags}
                        featured={product.featured}
                        artistName={product.artistName}
                      />
                    </div>
                  ))}
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <Link
              href="/shop"
              className="px-8 py-2.5 bg-[#5A1E12] text-white rounded-full hover:bg-[#7a2a1a] transition-all font-semibold text-sm tracking-wide"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SPLIT EXPLORE STRIP ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-64 overflow-hidden">

        {/* ── LEFT: Explore Marketplace ── */}
        <Link
          href="/shop"
          className="group relative flex flex-col justify-between p-6 md:p-8 bg-[#3a1208] overflow-hidden cursor-pointer"
        >
          {/* Animated dot-grid background */}
          <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12]" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="dots-left" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-left)" />
          </svg>

          {/* Animated scan line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-amber-400/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-amber-400/40 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-700 ease-in-out delay-100" />
          {/* Vertical scan line */}
          <div className="absolute top-0 right-0 w-0.5 h-full bg-linear-to-b from-transparent via-amber-400/30 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-700 ease-in-out delay-200" />

          {/* Corner bracket top-left */}
          <div className="relative z-10 flex items-start justify-between mb-auto">
            <div className="flex flex-col gap-1">
              <div className="w-8 h-0.5 bg-amber-400/60" />
              <div className="w-0.5 h-8 bg-amber-400/60" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400/50 mt-1">01 / Shop</span>
          </div>

          {/* Text block */}
          <div className="relative z-10 mt-4">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-amber-300/60 mb-2">
              Discover Products
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 group-hover:text-amber-100 transition-colors duration-300">
              Explore the<br />
              <span className="text-amber-300">Marketplace</span>
            </h3>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed mb-4">
              Thousands of authentic Aboriginal products like art, crafts, textiles, and more, curated with care.
            </p>
            <div className="inline-flex items-center gap-3 text-amber-300 text-sm font-semibold tracking-wide uppercase">
              <span className="w-8 h-px bg-amber-400/60 group-hover:w-14 transition-all duration-400" />
              Browse Now
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          {/* Corner bracket bottom-right */}
          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 opacity-40">
            <div className="w-0.5 h-8 bg-amber-400" />
            <div className="w-8 h-0.5 bg-amber-400" />
          </div>
        </Link>

        {/* ── RIGHT: Explore Yolŋu Culture ── */}
        <Link
          href="/about-us"
          className="group relative flex flex-col justify-between p-6 md:p-8 bg-[#803512] overflow-hidden cursor-pointer"
        >
          {/* Animated dot-grid background */}
          <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.10]" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="dots-right" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-right)" />
          </svg>

          {/* Aboriginal concentric ring — top right watermark */}
          <svg aria-hidden="true" viewBox="0 0 160 160" fill="none" className="absolute -top-6 -right-6 w-40 h-40 text-white opacity-[0.07] pointer-events-none">
            {[72,54,38,24,11].map((r, i) => (
              <circle key={r} cx="80" cy="80" r={r} stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 3" opacity={1 - i * 0.15} />
            ))}
            <circle cx="80" cy="80" r="5" fill="currentColor" />
            {[[80,2],[80,158],[2,80],[158,80]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" />))}
            {[[80,18],[80,142],[18,80],[142,80]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" />))}
          </svg>

          {/* Animated scan line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-orange-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-orange-200/40 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-700 ease-in-out delay-100" />
          <div className="absolute top-0 left-0 w-0.5 h-full bg-linear-to-b from-transparent via-orange-200/30 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-700 ease-in-out delay-200" />

          {/* Corner bracket top-right */}
          <div className="relative z-10 flex items-start justify-between mb-auto">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-orange-200/50 mt-1">02 / Culture</span>
            <div className="flex flex-col items-end gap-1">
              <div className="w-8 h-0.5 bg-orange-200/60" />
              <div className="w-0.5 h-8 bg-orange-200/60 self-end" />
            </div>
          </div>

          {/* Text block */}
          <div className="relative z-10 mt-4">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-orange-200/60 mb-2">
              Living Heritage
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 group-hover:text-orange-100 transition-colors duration-300">
              Explore<br />
              <span className="text-orange-200">Yolŋu Culture</span>
            </h3>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed mb-4">
              Dive into the world's oldest living culture — stories, ceremony, language, and land passed through generations.
            </p>
            <div className="inline-flex items-center gap-3 text-orange-200 text-sm font-semibold tracking-wide uppercase">
              <span className="w-8 h-px bg-orange-300/60 group-hover:w-14 transition-all duration-400" />
              Learn More
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          {/* Corner bracket bottom-left */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1 opacity-40">
            <div className="w-0.5 h-8 bg-orange-200" />
            <div className="w-8 h-0.5 bg-orange-200" />
          </div>
        </Link>
      </section>

      {/* STATIC VIDEO SECTION */}
      <section className=" mx-auto pb-20 px-12 bg-white py-14">
        <div className="max-w-screen-2xl mx-auto flex flex-col justify-center items-center text-center">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#803512]/60 mb-3">
            Experience the Land
          </p>
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl max-w-3xl mb-4 leading-[1.1] tracking-tight text-[#3a1208]">
            Journey through the heart of{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#803512]">Arnhem Land.</span>
              <span className="absolute left-0 bottom-1 w-full h-1.5 bg-[#803512]/15 rounded-full z-0" />
            </span>
          </h2>
          <p className="text-sm text-[#803512]/55 max-w-xl mb-10 leading-relaxed">
            Immerse yourself in the world's oldest living culture — ancient stories, sacred land, and timeless art.
          </p>
          <div className="relative max-w-5xl w-full h-120 rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/5Szjemb24QA?si=JsPlufnKMBD809G5"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </div>
      </section>

    </main>
  );
};

export default Page;
