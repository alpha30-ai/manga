import * as cheerio from "cheerio";
import { universalUrlScraper } from "./universalUrlScraper";
import { ChapterInfo, MangaDetails } from "./index";
import { stealthFetchHtml } from "./stealthFetcher";
import prisma from "@/lib/prisma";

export interface ArabicSearchResult {
  title: string;
  url: string;
  coverImage?: string;
  source: string;
  latestChapter?: string;
}

export class ArabicFallbackCrawler {
  private providers = [
    { name: "3asq (العاشق)", baseUrl: "https://3asq.online/?s={QUERY}&post_type=wp-manga" },
    { name: "Kenmanga", baseUrl: "https://ar.kenmanga.com/?s={QUERY}&post_type=wp-manga" },
    { name: "LavaScans", baseUrl: "https://lavascans.com/?s={QUERY}&post_type=wp-manga" },
    { name: "RocksManga", baseUrl: "https://rocksmanga.com/?s={QUERY}&post_type=wp-manga" },
    { name: "Olympus", baseUrl: "https://olympustaff.com/?s={QUERY}&post_type=wp-manga" },
    { name: "MangaLik", baseUrl: "https://mangalik.net/?s={QUERY}&post_type=wp-manga" },
  ];

  /**
   * Searches across all popular Arabic manga translation sites and returns matched results
   */
  async searchAllArabicSources(query: string): Promise<ArabicSearchResult[]> {
    const cleanQuery = query
      .replace(/\(.*?\)/g, "")
      .replace(/\[.*?\]/g, "")
      .trim();

    if (!cleanQuery || cleanQuery.length < 2) return [];

    const results: ArabicSearchResult[] = [];
    const promises = this.providers.map(async (provider) => {
      try {
        const searchUrl = provider.baseUrl.replace("{QUERY}", encodeURIComponent(cleanQuery));
        const html = await stealthFetchHtml(searchUrl);
        const $ = cheerio.load(html);

        $(".c-tabs-item__content, .page-item-detail, .row.c-tabs-item__content, .bsx, .item, .manga-item, .search-wrap .row").each((_, el) => {
          const titleEl = $(el).find(".post-title a, h3 a, h4 a, .tt a, .series-title a, .title a").first();
          const title = titleEl.text().trim();
          const url = titleEl.attr("href");

          let coverImage =
            $(el).find("img").first().attr("src") ||
            $(el).find("img").first().attr("data-src") ||
            $(el).find("img").first().attr("data-lazy-src") ||
            "";

          const latestChap = $(el).find(".chapter a, .latest-chap, .epxs").first().text().trim();

          if (url && title && (url.includes("/manga/") || url.includes("/series/") || url.includes("/comic/") || url.includes("/manhwa/"))) {
            // Avoid duplicate URLs
            if (!results.some((r) => r.url === url)) {
              results.push({
                title,
                url: url.startsWith("http") ? url : new URL(url, searchUrl).toString(),
                coverImage,
                source: provider.name,
                latestChapter: latestChap || undefined,
              });
            }
          }
        });
      } catch (e) {
        // Individual provider timeout/error is skipped
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Searches verified Arabic providers for a manga by title and returns full chapters.
   */
  async findArabicMangaAndChapters(
    title: string,
    mangaIdToAttach?: string
  ): Promise<{ manga: MangaDetails; chapters: ChapterInfo[] } | null> {
    const searchResults = await this.searchAllArabicSources(title);

    for (const item of searchResults) {
      try {
        const scraped = await universalUrlScraper.scrapeUrl(item.url, item.source);
        if (scraped.chapters.length > 0) {
          // If mangaIdToAttach is provided, upsert into PostgreSQL
          if (mangaIdToAttach) {
            await prisma.manga.upsert({
              where: { id: mangaIdToAttach },
              update: {
                title: scraped.manga.title || item.title,
                description: scraped.manga.description,
                coverImage: scraped.manga.coverImage || item.coverImage || "",
                source: item.source,
                sourceId: item.url,
              },
              create: {
                id: mangaIdToAttach,
                title: scraped.manga.title || item.title,
                description: scraped.manga.description,
                coverImage: scraped.manga.coverImage || item.coverImage || "",
                source: item.source,
                sourceId: item.url,
                genres: scraped.manga.genres || ["مانجا"],
                status: scraped.manga.status || "مستمر",
              },
            });

            for (const ch of scraped.chapters) {
              await prisma.chapter.upsert({
                where: { id: ch.id },
                update: {
                  title: ch.title,
                  chapterNum: ch.chapterNum,
                },
                create: {
                  id: ch.id,
                  mangaId: mangaIdToAttach,
                  title: ch.title,
                  chapterNum: ch.chapterNum,
                  pages: [],
                },
              });
            }
          }

          return scraped;
        }
      } catch (e) {
        // Try next match
      }
    }

    return null;
  }

  /**
   * Fallback to find images for a specific chapter number across Arabic sources.
   */
  async findChapterPagesByNumber(mangaTitle: string, chapterNum: number): Promise<string[]> {
    const scraped = await this.findArabicMangaAndChapters(mangaTitle);
    if (!scraped || scraped.chapters.length === 0) return [];

    const targetChap = scraped.chapters.find(
      (c) => c.chapterNum === chapterNum || Math.floor(c.chapterNum) === Math.floor(chapterNum)
    );

    if (targetChap) {
      try {
        const decoded = Buffer.from(targetChap.id, "base64url").toString("utf-8");
        if (decoded.startsWith("http")) {
          return await universalUrlScraper.scrapeChapterPages(decoded);
        }
      } catch (e) {}
    }

    return [];
  }
}

export const arabicFallbackCrawler = new ArabicFallbackCrawler();
