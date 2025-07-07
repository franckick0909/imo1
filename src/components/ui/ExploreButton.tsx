"use client";

import { Link } from "next-view-transitions";

interface ExploreButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark";
}

export default function ExploreButton({
  href,
  children,
  className = "",
  variant = "light",
}: ExploreButtonProps) {
  const isDark = variant === "dark";

  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-between rounded-full transition-all duration-300 hover:shadow-lg max-w-[58rem] w-full overflow-hidden min-w-2xs ${
        isDark
          ? "bg-white/90 hover:bg-zinc-100 text-gray-800"
          : "bg-white hover:bg-zinc-50 text-gray-800 shadow-sm"
      } ${className}`}
      style={{
        padding: "9px 14px 9px 32px",
      }}
    >
      {/* Texte centré avec soulignement */}
      <div className="flex-1 flex justify-center">
        <span className="text-base font-normal uppercase tracking-tighter relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-1 after:h-[1px] after:bg-gray-900 after:transform after:scale-x-100 after:origin-bottom-left hover:after:scale-x-0 after:transition-transform after:duration-300 after:ease-out hover:after:origin-bottom-right">
          {children}
        </span>
      </div>

      {/* Cercle avec flèches - plus gros */}
      <div className="relative w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center ml-4 overflow-hidden transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-zinc-800/50 group-hover:scale-105">
        {/* Background hover - effet de pulse */}
        <div className="absolute inset-0 bg-zinc-700 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>

        {/* Flèche principale - sort vers la droite */}
        <svg
          className="w-6 h-6 text-white z-10 absolute transform transition-all duration-400 ease-out group-hover:translate-x-5 group-hover:opacity-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>

        {/* Flèche qui arrive de la gauche */}
        <svg
          className="w-6 h-6 text-white z-10 absolute transform -translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </div>
    </Link>
  );
}
