"use client";

import { useEffect, useMemo, useState } from "react";
import { FiLoader } from "react-icons/fi";

import { apiClient } from "@/lib/http/api-client";

type HeroImage = {
  id: string;
  imageUrl: string;
  title: string;
  altText: string;
  displayOrder: number;
};

const FALLBACK_HERO_IMAGE: HeroImage = {
  id: "fallback",
  imageUrl: "/images/hero.png",
  title: "GameOrbit Hero",
  altText: "GameOrbit hero banner",
  displayOrder: 0,
};

function parseHeroImages(payload: unknown): HeroImage[] {
  const root = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null;
  const data = typeof root?.data === "object" && root.data !== null ? (root.data as Record<string, unknown>) : null;
  const list = Array.isArray(data?.items) ? data.items : [];

  return list
    .map((item, index) => {
      const heroImage = item as {
        id?: string;
        imageUrl?: string;
        title?: string;
        altText?: string;
        displayOrder?: number;
      };

      if (!heroImage.imageUrl) {
        return null;
      }

      return {
        id: heroImage.id ?? `hero-${index}`,
        imageUrl: heroImage.imageUrl,
        title: heroImage.title ?? "",
        altText: heroImage.altText ?? "GameOrbit hero image",
        displayOrder: Number.isFinite(heroImage.displayOrder) ? Number(heroImage.displayOrder) : index,
      } satisfies HeroImage;
    })
    .filter((heroImage): heroImage is HeroImage => heroImage !== null)
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

export default function Hero() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadHeroImages() {
      try {
        setIsLoading(true);
        const response = await apiClient.get("/hero-images");

        if (mounted) {
          setHeroImages(parseHeroImages(response.data));
        }
      } catch {
        if (mounted) {
          setHeroImages([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHeroImages();

    return () => {
      mounted = false;
    };
  }, []);

  const activeHeroImage = useMemo(() => heroImages[0] ?? FALLBACK_HERO_IMAGE, [heroImages]);

  return (
    <section className="w-full py-6 sm:py-8">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-muted">
          {isLoading ? (
            <div className="flex min-h-[240px] items-center justify-center sm:min-h-[340px] lg:min-h-[460px]">
              <FiLoader className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeHeroImage.imageUrl}
              alt={activeHeroImage.altText}
              className="h-auto w-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
