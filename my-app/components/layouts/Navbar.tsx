import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-slate-700"
        >
          GameOrbit
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <label className="relative hidden md:block">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
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
              className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 outline-none ring-offset-2 transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-300"
              aria-label="Search games"
            />
          </label>

          <button
            type="button"
            aria-label="Open search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
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

          <button
            type="button"
            aria-label="Open cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"
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
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
              <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
