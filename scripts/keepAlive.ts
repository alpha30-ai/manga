import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// Load .env if present
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...values] = trimmed.split("=");
          const val = values.join("=").replace(/^["']|["']$/g, "").trim();
          if (key && val) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  } catch (e) {}
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.log("⚠️ No DATABASE_URL found in environment or .env file.");
    process.exit(0);
  }

  console.log("⚡ Starting Supabase/PostgreSQL Database Keep-Alive Ping...");
  const startTime = Date.now();

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    max: 1,
  });

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time, 1 as active");
    client.release();
    await pool.end();

    const latency = Date.now() - startTime;
    console.log(`✅ Database is ACTIVE and Healthy!`);
    console.log(`⏱️ Latency: ${latency}ms`);
    console.log(`🕒 Server Time: ${result.rows[0]?.current_time}`);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Database Keep-Alive failed:", error.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

main();
