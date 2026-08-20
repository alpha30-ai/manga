import * as cheerio from "cheerio";
import { MangaDetails, ChapterInfo } from "./index";
import { MangaDexScraper } from "./mangadex";
import { localizeMangaContent, localizeGenres } from "@/lib/arabicMangaMap";
import { stealthFetchHtml, stealthPost } from "./stealthFetcher";
import prisma from "@/lib/prisma";

export interface ScrapedMangaResult {
  manga: MangaDetails;
  chapters: ChapterInfo[];
}

export class UniversalUrlScraper {
  private mangadexScraper: MangaDexScraper;

  constructor() {
    this.mangadexScraper = new MangaDexScraper();
  }

  /**
   * Intelligently parses ANY manga URL (MangaDex, WordPress Madara, MangaStream, custom HTML).
   */
  async scrapeUrl(url: string, sourceName?: string): Promise<ScrapedMangaResult> {
    const trimmedUrl = url.trim();

    // 1. Check if MangaDex URL
    const mangadexMatch = trimmedUrl.match(/mangadex\.org\/title\/([0-9a-fA-F-]+)/);
    if (mangadexMatch) {
      const mangaId = mangadexMatch[1];
      const [details, chapters] = await Promise.all([
        this.mangadexScraper.getMangaDetails(mangaId),
        this.mangadexScraper.getChapters(mangaId),
      ]);
      return {
        manga: details,
        chapters,
      };
    }

    // 2. Generic Web Scraper with Cheerio DOM Parsing & Anti-Bot Bypass
    try {
      const html = await stealthFetchHtml(trimmedUrl);
      const $ = cheerio.load(html);

      // Extract Title with multiple selectors
      let title =
        $('meta[property="og:title"]').attr("content") ||
        $("h1.entry-title").first().text().trim() ||
        $(".post-title h1").first().text().trim() ||
        $(".story-info-right h1").first().text().trim() ||
        $(".manga-info-top h1").first().text().trim() ||
        $("h1").first().text().trim() ||
        $("title").text().trim();

      // Clean title artifacts (e.g. " - Manga Read", " | Alpha Manga")
      title = title.replace(/\s*[-|–]\s*(Read|Manga|Manhwa|Online|Chapter|الفصل|مانجا|مترجم).*$/i, "").trim();

      // Extract Cover Image
      let coverImage =
        $('meta[property="og:image"]').attr("content") ||
        $(".summary_image img").first().attr("src") ||
        $(".summary_image img").first().attr("data-src") ||
        $(".summary_image img").first().attr("data-lazy-src") ||
        $(".manga-info-top img").first().attr("src") ||
        $(".story-info-left img").first().attr("src") ||
        $("img.wp-post-image").first().attr("src") ||
        $("img.wp-post-image").first().attr("data-src") ||
        "";

      // Fix relative image URLs
      if (coverImage) {
        coverImage = coverImage.trim();
        if (!coverImage.startsWith("http")) {
          const parsedBase = new URL(trimmedUrl);
          coverImage = new URL(coverImage, parsedBase.origin).toString();
        }
      }

      // Extract Description
      let description =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        $(".manga-excerpt").first().text().trim() ||
        $(".summary__content").first().text().trim() ||
        $(".story-info-right .panel-story-info").first().text().trim() ||
        $(".panel-story-description").first().text().trim() ||
        $(".entry-content p").first().text().trim() ||
        "";

      // Extract Author
      let author =
        $(".author-content").first().text().trim() ||
        $(".manga-authors").first().text().trim() ||
        $(".story-info-right .table-value").first().text().trim() ||
        "غير معروف";

      // Extract Genres
      const genres: string[] = [];
      $('.genres-content a, .manga-info-top a[href*="genre"], a[href*="/genre/"], a[href*="/genres/"], .story-info-right a[href*="genre"], .seriestugenre a').each(
        (_, el) => {
          const g = $(el).text().trim();
          if (g && !genres.includes(g)) genres.push(g);
        }
      );

      // Extract Chapters
      const chapters: ChapterInfo[] = [];
      const chapterLinks = $(
        '.listing-chapters_wrap li a, .wp-manga-chapter a, ul.sub-chap-list li a, .row-content-chapter li a, .chapter-list a, .eph-num a, a[href*="/chapter-"], a[href*="/chapter/"], a[href*="/ch-"], .cl-item a, .version-chap li a'
      );

      chapterLinks.each((idx, el) => {
        const link = $(el).attr("href");
        const rawText = $(el).text().trim();

        if (link && rawText) {
          const numMatch = rawText.match(/(?:ch|chapter|فصل|الفصل)?\s*(\d+(?:\.\d+)?)/i) || link.match(/(?:ch|chapter|chap)-?(\d+(?:\.\d+)?)/i);
          const chapNum = numMatch ? parseFloat(numMatch[1]) : chapterLinks.length - idx;

          const cleanLink = link.trim().startsWith("http") ? link.trim() : new URL(link.trim(), new URL(trimmedUrl).origin).toString();
          const chapId = Buffer.from(cleanLink).toString("base64url");

          const chapTitle = rawText.includes("الفصل") ? rawText : `الفصل ${chapNum}: ${rawText}`;

          if (!chapters.some((c) => c.chapterNum === chapNum || c.id === chapId)) {
            chapters.push({
              id: chapId,
              title: chapTitle,
              chapterNum: isNaN(chapNum) ? idx + 1 : chapNum,
              publishedAt: new Date(),
              language: "ar",
            });
          }
        }
      });

      // AJAX Fallback for Madara Sites if direct DOM has 0 chapters
      if (chapters.length === 0) {
        try {
          const ajaxUrl = `${trimmedUrl.replace(/\/$/, "")}/ajax/chapters/`;
          const ajaxHtml = await stealthPost(ajaxUrl);

          if (ajaxHtml) {
            const $ajax = cheerio.load(ajaxHtml);
            $ajax('.wp-manga-chapter a, .listing-chapters_wrap li a, li.wp-manga-chapter a').each((idx, el) => {
              const link = $ajax(el).attr("href");
              const rawText = $ajax(el).text().trim();

              if (link && rawText) {
                const numMatch = rawText.match(/(?:ch|chapter|فصل|الفصل)?\s*(\d+(?:\.\d+)?)/i) || link.match(/(?:ch|chapter|chap)-?(\d+(?:\.\d+)?)/i);
                const chapNum = numMatch ? parseFloat(numMatch[1]) : idx + 1;

                const cleanLink = link.trim().startsWith("http") ? link.trim() : new URL(link.trim(), new URL(trimmedUrl).origin).toString();
                const chapId = Buffer.from(cleanLink).toString("base64url");
                const chapTitle = rawText.includes("الفصل") ? rawText : `الفصل ${chapNum}: ${rawText}`;

                if (!chapters.some((c) => c.chapterNum === chapNum || c.id === chapId)) {
                  chapters.push({
                    id: chapId,
                    title: chapTitle,
                    chapterNum: isNaN(chapNum) ? idx + 1 : chapNum,
                    publishedAt: new Date(),
                    language: "ar",
                  });
                }
              }
            });
          }
        } catch (e) {
          // Ignore
        }
      }

      // Sort descending (e.g. Chapter 100 down to 1)
      chapters.sort((a, b) => b.chapterNum - a.chapterNum);

      // Reproducible Manga ID from URL
      const mangaId = Buffer.from(trimmedUrl).toString("base64url");

      const baseManga: MangaDetails = {
        id: mangaId,
        title: title || "مانجا غير معروفة",
        description: description || "تم جلب هذه المانجا بنجاح من المصدر المعتمد.",
        coverImage,
        author,
        status: "مستمر",
        genres: localizeGenres(genres.length > 0 ? genres : ["مانجا"]),
      };

      const localizedManga = localizeMangaContent(baseManga);

      return {
        manga: localizedManga,
        chapters,
      };
    } catch (e: any) {
      console.error(`URL Scraping error for ${trimmedUrl}:`, e);
      throw new Error(`تعذر قراءة الرابط وتحليل المحتوى: ${e.message}`);
    }
  }

