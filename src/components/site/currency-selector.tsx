"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";
import { COUNTRIES, useCurrency } from "@/lib/currency";
import { fadeUp } from "@/lib/animations";

interface CurrencySelectorProps {
  /** When on dark background, use the light variant */
  variant?: "dark" | "light";
}

export default function CurrencySelector({
  variant = "light",
}: CurrencySelectorProps) {
  const { country, setCountry } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const textColor = variant === "dark" ? "text-cream" : "text-brown-800";
  const hoverColor = variant === "dark" ? "hover:text-beige" : "hover:text-brown-600";
  const dropdownBg = "bg-cream";
  const dropdownText = "text-brown-900";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`group inline-flex items-center gap-2 font-body text-[11px] tracking-luxe-sm uppercase transition-colors ${textColor} ${hoverColor}`}
        aria-label="Change country and currency"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5" strokeWidth={1.4} />
        <span className="hidden sm:inline">{country.flag}</span>
        <span>{country.currency}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          strokeWidth={1.6}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute right-0 top-full mt-3 ${dropdownBg} ${dropdownText} shadow-[0_30px_60px_-20px_rgba(74,46,26,0.3)] border border-beige w-64 max-h-[60vh] overflow-y-auto z-50`}
          >
            <div className="p-3">
              <div className="font-body text-[10px] tracking-luxe uppercase text-brown-500 px-3 py-2 border-b border-beige/60">
                Select your country
              </div>
              <div className="pt-2">
                {COUNTRIES.map((c) => {
                  const isActive = c.code === country.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCountry(c.code);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        isActive ? "bg-brown-50" : "hover:bg-brown-50"
                      }`}
                    >
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-base text-brown-900 leading-tight">
                          {c.name}
                        </div>
                        <div className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-500">
                          {c.currency} · {c.currencySymbol}
                        </div>
                      </div>
                      {isActive && (
                        <Check className="h-4 w-4 text-brown-700 shrink-0" strokeWidth={1.8} />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="font-body text-[10px] text-brown-500/80 px-3 py-3 mt-1 border-t border-beige/60 leading-relaxed">
                Prices shown in your selected currency. Final conversion handled at checkout.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
