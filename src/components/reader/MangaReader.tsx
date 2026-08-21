"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Settings,
  BookOpen,
  List,
  Columns,
  Scroll,
  ArrowLeft,
  Eye,
  Sliders,
  Check,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function getSafeImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/api/proxy-image") || url.startsWith("data:")) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

interface MangaReaderProps {
  pages: string[];
  mangaId: string;
  chapterId: string;
  mangaTitle: string;
  chapterTitle: string;
  chapterNum: number;
  mangaUrl: string;
  chapters?: any[];
  nextChapterId?: string | null;
  prevChapterId?: string | null;
  initialSettings?: {
    readerMode?: string;
    fitMode?: string;
    theme?: string;
  } | null;
}

export default function MangaReader({
  pages,
  mangaId,
  chapterId,
  mangaTitle,
  chapterTitle,
  chapterNum,
  mangaUrl,
  chapters = [],
  nextChapterId,
  prevChapterId,
  initialSettings,
}: MangaReaderProps) {
  const router = useRouter();

  // Reader Settings State (Default is strictly Webtoon Vertical Scroll)
  const [readerMode, setReaderMode] = useState<"scroll" | "paged">("scroll");
  const [fitMode, setFitMode] = useState<"width" | "fit" | "original">("width");
  const [readerBg, setReaderBg] = useState<"black" | "dark" | "zinc">("black");
  const [maxWidth, setMaxWidth] = useState<"full" | "lg" | "xl">("lg");

  const [currentPage, setCurrentPage] = useState(0);
  const [showUi, setShowUi] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChaptersModal, setShowChaptersModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load permanent reader settings from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alpha_manga_reader_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.readerMode) setReaderMode(parsed.readerMode);
        if (parsed.fitMode) setFitMode(parsed.fitMode);
        if (parsed.readerBg) setReaderBg(parsed.readerBg);
        if (parsed.maxWidth) setMaxWidth(parsed.maxWidth);
      } else if (initialSettings?.readerMode) {
        setReaderMode(
          initialSettings.readerMode === "paged" ? "paged" : "scroll"
        );
      }
    } catch (e) {
      console.warn("Failed to load reader settings from localStorage:", e);
    }
  }, [initialSettings]);

  // Persist settings permanently whenever changed
  const updateSettings = (updates: {
    readerMode?: "scroll" | "paged";
    fitMode?: "width" | "fit" | "original";
    readerBg?: "black" | "dark" | "zinc";
    maxWidth?: "full" | "lg" | "xl";
  }) => {
    if (updates.readerMode) setReaderMode(updates.readerMode);
    if (updates.fitMode) setFitMode(updates.fitMode);
    if (updates.readerBg) setReaderBg(updates.readerBg);
    if (updates.maxWidth) setMaxWidth(updates.maxWidth);

    const newSettings = {
      readerMode: updates.readerMode || readerMode,
      fitMode: updates.fitMode || fitMode,
      readerBg: updates.readerBg || readerBg,
      maxWidth: updates.maxWidth || maxWidth,
    };

    try {
      localStorage.setItem(
        "alpha_manga_reader_settings",
        JSON.stringify(newSettings)
      );

      // Also persist to server in background
      fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readerMode: newSettings.readerMode,
          fitMode: newSettings.fitMode,
        }),
      }).catch(() => {});
    } catch (e) {}
  };

  // Auto-save history on mount and scroll
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await fetch("/api/user/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mangaId,
            chapterId,
            pageNumber: currentPage + 1,
            mangaTitle,
            chapterTitle,
            chapterNum,
          }),
        });
      } catch (e) {}
    };

    const timer = setTimeout(saveProgress, 1200);
    return () => clearTimeout(timer);
  }, [mangaId, chapterId, currentPage, mangaTitle, chapterTitle, chapterNum]);

  // Track scroll percentage in Webtoon scroll mode
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    if (scrollHeight > 0) {
      const progress = Math.round((target.scrollTop / scrollHeight) * 100);
      setScrollProgress(progress);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToNext();
      } else if (e.key === "ArrowRight") {
        goToPrev();
      } else if (e.key === "Escape") {
        router.push(mangaUrl);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, pages.length, nextChapterId, prevChapterId]);

  const goToNext = () => {
    if (readerMode === "paged") {
      if (currentPage < pages.length - 1) {
        setCurrentPage((prev) => prev + 1);
      } else if (nextChapterId) {
        router.push(`/manga/${mangaId}/chapter/${nextChapterId}`);
      } else {
        toast("وصلت إلى نهاية الفصل الحالي");
      }
    } else if (nextChapterId) {
      router.push(`/manga/${mangaId}/chapter/${nextChapterId}`);
    }
  };

  const goToPrev = () => {
    if (readerMode === "paged") {
      if (currentPage > 0) {
        setCurrentPage((prev) => prev - 1);
      } else if (prevChapterId) {
        router.push(`/manga/${mangaId}/chapter/${prevChapterId}`);
      }
    } else if (prevChapterId) {
      router.push(`/manga/${mangaId}/chapter/${prevChapterId}`);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleUi = () => {
    setShowUi((prev) => !prev);
  };

  const bgClasses = {
    black: "bg-black text-white",
    dark: "bg-zinc-950 text-zinc-100",
    zinc: "bg-zinc-900 text-zinc-200",
  };

  const containerWidthClasses = {
    full: "w-full max-w-none",
    xl: "w-full max-w-4xl",
    lg: "w-full max-w-3xl",
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden flex flex-col justify-between select-none ${bgClasses[readerBg]}`}
      dir="rtl"
    >
      {/* Top Reading Progress Bar (Fixed) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-[#FF334B] to-rose-500 transition-all duration-150"
          style={{
            width:
              readerMode === "scroll"
                ? `${scrollProgress}%`
                : `${((currentPage + 1) / Math.max(pages.length, 1)) * 100}%`,
          }}
        />
      </div>

      {/* Top Floating Control Bar */}
      <div
        className={`fixed top-1 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between transition-transform duration-300 ${
          showUi ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={mangaUrl}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            title="العودة لصفحة المانجا"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate">
              {mangaTitle}
            </h1>
            <p className="text-[11px] text-zinc-400 truncate">
              {chapterTitle} {chapterNum ? `(فصل ${chapterNum})` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Chapters Drawer Button */}
          {chapters.length > 0 && (
            <button
              onClick={() => setShowChaptersModal(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="قائمة الفصول"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">الفصول ({chapters.length})</span>
            </button>
          )}

          {/* Quick Reader Mode Toggle (Scroll / Webtoon vs Paged) */}
          <button
            onClick={() =>
              updateSettings({
                readerMode: readerMode === "scroll" ? "paged" : "scroll",
              })
            }
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-xs flex items-center gap-1.5 font-semibold"
            title="تبديل وضع القراءة (تمرير / صفحات)"
          >
            {readerMode === "scroll" ? (
              <>
                <Scroll className="w-4 h-4 text-[#FF334B]" />
                <span className="hidden sm:inline">ويب تون (تمرير)</span>
              </>
            ) : (
              <>
                <Columns className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">نظام الصفحات</span>
              </>
            )}
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="إعدادات القارئ"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {readerMode === "scroll" ? (
        /* Webtoon Vertical Continuous Seamless Scroll */
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onClick={toggleUi}
          className="w-full h-full overflow-y-auto pt-16 pb-24 flex flex-col items-center cursor-pointer scroll-smooth"
        >
          <div className={`${containerWidthClasses[maxWidth]} space-y-0`}>
            {pages.length > 0 ? (
              pages.map((pageUrl, idx) => (
                <div key={idx} className="w-full relative select-none">
                  <img
                    src={getSafeImageUrl(pageUrl)}
                    alt={`صفحة ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading={idx < 5 ? "eager" : "lazy"}
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("/api/proxy-image")) {
                        target.src = `/api/proxy-image?url=${encodeURIComponent(
                          pageUrl
                        )}`;
                      }
                    }}
                    className={`mx-auto block ${
                      fitMode === "width"
                        ? "w-full h-auto"
                        : fitMode === "fit"
                        ? "max-h-screen w-auto object-contain"
                        : "max-w-none w-full"
                    }`}
                  />
                </div>
              ))
            ) : (
              <div className="py-28 text-center text-zinc-400">
                <BookOpen className="w-14 h-14 mx-auto mb-3 text-zinc-600 animate-pulse" />
                <p className="text-sm font-bold text-white mb-1">
                  جاري تجهيز وتحميل صفحات الفصل...
                </p>
                <p className="text-xs text-zinc-500">
                  إذا تأخر التحميل، يرجى إعادة تحديث الصفحة أو اختيار فصل آخر.
                </p>
              </div>
            )}

            {/* End of Chapter Action Box */}
            {pages.length > 0 && (
              <div className="p-8 my-10 text-center bg-white/5 border border-white/10 rounded-3xl space-y-4 max-w-xl mx-auto backdrop-blur-md">
                <div className="w-12 h-12 rounded-2xl bg-[#FF334B]/20 text-[#FF334B] flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">
                  أحسنت! وصلت إلى نهاية {chapterTitle || "الفصل"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {nextChapterId
                    ? "يمكنك الانتقال مباشرة لقراءة الفصل التالي"
                    : "هذا هو أحدث فصل متوفر حالياً لهذا العمل."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {nextChapterId ? (
                    <Link
                      href={`/manga/${mangaId}/chapter/${nextChapterId}`}
                      className="px-8 py-3.5 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 text-white font-black rounded-2xl shadow-xl shadow-rose-500/25 transition-all text-xs sm:text-sm flex items-center gap-2"
                    >
                      <span>الانتقال للفصل التالي</span>
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  ) : null}
                  <Link
                    href={mangaUrl}
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-colors text-xs sm:text-sm"
                  >
                    العودة لصفحة العمل
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Paged Mode (Single image per view) */
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {pages.length > 0 && pages[currentPage] ? (
            <img
              src={getSafeImageUrl(pages[currentPage])}
              alt={`صفحة ${currentPage + 1}`}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes("/api/proxy-image")) {
                  target.src = `/api/proxy-image?url=${encodeURIComponent(
                    pages[currentPage]
                  )}`;
                }
              }}
              className={`max-w-full max-h-full object-contain pointer-events-none transition-opacity duration-150 ${
                fitMode === "width" ? "w-full h-auto" : "h-full w-auto"
              }`}
            />
          ) : (
            <div className="text-center text-zinc-400">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا تتوفر صور لهذا الفصل حالياً.</p>
            </div>
          )}

          {/* Touch zones */}
          <div
            className="absolute top-16 bottom-16 left-0 w-1/3 z-20 cursor-w-resize"
            onClick={goToNext}
            title="الصفحة التالية (يسار)"
          />
          <div
            className="absolute top-16 bottom-16 right-0 w-1/3 z-20 cursor-e-resize"
            onClick={goToPrev}
            title="الصفحة السابقة (يمين)"
          />
          <div
            className="absolute top-16 bottom-16 left-1/3 right-1/3 z-10 cursor-pointer"
            onClick={toggleUi}
          />
        </div>
      )}

      {/* Bottom Floating Navigation Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10 px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] transition-transform duration-300 space-y-2 ${
          showUi ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {readerMode === "paged" && pages.length > 0 && (
          <div className="flex items-center justify-between max-w-2xl mx-auto gap-4">
            <span className="text-xs text-zinc-400 font-bold w-12 text-center">
              {currentPage + 1} / {pages.length}
            </span>
            <input
              type="range"
              min={0}
              max={pages.length - 1}
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value))}
              className="flex-1 accent-[#FF334B] cursor-pointer"
            />
          </div>
        )}

        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Previous Chapter */}
          <div className="flex items-center gap-2">
            {prevChapterId ? (
              <Link
                href={`/manga/${mangaId}/chapter/${prevChapterId}`}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الفصل السابق</span>
              </Link>
            ) : (
              <span className="px-3 py-2 rounded-xl bg-white/5 text-zinc-600 text-xs font-bold cursor-not-allowed">
                أول فصل
              </span>
            )}
          </div>

          {/* Quick Chapters Dropdown on Mobile */}
          <button
            onClick={() => setShowChaptersModal(true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
          >
            <List className="w-4 h-4 text-[#FF334B]" />
            <span>فصل {chapterNum || ""}</span>
          </button>

          {/* Next Chapter */}
          <div className="flex items-center gap-2">
            {nextChapterId ? (
              <Link
                href={`/manga/${mangaId}/chapter/${nextChapterId}`}
                className="px-4 py-2 rounded-xl bg-[#FF334B] hover:bg-rose-600 text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-rose-500/25 transition-colors"
              >
                <span>الفصل التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : (
              <span className="px-3 py-2 rounded-xl bg-white/5 text-zinc-600 text-xs font-bold cursor-not-allowed">
                آخر فصل
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chapters Selection Modal */}
      {showChaptersModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                <List className="w-4 h-4 text-[#FF334B]" />
                <span>قائمة فصول {mangaTitle}</span>
              </h3>
              <button
                onClick={() => setShowChaptersModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-3 divide-y divide-zinc-800/60 space-y-1">
              {chapters.map((c) => (
                <Link
                  key={c.id}
                  href={`/manga/${mangaId}/chapter/${c.id}`}
                  onClick={() => setShowChaptersModal(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl hover:bg-rose-950/40 text-xs sm:text-sm font-bold transition-colors ${
                    c.id === chapterId
                      ? "bg-[#FF334B]/20 text-[#FF334B] border border-[#FF334B]/40"
                      : "text-zinc-300"
                  }`}
                >
                  <span className="truncate">{c.title}</span>
                  <span className="text-[11px] text-zinc-500 font-mono shrink-0 mr-2">
                    فصل {c.chapterNum}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reader Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#FF334B]" />
                <span>إعدادات القارئ الدائمة</span>
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Mode selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block">
                طريقة العرض الأساسية
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ readerMode: "scroll" })}
                  className={`p-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    readerMode === "scroll"
                      ? "bg-[#FF334B] text-white border-rose-500 shadow-md shadow-rose-500/20"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750"
                  }`}
                >
                  <Scroll className="w-4 h-4" />
                  <span>تمرير عمودي (Webtoon)</span>
                </button>
                <button
                  onClick={() => updateSettings({ readerMode: "paged" })}
                  className={`p-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    readerMode === "paged"
                      ? "bg-[#FF334B] text-white border-rose-500 shadow-md shadow-rose-500/20"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750"
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span>نظام الصفحات</span>
                </button>
              </div>
            </div>

            {/* Width selection */}
            {readerMode === "scroll" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 block">
                  عرض صفحة القراءة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSettings({ maxWidth: "lg" })}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      maxWidth === "lg"
                        ? "bg-[#FF334B] text-white border-rose-500"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    افتراضي (مريح)
                  </button>
                  <button
                    onClick={() => updateSettings({ maxWidth: "xl" })}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      maxWidth === "xl"
                        ? "bg-[#FF334B] text-white border-rose-500"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    واسع (كبير)
                  </button>
                  <button
                    onClick={() => updateSettings({ maxWidth: "full" })}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      maxWidth === "full"
                        ? "bg-[#FF334B] text-white border-rose-500"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    شاشة كاملة
                  </button>
                </div>
              </div>
            )}

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block">
                لون خلفية القارئ
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateSettings({ readerBg: "black" })}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    readerBg === "black"
                      ? "bg-black text-white border-[#FF334B] ring-2 ring-rose-500/50"
                      : "bg-black text-zinc-500 border-zinc-800"
                  }`}
                >
                  أسود عميق
                </button>
                <button
                  onClick={() => updateSettings({ readerBg: "dark" })}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    readerBg === "dark"
                      ? "bg-zinc-950 text-white border-[#FF334B] ring-2 ring-rose-500/50"
                      : "bg-zinc-950 text-zinc-500 border-zinc-800"
                  }`}
                >
                  ليلي
                </button>
                <button
                  onClick={() => updateSettings({ readerBg: "zinc" })}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    readerBg === "zinc"
                      ? "bg-zinc-900 text-white border-[#FF334B] ring-2 ring-rose-500/50"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800"
                  }`}
                >
                  رمادي
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettingsModal(false);
                toast.success("تم حفظ إعدادات القارئ بشكل دائم ✓");
              }}
              className="w-full py-3 bg-gradient-to-l from-[#FF334B] to-rose-600 text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ الإعدادات وإغلاق</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
