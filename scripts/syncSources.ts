import { multiSourceManager } from "../src/lib/scrapers/multiSourceManager";
import prisma from "../src/lib/prisma";

async function main() {
  console.log("🔄 جاري مزامنة المصادر من المستودع السحابي...");
  const result = await multiSourceManager.syncSourcesFromRepository();
  console.log(`✅ تم استيراد وتحديث ${result.count} مصدراً في قاعدة البيانات:`);
  console.table(
    result.sources.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.baseUrl,
      language: s.language,
      isActive: s.isActive,
    }))
  );
  await prisma.$disconnect();
}

main().catch(console.error);
