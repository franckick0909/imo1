"use client";

import { Link } from "next-view-transitions";

interface InstagramButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark";
}

export default function InstagramButton({
  href,
  children,
  className = "",
  variant = "light",
}: InstagramButtonProps) {
  const isDark = variant === "dark";

  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-between rounded-full transition-all duration-300 hover:shadow-lg  w-full overflow-hidden min-w-2xs shadow-sm ${
        isDark
          ? "bg-white/90 hover:bg-zinc-50 text-gray-800"
          : "bg-white hover:bg-zinc-50 text-gray-800 shadow-sm"
      } ${className}`}
      style={{
        padding: "6px 10px 6px 20px",
      }}
    >
      {/* Texte centré avec soulignement */}
      <div className="flex-1 flex justify-center">
        <span className="text-sm sm:text-base font-normal uppercase tracking-tighter relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-1 after:h-[1px] after:bg-gray-900 after:transform after:scale-x-100 after:origin-bottom-left hover:after:scale-x-0 after:transition-transform after:duration-300 after:ease-out hover:after:origin-bottom-right">
          {children}
        </span>
      </div>

      {/* Cercle avec icône Instagram - responsive */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-zinc-700 flex items-center justify-center ml-3 sm:ml-4 overflow-hidden transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-zinc-800/50 group-hover:scale-105">
        {/* Background hover - effet de pulse */}
        <div className="absolute inset-0 bg-zinc-700 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>

        {/* Icône Instagram principale */}
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white z-10 absolute transform transition-all duration-400 ease-out group-hover:scale-110"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </div>
    </Link>
  );
}
