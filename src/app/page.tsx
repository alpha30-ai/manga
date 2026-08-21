import Link from "next/link";
import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import prisma from "@/lib/prisma";
import HomeHeroBanner from "@/components/home/HomeHeroBanner";
import { getSafeImageUrl } from "@/lib/imageUtils";
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
  const ratingsMap = new Map<string, { avg: number; count: number }>();

  try {
    const popularPromise = scraper.getPopularManga(12).catch(() => []);
    const latestPromise = scraper.getLatestUpdates(12).catch(() => []);
    const sourcesPromise = prisma.mangaSource
      .findMany({ where: { isActive: true }, take: 6 })
      .catch(() => []);
    const ratingsPromise = prisma.rating
      .groupBy({
        by: ["mangaId"],
        _avg: { rating: true },
        _count: { rating: true },
      })
      .catch(() => []);

    const [popular, latest, dbSources, dbRatings] = await Promise.all([
      popularPromise,
      latestPromise,
      sourcesPromise,
      ratingsPromise,
    ]);

    popularManga = Array.isArray(popular) ? popular : [];
    latestManga = Array.isArray(latest) ? latest : [];
    sources = Array.isArray(dbSources) ? dbSources : [];

    if (Array.isArray(dbRatings)) {
      for (const r of dbRatings) {
        if (r.mangaId && r._avg?.rating) {
          ratingsMap.set(r.mangaId, {
            avg: Math.round(r._avg.rating * 10) / 10,
            count: r._count.rating,
          });
        }
      }
    }

    // Resilient fallback to local database if external API is slow or empty
    if (popularManga.length === 0) {
      const localManga = await prisma.manga
        .findMany({ take: 12, orderBy: { createdAt: "desc" } })
        .catch(() => []);
      if (localManga && localManga.length > 0) {
        popularManga = localManga.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description || "",
          coverImage: m.coverImage || "",
          author: m.author || "مانجاكا",
          status: m.status || "مستمر",
          genres: m.genres || [],
        }));
      }
    }

    if (latestManga.length === 0 && popularManga.length > 0) {
      latestManga = [...popularManga].reverse();
    }
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
            {popularManga.map((manga) => {
              const ratingInfo = ratingsMap.get(manga.id);

              return (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="group flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-zinc-800/80 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    {manga.coverImage ? (
                      <img
                        src={getSafeImageUrl(manga.coverImage)}
                        alt={manga.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
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
                        <Star className="w-3 h-3 fill-amber-400" />
                        {ratingInfo ? `${ratingInfo.avg}` : "جديد"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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
            {latestManga.map((manga) => {
              const ratingInfo = ratingsMap.get(manga.id);

              return (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="group flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-zinc-800/80 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    {manga.coverImage ? (
                      <img
                        src={getSafeImageUrl(manga.coverImage)}
                        alt={manga.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 right-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-md">
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
                        <Star className="w-3 h-3 fill-amber-400" />
                        {ratingInfo ? `${ratingInfo.avg}` : "جديد"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Section 3: Verified Arabic Translation Sources */}
        {sources.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-[#FF334B] shadow-sm border border-rose-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">المصادر وفرق الترجمة المعتمدة</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">سحب متزامن من أفضل فرق ومواقع المانجا العربية</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center gap-2 hover:border-[#FF334B] transition-colors shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[#FF334B] font-black text-sm">
                    {src.name[0]}
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{src.name}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">نشط ومتزامن</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
