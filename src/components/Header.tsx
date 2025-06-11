"use client";

import NavigationMenu from "./NavigationMenu";
import CartSidebar from "./CartSidebar";
import UserMenu from "./UserMenu";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useTransitionRouter();

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

  // Fonction d'animation pour les transitions de vue
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

  const headerVariants = {
    visible: {
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    hidden: {
      y: "-100%",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-emerald-300"
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
            onClick={(e) => {
              e.preventDefault();
              router.push("/", {
                onTransitionReady: slideInOut,
              });
            }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-emerald-800 transition-all duration-300 cursor-pointer"
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
