"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Layers, Users, User, Bookmark } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const { currentPalette } = useTheme();

  // Do not show bottom nav inside admin panel or full screen reader
  if (pathname?.startsWith("/admin") || pathname?.includes("/chapter/")) {
    return null;
  }

  const links = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/browse", label: "تصفح", icon: Compass },
    { href: "/sources", label: "المصادر", icon: Layers },
    { href: "/community", label: "المجتمع", icon: Users },
    { href: "/profile", label: "حسابي", icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-zinc-800/90 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-2xl shadow-black/10 transition-colors"
      dir="rtl"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname?.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "font-black scale-105"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
              }`}
              style={{
                color: isActive ? currentPalette.hex : undefined,
              }}
            >
              {/* Top Laser Indicator on Active */}
              {isActive && (
                <>
                  <span
                    className="absolute -top-2 w-8 h-1 rounded-full shadow-md"
                    style={{
                      backgroundColor: currentPalette.hex,
                      boxShadow: `0 0 10px ${currentPalette.glow || currentPalette.hex}`,
                    }}
                  />
                  <span
                    className="absolute inset-0 rounded-2xl opacity-15 pointer-events-none"
                    style={{ backgroundColor: currentPalette.hex }}
                  />
                </>
              )}

              <link.icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                }`}
              />
              <span className="text-[11px] mt-0.5 tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
