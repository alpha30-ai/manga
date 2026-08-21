import { MangaDexScraper, GENRE_TAG_MAP } from "@/lib/scrapers/mangadex";
import Link from "next/link";
import { BookOpen, Search, Filter, Sparkles, Star } from "lucide-react";
import { getSafeImageUrl } from "@/lib/imageUtils";
import prisma from "@/lib/prisma";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; status?: string }>;
}) {
  const { q = "", genre = "", status = "" } = await searchParams;
  const scraper = new MangaDexScraper();

  let mangaList: any[] = [];
  const ratingsMap = new Map<string, { avg: number; count: number }>();

  try {
    const [fetchedManga, dbRatings] = await Promise.all([
      scraper.searchManga(q, {
        genre: genre || undefined,
        status: status || undefined,
        limit: 30,
      }),
      prisma.rating
        .groupBy({
          by: ["mangaId"],
          _avg: { rating: true },
          _count: { rating: true },
        })
        .catch(() => []),
    ]);

    mangaList = Array.isArray(fetchedManga) ? fetchedManga : [];

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
  } catch (e) {
    console.error("Browse fetch error:", e);
  }

  const allGenres = ["الكل", ...Object.keys(GENRE_TAG_MAP)];
  const statusOptions = [
    { label: "جميع الحالات", value: "" },
    { label: "مستمر", value: "ongoing" },
    { label: "مكتمل", value: "completed" },
    { label: "متوقف", value: "hiatus" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-16" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-[#FF334B] text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مكتبة المانجا والمانهوا</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white">
            تصفح واستكشف الأعمال
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            اكتشف أحدث وأشهر أعمال المانجا والمانهوا الكورية واليابانية
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-4 sm:p-6 mb-8 shadow-sm space-y-4">
        <form method="GET" action="/browse" className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          <div className="md:col-span-6 relative">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="ابحث بالاسم أو المؤلف..."
              className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF334B]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
          </div>

          <div className="md:col-span-3">
            <select
              name="genre"
              defaultValue={genre}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF334B]"
            >
              <option value="">جميع التصنيفات</option>
              {Object.keys(GENRE_TAG_MAP).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <select
              name="status"
              defaultValue={status}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF334B]"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-l from-[#FF334B] to-rose-600 text-white font-bold text-sm rounded-2xl hover:opacity-90 shadow-md shadow-rose-500/20 transition-all shrink-0 flex items-center gap-1.5"
            >
              <Filter className="w-4 h-4" />
              <span>تطبيق</span>
            </button>
          </div>
        </form>

        {/* Quick Genre Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 hide-scrollbar">
          {allGenres.map((g) => {
            const isSelected = (!genre && g === "الكل") || genre === g;
            return (
              <Link
                key={g}
                href={g === "الكل" ? "/browse" : `/browse?genre=${encodeURIComponent(g)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-[#FF334B] text-white shadow-md shadow-rose-500/20"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                {g}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-zinc-400">
          تم العثور على {mangaList.length} عمل
          {q && ` للبحث "${q}"`}
          {genre && ` في تصنيف "${genre}"`}
        </span>
      </div>

      {/* Manga Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
        {mangaList.map((m) => {
          const ratingInfo = ratingsMap.get(m.id);

          return (
            <Link
              href={`/manga/${m.id}`}
              key={m.id}
              className="group flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-[#FF334B]/50 transition-all duration-300"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-zinc-800">
                {m.coverImage ? (
                  <img
                    src={getSafeImageUrl(m.coverImage)}
                    alt={m.title}
                    loading="lazy"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-2 right-2">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#FF334B] text-white rounded-md">
                    {m.status}
                  </span>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1.5">
                <h3 className="font-bold text-slate-950 dark:text-white text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-[#FF334B] transition-colors">
                  {m.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <p className="truncate max-w-[85px]">{m.author || "مؤلف غير معروف"}</p>
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {ratingInfo ? `${ratingInfo.avg}` : "جديد"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {mangaList.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-200">
              لم يتم العثور على أي نتائج
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              جرب البحث بكلمات مختلفة أو قم بإزالة الفلاتر المحددة لاستكشاف باقي الأعمال.
            </p>
            <Link
              href="/browse"
              className="inline-block px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-2xl hover:bg-slate-200 transition-colors"
            >
              إعادة ضبط الفلاتر
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
