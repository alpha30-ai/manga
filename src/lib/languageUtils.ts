/**
 * Language Intelligence Utility for Alpha Manga
 * Accurately detects Arabic vs English inputs, URLs, and provides localized chapter naming.
 */

export function isArabicQuery(text: string): boolean {
  if (!text) return false;
  // Arabic Unicode Range test
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
    text
  );
}

export function detectLanguage(text: string): "ar" | "en" {
  if (isArabicQuery(text)) {
    return "ar";
  }
  return "en";
}

export function formatChapterTitle(
  chapterNum: number,
  title?: string,
  lang: "ar" | "en" = "ar"
): string {
  const cleanNum = isNaN(chapterNum) ? "" : chapterNum;

  if (lang === "ar") {
    if (title && !title.includes("الفصل") && !title.includes("فصل")) {
      return `الفصل ${cleanNum}: ${title}`;
    }
    return title || `الفصل ${cleanNum}`;
  } else {
    if (title && !title.toLowerCase().includes("chapter") && !title.toLowerCase().includes("ch.")) {
      return `Chapter ${cleanNum}: ${title}`;
    }
    return title || `Chapter ${cleanNum}`;
  }
}
