import { arabicFallbackCrawler } from "@/lib/scrapers/arabicFallbackCrawler";
import { MangaDexScraper } from "@/lib/scrapers/mangadex";

async function testFallback() {
  console.log("=== Testing Fallback for The Tale of Cultivation and Demon Extermination ===");
  const res = await arabicFallbackCrawler.findArabicMangaAndChapters("The Tale of Cultivation and Demon Extermination");
  console.log("Arabic fallback result:", res ? `Found ${res.chapters.length} chapters (${res.manga.title})` : "Not found");

  console.log("=== Testing MangaDex search for The Tale of Cultivation ===");
  const md = new MangaDexScraper();
  const searchResults = await md.searchManga("The Tale of Cultivation");
  console.log("MangaDex found:", searchResults.map(m => `${m.title} (${m.id})`));
  if (searchResults.length > 0) {
    const chapters = await md.getChapters(searchResults[0].id);
    console.log(`MangaDex chapters for ${searchResults[0].title}: ${chapters.length}`);
  }
}

testFallback();
