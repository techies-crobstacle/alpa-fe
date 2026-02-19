// "use client";
// import React from "react";
// import Image from "next/image";
// import Testimonials from "@/components/cards/Testimonials";

// export default function Page() {
//   return (
//     <>
//       {/* Hero Section */}
//       <section className="bg-[#ebe2d5]">
//         {/* HERO SECTION */}
//         <div className="relative min-h-[70vh] overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center ">
//         <div className="absolute inset-0 bg-black/50"></div>

//         <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-60 ">
//           <h1 className="text-5xl font-bold mb-2">Contact Us</h1>
//           <p className="text-lg max-w-2xl">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit.
//             Facilis excepturi sed ab aut tempora vitae.
//           </p>
//         </div>
//       </div>
//       </section>

//       {/* Map and Form section */}
//       <section className="flex items-start my-16 px-14 gap-24 max-w-screen-2xl mx-auto">
//         {/* LEFT FORM */}
//         <div className="w-3/5">
//           <form className="space-y-6">
//             {/* ROW 1: TWO INPUTS */}
//             <div className="flex gap-6">
//               <input
//                 type="text"
//                 placeholder="Enter your Name *"
//                 required
//                 className="w-1/2 bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
//               />

//               <input
//                 type="text"
//                 placeholder="Enter your Phone"
//                 className="w-1/2 bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
//               />
//             </div>

//             {/* ROW 2: EMAIL (FULL WIDTH) */}
//             <input
//               type="email"
//               placeholder="Enter your Email Address *"
//               required
//               className="w-full bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
//             />

//             {/* ROW 3: MESSAGE */}
//             <textarea
//               placeholder="Enter your Message *"
//               required
//               rows={5}
//               className="w-full bg-[#F1E4D3] px-6 py-4 rounded-3xl outline-none resize-none"
//             />

//             {/* SUBMIT BUTTON */}
//             <button
//               type="submit"
//               className="bg-[#3b0f06] text-white px-20 py-2 rounded-full font-medium"
//             >
//               Submit
//             </button>
//           </form>
//         </div>

//         {/* RIGHT IMAGE */}
//         <div className="w-2/5">
//           <div className="w-full h-105 rounded-3xl overflow-hidden">
//             <iframe
//               src="https://www.google.com/maps?q=India&z=5&output=embed"
//               className="w-full h-full border-0"
//               loading="lazy"
//               referrerPolicy="no-referrer-when-downgrade"
//             ></iframe>
//           </div>
//         </div>
//       </section>

//       {/* User Reviews / Testimonials */}
//       <section className="flex items-start py-14 gap-16 ">
//         <Testimonials />
//       </section>

//       {/* Explore Section*/}
//       <section className="pb-12 text-white max-w-screen-2xl mx-auto">
//         <div className="relative bg-[url('/images/contact-us.jpg')] bg-cover bg-center h-120 w-full rounded-3xl overflow-hidden flex flex-col justify-center items-center">
//           {/* BLACK OVERLAY */}
//           <div className="absolute inset-0 bg-black/30"></div>

//           {/* CONTENT */}
//           <Image
//             src="/images/navbarLogo.png"
//             alt="Logo"
//             height={200}
//             width={200}
//             className="relative z-10 w-20"
//           />

//           <h1 className="relative z-10 text-4xl font-bold mb-5">
//             Enter Heading Here
//           </h1>
//           <p className="  z-30 w-170 text-center  items-center justify-center mb-5">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis
//             tenetur quam voluptatibus numquam inventore officiis quibusdam,
//             nesciunt sit optio quidem Lorem, ipsum dolor. Lorem ipsum dolor
//             consectetur.!
//           </p>

//           <button className="z-30 px-14 py-2.5 rounded-4xl bg-[#d3b994] text-[#582419]">
//             Explore Marketplace
//           </button>
//         </div>
//       </section>
//     </>
//   );
// }


