"use client";

export default function AddressCart() {
  return (
    <section className="p-10 flex flex-col gap-6">

      <h1 className="text-2xl font-bold">
        Where should we send your order?
      </h1>

      {/* Country */}
      <div className="flex flex-col gap-1">
        <label htmlFor="country" className="text-sm font-medium">
          Country
        </label>
        <input
          id="country"
          name="country"
          type="text"
          placeholder="India"
          className="border-b px-2 py-1 outline-none"
        />
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-medium">
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          placeholder="Street address"
          className="border-b px-2 py-1 outline-none"
        />
      </div>

      {/* City & Zip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            placeholder="Dehradun"
            className="border-b px-2 py-1 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="zip" className="text-sm font-medium">
            Zip / Postal Code
          </label>
          <input
            id="zip"
            name="zip"
            type="text"
            placeholder="248001"
            className="border-b px-2 py-1 outline-none"
          />
        </div>
      </div>

      {/* State */}
      <div className="flex flex-col gap-1">
        <label htmlFor="state" className="text-sm font-medium">
          State / Province
        </label>
        <input
          id="state"
          name="state"
          type="text"
          placeholder="Uttarakhand"
          className="border-b px-2 py-1 outline-none"
        />
      </div>

      {/* Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="countryCode" className="text-sm font-medium">
            Country Code
          </label>
          <input
            id="countryCode"
            name="countryCode"
            type="text"
            placeholder="+91"
            className="border-b px-2 py-1 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium">
            Mobile Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="9876543210"
            className="border-b px-2 py-1 outline-none"
          />
        </div>
      </div>
      {/* <button className="bg-black px-10 py-3 text-white">Proceed to checkout</button> */}

    </section>
  );
}
