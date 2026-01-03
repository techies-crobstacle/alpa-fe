import React from "react";
import Image from "next/image";

const Page = () => {
  return (
    <main className="min-h-screen bg-[url('/images/main-bg.png')] bg-repeat bg-center">
      {/* ================= HERO ================= */}
      <section>
        <div className="relative min-h-screen overflow-hidden bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-amber-900/30"></div>
          <div className="absolute inset-0 bg-black/30"></div>

          <div className="relative z-10 flex flex-col text-white px-6 py-32 md:px-24 md:py-44">
            <h1 className="text-4xl font-bold mb-2">Discover the Spirit of</h1>
            <h1 className="text-4xl font-bold mb-8 text-amber-100">
              Arnhem Land
            </h1>
            <p className="text-sm max-w-2xl">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ratione
              aspernatur assumenda asperiores, vitae corrupti minus voluptates
              placeat recusandae error velit rem eum vel similique iure odit.
              Libero doloremque pariatur perspiciatis expedita.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative bg-[url('/images/main-bg2.jpg')] bg-center p-8 md:p-10 rounded-4xl mx-4 md:mx-10 -mt-20 mb-15">
        <div className="flex flex-col w-full mb-16 md:mb-25">
          {/* Top banner section - FILLED WITH CONTENT */}
          <div className="bg-[#803512] h-80 w-full mb-16 rounded-4xl flex items-center justify-center text-white p-8">
            <div className="text-center max-w-3xl">
              <h1 className="text-4xl font-bold mb-6">Add Heading</h1>
              <p className="text-lg">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                Lorem Ipsum is a large text that has been used for printing and typesetting 
                industry, and also in many other parts. You can see this book.
              </p>
            </div>
          </div>

          {/* cards main div */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 text-white items-start">
            {/* CARD 1 */}
            <div
              className="relative w-full md:w-1/4 h-70 rounded-4xl overflow-hidden
                   bg-[url('/images/woodenfluet.jpg')] bg-cover bg-center grayscale"
            >
              <div className="absolute inset-0 bg-black/30"></div>

              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Add Heading</h1>
                <p className="text-sm opacity-90">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry
                  designer of dummy text, you'll sing to it, 50:0.
                </p>
              </div>
            </div>

            {/* CARD 2  */}
            <div
              className="relative w-full md:w-1/4 h-70 rounded-4xl overflow-hidden
                   bg-[url('/images/color-rock.jpg')] bg-cover bg-center grayscale"
            >
              <div className="absolute inset-0 bg-black/30"></div>

              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Add Heading</h1>
                <p className="text-sm opacity-90">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry
                  designer of dummy text, you'll sing to it, 50:0.
                </p>
              </div>
            </div>

            {/* BIG CARD */}
            <div
              className="relative w-full md:w-1/2 h-70 rounded-3xl overflow-hidden
                   bg-[url('/images/mid3.jpg')] bg-cover bg-center"
            >
              <div className="absolute inset-0 bg-black/35"></div>

              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h1 className="text-2xl md:text-3xl font-bold mb-3">Add Heading</h1>
                <p className="text-base opacity-95">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry
                  designer of dummy text, you'll sing to it, 50:0.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Video Section ================= */}
        <div className="flex flex-col justify-center items-center text-center mt-16">
          <h1 className="font-bold text-white text-xl md:text-2xl max-w-3xl mb-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
            <span className="text-amber-100">
              Eveniet officiis quasi sapiente optio esse corrupti Lorem ipsum
              dolor sit amet.!
            </span>
          </h1>
          <div className="relative w-full max-w-3xl h-64 md:h-96 rounded-4xl overflow-hidden">
            <Image
              src="/images/video-temp.jpg"
              alt="video-temp"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>
      </section>

      {/* Cultural Section */}
      <section className="flex flex-col md:flex-row gap-8 md:gap-16 px-6 md:px-16 py-12 md:py-20 items-end mb-20">
        {/* LEFT TEXT SECTION */}
        <div className="max-w-xl">
          <p className="text-sm font-medium leading-relaxed">
            Discover authentic Aboriginal products and experiences, each
            carrying stories passed down through thousands of generations
          </p>

          {/* Hand drawn line */}
          <svg className="mt-6 w-full h-6" viewBox="0 0 400 30" fill="none">
            <path
              d="M5 15 C60 5, 120 25, 180 15 C240 5, 300 25, 395 15"
              stroke="#000"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>

          <p className="mt-6 text-xl font-bold text-[#6B2C1A] mb-8 md:mb-60">01/07</p>

          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Explore our{" "}
            <span className="text-amber-900">Cultural Categories</span>
          </h1>
        </div>

        {/* RIGHT IMAGE CARDS */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-end">
          <div className="relative w-full md:w-90 h-64 md:h-130 rounded-4xl overflow-hidden">
            <Image
              src="/images/rock-bird.jpg"
              alt="Rock bird"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl px-6 py-4 text-center">
                <h1 className="text-lg font-bold text-black">
                  Bush Foods & Medicine
                </h1>
                <p className="text-sm text-black/70">
                  Traditional native foods and healing plants
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-90 h-64 md:h-130 rounded-4xl overflow-hidden">
            <Image
              src="/images/color-fly.jpg"
              alt="Color fly"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex justify-center items-start pt-6">
              <Image
                src="/images/butterfly.png"
                alt="Butterfly"
                width={192}
                height={192}
                className="w-32 md:w-48"
              />
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl px-6 py-4 text-center">
                <h1 className="text-lg font-bold text-black">
                  Bush Foods & Medicine
                </h1>
                <p className="text-sm text-black/70">
                  Traditional native foods and healing plants
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative w-full md:w-90 h-64 md:h-130 rounded-4xl overflow-hidden">
            <Image
              src="/images/boomerangs.jpg"
              alt="Boomerangs"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl px-6 py-4 text-center">
                <h1 className="text-lg font-bold text-black">
                  Bush Foods & Medicine
                </h1>
                <p className="text-sm text-black/70">
                  Traditional native foods and healing plants
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* White Sections - Add content here or remove if not needed */}
      <section className="bg-white py-20 md:py-90 w-full">
        {/* Add your white section content here */}
      </section>
      <section className="py-20 md:py-60 w-full">
        {/* Add your content here */}
      </section>
    </main>
  );
};

export default Page;


// fix navbar = fixed
// fix testimonials = fixed
// work on main page = done