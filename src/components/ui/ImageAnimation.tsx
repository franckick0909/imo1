"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

export type AnimationType =
  | "clipLeft"
  | "clipRight"
  | "clipTop"
  | "clipBottom"
  | "scale"
  | "fade";

interface ImageAnimationProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  duration?: number;
  triggerStart?: string;
  animationType?: AnimationType;
  autoPlay?: boolean;
  sizes?: string;
}

export default function ImageAnimation({
  src,
  alt,
  className = "",
  delay = 0,
  duration = 1,
  triggerStart = "top 75%",
  animationType = "scale",
  autoPlay = false,
  sizes = "100vw",
}: ImageAnimationProps) {
  const imageRef = useRef<HTMLDivElement>(null);

  // Créer un ID unique pour cette instance
  const uniqueId = useRef(
    `image-anim-${Math.random().toString(36).substr(2, 9)}`
  );

  useGSAP(
    () => {
      if (!imageRef.current) return;

      const element = imageRef.current;
      element.classList.add(uniqueId.current);

      // Configuration des animations selon le type
      const getAnimationConfig = () => {
        switch (animationType) {
          case "clipLeft":
            return {
              from: { clipPath: "inset(0 100% 0 0)" },
              to: { clipPath: "inset(0 0% 0 0)" },
            };
          case "clipRight":
            return {
              from: { clipPath: "inset(0 0 0 100%)" },
              to: { clipPath: "inset(0 0 0 0%)" },
            };
          case "clipTop":
            return {
              from: { clipPath: "inset(100% 0 0 0)" },
              to: { clipPath: "inset(0% 0 0 0)" },
            };
          case "clipBottom":
            return {
              from: { clipPath: "inset(0 0 100% 0)" },
              to: { clipPath: "inset(0 0 0% 0)" },
            };
          case "scale":
            return {
              from: { scale: 0.8, opacity: 0 },
              to: { scale: 1, opacity: 1 },
            };
          case "fade":
            return {
              from: { opacity: 0 },
              to: { opacity: 1 },
            };
          default:
            return {
              from: { scale: 0.8, opacity: 0 },
              to: { scale: 1, opacity: 1 },
            };
        }
      };

      const { from, to } = getAnimationConfig();

      if (autoPlay) {
        // Animation automatique au chargement
        gsap.set(element, from);
        gsap.to(element, {
          ...to,
          duration: duration,
          ease: "power2.out",
          delay: delay,
        });
      } else {
        // Animation au scroll
        gsap.fromTo(element, from, {
          ...to,
          duration: duration,
          ease: "power2.out",
          delay: delay,
          scrollTrigger: {
            trigger: element,
            start: triggerStart,
            toggleActions: "play none none reverse",
          },
        });
      }
    },
    { scope: imageRef }
  );

  return (
    <div ref={imageRef} className={className}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
