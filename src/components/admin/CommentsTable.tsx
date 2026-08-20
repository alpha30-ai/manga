"use client";

import React, { useState } from "react";
import { MessageSquare, Trash2, Search, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string | Date;
  user: {
    name: string | null;
    email?: string | null;
  };
}

interface CommentsTableProps {
  comments: CommentItem[];
}

export default function CommentsTable({ comments: initialComments }: CommentsTableProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredComments = comments.filter(
    (c) =>
      c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
        toast.success("تم حذف التعليق بنجاح");
      } else {
        toast.error("فشل حذف التعليق");
      }
    } catch (e) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-[#FF334B]" />
            <span>مراقبة وإدارة التعليقات</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            مراجعة تعليقات القراء وحذف التعليقات غير اللائقة ({comments.length})
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في محتوى التعليقات..."
            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF334B] outline-none shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400 font-bold">
              <tr>
                <th className="p-4 sm:p-5">صاحب التعليق</th>
                <th className="p-4 sm:p-5">نص التعليق</th>
                <th className="p-4 sm:p-5">التاريخ</th>
                <th className="p-4 sm:p-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredComments.map((comment) => (
                <tr key={comment.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-zinc-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] font-bold flex items-center justify-center text-xs">
                        {comment.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span>{comment.user?.name || "مستخدم"}</span>
                    </div>
                  </td>

                  <td className="p-4 sm:p-5 text-slate-700 dark:text-zinc-300 max-w-md">
                    <p className="line-clamp-2 leading-relaxed">{comment.content}</p>
                  </td>

                  <td className="p-4 sm:p-5 text-slate-400 dark:text-zinc-400 text-xs">
                    {new Date(comment.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="p-4 sm:p-5 text-left">
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                      title="حذف التعليق"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredComments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    لا توجد تعليقات مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
