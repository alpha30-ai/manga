import { NextRequest, NextResponse } from "next/server";

const BROWSER_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url");

    if (!rawUrl) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    let targetUrl = rawUrl.trim();

    // Check if base64 encoded
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      try {
        const decoded = Buffer.from(targetUrl, "base64url").toString("utf-8");
        if (decoded.startsWith("http")) targetUrl = decoded;
      } catch (e) {}
    }

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      return new NextResponse("Invalid URL", { status: 400 });
    }

    const targetOrigin = new URL(targetUrl).origin;
    const ua = BROWSER_USER_AGENTS[Math.floor(Math.random() * BROWSER_USER_AGENTS.length)];

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": ua,
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
        "Referer": `${targetOrigin}/`,
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      // Try with empty referer as fallback
      const fallbackRes = await fetch(targetUrl, {
        headers: {
          "User-Agent": ua,
          "Accept": "image/*,*/*",
        },
      });

      if (!fallbackRes.ok) {
        return new NextResponse(`Failed to fetch image: ${res.status}`, { status: res.status });
      }

      const buffer = await fallbackRes.arrayBuffer();
      const contentType = fallbackRes.headers.get("content-type") || "image/jpeg";

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cross-Origin-Resource-Policy": "cross-origin",
          "Cross-Origin-Embedder-Policy": "unsafe-none",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Cross-Origin-Embedder-Policy": "unsafe-none",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Image proxy error:", error);
    return new NextResponse(error.message || "Proxy error", { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
