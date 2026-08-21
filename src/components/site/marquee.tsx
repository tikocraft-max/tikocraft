"use client";

import { motion } from "framer-motion";

const phrases = [
  "Curated with care",
  "Honest materials only",
  "Made to last a lifetime",
  "Shipped directly to you",
  "Selected with intention",
];

export default function Marquee() {
  return (
    <div className="bg-brown-800 text-cream py-5 overflow-hidden border-y border-brown-700">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...Array(2)].map((_, setIndex) => (
          <div key={setIndex} className="flex items-center shrink-0">
            {phrases.map((phrase, i) => (
              <div key={`${setIndex}-${i}`} className="flex items-center">
                <span className="font-display text-2xl sm:text-3xl italic font-light px-8">
                  {phrase}
                </span>
                <span className="text-beige/50 text-2xl">✦</span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
