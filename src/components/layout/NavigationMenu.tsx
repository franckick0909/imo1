"use client";

import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Portal from "../Portal";

// Enregistrer les plugins GSAP
gsap.registerPlugin(useGSAP);

// Liens de navigation commerce
const navigationLinks = [
  { href: "/products", label: "Tous les produits" },
  { href: "/products?category=hydratation", label: "Hydratation" },
  { href: "/products?category=anti-age", label: "Anti-âge" },
  { href: "/products?category=purification", label: "Purification" },
  { href: "/products?category=soins-corps", label: "Soins corps" },
  { href: "/products?category=soins-mains", label: "Soins mains" },
  { href: "/products?category=protection-soleil", label: "Protection solaire" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

interface NavigationMenuProps {
  isHeaderWhite?: boolean;
}

export default function NavigationMenu({
  isHeaderWhite = false,
}: NavigationMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Refs pour les animations GSAP (bouton seulement)
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerLinesRef = useRef<HTMLSpanElement[]>([]);
  const buttonTextRef = useRef<HTMLDivElement>(null);

  // Animations GSAP pour le bouton seulement
  useGSAP(() => {
    // Animation du bouton hover
    if (menuButtonRef.current) {
      gsap.set(menuButtonRef.current, { scale: 1 });
    }

    // Animation du texte du bouton - position de roulement
    if (buttonTextRef.current) {
      gsap.set(buttonTextRef.current, { y: "25%" });
    }

    // Configuration des hamburger lines
    hamburgerLinesRef.current.forEach((line) => {
      if (line) {
        gsap.set(line, {
          rotation: 0,
          y: 0,
          opacity: 1,
        });
      }
    });
  }, []);

  // Animation du bouton avec GSAP
  useEffect(() => {
    if (buttonTextRef.current) {
      gsap.to(buttonTextRef.current, {
        y: isMenuOpen ? "-75%" : "25%",
        duration: 0.3,
        ease: "power2.inOut",
      });
    }

    // Animation des hamburger lines
    hamburgerLinesRef.current.forEach((line, index) => {
      if (line) {
        if (isMenuOpen) {
          if (index === 0) {
            gsap.to(line, { rotation: 45, y: 6, duration: 0.3 });
          } else if (index === 1) {
            gsap.to(line, { opacity: 0, duration: 0.3 });
          } else if (index === 2) {
            gsap.to(line, { rotation: -45, y: -6, duration: 0.3 });
          }
        } else {
          gsap.to(line, { rotation: 0, y: 0, opacity: 1, duration: 0.3 });
        }
      }
    });
  }, [isMenuOpen]);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Gestion du scroll et escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape, { passive: true });
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.documentElement.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Animation hover du bouton
  const handleButtonHover = (isHovering: boolean) => {
    if (menuButtonRef.current) {
      gsap.to(menuButtonRef.current, {
        scale: isHovering ? 1.05 : 1,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  const handleButtonTap = () => {
    if (menuButtonRef.current) {
      gsap.to(menuButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      });
    }
  };

  return (
    <>
      {/* Bouton Menu - version desktop */}
      <button
        ref={menuButtonRef}
        type="button"
        aria-label="Menu navigation"
        className="relative focus:outline-none cursor-pointer hidden sm:block z-[300]"
        onClick={() => {
          handleButtonTap();
          handleMenuToggle();
        }}
        onMouseEnter={() => handleButtonHover(true)}
        onMouseLeave={() => handleButtonHover(false)}
      >
        <div className="w-14 sm:w-16 md:w-20 lg:w-24 h-7 sm:h-8 md:h-9 lg:h-10 flex flex-col justify-center items-center overflow-hidden">
          <div ref={buttonTextRef} className="flex flex-col">
            <span className="h-7 sm:h-8 md:h-9 lg:h-10 w-14 sm:w-16 md:w-20 lg:w-24 flex items-center justify-center font-normal rounded-full text-xs sm:text-sm md:text-base transition-colors duration-200 text-black bg-zinc-100 hover:bg-zinc-200">
              {isMenuOpen ? "Fermer" : "Menu"}
            </span>
            <span
              className={`h-7 sm:h-8 md:h-9 lg:h-10 w-14 sm:w-16 md:w-20 lg:w-24 flex items-center justify-center font-medium rounded-full text-xs sm:text-sm md:text-base ${
                isHeaderWhite ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {isMenuOpen ? "Menu" : "Fermer"}
            </span>
          </div>
        </div>
      </button>

      {/* Version mobile - Hamburger */}
      <button
        type="button"
        aria-label={isMenuOpen ? "Fermer menu" : "Ouvrir menu"}
        className="block sm:hidden relative focus:outline-none cursor-pointer"
        onClick={handleMenuToggle}
      >
        <div className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 flex flex-col justify-center items-center space-y-1">
          <span
            ref={(el) => {
              if (el) hamburgerLinesRef.current[0] = el;
            }}
            className={`block h-0.5 w-6 sm:w-7 md:w-8 rounded-full transition-colors duration-200 ${
              isHeaderWhite ? "bg-gray-900" : "bg-white"
            }`}
          />
          <span
            ref={(el) => {
              if (el) hamburgerLinesRef.current[1] = el;
            }}
            className={`block h-0.5 w-6 sm:w-7 md:w-8 rounded-full transition-colors duration-200 ${
              isHeaderWhite ? "bg-gray-900" : "bg-white"
            }`}
          />
          <span
            ref={(el) => {
              if (el) hamburgerLinesRef.current[2] = el;
            }}
            className={`block h-0.5 w-6 sm:w-7 md:w-8 rounded-full transition-colors duration-200 ${
              isHeaderWhite ? "bg-gray-900" : "bg-white"
            }`}
          />
        </div>
      </button>

      {/* Menu Navigation avec Framer Motion (comme CartSidebar) */}
      <Portal>
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/30 z-[100]"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Menu Sidebar - Animation clipPath comme CartSidebar mais inversée */}
              <motion.div
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0 0 0)" }}
                exit={{ clipPath: "inset(0 100% 0 0)" }}
                transition={{
                  duration: 0.7,
                  ease: [0.76, 0, 0.24, 1] as const,
                }}
                className="fixed left-0 top-0 bg-white shadow-2xl flex flex-col z-[100] border-r border-gray-300 min-h-screen"
                style={{
                  width: "500px",
                  maxWidth: "90vw",
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200">
                  <h2 className="heading-md font-semibold text-gray-900">
                    Navigation
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 sm:p-2 rounded-full transition-all text-gray-700 cursor-pointer hover:rotate-180 duration-300"
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

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto p-6">
                  <nav className="space-y-1">
                    {navigationLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.1 + index * 0.08,
                          duration: 0.6,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="overflow-hidden"
                      >
                        <Link
                          href={link.href}
                          className={`group relative block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 ${
                            pathname === link.href
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : ""
                          } ${link.href.startsWith("/products?category=") ? "pl-8 flex items-center gap-2" : ""}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.href.startsWith("/products?category=") && (
                            <span className="w-1 h-1 rounded-full bg-black inline-block mr-2" />
                          )}
                          <span className="relative font-light uppercase tracking-wide transition-all duration-300 group-hover:text-gray-900 group-hover:translate-x-1 text-sm-responsive">
                            {link.label}
                          </span>
                          {/* Ligne d'animation hover */}
                          <motion.div
                            className="absolute bottom-2 left-4 h-0.5 bg-gray-900"
                            initial={{ width: 0 }}
                            whileHover={{ width: "calc(100% - 2rem)" }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>

                  {/* Section promotionnelle avec animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + navigationLinks.length * 0.08 + 0.2,
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200"
                  >
                    <h3 className="text-emerald-800 heading-sm font-medium mb-2 uppercase tracking-wide">
                      ✨ Nouveauté
                    </h3>
                    <p className="text-emerald-700 text-sm-responsive mb-3 font-light">
                      Découvrez notre nouvelle gamme de crèmes anti-âge !
                    </p>
                    <Link
                      href="/products?category=anti-age"
                      onClick={() => setIsMenuOpen(false)}
                      className="group inline-flex items-center text-sm text-emerald-800 hover:text-emerald-900 font-medium transition-colors duration-200"
                    >
                      <span className="uppercase tracking-wide">
                        Voir la collection
                      </span>
                      <motion.span
                        className="ml-1"
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        →
                      </motion.span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
