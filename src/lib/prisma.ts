import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getPool(): Pool {
  if (!globalForPrisma.pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/manga";

    globalForPrisma.pool = new Pool({
      connectionString,
      max: 1, // 1 connection per serverless lambda to stay strictly within Supabase 15-client session mode
      idleTimeoutMillis: 1000, // Terminate idle connections after 1s
      connectionTimeoutMillis: 6000,
      allowExitOnIdle: true,
    });

    globalForPrisma.pool.on("error", (err) => {
      console.error("PostgreSQL Pool error:", err);
    });
  }
  return globalForPrisma.pool;
}

function createPrismaClient(): PrismaClient {
  const pool = getPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Unconditional global singleton across both Development & Serverless Production
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;

export default prisma;
