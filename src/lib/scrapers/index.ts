export interface MangaSource {
  id: string;
  name: string;
  lang: string;
}

export interface MangaDetails {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  author: string;
  status: string;
  genres: string[];
  latestChapter?: number;
  originalLanguage?: string;
}

export interface ChapterInfo {
  id: string;
  title: string;
  chapterNum: number;
  publishedAt: Date;
  language?: string;
  scanlationGroup?: string;
}

export interface BaseScraper {
  sourceId: string;
  sourceName: string;
  
  searchManga(query: string): Promise<MangaDetails[]>;
  getMangaDetails(mangaId: string): Promise<MangaDetails>;
  getChapters(mangaId: string): Promise<ChapterInfo[]>;
  getChapterPages(chapterId: string): Promise<string[]>;
}
