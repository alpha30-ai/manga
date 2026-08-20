import { MangaDexScraper } from "@/lib/scrapers/mangadex";

async function checkSolo() {
  const mangadex = new MangaDexScraper();
  const chapters = await mangadex.getChapters("32d76d19-8a05-4db0-9fc2-e0b0648fe9d0");
  console.log("Solo chapters count:", chapters.length);
  for (const c of chapters) {
    const pages = await mangadex.getChapterPages(c.id);
    console.log(`Chapter ${c.chapterNum} (${c.id}) [${c.language}] -> Pages: ${pages.length}`);
  }
}

checkSolo();
