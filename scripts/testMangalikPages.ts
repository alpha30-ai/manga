import { universalUrlScraper } from "@/lib/scrapers/universalUrlScraper";

async function testPages() {
  const scraped = await universalUrlScraper.scrapeUrl("https://mangalik.net/manga/the-tale-of-cultivation-and-demon-extermination/");
  console.log("Chapters found:", scraped.chapters.length);
  if (scraped.chapters.length > 0) {
    const firstChap = scraped.chapters[0];
    const decodedUrl = Buffer.from(firstChap.id, "base64url").toString("utf-8");
    console.log("Chapter 8 URL:", decodedUrl);
    const pages = await universalUrlScraper.scrapeChapterPages(decodedUrl);
    console.log("Chapter 8 Pages Count:", pages.length);
    console.log("Sample Pages:", pages.slice(0, 3));
  }
}

testPages();
