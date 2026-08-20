"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import {
  Moon,
  Sun,
  Settings,
  LogOut,
  Users,
  Search,
  Home,
  Layers,
  Compass,
  Menu,
  X,
  Bookmark,
  History,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Flame,
  Clock,
  Star,
  BookOpen,
  Play,
  Layers3,
  Globe,
  Calendar,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationBell from "@/components/layout/NotificationBell";
import Logo from "@/components/layout/Logo";

export default function Header() {
  const { data: session } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const [siteSettings, setSiteSettings] = useState<{
    siteName?: string;
    logoUrl?: string;
    headerSubtitle?: string;
    announcement?: string;
    showSiteName?: boolean;
    showHeaderSubtitle?: boolean;
  }>({});

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch site branding settings & user avatar from DB
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.siteName) setSiteSettings(data);
      })
      .catch(() => {});

    if (session?.user) {
      fetch("/api/user/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data?.image) setUserAvatar(data.image);
        })
        .catch(() => {});
    }
  }, [session]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setDrawerOpen(false);
    setMegaMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Hide header in admin dashboard or full-screen reader mode
  if (pathname?.startsWith("/admin") || pathname?.includes("/chapter/")) {
    return null;
  }

  const genreColumns = [
    { name: "أكشن وإثارة", genre: "أكشن", icon: Flame, color: "text-[#FF334B] bg-[#FF334B]/10" },
    { name: "مغامرات وخيال", genre: "مغامرة", icon: Sparkles, color: "text-purple-500 bg-purple-500/10" },
    { name: "كوميديا وضحك", genre: "كوميديا", icon: Star, color: "text-yellow-500 bg-yellow-500/10" },
    { name: "دراما وتشويق", genre: "دراما", icon: BookOpen, color: "text-blue-500 bg-blue-500/10" },
    { name: "رعب وغموض", genre: "رعب", icon: Flame, color: "text-rose-500 bg-rose-500/10" },
    { name: "خارق للطبيعة", genre: "خارق للطبيعة", icon: Sparkles, color: "text-indigo-500 bg-indigo-500/10" },
  ];

  const currentAvatar = userAvatar || session?.user?.image || null;

  return (
    <>
      {/* Optional Site-wide Announcement Banner */}
      {siteSettings.announcement && (
        <div className="bg-gradient-to-r from-zinc-900 via-[#FF334B] to-zinc-900 text-white text-xs font-bold py-2 px-4 text-center shadow-inner flex items-center justify-center gap-2 border-b border-[#FF334B]/30" dir="rtl">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{siteSettings.announcement}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Right: Mobile Hamburger + Brand with AM Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-label="القائمة الجانبية"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex items-center gap-2.5 group">
                {siteSettings.logoUrl ? (
                  <img src={siteSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-2xl shrink-0" />
                ) : (
                  <Logo size={38} className="shrink-0" />
                )}

                {siteSettings.showSiteName !== false && (
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-1">
                      <span>ALPHA</span>
                      <span className="text-[#FF334B]">MANGA</span>
                    </span>
                    {siteSettings.showHeaderSubtitle !== false && (
                      <span className="text-[10px] text-zinc-400 -mt-1 hidden md:block font-bold">
                        {siteSettings.headerSubtitle || "بوابة القراءة الاحترافية"}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </div>

            {/* Center: Desktop Navigation Links with Mega Menu */}
            <nav className="hidden md:flex items-center gap-1" dir="rtl">
              <Link
                href="/"
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition-all ${
                  pathname === "/"
                    ? "text-[#FF334B] bg-[#FF334B]/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-[#FF334B] hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </Link>

              {/* Mega Menu Toggle */}
              <div className="relative" ref={megaMenuRef}>
                <button
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-xl transition-all ${
                    pathname.startsWith("/browse") || megaMenuOpen
                      ? "text-[#FF334B] bg-[#FF334B]/10"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-[#FF334B] hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>المكتبة والتصنيفات</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* The Mega Menu Container */}
                {megaMenuOpen && (
                  <div className="absolute top-full right-[-80px] mt-3 w-[720px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Col 1: Popular Genres */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF334B]" />
                            <span>أشهر التصنيفات</span>
                          </span>
                        </div>
                        <div className="space-y-1">
                          {genreColumns.map((g) => (
                            <Link
                              key={g.genre}
                              href={`/browse?genre=${encodeURIComponent(g.genre)}`}
                              className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <div className={`p-1.5 rounded-lg ${g.color}`}>
                                <g.icon className="w-3.5 h-3.5" />
                              </div>
                              <span>{g.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Col 2: Quick Discovery & Schedule */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            <span>استكشاف سريع</span>
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <Link
                            href="/browse?sort=popular"
                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors"
                          >
                            <Flame className="w-4 h-4" />
                            <span>الأكثر شعبية وقراءة</span>
                          </Link>
                          <Link
                            href="/schedule"
                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>جدول مواعيد الفصول الأسبوعي</span>
                          </Link>
                          <Link
                            href="/requests"
                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors"
                          >
                            <Inbox className="w-4 h-4" />
                            <span>طلب مانجا / إبلاغ عن فصل</span>
                          </Link>
                          <Link
                            href="/sources"
                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                          >
                            <Layers className="w-4 h-4" />
                            <span>دليل المصادر والسيرفرات</span>
                          </Link>
                        </div>
                      </div>

                      {/* Col 3: Spotlight Card */}
                      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between text-white space-y-3">
                        <div className="space-y-1.5">
                          <span className="px-2 py-0.5 bg-[#FF334B] text-[10px] font-bold rounded-md text-white">
                            عمل مميز
                          </span>
                          <h4 className="font-black text-sm text-white line-clamp-2">
                            سولو ليفلينج (Solo Leveling)
                          </h4>
                          <p className="text-[11px] text-zinc-400 line-clamp-3">
                            استمتع بجميع الفصول بجودة فائقة وتجربة قراءة سلسة ومحفوظة تلقائياً.
                          </p>
                        </div>

                        <Link
                          href="/browse?q=Solo+Leveling"
                          className="w-full py-2 bg-[#FF334B] hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>ابدأ القراءة الآن</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/schedule"
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition-all ${
                  pathname.startsWith("/schedule")
                    ? "text-[#FF334B] bg-[#FF334B]/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-[#FF334B] hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>الجدول</span>
              </Link>

              <Link
                href="/sources"
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition-all ${
                  pathname.startsWith("/sources")
                    ? "text-[#FF334B] bg-[#FF334B]/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-[#FF334B] hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>المصادر</span>
              </Link>

              <Link
                href="/community"
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition-all ${
                  pathname.startsWith("/community")
                    ? "text-[#FF334B] bg-[#FF334B]/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-[#FF334B] hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>المجتمع</span>
              </Link>
            </nav>

            {/* Left: Actions, Theme, and Profile Dropdown */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Quick Search */}
              <Link
                href="/browse"
                className="p-2 sm:p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all shrink-0"
                title="بحث في المانجا"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 sm:p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all shrink-0"
                aria-label="تبديل الوضع الليلي والنهاري"
              >
                {resolvedTheme === "dark" ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />}
              </button>

              {session ? (
                <div className="flex items-center gap-2">
                  <NotificationBell />

                  {/* User Account Dropdown with Dynamic Profile Avatar */}
                  <div className="relative" ref={userMenuRef} dir="rtl">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                    >
                      {currentAvatar ? (
                        <img
                          src={currentAvatar}
                          alt="Avatar"
                          className="w-8 h-8 rounded-xl object-cover shadow-sm border border-zinc-200 dark:border-zinc-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF334B] to-rose-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                          {session.user?.name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
                        </div>
                      )}
                      <span className="hidden md:inline-block max-w-[90px] truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {session.user?.name}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute top-full left-0 sm:right-auto mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-1.5">
                        {/* User Snapshot */}
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl flex items-center gap-3">
                          {currentAvatar ? (
                            <img
                              src={currentAvatar}
                              alt="Avatar"
                              className="w-10 h-10 rounded-xl object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF334B] to-rose-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                              {session.user?.name?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5" />}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                                {session.user?.name}
                              </span>
                              {(session.user as any)?.role === "ADMIN" && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-500 rounded-md">
                                  مدير
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 truncate" dir="ltr">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>

                        {/* Admin Link */}
                        {(session.user as any)?.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>لوحة تحكم المدير</span>
                          </Link>
                        )}

                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-indigo-500" />
                          <span>الملف الشخصي</span>
                        </Link>

                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-amber-500" />
                          <span>قائمة المفضلة</span>
                        </Link>

                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <History className="w-4 h-4 text-purple-500" />
                          <span>سجل القراءة</span>
                        </Link>

                        <Link
                          href="/requests"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Inbox className="w-4 h-4 text-blue-500" />
                          <span>طلباتي ومقترحاتي</span>
                        </Link>

                        <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-right"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Link
                    href="/auth/login"
                    className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-[#FF334B] transition-colors whitespace-nowrap"
                  >
                    دخول
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-l from-[#FF334B] to-rose-600 rounded-xl hover:opacity-95 shadow-md shadow-rose-500/20 transition-all whitespace-nowrap inline-flex items-center justify-center shrink-0"
                  >
                    حساب جديد
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Hamburger Menu) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-sm flex justify-start" dir="rtl">
          <div className="w-80 max-w-[85vw] bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Drawer Top */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setDrawerOpen(false)}>
                  <Logo size={36} />
                  {siteSettings.showSiteName !== false && (
                    <span className="font-black text-lg text-zinc-900 dark:text-white">
                      ALPHA <span className="text-[#FF334B]">MANGA</span>
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Snapshot in Mobile Drawer */}
              {session ? (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl flex items-center gap-3">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="" className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF334B] to-rose-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                      {session.user?.name?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5" />}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                      {session.user?.name}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate" dir="ltr">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-center space-y-3">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    سجل دخولك لحفظ تقدمك ومزامنة مكتبتك
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setDrawerOpen(false)}
                      className="py-2 bg-[#FF334B] text-white text-xs font-bold rounded-xl text-center shadow-sm"
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setDrawerOpen(false)}
                      className="py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl text-center"
                    >
                      إنشاء حساب
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-1.5">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Home className="w-5 h-5 text-indigo-500" />
                  <span>الرئيسية</span>
                </Link>

                <Link
                  href="/browse"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Compass className="w-5 h-5 text-purple-500" />
                  <span>تصفح المانجا والتصنيفات</span>
                </Link>

                <Link
                  href="/schedule"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span>جدول مواعيد الفصول الأسبوعي</span>
                </Link>

                <Link
                  href="/sources"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Layers className="w-5 h-5 text-emerald-500" />
                  <span>المصادر والسيرفرات</span>
                </Link>

                <Link
                  href="/community"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>مجتمع القراء</span>
                </Link>

                <Link
                  href="/requests"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Inbox className="w-5 h-5 text-rose-500" />
                  <span>طلب مانجا أو إبلاغ</span>
                </Link>

                {session && (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <UserIcon className="w-5 h-5 text-indigo-500" />
                      <span>الملف الشخصي والمكتبة</span>
                    </Link>

                    {(session.user as any)?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        <span>لوحة تحكم المدير</span>
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-zinc-500">السمة والمظهر</span>
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-2"
                >
                  {resolvedTheme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>وضع نهاري</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>وضع ليلي</span>
                    </>
                  )}
                </button>
              </div>

              {session && (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    signOut();
                  }}
                  className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
