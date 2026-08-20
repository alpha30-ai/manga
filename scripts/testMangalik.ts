import { universalUrlScraper } from "@/lib/scrapers/universalUrlScraper";
import { stealthFetch } from "@/lib/scrapers/stealthFetcher";

async function testStealth() {
  console.log("=== Testing StealthFetcher on mangalik.net ===");
  try {
    const res = await stealthFetch("https://mangalik.net/manga/the-tale-of-cultivation-and-demon-extermination/");
    console.log("Status:", res.status, "ok:", res.ok, "usedProxy:", res.usedProxy, "html len:", res.html.length);
    
    const scraped = await universalUrlScraper.scrapeUrl("https://mangalik.net/manga/the-tale-of-cultivation-and-demon-extermination/");
    console.log("Scraped Title:", scraped.manga.title);
    console.log("Chapters Count:", scraped.chapters.length);
    if (scraped.chapters.length > 0) {
      console.log("First Chapter:", scraped.chapters[0].title);
      console.log("Last Chapter:", scraped.chapters[scraped.chapters.length - 1].title);
    }
  } catch (e: any) {
    console.error("Test Error:", e.message);
  }
}

testStealth();
