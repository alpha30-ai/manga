import prisma from "@/lib/prisma";
import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import { universalUrlScraper } from "@/lib/scrapers/universalUrlScraper";
import { arabicFallbackCrawler } from "@/lib/scrapers/arabicFallbackCrawler";
import { localizeMangaContent } from "@/lib/arabicMangaMap";
import { isArabicQuery, detectLanguage } from "@/lib/languageUtils";

export interface CrawlResult {
  mangaId: string;
  title: string;
  chaptersCount: number;
  pagesIndexed: number;
  status: "success" | "error";
  error?: string;
  source?: string;
  language?: string;
}

export class MangaCrawlerService {
  private scraper: MangaDexScraper;

  constructor() {
    this.scraper = new MangaDexScraper();
  }

  /**
   * Primary Native Arabic Multi-Source Search
   * Prioritizes live Arabic scanlation teams (3asq, Kenmanga, LavaScans, RocksManga, Olympus, MangaLik, SwatManga, AreaScans).
   */
  async searchAllSources(query: string) {
    const cleanQuery = query.trim();
    const isUrl = cleanQuery.startsWith("http://") || cleanQuery.startsWith("https://");

    if (isUrl) {
      return [
        {
          id: cleanQuery,
          title: "رابط مباشر (URL)",
          url: cleanQuery,
          coverImage: "",
          source: "رابط خارجي",
          language: "ar" as const,
        },
      ];
    }

    const queryLang = detectLanguage(cleanQuery);

    if (queryLang === "ar") {
      // 1. Primary Arabic Search across verified Arabic scanlator sites
      const [arabicResults, mangadexResults] = await Promise.allSettled([
        arabicFallbackCrawler.searchAllArabicSources(cleanQuery),
        this.scraper.searchManga(cleanQuery, { limit: 6 }),
      ]);

      const aggregated: Array<{
        id: string;
        title: string;
        url?: string;
        coverImage?: string;
        source: string;
        latestChapter?: string;
        language: "ar";
      }> = [];

      // Add Arabic Scanlation Teams first (Highest Priority)
      if (arabicResults.status === "fulfilled" && Array.isArray(arabicResults.value)) {
        arabicResults.value.forEach((item) => {
          aggregated.push({
            id: item.url,
            title: item.title,
            url: item.url,
            coverImage: item.coverImage,
            source: item.source,
            latestChapter: item.latestChapter,
            language: "ar",
          });
        });
      }

      // Add MangaDex only if Arabic translation is present
      if (mangadexResults.status === "fulfilled" && Array.isArray(mangadexResults.value)) {
        mangadexResults.value.forEach((item) => {
          aggregated.push({
            id: item.id,
            title: item.title,
            url: `https://mangadex.org/title/${item.id}`,
            coverImage: item.coverImage,
            source: "MangaDex (عربي)",
            latestChapter: undefined,
            language: "ar",
          });
        });
      }

      return aggregated;
    } else {
      // 2. English Query Search
      const [mangadexResults, arabicResults] = await Promise.allSettled([
        this.scraper.searchManga(cleanQuery, { limit: 10 }),
        arabicFallbackCrawler.searchAllArabicSources(cleanQuery),
      ]);

      const aggregated: Array<{
        id: string;
        title: string;
        url?: string;
        coverImage?: string;
        source: string;
        latestChapter?: string;
        language: "ar" | "en";
      }> = [];

      if (mangadexResults.status === "fulfilled" && Array.isArray(mangadexResults.value)) {
        mangadexResults.value.forEach((item) => {
          aggregated.push({
            id: item.id,
            title: item.title,
            url: `https://mangadex.org/title/${item.id}`,
            coverImage: item.coverImage,
            source: "MangaDex (English)",
            latestChapter: undefined,
            language: "en",
          });
        });
      }

      if (arabicResults.status === "fulfilled" && Array.isArray(arabicResults.value)) {
        arabicResults.value.forEach((item) => {
          aggregated.push({
            id: item.url,
            title: item.title,
            url: item.url,
            coverImage: item.coverImage,
            source: item.source,
            latestChapter: item.latestChapter,
            language: "ar",
          });
        });
      }

      return aggregated;
    }
  }

