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
  title: "Tikocraft — 3D DIY Book Nooks & Custom Clay Figures",
  description:
    "Tikocraft is a curated online studio offering 3D DIY book nook kits, miniature dioramas, and bespoke clay figures made to order from your photos. Shipped worldwide.",
  keywords: [
    "Tikocraft",
    "book nooks",
    "3D DIY book nook",
    "custom clay figures",
    "miniature diorama kits",
    "bookshelf diorama",
    "DIY miniature kits",
  ],
  authors: [{ name: "Tikocraft" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Tikocraft — 3D DIY Book Nooks & Custom Clay Figures",
    description:
      "3D DIY book nook kits, miniature dioramas, and bespoke clay figures made to order from your photos. Shipped worldwide.",
    siteName: "Tikocraft",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tikocraft — Book Nooks & Custom Figures",
    description: "3D DIY book nook kits and custom clay figures, curated with care and shipped worldwide.",
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
