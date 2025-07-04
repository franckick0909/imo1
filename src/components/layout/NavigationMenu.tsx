"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Portal from "../Portal";

// Liens de navigation commerce
const navigationLinks = [
  { href: "/products", label: "Tous les produits" },
  { href: "/products?category=hydratation", label: "Hydratation" },
  { href: "/products?category=anti-age", label: "Anti-âge" },
  { href: "/products?category=purification", label: "Purification" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const staggerMenuItems = {
  open: {
    transition: { staggerChildren: 0.09, delayChildren: 0.3 },
  },
  closed: {
    transition: { staggerChildren: 0.09, staggerDirection: -1 },
  },
};

const linkVariants = {
  initial: {
    y: "30vh",
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
  open: {
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.87, 0, 0.13, 1] as [number, number, number, number],
    },
  },
  exit: {
    y: "30vh",
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
};

const containerVariants = {
  hidden: {
    x: "-100%",
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      when: "afterChildren" as const,
    },
  },
  visible: {
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      when: "beforeChildren" as const,
      delayChildren: 0.2,
    },
  },
};

interface NavigationMenuProps {
  isHeaderWhite?: boolean;
}

export default function NavigationMenu({
  isHeaderWhite = false,
}: NavigationMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Fermer le menu avec la touche Escape et gérer le scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      // Empêcher le scroll du body quand le menu est ouvert
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Bouton Menu - version normale (quand menu fermé) */}
      {!isMenuOpen && (
        <motion.button
          type="button"
          aria-label="Menu navigation"
          className="relative focus:outline-none cursor-pointer hidden sm:block"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-14 sm:w-16 md:w-20 lg:w-24 h-7 sm:h-8 md:h-9 lg:h-10 flex flex-col justify-center items-center overflow-hidden">
            <motion.div
              className="flex flex-col"
              animate={{ y: "25%" }}
              transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] as const }}
            >
                              <span
                  className="h-7 sm:h-8 md:h-9 lg:h-10 w-14 sm:w-16 md:w-20 lg:w-24 flex items-center justify-center font-normal rounded-full text-xs sm:text-sm md:text-base transition-all duration-300  text-black bg-zinc-100 hover:bg-zinc-200"
                >
                  Menu
                </span>
                <span
                  className={`h-7 sm:h-8 md:h-9 lg:h-10 w-14 sm:w-16 md:w-20 lg:w-24 flex items-center justify-center font-medium rounded-full text-xs sm:text-sm md:text-base ${
                    isHeaderWhite ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  Fermer
                </span>
            </motion.div>
          </div>
        </motion.button>
      )}

      {/* Version mobile - Hamburger animé */}
      <button
        type="button"
        aria-label={isMenuOpen ? "Fermer menu" : "Ouvrir menu"}
        className="block sm:hidden relative focus:outline-none cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 flex flex-col justify-center items-center space-y-1">
          <motion.span
            className={`block h-0.5 w-6 sm:w-7 md:w-8 rounded-full transition-colors duration-300 ${
              isHeaderWhite ? "bg-gray-900" : "bg-white"
            }`}
            animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
          <motion.span
            className={`block h-0.5 w-6 sm:w-7 md:w-8 rounded-full transition-colors duration-300 ${
              isHeaderWhite ? "bg-gray-900" : "bg-white"
            }`}
            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
          <motion.span
            className={`block h-0.5 w-6 sm:w-7 md:w-8 rounded-full transition-colors duration-300 ${
              isHeaderWhite ? "bg-gray-900" : "bg-white"
            }`}
            animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </button>

      {/* Menu Navigation avec Portal pour l'overlay */}
      <Portal>
        <AnimatePresence mode="wait">
          {isMenuOpen && (
            <>
              {/* Overlay pour fermer en cliquant à l'extérieur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/30 z-[9998]"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Menu principal */}
              <motion.div
                className="fixed left-0 top-0 bg-white flex flex-col overflow-hidden border-r border-gray-100 shadow-xl rounded-br-2xl"
                style={{
                  zIndex: 9999,
                  width: "min(320px, 90vw)",
                }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* Header avec bouton fermer */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-full transition-all text-gray-700 cursor-pointer hover:rotate-180 duration-300"
                    aria-label="Fermer le menu"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Contenu principal */}
                <div className="p-4 sm:p-5">
                  {/* Navigation */}
                  <motion.nav
                    className="flex flex-col space-y-3 sm:space-y-4 items-start"
                    variants={staggerMenuItems}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    {navigationLinks.map((link) => (
                      <div key={link.href} className="overflow-hidden relative">
                        <motion.div
                          variants={linkVariants}
                          initial="initial"
                          animate="open"
                          exit="initial"
                          className="relative"
                        >
                          <Link
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg sm:text-xl text-zinc-700 hover:text-zinc-900 transition-colors inline-block relative group font-light"
                          >
                            {link.label}
                            <motion.span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform origin-left transition-all duration-300 scale-x-0 group-hover:scale-x-100" />
                          </Link>
                        </motion.div>
                      </div>
                    ))}
                  </motion.nav>

                  {/* Section promotionnelle */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-gray-800 text-sm font-medium mb-2">
                      ✨ Nouveauté
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 font-light">
                      Découvrez notre nouvelle gamme de crèmes anti-âge !
                    </p>
                    <Link
                      href="/products?category=anti-age"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-sm text-gray-800 hover:text-gray-900 underline font-medium"
                    >
                      Voir la collection →
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
