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
  rating?: number;
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
                    <span>تقييم القراء</span>
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
              {/* Desktop Badges */}
              <div className="hidden lg:flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF334B]/15 text-[#FF334B] border border-[#FF334B]/30 text-xs font-black shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-[#FF334B]" />
                  <span>العمل المميز هذا الأسبوع</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>تقييم تفاعلي مباشر</span>
                </span>
                {currentManga.latestChapter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5" />
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

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-4">
                {currentManga.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/manga/${currentManga.id}`}
                  className="px-6 sm:px-8 py-3.5 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-500/25 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>ابدأ القراءة الآن</span>
                </Link>

                <Link
                  href={`/manga/${currentManga.id}`}
                  className="px-5 sm:px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>تفاصيل العمل</span>
                </Link>
              </div>
            </div>

            {/* Desktop Only 3D Layered Artwork Cover */}
            <div className="hidden lg:block lg:col-span-5 relative group">
              <div className="relative mx-auto w-64 xl:w-72 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 dark:border-zinc-800/80 group-hover:scale-105 transition-all duration-500 bg-zinc-900">
                {currentManga.coverImage ? (
                  <img
                    src={getSafeImageUrl(currentManga.coverImage)}
                    alt={currentManga.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <BookOpen className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-white">
                  <span className="text-xs font-bold bg-[#FF334B] px-2.5 py-1 rounded-lg">
                    {currentManga.status || "مستمر"}
                  </span>
                  {currentManga.latestChapter && (
                    <span className="text-xs font-bold text-emerald-400">
                      فصل {currentManga.latestChapter}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Slider Indicators */}
          <div className="relative z-10 pt-4 flex items-center justify-between border-t border-slate-200/60 dark:border-zinc-800/60 mt-4">
            <div className="flex items-center gap-2">
              {spotlights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-8 bg-[#FF334B]"
                      : "w-2 bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400"
                  }`}
                  aria-label={`الشريحة ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev === 0 ? spotlights.length - 1 : prev - 1))
                }
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                aria-label="السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlights.length)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                aria-label="التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
