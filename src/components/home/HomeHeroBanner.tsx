"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Sparkles,
  Flame,
  Star,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { localizeMangaContent } from "@/lib/arabicMangaMap";
import { getSafeImageUrl } from "@/lib/imageUtils";

interface MangaSpotlight {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  genres: string[];
  status: string;
  author: string;
  latestChapter?: number;
}

export default function HomeHeroBanner({ mangaList }: { mangaList: MangaSpotlight[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultSpotlights: MangaSpotlight[] = [
    {
      id: "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0",
      title: "سولو ليفلينج (Solo Leveling)",
      description: "في عالم فُتحت فيه بوابات تربط عالمنا بأبعاد الوحوش، يُعرف سونغ جين وو بأضعف صياد في العالم من الرتبة E. ولكن بعد نجاته بمعجزة من زنزانة مزدوجة قاتلة، يكتسب قدرة النظام التي تتيح له ترقية مستواه وقواه بلا حدود!",
      coverImage: "https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/dc43e051-6cd0-4ee5-877b-3bdfc0d08656.jpg.512.jpg",
      genres: ["أكشن", "خيال", "مغامرة", "وحوش"],
      status: "مكتمل",
      author: "Chugong (تشوغونغ)",
      latestChapter: 200,
    },
    {
      id: "a1c7c817-4e59-43b7-9365-09675a149a6f",
      title: "ون بيس (One Piece)",
      description: "تبدأ أسطورة مونكي دي لوفي الذي انطلق في رحلة ملحمية عبر المحيطات برفقة طاقم قبعة القش للبحث عن الكنز الأسطوري 'ون بيس' وتحقيق حلمه الخالد بأن يصبح ملك القراصنة القادم.",
      coverImage: "https://uploads.mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/1118c728-6625-455b-b9f0-2f9b1b11b700.jpg.512.jpg",
      genres: ["مغامرة", "أكشن", "كوميديا", "خيال"],
      status: "مستمر",
      author: "Eiichiro Oda (إييتشيرو أودا)",
      latestChapter: 1120,
    },
    {
      id: "c52b2ce3-7f95-469c-96b1-692321c847e8",
      title: "جوجيتسو كايسن (Jujutsu Kaisen)",
      description: "يجد يوجي إيتادوري نفسه متورطاً في عالم اللعنات والمشعوذين بعد ابتلاعه إصبعاً ملعوناً يخص ريومين سوكونا ملك اللعنات الأسطوري لحماية أصدقائه من الهلاك.",
      coverImage: "https://uploads.mangadex.org/covers/c52b2ce3-7f95-469c-96b1-692321c847e8/ebf94488-dc92-4911-ad77-ff4f7a77d542.jpg.512.jpg",
      genres: ["أكشن", "خارق للطبيعة", "شياطين", "شونين"],
      status: "مستمر",
      author: "Gege Akutami (غيغي أكوتامي)",
      latestChapter: 271,
    },
  ];

  const rawList = mangaList && mangaList.length > 0 ? mangaList.slice(0, 5) : defaultSpotlights;
  const spotlights = rawList.map((m) => localizeMangaContent(m));
  const currentManga = spotlights[currentIndex] || defaultSpotlights[0];

  // Auto slide every 7 seconds
  useEffect(() => {
    if (spotlights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlights.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [spotlights.length]);

  return (
    <section className="relative overflow-hidden pt-3 sm:pt-6 px-3 sm:px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-2xl transition-colors duration-300 min-h-[460px] md:min-h-[560px] p-4 sm:p-8 lg:p-12 flex flex-col justify-between">
          
          {/* Blurred Background Artwork */}
          {currentManga.coverImage && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 dark:opacity-35 scale-110 blur-2xl transition-all duration-1000"
              style={{ backgroundImage: `url(${getSafeImageUrl(currentManga.coverImage)})` }}
            />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 dark:from-zinc-950 dark:via-zinc-950/90 to-transparent transition-colors" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 dark:from-zinc-950/95 dark:via-zinc-950/80 to-transparent transition-colors" />

          {/* Main Content Layout */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center flex-1">
            
            {/* Mobile-Only Header with Cover Image & Badges */}
            <div className="lg:hidden flex items-start gap-4">
              <Link
                href={`/manga/${currentManga.id}`}
                className="w-24 sm:w-32 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-zinc-800 bg-zinc-900 block"
              >
                {currentManga.coverImage ? (
                  <img
                    src={getSafeImageUrl(currentManga.coverImage)}
                    alt={currentManga.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
              </Link>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF334B]/15 text-[#FF334B] border border-[#FF334B]/30 text-[10px] font-black">
                    <Flame className="w-3 h-3 fill-[#FF334B]" />
                    <span>مميز الأسبوع</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>4.9</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight line-clamp-2">
                  {currentManga.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-md font-bold">
                    {currentManga.status || "مستمر"}
                  </span>
                  {currentManga.latestChapter && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      فصل {currentManga.latestChapter}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop & Tablet Column: Full Information */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-5">
              {/* Desktop Badges (hidden on small mobile since rendered above) */}
              <div className="hidden lg:flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF334B]/15 text-[#FF334B] border border-[#FF334B]/30 text-xs font-black shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-[#FF334B]" />
                  <span>العمل المميز هذا الأسبوع</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>تقييم 4.9 / 5.0</span>
                </span>
                {currentManga.latestChapter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <Zap className="w-3 h-3" />
                    <span>الفصل {currentManga.latestChapter} متوفر</span>
                  </span>
                )}
              </div>

              {/* Desktop Manga Title */}
              <h1 className="hidden lg:block text-3xl sm:text-5xl font-black text-slate-950 dark:text-white leading-tight tracking-tight">
                {currentManga.title}
              </h1>

              {/* Desktop Metadata */}
              <div className="hidden lg:flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-lg font-black">
                  {currentManga.status || "مستمر"}
                </span>
                <span className="text-slate-400 dark:text-zinc-600">•</span>
                <span>المؤلف: {currentManga.author || "ألفا ستوديو"}</span>
                <span className="text-slate-400 dark:text-zinc-600">•</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentManga.genres?.slice(0, 4).map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] border border-rose-200 dark:border-rose-900/50 rounded-md text-[11px] font-bold"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arabic Synopsis */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 line-clamp-2 sm:line-clamp-4 leading-relaxed max-w-xl">
                {currentManga.description}
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <Link
                  href={`/manga/${currentManga.id}`}
                  className="flex-1 sm:flex-none justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xl shadow-rose-500/30 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>ابدأ القراءة فوراً</span>
                </Link>

                <Link
                  href="/browse"
                  className="flex-1 sm:flex-none justify-center px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-slate-300 dark:border-white/15 backdrop-blur-md transition-all flex items-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>المكتبة</span>
                </Link>
              </div>

              {/* Integrated Search Box */}
              <div className="pt-1 sm:pt-2 max-w-lg">
                <form action="/browse" method="GET" className="relative">
                  <input
                    type="text"
                    name="q"
                    placeholder="ابحث عن مانجا، مانهوا، أو اسم مؤلفك المفضل..."
                    className="w-full pl-11 sm:pl-12 pr-4 sm:pr-5 py-2.5 sm:py-3 bg-slate-100/95 dark:bg-zinc-900/90 border border-slate-300 dark:border-zinc-750 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF334B] transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    className="absolute left-1.5 sm:left-2 top-1.5 sm:top-2 p-1.5 sm:p-2 bg-[#FF334B] hover:bg-rose-600 text-white rounded-lg sm:rounded-xl transition-colors shadow-md"
                    aria-label="بحث"
                  >
                    <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Desktop-Only Left Column: Ultra-Sharp Featured Manga Poster Card */}
            <div className="lg:col-span-5 hidden lg:flex justify-center items-center">
              <Link
                href={`/manga/${currentManga.id}`}
                className="group relative block w-72 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 dark:border-zinc-800 bg-zinc-900 transition-all duration-500 hover:scale-105 hover:rotate-1"
              >
                {currentManga.coverImage ? (
                  <img
                    src={getSafeImageUrl(currentManga.coverImage)}
                    alt={currentManga.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                    <BookOpen className="w-16 h-16" />
                  </div>
                )}

                {/* Poster Overlay with Floating Badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-[#FF334B] text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>مميز</span>
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 left-4 space-y-1">
                  <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>عمل متصدر التقييمات</span>
                  </span>
                  <h3 className="font-black text-white text-base truncate">
                    {currentManga.title}
                  </h3>
                </div>
              </Link>
            </div>

          </div>

          {/* Carousel Slide Indicators & Arrows */}
          {spotlights.length > 1 && (
            <div className="relative z-10 pt-3 sm:pt-6 flex items-center justify-between border-t border-slate-200/80 dark:border-zinc-800/80 mt-4 sm:mt-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {spotlights.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 sm:h-2.5 rounded-full transition-all ${
                      currentIndex === i
                        ? "w-6 sm:w-8 bg-[#FF334B] shadow-md shadow-rose-500/30"
                        : "w-2 sm:w-2.5 bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400"
                    }`}
                    aria-label={`شريحة ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setCurrentIndex((prev) => (prev === 0 ? spotlights.length - 1 : prev - 1))}
                  className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                  aria-label="السابق"
                >
                  <ChevronRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlights.length)}
                  className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                  aria-label="التالي"
                >
                  <ChevronLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
