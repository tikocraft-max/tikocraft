"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  fadeUp,
  revealLeft,
  revealRight,
  staggerContainer,
  viewportOnce,
  easeLuxe,
} from "@/lib/animations";

const stats = [
  { value: "2018", label: "Year founded" },
  { value: "12", label: "Resident artisans" },
  { value: "100%", label: "Natural materials" },
  { value: "1", label: "Piece at a time" },
];

const values = [
  {
    title: "Slow Hands",
    description:
      "We measure work in seasons, not shifts. A single vessel can pass through six hands and four kiln firings before it leaves us.",
  },
  {
    title: "Honest Material",
    description:
      "Local clay, regional wool, FSC-certified hardwood. We let the material speak first, then shape our form around its grain.",
  },
  {
    title: "Built to Outlive",
    description:
      "Every object is finished to be repaired, not replaced. We send care notes with every order and mend what we make, for life.",
  },
];

export default function Atelier() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax for the atelier image
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={ref}
      id="atelier"
      className="relative bg-cream py-24 md:py-36 px-6 lg:px-12 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        {/* Top: Image + Intro split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-32">
          {/* Left — Image with parallax */}
          <motion.div
            variants={revealLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="lg:col-span-7 relative"
          >
            <div className="relative aspect-[4/5] sm:aspect-[5/4] overflow-hidden">
              <motion.img
                src="/images/atelier-1.png"
                alt="Artisan shaping clay on a pottery wheel in the Tikocraft atelier"
                style={{ y: imageY }}
                className="absolute inset-0 h-[115%] w-full object-cover -top-[8%]"
              />
            </div>
            {/* Floating caption */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ delay: 0.5, duration: 0.8, ease: easeLuxe }}
              className="absolute -bottom-6 -right-4 sm:right-8 bg-cream border border-beige px-6 py-5 max-w-[260px] shadow-[0_20px_50px_-20px_rgba(74,46,26,0.3)]"
            >
              <span className="font-display text-3xl text-brown-800 block leading-none">
                72 hours
              </span>
              <span className="font-body text-xs text-brown-600 mt-2 block leading-relaxed">
                of patient shaping — from raw clay to finished vessel.
              </span>
            </motion.div>
          </motion.div>

          {/* Right — Intro text */}
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="lg:col-span-5 lg:pl-8"
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-px w-8 bg-brown-400" />
              <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                The Atelier
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display text-4xl sm:text-5xl md:text-6xl text-brown-900 leading-[1.05] mb-8 text-balance"
            >
              A workshop built
              <br />
              <span className="italic font-light text-brown-500">
                around the hand
              </span>
              , not the machine.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="font-body text-base text-brown-700/80 leading-relaxed mb-6 font-light"
            >
              Tikocraft began in a converted stable outside Marrakech, with a
              single kiln and three potters. Today, twelve artisans share the
              same roof — ceramicists, weavers, joiners, and a bronze caster —
              working in full view of one another, learning from each other&apos;s
              material.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="font-body text-base text-brown-700/80 leading-relaxed mb-10 font-light"
            >
              We do not chase volume. We chase the kind of object that gets
              quieter, not louder, with time — and that you reach for, ten
              years on, without thinking.
            </motion.p>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-beige"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl text-brown-800 leading-none">
                    {stat.value}
                  </div>
                  <div className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-600 mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Values — three principles */}
        <motion.div
          variants={staggerContainer(0.18, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-32"
        >
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              variants={fadeUp}
              className="relative bg-white border border-beige/60 p-8 lg:p-10 hover:border-brown-300 transition-colors duration-500"
            >
              <span className="font-display text-sm text-brown-400 tracking-luxe">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-3xl text-brown-900 mt-4 mb-4">
                {value.title}
              </h3>
              <p className="font-body text-sm text-brown-700/75 leading-relaxed font-light">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom split — text left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left — Process text */}
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="lg:col-span-5 order-2 lg:order-1"
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-px w-8 bg-brown-400" />
              <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                Our Process
              </span>
            </motion.div>

            <motion.h3
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl md:text-5xl text-brown-900 leading-[1.1] mb-8 text-balance"
            >
              From raw earth to your table — six slow steps.
            </motion.h3>

            <motion.ol
              variants={fadeUp}
              className="space-y-5 font-body text-sm text-brown-700/80 font-light"
            >
              {[
                ["Sourcing", "Clay dug from local riverbeds, wool sheared from regional flocks, oak felled within 200km."],
                ["Wedging & spinning", "Material prepared by hand — no pug mills. Two days of resting before any forming begins."],
                ["Forming", "Wheel-thrown, slab-built, or hand-carved. Every object carries the trace of its maker."],
                ["Drying & firing", "Slow air-drying for ten days, then three kiln firings peaking at 1280°C."],
                ["Finishing", "Hand-sanding, oiling, or glazing. Surfaces meant to be touched as well as seen."],
                ["Signing & shipping", "Each piece dated and signed. Wrapped in undyed linen and shipped from the atelier."],
              ].map(([step, desc], i) => (
                <li key={step} className="flex gap-5">
                  <span className="font-display text-lg text-brown-400 shrink-0 w-6">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="font-display text-base text-brown-900 block mb-1">
                      {step}
                    </span>
                    <span className="text-brown-700/70 leading-relaxed">
                      {desc}
                    </span>
                  </div>
                </li>
              ))}
            </motion.ol>
          </motion.div>

          {/* Right — Image with parallax */}
          <motion.div
            variants={revealRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="lg:col-span-7 order-1 lg:order-2 relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <motion.img
                src="/images/atelier-2.png"
                alt="Tikocraft workshop interior with workbench and ceramic pieces"
                style={{ y: imageY }}
                className="absolute inset-0 h-[115%] w-full object-cover -top-[8%]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
