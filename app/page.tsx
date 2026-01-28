import React from "react";
import Image from "next/image";

const Page = () => {
  return (
    <main className="min-h-screen bg-[url('/images/main-bg.png')] bg-repeat bg-center">
      {/* ================= HERO ================= */}
      <section>
        <div className="relative min-h-screen overflow-hidden bg-[url('/images/main.jpg')] bg-cover bg-center bg-fixed">
          <div className="absolute inset-0 bg-linear-to-b from-amber-900/20 via-amber-900/30 to-black/40"></div>

          <div className="relative z-10 flex flex-col justify-center text-white px-4 sm:px-6 lg:px-24 py-32 md:py-40 lg:py-60">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Discover the Spirit of</h1>
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 md:mb-8 text-amber-100">
              Arnhem Land
            </h1>
            <p className="text-sm sm:text-base max-w-2xl">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ratione
              aspernatur assumenda asperiores, vitae corrupti minus voluptates
              placeat recusandae error velit rem eum vel similique iure odit.
              Libero doloremque pariatur perspiciatis expedita.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative bg-[url('/images/main-bg2.jpg')] bg-center bg-cover p-4 sm:p-6 lg:p-10 rounded-2xl lg:rounded-4xl mx-2 sm:mx-4 lg:mx-10 -mt-8 sm:-mt-12 lg:-mt-20 mb-8 lg:mb-16">
        <div className="flex flex-col w-full mb-8 sm:mb-12 lg:mb-20">
          {/* Top banner section - FILLED WITH CONTENT */}
          <div className="bg-linear-to-r from-[#803512] to-[#a0451a] min-h-60 sm:min-h-70 lg:h-80 w-full mb-8 sm:mb-12 lg:mb-16 rounded-2xl lg:rounded-4xl flex items-center justify-center text-white p-6 sm:p-8 lg:p-10">
            <div className="text-center max-w-4xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight">Add Heading</h2>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl opacity-95 leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                Lorem Ipsum is a large text that has been used for printing and typesetting 
                industry, and also in many other parts. You can see this book.
              </p>
            </div>
          </div>

          {/* cards main div */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-white">
            {/* CARD 1 */}
            <div
              className="relative col-span-1 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden
                   bg-[url('/images/woodenfluet.jpg')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-black/30"></div>

              <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col justify-end">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Add Heading</h1>
                <p className="text-xs sm:text-sm opacity-90">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry
                  designer of dummy text, you'll sing to it, 50:0.
                </p>
              </div>
            </div>

            {/* CARD 2  */}
            <div
              className="relative col-span-1 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden
                   bg-[url('/images/color-rock.jpg')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>

              <div className="relative z-10 p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-end">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 lg:mb-3 leading-tight">Add Heading</h3>
                <p className="text-xs sm:text-sm lg:text-base opacity-90 leading-relaxed line-clamp-4">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry
                  designer of dummy text, you'll sing to it, 50:0.
                </p>
              </div>
            </div>

            {/* BIG CARD */}
            <div
              className="relative col-span-1 md:col-span-2 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden
                   bg-[url('/images/mid3.jpg')] bg-cover bg-center hover:scale-[1.02] transition-all duration-500"
            >
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent"></div>

              <div className="relative z-10 p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-end">
                <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 lg:mb-4 leading-tight">Add Heading</h3>
                <p className="text-sm sm:text-base lg:text-lg opacity-95 leading-relaxed line-clamp-3">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry
                  designer of dummy text, you'll sing to it, 50:0.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Video Section ================= */}
        <div className="flex flex-col justify-center items-center text-center mt-12 sm:mt-16 lg:mt-20">
          <h2 className="font-bold text-white text-lg sm:text-xl lg:text-2xl xl:text-3xl max-w-4xl mb-6 lg:mb-8 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
            <span className="text-amber-100">
              Eveniet officiis quasi sapiente optio esse corrupti Lorem ipsum
              dolor sit amet.!
            </span>
          </h2>
          <div className="relative w-full max-w-5xl h-48 sm:h-64 lg:h-96 xl:h-112 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/images/video-temp.jpg"
              alt="Aboriginal cultural video preview"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1280px) 80vw, 70vw"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Cultural Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 px-4 sm:px-6 lg:px-16 xl:px-20 py-12 sm:py-16 lg:py-24 items-end mb-12 sm:mb-20">
        {/* LEFT TEXT SECTION */}
        <div className="max-w-2xl">
          <p className="text-sm sm:text-base lg:text-lg font-medium leading-relaxed text-gray-700">
            Discover authentic Aboriginal products and experiences, each
            carrying stories passed down through thousands of generations
          </p>

          {/* Hand drawn line */}
          <svg className="mt-6 lg:mt-8 w-full h-6 lg:h-8" viewBox="0 0 400 30" fill="none">
            <path
              d="M5 15 C60 5, 120 25, 180 15 C240 5, 300 25, 395 15"
              stroke="#6B2C1A"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </svg>

          <p className="mt-6 lg:mt-8 text-lg sm:text-xl lg:text-2xl font-bold text-[#6B2C1A] mb-8 lg:mb-12">01/07</p>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
            Explore our{" "}
            <span className="text-amber-900">Cultural Categories</span>
          </h2>
        </div>

        {/* RIGHT IMAGE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
          <div className="relative h-64 sm:h-72 lg:h-80 xl:h-96 rounded-2xl lg:rounded-3xl overflow-hidden group cursor-pointer">
            <Image
              src="/images/rock-bird.jpg"
              alt="Traditional Aboriginal rock art featuring birds"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent group-hover:from-black/60 transition-all duration-300"></div>

            <div className="absolute bottom-4 lg:bottom-6 left-4 lg:left-6 right-4 lg:right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="bg-white/95 backdrop-blur-md rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 text-center shadow-lg">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1">
                  Bush Foods & Medicine
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Traditional native foods and healing plants
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-64 sm:h-72 lg:h-80 xl:h-96 rounded-2xl lg:rounded-3xl overflow-hidden group cursor-pointer">
            <Image
              src="/images/color-fly.jpg"
              alt="Colorful Aboriginal art with butterfly motifs"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
            <div className="absolute inset-0 flex justify-center items-start pt-6 lg:pt-8">
              <div className="relative w-20 sm:w-24 lg:w-32 xl:w-40 h-20 sm:h-24 lg:h-32 xl:h-40 group-hover:scale-110 transition-transform duration-500">
                <Image
                  src="/images/butterfly.png"
                  alt="Traditional Aboriginal butterfly design"
                  fill
                  className="object-contain drop-shadow-lg"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="absolute bottom-4 lg:bottom-6 left-4 lg:left-6 right-4 lg:right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="bg-white/95 backdrop-blur-md rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 text-center shadow-lg">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1">
                  Bush Foods & Medicine
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Traditional native foods and healing plants
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative h-64 sm:h-72 lg:h-80 xl:h-96 rounded-2xl lg:rounded-3xl overflow-hidden group cursor-pointer">
            <Image
              src="/images/boomerangs.jpg"
              alt="Traditional handcrafted Aboriginal boomerangs"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent group-hover:from-black/60 transition-all duration-300"></div>

            <div className="absolute bottom-4 lg:bottom-6 left-4 lg:left-6 right-4 lg:right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="bg-white/95 backdrop-blur-md rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 text-center shadow-lg">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1">
                  Bush Foods & Medicine
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Traditional native foods and healing plants
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder Sections - Optimized */}
      <section className="bg-white py-16 sm:py-20 lg:py-32 w-full" aria-label="Content section">
        {/* Add your white section content here */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-20 lg:py-28 w-full" aria-label="Additional content section">
        {/* Add your content here */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-24 bg-gray-50 rounded-lg"></div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;