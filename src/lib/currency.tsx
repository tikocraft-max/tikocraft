"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

// ============================================================
// Country + Currency selector
// Supports: United States, Canada, United Kingdom,
// France/Germany/Italy/Spain/Netherlands (EU euro zone)
// ============================================================

export interface CountryConfig {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  flag: string; // emoji flag
  currency: string; // ISO 4217
  currencySymbol: string;
  // Conversion rate from USD → this currency (approximate, can be updated)
  rateFromUSD: number;
  // Locale for number formatting
  locale: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    rateFromUSD: 1,
    locale: "en-US",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencySymbol: "C$",
    rateFromUSD: 1.36,
    locale: "en-CA",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    rateFromUSD: 0.79,
    locale: "en-GB",
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    currency: "EUR",
    currencySymbol: "€",
    rateFromUSD: 0.92,
    locale: "fr-FR",
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    currency: "EUR",
    currencySymbol: "€",
    rateFromUSD: 0.92,
    locale: "de-DE",
  },
  {
    code: "IT",
    name: "Italy",
    flag: "🇮🇹",
    currency: "EUR",
    currencySymbol: "€",
    rateFromUSD: 0.92,
    locale: "it-IT",
  },
  {
    code: "ES",
    name: "Spain",
    flag: "🇪🇸",
    currency: "EUR",
    currencySymbol: "€",
    rateFromUSD: 0.92,
    locale: "es-ES",
  },
  {
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    currency: "EUR",
    currencySymbol: "€",
    rateFromUSD: 0.92,
    locale: "nl-NL",
  },
];

interface CurrencyContextValue {
  country: CountryConfig;
  setCountry: (code: string) => void;
  /** Convert a USD price to the current country's currency + format nicely */
  formatPrice: (usdPrice: number) => string;
  /** Convert a USD price to a raw number in current currency (no formatting) */
  convertPrice: (usdPrice: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "tikocraft-country";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Initialize lazily from localStorage so SSR + first render match
  const [countryCode, setCountryCode] = useState<string>(() => {
    if (typeof window === "undefined") return "US";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && COUNTRIES.find((c) => c.code === saved)) {
        return saved;
      }
    } catch {
      // localStorage not available (SSR)
    }
    return "US";
  });

  // Persist on change (controlled side-effect to external system)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, countryCode);
    } catch {
      // ignore
    }
  }, [countryCode]);

  const country = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0],
    [countryCode]
  );

  const setCountry = (code: string) => {
    if (COUNTRIES.find((c) => c.code === code)) {
      setCountryCode(code);
    }
  };

  const convertPrice = (usdPrice: number): number => {
    return Math.round(usdPrice * country.rateFromUSD * 100) / 100;
  };

  const formatPrice = (usdPrice: number): string => {
    const converted = convertPrice(usdPrice);
    // For EUR, format with comma decimal separator (de-DE) and trailing symbol
    try {
      const formatted = new Intl.NumberFormat(country.locale, {
        style: "currency",
        currency: country.currency,
        minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(converted);
      return formatted;
    } catch {
      return `${country.currencySymbol}${converted.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{ country, setCountry, formatPrice, convertPrice }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
