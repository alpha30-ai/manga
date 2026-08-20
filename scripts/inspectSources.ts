import * as cheerio from "cheerio";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
  "Referer": "https://google.com",
};

async function inspectHtml(url: string) {
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS });
    console.log(`[${url}] status: ${res.status}`);
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      console.log(`[${url}] Title tag:`, $("title").text());
      console.log(`[${url}] Links count:`, $("a").length);
      console.log(`[${url}] Sample a hrefs:`, $("a").slice(0, 10).map((_, e) => $(e).attr("href")).get());
    }
  } catch (e: any) {
    console.log(`[${url}] error:`, e.message);
  }
}

async function run() {
  await inspectHtml("https://rocksmanga.com/");
  await inspectHtml("https://dilar.tube/");
  await inspectHtml("https://mangatek.com/manga/");
  await inspectHtml("https://meshmanga.com/");
}

run();
