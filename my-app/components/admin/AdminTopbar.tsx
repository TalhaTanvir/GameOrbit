"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiChevronDown,
  FiLoader,
  FiLogOut,
  FiMenu,
  FiUser,
} from "react-icons/fi";
import { toast } from "sonner";

import { apiClient, getApiErrorMessage } from "@/lib/http/api-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AdminTopbarProps = {
  onOpenSidebar: () => void;
};

export default function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await apiClient.post("/auth/logout");
      toast.success("Logged out successfully.");
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Logout failed. Please try again."));
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white text-zinc-900">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <FiMenu className="size-4" aria-hidden="true" />
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-zinc-200 bg-zinc-50 pl-1.5 pr-1.5 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-zinc-900 text-white ring-2 ring-white">
                  <FiUser className="size-3.5" aria-hidden="true" />
                </span>
                <span className="hidden text-sm font-medium sm:inline">Admin</span>
                <span className="flex size-6 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200">
                  <FiChevronDown className="size-3.5" aria-hidden="true" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  void handleLogout();
                }}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? <FiLoader className="size-4 animate-spin" aria-hidden="true" /> : <FiLogOut className="size-4" aria-hidden="true" />}
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div aria-hidden="true" className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
    </header>
  );
}
