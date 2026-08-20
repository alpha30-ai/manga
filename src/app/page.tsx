import Link from "next/link";
import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import prisma from "@/lib/prisma";
import HomeHeroBanner from "@/components/home/HomeHeroBanner";
import {
  BookOpen,
  Star,
  Clock,
  Flame,
  Layers,
  ArrowRight,
  Zap,
} from "lucide-react";

export default async function HomePage() {
  const scraper = new MangaDexScraper();
  let popularManga: any[] = [];
  let latestManga: any[] = [];
  let sources: any[] = [];

  try {
    const [popular, latest, dbSources] = await Promise.all([
      scraper.getPopularManga(12),
      scraper.getLatestUpdates(12),
      prisma.mangaSource.findMany({ where: { isActive: true }, take: 6 }),
    ]);

    popularManga = popular;
    latestManga = latest;
    sources = dbSources;
  } catch (e) {
    console.error("Failed to fetch homepage manga:", e);
  }

  return (
    <div className="min-h-screen space-y-12 md:space-y-16 pb-12" dir="rtl">
      {/* Supercharged Dynamic Hero Banner */}
      <HomeHeroBanner mangaList={popularManga} />

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
        {/* Section 1: Popular Manga */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-amber-500/20">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">الأكثر شعبية وقراءة</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">أشهر الأعمال التي يتابعها القراء حالياً</p>
              </div>
            </div>
            <Link
              href="/browse?sort=popular"
              className="text-xs font-bold text-[#FF334B] hover:underline flex items-center gap-1"
            >
              <span>عرض المزيد</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {popularManga.map((manga) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="group flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-zinc-800/80 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  {manga.coverImage ? (
                    <img
                      src={manga.coverImage}
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 right-2 left-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FF334B] text-white rounded-md">
                      {manga.status || "مستمر"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#FF334B] transition-colors">
                    {manga.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <span className="truncate max-w-[90px]">{manga.author || "مانجاكا"}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> 4.9
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2: Latest Updates */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">أحدث الفصول والتحديثات</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">تمت إضافتها وتحديث فصولها مؤخراً</p>
              </div>
            </div>
            <Link
              href="/browse?sort=latest"
              className="text-xs font-bold text-[#FF334B] hover:underline flex items-center gap-1"
            >
              <span>عرض المزيد</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {latestManga.map((manga) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="group flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-zinc-800/80 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  {manga.coverImage ? (
                    <img
                      src={manga.coverImage}
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-md flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" />
                      <span>جديد</span>
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#FF334B] transition-colors">
                    {manga.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <span className="truncate">{manga.genres?.[0] || "مانجا"}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">فصل جديد</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3: Sources & Infrastructure Preview */}
        {sources.length > 0 && (
          <section className="p-6 sm:p-8 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-black text-slate-950 dark:text-white">المصادر المعتمدة والسيرفرات النشطة</h3>
              </div>
              <Link href="/sources" className="text-xs font-bold text-[#FF334B] hover:underline">
                استعراض كافة المصادر
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sources.map((s) => (
                <Link
                  key={s.id}
                  href={`/sources/${s.id}`}
                  className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between hover:border-[#FF334B]/50 transition-colors"
                >
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    نشط ✓
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
