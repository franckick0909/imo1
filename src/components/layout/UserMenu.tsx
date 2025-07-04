"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FiLogIn,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiShield,
} from "react-icons/fi";
import AuthModals from "../AuthModals";
import Portal from "../Portal";

export default function UserMenu() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const router = useTransitionRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fonction d'animation pour les transitions de vue (comme NavigationMenu)
  function slideInOut() {
    document.documentElement.animate(
      [
        {
          opacity: 1,
          scale: 1,
          transform: "translateY(0)",
        },
        {
          opacity: 0.2,
          scale: 0.95,
          transform: "translateY(-35%)",
        },
      ],
      {
        duration: 1000,
        easing: "cubic-bezier(0.76, 0, 0.24, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    document.documentElement.animate(
      [
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        },
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        },
      ],
      {
        duration: 1000,
        easing: "cubic-bezier(0.76, 0, 0.24, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }

  const handleNavigation = (href: string) => {
    setIsUserMenuOpen(false);
    // Pour les pages admin, utiliser une navigation simple sans transition
    if (href.startsWith("/admin")) {
      router.push(href);
    } else {
      // Utiliser un timeout de sécurité pour les transitions
      const timeoutId = setTimeout(() => {
        router.push(href);
      }, 2000);

      router.push(href, {
        onTransitionReady: () => {
          clearTimeout(timeoutId);
          slideInOut();
        },
      });
    }
  };

  const handleOpenSignIn = () => {
    setIsUserMenuOpen(false);
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleCloseModals = () => {
    setShowSignIn(false);
    setShowSignUp(false);
  };

  const handleToggleMode = () => {
    if (showSignIn) {
      setShowSignIn(false);
      setShowSignUp(true);
    } else {
      setShowSignUp(false);
      setShowSignIn(true);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton Utilisateur */}
      <button
        aria-label={user ? "Menu utilisateur" : "Se connecter"}
        type="button"
        onClick={() => {
          if (!user) {
            handleOpenSignIn();
          } else {
            setIsUserMenuOpen(!isUserMenuOpen);
          }
        }}
        className="relative bg-zinc-100 hover:bg-zinc-200 text-black p-1.5 sm:p-2 md:p-2.5 h-10 sm:h-10 md:h-11 lg:h-12 w-10 sm:w-10 md:w-11 lg:w-12 rounded-full transition-colors duration-300 cursor-pointer flex items-center justify-center"
      >
        <svg
          className="w-4 sm:w-5 md:w-5 lg:w-6 h-4 sm:h-5 md:h-5 lg:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        {/* Indicateur pour les utilisateurs connectés */}
        {user && (
          <span className="absolute -top-1 sm:-top-1 -right-1 sm:-right-1 bg-emerald-500 w-2.5 sm:w-3 md:w-3 h-2.5 sm:h-3 md:h-3 rounded-full border-1 sm:border-2 border-green-300"></span>
        )}
      </button>

      {/* Menu Dropdown */}
      <AnimatePresence>
        {isUserMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-1 sm:mt-2 w-56 sm:w-64 bg-white rounded-lg sm:rounded-xl shadow-xl border border-gray-200 py-2 z-50"
          >
            {/* En-tête utilisateur */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 sm:w-4 md:w-5 h-4 sm:h-4 md:h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate w-38  md:w-42">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Section Compte */}
              <div className="px-2">
                <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mon Compte
                </p>

                <button
                  type="button"
                  aria-label="Tableau de bord"
                  onClick={() => handleNavigation("/dashboard")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FiSettings className="w-4 h-4" />
                  <span>Tableau de bord</span>
                </button>

                <button
                  type="button"
                  aria-label="Mon profil"
                  onClick={() => handleNavigation("/dashboard/profile")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Mon profil</span>
                </button>

                <button
                  type="button"
                  aria-label="Mes commandes"
                  onClick={() => handleNavigation("/dashboard/orders")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FiPackage className="w-4 h-4" />
                  <span>Mes commandes</span>
                </button>
              </div>

              {/* Section Admin (si admin) */}
              {session?.user.role === "admin" && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <div className="px-2">
                    <p className="px-3 py-1 text-xs font-medium text-emerald-600 uppercase tracking-wider">
                      Administration
                    </p>

                    <button
                      type="button"
                      aria-label="Administration"
                      onClick={() => handleNavigation("/admin")}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <FiShield className="w-4 h-4" />
                      <span>Administration</span>
                    </button>

                    <button
                      type="button"
                      aria-label="Gestion produits"
                      onClick={() => handleNavigation("/admin/products")}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <FiPackage className="w-4 h-4" />
                      <span>Gestion produits</span>
                    </button>
                  </div>
                </>
              )}

              {/* Déconnexion */}
              <div className="border-t border-gray-100 my-2"></div>
              <div className="px-2">
                <button
                  type="button"
                  aria-label="Se déconnecter"
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await signOut();
                    router.push("/");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu pour utilisateur non connecté */}
      <AnimatePresence>
        {isUserMenuOpen && !user && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
          >
            <div className="px-2">
              <button
                type="button"
                aria-label="Se connecter"
                onClick={handleOpenSignIn}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FiLogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales d'authentification - Portal pour éviter le containment */}
      <Portal>
        <AuthModals
          showSignIn={showSignIn}
          showSignUp={showSignUp}
          onClose={handleCloseModals}
          onToggleMode={handleToggleMode}
        />
      </Portal>
    </div>
  );
}
