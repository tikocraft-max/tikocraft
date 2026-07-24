"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { useRouter } from "@/lib/router";
import type { PageId } from "@/lib/content";

const footerLinks: { title: string; items: { label: string; page?: PageId; param?: string }[] }[] = {
  Collections: [
    { label: "Ceramics & Vessels", page: "collections" },
    { label: "Textiles & Throws", page: "collections" },
    { label: "Lighting & Ambiance", page: "collections" },
    { label: "Furniture & Seating", page: "collections" },
    { label: "Book Nook Kits", page: "products", param: "booknooks" },
  ],
  Atelier: [
    { label: "Our Story", page: "atelier" },
    { label: "Process & Materials", page: "atelier" },
    { label: "The Two Crafts", page: "atelier" },
    { label: "Sustainability", page: "atelier" },
  ],
  Visit: [
    { label: "Book the Showroom", page: "showroom" },
    { label: "Trade Enquiries", page: "contact" },
    { label: "Press Kit", page: "contact" },
    { label: "Wholesale", page: "contact" },
  ],
};

const social = [
  { label: "Instagram", href: "#" },
  { label: "Pinterest", href: "#" },
  { label: "Journal", href: "#" },
];

export default function Footer() {
  const { navigate, currentPage } = useRouter();
  // Footer is always on cream bg; only contact/showroom pages have brown bg behind
  const isDarkPage = currentPage === "showroom" || currentPage === "contact";

  return (
    <footer
      className={`relative pt-20 pb-10 px-6 lg:px-12 grain-overlay border-t ${
        isDarkPage
          ? "bg-brown-800 border-beige/20 text-cream"
          : "bg-brown-50 border-beige/60 text-brown-900"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Top — Brand + Links */}
        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b"
          style={{
            borderColor: isDarkPage ? "rgba(232,213,183,0.2)" : "rgba(232,213,183,1)",
          }}
        >
          {/* Brand */}
          <motion.div variants={fadeUp} className="lg:col-span-5">
            <button
              onClick={() => navigate("home")}
              className="flex items-center mb-6"
              aria-label="Tikocraft home"
            >
              <img
                src={isDarkPage ? "/images/logo-cream.png" : "/images/logo-nav.png"}
                alt="Tikocraft"
                className={`h-12 w-auto ${isDarkPage ? "" : ""}`}
              />
            </button>
            <p
              className={`font-body text-sm leading-relaxed max-w-md font-light mb-8 ${
                isDarkPage ? "text-cream/70" : "text-brown-700/80"
              }`}
            >
              A small atelier of ceramicists, weavers, woodworkers — and makers
              of miniature worlds. Earthy home objects, and 3D DIY book nook
              kits, shaped one piece at a time, since 2018.
            </p>

            {/* Newsletter signup */}
            <div className="max-w-sm">
              <label
                className={`font-body text-[10px] tracking-luxe uppercase block mb-3 ${
                  isDarkPage ? "text-beige/60" : "text-brown-600"
                }`}
              >
                Letters from the atelier
              </label>
              <form
                onSubmit={(e) => e.preventDefault()}
                className={`flex items-center border-b transition-colors ${
                  isDarkPage
                    ? "border-beige/30 focus-within:border-beige"
                    : "border-brown-300 focus-within:border-brown-800"
                }`}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className={`flex-1 bg-transparent font-body text-sm py-3 focus:outline-none ${
                    isDarkPage
                      ? "text-cream placeholder:text-cream/40"
                      : "text-brown-900 placeholder:text-brown-400"
                  }`}
                />
                <button
                  type="submit"
                  className={`transition-colors p-2 ${
                    isDarkPage
                      ? "text-beige hover:text-cream"
                      : "text-brown-700 hover:text-brown-900"
                  }`}
                  aria-label="Subscribe"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </form>
              <p
                className={`font-body text-[10px] mt-2 font-light ${
                  isDarkPage ? "text-beige/50" : "text-brown-500"
                }`}
              >
                Quarterly notes. Never more, never sold.
              </p>
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, items]) => (
            <motion.div key={title} variants={fadeUp} className="lg:col-span-2">
              <h4
                className={`font-body text-[10px] tracking-luxe uppercase mb-6 ${
                  isDarkPage ? "text-beige/60" : "text-brown-500"
                }`}
              >
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => navigate(item.page || "home", item.param || null)}
                      className={`group inline-flex items-center gap-2 font-display text-base transition-colors ${
                        isDarkPage
                          ? "text-cream/90 hover:text-beige"
                          : "text-brown-800 hover:text-brown-600"
                      }`}
                    >
                      <span
                        className={`h-px w-0 transition-all duration-500 group-hover:w-4 ${
                          isDarkPage ? "bg-beige" : "bg-brown-700"
                        }`}
                      />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Social column */}
          <motion.div variants={fadeUp} className="lg:col-span-1">
            <h4
              className={`font-body text-[10px] tracking-luxe uppercase mb-6 ${
                isDarkPage ? "text-beige/60" : "text-brown-500"
              }`}
            >
              Follow
            </h4>
            <ul className="space-y-3">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className={`group inline-flex items-center gap-2 font-display text-base transition-colors ${
                      isDarkPage
                        ? "text-cream/90 hover:text-beige"
                        : "text-brown-800 hover:text-brown-600"
                    }`}
                  >
                    <span
                      className={`h-px w-0 transition-all duration-500 group-hover:w-4 ${
                        isDarkPage ? "bg-beige" : "bg-brown-700"
                      }`}
                    />
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
          <p
            className={`font-body text-[11px] font-light tracking-wide ${
              isDarkPage ? "text-beige/60" : "text-brown-600"
            }`}
          >
            © {new Date().getFullYear()} Tikocraft Atelier · Marrakech · All
            objects signed and dated.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className={`font-body text-[11px] transition-colors ${
                isDarkPage ? "text-beige/60 hover:text-cream" : "text-brown-600 hover:text-brown-900"
              }`}
            >
              Privacy
            </a>
            <a
              href="#"
              className={`font-body text-[11px] transition-colors ${
                isDarkPage ? "text-beige/60 hover:text-cream" : "text-brown-600 hover:text-brown-900"
              }`}
            >
              Terms
            </a>
            <a
              href="#"
              className={`font-body text-[11px] transition-colors ${
                isDarkPage ? "text-beige/60 hover:text-cream" : "text-brown-600 hover:text-brown-900"
              }`}
            >
              Shipping
            </a>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`group inline-flex items-center gap-2 font-body text-[11px] tracking-luxe-sm uppercase transition-colors ${
                isDarkPage ? "text-beige/80 hover:text-cream" : "text-brown-700 hover:text-brown-900"
              }`}
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
