import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { multiSourceManager } from "@/lib/scrapers/multiSourceManager";
import { Globe, BookOpen, ArrowRight, Layers, Search, Sparkles, ExternalLink } from "lucide-react";
import { getSafeImageUrl } from "@/lib/imageUtils";

export default async function SingleSourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q = "" } = await searchParams;

  const source = await prisma.mangaSource.findUnique({
    where: { id },
  });

  if (!source && id !== "mangadex") {
    notFound();
  }

  const sourceName = source?.name || "MangaDex";
  const sourceUrl = source?.baseUrl || "https://mangadex.org";

  let mangaList: any[] = [];
  try {
    mangaList = await multiSourceManager.getSourceMangaList(id, q);
  } catch (e) {
    console.error("Source manga fetch error:", e);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-16" dir="rtl">
      {/* Back Link */}
      <Link
        href="/sources"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة إلى قائمة المصادر والسيرفرات</span>
      </Link>

      {/* Source Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 mb-10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>سيرفر ومصدر نشط</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                {sourceName}
              </h1>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-1 inline-flex items-center gap-1 font-mono"
                dir="ltr"
              >
                <span>{sourceUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <form method="GET" action={`/sources/${id}`} className="w-full sm:w-80 relative">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="ابحث في هذا المصدر..."
              className="w-full pl-4 pr-11 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-4 top-3.5" />
          </form>
        </div>
      </div>

      {/* Manga Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-black text-zinc-950 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>الأعمال المتاحة في المصدر ({mangaList.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {mangaList.map((m) => (
          <Link
            href={`/manga/${m.id}`}
            key={m.id}
            className="group flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800/80 hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300"
          >
            <div className="relative aspect-[2/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              {m.coverImage ? (
                <img
                  src={getSafeImageUrl(m.coverImage)}
                  alt={m.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-zinc-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 right-2.5">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-gradient-to-l from-indigo-500 to-purple-600 text-white rounded-md shadow-sm">
                  {m.latestChapter || m.status || "مستمر"}
                </span>
              </div>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <h3 className="font-black text-zinc-950 dark:text-white text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {m.title}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 truncate">
                {m.author || sourceName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {mangaList.length === 0 && (
        <div className="py-20 text-center text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
          <BookOpen className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 opacity-60" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">لم يتم العثور على أعمال مطابقة</h3>
          <p className="text-xs text-zinc-500">جرب البحث بكلمات أخرى أو اختر مصدراً آخر من القائمة.</p>
        </div>
      )}
    </div>
  );
}
