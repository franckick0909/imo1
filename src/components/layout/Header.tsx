"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "next-view-transitions";

import { useEffect, useRef, useState } from "react";
import CartSidebar from "../CartSidebar";
import NavigationMenu from "./NavigationMenu";
import UserMenu from "./UserMenu";

// Enregistrer les plugins GSAP
gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

  // Ref pour l'animation GSAP
  const headerRef = useRef<HTMLDivElement>(null);

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

  // Animation GSAP pour l'apparition/disparition du header
  useGSAP(() => {
    if (headerRef.current) {
      gsap.to(headerRef.current, {
        y: isVisible ? 0 : "-100%",
        duration: 0.4,
        ease: isVisible ? "power3.out" : "power3.in",
      });
    }
  }, [isVisible]);

  // Animation GSAP pour le logo avec ScrollTrigger
  useGSAP(() => {
    const logoContainer = document.querySelector('[href="/"]');
    const logoS = document.getElementById("logo-s");
    const logoD = document.getElementById("logo-d");

    if (logoContainer && logoS && logoD) {
      // Timeline pour l'animation du logo
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: logoContainer,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Animation du cercle (scale)
      tl.fromTo(
        logoContainer,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 6,
        }
      );

      // Animation du S (vient d'en haut)
      tl.fromTo(
        logoS,
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.4"
      );

      // Animation du D (vient d'en bas)
      tl.fromTo(
        logoD,
        { y: 25, opacity: 0 },
        {
          y: 6,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.2"
      );
    }
  }, []);

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
            className="relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center"
          >
            <div className="relative w-full h-full bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-white font-metal uppercase font-normal text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight relative z-10">
                <span
                  className="inline-block transform -translate-y-2 opacity-0"
                  id="logo-s"
                >
                  S
                </span>
                <span
                  className="inline-block transform translate-y-2 opacity-0"
                  id="logo-d"
                >
                  D
                </span>
              </span>
            </div>
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
