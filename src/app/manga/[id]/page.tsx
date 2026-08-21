import Link from "next/link";
import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import { universalUrlScraper } from "@/lib/scrapers/universalUrlScraper";
import { arabicFallbackCrawler } from "@/lib/scrapers/arabicFallbackCrawler";
import { BookOpen, User, Info, Clock, Layers, ArrowRight } from "lucide-react";
import MangaActions from "@/components/manga/MangaActions";
import MangaComments from "@/components/manga/MangaComments";
import ChapterList from "@/components/manga/ChapterList";
import MangaRatingComponent from "@/components/manga/MangaRatingComponent";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureMangaInDb } from "@/lib/mangaSync";
import { getSafeImageUrl } from "@/lib/imageUtils";
import memoryCache from "@/lib/cache";

export default async function MangaDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  let manga: any = null;
  let chapters: any[] = [];
  let sourceName = "MangaDex";

  // 0. Check in-memory cache first for sub-millisecond retrieval
  const cacheKey = `manga_details_full:${id}`;
  const cachedData = memoryCache.get<{ manga: any; chapters: any[]; sourceName: string }>(cacheKey);

  if (cachedData) {
    manga = cachedData.manga;
    chapters = cachedData.chapters;
    sourceName = cachedData.sourceName;
  }

  // 1. Check local PostgreSQL database if not in memory cache
  if (!manga || chapters.length === 0) {
    try {
      const dbManga = await prisma.manga.findUnique({
        where: { id },
        include: {
          chapters: {
            orderBy: { chapterNum: "desc" },
            select: {
              id: true,
              title: true,
              chapterNum: true,
              createdAt: true,
            },
          },
        },
      });

      if (dbManga) {
        manga = {
          id: dbManga.id,
          title: dbManga.title,
          description: dbManga.description,
          coverImage: dbManga.coverImage,
          author: dbManga.author || "غير معروف",
          status: dbManga.status || "مستمر",
          genres: dbManga.genres || [],
        };
        chapters = dbManga.chapters.map((c) => ({
          id: c.id,
          title: c.title,
          chapterNum: c.chapterNum,
          publishedAt: c.createdAt,
          language: "ar",
        }));
        sourceName = dbManga.source || "المصدر الأصلي";
      }
    } catch (e) {
      console.warn("DB manga findUnique error:", e);
    }
  }

  // 2. If chapters are empty, check if ID is a base64url encoded URL or if sourceId is present
  if (chapters.length === 0) {
    let targetUrl = "";

    try {
      const decoded = Buffer.from(id, "base64url").toString("utf-8");
      if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
        targetUrl = decoded;
      }
    } catch (e) {}

    if (targetUrl) {
      try {
        const scraped = await universalUrlScraper.scrapeAndSaveToDb(targetUrl, sourceName);
        manga = {
          id: scraped.manga.id,
          title: scraped.manga.title,
          description: scraped.manga.description,
          coverImage: scraped.manga.coverImage,
          author: scraped.manga.author || "غير معروف",
          status: scraped.manga.status || "مستمر",
          genres: scraped.manga.genres || [],
        };
        chapters = scraped.chapters.map((c) => ({
          id: c.id,
          title: c.title,
          chapterNum: c.chapterNum,
          publishedAt: c.publishedAt,
          language: "ar",
        }));
      } catch (err) {
        console.error("Failed to scrape targetUrl:", err);
      }
    }
  }

  // 3. If still no manga or chapters (e.g. MangaDex UUID or Arabic title)
  if (!manga || chapters.length === 0) {
    const scraper = new MangaDexScraper();
    try {
      const [fetchedManga, fetchedChapters] = await Promise.all([
        manga || scraper.getMangaDetails(id),
        chapters.length > 0 ? chapters : scraper.getChapters(id, "ar"),
      ]);
      if (fetchedManga && fetchedManga.title !== "غير متوفر") {
        manga = fetchedManga;
        chapters = fetchedChapters;
        if (!sourceName || sourceName === "المصدر الأصلي") sourceName = "ترجمة عربية معتمدة";

        // Asynchronous non-blocking DB persistence
        ensureMangaInDb({
          id: manga.id,
          title: manga.title,
          description: manga.description,
          coverImage: manga.coverImage,
          author: manga.author,
          status: manga.status,
          genres: manga.genres,
          source: sourceName,
        }).catch(() => {});
      }
    } catch (e) {
      console.error("MangaDex fetch error:", e);
    }
  }

  // 4. Fallback search for Arabic chapters if empty
  if (chapters.length === 0 && manga?.title) {
    try {
      const arabicResult = await arabicFallbackCrawler.findArabicMangaAndChapters(manga.title, id);
      if (arabicResult && arabicResult.chapters.length > 0) {
        chapters = arabicResult.chapters;
      }
    } catch (err) {
      console.error("Arabic fallback search error:", err);
    }
  }

  // Final fallback if completely empty
  if (!manga) {
    manga = {
      id,
      title: "عمل مانجا",
      description: "جاري تحديث الفصول والبيانات من المصدر المعتمد...",
      coverImage: "",
      author: "غير معروف",
      status: "مستمر",
      genres: ["مانجا"],
    };
  }

  // Save to memory cache for fast subsequent visits
  if (chapters.length > 0) {
    memoryCache.set(cacheKey, { manga, chapters, sourceName }, 1800);
  }

  // Get user reading history
  let userHistory = null;
  if (session?.user?.id) {
    try {
      userHistory = await prisma.readingHistory.findUnique({
        where: {
          userId_mangaId: {
            userId: session.user.id,
            mangaId: manga.id,
          },
        },
        select: {
          chapterId: true,
          chapter: {
            select: { chapterNum: true },
          },
        },
      });
    } catch (e) {
      console.warn("History lookup error:", e);
    }
  }

  const lastReadChapterId = userHistory?.chapterId || null;
  const lastReadChapterNum = userHistory?.chapter?.chapterNum || null;

  return (
    <div className="min-h-screen pb-24 md:pb-16" dir="rtl">
      {/* Background Banner */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-zinc-950">
        {manga.coverImage && (
          <img
            src={getSafeImageUrl(manga.coverImage)}
            alt=""
            className="w-full h-full object-cover filter blur-2xl scale-125 opacity-40"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-zinc-950 via-zinc-950/60 to-black/40" />

        <div className="absolute top-6 right-6 z-20">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md text-xs font-bold transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للتصفح</span>
          </Link>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-36 sm:-mt-48 relative z-10 space-y-12">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-10">
          {/* Cover Art */}
          <div className="w-52 sm:w-64 aspect-[2/3] shrink-0 mx-auto md:mx-0 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800">
            {manga.coverImage ? (
              <img
                src={getSafeImageUrl(manga.coverImage)}
                alt={manga.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-zinc-400" />
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 space-y-5 text-center md:text-right pt-2 md:pt-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] rounded-full text-xs font-bold mb-2 border border-rose-200 dark:border-rose-900/50">
                <Layers className="w-3.5 h-3.5" />
                <span>المصدر: {sourceName}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white leading-tight">
                {manga.title}
              </h1>
            </div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#FF334B]" />
                <span>المؤلف: {manga.author || "غير معروف"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#FF334B]" />
                <span>الحالة: {manga.status || "مستمر"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FF334B]" />
                <span>إجمالي الفصول: {chapters.length}</span>
              </span>
            </div>

            {/* Real Rating Interactive Widget */}
            <div>
              <MangaRatingComponent
                mangaId={manga.id}
                mangaTitle={manga.title}
                coverImage={manga.coverImage}
                author={manga.author}
              />
            </div>

            {/* Genres */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {manga.genres?.map((g: string) => (
                <span
                  key={g}
                  className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl line-clamp-4">
              {manga.description || "لا يوجد وصف متوفر لهذا العمل حالياً."}
            </p>

            {/* Interactive Action Buttons */}
            <div className="pt-2">
              <MangaActions
                manga={manga}
                chapters={chapters}
                lastReadChapterId={lastReadChapterId}
                lastReadChapterNum={lastReadChapterNum}
              />
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="space-y-6">
          <ChapterList
            chapters={chapters}
            mangaId={manga.id}
            lastReadChapterId={lastReadChapterId}
          />
        </div>

        {/* Interactive Manga Comments */}
        <div className="pt-6">
          <MangaComments mangaId={manga.id} />
        </div>
      </div>
    </div>
  );
}
