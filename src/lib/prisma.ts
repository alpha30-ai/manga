import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getConnectionString(): string {
  let connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/manga";

  // Automatically switch Supabase Session Pooler (port 5432, max 15 limit)
  // to Transaction Mode (port 6543, unlimited concurrent clients)
  if (connectionString.includes("pooler.supabase.com:5432")) {
    connectionString = connectionString.replace(":5432", ":6543");
    if (!connectionString.includes("pgbouncer=true")) {
      connectionString += (connectionString.includes("?") ? "&" : "?") + "pgbouncer=true";
    }
  }

  return connectionString;
}

function getPool(): Pool {
  if (!globalForPrisma.pool) {
    const connectionString = getConnectionString();

    globalForPrisma.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: true,
    });

    globalForPrisma.pool.on("error", (err) => {
      console.warn("PostgreSQL Pool warning:", err?.message || err);
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
