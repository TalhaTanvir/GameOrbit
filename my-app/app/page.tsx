import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";

const ProductSection = dynamic(() => import("@/components/sections/ProductSection"), {
  loading: () => (
    <section className="w-full py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Loading products...</p>
      </div>
    </section>
  ),
});

export function Home() {
  return (
    <>
      <Hero />
      <ProductSection />
    </>
  );
}

export default Home;
