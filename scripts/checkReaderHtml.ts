import * as cheerio from "cheerio";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
  "Referer": "https://3asq.online/manga/one-piece/",
};

async function checkReaderHtml() {
  const res = await fetch("https://3asq.online/manga/one-piece/1190/", {
    headers: BROWSER_HEADERS,
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log("Reading content HTML:", $(".reading-content").html()?.slice(0, 500));
  console.log(".page-break count:", $(".page-break").length);
  $(".page-break img, .reading-content img").each((i, el) => {
    console.log(`Page ${i}:`, $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src"));
  });

  // Check if images are loaded via JS script / chapter_preloaded_images
  const scripts = $("script").map((_, s) => $(s).html()).get();
  for (const s of scripts) {
    if (s && (s.includes("chapter_images") || s.includes("image") || s.includes("wp-content/uploads"))) {
      console.log("Found relevant script containing image URLs:", s.slice(0, 300));
    }
  }
}

checkReaderHtml();
