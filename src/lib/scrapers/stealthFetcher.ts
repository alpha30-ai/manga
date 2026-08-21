/**
 * StealthFetcher - Advanced Anti-Bot HTTP Client
 * 
 * Multi-layered approach to bypass Cloudflare, bot protection, and 403 blocks:
 * Layer 1: Rotating Real Browser User-Agents + Dynamic Headers
 * Layer 2: Smart Referer rotation based on target domain
 * Layer 3: Retry with exponential backoff
 * Layer 4: Multi-Proxy Fallback
 * Layer 5: Cookie persistence across requests
 */

// 20+ Real Browser User-Agents
const USER_AGENTS = [
  // Chrome on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  // Chrome on Mac
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  // Firefox on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
  // Firefox on Mac
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
  // Safari on Mac
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  // Edge on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  // Chrome on Android
  "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
];

// Accept-Language patterns to rotate
const ACCEPT_LANGUAGES = [
  "ar,en-US;q=0.9,en;q=0.8",
  "ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7",
  "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
  "en-US,en;q=0.9,ar;q=0.8",
];

// CORS / Scraping Proxies (free, public)
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Simple in-memory cookie store (per domain)
const cookieStore = new Map<string, string>();

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/**
 * Generates dynamic browser-like headers for each request
 */
function generateStealthHeaders(targetUrl: string, method = "GET"): Record<string, string> {
  const ua = getRandomItem(USER_AGENTS);
  const isChrome = ua.includes("Chrome") && !ua.includes("Edg");
  const domain = getDomain(targetUrl);

  const headers: Record<string, string> = {
    "User-Agent": ua,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": getRandomItem(ACCEPT_LANGUAGES),
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
  };

  if (isChrome) {
    headers["Sec-CH-UA"] = '"Chromium";v="126", "Google Chrome";v="126", "Not-A.Brand";v="8"';
    headers["Sec-CH-UA-Mobile"] = "?0";
    headers["Sec-CH-UA-Platform"] = '"Windows"';
    headers["Sec-Fetch-Dest"] = "document";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-Site"] = "none";
    headers["Sec-Fetch-User"] = "?1";
  }

  const referers = [
    `https://www.google.com/search?q=${domain}`,
    `https://www.google.com/`,
    `https://${domain}/`,
  ];
  headers["Referer"] = getRandomItem(referers);

  const savedCookies = cookieStore.get(domain);
  if (savedCookies) {
    headers["Cookie"] = savedCookies;
  }

  return headers;
}

function saveCookies(url: string, response: Response): void {
  const domain = getDomain(url);
  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  if (setCookieHeaders.length > 0) {
    const cookies = setCookieHeaders
      .map((c) => c.split(";")[0])
      .join("; ");
    const existing = cookieStore.get(domain);
    cookieStore.set(domain, existing ? `${existing}; ${cookies}` : cookies);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface StealthFetchOptions {
  method?: "GET" | "POST";
  body?: string;
  maxRetries?: number;
  useProxy?: boolean;
  timeout?: number;
  customHeaders?: Record<string, string>;
  revalidate?: number;
}

export interface StealthFetchResult {
  html: string;
  status: number;
  ok: boolean;
  usedProxy: boolean;
  attempt: number;
}

/**
 * Advanced stealth fetch with multi-layer anti-bot bypass
 */
export async function stealthFetch(
  url: string,
  options: StealthFetchOptions = {}
): Promise<StealthFetchResult> {
  const {
    method = "GET",
    body,
    maxRetries = 2,
    useProxy = true,
    timeout = 10000,
    customHeaders = {},
    revalidate = 300,
  } = options;

  let lastError: Error | null = null;

  // Layer 1-3: Direct fetch with stealth headers
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const headers = { ...generateStealthHeaders(url, method), ...customHeaders };
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
        redirect: "follow",
        next: { revalidate } as any,
      };

      if (body && method === "POST") {
        fetchOptions.body = body;
      }

      const res = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      saveCookies(url, res);

      if (res.ok) {
        const html = await res.text();
        return { html, status: res.status, ok: true, usedProxy: false, attempt };
      }

      // If 403/503/429, wait and retry
      if (res.status === 403 || res.status === 503 || res.status === 429) {
        if (attempt < maxRetries) {
          await delay(800 * attempt);
          continue;
        }
      } else if (res.status >= 200 && res.status < 400) {
        const html = await res.text();
        return { html, status: res.status, ok: true, usedProxy: false, attempt };
      }

      lastError = new Error(`HTTP ${res.status}`);
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        await delay(500 * attempt);
      }
    }
  }

  // Layer 4: CORS Proxy fallback
  if (useProxy && method === "GET") {
    for (let proxyIdx = 0; proxyIdx < CORS_PROXIES.length; proxyIdx++) {
      try {
        const proxyUrl = CORS_PROXIES[proxyIdx](url);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const res = await fetch(proxyUrl, {
          headers: {
            "User-Agent": getRandomItem(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ar,en;q=0.9",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const html = await res.text();
          if (html.length > 200 && (html.includes("<") || html.includes("{"))) {
            return { html, status: 200, ok: true, usedProxy: true, attempt: maxRetries + proxyIdx + 1 };
          }
        }
      } catch {}
    }
  }

  // Return fallback error or empty result
  throw new Error(
    `تعذر قراءة الرابط من المصدر (${url}): ${lastError?.message || "فشل الاتصال بخادم المصدر"}`
  );
}

export async function stealthFetchHtml(url: string, options?: StealthFetchOptions): Promise<string> {
  const result = await stealthFetch(url, options);
  return result.html;
}

export async function stealthPost(url: string, options?: StealthFetchOptions): Promise<string> {
  const result = await stealthFetch(url, { ...options, method: "POST" });
  return result.html;
}
