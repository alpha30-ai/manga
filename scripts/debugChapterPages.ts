import * as cheerio from "cheerio";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
  "Referer": "https://3asq.online/manga/one-piece/",
};

async function testChapterPages() {
  // Test 3asq Chapter 1190 HTML
  const res = await fetch("https://3asq.online/manga/one-piece/1190/", {
    headers: BROWSER_HEADERS,
  });
  console.log("3asq chapter status:", res.status);
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log("All img count:", $("img").length);
  $("img").each((i, el) => {
    console.log(`Img ${i}: src=${$(el).attr("src")} | data-src=${$(el).attr("data-src")} | data-lazy-src=${$(el).attr("data-lazy-src")} | class=${$(el).attr("class")}`);
  });

  // Test MangaDex Chapter Pages
  const mdRes = await fetch("https://api.mangadex.org/at-home/server/f7d2cb75-83b2-426b-bdbd-032870c30abb");
  console.log("\nMangaDex at-home status:", mdRes.status);
  const mdData = await mdRes.json();
  console.log("MangaDex at-home response:", mdData);
}

testChapterPages();