  /**
   * Crawls a Manga with pure Arabic preference, extracting 100% Arabic chapters and pages.
   */
  async crawlAndSaveManga(
    mangaIdOrUrl: string,
    preCacheLatestPages = true,
    customSource?: string,
    targetLang?: "ar" | "en"
  ): Promise<CrawlResult> {
    try {
      const isUrl = mangaIdOrUrl.startsWith("http://") || mangaIdOrUrl.startsWith("https://");

      // 1. Direct URL Crawl (3asq, KenManga, LavaScans, RocksManga, MangaLik, SwatManga, etc.)
      if (isUrl) {
        const { manga, chaptersCount, chapters } = await universalUrlScraper.scrapeAndSaveToDb(
          mangaIdOrUrl,
          customSource
        );

        return {
          mangaId: manga.id,
          title: manga.title,
          chaptersCount,
          pagesIndexed: 0,
          status: "success",
          source: manga.source || customSource || "مصدر عربي معتمد",
          language: "ar",
        };
      }

      const mangaId = mangaIdOrUrl;
      const lang = targetLang || (isArabicQuery(mangaId) ? "ar" : "ar");

      // 2. If it's a title or Arabic query, try fetching from Arabic Scanlator Sites First!
      if (isArabicQuery(mangaId)) {
        const arabicResult = await arabicFallbackCrawler.findArabicMangaAndChapters(mangaId);
        if (arabicResult && arabicResult.chapters.length > 0) {
          return {
            mangaId: arabicResult.manga.id,
            title: arabicResult.manga.title,
            chaptersCount: arabicResult.chapters.length,
            pagesIndexed: 0,
            status: "success",
            source: (arabicResult.manga as any).source || "مصدر عربي",
            language: "ar",
          };
        }
      }

      // 3. MangaDex Lookup with Strict Arabic language filter
      const details = await this.scraper.getMangaDetails(mangaId);
      if (!details || details.title === "غير متوفر" || details.title === "خطأ في التحميل") {
        // Fallback search in Arabic sources
        const arabicFallback = await arabicFallbackCrawler.findArabicMangaAndChapters(mangaId);
        if (arabicFallback && arabicFallback.chapters.length > 0) {
          return {
            mangaId: arabicFallback.manga.id,
            title: arabicFallback.manga.title,
            chaptersCount: arabicFallback.chapters.length,
            pagesIndexed: 0,
            status: "success",
            source: (arabicFallback.manga as any).source || "مصدر عربي",
            language: "ar",
          };
        }

        throw new Error(`تعذر العثور على العمل بالمعرف "${mangaId}"`);
      }

      const localized = lang === "ar" ? localizeMangaContent(details) : details;

      // 4. Fetch chapters strictly for Arabic
      let chapters = await this.scraper.getChapters(mangaId, lang);

      // If MangaDex returned 0 Arabic chapters, search the Arabic scanlation websites!
      if (chapters.length === 0 && localized.title) {
        const arabicFallback = await arabicFallbackCrawler.findArabicMangaAndChapters(localized.title, mangaId);
        if (arabicFallback && arabicFallback.chapters.length > 0) {
          return {
            mangaId: localized.id,
            title: localized.title,
            chaptersCount: arabicFallback.chapters.length,
            pagesIndexed: 0,
            status: "success",
            source: (arabicFallback.manga as any).source || "مصدر عربي",
            language: "ar",
          };
        }
      }

      // 5. Upsert Manga into PostgreSQL
      const savedManga = await prisma.manga.upsert({
        where: { id: mangaId },
        update: {
          title: localized.title,
          description: localized.description,
          coverImage: localized.coverImage || "",
          author: localized.author || "غير معروف",
          status: localized.status || "مستمر",
          genres: localized.genres || [],
          source: customSource || (lang === "ar" ? "ترجمة عربية معتمدة" : "MangaDex (English)"),
          sourceId: mangaId,
        },
        create: {
          id: mangaId,
          title: localized.title,
          description: localized.description,
          coverImage: localized.coverImage || "",
          author: localized.author || "غير معروف",
          status: localized.status || "مستمر",
          genres: localized.genres || [],
          source: customSource || (lang === "ar" ? "ترجمة عربية معتمدة" : "MangaDex (English)"),
          sourceId: mangaId,
        },
      });

      let totalPages = 0;

      // 6. Upsert Chapters into PostgreSQL
      for (let i = 0; i < chapters.length; i++) {
        const chap = chapters[i];
        let pages: string[] = [];

        const existingChap = await prisma.chapter.findUnique({
          where: { id: chap.id },
          select: { pages: true },
        });

        if (existingChap?.pages && existingChap.pages.length > 0) {
          pages = existingChap.pages;
        } else if (preCacheLatestPages && i < 2) {
          try {
            pages = await this.scraper.getChapterPages(chap.id);
          } catch (err) {
            pages = [];
          }
        }

        totalPages += pages.length;

        await prisma.chapter.upsert({
          where: { id: chap.id },
          update: {
            title: chap.title,
            chapterNum: chap.chapterNum,
            pages: pages.length > 0 ? pages : undefined,
          },
          create: {
            id: chap.id,
            mangaId: savedManga.id,
            title: chap.title,
            chapterNum: chap.chapterNum,
            pages,
          },
        });
      }

      return {
        mangaId: savedManga.id,
        title: savedManga.title,
        chaptersCount: chapters.length,
        pagesIndexed: totalPages,
        status: "success",
        source: savedManga.source || "ترجمة عربية معتمدة",
        language: lang,
      };
    } catch (error: any) {
      console.error(`Crawl error for ${mangaIdOrUrl}:`, error);
      return {
        mangaId: mangaIdOrUrl,
        title: "خطأ",
        chaptersCount: 0,
        pagesIndexed: 0,
        status: "error",
        error: error.message || "حدث خطأ أثناء السحب",
      };
    }
  }

  /**
   * Crawls top popular Arabic manga feed and auto-saves to PostgreSQL.
   */
  async crawlPopularArabicFeed(limit = 10): Promise<CrawlResult[]> {
    const popularMangas = await this.scraper.getPopularManga(limit);
    const results: CrawlResult[] = [];

    for (const m of popularMangas) {
      const res = await this.crawlAndSaveManga(m.id, true, "ترجمة عربية معتمدة", "ar");
      results.push(res);
    }

    return results;
  }

  /**
   * Synchronizes all existing mangas in the database with the latest chapters.
   */
  async syncAllTrackedMangas(): Promise<CrawlResult[]> {
    const existingMangas = await prisma.manga.findMany({
      select: { id: true, title: true, sourceId: true, source: true },
    });

    const results: CrawlResult[] = [];
    for (const m of existingMangas) {
      const target = m.sourceId || m.id;
      const res = await this.crawlAndSaveManga(target, false, m.source || undefined, "ar");
      results.push(res);
    }

    return results;
  }
}

export const crawlerService = new MangaCrawlerService();
