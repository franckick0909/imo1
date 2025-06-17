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

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Si on scroll vers le bas et qu'on a dépassé 100px, cacher le header
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      // Si on scroll vers le haut, montrer le header
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
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

  //   backdropFilter: "blur(10px)",
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
    hidden: {
      y: "-100%",
      //   backdropFilter: "none",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-30"
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
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white transition-all duration-300 cursor-pointer"
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
