"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef } from "react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TitleAnimationDebugProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  triggerStart?: string;
  as?: React.ElementType;
  splitBy?: "words" | "chars";
  autoPlay?: boolean;
  sectionName?: string;
}

export default function TitleAnimationDebug({
  text,
  className = "",
  delay = 0,
  duration = 0.6,
  stagger = 0.1,
  triggerStart = "top 75%",
  as: Component = "h1",
  splitBy = "words",
  autoPlay = false,
  sectionName = "unknown",
}: TitleAnimationDebugProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Créer un ID unique pour cette instance
  const uniqueId = useRef(
    `title-anim-${sectionName}-${Math.random().toString(36).substr(2, 9)}`
  );

  useGSAP(
    () => {
      if (!containerRef.current) {
        console.log(`❌ Pas de containerRef pour ${sectionName}`);
        return;
      }

      const element = containerRef.current;
      console.log(`✅ Animation initialisée pour ${sectionName}:`, element);

      // Ajouter une classe unique à l'élément
      element.classList.add(uniqueId.current);

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

      // Récupérer tous les spans internes DANS CET ÉLÉMENT SPÉCIFIQUE
      const spans = element.querySelectorAll("span span");
      console.log(`🔍 Spans trouvés pour ${sectionName}:`, spans.length);

      if (autoPlay) {
        // S'assurer que tous les éléments sont cachés initialement
        gsap.set(spans, { y: "100%" });
        console.log(`🎬 Animation autoPlay pour ${sectionName}`);

        // Animation automatique au chargement
        gsap.to(spans, {
          y: 0,
          duration: duration,
          ease: "power2.out",
          stagger: stagger,
          delay: delay,
        });
      } else {
        console.log(
          `📜 Animation scroll pour ${sectionName} - trigger: ${triggerStart}`
        );

        // Animation au scroll avec fromTo pour plus de contrôle
        gsap.fromTo(
          spans,
          { y: "100%" },
          {
            y: 0,
            duration: duration,
            ease: "power2.out",
            stagger: stagger,
            delay: delay,
            scrollTrigger: {
              trigger: element, // Utiliser l'élément spécifique comme trigger
              start: triggerStart,
              toggleActions: "play none none reverse",
              markers: true, // Activer les markers pour debug
              id: `${sectionName}-title-animation`,
              onEnter: () =>
                console.log(`🎯 ScrollTrigger ENTER pour ${sectionName}`),
              onLeave: () =>
                console.log(`🎯 ScrollTrigger LEAVE pour ${sectionName}`),
              onEnterBack: () =>
                console.log(`🎯 ScrollTrigger ENTER_BACK pour ${sectionName}`),
              onLeaveBack: () =>
                console.log(`🎯 ScrollTrigger LEAVE_BACK pour ${sectionName}`),
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <Component ref={containerRef} className={className}>
      {text}
    </Component>
  );
}
