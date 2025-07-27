"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import CartSidebar from "../CartSidebar";
import NavigationMenu from "./NavigationMenu";
import UserMenu from "./UserMenu";

// Enregistrer les plugins GSAP
gsap.registerPlugin(useGSAP);

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);
  const [backgroundIsDark, setBackgroundIsDark] = useState(true);

  // Hook Next.js pour détecter les changements de route
  const pathname = usePathname();

  // Ref pour l'animation GSAP
  const headerRef = useRef<HTMLDivElement>(null);

  // Fonction pour détecter la couleur du fond avec useCallback
  const detectBackgroundColor = useCallback(() => {
    // Sur les pages dashboard, le fond est clair
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      setBackgroundIsDark(false);
      return;
    }

    // Sur la page d'accueil, détecter selon la position de scroll
    if (pathname === "/") {
      const scrollY = window.scrollY;
      // En haut de la page d'accueil (hero section), le fond est sombre
      setBackgroundIsDark(scrollY < 300);
    } else {
      // Par défaut, considérer que le fond est clair
      setBackgroundIsDark(false);
    }
  }, [pathname]);

  // Effet pour détecter les changements de route
  useEffect(() => {
    detectBackgroundColor();
  }, [detectBackgroundColor]);

  useEffect(() => {
    // Détecter la couleur du fond au chargement
    detectBackgroundColor();

    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Détecter la couleur du fond à chaque scroll
      detectBackgroundColor();

      // Détecter si on est en haut de page
      setIsAtTop(currentScrollY <= 50);

      // Si on scroll vers le bas et qu'on a dépassé 100px, cacher le header
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setHasScrolledUp(false);
      }
      // Si on scroll vers le haut, montrer le header
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
        setHasScrolledUp(currentScrollY > 50); // Marquer qu'on a scrollé vers le haut depuis le bas
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle pour les performances
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlHeader();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, detectBackgroundColor]);

  // Animation GSAP pour l'apparition/disparition
  useGSAP(() => {
    if (headerRef.current) {
      gsap.to(headerRef.current, {
        y: isVisible ? 0 : "-100%",
        duration: 0.4,
        ease: isVisible ? "power3.out" : "power3.in",
      });
    }
  }, [isVisible]);

  // Déterminer le style du header selon l'état
  const getHeaderStyle = () => {
    if (isAtTop) {
      // Transparent en haut de page
      return "bg-transparent";
    } else if (hasScrolledUp) {
      // Fond blanc quand on remonte depuis le bas
      return "bg-white/95 backdrop-blur-md shadow-sm";
    }
    return "bg-transparent";
  };

  // Couleur pour la partie "Crème" du logo
  const getCremeColor = () => {
    return backgroundIsDark ? "text-white" : "text-slate-700";
  };

  return (
    <div
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-[45] transition-all duration-300 ${getHeaderStyle()}`}
    >
      <div className="flex justify-between items-center py-3 sm:py-3 md:py-4 lg:py-5 px-4 sm:px-5 md:px-6 lg:px-8">
        {/* Menu Navigation (gauche) */}
        <div className="flex-1 flex justify-start">
          <NavigationMenu isHeaderWhite={hasScrolledUp} />
        </div>

        {/* Logo (centre) */}
        <div className="flex-1 flex justify-center">
          <Link
            href="/"
            className="heading-xl transition-all duration-300 cursor-pointer font-light"
          >
            <span className=" text-emerald-400 font-light">Bio</span>
            <span
              className={`transition-all duration-300 tracking-tight ${getCremeColor()}`}
            >
              Crème
            </span>
          </Link>
        </div>

        {/* Menus Utilisateur et Panier (droite) */}
        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
          <CartSidebar />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
