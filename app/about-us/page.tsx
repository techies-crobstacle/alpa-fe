// "use client";
// import React from "react";
// import Image from "next/image";
// import Counter from "../components/about-us/counter";

// export default function Page() {
//   return (
//     <section className="bg-[#f3e9dd]">
//       {/* HERO SECTION */}
//       <div className="relative min-h-[70vh] overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center">
//         <div className="absolute inset-0 bg-black/50"></div>

//         <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-60 ">
//           <h1 className="text-5xl font-bold mb-2">About us</h1>
//           <p className="text-lg max-w-2xl">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis
//             excepturi sed ab aut tempora vitae.
//           </p>
//         </div>
//       </div>

//       {/* Photo section with content */}
//       <section className="bg-[#F4E9DC] ">
//         {/* CONTENT SECTION */}
//         <div className=" gap-20 pt-20 px-6 md:px-16">
//           {/* Content section 1.0 */}
//           <p className="w-129 h-29 text-[20px] font-inter">
//             Lorem Ipsum is simply dummy text of the printing and typesetting
//             industry. Lorem Ipsum has been the industry's standard dummy text
//             ever since the 1500s
//           </p>

//           <div className="flex flex-col justify-center items-center  -mt-25 ml-20 p-12">
//             <Image
//               src="/images/group-images.png"
//               alt="Image"
//               width={500}
//               height={500}
//               className="w-280"
//             ></Image>
//           </div>
//         </div>
//       </section>

//       {/* Challenges Section */}
//       <section className="flex bg-[#F2F2F2] items-start px-24 py-15 gap-32 max-w-screen-2xl mx-auto">
//         {/* LEFT CONTENT */}
//         <div className="w-1/2">
//           <p className="text-sm mb-6">The Challenge</p>
//           <h1 className="font-bold text-5xl leading-tight">What we Offer</h1>
//         </div>

//         {/* RIGHT CONTENT */}
//         <div className="w-1/2">
//           <p className="font-semibold text-2xl leading-relaxed mb-8">
//             Lorem ipsum is simply dummy text of the printing and typesetting
//             industry. Lorem Ipsum has been the industry's standard dummy text
//             ever since the 1500s
//           </p>

//           <p className="text-base leading-relaxed text-gray-700">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore
//             officiis enim quas voluptas, dolores sit facere. Excepturi quasi
//             libero suscipit molestiae consectetur provident officia ratione
//             maiores aliquid fugit sequi eos.
//           </p>
//         </div>
//       </section>

//       <hr />

//       {/* statistics Sections  */}
//       <section className="flex md:flex-row flex-col items-start px-24 py-28 gap-32 max-w-screen-2xl mx-auto">
//         <div className="w-1/4">
//           <h1 className="font-bold text-4xl mb-1">
//             <Counter end={8000} suffix="+" />
//           </h1>
//           <h1 className="font-bold text-xl">This is heading</h1>
//           <p className="text-sm">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
//             deserunt nihil minima doloremque vitae facilis modi commodi
//             accusantium voluptas!
//           </p>
//         </div>
//         <div className="w-1/4">
//           <h1 className="font-bold text-4xl mb-1">
//             <Counter end={12000} suffix="+" />
//           </h1>
//           <h1 className="font-bold text-xl">This is heading</h1>
//           <p className="text-sm">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
//             deserunt nihil minima doloremque vitae facilis modi commodi
//             accusantium voluptas!
//           </p>
//         </div>
//         <div className="w-1/4">
//           <h1 className="font-bold text-4xl mb-1">
//             <Counter end={30000} suffix="+" />
//           </h1>
//           <h1 className="font-bold text-xl">This is heading</h1>
//           <p className="text-sm">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
//             deserunt nihil minima doloremque vitae facilis modi commodi
//             accusantium voluptas!
//           </p>
//         </div>
//         <div className="w-1/4">
//           <h1 className="font-bold text-4xl mb-1">
//             <Counter end={50000} suffix="+" />
//           </h1>
//           <h1 className="font-bold text-xl">This is heading</h1>
//           <p className="text-sm">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
//             deserunt nihil minima doloremque vitae facilis modi commodi
//             accusantium voluptas!
//           </p>
//         </div>
//       </section>

//       {/* Last Section */}
//       <section className="flex flex-row justify-center items-center gap-30 bg-[#F2F2F2]">
//         {/* LEFT CONTENT */}
//         <div className="basis-1/2 ">
//           <div className="font-serif px-10 py-8">
//             <p className="mb-2 font-light">The Challenge</p>
//             <h1 className="font-bold mb-10 text-2xl">What we Offer</h1>
//             <p className="text-md font-light">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae
//               reprehenderit commodi, nesciunt quo ad libero maxime nam
//               excepturi, perferendis saepe officiis atque voluptate corrupti, in
//               quasi molestiae. Neque saepe earum dolorum numquam expedita
//               recusandae necessitatibus molestiae amet. Facere dolor alias
//               officia, in voluptatem perspiciatis. In quisquam nostrum totam
//               aperiam eum.
//             </p>
//             <br />
//             <p className="mb-8 text-md">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae
//               reprehenderit commodi, nesciunt quo ad libero maxime nam
//               excepturi, perferendis saepe officiis atque voluptate corrupti, in
//               quasi molestiae. Neque saepe earum dolorum numquam expedita
//               recusandae necessitatibus molestiae amet. Facere dolor alias
//               officia, in voluptatem perspiciatis. In quisquam nostrum totam
//               aperiam eum.
//             </p>
//             <button className="bg-[#440C03] text-white rounded-4xl py-2 px-15 mb-5">
//               Read More →
//             </button>
//           </div>
//         </div>

