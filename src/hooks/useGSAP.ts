"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

interface UseGSAPOptions {
  dependencies?: unknown[];
  revertOnUpdate?: boolean;
  revertOnUnmount?: boolean;
}

export function useGSAP(
  callback: () => gsap.core.Timeline | gsap.core.Tween | void,
  options: UseGSAPOptions = {}
) {
  const {
    dependencies = [],
    revertOnUpdate = true,
    revertOnUnmount = true,
  } = options;
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // Nettoyer les animations précédentes si nécessaire
    if (revertOnUpdate) {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    }

    // Exécuter la callback
    const result = callback();

    // Stocker la référence pour le nettoyage
    if (result instanceof gsap.core.Timeline) {
      timelineRef.current = result;
    } else if (result instanceof gsap.core.Tween) {
      tweenRef.current = result;
    }

    // Cleanup
    return () => {
      if (revertOnUnmount) {
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
        if (tweenRef.current) {
          tweenRef.current.kill();
        }
      }
    };
  }, dependencies);

  return {
    timeline: timelineRef.current,
    tween: tweenRef.current,
  };
}
