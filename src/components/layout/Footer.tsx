"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import DeveloperSignature from "@/components/layout/DeveloperSignature";
import { useState, useEffect } from "react";

export default function Footer() {
  const pathname = usePathname();
  const [siteSettings, setSiteSettings] = useState<{
    siteName?: string;
    logoUrl?: string;
    footerText?: string;
    developerCredit?: string;
    showSiteName?: boolean;
    showFooterText?: boolean;
  }>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSiteSettings(data);
      })
      .catch(() => {});
  }, []);

  // Hide footer in admin dashboard or full-screen reader mode
  if (pathname?.startsWith("/admin") || pathname?.includes("/chapter/")) {
    return null;
  }

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl mb-16 md:mb-0 transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              {siteSettings.logoUrl ? (
                <img src={siteSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-2xl" />
              ) : (
                <Logo size={42} />
              )}
              {siteSettings.showSiteName !== false && (
                <div className="flex flex-col">
                  <span className="text-xl font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-1">
                    <span>ALPHA</span>
                    <span className="text-[#FF334B]">MANGA</span>
                  </span>
                  {siteSettings.showFooterText !== false && (
                    <span className="text-[10px] text-zinc-400 -mt-1 font-bold">
                      {siteSettings.footerText || "المنصة العربية الأولى للمانجا والمانهوا"}
                    </span>
                  )}
                </div>
              )}
            </Link>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              أفضل منصة عربية احترافية لقراءة المانجا والمانهوا الكورية بأعلى جودة وتجربة قراءة متميزة ومحفوظة بالكامل في قاعدة البيانات.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#FF334B] font-bold border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF334B] animate-pulse" />
                <span>إصدار ألفا برو 4.5</span>
              </span>
              <span className="text-[11px] px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold border border-zinc-200 dark:border-zinc-700">
                Next.js 16 + Turbopack
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white mb-4 tracking-wider">
              استكشاف المنصة
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-xs sm:text-sm text-zinc-500 hover:text-[#FF334B] transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-xs sm:text-sm text-zinc-500 hover:text-[#FF334B] transition-colors">
                  تصفح المانجا
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-xs sm:text-sm text-zinc-500 hover:text-[#FF334B] transition-colors">
                  جدول مواعيد الفصول الأسبوعي
                </Link>
              </li>
              <li>
                <Link href="/sources" className="text-xs sm:text-sm text-zinc-500 hover:text-[#FF334B] transition-colors">
                  المصادر والسيرفرات
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-xs sm:text-sm text-zinc-500 hover:text-[#FF334B] transition-colors">
                  مجتمع القراء
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white mb-4 tracking-wider">
              الحساب والخدمات
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/auth/login" className="text-xs sm:text-sm text-zinc-500 hover:text-[#FF334B] transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-xs sm:text-sm text-zinc-500 hover:text-[#FF334B] transition-colors">
                  إنشاء حساب جديد
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-xs sm:text-sm text-zinc-500 hover:text-[#FF334B] transition-colors">
                  سجل القراءة والمفضلة
                </Link>
              </li>
              <li>
                <Link href="/requests" className="text-xs sm:text-sm text-zinc-500 hover:text-[#FF334B] transition-colors">
                  طلب عمل / إبلاغ عن مشكلة
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Full-Width Unified Cybernetic Developer & Platform System Bar */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
          <DeveloperSignature siteName={siteSettings.siteName} />
        </div>
      </div>
    </footer>
  );
}
