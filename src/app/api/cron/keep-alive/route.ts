import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const startTime = Date.now();

  try {
    // Lightweight keep-alive query
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "active",
      message: "Database connection is active and healthy (Keep-Alive OK)",
      latencyMs: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
      pooler: "healthy",
    });
  } catch (error: any) {
    console.error("Keep-alive ping error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database keep-alive ping failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
