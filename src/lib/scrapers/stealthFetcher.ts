/**
 * StealthFetcher - Advanced Anti-Bot HTTP Client
 * 
 * Multi-layered approach to bypass Cloudflare, bot protection, and 403 blocks:
 * Layer 1: Rotating User-Agents + Dynamic Headers (mimics real browsers)
 * Layer 2: Smart Referer rotation based on target domain
 * Layer 3: Retry with exponential backoff
 * Layer 4: Multi-Proxy Fallback (allorigins.win, corsproxy.io, codetabs, jina reader)
 * Layer 5: Cookie persistence across requests to the same domain
 */

// 20+ Real Browser User-Agents (rotated randomly per request)
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
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  // Edge on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
  // Chrome on Android
  "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  // Safari on iOS
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  // Chrome on Linux
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  // Opera
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OPR/112.0.0.0",
  // Brave
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Brave/126",
];

// Accept-Language patterns to rotate
const ACCEPT_LANGUAGES = [
  "ar,en-US;q=0.9,en;q=0.8",
  "ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7",
  "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
  "en-US,en;q=0.9,ar;q=0.8",
  "ar,en;q=0.9",
  "en-GB,en;q=0.9,ar;q=0.8,en-US;q=0.7",
];

// CORS / Scraping Proxies (free, public)
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://r.jina.ai/${url}`,
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
  const isChrome = ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR");
  const isFirefox = ua.includes("Firefox");
  const domain = getDomain(targetUrl);

  const headers: Record<string, string> = {
    "User-Agent": ua,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": getRandomItem(ACCEPT_LANGUAGES),
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
  };

  // Chrome-specific Sec-* headers
  if (isChrome) {
    headers["Sec-CH-UA"] = '"Chromium";v="126", "Google Chrome";v="126", "Not-A.Brand";v="8"';
    headers["Sec-CH-UA-Mobile"] = "?0";
    headers["Sec-CH-UA-Platform"] = '"Windows"';
    headers["Sec-Fetch-Dest"] = "document";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-Site"] = "none";
    headers["Sec-Fetch-User"] = "?1";
  }

  // Firefox-specific headers
  if (isFirefox) {
    headers["Sec-Fetch-Dest"] = "document";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-Site"] = "none";
    headers["Sec-Fetch-User"] = "?1";
    headers["TE"] = "trailers";
  }

  // Smart Referer based on the target domain
  const referers = [
    `https://www.google.com/search?q=${domain}`,
    `https://www.google.com/`,
    `https://${domain}/`,
    `https://www.bing.com/search?q=${domain}`,
  ];
  const referer = getRandomItem(referers);
  if (referer) {
    headers["Referer"] = referer;
  }

  // Restore cookies for this domain if we have any
  const savedCookies = cookieStore.get(domain);
  if (savedCookies) {
    headers["Cookie"] = savedCookies;
  }

  return headers;
}

/**
 * Saves Set-Cookie headers from response for future requests
 */
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

/**
 * Delays execution for the specified number of milliseconds
 */
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
    maxRetries = 3,
    useProxy = true,
    timeout = 15000,
    customHeaders = {},
    revalidate = 300,
  } = options;

  let lastError: Error | null = null;

  // Layer 1-3: Direct fetch with stealth headers + retry with backoff
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

      // Save cookies for session persistence
      saveCookies(url, res);

      if (res.ok) {
        const html = await res.text();
        return { html, status: res.status, ok: true, usedProxy: false, attempt };
      }

      // If 403/503/429 (bot protection), wait and retry with different headers
      if (res.status === 403 || res.status === 503 || res.status === 429) {
        console.warn(`[StealthFetch] Got ${res.status} from ${getDomain(url)}, attempt ${attempt}/${maxRetries}`);
        if (attempt < maxRetries) {
          await delay(1000 * attempt + Math.random() * 1000);
          continue;
        }
        // If last attempt, do NOT return 403 page - continue to Proxy layer!
      } else if (res.status >= 200 && res.status < 400) {
        const html = await res.text();
        return { html, status: res.status, ok: true, usedProxy: false, attempt };
      }

      lastError = new Error(`HTTP ${res.status}`);
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        await delay(1000 * attempt);
      }
    }
  }

  // Layer 4: CORS Proxy fallback (only for GET requests)
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
            "Accept-Language": getRandomItem(ACCEPT_LANGUAGES),
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const html = await res.text();
          // Validate we got actual HTML
          if (html.length > 200 && (html.includes("<") || html.includes("{"))) {
            console.log(`[StealthFetch] ✓ Proxy ${proxyIdx + 1} succeeded for ${getDomain(url)}`);
            return { html, status: 200, ok: true, usedProxy: true, attempt: maxRetries + proxyIdx + 1 };
          }
        }
      } catch {
        // Try next proxy
      }
    }
  }

  // All layers failed
  throw new Error(
    `[StealthFetch] فشل جلب الرابط بعد ${maxRetries} محاولات و ${CORS_PROXIES.length} بروكسي: ${url} - ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Convenience wrapper that returns Cheerio-ready HTML string
 */
export async function stealthFetchHtml(url: string, options?: StealthFetchOptions): Promise<string> {
  const result = await stealthFetch(url, options);
  return result.html;
}

/**
 * POST request with stealth headers (for Madara AJAX endpoints)
 */
export async function stealthPost(url: string, options?: StealthFetchOptions): Promise<string> {
  const result = await stealthFetch(url, { ...options, method: "POST" });
  return result.html;
}
