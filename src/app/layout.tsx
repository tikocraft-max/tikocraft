import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tikocraft — Handcrafted Home Decor | Artisan Objects for Modern Living",
  description:
    "Tikocraft creates handcrafted home decor objects in earthy browns, beige and natural materials. Discover ceramic vases, woven textiles, sculptural lighting and furniture made by artisans.",
  keywords: [
    "Tikocraft",
    "handcrafted home decor",
    "artisan ceramics",
    "luxury home decor",
    "woven textiles",
    "sculptural lighting",
    "modern craft",
  ],
  authors: [{ name: "Tikocraft" }],
  openGraph: {
    title: "Tikocraft — Handcrafted Home Decor",
    description:
      "Artisan objects for modern living. Discover our collections of ceramics, textiles, lighting and furniture.",
    siteName: "Tikocraft",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${inter.variable} antialiased bg-cream text-brown-900 font-body`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
