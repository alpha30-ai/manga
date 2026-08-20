"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Trash2, User, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
}

export default function MangaComments({ mangaId }: { mangaId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments?mangaId=${mangaId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Comments fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [mangaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!session) {
      toast.error("يرجى تسجيل الدخول للتعليق");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          mangaId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "حدث خطأ");

      toast.success("تم نشر تعليقك بنجاح!");
      setNewComment("");
      fetchComments();
    } catch (error: any) {
      toast.error(error.message || "فشل إرسال التعليق");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("تم حذف التعليق");
        setComments((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error("فشل حذف التعليق");
      }
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <span>التعليقات والمناقشات ({comments.length})</span>
        </h3>
      </div>

      {/* Post comment box */}
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب رأيك أو مناقشتك حول هذا العمل..."
              rows={3}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-l from-indigo-500 to-purple-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>إرسال التعليق</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-center space-y-2">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            يرجى تسجيل الدخول لتتمكن من كتابة تعليق والمشاركة في النقاش.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            تسجيل الدخول الآن
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 pt-2">
        {loading && (
          <div className="py-8 text-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
            <p className="text-xs mt-2">جاري تحميل التعليقات...</p>
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="py-8 text-center text-zinc-400 space-y-1">
            <p className="text-sm font-medium">كن أول من يترك تعليقاً على هذه المانجا!</p>
          </div>
        )}

        {comments.map((comment) => {
          const isAuthor = (session?.user as any)?.id === comment.user.id;
          const isAdmin = (session?.user as any)?.role === "ADMIN";

          return (
            <div key={comment.id} className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {comment.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {comment.user?.name || "مستخدم"}
                      </span>
                      {comment.user?.role === "ADMIN" && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded">
                          إدارة
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(comment.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {(isAuthor || isAdmin) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="حذف التعليق"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 pr-10 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
