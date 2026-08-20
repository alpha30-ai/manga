"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Heart, Terminal, Code2, Sparkles, Cpu, Layers } from "lucide-react";

interface DeveloperSignatureProps {
  siteName?: string;
}

export default function DeveloperSignature({ siteName = "ألفا مانجا" }: DeveloperSignatureProps) {
  const currentYear = new Date().getFullYear();

  const techStack = [
    { label: "HTML5", bg: "bg-[#E34F26]/10", border: "border-[#E34F26]/30", text: "text-[#E34F26]" },
    { label: "CSS3", bg: "bg-[#1572B6]/10", border: "border-[#1572B6]/30", text: "text-[#1572B6]" },
    { label: "JAVASCRIPT", bg: "bg-[#F7DF1E]/10", border: "border-[#F7DF1E]/30", text: "text-[#F7DF1E]" },
    { label: "TYPESCRIPT", bg: "bg-[#3178C6]/10", border: "border-[#3178C6]/30", text: "text-[#3178C6]" },
    { label: "PYTHON", bg: "bg-[#3776AB]/10", border: "border-[#3776AB]/30", text: "text-[#3776AB]" },
    { label: "NEXT.JS 16", bg: "bg-white/10", border: "border-white/20", text: "text-white" },
    { label: "REACT 19", bg: "bg-[#61DAFB]/10", border: "border-[#61DAFB]/30", text: "text-[#61DAFB]" },
    { label: "POSTGRESQL", bg: "bg-[#4169E1]/10", border: "border-[#4169E1]/30", text: "text-[#4169E1]" },
    { label: "PRISMA ORM", bg: "bg-[#2D3748]/60", border: "border-emerald-500/30", text: "text-emerald-400" },
    { label: "TAILWIND CSS", bg: "bg-[#06B6D4]/10", border: "border-[#06B6D4]/30", text: "text-[#06B6D4]" },
  ];

  return (
    <div className="w-full" dir="rtl">
      <div className="relative group w-full">
        {/* Ambient Neon Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF334B]/25 via-purple-600/20 to-[#FF334B]/25 rounded-2xl sm:rounded-3xl blur-md opacity-50 group-hover:opacity-100 group-hover:blur-lg transition-all duration-700" />

        {/* Main Cybernetic Box */}
        <div className="relative w-full bg-[#08080a] border border-red-950/70 group-hover:border-[#FF334B]/60 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl transition-all duration-300 space-y-5">
          
          {/* TOP SECTION: Developer Identity Card (الجزء العلوي) */}
          <div className="flex items-center justify-center">
            <Link
              href="https://workspace-mh.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group/dev inline-flex items-center justify-between gap-4 sm:gap-6 px-6 sm:px-8 py-3 rounded-2xl bg-black/85 border border-red-900/60 hover:border-[#FF334B] hover:bg-black/95 shadow-xl transition-all duration-300 transform hover:scale-[1.02] w-full sm:w-auto min-w-[300px]"
              title="زيارة مساحة عمل المطور محمد حشيش"
              dir="ltr"
            >
              {/* Left decorative laser line */}
              <div className="hidden sm:block h-8 w-[2px] bg-gradient-to-b from-transparent via-[#FF334B] to-transparent shrink-0" />

              {/* Developer Info */}
              <div className="flex flex-col items-center justify-center text-center flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Terminal className="w-3.5 h-3.5 text-[#FF334B]" />
                  <span className="text-[9px] font-black tracking-[0.3em] text-red-400 uppercase font-mono">
                    LEAD ARCHITECT & CREATOR
                  </span>
                </div>

                <span className="text-base sm:text-lg font-black text-white tracking-widest uppercase font-mono drop-shadow-[0_0_12px_rgba(255,51,75,0.75)] group-hover/dev:text-red-100 transition-colors">
                  MOHAMED HASHISH
                </span>

                <div className="mt-1 px-3.5 py-0.5 bg-gradient-to-r from-[#FF334B] to-rose-600 rounded-full shadow-xs">
                  <span className="text-[8.5px] font-black tracking-wider text-white uppercase font-mono">
                    FULL STACK SOFTWARE ENGINEER
                  </span>
                </div>
              </div>

              {/* Right decorative laser line & External Icon */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:block h-8 w-[2px] bg-gradient-to-b from-transparent via-[#FF334B] to-transparent" />
                <div className="w-7 h-7 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-[#FF334B] group-hover/dev:bg-[#FF334B] group-hover/dev:text-white transition-all shadow-md">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>

          {/* MIDDLE SECTION: Tech Stack Badges (الجزء الأوسط - الأكواد والتقنيات) */}
          <div className="pt-2 border-t border-red-950/60 flex flex-col items-center justify-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 font-mono tracking-wider">
              <Code2 className="w-3.5 h-3.5 text-[#FF334B]" />
              <span>CORE TECHNOLOGIES & SYSTEM ARCHITECTURE</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-3xl" dir="ltr">
              {techStack.map((tech) => (
                <span
                  key={tech.label}
                  className={`px-2.5 py-1 rounded-xl ${tech.bg} ${tech.border} ${tech.text} font-black text-[9.5px] border font-mono tracking-tight shadow-xs hover:scale-105 transition-transform`}
                >
                  {tech.label}
                </span>
              ))}
            </div>
          </div>

          {/* BOTTOM SECTION: Pride Note & Copyright (الجزء السفلي - بكل فخر وجميع الحقوق محفوظة) */}
          <div className="pt-3 border-t border-red-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
            {/* Live System Status */}
            <div className="flex items-center gap-2" dir="ltr">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/90 border border-red-900/50 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#FF334B] animate-pulse" />
                <span className="text-[9.5px] font-black tracking-widest text-[#FF334B] font-mono">
                  PROD v1.0.0
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400/90 font-mono">
                ONLINE & SECURE
              </span>
            </div>

            {/* Pride Note */}
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-zinc-300">
              <span>صنع بكل فخر وإتقان</span>
              <Heart className="w-3.5 h-3.5 text-[#FF334B] fill-[#FF334B] animate-pulse" />
              <span>بواسطة</span>
              <span className="text-[#FF334B] font-black">محمد حشيش</span>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
              <span>© {currentYear}</span>
              <span className="text-zinc-200 font-bold">{siteName}</span>
              <span className="text-zinc-600">•</span>
              <span>جميع الحقوق محفوظة</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
