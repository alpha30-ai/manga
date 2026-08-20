import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import Logo from "@/components/layout/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:py-16 overflow-hidden bg-slate-50 dark:bg-zinc-950 transition-colors"
      dir="rtl"
    >
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF334B]/15 dark:bg-[#FF334B]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-600/10 dark:bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Return to Home Floating Button */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 backdrop-blur-md text-xs font-bold transition-all shadow-sm group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span>الرئيسية</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Official Brand Logo Header */}
        <div className="text-center flex justify-center">
          <Link href="/" className="inline-flex items-center group">
            <Logo size={50} showText={true} />
          </Link>
        </div>

        {/* Auth Glassmorphism Card */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/60 border border-slate-200/90 dark:border-zinc-800/90 p-6 sm:p-8">
          {children}
        </div>

        {/* Security & Copyright Footer */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-500">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>اتصال مشفر وآمن بالكامل 256-bit SSL</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-600">
            © {new Date().getFullYear()} ألفا مانجا. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}
