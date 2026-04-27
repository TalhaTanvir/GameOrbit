"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { cn } from "@/lib/utils";

const LAST_ADMIN_PATH_STORAGE_KEY = "gameorbit_admin_last_path";

type AdminDashboardShellProps = {
  children: ReactNode;
};

export default function AdminDashboardShell({ children }: AdminDashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    if (!pathname.startsWith("/admin")) {
      return;
    }

    if (pathname === "/admin/login") {
      return;
    }

    const search = searchParams.toString();
    const fullPath = search ? `${pathname}?${search}` : pathname;

    try {
      window.localStorage.setItem(LAST_ADMIN_PATH_STORAGE_KEY, fullPath);
    } catch {
      // Ignore storage errors in restricted browser modes.
    }
  }, [pathname, searchParams]);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-screen">
          <AdminSidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
          <main className="flex-1 bg-white p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      <button
        type="button"
        aria-label="Close sidebar overlay"
        onClick={() => setIsMobileSidebarOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden",
          isMobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-out lg:hidden",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar
          className="h-full shadow-2xl"
          showCloseButton
          onNavigate={() => setIsMobileSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
