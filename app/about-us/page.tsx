"use client"
import React from "react";
import Image from "next/image";
import Counter from "../components/about-us/counter";



export default function Page() {
    
  return (
    <>
      <section className="bg-[#ebe2d5]">
        {/* HERO SECTION */}
        <div className="relative min-h-[70vh] overflow-hidden bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-60 ">
            <h1 className="text-6xl font-bold mb-6">About Us</h1>
            <p className="text-sm max-w-2xl">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ratione
              aspernatur assumenda asperiores, vitae corrupti minus voluptates
              placeat recusandae error velit rem eum vel similique iure odit.
              Libero doloremque pariatur perspiciatis expedita maxime adipisci
              placeat ipsum, esse ducimus aut laboriosam rem.
            </p>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className=" gap-20 pt-20 px-6 md:px-16">
          {/* Content section 1.0 */}
          <p className="w-120 text-2xl  font-inter">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s
          </p>

          <div className="flex flex-col justify-center items-center -mt-20">
            <Image
              src="/images/aboutusimage.png"
              alt="Image"
              width={500}
              height={500}
              className="w-270"
            ></Image>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="flex items-start px-24 py-15 gap-32">
        {/* LEFT CONTENT */}
        <div className="w-1/2">
          <p className="text-sm mb-6">The Challenge</p>
          <h1 className="font-bold text-5xl leading-tight">What we Offer</h1>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-1/2">
          <p className="font-semibold text-2xl leading-relaxed mb-8">
            Lorem ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s
          </p>

          <p className="text-base leading-relaxed text-gray-700">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore
            officiis enim quas voluptas, dolores sit facere. Excepturi quasi
            libero suscipit molestiae consectetur provident officia ratione
            maiores aliquid fugit sequi eos.
          </p>
        </div>
      </section>

      <hr />

      {/* statistics Sections  */}
      <section className="flex items-start px-24 py-28 gap-32">
        <div className="w-1/4">
          <h1 className="font-bold text-4xl mb-1">
            <Counter end={8000} suffix="+" />
          </h1>
          <h1 className="font-bold text-xl">This is heading</h1>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
            deserunt nihil minima doloremque vitae facilis modi commodi
            accusantium voluptas!
          </p>
        </div>
        <div className="w-1/4">
          <h1 className="font-bold text-4xl mb-1">
            <Counter end={12000} suffix="+" />
          </h1>
          <h1 className="font-bold text-xl">This is heading</h1>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
            deserunt nihil minima doloremque vitae facilis modi commodi
            accusantium voluptas!
          </p>
        </div>
        <div className="w-1/4">
          <h1 className="font-bold text-4xl mb-1">
             <Counter end={30000} suffix="+" />
          </h1>
          <h1 className="font-bold text-xl">This is heading</h1>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
            deserunt nihil minima doloremque vitae facilis modi commodi
            accusantium voluptas!
          </p>
        </div>
        <div className="w-1/4">
          <h1 className="font-bold text-4xl mb-1">
            <Counter end={50000} suffix="+" />
          </h1>
          <h1 className="font-bold text-xl">This is heading</h1>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
            deserunt nihil minima doloremque vitae facilis modi commodi
            accusantium voluptas!
          </p>
        </div>
      </section>

      {/* Last Section */}
      <section className="flex flex-row justify-center items-center gap-20 bg-[#F2F2F2]">
        {/* LEFT CONTENT */}
        <div className="w-1/2 px-20 ">
          <div className="font-serif">
            <p className="mb-5">The Challenge</p>
            <h1 className="font-bold mb-10 text-4xl">What we Offer</h1>
            <p className="text-lg">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae
              reprehenderit commodi, nesciunt quo ad libero maxime nam
              excepturi, perferendis saepe officiis atque voluptate corrupti, in
              quasi molestiae. Neque saepe earum dolorum numquam expedita
              recusandae necessitatibus molestiae amet. Facere dolor alias
              officia, in voluptatem perspiciatis. In quisquam nostrum totam
              aperiam eum.
            </p>
            <br />
            <p className="mb-8 text-lg">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae
              reprehenderit commodi, nesciunt quo ad libero maxime nam
              excepturi, perferendis saepe officiis atque voluptate corrupti, in
              quasi molestiae. Neque saepe earum dolorum numquam expedita
              recusandae necessitatibus molestiae amet. Facere dolor alias
              officia, in voluptatem perspiciatis. In quisquam nostrum totam
              aperiam eum.
            </p>
            <button className="bg-[#440C03] text-white rounded-4xl py-2 px-15">
              Read More →
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-1/2">
          <Image
            src="/images/about-us-what-we-offer.jpg"
            alt="about-us-what-we-offer"
            width={500}
            height={500}
            className="object-cover w-full"
          />
        </div>
      </section>
    </>
  );
}
