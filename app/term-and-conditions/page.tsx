import React from "react";
import { FaFileSignature } from "react-icons/fa";

export default function Page() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <div className="relative min-h-[70vh]  overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Terms and Service</h1>
          <p className="text-lg max-w-2xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Facilis excepturi sed ab aut tempora vitae.
          </p>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-20 pt-10 px-6 md:px-16 max-w-screen-2xl mx-auto">

        {/* TABLE OF CONTENTS */}
        <aside className="w-full md:w-64 lg:w-72 h-fit md:sticky md:top-32">

          <h2 className="font-bold mb-4 text-2xl">Table of Contents</h2>

          <ul className="space-y-3 text-gray-800">
            {[
              { id: "introduction", label: "Introduction" },
              { id: "data-collection", label: "Data Collection" },
              { id: "types-of-data", label: "Types of Data" },
            ].map((item) => (
              <li
                key={item.id}
                className="bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition"
              >
                <a
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-4 py-2"
                >
                  <FaFileSignature size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">

          <h1 className="text-3xl font-bold mb-4">
            Welcome to our Terms & Services
          </h1>

          <p className="leading-relaxed mb-12">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatibus
            in repellat? Voluptatibus voluptas quam voluptates, libero, magni maiores
            vitae laboriosam natus quod quae dolorem veniam vero excepturi magnam id.
          </p>

          {/* INTRODUCTION */}
          <section id="introduction" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-2">Introduction</h2>
            <p className="leading-relaxed mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>Lorem ipsum dolor sit amet consectetur adipisicing elit.</li>
              <li>Sequi laboriosam aut consequatur maxime corrupti.</li>
              <li>Ratione itaque at amet neque doloremque aspernatur.</li>
            </ul>
          </section>

          {/* DATA COLLECTION */}
          <section id="data-collection" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-2">Data Collection</h2>
            <p className="leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            </p>
          </section>

          {/* TYPES OF DATA */}
          <section id="types-of-data" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-2">Types of Data</h2>
            <p className="leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
