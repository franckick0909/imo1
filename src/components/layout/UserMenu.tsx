"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiLogOut, FiPackage, FiSettings, FiShield } from "react-icons/fi";
import { usePrefetch } from "../../hooks/usePrefetch";
import AuthModals from "../AuthModals";
import Portal from "../Portal";

// Enregistrer les plugins GSAP
gsap.registerPlugin(useGSAP);

export default function UserMenu() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const router = useTransitionRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hook de prefetching pour améliorer les performances
  const { prefetch } = usePrefetch();

  // Prefetch automatique des données importantes
  useEffect(() => {
    if (user) {
      // Prefetcher les données au lieu des pages
      const timer = setTimeout(() => {
        prefetch();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, prefetch]);

  // Fermer le menu quand on change de page
  useEffect(() => {
    if (isUserMenuOpen) {
      closeMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation GSAP pour l'ouverture du menu
  const openMenu = useCallback(() => {
    setIsUserMenuOpen(true);

    // Attendre que l'élément soit dans le DOM
    setTimeout(() => {
      if (dropdownRef.current) {
        gsap.to(dropdownRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.inOut",
        });
      }
    }, 0);
  }, []);

  // Animation GSAP pour la fermeture du menu
  const closeMenu = useCallback(() => {
    if (dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        y: -8,
        scale: 0.9,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          setIsUserMenuOpen(false);
        },
      });
    } else {
      setIsUserMenuOpen(false);
    }
  }, []);

  // Fonction d'animation pour les transitions de vue (optimisée)
  const slideInOut = useCallback(() => {
    const keyframes = [
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
    ];

    const options = {
      duration: 800, // Réduit de 1000ms à 800ms
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards" as FillMode,
    };

    try {
      document.documentElement.animate(keyframes, {
        ...options,
        pseudoElement: "::view-transition-old(root)",
      });

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
          ...options,
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } catch {
      // Fallback silencieux si les view transitions ne sont pas supportées
      console.debug("View transitions not supported");
    }
  }, []);

  const handleNavigation = useCallback(
    (href: string) => {
      closeMenu();

      // Pour les pages admin, utiliser une navigation simple sans transition
      if (href.startsWith("/admin")) {
        router.push(href);
      } else {
        // Utiliser un timeout de sécurité réduit
        const timeoutId = setTimeout(() => {
          router.push(href);
        }, 1500); // Réduit de 2000ms à 1500ms

        router.push(href, {
          onTransitionReady: () => {
            clearTimeout(timeoutId);
            slideInOut();
          },
        });
      }
    },
    [closeMenu, router, slideInOut]
  );

  const handleOpenSignIn = useCallback(() => {
    closeMenu();
    setShowSignIn(true);
    setShowSignUp(false);
  }, [closeMenu]);

  const handleCloseModals = useCallback(() => {
    setShowSignIn(false);
    setShowSignUp(false);
  }, []);

  const handleToggleMode = useCallback(() => {
    if (showSignIn) {
      setShowSignIn(false);
      setShowSignUp(true);
    } else {
      setShowSignUp(false);
      setShowSignIn(true);
    }
  }, [showSignIn]);

  const handleMenuToggle = () => {
    if (!user) {
      handleOpenSignIn();
    } else {
      if (isUserMenuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton Utilisateur */}
      <button
        aria-label={user ? "Menu utilisateur" : "Se connecter"}
        type="button"
        onClick={handleMenuToggle}
        className="relative bg-zinc-100 hover:bg-zinc-200 text-black p-1.5 sm:p-2 md:p-2.5 h-10 sm:h-10 md:h-11 lg:h-12 w-10 sm:w-10 md:w-11 lg:w-12 rounded-full transition-colors duration-200 cursor-pointer flex items-center justify-center"
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
      {isUserMenuOpen && user && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-1 sm:mt-2 w-56 sm:w-64 bg-white rounded-lg sm:rounded-xl shadow-xl border border-gray-200 py-2 z-50 opacity-0 -translate-y-2 scale-90"
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
                <p className="font-medium text-gray-900 text-base-responsive">
                  {user.name || user.email}
                </p>
                <p className="text-xs-responsive text-gray-500 truncate w-38  md:w-42">
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
                  closeMenu();
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
        </div>
      )}

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
