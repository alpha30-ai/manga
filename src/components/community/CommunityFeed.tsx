"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  MessageCircle,
  Heart,
  Send,
  Image as ImageIcon,
  Loader2,
  Users,
  Sparkles,
  X,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string | Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface PostItem {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
  comments: CommentItem[];
  likesCount?: number;
  isLiked?: boolean;
}

export default function CommunityFeed({ initialPosts }: { initialPosts: PostItem[] }) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [content, setContent] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Selection
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 3 ميغابايت");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !postImage) return;

    if (!session) {
      toast.error("يرجى تسجيل الدخول للنشر");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          image: postImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "حدث خطأ");

      toast.success("تم نشر المنشور بنجاح في المجتمع!");
      setContent("");
      setPostImage(null);

      // Add optimistic post
      const newPost: PostItem = {
        id: data.post.id,
        title: data.post.title,
        content: data.post.content,
        image: data.post.image,
        createdAt: new Date(),
        user: {
          id: (session.user as any).id,
          name: session.user.name || "مستخدم",
          image: session.user.image || null,
          role: (session.user as any).role || "USER",
        },
        comments: [],
        likesCount: 0,
        isLiked: false,
      };

      setPosts([newPost, ...posts]);
    } catch (e: any) {
      toast.error(e.message || "فشل النشر");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();

    if (!session) {
      toast.error("يرجى تسجيل الدخول للإعجاب بالمنشور");
      return;
    }

    // Optimistic UI Update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const currentlyLiked = !!p.isLiked;
          const currentCount = p.likesCount || 0;
          return {
            ...p,
            isLiked: !currentlyLiked,
            likesCount: currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
          };
        }
        return p;
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      const currentlyLiked = !!selectedPost.isLiked;
      const currentCount = selectedPost.likesCount || 0;
      setSelectedPost({
        ...selectedPost,
        isLiked: !currentlyLiked,
        likesCount: currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
      });
    }

    try {
      const res = await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }

      // Sync exact database state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiked: data.isLiked, likesCount: data.likesCount } : p
        )
      );

      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost((prev) =>
          prev ? { ...prev, isLiked: data.isLiked, likesCount: data.likesCount } : null
        );
      }
    } catch (err: any) {
      toast.error(err.message || "فشل تسجيل الإعجاب");
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInput.trim();
    if (!text) return;

    if (!session) {
      toast.error("يرجى تسجيل الدخول للتعليق");
      return;
    }

    try {
      setCommentSubmitting(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          postId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("تمت إضافة التعليق");
        setCommentInput("");

        const newComment: CommentItem = {
          id: data.comment.id,
          content: data.comment.content,
          createdAt: new Date(),
          user: {
            name: session.user.name || "مستخدم",
            image: session.user.image || null,
          },
        };

        // Update posts state and selected post state
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
        );

        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({
            ...selectedPost,
            comments: [...selectedPost.comments, newComment],
          });
        }
      }
    } catch (e) {
      toast.error("فشل إضافة التعليق");
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Create Post Section */}
      {session ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200/90 dark:border-zinc-800/80 p-6 sm:p-8">
          <form onSubmit={handlePost} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF334B] to-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {session.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <span className="font-black text-sm text-slate-950 dark:text-white block">
                  شارك بنقاش أو نظرية أو صورة مع قراء الموقع
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  انشر رأيك ليظهر لجميع الأعضاء في شبكة المجتمع
                </span>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="بم تفكر؟ شارك تحليلك لأحدث الفصول أو رشح مانجا لأصدقائك..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#FF334B] outline-none resize-none transition-all shadow-inner"
            />

            {/* Attached Image Preview */}
            {postImage && (
              <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 max-h-60">
                <img src={postImage} alt="مرفق" className="max-h-60 w-auto object-cover" />
                <button
                  type="button"
                  onClick={() => setPostImage(null)}
                  className="absolute top-2 left-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                  title="إزالة الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-[#FF334B]" />
                <span>إرفاق صورة من فصل</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImagePick}
                accept="image/*"
                className="hidden"
              />

              <button
                type="submit"
                disabled={submitting || (!content.trim() && !postImage)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-l from-[#FF334B] to-rose-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-rose-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>نشر المنشور</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gradient-to-l from-rose-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-sm">
          <Sparkles className="w-8 h-8 text-[#FF334B] mx-auto" />
          <h3 className="font-black text-base text-slate-950 dark:text-white">انضم لمجتمع النقاشات العربي</h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
            سجل دخولك الآن لتتمكن من كتابة منشورات، إرفاق صور وفصول مانجا، ومناقشة النظريات مع آلاف القراء.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2.5 bg-[#FF334B] hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            تسجيل الدخول للنشر
          </Link>
        </div>
      )}

      {/* Posts Responsive Grid (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          const isLiked = !!post.isLiked;
          const count = post.likesCount || 0;

          return (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 p-5 space-y-4 shadow-sm hover:shadow-xl hover:border-[#FF334B]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3">
                {/* Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {post.user.image ? (
                      <img
                        src={post.user.image}
                        alt=""
                        className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF334B] to-rose-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {post.user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white truncate">
                        {post.user.name || "مستخدم"}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {post.user.role === "ADMIN" && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full">
                      إدارة
                    </span>
                  )}
                </div>

                {/* Post Content Snippet */}
                {post.content && (
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                )}

                {/* Attached Image Thumbnail */}
                {post.image && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 aspect-video bg-slate-100 dark:bg-zinc-800 relative">
                    <img
                      src={post.image}
                      alt="صورة المنشور"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
              </div>

              {/* Interaction Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => toggleLike(e, post.id)}
                    className={`flex items-center gap-1.5 font-bold transition-all p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 ${
                      isLiked ? "text-rose-600 font-black" : "text-slate-500 dark:text-zinc-400 hover:text-rose-600"
                    }`}
                  >
                    <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isLiked ? "fill-rose-600 text-rose-600 scale-110" : ""}`} />
                    <span>{count}</span>
                  </button>

                  <div className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-zinc-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments?.length || 0}</span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-[#FF334B] flex items-center gap-1 group-hover:underline">
                  <span>عرض النقاش</span>
                  <ArrowRight className="w-3 h-3 rotate-180" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="py-20 text-center text-slate-400 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 space-y-2 shadow-sm">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600 opacity-60" />
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">لا توجد منشورات حتى الآن</h3>
          <p className="text-xs text-slate-500">كن أول من ينشر نقاشاً أو صورة لمشاركتها مع مجتمع القراء!</p>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-850">
              <div className="flex items-center gap-3">
                {selectedPost.user.image ? (
                  <img
                    src={selectedPost.user.image}
                    alt=""
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF334B] to-rose-600 text-white font-bold flex items-center justify-center text-xs">
                    {selectedPost.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                    {selectedPost.user.name || "مستخدم"}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(selectedPost.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleLike(e, selectedPost.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedPost.isLiked
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-900/50"
                      : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${selectedPost.isLiked ? "fill-rose-600 text-rose-600" : ""}`} />
                  <span>{selectedPost.likesCount || 0}</span>
                </button>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Full Text */}
              {selectedPost.content && (
                <p className="text-sm text-slate-800 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed">
                  {selectedPost.content}
                </p>
              )}

              {/* Full Attached Image */}
              {selectedPost.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 bg-black/5 dark:bg-black/40">
                  <img
                    src={selectedPost.image}
                    alt="صورة المنشور الكاملة"
                    className="w-full max-h-[500px] object-contain mx-auto"
                  />
                </div>
              )}

              {/* Comments Section in Modal */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
                <h4 className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#FF334B]" />
                  <span>التعليقات والنقاشات ({selectedPost.comments?.length || 0})</span>
                </h4>

                {/* Add Comment Input */}
                {session ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="اكتب ردك أو رأيك حول هذا المنشور..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(selectedPost.id);
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF334B]"
                    />
                    <button
                      onClick={() => handleAddComment(selectedPost.id)}
                      disabled={commentSubmitting || !commentInput.trim()}
                      className="px-6 py-3 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 text-white text-xs font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                      {commentSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>إرسال</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl text-center text-xs text-slate-500">
                    يرجى{" "}
                    <Link href="/auth/login" className="font-bold text-[#FF334B] underline">
                      تسجيل الدخول
                    </Link>{" "}
                    للمشاركة في هذا النقاش.
                  </div>
                )}

                {/* Comments Stream */}
                <div className="space-y-3">
                  {selectedPost.comments?.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-zinc-100">
                          {c.user?.name || "مستخدم"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString("ar-EG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))}

                  {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                    <p className="text-xs text-slate-400 text-center py-4">
                      لا توجد تعليقات بعد على هذا المنشور. كن أول من يعلق!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
