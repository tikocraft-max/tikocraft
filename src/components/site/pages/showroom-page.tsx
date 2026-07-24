"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { useRouter } from "@/lib/router";

export default function ShowroomPage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const { navigate } = useRouter();

  const info = [
    {
      label: "Address",
      value: "Route de l'Ourika, Km 12\nMarrakech 40000, Morocco",
    },
    {
      label: "Visiting Hours",
      value: "Tuesday — Saturday\n10:00 — 18:00",
    },
    {
      label: "Appointment",
      value: "By appointment only\nBook 48 hours ahead",
    },
    {
      label: "Languages",
      value: "English · French\nArabic · Spanish",
    },
  ];

  return (
    <div className="bg-brown-900 min-h-screen text-cream">
      {/* Full-bleed hero image with strong parallax */}
      <section
        ref={ref}
        className="relative h-[100vh] min-h-[600px] overflow-hidden flex items-center justify-center"
      >
        <motion.div
          style={{ y: imageY }}
          className="absolute inset-0 z-0 h-[124%] -top-[12%]"
        >
          <img
            src="/images/showroom.png"
            alt="Tikocraft showroom"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 z-10 bg-brown-900/60" />
        <div className="absolute inset-0 z-10 grain-overlay" />

        <motion.div
          variants={staggerContainer(0.15, 0.2)}
          initial="hidden"
          animate="visible"
          className="relative z-20 max-w-4xl mx-auto px-6 text-center"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className="h-px w-12 bg-beige/60" />
            <span className="font-body text-xs tracking-luxe uppercase text-beige/80">
              The Showroom
            </span>
            <span className="h-px w-12 bg-beige/60" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream leading-[1.02] mb-8 text-balance"
          >
            Come sit with the
            <br />
            <span className="italic font-light text-beige">objects</span> before
            you choose.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl mx-auto font-body text-base text-cream/80 leading-relaxed font-light mb-12"
          >
            Our showroom is a quiet room above the workshop. No music, no sales
            staff — only the pieces, the light from a north-facing window, and
            tea if you stay a while.
          </motion.p>

          <motion.button
            variants={fadeUp}
            onClick={() => navigate("contact")}
            className="group inline-flex items-center gap-3 bg-cream text-brown-900 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-colors duration-500 hover:bg-beige"
          >
            Book a Visit
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </motion.button>
        </motion.div>
      </section>

      {/* Practical info */}
      <section className="px-6 lg:px-12 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mb-20 max-w-3xl"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-beige/60" />
              <span className="font-body text-[11px] tracking-luxe uppercase text-beige/80">
                Practical Information
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.05] text-balance"
            >
              How to find us — and what to expect.
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
          >
            {info.map((item) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                className="border-t border-beige/20 pt-6"
              >
                <div className="font-body text-[10px] tracking-luxe uppercase text-beige/60 mb-4">
                  {item.label}
                </div>
                <div className="font-display text-lg text-cream whitespace-pre-line leading-snug">
                  {item.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What to expect */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            {[
              {
                title: "A slow look",
                body: "Plan for an hour, not ten minutes. The pieces reward a second and third look — you will see things you missed at first glance.",
              },
              {
                title: "A working atelier",
                body: "The showroom opens directly onto the workshop. You can watch pieces being thrown, sanded, painted, and packed as you browse.",
              },
              {
                title: "Tea, always",
                body: "We pour mint tea on arrival. It is not a sales tactic — it is how we work. Stay as long as you like; the kettle is always on.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="bg-brown-800/40 border border-beige/15 p-8 lg:p-10"
              >
                <span className="font-display text-sm text-beige/50 tracking-luxe">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl text-cream mt-4 mb-4">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-cream/65 leading-relaxed font-light">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <motion.div
          variants={staggerContainer(0.15, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.05] mb-8 text-balance"
          >
            Ready to come?
            <br />
            <span className="italic font-light text-beige">Write to us first.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="max-w-xl mx-auto font-body text-base text-cream/70 leading-relaxed font-light mb-10"
          >
            We see visitors by appointment only — it lets us give each visit the
            attention it deserves. Drop us a letter; we'll suggest a time.
          </motion.p>
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("contact")}
            className="group inline-flex items-center gap-3 bg-cream text-brown-900 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-colors duration-500 hover:bg-beige"
          >
            Book Your Visit
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
