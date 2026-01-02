"use client";
import { useEffect, useState } from "react";

export default function Testimonials() {
  const cards = [
    { name: "User", text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.", bg: "bg-[#6B4A3E] text-white" },
    { name: "User", text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.", bg: "bg-[#3b0f06] text-white" },
    { name: "User", text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.", bg: "bg-white text-black" },
    { name: "User", text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.", bg: "bg-[#6B4A3E] text-white" },
    { name: "User", text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.", bg: "bg-[#3b0f06] text-white" },
    { name: "User", text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.", bg: "bg-white text-black" },
    { name: "User", text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.", bg: "bg-[#6B4A3E] text-white" },
  ];

  const CARD_WIDTH = 440;
  const GAP = 32;
  const TOTAL_WIDTH = cards.length * (CARD_WIDTH + GAP);

  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset((prev) => {
        // reset when half (original set) is crossed
        if (prev >= TOTAL_WIDTH) {
          return 0;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [TOTAL_WIDTH]);

  return (
    <div className="overflow-hidden w-full">
      <div
        className="flex gap-8"
        style={{
          transform: `translateX(-${offset}px)`,
        }}
      >
        {[...cards, ...cards].map((card, i) => (
          <div
            key={i}
            className={`w-85 h-65 shrink-0 rounded-3xl p-8 shadow-xl ${card.bg}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/80"></div>
              <p className="font-medium">{card.name}</p>
            </div>

            <p className="text-sm leading-relaxed opacity-90">
              {card.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
