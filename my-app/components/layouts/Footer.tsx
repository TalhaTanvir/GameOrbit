import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

const supportLinks = [
  { label: "Help Center", href: "/help-center" },
  { label: "Shipping & Delivery", href: "/shipping" },
  { label: "Returns & Exchange", href: "/returns" },
  { label: "Order Tracking", href: "/orders" },
  { label: "FAQs", href: "/faqs" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebookF },
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "X", href: "https://x.com", icon: FaXTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-black text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-6">
          <div>
            <Link href="/" className="text-3xl font-semibold leading-tight text-white">
              GameOrbit
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
              Discover top-rated games, consoles, and accessories with quick delivery and trusted support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Customer Support</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-white/75 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Shop Address</h2>
          <address className="mt-4 space-y-3 text-sm not-italic text-white/75">
            <p>14 Orbit Avenue, Pixel District, New York, NY 10001</p>
            <p>
              Phone:{" "}
              <a href="tel:+12125550191" className="transition hover:text-white">
                +1 (212) 555-0191
              </a>
            </p>
            <p>
              Email:{" "}
              <a href="mailto:support@gameorbit.com" className="transition hover:text-white">
                support@gameorbit.com
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 text-xs text-white/60 sm:px-6 lg:px-8">
          <p>(c) {new Date().getFullYear()} GameOrbit. All rights reserved.</p>
          <Link href="/terms" className="transition hover:text-white">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
