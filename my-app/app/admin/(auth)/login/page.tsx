"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiLock, FiShield } from "react-icons/fi";
import { toast } from "sonner";

import { apiClient, getApiErrorMessage } from "@/lib/http/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LAST_ADMIN_PATH_STORAGE_KEY = "gameorbit_admin_last_path";

function sanitizeAdminPath(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  const normalizedPath = path.trim();

  if (!normalizedPath.startsWith("/admin") || normalizedPath.startsWith("//")) {
    return null;
  }

  if (normalizedPath === "/admin/login" || normalizedPath.startsWith("/admin/login?")) {
    return null;
  }

  return normalizedPath;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    const nextFromQuery = sanitizeAdminPath(searchParams.get("next"));

    if (nextFromQuery) {
      return nextFromQuery;
    }

    if (typeof window !== "undefined") {
      const nextFromStorage = sanitizeAdminPath(window.localStorage.getItem(LAST_ADMIN_PATH_STORAGE_KEY));

      if (nextFromStorage) {
        return nextFromStorage;
      }
    }

    return "/admin";
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      await apiClient.post("/auth/login", {
        email,
        password,
      });

      toast.success("Logged in successfully.");
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Login failed. Please check your credentials."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/70 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FiShield className="size-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-3xl font-bold sm:text-4xl">Admin Panel Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-bold">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@gameorbit.com"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-base font-bold">
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  required
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t text-xs text-muted-foreground">
          This area is restricted to authorized administrators.
        </CardFooter>
      </Card>
    </main>
  );
}
