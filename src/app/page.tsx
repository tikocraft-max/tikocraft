"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RouterProvider, useRouter } from "@/lib/router";
import { CurrencyProvider } from "@/lib/currency";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import HomePage from "@/components/site/pages/home-page";
import CollectionsPage from "@/components/site/pages/collections-page";
import ProductsPage from "@/components/site/pages/products-page";
import AtelierPage from "@/components/site/pages/atelier-page";
import ShowroomPage from "@/components/site/pages/showroom-page";
import ContactPage from "@/components/site/pages/contact-page";
import { pageTransition } from "@/lib/animations";
import type { PageId } from "@/lib/content";

function CurrentPage() {
  const { currentPage, pageParam } = useRouter();

  // Determine whether footer should sit on a dark background
  const isDarkPage = currentPage === "showroom" || currentPage === "contact";

  return (
    <div className="relative min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentPage}-${pageParam || ""}`}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative"
          >
            {renderPage(currentPage)}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function renderPage(page: PageId) {
  switch (page) {
    case "home":
      return <HomePage />;
    case "collections":
      return <CollectionsPage />;
    case "products":
      return <ProductsPage />;
    case "atelier":
      return <AtelierPage />;
    case "showroom":
      return <ShowroomPage />;
    case "contact":
      return <ContactPage />;
    default:
      return <HomePage />;
  }
}

export default function Home() {
  return (
    <CurrencyProvider>
      <RouterProvider>
        <CurrentPage />
      </RouterProvider>
    </CurrencyProvider>
  );
}
