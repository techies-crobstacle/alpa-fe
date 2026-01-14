"use client";

export default function EmailCart() {
  return (
    <section className="p-10 flex flex-col gap-5">


        <h1 className="text-2xl font-extrabold">Who is placing this order? </h1>

      {/* Email */}
      <div className="flex flex-col gap-1 py-5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="border-b px-2 py-1 outline-none"
        />
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            className="border-b px-2 py-1 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1 mb-5">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            className="border-b px-2 py-1 outline-none"
          />
        </div>

      </div>

    </section>
  );
}
