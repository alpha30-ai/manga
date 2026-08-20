import * as cheerio from "cheerio";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
};

const testUrls = [
  "https://mangalik.net/manga/",
  "https://3asq.online/manga/",
  "https://rocksmanga.com/manga/",
  "https://ar.kenmanga.com/manga/",
  "https://dilar.tube/",
  "https://olympustaff.com/",
  "https://mangatek.com/",
  "https://lavascans.com/manga/",
  "https://asuracomic.net/",
];

async function testSources() {
  for (const url of testUrls) {
    try {
      const res = await fetch(url, { headers: BROWSER_HEADERS });
      console.log(`URL: ${url} -> Status: ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);
        const titles: string[] = [];
        $(
          ".post-title a, .tt, h3 a, h4 a, .story-name a, .title a, .series-title, .bsx a, .entry-title a"
        ).each((_, el) => {
          const t = $(el).text().trim();
          if (t && t.length > 2 && !titles.includes(t)) {
            titles.push(t);
          }
        });
        console.log(`  Found ${titles.length} titles. First 3:`, titles.slice(0, 3));
      }
    } catch (err: any) {
      console.log(`  Error fetching ${url}:`, err.message);
    }
  }
}

testSources();
