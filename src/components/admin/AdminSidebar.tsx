"use client";

import React, { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import Logo from "@/components/layout/Logo";

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const renderNavLinks = (isMobile: boolean = false) => (
    <div className={`space-y-5 overflow-y-auto flex-1 ${isMobile ? "p-4" : collapsed ? "p-2 space-y-4" : "p-3.5 space-y-5"}`}>
      {navigationGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-1.5">
          {(!collapsed || isMobile) && (
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
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-l from-[#FF334B] to-rose-600 text-white shadow-lg shadow-rose-500/25"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-[#FF334B] dark:hover:text-[#FF334B]"
                  } ${collapsed && !isMobile ? "justify-center px-0 w-full" : ""}`}
                  title={collapsed && !isMobile ? link.label : undefined}
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  {(!collapsed || isMobile) && <span className="truncate">{link.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Quick Database Status Badge */}
      {(!collapsed || isMobile) && (
        <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-750 rounded-2xl space-y-2 mt-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>حالة اتصال الداتابيز</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400">
            اتصال PostgreSQL نشط ومستقر مع نبضات Keep-Alive.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. MOBILE TOP HEADER (md:hidden) */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between shadow-sm" dir="rtl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="فتح قائمة الإدارة"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <Logo size={32} />
            <div className="flex flex-col">
              <span className="font-black text-xs text-slate-950 dark:text-white">
                ألفا إنتربرايز
              </span>
              <span className="text-[9px] text-[#FF334B] font-bold">
                لوحة الإدارة
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Theme Switch */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="تبديل المظهر"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Quick Back to Site */}
          <Link
            href="/"
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>الموقع</span>
          </Link>
        </div>
      </div>

      {/* 2. MOBILE DRAWER SLIDE-OVER (md:hidden) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-sm flex justify-start" dir="rtl">
          <div className="w-72 max-w-[85vw] bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Top */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-850/50">
              <div className="flex items-center gap-2.5">
                <Logo size={32} />
                <div>
                  <h3 className="font-black text-sm text-slate-950 dark:text-white">
                    ألفا إنتربرايز
                  </h3>
                  <span className="text-[10px] text-[#FF334B] font-bold">
                    لوحة التحكم الشاملة
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            {renderNavLinks(true)}

            {/* Drawer Bottom */}
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-2 bg-slate-50/50 dark:bg-zinc-850/50">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 bg-slate-200/80 dark:bg-zinc-800 hover:bg-[#FF334B] hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة إلى الموقع الرئيسي</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. DESKTOP PERMANENT SIDEBAR (hidden md:flex) */}
      <aside
        className={`hidden md:flex bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex-col justify-between transition-all duration-300 z-30 shrink-0 h-screen sticky top-0 shadow-sm ${
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

          {/* Desktop Nav Links */}
          {renderNavLinks(false)}
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
    </>
  );
}
