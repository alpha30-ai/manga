"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Play, CheckCircle, Share2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface MangaActionsProps {
  manga: {
    id: string;
    title: string;
    coverImage: string;
    author: string;
    status: string;
    genres: string[];
  };
  chapters: any[];
  lastReadChapterId?: string | null;
  lastReadChapterNum?: number | null;
}

export default function MangaActions({
  manga,
  chapters,
  lastReadChapterId,
  lastReadChapterNum,
}: MangaActionsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check initial favorite status
    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/user/favorites?mangaId=${manga.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkFavorite();
  }, [manga.id]);

  const toggleFavorite = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manga),
      });

      if (res.status === 401) {
        toast.error("يرجى تسجيل الدخول لإضافة المانجا إلى المفضلة");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
        toast.success(data.message || (data.isFavorite ? "تمت الإضافة للمفضلة" : "تمت الإزالة"));
      }
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء تحديث المفضلة");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: manga.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("تم نسخ رابط المانجا للحافظة!");
    }
  };

  const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
  const startReadingLink = lastReadChapterId
    ? `/manga/${manga.id}/chapter/${lastReadChapterId}`
    : firstChapter
    ? `/manga/${manga.id}/chapter/${firstChapter.id}`
    : "#";

  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      {chapters.length > 0 && (
        <Link
          href={startReadingLink}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-l from-indigo-500 via-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>
            {lastReadChapterNum ? `استكمال القراءة (فصل ${lastReadChapterNum})` : "بدء القراءة"}
          </span>
        </Link>
      )}

      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm border transition-all ${
          isFavorite
            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 shadow-md shadow-rose-500/10"
            : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        }`}
      >
        {isFavorite ? (
          <>
            <BookmarkCheck className="w-5 h-5 text-rose-500" />
            <span>في المفضلة</span>
          </>
        ) : (
          <>
            <Bookmark className="w-5 h-5" />
            <span>إضافة للمفضلة</span>
          </>
        )}
      </button>

      <button
        onClick={handleShare}
        className="p-3.5 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        title="مشاركة العمل"
        aria-label="مشاركة العمل"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );
}