"use client";
import React from "react";
import Image from "next/image";
import Testimonials from "@/components/cards/Testimonials";
// Ensure you have lucide-react installed: npm install lucide-react
import { MapPin, Phone, Mail, Send, ArrowRight } from "lucide-react";

export default function Page() {
  return (
    <main className="bg-[#ebe2d5] min-h-screen font-sans">
      
      {/* --- HERO SECTION --- */}
      {/* Added a subtle gradient overlay for better text readability */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/main.png')] bg-cover bg-center animate-slow-zoom">
            <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <span className="mb-4 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-sm font-medium backdrop-blur-md">
             We'd love to hear from you
          </span>
          <h1 className="text-6xl font-bold mb-6 tracking-tight">Contact Us</h1>
          <p className="text-base text-gray-200 max-w-2xl leading-relaxed">
            Have a question or need assistance? Reach out to our team and we'll get back to you shortly.
          </p>
        </div>
      </section>

      {/* We pull this section UP to overlap the hero for a modern look (-mt-20) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 mb-20">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* LEFT: THE FORM (Takes up 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#3b0f06]/5">
            <h2 className="text-3xl font-bold text-[#3b0f06] mb-2">Send us a message</h2>
            <p className="text-gray-500 mb-8">Fill out the form below and our team will get back to you within 24 hours.</p>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600 ml-1">Full Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[#3b0f06]/20 focus:border-[#3b0f06] transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600 ml-1">Phone Number</label>
                    <input
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[#3b0f06]/20 focus:border-[#3b0f06] transition-all"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 ml-1">Email Address</label>
                <input
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[#3b0f06]/20 focus:border-[#3b0f06] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 ml-1">Message</label>
                <textarea
                    placeholder="How can we help you?"
                    required
                    rows={6}
                    className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-xl outline-none resize-none focus:ring-2 focus:ring-[#3b0f06]/20 focus:border-[#3b0f06] transition-all"
                />
              </div>

              <button
                type="submit"
                className="group flex items-center justify-center gap-2 w-full md:w-auto bg-[#3b0f06] text-white px-10 py-4 rounded-xl font-semibold hover:bg-[#582419] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Send Message
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* RIGHT: CONTACT INFO & MAP (Takes up 1 col) */}
          <div className="space-y-8">
            
            {/* Contact Details Card */}
            <div className="bg-[#3b0f06] text-[#ebe2d5] rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-6">Contact Info</h3>
                
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <MapPin className="w-6 h-6 text-[#d3b994]" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Our Location</p>
                            <p className="text-sm text-white/70 leading-relaxed mt-1">
                                123 Business Avenue,<br />
                                Suite 400, New York, NY 10012
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <Phone className="w-6 h-6 text-[#d3b994]" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Phone Number</p>
                            <p className="text-sm text-white/70 mt-1">+1 (800) 123-4567</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <Mail className="w-6 h-6 text-[#d3b994]" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Email Address</p>
                            <p className="text-sm text-white/70 mt-1">support@yourdomain.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Widget */}
            <div className="h-80 w-full rounded-3xl overflow-hidden shadow-lg border-4 border-white">
               <iframe
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.98!3d40.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40zMCcxNS42Ilc!5e0!3m2!1sen!2sus!4v1234567890"
                 className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* --- EXPLORE SECTION --- */}
      <section className="pb-12 px-4">
        <div className="max-w-7xl mx-auto relative bg-[url('/images/contact-us.jpg')] bg-cover bg-center h-[500px] w-full rounded-[2.5rem] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 transition-opacity duration-500"></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              height={120}
              width={120}
              className="w-24 mb-6 drop-shadow-lg"
            />

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 transform transition-transform duration-500 group-hover:-translate-y-2">
              Ready to get started?
            </h1>
            <p className="text-gray-200 max-w-xl mb-8 leading-relaxed">
               Discover our marketplace and find exactly what you need with our curated collection of premium items.
            </p>

            <button className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#d3b994] text-[#3b0f06] font-bold hover:bg-white transition-all duration-300 shadow-lg hover:shadow-orange-500/20">
              Explore Marketplace
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}