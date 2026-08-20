import { crawlerService } from "../src/lib/crawler";
import prisma from "../src/lib/prisma";

async function main() {
  const args = process.argv.slice(2);
  console.log("==================================================");
  console.log("🚀 ALPHA MANGA ARABIC CRAWLER & URL SCRAPER SYSTEM");
  console.log("==================================================\n");

  if (args.includes("--url") || args.includes("-u")) {
    const urlIdx = args.findIndex((arg) => arg === "--url" || arg === "-u");
    const targetUrl = args[urlIdx + 1];
    if (!targetUrl) {
      console.error("❌ يرجى تحديد الرابط المطلوب زحفه: --url \"https://...\"");
      process.exit(1);
    }

    console.log(`🌐 جاري زحف وتحليل DOM للرابط: "${targetUrl}"...`);
    const result = await crawlerService.crawlAndSaveManga(targetUrl, true);
    console.log("\n✅ نتيجة سحب الرابط:");
    console.log(result);
  } else if (args.includes("--all") || args.includes("-a")) {
    console.log("🔄 جاري مزامنة وتحديث كافة المانجات الموجودة في قاعدة البيانات...");
    const results = await crawlerService.syncAllTrackedMangas();
    console.log("\n📊 نتيجة المزامنة:");
    console.table(results);
  } else if (args.includes("--search") || args.includes("-s")) {
    const queryIdx = args.findIndex((arg) => arg === "--search" || arg === "-s");
    const query = args[queryIdx + 1];
    if (!query) {
      console.error("❌ يرجى تحديد اسم العمل للبحث: --search \"Solo Leveling\"");
      process.exit(1);
    }

    console.log(`🔍 جاري البحث وسحب العمل: "${query}"...`);
    const searchResults = await crawlerService["scraper"].searchManga(query, { limit: 1 });
    if (searchResults.length === 0) {
      console.error("❌ لم يتم العثور على أي نتائج.");
      process.exit(1);
    }

    const target = searchResults[0];
    console.log(`📥 جلب المانجا: ${target.title} (ID: ${target.id})...`);
    const result = await crawlerService.crawlAndSaveManga(target.id, true);
    console.log("\n✅ تمت العملية بنجاح!");
    console.log(result);
  } else {
    console.log("📥 جاري سحب أحدث 5 أعمال مانجا ومانهوا معربة وحفظها في قاعدة البيانات...");
    const results = await crawlerService.crawlPopularArabicFeed(5);
    console.log("\n📊 نتائج السحب والحفظ:");
    console.table(results);
  }

  const mangaCount = await prisma.manga.count();
  const chapterCount = await prisma.chapter.count();
  console.log("\n==================================================");
  console.log(`📈 إجمالي المانجات في قاعدة البيانات: ${mangaCount}`);
  console.log(`📑 إجمالي الفصول المحفوظة: ${chapterCount}`);
  console.log("==================================================\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌ Crawler Script Error:", err);
  process.exit(1);
});
