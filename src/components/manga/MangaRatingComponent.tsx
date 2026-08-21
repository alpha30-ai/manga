"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2, Award, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface MangaRatingProps {
  mangaId: string;
  mangaTitle: string;
  coverImage?: string;
  author?: string;
  initialAvg?: number;
  initialVotes?: number;
}

export default function MangaRatingComponent({
  mangaId,
  mangaTitle,
  coverImage,
  author,
  initialAvg = 0,
  initialVotes = 0,
}: MangaRatingProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [avgRating, setAvgRating] = useState(initialAvg);
  const [totalVotes, setTotalVotes] = useState(initialVotes);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch real rating from server
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/manga/${mangaId}/rating`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data.averageRating === "number") {
            setAvgRating(data.averageRating);
            setTotalVotes(data.totalVotes);
            setUserRating(data.userRating);
          }
        }
      } catch (e) {
        console.error("Failed to fetch rating:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [mangaId]);

  const handleRate = async (score: number) => {
    if (!session) {
      toast.error("يرجى تسجيل الدخول أولاً للمشاركة في تقييم هذا العمل 🔒");
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Optimistic Update
    const prevUserRating = userRating;
    const prevAvg = avgRating;
    const prevVotes = totalVotes;

    setUserRating(score);
    if (prevUserRating === null) {
      const newTotal = totalVotes + 1;
      const newAvg = Math.round(((avgRating * totalVotes + score) / newTotal) * 10) / 10;
      setTotalVotes(newTotal);
      setAvgRating(newAvg);
    } else {
      const newAvg = Math.round(((avgRating * totalVotes - prevUserRating + score) / totalVotes) * 10) / 10;
      setAvgRating(newAvg);
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/manga/${mangaId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: score,
          mangaTitle,
          coverImage,
          author,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || `تم حفظ تقييمك (${score}/5) بنجاح! ⭐`);
        setAvgRating(data.averageRating);
        setTotalVotes(data.totalVotes);
        setUserRating(data.userRating);
      } else {
        // Revert on error
        setUserRating(prevUserRating);
        setAvgRating(prevAvg);
        setTotalVotes(prevVotes);
        toast.error(data.error || "فشل تسجيل التقييم");
      }
    } catch (e) {
      setUserRating(prevUserRating);
      setAvgRating(prevAvg);
      setTotalVotes(prevVotes);
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const activeStarIndex = hoverRating || userRating || Math.round(avgRating) || 0;

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-sm space-y-3" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Real Average Score Display */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xl shadow-sm shrink-0">
            {avgRating > 0 ? avgRating : "—"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-slate-900 dark:text-white">
                {avgRating > 0 ? `${avgRating} من 5` : "لم يتم التقييم بعد"}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              {totalVotes > 0 ? `بناءً على ${totalVotes} تقييم حقيقي من القراء` : "كن أول من يقيّم هذا العمل!"}
            </span>
          </div>
        </div>

        {/* Interactive 5-Star Rating Buttons */}
        <div className="flex flex-col items-start sm:items-end gap-1">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeStarIndex;

              return (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  disabled={submitting}
                  className="p-1 text-slate-300 dark:text-zinc-600 hover:scale-125 active:scale-95 transition-all focus:outline-none"
                  title={`تقييم ${star} نجوم`}
                >
                  <Star
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                      isFilled
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-zinc-700"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
            {userRating ? (
              <span className="text-[#FF334B] font-black">تقييمك المسجل: {userRating} نجوم ✓</span>
            ) : (
              "انقر على النجوم للتصويت"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
