"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navItems } from "@/lib/content";
import { slideDown } from "@/lib/animations";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNavClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <motion.header
        variants={slideDown}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-cream/90 backdrop-blur-md border-b border-beige/60 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick("#home")}
            className="group flex items-center gap-3"
            aria-label="Tikocraft home"
          >
            <span
              className={`block h-px w-8 transition-all duration-500 group-hover:w-12 ${
                scrolled ? "bg-brown-700" : "bg-cream"
              }`}
            />
            <span
              className={`font-display text-2xl tracking-luxe-sm transition-colors duration-500 ${
                scrolled ? "text-brown-800" : "text-cream"
              }`}
            >
              Tikocraft
            </span>
          </button>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-10">
            {navItems.map((item, i) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  onClick={() => handleNavClick(item.href)}
                  className={`group relative font-body text-xs tracking-luxe-sm uppercase transition-colors duration-300 ${
                    scrolled
                      ? "text-brown-700 hover:text-brown-900"
                      : "text-cream/80 hover:text-cream"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px w-0 transition-all duration-500 group-hover:w-full ${
                      scrolled ? "bg-brown-700" : "bg-cream"
                    }`}
                  />
                </button>
              </motion.li>
            ))}
          </ul>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavClick("#contact")}
              className={`hidden lg:inline-flex font-body text-xs tracking-luxe-sm uppercase px-5 py-2.5 border transition-all duration-500 ${
                scrolled
                  ? "border-brown-700 text-brown-800 hover:bg-brown-700 hover:text-cream"
                  : "border-cream/60 text-cream hover:bg-cream hover:text-brown-800"
              }`}
            >
              Visit Showroom
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(true)}
              className={`lg:hidden p-2 transition-colors ${
                scrolled ? "text-brown-800" : "text-cream"
              }`}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-brown-900 grain-overlay"
          >
            <div className="flex items-center justify-between px-6 py-6">
              <span className="font-display text-2xl tracking-luxe-sm text-cream">
                Tikocraft
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-cream p-2"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
              }}
              className="flex flex-col items-center justify-center mt-20 gap-8"
            >
              {navItems.map((item) => (
                <motion.li
                  key={item.href}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="font-display text-4xl text-cream hover:text-beige transition-colors duration-300"
                  >
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="absolute bottom-10 left-0 right-0 text-center"
            >
              <p className="font-body text-xs tracking-luxe uppercase text-beige/60">
                Handcrafted with intention
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
