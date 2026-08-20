import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import { universalUrlScraper } from "@/lib/scrapers/universalUrlScraper";
import prisma from "@/lib/prisma";

async function test() {
  const mangadex = new MangaDexScraper();

  // Test 1: Popular MangaDex items
  console.log("=== Testing MangaDex Popular ===");
  const popular = await mangadex.getPopularManga(5);
  console.log("Popular count:", popular.length);
  for (const m of popular.slice(0, 3)) {
    const chapters = await mangadex.getChapters(m.id);
    console.log(`Manga [${m.title}] (ID: ${m.id}) -> Chapters count: ${chapters.length}`);
    if (chapters.length > 0) {
      console.log(`  Sample chapter 1: ${chapters[0].title} (ID: ${chapters[0].id})`);
      const pages = await mangadex.getChapterPages(chapters[0].id);
      console.log(`  Pages count for chapter ${chapters[0].id}: ${pages.length}`);
    }
  }

  // Test 2: 3asq.online Arabic scraper
  console.log("\n=== Testing 3asq.online Scraper ===");
  try {
    const scraped = await universalUrlScraper.scrapeUrl("https://3asq.online/manga/one-piece/");
    console.log("3asq One Piece Title:", scraped.manga.title);
    console.log("3asq One Piece Chapters count:", scraped.chapters.length);
    if (scraped.chapters.length > 0) {
      console.log("  First chapter:", scraped.chapters[0].title);
      const decodedChapterUrl = Buffer.from(scraped.chapters[0].id, "base64url").toString("utf-8");
      console.log("  Decoded chapter URL:", decodedChapterUrl);
      const pages = await universalUrlScraper.scrapeChapterPages(decodedChapterUrl);
      console.log("  Pages count:", pages.length);
    }
  } catch (e: any) {
    console.log("3asq error:", e.message);
  }
}

test();
