"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

// Enregistrer le plugin ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TitleAnimationGSAPProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  splitBy?: "words" | "chars";
  triggerStart?: string;
  triggerEnd?: string;
  animationType?: "slideUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
  scrub?: boolean;
  markers?: boolean;
  customTrigger?: string;
}

export default function TitleAnimationGSAP({
  text,
  className = "",
  delay = 0,
  duration = 0.8,
  stagger = 0.1,
  splitBy = "words",
  triggerStart = "top 80%",
  triggerEnd = "bottom 20%",
  animationType = "slideUp",
  scrub = false,
  markers = false,
  customTrigger,
}: TitleAnimationGSAPProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const elements = elementsRef.current;

    // Utiliser customTrigger si fourni, sinon utiliser le container
    const triggerElement = customTrigger ? document.querySelector(customTrigger) : container;

    if (!triggerElement) {
      console.warn(`Trigger element not found: ${customTrigger}`);
      return;
    }

    // Configuration des animations selon le type
    const getAnimationConfig = (type: string) => {
      switch (type) {
        case "slideUp":
          return {
            from: { y: 100, opacity: 0 },
            to: { y: 0, opacity: 1 },
          };
        case "fadeIn":
          return {
            from: { opacity: 0 },
            to: { opacity: 1 },
          };
        case "slideLeft":
          return {
            from: { x: 100, opacity: 0 },
            to: { x: 0, opacity: 1 },
          };
        case "slideRight":
          return {
            from: { x: -100, opacity: 0 },
            to: { x: 0, opacity: 1 },
          };
        case "scale":
          return {
            from: { scale: 0.8, opacity: 0 },
            to: { scale: 1, opacity: 1 },
          };
        default:
          return {
            from: { y: 50, opacity: 0 },
            to: { y: 0, opacity: 1 },
          };
      }
    };

    const config = getAnimationConfig(animationType);

    // Initialiser les éléments avec l'état initial
    gsap.set(elements, config.from);

    // Créer la timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: triggerStart,
        end: triggerEnd,
        scrub: scrub,
        toggleActions: "play none none reverse",
        markers: markers,
      },
    });

    // Ajouter l'animation avec stagger
    tl.to(elements, {
      ...config.to,
      duration: duration,
      stagger: stagger,
      ease: "power2.out",
      delay: delay,
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === triggerElement) {
          trigger.kill();
        }
      });
    };
  }, [text, delay, duration, stagger, triggerStart, triggerEnd, animationType, scrub, markers, customTrigger]);

  // Fonction pour splitter le texte
  const splitText = (text: string, splitBy: "words" | "chars") => {
    elementsRef.current = []; // Reset des refs

    if (splitBy === "words") {
      return text.split(/(\s+)/).map((segment, index) => {
        if (segment.trim() === "") {
          // Préserver les espaces
          return (
            <span key={index} className="whitespace-pre">
              {segment}
            </span>
          );
        }
        return (
          <span
            key={index}
            ref={(el) => {
              if (el) elementsRef.current.push(el);
            }}
            className="inline-block"
          >
            {segment}
          </span>
        );
      });
    } else {
      // Split par caractères
      return text.split("").map((char, index) => {
        if (char === " ") {
          return (
            <span key={index} className="whitespace-pre">
              {char}
            </span>
          );
        }
        return (
          <span
            key={index}
            ref={(el) => {
              if (el) elementsRef.current.push(el);
            }}
            className="inline-block"
          >
            {char}
          </span>
        );
      });
    }
  };

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      {splitText(text, splitBy)}
    </div>
  );
}
