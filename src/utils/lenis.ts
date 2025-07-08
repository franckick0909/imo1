"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export * from "lenis/react";

// Type pour ScrollTrigger
declare global {
  interface Window {
    ScrollTrigger?: {
      update: () => void;
    };
  }
}

// Hook personnalisé pour une configuration avancée
export function useAdvancedLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      infinite: false,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false,
    });

    // Fonction d'animation frame
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Intégration avec GSAP ScrollTrigger
    if (typeof window !== "undefined" && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
    }

    return () => {
      lenis.destroy();
    };
  }, []);
}

// Configuration avec inertie pour effet TrueKind
export const truekindLenisConfig = {
  duration: 1.6, // Durée moyenne pour l'inertie
  lerp: 0.04, // Très bas pour maximum d'inertie
  wheelMultiplier: 1.4, // Légèrement amplifié
  touchMultiplier: 3, // Beaucoup d'inertie tactile
  infinite: false,
  orientation: "vertical" as const,
  gestureOrientation: "vertical" as const,
  smoothWheel: true,
  syncTouch: false, // Important pour l'inertie
  eventsTarget: typeof window !== "undefined" ? window : undefined,
};

// Configurations alternatives d'inertie
export const inertiaConfigs = {
  // Plus d'inertie (comme TrueKind)
  maximum: {
    lerp: 0.04,
    wheelMultiplier: 1.4,
    touchMultiplier: 3,
  },

  // Inertie équilibrée (actuelle)
  balanced: {
    lerp: 0.06,
    wheelMultiplier: 1.2,
    touchMultiplier: 2.5,
  },

  // Moins d'inertie (plus réactif)
  minimal: {
    lerp: 0.08,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  },
};

// Configuration optimisée pour les sites premium
export const premiumLenisConfig = {
  duration: 2.2, // Très fluide
  wheelMultiplier: 0.6, // Très doux
  touchMultiplier: 1.2, // Tactile optimisé
  infinite: false,
  orientation: "vertical" as const,
  gestureOrientation: "vertical" as const,
  smoothWheel: true,
  syncTouch: false,
};
