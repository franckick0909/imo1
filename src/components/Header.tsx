"use client";

import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import { useEffect, useState } from "react";
import CartSidebar from "./CartSidebar";
import NavigationMenu from "./NavigationMenu";
import UserMenu from "./UserMenu";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

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
  }, [lastScrollY]);

  const headerVariants = {
    visible: {
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
    hidden: {
      y: "-100%",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

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

  // Déterminer la couleur du logo
  const getLogoColor = () => {
    if (isAtTop) {
      return "text-white";
    } else if (hasScrolledUp) {
      return "text-zinc-700";
    }
    return "text-white";
  };

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-[30] transition-all duration-300 ${getHeaderStyle()}`}
      variants={headerVariants}
      animate={isVisible ? "visible" : "hidden"}
      initial="visible"
    >
      <div className="flex justify-between items-center py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6">
        {/* Menu Navigation (gauche) */}
        <div className="flex-1 flex justify-start">
          <NavigationMenu />
        </div>

        {/* Logo (centre) */}
        <div className="flex-1 flex justify-center">
          <Link
            href="/"
            className={`font-pinyon text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light transition-all duration-300 cursor-pointer ${getLogoColor()}`}
          >
            BioCrème
          </Link>
        </div>

        {/* Menus Utilisateur et Panier (droite) */}
        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3 md:gap-4">
          <CartSidebar />
          <UserMenu />
        </div>
      </div>
    </motion.div>
  );
}
