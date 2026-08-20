"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Layers,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
  Palette,
  Wrench,
  Activity,
  Database,
  Lock,
  Inbox,
  Calendar,
  Bot,
} from "lucide-react";
import Logo from "@/components/layout/Logo";

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  const navigationGroups = [
    {
      title: "الرئيسية والتحليلات",
      items: [
        { href: "/admin", label: "نظرة عامة والتحليلات", icon: LayoutDashboard },
      ],
    },
    {
      title: "الهوية والثيمات",
      items: [
        { href: "/admin/settings", label: "إعدادات الموقع والثيمات", icon: Sliders },
      ],
    },
    {
      title: "المحتوى والمصادر",
      items: [
        { href: "/admin/crawler", label: "نظام الجلب وسحب الفصول", icon: Bot },
        { href: "/admin/sources", label: "إدارة المصادر والسيرفرات", icon: Layers },
        { href: "/admin/requests", label: "طلبات ومقترحات القراء", icon: Inbox },
      ],
    },
    {
      title: "المستخدمين والمجتمع",
      items: [
        { href: "/admin/users", label: "إدارة المستخدمين والأعضاء", icon: Users },
        { href: "/admin/comments", label: "مراقبة التعليقات والنقاشات", icon: MessageSquare },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 h-screen shadow-sm ${
        collapsed ? "w-[72px]" : "w-72"
      }`}
      dir="rtl"
    >
      {/* Top Brand Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div
          className={`border-b border-slate-200 dark:border-zinc-800 flex items-center transition-all ${
            collapsed
              ? "flex-col p-3 gap-3 justify-center"
              : "p-4 sm:p-5 justify-between"
          }`}
        >
          <Link
            href="/admin"
            className={`flex items-center gap-3 overflow-hidden ${
              collapsed ? "justify-center" : ""
            }`}
            title="ألفا إنتربرايز - لوحة الإدارة"
          >
            <Logo size={36} />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-sm text-slate-950 dark:text-white truncate">
                  ألفا إنتربرايز
                </span>
                <span className="text-[10px] text-[#FF334B] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>لوحة الإدارة الشاملة</span>
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div
          className={`space-y-6 overflow-y-auto flex-1 hide-scrollbar ${
            collapsed ? "p-2 space-y-4" : "p-3.5 space-y-6"
          }`}
        >
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              {!collapsed && (
                <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                  {group.title}
                </span>
              )}

              <div className="space-y-1">
                {group.items.map((link) => {
                  const isActive =
                    link.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-gradient-to-l from-[#FF334B] to-rose-600 text-white shadow-lg shadow-rose-500/25"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-[#FF334B] dark:hover:text-[#FF334B]"
                      } ${collapsed ? "justify-center px-0 w-full" : ""}`}
                      title={collapsed ? link.label : undefined}
                    >
                      <link.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span className="truncate">{link.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick System Badge in Dark & Light Modes */}
          {!collapsed && (
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-750 rounded-2xl space-y-2 mt-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>حالة اتصال الداتابيز</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                اتصال PostgreSQL نشط مع نبضات Keep-Alive التلقائية.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Theme Switcher & Back to Site */}
      <div className={`border-t border-slate-200 dark:border-zinc-800 space-y-2 ${collapsed ? "p-2" : "p-3.5"}`}>
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors ${
            collapsed ? "justify-center px-0" : "justify-between"
          }`}
          title="تبديل الوضع الليلي والنهاري"
        >
          <div className="flex items-center gap-2">
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            {!collapsed && <span>{resolvedTheme === "dark" ? "وضع نهاري" : "وضع ليلي"}</span>}
          </div>
        </button>

        {/* Back to Website */}
        <Link
          href="/"
          className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-[#FF334B] dark:hover:text-[#FF334B] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title="العودة للموقع الرئيسي"
        >
          <ArrowRight className="w-4 h-4 shrink-0" />
          {!collapsed && <span>العودة للموقع</span>}
        </Link>
      </div>
    </aside>
  );
}
