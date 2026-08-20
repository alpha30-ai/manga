import prisma from "../src/lib/prisma";

async function cleanup() {
  const sources = await prisma.mangaSource.findMany();
  const seenUrls = new Set<string>();

  for (const s of sources) {
    const normalized = s.baseUrl.replace(/\/$/, "");
    if (seenUrls.has(normalized)) {
      await prisma.mangaSource.delete({ where: { id: s.id } });
      console.log(`Deleted duplicate source: ${s.name} (${s.baseUrl})`);
    } else {
      seenUrls.add(normalized);
      if (s.baseUrl.endsWith("/")) {
        await prisma.mangaSource.update({
          where: { id: s.id },
          data: { baseUrl: normalized },
        });
      }
    }
  }

  const clean = await prisma.mangaSource.findMany();
  console.log(`Cleaned sources count: ${clean.length}`);
  await prisma.$disconnect();
}

cleanup().catch(console.error);
