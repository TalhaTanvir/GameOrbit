import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full py-6 sm:py-8">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <Image
          src="/images/hero.png"
          alt="GameOrbit hero"
          width={1672}
          height={941}
          priority
          className="h-auto w-full rounded-3xl object-cover"
        />
      </div>
    </section>
  );
}
