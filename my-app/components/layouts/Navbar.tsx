"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useCartStore } from "@/store/CartStore";

export default function Navbar() {
  const totalItems = useCartStore((state) => state.totalItems);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const itemCount = hasHydrated ? totalItems : 0;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[color:color-mix(in_srgb,var(--foreground)_16%,transparent)] bg-[color:color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur">
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch
          className="text-xl font-bold tracking-tight text-[var(--foreground)] transition-colors hover:text-[color:color-mix(in_srgb,var(--foreground)_70%,transparent)]"
        >
          GameOrbit
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <label className="relative hidden md:block">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[color:color-mix(in_srgb,var(--foreground)_50%,transparent)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search games"
              className="h-10 w-64 rounded-full border border-[color:color-mix(in_srgb,var(--foreground)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--background)_92%,var(--foreground)_8%)] py-2 pl-9 pr-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[color:color-mix(in_srgb,var(--foreground)_56%,transparent)] ring-offset-2 transition focus:border-[color:color-mix(in_srgb,var(--foreground)_34%,transparent)] focus:bg-[var(--background)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--foreground)_22%,transparent)]"
              aria-label="Search games"
            />
          </label>

          <button
            type="button"
            aria-label="Open search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--foreground)_18%,transparent)] text-[color:color-mix(in_srgb,var(--foreground)_82%,transparent)] transition hover:bg-[color:color-mix(in_srgb,var(--foreground)_10%,transparent)] md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <ThemeToggle />

          <Link
            href="/cart"
            prefetch
            aria-label="Open cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:color-mix(in_srgb,var(--foreground)_82%,transparent)] transition hover:bg-[color:color-mix(in_srgb,var(--foreground)_10%,transparent)]"
          >
            <HiOutlineShoppingBag className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-none text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </nav>
  );
}
