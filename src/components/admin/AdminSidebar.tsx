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
    {
      title: "الهوية والإعدادات",
      items: [
        { href: "/admin/settings", label: "إعدادات الموقع والثيمات", icon: Sliders },
      ],
    },
  ];

  const renderNavLinks = (isMobile: boolean = false) => (
    <div className={`space-y-5 overflow-y-auto flex-1 ${isMobile ? "p-4" : collapsed ? "p-2 space-y-4" : "p-3.5 space-y-5"}`}>
      {navigationGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-1.5">
          {(!collapsed || isMobile) && (
            <span className="px-3 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
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
                      ? "bg-gradient-to-l from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-indigo-600 dark:hover:text-indigo-400"
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
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-2 mt-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>اتصال قاعدة البيانات</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            PostgreSQL متصل بنجاح مع وضع Transaction Pooler.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar with Menu Toggle */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
            aria-label="فتح القائمة"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            href="/"
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <span>الموقع</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderNavLinks(true)}

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للموقع الرئيسي</span>
          </Link>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            Admin v2.0
          </span>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-white dark:bg-zinc-900 border-l border-zinc-200/90 dark:border-zinc-800 shadow-sm transition-all duration-300 relative z-30 h-screen sticky top-0 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header & Logo */}
        <div className={`flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 ${collapsed ? "p-3 justify-center" : "p-4"}`}>
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <Logo />
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-l from-indigo-500 to-purple-600 text-white">
                Admin
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs">
              A
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${collapsed ? "mt-2" : ""}`}
            title={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        {renderNavLinks(false)}

        {/* Desktop Footer Actions */}
        <div className={`border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 ${collapsed ? "p-2 space-y-2 flex flex-col items-center" : "p-3 space-y-2"}`}>
          <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-between"}`}>
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="تبديل وضع الألوان"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {!collapsed && (
              <span className="text-[10px] font-bold text-zinc-400">
                لوحة إدارة ألفا مانجا
              </span>
            )}

            <Link
              href="/"
              className={`text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-bold ${collapsed ? "w-full justify-center" : ""}`}
              title="العودة للموقع الرئيسي"
            >
              <ArrowRight className="w-4 h-4" />
              {!collapsed && <span>الرئيسية</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