  /**
   * Scrapes chapter page images from a specific chapter URL using stealthFetch.
   */
  async scrapeChapterPages(chapterUrl: string): Promise<string[]> {
    try {
      const cleanUrl = chapterUrl.trim();
      const html = await stealthFetchHtml(cleanUrl);
      const $ = cheerio.load(html);

      const pages: string[] = [];

      // Extract images from reader containers
      $('.reading-content img, .page-break img, #chapter-images img, .container-chapter-reader img, .entry-content img, .reader-area img, #readerarea img, .ts-main-image, .iv-card img, img.wp-manga-chapter-img').each(
        (_, el) => {
          const rawSrc =
            $(el).attr("src") ||
            $(el).attr("data-src") ||
            $(el).attr("data-lazy-src") ||
            $(el).attr("data-full-url") ||
            $(el).attr("data-original");

          if (rawSrc) {
            const src = rawSrc.trim();
            // Filter out tracking pixels, icons, and small UI icons
            if (
              !src.includes("logo") &&
              !src.includes("banner") &&
              !src.includes("advertisement") &&
              !src.includes("avatar") &&
              !src.includes("wpdiscuz") &&
              !src.includes("emoji") &&
              !src.endsWith(".svg")
            ) {
              const fullSrc = src.startsWith("http")
                ? src
                : new URL(src, new URL(cleanUrl).origin).toString();

              if (!pages.includes(fullSrc)) {
                pages.push(fullSrc);
              }
            }
          }
        }
      );

      return pages;
    } catch (e) {
      console.error("scrapeChapterPages error:", e);
      return [];
    }
  }

  /**
   * Scrapes ANY URL and directly saves/upserts it into PostgreSQL database.
   */
  async scrapeAndSaveToDb(url: string, sourceName?: string) {
    const { manga, chapters } = await this.scrapeUrl(url, sourceName);

    // 1. Upsert Manga into PostgreSQL
    const savedManga = await prisma.manga.upsert({
      where: { id: manga.id },
      update: {
        title: manga.title,
        description: manga.description,
        coverImage: manga.coverImage || "",
        author: manga.author || "غير معروف",
        status: manga.status || "مستمر",
        genres: manga.genres || [],
        source: sourceName || "url_crawler",
        sourceId: url,
      },
      create: {
        id: manga.id,
        title: manga.title,
        description: manga.description,
        coverImage: manga.coverImage || "",
        author: manga.author || "غير معروف",
        status: manga.status || "مستمر",
        genres: manga.genres || [],
        source: sourceName || "url_crawler",
        sourceId: url,
      },
    });

    // 2. Upsert Chapters into PostgreSQL
    for (const chap of chapters) {
      await prisma.chapter.upsert({
        where: { id: chap.id },
        update: {
          title: chap.title,
          chapterNum: chap.chapterNum,
        },
        create: {
          id: chap.id,
          mangaId: savedManga.id,
          title: chap.title,
          chapterNum: chap.chapterNum,
          pages: [],
        },
      });
    }

    return {
      manga: savedManga,
      chaptersCount: chapters.length,
      chapters,
    };
  }
}

export const universalUrlScraper = new UniversalUrlScraper();
