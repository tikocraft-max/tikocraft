"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  fadeUp,
  revealLeft,
  revealRight,
  staggerContainer,
  viewportOnce,
} from "@/lib/animations";
import { useRouter } from "@/lib/router";

const stats = [
  { value: "2018", label: "Year established" },
  { value: "2", label: "Curated crafts" },
  { value: "100%", label: "Selected with care" },
  { value: "1", label: "Order at a time" },
];

const values = [
  {
    title: "Slow Selection",
    description:
      "We measure a piece by how it ages, not how fast it ships. Every item in our catalog is chosen because we believe it will look quieter and better ten years from now.",
  },
  {
    title: "Honest Material",
    description:
      "Birch plywood, natural finishes, warm LEDs. We let the material speak first — and we describe it accurately, so you know exactly what you are buying.",
  },
  {
    title: "Built to Outlive",
    description:
      "Every product we carry is finished to be repaired, not replaced. We share care notes with every order and stand behind what we ship, for the long run.",
  },
];

const decorSteps = [
  ["Curation", "We source from designers and makers whose work we have followed for years. Each piece earns a place in the catalog on its own merits."],
  ["Quality check", "Every item is inspected against our materials and finish standards before it is listed. Anything that falls short is returned at our cost."],
  ["Photography", "We photograph what you see, in natural light. No stylized set dressing — the images match the object you receive."],
  ["Honest copy", "Dimensions, materials, and assembly time are stated plainly. If something takes 8 hours to assemble, that is what we tell you."],
  ["Secure packaging", "Each order is packed in protective, recyclable materials strong enough to survive international shipping."],
  ["Tracked shipping", "A confirmation and tracking link is sent the moment your order leaves the fulfillment partner, so you can follow it to your door."],
];

const booknookSteps = [
  ["Design", "Each diorama is drawn at scale on paper — every window, lamp, and cobblestone planned before any cut."],
  ["Cutting", "Pieces laser-cut from 3mm birch plywood, then sanded and inspected piece by piece."],
  ["Painting", "Facades, trees, and tiny interiors painted with miniature brushes. Two coats, two days."],
  ["Wiring", "Warm LED strips threaded through hidden channels, soldered to a USB power lead."],
  ["Kitting", "Pieces sorted into labelled compartments with an illustrated assembly guide."],
  ["Assembly", "You slot the pieces together — no glue. 8 to 12 hours of slow, focused work."],
];

