"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, Mail, ArrowRight, KeyRound, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل إرسال كود الاستعادة");
      toast.success(data.message || "تم إرسال كود التحقق بنجاح إلى بريدك الإلكتروني!");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("يجب أن تتكون كلمة المرور الجديدة من 6 خانات على الأقل");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل تغيير كلمة المرور");
      toast.success("تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {step === "email" ? (
        <>
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              استعادة كلمة المرور
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              أدخل بريدك الإلكتروني المسجل لنرسل لك رمز أمان مكوّن من 6 أرقام
            </p>
          </div>

          {/* Form Step 1 */}
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 shadow-xl shadow-rose-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>إرسال رمز التحقق</span>
            </button>
          </form>
        </>
      ) : (
        <>
          {/* Header Step 2 */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              تعيين كلمة المرور الجديدة
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              تم إرسال كود التحقق إلى <span className="font-bold text-[#FF334B]" dir="ltr">{email}</span>
            </p>
          </div>

          {/* Form Step 2 */}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 text-center">
                رمز التحقق (6 أرقام)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                className="block w-full text-center tracking-[0.4em] sm:tracking-[0.5em] text-2xl sm:text-3xl font-black py-3.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 rounded-2xl text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF334B] transition-all shadow-inner font-mono"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-11 py-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF334B] transition-all shadow-inner"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 shadow-xl shadow-rose-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>تحديث كلمة المرور</span>
            </button>
          </form>
        </>
      )}

      {/* Return to Login */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-center">
        <Link
          href="/auth/login"
          className="text-xs font-bold text-slate-500 hover:text-[#FF334B] dark:text-zinc-400 dark:hover:text-rose-400 transition-colors inline-flex items-center gap-1"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة لتسجيل الدخول</span>
        </Link>
      </div>
    </div>
  );
}
