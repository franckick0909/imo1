"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Portal from "./Portal";

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
    height: 10,
    width: 30,
    transition: {
      duration: 1,
      ease: [0.87, 0, 0.13, 1] as [number, number, number, number],
      when: "afterChildren" as const,
    },
  },
  visible: {
    maxWidth: "94vw",
    width: 400,
    height: "60vh",
    maxHeight: "60vh",
    transition: {
      duration: 0.8,
      ease: [0.87, 0, 0.13, 1] as [number, number, number, number],
      when: "beforeChildren" as const,
      delayChildren: 0.3,
    },
  },
};

export default function NavigationMenu() {
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
          className="relative focus:outline-none cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-16 sm:w-20 md:w-24 h-8 sm:h-9 md:h-10 flex flex-col justify-center items-center overflow-hidden">
            <motion.div
              className="flex flex-col"
              animate={{ y: "25%" }}
              transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] as const }}
            >
              <span className="h-8 sm:h-9 md:h-10 w-16 sm:w-20 md:w-24 flex items-center justify-center text-black font-medium rounded-full bg-zinc-100 text-xs sm:text-sm md:text-base hover:bg-zinc-200 transition-colors duration-300">
                Menu
              </span>
              <span className="h-8 sm:h-9 md:h-10 w-16 sm:w-20 md:w-24 flex items-center justify-center font-medium rounded-full bg-black text-white text-xs sm:text-sm">
                Fermer
              </span>
            </motion.div>
          </div>
        </motion.button>
      )}

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
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Bouton Fermer - dans le Portal avec z-index élevé, même position que le bouton Menu */}
              <motion.button
                type="button"
                aria-label="Fermer menu"
                className="fixed top-2 sm:top-3 md:top-4 left-3 sm:left-4 md:left-6 focus:outline-none cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
                style={{ zIndex: 60 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 sm:w-20 md:w-24 h-8 sm:h-9 md:h-10 flex flex-col justify-center items-center overflow-hidden">
                  <span className="h-8 sm:h-9 md:h-10 w-16 sm:w-20 md:w-24 flex items-center justify-center font-medium rounded-full bg-black text-white text-xs sm:text-sm hover:bg-gray-800 transition-colors duration-300">
                    Fermer
                  </span>
                </div>
              </motion.button>

              {/* Menu principal */}
              <motion.div
                className="fixed top-2 sm:top-3 md:top-4 left-3 sm:left-4 md:left-6 bg-white z-45 flex flex-col rounded-2xl sm:rounded-3xl min-w-20 sm:min-w-24 min-h-8 sm:min-h-10 overflow-hidden border border-emerald-300"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ zIndex: 45 }}
              >
                <div className="flex flex-col h-full justify-center p-4 sm:p-6 md:p-8">
                  <div className="mb-4 sm:mb-5 md:mb-6 border-b border-gray-200 pb-3 sm:pb-4">
                    <h2 className="text-gray-700 text-xs sm:text-sm uppercase font-bold tracking-wider pt-8">
                      Navigation
                    </h2>
                  </div>

                  {/* Navigation */}
                  <motion.nav
                    className="flex flex-col space-y-2 sm:space-y-3 md:space-y-4 items-start"
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
                            className="text-base sm:text-lg md:text-xl text-zinc-700 hover:text-zinc-900 transition-colors inline-block relative group font-light"
                          >
                            {link.label}
                            <motion.span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-900 transform origin-left transition-all duration-300 scale-x-0 group-hover:scale-x-100" />
                          </Link>
                        </motion.div>
                      </div>
                    ))}
                  </motion.nav>

                  {/* Section promotionnelle */}
                  <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 bg-emerald-50 rounded-lg border border-emerald-300">
                    <h3 className="text-emerald-800 text-xs sm:text-sm mb-2">
                      ✨ Nouveauté
                    </h3>
                    <p className="text-emerald-700 text-xs mb-2 sm:mb-3">
                      Découvrez notre nouvelle gamme de crèmes anti-âge !
                    </p>
                    <Link
                      href="/products?category=anti-age"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-xs text-emerald-800 hover:text-emerald-900 underline"
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
