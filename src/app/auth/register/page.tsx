"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff, UserPlus, Sparkles, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error("يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "حدث خطأ أثناء إنشاء الحساب");
      toast.success(data.message || "تم إنشاء الحساب بنجاح! تم إرسال كود التفعيل.");
      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] border border-rose-200 dark:border-rose-900/50 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>انضم إلينا الآن</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          إنشاء حساب جديد
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
          استمتع بحفظ تقدمك في القراءة، إنشاء قائمتك المفضلة، والمشاركة في المجتمع
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            الاسم المستعار
          </label>
          <div className="relative">
            <UserIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              required
              placeholder="مثال: يوجي أوتاكو"
              className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF334B] transition-all shadow-inner"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="email"
              required
              placeholder="example@mail.com"
              dir="ltr"
              className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF334B] transition-all text-left shadow-inner"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            كلمة المرور
          </label>
          <div className="relative">
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="•••••••• (6 أحرف أو أرقام على الأقل)"
              className="w-full pr-10 pl-11 py-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF334B] transition-all shadow-inner"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formData.password.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <CheckCircle2 className={`w-3.5 h-3.5 ${formData.password.length >= 6 ? "text-emerald-500" : "text-slate-400"}`} />
              <span className={formData.password.length >= 6 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                {formData.password.length >= 6 ? "كلمة المرور مطابقة للشروط" : "يجب أن تكون 6 خانات على الأقل"}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 shadow-xl shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>إنشاء الحساب الآن</span>
          </button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-center text-xs">
        <span className="text-slate-500 dark:text-zinc-400">لديك حساب بالفعل؟ </span>
        <Link
          href="/auth/login"
          className="font-black text-[#FF334B] hover:text-rose-600 dark:text-rose-400 transition-colors"
        >
          تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
