"use client";

import { useGSAP } from "@gsap/react";
import { useInView as useFramerInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import React, { useEffect, useRef, useState } from "react";

gsap.registerPlugin(SplitText, ScrollTrigger);

type ElementType = HTMLElement;
interface SplitTextInstance {
  lines: Element[];
  revert: () => void;
}

export default function GSAPText({
  children,
  animateOnScroll = true,
  delay = 0,
  useInView = false,
  threshold = 0.25,
  once = true,
  stagger = 0.1,
  duration = 1,
  ease = "power4.out",
  useOpacity = false,
  initialY = "100%",
}: {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  useInView?: boolean;
  threshold?: number;
  once?: boolean;
  stagger?: number;
  duration?: number;
  ease?: string;
  useOpacity?: boolean;
  initialY?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<ElementType[]>([]);
  const splitRef = useRef<SplitTextInstance[]>([]);
  const lines = useRef<Element[]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Utiliser useInView de framer-motion si demandé
  const isInView = useFramerInView(containerRef, {
    once,
    amount: threshold,
  });

  // Déclencheur d'animation basé sur useInView si demandé
  useEffect(() => {
    if (useInView && isInView && !hasAnimated && lines.current.length > 0) {
      const animationProps: gsap.TweenVars = {
        stagger,
        y: "0%",
        duration,
        ease,
        delay,
      };

      if (useOpacity) {
        animationProps.opacity = 1;
      }

      gsap.to(lines.current, animationProps);
      if (once) {
        setHasAnimated(true);
      }
    }
  }, [
    isInView,
    useInView,
    hasAnimated,
    stagger,
    duration,
    ease,
    delay,
    once,
    useOpacity,
  ]);

  useGSAP(
    () => {
      if (!containerRef.current || useInView) return;

      splitRef.current = [];
      elementRef.current = [];
      lines.current = [];

      let elements: ElementType[] = [];
      const container = containerRef.current as HTMLElement;

      if (container.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(container.children) as ElementType[];
      } else {
        elements = [container];
      }

      elements.forEach((element) => {
        elementRef.current.push(element);

        // Utiliser l'instance de SplitText directement
        const split = new SplitText(element, {
          type: "lines",
          mask: "lines",
          linesClass: "line++",
        }) as unknown as SplitTextInstance;

        splitRef.current.push(split);

        const computedStyle = window.getComputedStyle(element);
        const textIndent = computedStyle.textIndent;

        if (textIndent && textIndent !== "0px") {
          if (split.lines.length > 0) {
            (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
          }
          element.style.textIndent = "0";
        }

        lines.current.push(...split.lines);
      });

      // Configuration initiale avec ou sans opacity
      const initialProps: gsap.TweenVars = { y: initialY };
      if (useOpacity) {
        initialProps.opacity = 0;
      }
      gsap.set(lines.current, initialProps);

      const animationProps: gsap.TweenVars = {
        stagger,
        y: "0%",
        duration,
        ease,
        delay,
      };

      if (useOpacity) {
        animationProps.opacity = 1;
      }

      if (animateOnScroll && !useInView) {
        gsap.to(lines.current, {
          ...animationProps,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            once,
          },
        });
      } else if (!useInView) {
        gsap.to(lines.current, animationProps);
      }

      return () => {
        splitRef.current.forEach((split) => {
          if (split) {
            split.revert();
          }
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [
        animateOnScroll,
        delay,
        useInView,
        stagger,
        duration,
        ease,
        once,
        threshold,
        useOpacity,
        initialY,
      ],
    }
  );

  // Pour l'utilisation du composant avec un seul enfant
  if (React.Children.count(children) === 1) {
    // Utiliser une approche plus simple sans cloneElement
    return (
      <div ref={containerRef} style={{ display: "contents" }}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-gsap-text-wrapper="true"
      className="relative overflow-hidden"
    >
      {children}
    </div>
  );
}