export default function AtelierPage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const { navigate } = useRouter();

  return (
    <div className="bg-cream min-h-screen">
      {/* Page header */}
      <section className="pt-32 md:pt-40 px-6 lg:px-12 pb-20 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-brown-400" />
              <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                The Atelier
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-brown-900 leading-[1.02] mb-8 text-balance max-w-4xl"
            >
              A studio built
              <br />
              around the <span className="italic font-light text-brown-500">piece</span>,
              not the trend.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="max-w-2xl font-body text-base sm:text-lg text-brown-700/80 leading-relaxed font-light"
            >
              Tikocraft began in 2018 as a small online studio curating earthy
              home objects and DIY miniature kits. Today we focus on two crafts
              — sourcing considered decor pieces, and designing book nook kits
              that you assemble at home. Every item in the catalog is selected
              with the same patience it asks of you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Hero image with parallax */}
      <section ref={ref} className="px-6 lg:px-12 pb-24 md:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={revealLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="relative aspect-[16/10] sm:aspect-[16/8] overflow-hidden"
          >
            <motion.img
              src="/images/atelier-2.png"
              alt="Tikocraft workshop interior"
              style={{ y: imageY }}
              className="absolute inset-0 h-[115%] w-full object-cover -top-[8%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brown-900/30 to-transparent" />
          </motion.div>

          {/* Floating stats caption */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-12 md:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10 pt-10 border-t border-beige"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-4xl md:text-5xl text-brown-800 leading-none">
                  {stat.value}
                </div>
                <div className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-600 mt-3">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story — image left, text right */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
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
                  alt="Tikocraft studio"
                  style={{ y: imageY }}
                  className="absolute inset-0 h-[115%] w-full object-cover -top-[8%]"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -bottom-6 -right-4 sm:right-8 bg-cream border border-beige px-6 py-5 max-w-[260px] shadow-[0_20px_50px_-20px_rgba(74,46,26,0.3)]"
              >
                <span className="font-display text-3xl text-brown-800 block leading-none">
                  8 hours
                </span>
                <span className="font-body text-xs text-brown-600 mt-2 block leading-relaxed">
                  of patient assembly — from flat-pack kit to glowing world.
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              variants={staggerContainer(0.15, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="lg:col-span-5 lg:pl-8"
            >
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl sm:text-4xl md:text-5xl text-brown-900 leading-[1.1] mb-8 text-balance"
              >
                Two crafts under one roof — curated decor, designed kits.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="font-body text-base text-brown-700/80 leading-relaxed mb-6 font-light"
              >
                Our mornings belong to research — reviewing submissions,
                checking finishes, answering your questions about materials and
                assembly. The afternoon light, gentler, is for the book nooks
                themselves: photographing kits, updating guides, and writing
                the little notes that ship with each order.
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="font-body text-base text-brown-700/80 leading-relaxed mb-10 font-light"
              >
                We do not chase volume. We chase the kind of object that gets
                quieter, not louder, with time — and that you reach for, ten
                years on, without thinking.
              </motion.p>
              <motion.button
                variants={fadeUp}
                onClick={() => navigate("contact")}
                className="group inline-flex items-center gap-3 bg-brown-800 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-brown-900"
              >
                Write to Tikocraft
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Three values */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.18, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
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
        </div>
      </section>

      {/* Two processes — Decor */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32 bg-brown-50">
        <div className="mx-auto max-w-7xl py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <motion.div
              variants={staggerContainer(0.15, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="lg:col-span-5 lg:sticky lg:top-32"
            >
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-brown-400" />
                <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                  Process · Home Decor
                </span>
              </motion.div>
              <motion.h3
                variants={fadeUp}
                className="font-display text-3xl sm:text-4xl md:text-5xl text-brown-900 leading-[1.1] mb-8 text-balance"
              >
                From selection to your door — six careful steps.
              </motion.h3>
              <motion.p
                variants={fadeUp}
                className="font-body text-base text-brown-700/80 leading-relaxed font-light mb-8"
              >
                Every piece in our decor collection passes through the same
                patient rhythm of curation, inspection, and dispatch. No
                shortcuts — only attention, at every step.
              </motion.p>
            </motion.div>

            <motion.ol
              variants={staggerContainer(0.1, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="lg:col-span-7 space-y-2"
            >
              {decorSteps.map(([step, desc], i) => (
                <motion.li
                  key={step}
                  variants={fadeUp}
                  className="group flex gap-5 py-6 border-b border-beige/80"
                >
                  <span className="font-display text-2xl text-brown-300 group-hover:text-brown-700 shrink-0 w-10 transition-colors duration-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <span className="font-display text-xl text-brown-900 block mb-2">
                      {step}
                    </span>
                    <span className="font-body text-sm text-brown-700/70 leading-relaxed font-light">
                      {desc}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </section>

      {/* Two processes — Book Nooks */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32 bg-brown-900 text-cream grain-overlay">
        <div className="mx-auto max-w-7xl py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <motion.div
              variants={staggerContainer(0.15, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="lg:col-span-5 lg:sticky lg:top-32 lg:order-2"
            >
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-beige/60" />
                <span className="font-body text-[11px] tracking-luxe uppercase text-beige/80">
                  Process · Book Nook Kits
                </span>
              </motion.div>
              <motion.h3
                variants={fadeUp}
                className="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.1] mb-8 text-balance"
              >
                From a drawing to a glowing world — six precise steps.
              </motion.h3>
              <motion.p
                variants={fadeUp}
                className="font-body text-base text-cream/70 leading-relaxed font-light mb-8"
              >
                Each book nook begins as a sketch on paper, ends in your hands
                as a flat-pack kit, and comes alive between your books — eight
                hours and one warm LED later.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="relative aspect-[4/3] overflow-hidden mt-8"
              >
                <img
                  src="/images/booknook-process.png"
                  alt="Assembling a book nook kit"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-brown-900/20" />
              </motion.div>
            </motion.div>

            <motion.ol
              variants={staggerContainer(0.1, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="lg:col-span-7 lg:order-1 space-y-2"
            >
              {booknookSteps.map(([step, desc], i) => (
                <motion.li
                  key={step}
                  variants={fadeUp}
                  className="group flex gap-5 py-6 border-b border-beige/15"
                >
                  <span className="font-display text-2xl text-beige/30 group-hover:text-beige shrink-0 w-10 transition-colors duration-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <span className="font-display text-xl text-cream block mb-2">
                      {step}
                    </span>
                    <span className="font-body text-sm text-cream/65 leading-relaxed font-light">
                      {desc}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </section>
    </div>
  );
}
