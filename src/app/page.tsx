import Navbar from "@/components/site/navbar";
import Hero from "@/components/site/hero";
import Marquee from "@/components/site/marquee";
import Collections from "@/components/site/collections";
import Products from "@/components/site/products";
import Atelier from "@/components/site/atelier";
import Showroom from "@/components/site/showroom";
import Contact from "@/components/site/contact";
import Footer from "@/components/site/footer";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <Marquee />
        <Collections />
        <Products />
        <Atelier />
        <Showroom />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
