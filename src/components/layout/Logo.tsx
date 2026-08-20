import React from "react";

export default function Logo({
  size = 38,
  showText = false,
  className = "",
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 group ${className}`} dir="rtl">
      {/* "AM" Geometric Flat Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      >
        {/* Stealth Dark Rounded Container */}
        <rect width="100" height="100" rx="24" fill="#09090B" />
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="23"
          stroke="#27272A"
          strokeWidth="2"
        />

        {/* Dynamic Manga Speed Line Accent */}
        <path
          d="M16 82L28 18H36L24 82H16Z"
          fill="#FF334B"
          fillOpacity="0.15"
        />

        {/* Sharp Geometric "AM" Monogram with G-Pen Nib Apex */}
        {/* Letter A & Alpha Stem (Left & Apex with G-Pen Slit) */}
        <path
          d="M32 76L49 22C49.5 20.5 51.5 20.5 52 22L61 50H50L44 68H36L48 34L37 76H32Z"
          fill="#FFFFFF"
        />

        {/* Sharp Crimson G-Pen Core & Alpha Crossbar */}
        <path
          d="M48.5 21L50.5 15L52.5 21L50.5 35L48.5 21Z"
          fill="#FF334B"
        />

        {/* Geometric "M" Interlocking Wing with Sharp Angles */}
        <path
          d="M50 50L60 22C60.5 20.5 62.5 20.5 63 22L70 42L77 22C77.5 20.5 79.5 20.5 80 22L86 76H78L74 38L67 58H63L57 38L53 50H50Z"
          fill="#FF334B"
        />

        {/* Bottom Stabilizer Line */}
        <rect x="30" y="78" width="56" height="3.5" rx="1.75" fill="#FFFFFF" fillOpacity="0.9" />
      </svg>

      {showText && (
        <div className="flex flex-col text-right select-none">
          <div className="flex items-center gap-1">
            <span className="font-black text-lg sm:text-xl tracking-tighter text-zinc-900 dark:text-white">
              ALPHA
            </span>
            <span className="font-black text-lg sm:text-xl tracking-tighter text-[#FF334B]">
              MANGA
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold -mt-1 tracking-wider">
            ألفا مانجا • المنصة الاحترافية
          </span>
        </div>
      )}
    </div>
  );
}
