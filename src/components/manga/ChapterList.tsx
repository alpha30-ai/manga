"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  ArrowUpDown,
  Clock,
  Globe,
  Sparkles,
  CheckCircle2,
  ListOrdered,
} from "lucide-react";
import { ChapterInfo } from "@/lib/scrapers";

export default function ChapterList({
  mangaId,
  chapters,
  lastReadChapterId,
}: {
  mangaId: string;
  chapters: ChapterInfo[];
  lastReadChapterId?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Determine available languages
  const hasArabic = chapters.some((c) => c.language === "ar");
  const hasEnglish = chapters.some((c) => c.language === "en" || !c.language);

  const minChapter = chapters.length > 0 ? Math.min(...chapters.map((c) => c.chapterNum)) : 1;
  const maxChapter = chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapterNum)) : 1;

  const filtered = chapters
    .filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.chapterNum.toString().includes(search.trim());

      const matchesLang =
        selectedLang === "all" ||
        (selectedLang === "ar" && c.language === "ar") ||
        (selectedLang === "en" && (c.language === "en" || !c.language));

      return matchesSearch && matchesLang;
    })
    .sort((a, b) => {
      return sortOrder === "desc"
        ? b.chapterNum - a.chapterNum
        : a.chapterNum - b.chapterNum;
    });

  return (
    <div className="space-y-4" dir="rtl">
      {/* Chapter Summary Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-3.5 px-5 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-zinc-100">
          <ListOrdered className="w-4 h-4 text-[#FF334B]" />
          <span>قائمة الفصول الكاملة: متوفر {chapters.length} فصل (من الفصل {minChapter} إلى الفصل {maxChapter})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 font-semibold">
          <span>جاهزة للقراءة المباشرة بأعلى جودة</span>
        </div>
      </div>

      {/* Chapter Controls Toolbar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن رقم أو اسم الفصل..."
            className="w-full pl-4 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF334B]"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Language filter */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setSelectedLang("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLang === "all"
                  ? "bg-white dark:bg-zinc-900 text-[#FF334B] shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              الكل ({chapters.length})
            </button>
            {hasArabic && (
              <button
                onClick={() => setSelectedLang("ar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedLang === "ar"
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                🇸🇦 العربية
              </button>
            )}
            {hasEnglish && (
              <button
                onClick={() => setSelectedLang("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedLang === "en"
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                🌐 إنجليزي
              </button>
            )}
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="تبديل الترتيب"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {sortOrder === "desc" ? "الأحدث أولاً" : "من البداية (الفصل 1)"}
            </span>
          </button>
        </div>
      </div>

      {/* Chapters Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-sm font-bold">لا توجد فصول مطابقة للبحث أو الفلتر المحدد.</p>
            </div>
          ) : (
            filtered.map((ch) => {
              const isLastRead = lastReadChapterId === ch.id;

              return (
                <Link
                  key={ch.id}
                  href={`/manga/${mangaId}/chapter/${ch.id}`}
                  className={`flex items-center justify-between p-4 sm:p-5 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all group ${
                    isLastRead ? "bg-rose-50/30 dark:bg-rose-950/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-[#FF334B] group-hover:text-white flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-black text-sm transition-all shadow-sm">
                      {ch.chapterNum}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-[#FF334B] transition-colors">
                          {ch.title}
                        </span>
                        {ch.language === "ar" ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded">
                            عربي
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded">
                            EN
                          </span>
                        )}
                        {isLastRead && (
                          <span className="text-[10px] font-bold text-[#FF334B] bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                            آخر ما قرأته
                          </span>
                        )}
                      </div>
                      {ch.scanlationGroup && (
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          ترجمة: {ch.scanlationGroup}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-zinc-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(ch.publishedAt).toLocaleDateString("ar-EG")}</span>
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
