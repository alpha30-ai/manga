/**
 * Utility functions for handling manga covers and chapter image URLs with proxying and anti-hotlink bypass
 */

export function getSafeImageUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/api/proxy-image") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/file.svg") ||
    trimmed.startsWith("/globe.svg") ||
    trimmed.startsWith("/next.svg") ||
    trimmed.startsWith("/vercel.svg") ||
    trimmed.startsWith("/window.svg")
  ) {
    return trimmed;
  }

  // Route through high-speed server proxy to bypass CORS, CORP, and MangaDex hotlink protection
  return `/api/proxy-image?url=${encodeURIComponent(trimmed)}`;
}
