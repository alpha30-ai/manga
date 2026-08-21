import prisma from "@/lib/prisma";
import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import { universalUrlScraper } from "@/lib/scrapers/universalUrlScraper";
import { arabicFallbackCrawler } from "@/lib/scrapers/arabicFallbackCrawler";
import { localizeMangaContent } from "@/lib/arabicMangaMap";

export interface CrawlResult {
  mangaId: string;
  title: string;
  chaptersCount: number;
  pagesIndexed: number;
  status: "success" | "error";
  error?: string;
  source?: string;
}

export class MangaCrawlerService {
  private scraper: MangaDexScraper;

  constructor() {
    this.scraper = new MangaDexScraper();
  }

  /**
   * Searches across Arabic sources and MangaDex simultaneously
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
        },
      ];
    }

    const [arabicResults, mangadexResults] = await Promise.allSettled([
      arabicFallbackCrawler.searchAllArabicSources(cleanQuery),
      this.scraper.searchManga(cleanQuery, { limit: 5 }),
    ]);

    const aggregated: Array<{
      id: string;
      title: string;
      url?: string;
      coverImage?: string;
      source: string;
      latestChapter?: string;
    }> = [];

    // Add Arabic search results first (highest priority)
    if (arabicResults.status === "fulfilled" && Array.isArray(arabicResults.value)) {
      arabicResults.value.forEach((item) => {
        aggregated.push({
          id: item.url,
          title: item.title,
          url: item.url,
          coverImage: item.coverImage,
          source: item.source,
          latestChapter: item.latestChapter,
        });
      });
    }

    // Add MangaDex results
    if (mangadexResults.status === "fulfilled" && Array.isArray(mangadexResults.value)) {
      mangadexResults.value.forEach((item) => {
        aggregated.push({
          id: item.id,
          title: item.title,
          url: `https://mangadex.org/title/${item.id}`,
          coverImage: item.coverImage,
          source: "MangaDex",
          latestChapter: undefined,
        });
      });
    }

    return aggregated;
  }

  /**
   * Crawls a single Manga by ID or URL, extracts all its details and all chapters,
   * saves/upserts everything cleanly into PostgreSQL via Prisma, and pre-caches latest chapter pages.
   */
  async crawlAndSaveManga(mangaIdOrUrl: string, preCacheLatestPages = true, customSource?: string): Promise<CrawlResult> {
    try {
      const isUrl = mangaIdOrUrl.startsWith("http://") || mangaIdOrUrl.startsWith("https://");

      if (isUrl) {
        const { manga, chaptersCount } = await universalUrlScraper.scrapeAndSaveToDb(mangaIdOrUrl, customSource);
        return {
          mangaId: manga.id,
          title: manga.title,
          chaptersCount,
          pagesIndexed: 0,
          status: "success",
          source: manga.source || customSource || "رابط خارجي",
        };
      }

      const mangaId = mangaIdOrUrl;

      // 1. Fetch details from MangaDex
      const details = await this.scraper.getMangaDetails(mangaId);
      if (!details || details.title === "غير متوفر" || details.title === "خطأ في التحميل") {
        throw new Error(`تعذر العثور على المانجا بالمعرف ${mangaId}`);
      }

      const localized = localizeMangaContent(details);

      // 2. Upsert Manga into PostgreSQL
      const savedManga = await prisma.manga.upsert({
        where: { id: mangaId },
        update: {
          title: localized.title,
          description: localized.description,
          coverImage: localized.coverImage || "",
          author: localized.author || "غير معروف",
          status: localized.status || "مستمر",
          genres: localized.genres || [],
          source: "MangaDex",
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
          source: "MangaDex",
          sourceId: mangaId,
        },
      });

      // 3. Fetch all chapters
      const chapters = await this.scraper.getChapters(mangaId);
      let totalPages = 0;

      // 4. Upsert Chapters in batches into PostgreSQL
      for (let i = 0; i < chapters.length; i++) {
        const chap = chapters[i];
        let pages: string[] = [];

        // Check if chapter already has pages in DB
        const existingChap = await prisma.chapter.findUnique({
          where: { id: chap.id },
          select: { pages: true },
        });

        if (existingChap?.pages && existingChap.pages.length > 0) {
          pages = existingChap.pages;
        } else if (preCacheLatestPages && i < 3) {
          try {
            pages = await this.scraper.getChapterPages(chap.id);
            await new Promise((resolve) => setTimeout(resolve, 200));
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
        source: "MangaDex",
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
   * Crawls top popular Arabic manga feed from MangaDex API and auto-saves to PostgreSQL.
   */
  async crawlPopularArabicFeed(limit = 10): Promise<CrawlResult[]> {
    const popularMangas = await this.scraper.getPopularManga(limit);
    const results: CrawlResult[] = [];

    for (const m of popularMangas) {
      const res = await this.crawlAndSaveManga(m.id, true);
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
      const res = await this.crawlAndSaveManga(target, false, m.source || undefined);
      results.push(res);
    }

    return results;
  }
}

export const crawlerService = new MangaCrawlerService();
