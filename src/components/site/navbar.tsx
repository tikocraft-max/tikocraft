"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { navItems } from "@/lib/content";
import { useRouter } from "@/lib/router";
import { slideDown } from "@/lib/animations";
import { useCart } from "@/lib/cart";
import CurrencySelector from "./currency-selector";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { currentPage, navigate } = useRouter();
  const cartItems = useCart((s) => s.items);
  const openCart = useCart((s) => s.openCart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNavClick = (page: typeof navItems[number]["page"], param: string | null = null) => {
    setOpen(false);
    navigate(page, param);
  };

  // Determine if we are on a "dark" page where the navbar should be light
  const isDarkPage = currentPage === "showroom" || currentPage === "contact";
  const onLightBg = scrolled || (!isDarkPage);

  return (
    <>
      <motion.header
        variants={slideDown}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-cream/90 backdrop-blur-md border-b border-beige/60 py-3"
            : isDarkPage
            ? "bg-brown-900/40 backdrop-blur-sm py-5"
            : "bg-transparent py-6"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick("home")}
            className="group flex items-center gap-3"
            aria-label="Tikocraft home"
          >
            <img
              src="/images/logo-nav.png"
              alt="Tikocraft logo"
              className={`h-9 md:h-10 w-auto transition-all duration-500 group-hover:scale-105 ${
                onLightBg || scrolled ? "" : "brightness-0 invert"
              }`}
            />
          </button>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navItems.map((item, i) => {
              const isActive =
                currentPage === item.page &&
                (item.page !== "products" || !item.href || item.href !== "booknooks" || currentPage === "products");
              return (
                <motion.li
                  key={`${item.label}-${item.href}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    onClick={() => {
                      if (item.href === "booknooks") {
                        handleNavClick("products", "booknooks");
                      } else {
                        handleNavClick(item.page);
                      }
                    }}
                    className={`group relative font-body text-[11px] tracking-luxe-sm uppercase transition-colors duration-300 ${
                      scrolled
                        ? "text-brown-700 hover:text-brown-900"
                        : isDarkPage
                        ? "text-cream/80 hover:text-cream"
                        : "text-cream/80 hover:text-cream"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-px transition-all duration-500 group-hover:w-full ${
                        scrolled ? "bg-brown-700" : "bg-cream"
                      } ${isActive ? "w-full" : "w-0"}`}
                    />
                  </button>
                </motion.li>
              );
            })}
          </ul>

          {/* CTA + Currency + Cart + Mobile toggle */}
          <div className="flex items-center gap-4 lg:gap-5">
            <div className="hidden sm:block">
              <CurrencySelector variant={onLightBg || scrolled ? "light" : "dark"} />
            </div>

            {/* Cart icon */}
            <button
              onClick={openCart}
              className={`relative p-2 transition-colors ${
                scrolled ? "text-brown-800 hover:text-brown-600" : "text-cream hover:text-beige"
              }`}
              aria-label={`Open cart (${cartCount} items)`}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.4} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -top-1 -right-1 bg-brown-800 text-cream font-body text-[10px] font-medium leading-none rounded-full h-4 min-w-4 px-1 flex items-center justify-center"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => handleNavClick("contact")}
              className={`hidden lg:inline-flex font-body text-[11px] tracking-luxe-sm uppercase px-5 py-2.5 border transition-all duration-500 ${
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
              <img
                src="/images/logo-cream.png"
                alt="Tikocraft"
                className="h-9 w-auto"
              />
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
                visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
              }}
              className="flex flex-col items-center justify-center mt-16 gap-6"
            >
              {navItems.map((item) => (
                <motion.li
                  key={`${item.label}-${item.href}-mobile`}
                  variants={{
                    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <button
                    onClick={() => {
                      if (item.href === "booknooks") {
                        handleNavClick("products", "booknooks");
                      } else {
                        handleNavClick(item.page);
                      }
                    }}
                    className={`font-display text-4xl transition-colors duration-300 ${
                      currentPage === item.page
                        ? "text-beige"
                        : "text-cream hover:text-beige"
                    }`}
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
