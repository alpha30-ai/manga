import React from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, Clock, Sparkles, ArrowRight } from "lucide-react";
import Logo from "@/components/layout/Logo";

export default function MaintenanceView({
  message = "الموقع تحت أعمال الصيانة والتطوير الدوري لتحديث الفصول وتحسين الأداء. سنعود للعمل بكامل طاقتنا قريباً.",
  siteName = "ألفا مانجا",
}: {
  message?: string;
  siteName?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/20 to-zinc-950" />
      <div className="absolute inset-0 site-grid-bg opacity-40" />

      <div className="relative z-10 max-w-lg w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Wrench className="w-10 h-10 text-white animate-bounce" />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 text-zinc-950 rounded-full">
              <Clock className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>وضع الصيانة والتحديث الفني</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            نعمل على تحسين {siteName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>حالة النظام:</span>
            <span className="text-amber-400 font-bold">تحديث قواعد البيانات وقارئ الفصول</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-amber-500 h-full w-3/4 animate-pulse" />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>تسجيل دخول الإدارة</span>
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-8 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} {siteName}. شكراً لتفهمكم وصبركم.
      </div>
    </div>
  );
}
