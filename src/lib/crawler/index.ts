import prisma from "@/lib/prisma";
import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import { universalUrlScraper } from "@/lib/scrapers/universalUrlScraper";
import { localizeMangaContent } from "@/lib/arabicMangaMap";

export interface CrawlResult {
  mangaId: string;
  title: string;
  chaptersCount: number;
  pagesIndexed: number;
  status: "success" | "error";
  error?: string;
}

export class MangaCrawlerService {
  private scraper: MangaDexScraper;

  constructor() {
    this.scraper = new MangaDexScraper();
  }

  /**
   * Crawls a single Manga by ID or URL, extracts all its details and all chapters,
   * saves/upserts everything cleanly into PostgreSQL via Prisma, and pre-caches latest chapter pages.
   */
  async crawlAndSaveManga(mangaIdOrUrl: string, preCacheLatestPages = true): Promise<CrawlResult> {
    try {
      const isUrl = mangaIdOrUrl.startsWith("http://") || mangaIdOrUrl.startsWith("https://");

      if (isUrl) {
        const { manga, chaptersCount } = await universalUrlScraper.scrapeAndSaveToDb(mangaIdOrUrl);
        return {
          mangaId: manga.id,
          title: manga.title,
          chaptersCount,
          pagesIndexed: 0,
          status: "success",
        };
      }

      const mangaId = mangaIdOrUrl;

      // 1. Fetch details
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
          source: "mangadex",
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
          source: "mangadex",
          sourceId: mangaId,
        },
      });

      // 3. Fetch all chapters (paginated exhaustive loop)
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
          // Pre-cache only the first 3 latest chapters during bulk crawl to respect API rate limits
          try {
            pages = await this.scraper.getChapterPages(chap.id);
            await new Promise((resolve) => setTimeout(resolve, 300)); // Respectful delay
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
      select: { id: true, title: true },
    });

    const results: CrawlResult[] = [];
    for (const m of existingMangas) {
      const res = await this.crawlAndSaveManga(m.id, true);
      results.push(res);
    }

    return results;
  }

  /**
   * Scrapes and caches a specific chapter's pages directly into PostgreSQL if not present.
   */
  async ensureChapterPages(chapterId: string, mangaId: string): Promise<string[]> {
    try {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: { pages: true },
      });

      if (chapter?.pages && chapter.pages.length > 0) {
        return chapter.pages;
      }

      // Fetch fresh pages from API
      const pages = await this.scraper.getChapterPages(chapterId);
      if (pages.length > 0) {
        // Save to DB
        await prisma.chapter.upsert({
          where: { id: chapterId },
          update: { pages },
          create: {
            id: chapterId,
            mangaId,
            title: `الفصل`,
            chapterNum: 0,
            pages,
          },
        });
      }

      return pages;
    } catch (e) {
      console.error(`ensureChapterPages error for ${chapterId}:`, e);
      return [];
    }
  }
}

export const crawlerService = new MangaCrawlerService();
