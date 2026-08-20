import * as cheerio from "cheerio";
import { universalUrlScraper } from "./universalUrlScraper";
import { ChapterInfo, MangaDetails } from "./index";
import { stealthFetchHtml } from "./stealthFetcher";
import prisma from "@/lib/prisma";

export class ArabicFallbackCrawler {
  /**
   * Searches verified Arabic providers for a manga by title and returns full chapters.
   */
  async findArabicMangaAndChapters(
    title: string,
    mangaIdToAttach?: string
  ): Promise<{ manga: MangaDetails; chapters: ChapterInfo[] } | null> {
    const cleanTitle = title
      .replace(/\(.*?\)/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/–|-/g, " ")
      .trim();

    if (!cleanTitle || cleanTitle.length < 2) return null;

    const providers = [
      `https://3asq.online/?s=${encodeURIComponent(cleanTitle)}&post_type=wp-manga`,
      `https://ar.kenmanga.com/?s=${encodeURIComponent(cleanTitle)}&post_type=wp-manga`,
      `https://lavascans.com/?s=${encodeURIComponent(cleanTitle)}&post_type=wp-manga`,
      `https://rocksmanga.com/?s=${encodeURIComponent(cleanTitle)}&post_type=wp-manga`,
      `https://olympustaff.com/?s=${encodeURIComponent(cleanTitle)}&post_type=wp-manga`,
      `https://mangalik.net/?s=${encodeURIComponent(cleanTitle)}&post_type=wp-manga`,
    ];

    for (const searchUrl of providers) {
      try {
        const html = await stealthFetchHtml(searchUrl);
        const $ = cheerio.load(html);

        let targetHref = "";
        $(".c-tabs-item__content, .page-item-detail, .row.c-tabs-item__content, .bsx, .item, .manga-item").each((_, el) => {
          if (!targetHref) {
            const href = $(el).find(".post-title a, h3 a, h4 a, .tt a, .series-title a, a").first().attr("href");
            if (href && (href.includes("/manga/") || href.includes("/series/") || href.includes("/comic/"))) {
              targetHref = href;
            }
          }
        });

        if (targetHref) {
          const scraped = await universalUrlScraper.scrapeUrl(targetHref);
          if (scraped.chapters.length > 0) {
            // If mangaIdToAttach is provided, upsert into PostgreSQL
            if (mangaIdToAttach) {
              await prisma.manga.upsert({
                where: { id: mangaIdToAttach },
                update: {
                  title: scraped.manga.title,
                  description: scraped.manga.description,
                  coverImage: scraped.manga.coverImage || "",
                  sourceId: targetHref,
                },
                create: {
                  id: mangaIdToAttach,
                  title: scraped.manga.title,
                  description: scraped.manga.description,
                  coverImage: scraped.manga.coverImage || "",
                  sourceId: targetHref,
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
        }
      } catch (e) {
        // Try next provider
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
