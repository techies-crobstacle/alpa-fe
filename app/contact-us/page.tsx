"use client";
import React from "react";
import Image from "next/image";
import Testimonials from "../components/cards/Testimonials";

export default function Page() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#ebe2d5]">
        {/* HERO SECTION */}
        <div className="relative min-h-[70vh] overflow-hidden bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-60 ">
            <h1 className="text-6xl font-bold mb-6">Contact Us</h1>
            <p className="text-sm max-w-2xl">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ratione
              aspernatur assumenda asperiores, vitae corrupti minus voluptates
              placeat recusandae error velit rem eum vel similique iure odit.
              Libero doloremque pariatur perspiciatis expedita maxime adipisci
              placeat ipsum, esse ducimus aut laboriosam rem.
            </p>
          </div>
        </div>
      </section>

      {/* Map and Form section */}
      <section className="flex items-start mt-10 mb-10 px-14 gap-24 max-w-screen-2xl mx-auto">
        {/* LEFT FORM */}
        <div className="w-3/5">
          <form className="space-y-6">
            {/* ROW 1: TWO INPUTS */}
            <div className="flex gap-6">
              <input
                type="text"
                placeholder="Enter your Name *"
                required
                className="w-1/2 bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
              />

              <input
                type="text"
                placeholder="Enter your Phone"
                className="w-1/2 bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
              />
            </div>

            {/* ROW 2: EMAIL (FULL WIDTH) */}
            <input
              type="email"
              placeholder="Enter your Email Address *"
              required
              className="w-full bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
            />

            {/* ROW 3: MESSAGE */}
            <textarea
              placeholder="Enter your Message *"
              required
              rows={5}
              className="w-full bg-[#F1E4D3] px-6 py-4 rounded-3xl outline-none resize-none"
            />

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="bg-[#3b0f06] text-white px-20 py-2 rounded-full font-medium"
            >
              Submit
            </button>
          </form>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-2/5">
          <div className="w-full h-105 rounded-3xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps?q=India&z=5&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* User Reviews / Testimonials */}
      <section className="flex items-start py-14 gap-16 ">
        <Testimonials />
      </section>

      {/* Explore Section*/}
      <section className="pb-12 text-white max-w-screen-2xl mx-auto">
        <div className="relative bg-[url('/images/contact-us.jpg')] bg-cover bg-center h-120 w-full rounded-3xl overflow-hidden flex flex-col justify-center items-center">
          {/* BLACK OVERLAY */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* CONTENT */}
          <Image
            src="/images/navbarLogo.png"
            alt="Logo"
            height={200}
            width={200}
            className="relative z-10 w-20"
          />

          <h1 className="relative z-10 text-4xl font-bold mb-5">
            Enter Heading Here
          </h1>
          <p className="  z-30 w-170 text-center  items-center justify-center mb-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis tenetur quam voluptatibus numquam inventore officiis quibusdam, nesciunt sit optio quidem  Lorem, ipsum dolor. Lorem ipsum dolor  consectetur.!</p>

          <button className="z-30 px-14 py-2.5 rounded-4xl bg-[#d3b994] text-[#582419]">Explore Marketplace</button>
        </div>
      </section>
    </>
  );
}
