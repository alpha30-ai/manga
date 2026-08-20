"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

export interface ColorPalette {
  name: string;
  hex: string;
  hoverHex: string;
  rgb: string;
  gradient: string;
  gradientFrom: string;
  gradientTo: string;
  glow: string;
}

export const COLOR_MAP: Record<string, ColorPalette> = {
  crimson: {
    name: "الياقوتي القرمزي (Crimson Alpha)",
    hex: "#FF334B",
    hoverHex: "#E11D48",
    rgb: "255, 51, 75",
    gradient: "from-[#FF334B] to-rose-600",
    gradientFrom: "#FF334B",
    gradientTo: "#E11D48",
    glow: "rgba(255, 51, 75, 0.25)",
  },
  indigo: {
    name: "النيلي الملكي (Royal Indigo)",
    hex: "#6366F1",
    hoverHex: "#4F46E5",
    rgb: "99, 102, 241",
    gradient: "from-indigo-500 to-purple-600",
    gradientFrom: "#6366F1",
    gradientTo: "#9333EA",
    glow: "rgba(99, 102, 241, 0.25)",
  },
  purple: {
    name: "البنفسجي الإمبراطوري (Imperial Purple)",
    hex: "#A855F7",
    hoverHex: "#9333EA",
    rgb: "168, 85, 247",
    gradient: "from-purple-500 to-pink-600",
    gradientFrom: "#A855F7",
    gradientTo: "#EC4899",
    glow: "rgba(168, 85, 247, 0.25)",
  },
  emerald: {
    name: "الزمردي النقي (Emerald Green)",
    hex: "#10B981",
    hoverHex: "#059669",
    rgb: "16, 185, 129",
    gradient: "from-emerald-500 to-teal-600",
    gradientFrom: "#10B981",
    gradientTo: "#0D9488",
    glow: "rgba(16, 185, 129, 0.25)",
  },
  amber: {
    name: "الذهبي المشع (Sun Amber)",
    hex: "#F59E0B",
    hoverHex: "#D97706",
    rgb: "245, 158, 11",
    gradient: "from-amber-500 to-orange-600",
    gradientFrom: "#F59E0B",
    gradientTo: "#EA580C",
    glow: "rgba(245, 158, 11, 0.25)",
  },
  cyan: {
    name: "السايان المستقبلي (Cyber Cyan)",
    hex: "#06B6D4",
    hoverHex: "#0891B2",
    rgb: "6, 182, 212",
    gradient: "from-cyan-500 to-blue-600",
    gradientFrom: "#06B6D4",
    gradientTo: "#2563EB",
    glow: "rgba(6, 182, 212, 0.25)",
  },
};

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  currentPalette: ColorPalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [accentColor, setAccentColorState] = useState<string>("crimson");

  const applyTheme = useCallback((t: Theme) => {
    const resolved = t === "system" ? getSystemTheme() : t;
    setResolvedTheme(resolved);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
  }, []);

  const applyAccentColor = useCallback((colorKey: string) => {
    const palette = COLOR_MAP[colorKey] || COLOR_MAP.crimson;
    const root = document.documentElement;
    root.style.setProperty("--primary-brand", palette.hex);
    root.style.setProperty("--primary-brand-hover", palette.hoverHex);
    root.style.setProperty("--primary-brand-rgb", palette.rgb);
    root.style.setProperty("--primary-brand-glow", palette.glow);
    root.style.setProperty("--primary-brand-from", palette.gradientFrom);
    root.style.setProperty("--primary-brand-to", palette.gradientTo);
    root.setAttribute("data-theme-color", colorKey);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("alpha-manga-theme", newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  const setAccentColor = useCallback((newColor: string) => {
    setAccentColorState(newColor);
    localStorage.setItem("alpha-manga-accent", newColor);
    applyAccentColor(newColor);
  }, [applyAccentColor]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("alpha-manga-theme") as Theme | null;
    const initialTheme = storedTheme || "system";
    setThemeState(initialTheme);
    applyTheme(initialTheme);

    const storedAccent = localStorage.getItem("alpha-manga-accent") || "crimson";
    setAccentColorState(storedAccent);
    applyAccentColor(storedAccent);

    // Fetch live site settings for primary theme color
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.themeColor && COLOR_MAP[data.themeColor]) {
          setAccentColorState(data.themeColor);
          applyAccentColor(data.themeColor);
        }
      })
      .catch(() => {});
  }, [applyTheme, applyAccentColor]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  const currentPalette = COLOR_MAP[accentColor] || COLOR_MAP.crimson;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, accentColor, setAccentColor, currentPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
