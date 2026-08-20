import prisma from "@/lib/prisma";
import { multiSourceManager } from "@/lib/scrapers/multiSourceManager";

export async function getOrSeedSources() {
  try {
    let sources = await prisma.mangaSource.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (sources.length === 0) {
      const syncResult = await multiSourceManager.syncSourcesFromRepository();
      sources = syncResult.sources;
    }

    return sources;
  } catch (e) {
    console.error("Error getting or seeding sources:", e);
    return [];
  }
}
