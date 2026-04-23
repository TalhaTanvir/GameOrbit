"use client";

import { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getResolvedTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const currentTheme = document.documentElement.dataset.theme;
  if (currentTheme === "light" || currentTheme === "dark") {
    return currentTheme;
  }

  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return getSystemTheme();
}

export default function ThemeToggle() {
  const [checked, setChecked] = useState(() => {
    const theme = getResolvedTheme();
    document.documentElement.dataset.theme = theme;
    return theme === "dark";
  });

  const handleChange = () => {
    const nextTheme: Theme = checked ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
    setChecked(nextTheme === "dark");
  };

  return (
    <ToggleSwitch
      checked={checked}
      onChange={handleChange}
      ariaLabel="Toggle light and dark theme"
    />
  );
}
