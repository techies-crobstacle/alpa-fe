import React from "react";
import { FaFileSignature } from "react-icons/fa";

export default function Page() {
  return (
    <div className="bg-[#f3e9dd] p-4">

      {/* HERO SECTION */}
      <div className="relative min-h-[70vh] rounded-2xl overflow-hidden bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-60 ">
          <h1 className="text-5xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-lg max-w-2xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Facilis excepturi sed ab aut tempora vitae.
          </p>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="flex flex-col md:flex-row gap-20 pt-20 px-6 md:px-16">

        {/* TABLE OF CONTENTS */}
        {/* TABLE OF CONTENTS */}
        <aside className="md:w-[220px] h-fit">

          <h2 className="font-bold mb-4 text-2xl">Table of Contents</h2>

          <ul className="space-y-2 text-gray-800 flex flex-col gap-2">
            <li className=" bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition">
              <a
                href="#introduction"
                className="flex items-center gap-3 px-4 py-2 block no-underline hover:no-underline"
              >
                <FaFileSignature size={18} />
                <span>Introduction</span>
              </a>
            </li>

            <li className=" bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition">
              <a
                href="#data-collection"
                className="flex items-center gap-3 px-4 py-2 block no-underline hover:no-underline"
              >
                <FaFileSignature size={18} />
                <span>Data Collection</span>
              </a>
            </li>

            <li className=" bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition">
              <a
                href="#types-of-data"
                className="flex items-center gap-3 px-4 py-2 block no-underline hover:no-underline"
              >
                <FaFileSignature size={18} />
                <span>Types of Data</span>
              </a>
            </li>
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        {/* MAIN CONTENT */}
      <main className="flex-1">


          <h1 className="text-3xl font-bold mb-4">
            Welcome to our Privacy Policy
          </h1>

          <p className="mb-10 leading-relaxed mb-12">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatibus
            in repellat? Voluptatibus voluptas quam voluptates, libero, magni maiores
            vitae laboriosam natus quod quae dolorem veniam vero excepturi magnam id.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio enim voluptatum distinctio placeat quisquam expedita ut incidunt, ea recusandae accusamus culpa error minus! Molestias repellat esse soluta similique quidem obcaecati sapiente, voluptatum libero. Et mollitia rem veniam hic tempora. Placeat ea quos eum id cum rerum adipisci quasi dolore qui.
          </p>

          {/* INTRODUCTION */}
          <section id="introduction" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-2">Introduction</h2>
            <p className="leading-relaxed mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae
              expedita id inventore obcaecati minima.  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad alias numquam voluptate sunt et quos voluptates vel saepe repellat blanditiis!
            </p>

            <h4 className="font-bold mb-2">Additional Points</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Lorem ipsum dolor sit amet consectetur adipisicing Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt, atque? elit.</li>
              <li>Sequi  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Similique, iure.laboriosam aut consequatur maxime corrupti.</li>
              <li>Ratione Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, eum. itaque at amet neque doloremque aspernatur.</li>
            </ul>
          </section>

          {/* DATA COLLECTION */}
          <section id="data-collection" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-2">Data Collection</h2>
            <p className="leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur,
              accusamus eum consectetur magni excepturi voluptate alias. Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum obcaecati aspernatur cupiditate est eum fugit porro? Ex vero labore atque ipsa, minima ducimus accusamus tempore delectus ut quia officia voluptas, enim consequatur dicta inventore quasi velit rerum recusandae aut possimus quam. Fugiat labore ex excepturi velit autem vel veniam voluptate officiis. Possimus molestias deleniti ab aperiam, blanditiis voluptates itaque maiores.
            </p>
          </section>

          {/* TYPES OF DATA */}
          <section id="types-of-data" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-2">Types of Data</h2>
            <p className="leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium,
              facilis? Nisi inventore beatae amet nam Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur quam porro modi possimus libero soluta dolor pariatur dolore culpa, nulla cumque illo? Minus alias voluptatibus excepturi omnis, autem iure reprehenderit sapiente blanditiis quisquam exercitationem quam error! Consequuntur eligendi tempora praesentium quod laudantium temporibus reprehenderit? Expedita, necessitatibus officiis esse molestiae illo accusantium aut sint laborum quam vero tempora laudantium libero modi assumenda molestias. Quaerat autem odit fugiat excepturi error id facere illum amet ea labore reprehenderit officia eveniet, natus accusamus ut ad nisi optio numquam tempore nostrum! Tenetur, sunt. Iure similique nulla omnis tenetur provident assumenda ut ipsam quasi officia eius!vitae.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
