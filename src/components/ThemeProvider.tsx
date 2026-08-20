"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const COLOR_MAP: Record<string, { hex: string; hoverHex: string; gradient: string }> = {
  crimson: { hex: "#FF334B", hoverHex: "#E11D48", gradient: "from-[#FF334B] to-rose-600" },
  rose: { hex: "#FF334B", hoverHex: "#E11D48", gradient: "from-[#FF334B] to-rose-600" },
  indigo: { hex: "#6366F1", hoverHex: "#4F46E5", gradient: "from-indigo-500 to-purple-600" },
  purple: { hex: "#A855F7", hoverHex: "#9333EA", gradient: "from-purple-500 to-pink-600" },
  emerald: { hex: "#10B981", hoverHex: "#059669", gradient: "from-emerald-500 to-teal-600" },
  amber: { hex: "#F59E0B", hoverHex: "#D97706", gradient: "from-amber-500 to-orange-600" },
  cyan: { hex: "#06B6D4", hoverHex: "#0891B2", gradient: "from-cyan-500 to-blue-600" },
};

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

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
