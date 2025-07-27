"use client";

import { Link } from "next-view-transitions";

interface CircleButtonProps {
  href: string;
  direction?: "left" | "right";
  className?: string;
  variant?: "light" | "dark";
  size?: "small" | "medium" | "large";
}

export function CircleButton({
  href,
  direction = "right",
  className = "",
  variant = "dark",
  size = "medium",
}: CircleButtonProps) {
  const isDark = variant === "dark";
  const isLeft = direction === "left";

  // Définir les tailles selon la prop size avec responsive
  const sizeClasses = {
    small: {
      container: "w-10 h-10 sm:w-12 sm:h-12",
      inner: "w-8 h-8 sm:w-10 sm:h-10",
      icon: "w-3 h-3 sm:w-4 sm:h-4",
    },
    medium: {
      container: "w-12 h-12 sm:w-14 sm:h-14 lg:w-18 lg:h-18",
      inner: "w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16",
      icon: "w-5 h-5 sm:w-6 sm:h-6",
    },
    large: {
      container: "w-14 h-14 sm:w-18 sm:h-18 lg:w-24 lg:h-24",
      inner: "w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20",
      icon: "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-center rounded-full transition-all duration-300 hover:shadow-lg overflow-hidden w- ${currentSize.container} ${className}`}
    >
      <div
        className={`relative ${currentSize.inner} rounded-full ${
          isDark ? "bg-zinc-700" : "bg-white"
        } flex items-center justify-center overflow-hidden transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-105`}
      >
        {/* Background hover - effet de pulse */}
        <div
          className={`absolute inset-0 ${
            isDark ? "bg-zinc-700" : "bg-white"
          } rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out`}
        ></div>

        {/* Flèche principale - sort vers la direction */}
        <svg
          className={`${currentSize.icon} text-white z-10 absolute transform transition-all duration-400 ease-out ${
            isLeft
              ? "group-hover:-translate-x-5 group-hover:opacity-0"
              : "group-hover:translate-x-5 group-hover:opacity-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            transform: isLeft ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>

        {/* Flèche qui arrive de l'autre côté */}
        <svg
          className={`${currentSize.icon} text-white z-10 absolute transform opacity-0 transition-all duration-300 ease-out ${
            isLeft
              ? "-translate-x-full group-hover:translate-x-0 group-hover:opacity-100"
              : "-translate-x-full group-hover:translate-x-0 group-hover:opacity-100"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            transform: isLeft ? "rotate(180deg)" : "rotate(0deg)",
          }}
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
        padding: "6px 10px 6px 20px",
      }}
    >
      {/* Texte centré avec soulignement */}
      <div className="flex-1 flex justify-center">
        <span className="text-sm sm:text-base font-normal uppercase tracking-tighter relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-1 after:h-[1px] after:bg-gray-900 after:transform after:scale-x-100 after:origin-bottom-left hover:after:scale-x-0 after:transition-transform after:duration-300 after:ease-out hover:after:origin-bottom-right">
          {children}
        </span>
      </div>

      {/* Cercle avec flèches - responsive */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-zinc-700 flex items-center justify-center ml-3 sm:ml-4 overflow-hidden transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-zinc-800/50 group-hover:scale-105">
        {/* Background hover - effet de pulse */}
        <div className="absolute inset-0 bg-zinc-700 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>

        {/* Flèche principale - sort vers la droite */}
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white z-10 absolute transform transition-all duration-400 ease-out group-hover:translate-x-5 group-hover:opacity-0"
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
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white z-10 absolute transform -translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out "
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
