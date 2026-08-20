import { universalUrlScraper } from "@/lib/scrapers/universalUrlScraper";
import * as cheerio from "cheerio";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
};

async function testSearchArabic(query: string) {
  console.log(`=== Searching Arabic Sources for [${query}] ===`);

  // 1. Search 3asq
  try {
    const res = await fetch(`https://3asq.online/?s=${encodeURIComponent(query)}&post_type=wp-manga`, {
      headers: BROWSER_HEADERS,
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const items: any[] = [];
      $(".c-tabs-item__content, .page-item-detail, .row.c-tabs-item__content").each((_, el) => {
        const title = $(el).find(".post-title a, h3 a, h4 a").first().text().trim();
        const href = $(el).find(".post-title a, h3 a, h4 a").first().attr("href");
        if (title && href) items.push({ title, href });
      });
      console.log(`3asq found ${items.length} items:`, items.slice(0, 3));
      if (items.length > 0) {
        const scraped = await universalUrlScraper.scrapeUrl(items[0].href);
        console.log(`  Scraped [${scraped.manga.title}] -> Chapters: ${scraped.chapters.length}`);
        if (scraped.chapters.length > 0) {
          const chapUrl = Buffer.from(scraped.chapters[0].id, "base64url").toString("utf-8");
          const pages = await universalUrlScraper.scrapeChapterPages(chapUrl);
          console.log(`  Chapter ${scraped.chapters[0].title} pages: ${pages.length}`);
        }
      }
    }
  } catch (e: any) {
    console.log("3asq search error:", e.message);
  }

  // 2. Search KenManga
  try {
    const res = await fetch(`https://ar.kenmanga.com/?s=${encodeURIComponent(query)}&post_type=wp-manga`, {
      headers: BROWSER_HEADERS,
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const items: any[] = [];
      $(".c-tabs-item__content, .page-item-detail").each((_, el) => {
        const title = $(el).find(".post-title a, h3 a, h4 a").first().text().trim();
        const href = $(el).find(".post-title a, h3 a, h4 a").first().attr("href");
        if (title && href) items.push({ title, href });
      });
      console.log(`KenManga found ${items.length} items:`, items.slice(0, 3));
    }
  } catch (e: any) {
    console.log("KenManga search error:", e.message);
  }
}

async function run() {
  await testSearchArabic("Solo Leveling");
  await testSearchArabic("One Piece");
}

run();
