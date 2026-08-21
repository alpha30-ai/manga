"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Play, Share2, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    // Check initial favorite status
    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/user/favorites?mangaId=${encodeURIComponent(manga.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data.isFavorite === "boolean") {
            setIsFavorite(data.isFavorite);
          }
        }
      } catch (e) {
        console.error("Failed to check favorite status:", e);
      } finally {
        setInitialLoaded(true);
      }
    };

    checkFavorite();
  }, [manga.id]);

  const toggleFavorite = async () => {
    if (!session) {
      toast.error("يرجى تسجيل الدخول أولاً لإضافة المانجا إلى مفضلتك 🔒", {
        duration: 3500,
      });
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Optimistic UI update: instantly flip state
    const previousState = isFavorite;
    const nextState = !previousState;
    setIsFavorite(nextState);

    try {
      setLoading(true);
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mangaId: manga.id,
          id: manga.id,
          title: manga.title,
          coverImage: manga.coverImage,
          author: manga.author,
          status: manga.status,
          genres: manga.genres,
        }),
      });

      if (res.status === 401) {
        setIsFavorite(previousState);
        toast.error("انتهت جلستك، يرجى تسجيل الدخول مجدداً");
        router.push("/auth/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
        if (data.isFavorite) {
          toast.success("تمت إضافة العمل إلى قائمة المفضلة ❤️");
        } else {
          toast.success("تمت إزالة العمل من المفضلة");
        }
      } else {
        // Revert on error
        setIsFavorite(previousState);
        toast.error("تعذر حفظ التغيير، يرجى المحاولة لاحقاً");
      }
    } catch (e) {
      console.error("Favorite toggle error:", e);
      setIsFavorite(previousState);
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: manga.title,
          text: `اقرأ مانجا ${manga.title} بأعلى جودة على ألفا مانجا!`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("تم نسخ رابط المانجا إلى الحافظة بنجاح!");
    }
  };

  const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
  const startReadingLink = lastReadChapterId
    ? `/manga/${manga.id}/chapter/${lastReadChapterId}`
    : firstChapter
    ? `/manga/${manga.id}/chapter/${firstChapter.id}`
    : "#";

  return (
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 pt-2">
      {/* Start or Resume Reading CTA */}
      {chapters.length > 0 && (
        <Link
          href={startReadingLink}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 text-white font-black rounded-2xl shadow-xl shadow-rose-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>
            {lastReadChapterNum ? `استكمال القراءة (فصل ${lastReadChapterNum})` : "بدء القراءة فوراً"}
          </span>
        </Link>
      )}

      {/* Real-time Interactive Favorite / Bookmark Button */}
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm border transition-all duration-300 shadow-sm active:scale-95 ${
          isFavorite
            ? "bg-[#FF334B]/10 dark:bg-[#FF334B]/20 text-[#FF334B] border-[#FF334B]/40 shadow-rose-500/10"
            : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
        }`}
        title={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#FF334B]" />
        ) : isFavorite ? (
          <>
            <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF334B] fill-[#FF334B]" />
            <span>في المفضلة ✓</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>إضافة للمفضلة</span>
          </>
        )}
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="p-3 sm:p-3.5 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
        title="مشاركة العمل"
        aria-label="مشاركة العمل"
      >
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}
