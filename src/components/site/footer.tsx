"use client";

import { motion } from "framer-motion";
import { Instagram, ArrowUpRight, ArrowUp } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations";

const footerLinks = {
  Collections: ["Ceramics & Vessels", "Textiles & Throws", "Lighting & Ambiance", "Furniture & Seating"],
  Atelier: ["Our Story", "The Makers", "Process & Materials", "Sustainability"],
  Visit: ["Book the Showroom", "Trade Enquiries", "Press Kit", "Wholesale"],
};

const social = [
  { label: "Instagram", href: "#" },
  { label: "Pinterest", href: "#" },
  { label: "Journal", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative bg-brown-50 border-t border-beige/60 pt-20 pb-10 px-6 lg:px-12 grain-overlay">
      <div className="mx-auto max-w-7xl">
        {/* Top — Brand + Links */}
        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-beige"
        >
          {/* Brand */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-brown-700" />
              <span className="font-display text-3xl tracking-luxe-sm text-brown-900">
                Tikocraft
              </span>
            </div>
            <p className="font-body text-sm text-brown-700/80 leading-relaxed max-w-md font-light mb-8">
              A small atelier of ceramicists, weavers and woodworkers, shaping
              earthy, functional objects for the modern home — one piece at a
              time, since 2018.
            </p>

            {/* Newsletter signup */}
            <div className="max-w-sm">
              <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-3">
                Letters from the atelier
              </label>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center border-b border-brown-300 focus-within:border-brown-800 transition-colors"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent font-body text-sm text-brown-900 placeholder:text-brown-400 py-3 focus:outline-none"
                />
                <button
                  type="submit"
                  className="text-brown-700 hover:text-brown-900 transition-colors p-2"
                  aria-label="Subscribe"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </form>
              <p className="font-body text-[10px] text-brown-500 mt-2 font-light">
                Quarterly notes. Never more, never sold.
              </p>
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, items]) => (
            <motion.div key={title} variants={fadeUp} className="lg:col-span-2">
              <h4 className="font-body text-[10px] tracking-luxe uppercase text-brown-500 mb-6">
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="group inline-flex items-center gap-2 font-display text-base text-brown-800 hover:text-brown-600 transition-colors"
                    >
                      <span className="h-px w-0 bg-brown-700 transition-all duration-500 group-hover:w-4" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Social column */}
          <motion.div variants={fadeUp} className="lg:col-span-1">
            <h4 className="font-body text-[10px] tracking-luxe uppercase text-brown-500 mb-6">
              Follow
            </h4>
            <ul className="space-y-3">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="group inline-flex items-center gap-2 font-display text-base text-brown-800 hover:text-brown-600 transition-colors"
                  >
                    <span className="h-px w-0 bg-brown-700 transition-all duration-500 group-hover:w-4" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="font-body text-[11px] text-brown-600 font-light tracking-wide">
            © {new Date().getFullYear()} Tikocraft Atelier · Marrakech · All
            objects signed and dated.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="font-body text-[11px] text-brown-600 hover:text-brown-900 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="font-body text-[11px] text-brown-600 hover:text-brown-900 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="font-body text-[11px] text-brown-600 hover:text-brown-900 transition-colors"
            >
              Shipping
            </a>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-2 font-body text-[11px] tracking-luxe-sm uppercase text-brown-700 hover:text-brown-900 transition-colors"
              aria-label="Back to top"
            >
              <span>To top</span>
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
