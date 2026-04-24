"use client";

import { useThemeStore } from "@/store/ThemeStore";
import ToggleSwitch from "./ToggleSwitch";

export default function ThemeToggle() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const setMode = useThemeStore((state) => state.setMode);
  const checked = resolvedTheme === "dark";

  const handleChange = () => {
    setMode(checked ? "light" : "dark");
  };

  return (
    <ToggleSwitch
      checked={checked}
      onChange={handleChange}
      ariaLabel="Toggle light and dark theme"
    />
  );
}
