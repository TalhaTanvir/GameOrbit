"use client";

import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === "light" || value === "dark" || value === "system";

const resolveSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resolveThemeMode = (mode: ThemeMode): ResolvedTheme =>
  mode === "system" ? resolveSystemTheme() : mode;

type ThemeStore = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  hasHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  hydrateFromStorage: () => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: "system",
  resolvedTheme: "light",
  hasHydrated: false,
  setMode: (mode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }

    set({
      mode,
      resolvedTheme: resolveThemeMode(mode),
    });
  },
  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
  hydrateFromStorage: () => {
    if (typeof window === "undefined") {
      set({ hasHydrated: true });
      return;
    }

    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const mode = isThemeMode(stored) ? stored : "system";

    set({
      mode,
      resolvedTheme: resolveThemeMode(mode),
      hasHydrated: true,
    });
  },
}));
