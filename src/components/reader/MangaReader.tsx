"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Settings,
  Maximize2,
  Minimize2,
  BookOpen,
  List,
  Columns,
  Scroll,
  Layers,
  ArrowLeft,
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

  const [currentPage, setCurrentPage] = useState(0);
  const [showUi, setShowUi] = useState(true);
  const [readerMode, setReaderMode] = useState<"paged" | "scroll">(
    (initialSettings?.readerMode as any) || "paged"
  );
  const [fitMode, setFitMode] = useState<"width" | "height" | "original">(
    (initialSettings?.fitMode as any) || "width"
  );
  const [readerBg, setReaderBg] = useState<"black" | "dark" | "zinc">("black");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChaptersModal, setShowChaptersModal] = useState(false);

  // Auto-save history on page turn or mount
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
      } catch (e) {
        console.error("Progress save error:", e);
      }
    };

    const timer = setTimeout(saveProgress, 1200);
    return () => clearTimeout(timer);
  }, [mangaId, chapterId, currentPage, mangaTitle, chapterTitle, chapterNum]);

  // Auto hide UI after 4 seconds of idle
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showUi && !showSettingsModal && !showChaptersModal) {
      timer = setTimeout(() => setShowUi(false), 4500);
    }
    return () => clearTimeout(timer);
  }, [showUi, currentPage, showSettingsModal, showChaptersModal]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToNext();
      } else if (e.key === "ArrowRight") {
        goToPrev();
      } else if (e.key === "Escape") {
        router.push(mangaUrl);
      } else if (e.key === " ") {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, pages.length]);

  const goToNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (nextChapterId) {
      router.push(`/manga/${mangaId}/chapter/${nextChapterId}`);
    } else {
      toast("وصلت إلى نهاية الفصل الحالي");
    }
  };

  const goToPrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else if (prevChapterId) {
      router.push(`/manga/${mangaId}/chapter/${prevChapterId}`);
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

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden flex flex-col justify-between select-none ${bgClasses[readerBg]}`}
      dir="rtl"
    >
      {/* Top Header Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-black/85 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between transition-transform duration-300 ${
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
          {/* Quick Chapters Dropdown Button */}
          {chapters.length > 0 && (
            <button
              onClick={() => setShowChaptersModal(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="قائمة الفصول"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">الفصول</span>
            </button>
          )}

          {/* Quick Mode Toggle */}
          <button
            onClick={() => setReaderMode((m) => (m === "paged" ? "scroll" : "paged"))}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-xs flex items-center gap-1 font-semibold"
            title="تبديل وضع القراءة"
          >
            {readerMode === "paged" ? (
              <>
                <Scroll className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">تمرير</span>
              </>
            ) : (
              <>
                <Columns className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">صفحات</span>
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
        /* Webtoon Vertical Scroll Mode */
        <div
          className="w-full h-full overflow-y-auto pt-16 pb-20 px-2 sm:px-4 flex flex-col items-center"
          onClick={toggleUi}
        >
          <div className="w-full max-w-3xl space-y-1 my-auto">
            {pages.length > 0 ? (
              pages.map((pageUrl, idx) => (
                <div key={idx} className="w-full relative shadow-md">
                  <img
                    src={getSafeImageUrl(pageUrl)}
                    alt={`صفحة ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading={idx < 4 ? "eager" : "lazy"}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("/api/proxy-image")) {
                        target.src = `/api/proxy-image?url=${encodeURIComponent(pageUrl)}`;
                      }
                    }}
                    className={`mx-auto ${
                      fitMode === "width"
                        ? "w-full h-auto"
                        : fitMode === "height"
                        ? "h-screen w-auto object-contain"
                        : "max-w-none"
                    }`}
                  />
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-zinc-400">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا تتوفر صور لهذا الفصل حالياً.</p>
              </div>
            )}

            {/* End of chapter box */}
            {pages.length > 0 && (
              <div className="p-8 my-8 text-center bg-white/5 border border-white/10 rounded-2xl space-y-4 max-w-xl mx-auto">
                <h3 className="text-lg font-bold text-white">نهاية الفصل!</h3>
                <div className="flex justify-center gap-3">
                  {nextChapterId ? (
                    <Link
                      href={`/manga/${mangaId}/chapter/${nextChapterId}`}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors text-sm"
                    >
                      الانتقال للفصل التالي
                    </Link>
                  ) : (
                    <Link
                      href={mangaUrl}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      العودة للمانجا
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Paged Mode (RTL: Left click = next, Right click = prev, Center = toggle UI) */
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
                  target.src = `/api/proxy-image?url=${encodeURIComponent(pages[currentPage])}`;
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

          {/* Touch navigation zones */}
          {/* Left zone: Next page (RTL) */}
          <div
            className="absolute top-16 bottom-16 left-0 w-1/3 z-20 cursor-w-resize"
            onClick={goToNext}
            title="الصفحة التالية (يسار)"
          />
          {/* Right zone: Prev page (RTL) */}
          <div
            className="absolute top-16 bottom-16 right-0 w-1/3 z-20 cursor-e-resize"
            onClick={goToPrev}
            title="الصفحة السابقة (يمين)"
          />
          {/* Center zone: Toggle UI */}
          <div
            className="absolute top-16 bottom-16 left-1/3 right-1/3 z-10 cursor-pointer"
            onClick={toggleUi}
          />
        </div>
      )}

      {/* Bottom Control Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-black/85 backdrop-blur-md border-t border-white/10 px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] transition-transform duration-300 space-y-2 ${
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
              className="flex-1 accent-indigo-500 cursor-pointer"
            />
          </div>
        )}

        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            {prevChapterId ? (
              <Link
                href={`/manga/${mangaId}/chapter/${prevChapterId}`}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1 transition-colors"
              >
                <span>الفصل السابق</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-white/5 text-zinc-600 text-xs font-semibold cursor-not-allowed">
                أول فصل
              </span>
            )}
          </div>

          {readerMode === "paged" && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                disabled={currentPage === 0}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-white transition-colors"
              >
                السابق
              </button>
              <button
                onClick={goToNext}
                disabled={currentPage === pages.length - 1 && !nextChapterId}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-xs font-bold text-white transition-colors shadow-md shadow-indigo-500/30"
              >
                التالي
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {nextChapterId ? (
              <Link
                href={`/manga/${mangaId}/chapter/${nextChapterId}`}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>الفصل التالي</span>
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-white/5 text-zinc-600 text-xs font-semibold cursor-not-allowed">
                آخر فصل
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chapters Modal */}
      {showChaptersModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">الانتقال إلى فصل</h3>
              <button
                onClick={() => setShowChaptersModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-2 divide-y divide-zinc-800/60">
              {chapters.map((c) => (
                <Link
                  key={c.id}
                  href={`/manga/${mangaId}/chapter/${c.id}`}
                  onClick={() => setShowChaptersModal(false)}
                  className={`flex items-center justify-between p-3 rounded-xl hover:bg-indigo-950/40 text-xs sm:text-sm font-semibold transition-colors ${
                    c.id === chapterId ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/30" : "text-zinc-300"
                  }`}
                >
                  <span>{c.title}</span>
                  <span className="text-zinc-500">فصل {c.chapterNum}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>إعدادات القارئ</span>
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
              <label className="text-xs font-bold text-zinc-400 block">طريقة العرض</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setReaderMode("paged")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    readerMode === "paged"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750"
                  }`}
                >
                  نظام الصفحات
                </button>
                <button
                  onClick={() => setReaderMode("scroll")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    readerMode === "scroll"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750"
                  }`}
                >
                  تمرير عمودي (Webtoon)
                </button>
              </div>
            </div>

            {/* Fit mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block">ملاءمة الشاشة</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFitMode("width")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    fitMode === "width"
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  العرض
                </button>
                <button
                  onClick={() => setFitMode("height")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    fitMode === "height"
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  الارتفاع
                </button>
                <button
                  onClick={() => setFitMode("original")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    fitMode === "original"
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  الأصلي
                </button>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block">لون خلفية القارئ</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setReaderBg("black")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    readerBg === "black"
                      ? "bg-black text-white border-indigo-500 ring-2 ring-indigo-500/50"
                      : "bg-black text-zinc-500 border-zinc-800"
                  }`}
                >
                  أسود داكن
                </button>
                <button
                  onClick={() => setReaderBg("dark")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    readerBg === "dark"
                      ? "bg-zinc-950 text-white border-indigo-500 ring-2 ring-indigo-500/50"
                      : "bg-zinc-950 text-zinc-500 border-zinc-800"
                  }`}
                >
                  ليلي
                </button>
                <button
                  onClick={() => setReaderBg("zinc")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    readerBg === "zinc"
                      ? "bg-zinc-900 text-white border-indigo-500 ring-2 ring-indigo-500/50"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800"
                  }`}
                >
                  رمادي
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-3 bg-gradient-to-l from-indigo-500 to-purple-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/25"
            >
              تم الحفظ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