//         {/* RIGHT CONTENT */}
//         <div className="basis-1/2 ">
//           <Image
//             src="/images/about-us-what-we-offer.jpg"
//             alt="about-us-what-we-offer"
//             width={500}
//             height={500}
//             className="object-cover w-full"
//           />
//         </div>
//       </section>
//       {/* Empty Section */}
//       <section className="h-screen"></section>
//     </section>
//   );
// }


"use client";
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";

// Counter Component
type CounterProps = {
  end: number;
  suffix?: string;
};  

function Counter({ end, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

export default function Page() {
  return (
    <section className="bg-[#f3e9dd]">
      {/* HERO SECTION */}
      <div className="relative min-h-[70vh] overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center">
         <div className="absolute inset-0 bg-black/50"></div>

         <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-60 ">
           <h1 className="text-5xl font-bold mb-2">About us</h1>
           <p className="text-lg max-w-2xl">
             Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis
             excepturi sed ab aut tempora vitae.
           </p>
         </div>
       </div>
      {/* Photo section with content */}
      <section className="bg-[#F4E9DC] ">
        {/* CONTENT SECTION */}
        <div className=" gap-20 pt-20 px-6 md:px-16">
          {/* Content section 1.0 */}
          <p className="w-129 h-29 text-[20px] font-inter">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s
          </p>

          <div className="flex flex-col justify-center items-center  -mt-25 ml-20 p-12">
            <Image
              src="/images/about2.png"
              alt="Image"
              width={500}
              height={500}
              className="w-280"
            />
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="flex flex-col lg:flex-row bg-[#F2F2F2] items-start px-6 md:px-24 py-12 md:py-15 gap-8 lg:gap-32 mx-auto">
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2">
          <p className="text-sm mb-4 md:mb-6">The Challenge</p>
          <h1 className="font-bold text-3xl md:text-5xl leading-tight">What we Offer</h1>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full lg:w-1/2">
          <p className="font-semibold text-xl md:text-2xl leading-relaxed mb-6 md:mb-8">
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

      <hr className="border-gray-300" />

      {/* Statistics Sections */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 px-6 md:px-24 py-16 md:py-28 max-w-screen-2xl mx-auto">
        <div className="text-center lg:text-left">
          <h1 className="font-bold text-3xl md:text-4xl mb-1">
            <Counter end={8000} suffix="+" />
          </h1>
          <h1 className="font-bold text-lg md:text-xl mb-2">This is heading</h1>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
            deserunt nihil minima doloremque vitae facilis modi commodi
            accusantium voluptas!
          </p>
        </div>
        <div className="text-center lg:text-left">
          <h1 className="font-bold text-3xl md:text-4xl mb-1">
            <Counter end={12000} suffix="+" />
          </h1>
          <h1 className="font-bold text-lg md:text-xl mb-2">This is heading</h1>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
            deserunt nihil minima doloremque vitae facilis modi commodi
            accusantium voluptas!
          </p>
        </div>
        <div className="text-center lg:text-left">
          <h1 className="font-bold text-3xl md:text-4xl mb-1">
            <Counter end={30000} suffix="+" />
          </h1>
          <h1 className="font-bold text-lg md:text-xl mb-2">This is heading</h1>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
            deserunt nihil minima doloremque vitae facilis modi commodi
            accusantium voluptas!
          </p>
        </div>
        <div className="text-center lg:text-left">
          <h1 className="font-bold text-3xl md:text-4xl mb-1">
            <Counter end={50000} suffix="+" />
          </h1>
          <h1 className="font-bold text-lg md:text-xl mb-2">This is heading</h1>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut fugit
            deserunt nihil minima doloremque vitae facilis modi commodi
            accusantium voluptas!
          </p>
        </div>
      </section>

      {/* Last Section */}
      <section className="flex flex-col lg:flex-row justify-center items-center bg-[#F2F2F2]">
        {/* LEFT CONTENT */}
        <div className="w-full lg:basis-1/2 order-2 lg:order-1">
          <div className="font-serif px-6 md:px-10 py-8">
            <p className="mb-2 font-light">The Challenge</p>
            <h1 className="font-bold mb-6 md:mb-10 text-xl md:text-2xl">What we Offer</h1>
            <p className="text-sm md:text-md font-light mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae
              reprehenderit commodi, nesciunt quo ad libero maxime nam
              excepturi, perferendis saepe officiis atque voluptate corrupti, in
              quasi molestiae. Neque saepe earum dolorum numquam expedita
              recusandae necessitatibus molestiae amet. Facere dolor alias
              officia, in voluptatem perspiciatis. In quisquam nostrum totam
              aperiam eum.
            </p>
            <p className="mb-6 md:mb-8 text-sm md:text-md">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae
              reprehenderit commodi, nesciunt quo ad libero maxime nam
              excepturi, perferendis saepe officiis atque voluptate corrupti, in
              quasi molestiae. Neque saepe earum dolorum numquam expedita
              recusandae necessitatibus molestiae amet. Facere dolor alias
              officia, in voluptatem perspiciatis. In quisquam nostrum totam
              aperiam eum.
            </p>
            <button className="bg-[#440C03] text-white rounded-full py-2 px-8 md:px-15 mb-5 hover:bg-[#5a1004] transition-colors">
              Read More →
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full lg:basis-1/2 order-1 lg:order-2">
          <Image
            src="/images/about-us-what-we-offer.jpg"
            alt="about-us-what-we-offer"
            className="object-cover w-full h-64 md:h-auto"
            width={500}
            height={500}
          />
        </div>
      </section>

      {/* Empty Section */}
      <section className="h-32 md:h-screen"></section>
    </section>
  );
}