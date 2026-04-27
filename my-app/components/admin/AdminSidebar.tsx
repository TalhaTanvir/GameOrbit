"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiChevronRight,
  FiGrid,
  FiImage,
  FiPackage,
  FiX,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: FiGrid,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: FiPackage,
  },
  {
    label: "Hero Section",
    href: "/admin/hero",
    icon: FiImage,
  },
];

type AdminSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  showCloseButton?: boolean;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({
  className,
  onNavigate,
  showCloseButton = false,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col overflow-hidden border-r border-zinc-200 bg-white text-zinc-900",
        className
      )}
    >
      <div className="border-b border-zinc-200 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-center gap-3" onClick={onNavigate}>
            <span className="flex size-11 items-center justify-center rounded-xl bg-zinc-900 text-sm font-black tracking-tight text-white shadow-sm">
              GO
            </span>
            <span className="space-y-0.5">
              <span className="block text-sm font-semibold tracking-tight text-zinc-900">GameOrbit Admin</span>
              <span className="block text-xs text-zinc-500">Management Console</span>
            </span>
          </Link>

          {showCloseButton ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              onClick={onNavigate}
              aria-label="Close sidebar"
            >
              <FiX className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Navigation
        </p>

        {adminNavItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative mb-1.5 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                active
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full transition-all",
                )}
              />
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
              <FiChevronRight
                aria-hidden="true"
                className={cn(
                  "ml-auto size-4 transition",
                  active ? "text-white/70" : "text-zinc-400 group-hover:text-zinc-700"
                )}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
