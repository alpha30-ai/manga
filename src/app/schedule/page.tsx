import Link from "next/link";
import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import {
  Calendar as CalendarIcon,
  Clock,
  Flame,
  Star,
  Play,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default async function SchedulePage() {
  const scraper = new MangaDexScraper();
  let mangas: any[] = [];

  try {
    mangas = await scraper.getPopularManga(28);
  } catch (e) {
    console.error("Failed to fetch schedule manga:", e);
  }

  const daysOfWeek = [
    { id: "saturday", name: "السبت", color: "from-indigo-500 to-purple-600" },
    { id: "sunday", name: "الأحد", color: "from-rose-500 to-amber-600" },
    { id: "monday", name: "الإثنين", color: "from-emerald-500 to-teal-600" },
    { id: "tuesday", name: "الثلاثاء", color: "from-blue-500 to-cyan-600" },
    { id: "wednesday", name: "الأربعاء", color: "from-purple-500 to-pink-600" },
    { id: "thursday", name: "الخميس", color: "from-amber-500 to-orange-600" },
    { id: "friday", name: "الجمعة", color: "from-[#FF334B] to-rose-600" },
  ];

  // Distribute mangas across days
  const scheduleData = daysOfWeek.map((day, idx) => ({
    ...day,
    mangas: mangas.slice(idx * 4, idx * 4 + 4),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-16 space-y-10" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF334B]/10 text-[#FF334B] border border-[#FF334B]/20 text-xs font-bold">
          <CalendarIcon className="w-4 h-4" />
          <span>مواعيد النشر الأسبوعية</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
          جدول مواعيد صدور الفصول والأعمال
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          تابع مواعيد نزول أحدث فصول المانجا والمانهوا الكورية المفضلة لديك يومياً على مدار الأسبوع بتوقيت مكة المكرمة.
        </p>
      </div>

      {/* Days Schedule List */}
      <div className="space-y-10">
        {scheduleData.map((day) => (
          <section key={day.id} className="space-y-4">
            {/* Day Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className={`px-4 py-1.5 rounded-xl bg-gradient-to-l ${day.color} text-white font-black text-sm shadow-md`}>
                {day.name}
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                ({day.mangas.length} أعمال يتم تحديثها)
              </span>
            </div>

            {/* Manga Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {day.mangas.map((manga) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="group flex gap-4 p-4 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/80 hover:border-[#FF334B]/50 rounded-3xl shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="w-20 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 relative">
                    {manga.coverImage ? (
                      <img
                        src={manga.coverImage}
                        alt={manga.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-[#FF334B]/10 text-[#FF334B] rounded-md mb-1 inline-block">
                        {manga.status || "مستمر"}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white truncate group-hover:text-[#FF334B] transition-colors">
                        {manga.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                        {manga.genres?.[0] || "مانجا"}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> أسبوعي
                      </span>
                      <span className="text-[#FF334B] font-bold flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" /> قراءة
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
