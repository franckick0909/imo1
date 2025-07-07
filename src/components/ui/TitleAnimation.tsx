"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef } from "react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TitleAnimationProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  triggerStart?: string;
  as?: React.ElementType;
  splitBy?: "words" | "chars";
}

export default function TitleAnimation({
  text,
  className = "",
  delay = 0,
  duration = 0.6,
  stagger = 0.1,
  triggerStart = "top 75%",
  as: Component = "h1",
  splitBy = "words",
}: TitleAnimationProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const element = containerRef.current;

      // Split le texte selon le type choisi
      const splitText = splitBy === "words" ? text.split(" ") : text.split("");

      // Créer le HTML avec les spans
      element.innerHTML = splitText
        .map(
          (piece) =>
            `<span class="inline-block overflow-hidden">
            <span class="inline-block transform translate-y-full">${piece}${splitBy === "words" ? " " : ""}</span>
          </span>`
        )
        .join("");

      // Récupérer tous les spans internes
      const spans = element.querySelectorAll("span span");

      // S'assurer que tous les éléments sont cachés initialement
      gsap.set(spans, { y: "100%" });

      // Animation au scroll
      gsap.to(spans, {
        y: 0,
        duration: duration,
        ease: "power2.out",
        stagger: stagger,
        delay: delay,
        scrollTrigger: {
          trigger: element,
          start: triggerStart,
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <Component ref={containerRef} className={className}>
      {text}
    </Component>
  );
}
