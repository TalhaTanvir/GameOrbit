"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { HiArrowUp } from "react-icons/hi2";

const SCROLL_TRIGGER_PX = 280;
const WHATSAPP_NUMBER = "12125550191";
const WHATSAPP_MESSAGE = encodeURIComponent("Hi GameOrbit! I need help with my order.");

export default function FloatingActionButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > SCROLL_TRIGGER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_-16px_rgba(37,211,102,0.95)] transition-all hover:-translate-y-0.5 hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <FaWhatsapp className="h-6 w-6" aria-hidden="true" />
      </a>

      <button
        type="button"
        aria-label="Scroll to top"
        onClick={handleScrollTop}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--foreground)_16%,transparent)] bg-[color:color-mix(in_srgb,var(--background)_86%,var(--foreground)_14%)] text-[var(--foreground)] shadow-[0_12px_24px_-16px_rgba(0,0,0,0.7)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--foreground)_26%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          showScrollTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <HiArrowUp className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
