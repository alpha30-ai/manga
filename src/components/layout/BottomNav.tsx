"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Layers, Users, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-lg shadow-black/5" dir="rtl">
      <div className="flex items-center justify-around px-1 py-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold scale-105"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
              )}
              <link.icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className="text-[11px] mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
