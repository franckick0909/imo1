"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ImageAnimationProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  duration?: number;
  triggerStart?: string;
  animationType?:
    | "clipLeft"
    | "clipRight"
    | "clipTop"
    | "clipBottom"
    | "scale"
    | "fade";
  sizes?: string;
}

// Type pour les propriétés GSAP
type GSAPAnimationProps = {
  clipPath?: string;
  scale?: number;
  opacity?: number;
};

export default function ImageAnimation({
  src,
  alt,
  className = "",
  delay = 0,
  duration = 1,
  triggerStart = "top 75%",
  animationType = "clipLeft",
  sizes = "(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 128px, (max-width: 1536px) 160px, 192px",
}: ImageAnimationProps) {
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!imageRef.current) return;

      const element = imageRef.current;

      // Configuration initiale et animation selon le type
      let fromState: GSAPAnimationProps = {};
      let toState: GSAPAnimationProps = {};

      switch (animationType) {
        case "clipLeft":
          fromState = { clipPath: "inset(0 100% 0 0)" };
          toState = { clipPath: "inset(0 0% 0 0)" };
          break;
        case "clipRight":
          fromState = { clipPath: "inset(0 0 0 100%)" };
          toState = { clipPath: "inset(0 0 0 0%)" };
          break;
        case "clipTop":
          fromState = { clipPath: "inset(100% 0 0 0)" };
          toState = { clipPath: "inset(0% 0 0 0)" };
          break;
        case "clipBottom":
          fromState = { clipPath: "inset(0 0 100% 0)" };
          toState = { clipPath: "inset(0 0 0% 0)" };
          break;
        case "scale":
          fromState = { scale: 0, opacity: 0 };
          toState = { scale: 1, opacity: 1 };
          break;
        case "fade":
          fromState = { opacity: 0 };
          toState = { opacity: 1 };
          break;
        default:
          fromState = { clipPath: "inset(0 100% 0 0)" };
          toState = { clipPath: "inset(0 0% 0 0)" };
      }

      // État initial
      gsap.set(element, fromState);

      // Animation au scroll
      gsap.to(element, {
        ...toState,
        duration: duration,
        ease: "power2.out",
        delay: delay,
        scrollTrigger: {
          trigger: element,
          start: triggerStart,
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: imageRef }
  );

  return (
    <div ref={imageRef} className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes={sizes}
      />
    </div>
  );
}
