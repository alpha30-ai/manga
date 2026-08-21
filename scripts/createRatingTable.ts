import "dotenv/config";
import { Pool } from "pg";

async function main() {
  console.log("Connecting to PostgreSQL...");
  let connectionString = process.env.DATABASE_URL || "";

  // Supabase transaction pooler port replacement 5432 -> 6543
  if (connectionString.includes("pooler.supabase.com:5432")) {
    connectionString = connectionString.replace(":5432", ":6543");
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 1000,
  });

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const client = await pool.connect();
      console.log(`Connected on attempt ${attempt}! Creating Rating table...`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS "Rating" (
          "id" TEXT NOT NULL,
          "rating" INTEGER NOT NULL,
          "userId" TEXT NOT NULL,
          "mangaId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
        );
      `);

      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Rating_userId_mangaId_key" ON "Rating"("userId", "mangaId");
      `);

      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Rating_userId_fkey'
          ) THEN
            ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);

      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Rating_mangaId_fkey'
          ) THEN
            ALTER TABLE "Rating" ADD CONSTRAINT "Rating_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);

      client.release();
      console.log("✅ Rating table and foreign keys created successfully in PostgreSQL!");
      break;
    } catch (e: any) {
      console.warn(`Attempt ${attempt} failed:`, e?.message);
      if (attempt === 5) throw e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  await pool.end();
}

main().catch(console.error);
