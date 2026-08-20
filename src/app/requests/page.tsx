"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Inbox,
  Plus,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  BookOpen,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export default function RequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "MANGA_REQUEST",
    details: "",
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchRequests();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("يرجى تسجيل الدخول أولاً لتقديم طلب");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "تم إرسال طلبك بنجاح!");
        setFormData({ title: "", type: "MANGA_REQUEST", details: "" });
        fetchRequests();
      } else {
        toast.error(data.message || "فشل إرسال الطلب");
      }
    } catch (e) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-900/50">
            <Sparkles className="w-3.5 h-3.5" /> تمت الموافقة وجاري العمل
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 className="w-3.5 h-3.5" /> تم التنفيذ بنجاح ✓
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1 border border-rose-200 dark:border-rose-900/50">
            <XCircle className="w-3.5 h-3.5" /> اعتذار / غير متوفر
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-200 dark:border-amber-900/50">
            <Clock className="w-3.5 h-3.5" /> قيد المراجعة والتدقيق
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-16 space-y-10" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF334B]/10 text-[#FF334B] border border-[#FF334B]/20 text-xs font-bold">
          <Inbox className="w-4 h-4" />
          <span>مركز طلبات ومقترحات القراء</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
          طلب إضافة مانجا أو الإبلاغ عن فصل تالف
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          هل تبحث عن عمل غير متوفر؟ أو واجهت فصلاً يحتوي على صفحات ناقصة؟ أرسل طلبك هنا وسيقوم فريق الإدارة بمراجعته وتوفيره بأسرع وقت.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 p-6 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <Plus className="w-5 h-5 text-[#FF334B]" />
              <span>تقديم طلب أو بلاغ جديد</span>
            </h2>

            {session ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    نوع الطلب
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none"
                  >
                    <option value="MANGA_REQUEST">طلب إضافة مانجا / مانهوا جديدة</option>
                    <option value="BROKEN_CHAPTER">الإبلاغ عن فصل تالف أو صفحات غير ظاهرة</option>
                    <option value="SUGGESTION">اقتراح تحسين أو تطوير للموقع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    عنوان العمل أو البلاغ
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: Solo Leveling الفصل 45 أو اسم المانجا"
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF334B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    تفاصيل إضافية أو روابط (اختياري)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="اكتب أي معلومات إضافية مثل رقم الفصل التالف أو رابط المصدر..."
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF334B] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>إرسال الطلب للإدارة</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  يرجى تسجيل الدخول لتتمكن من تقديم الطلبات ومتابعة حالتها فورياً.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block px-5 py-2.5 bg-[#FF334B] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Requests List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>طلباتك السابقة وحالتها</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
              ({requests.length} طلبات مسجلة)
            </span>
          </h2>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF334B]" />
              <p className="text-xs mt-2">جاري جلب قائمة طلباتك...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 text-center space-y-2 shadow-sm">
              <Inbox className="w-10 h-10 mx-auto text-slate-400 opacity-40" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">لا توجد طلبات سابقة</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                استخدم النموذج الجانبي لطلب أي عمل ترغب في توفيره على الموقع.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                      {r.title}
                    </h3>
                    <div>{getStatusBadge(r.status)}</div>
                  </div>

                  {r.details && (
                    <p className="text-xs text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl leading-relaxed border border-slate-200/60 dark:border-zinc-750">
                      {r.details}
                    </p>
                  )}

                  {r.adminNote && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs text-[#FF334B] dark:text-rose-300">
                      <strong>رد الإدارة:</strong> {r.adminNote}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <span>
                      النوع:{" "}
                      {r.type === "MANGA_REQUEST"
                        ? "طلب مانجا جديدة"
                        : r.type === "BROKEN_CHAPTER"
                        ? "إبلاغ عن فصل"
                        : "اقتراح عام"}
                    </span>
                    <span>{new Date(r.createdAt).toLocaleDateString("ar-EG")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
