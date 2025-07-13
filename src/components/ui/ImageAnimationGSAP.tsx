"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

// Enregistrer le plugin ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ImageAnimationGSAPProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  duration?: number;
  triggerStart?: string;
  triggerEnd?: string;
  animationType?:
    | "clipLeft"
    | "clipRight"
    | "clipTop"
    | "clipBottom"
    | "scale"
    | "fade"
    | "slideUp"
    | "slideDown";
  scrub?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  markers?: boolean;
  customTrigger?: string;
}

export default function ImageAnimationGSAP({
  src,
  alt,
  className = "",
  delay = 0,
  duration = 1,
  triggerStart = "top 80%",
  triggerEnd = "bottom 20%",
  animationType = "clipLeft",
  scrub = false,
  sizes,
  fill = false,
  width,
  height,
  priority = false,
  markers = false,
  customTrigger,
}: ImageAnimationGSAPProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return;

    const container = containerRef.current;
    const image = imageRef.current;

    // Utiliser customTrigger si fourni, sinon utiliser le container
    const triggerElement = customTrigger
      ? document.querySelector(customTrigger)
      : container;

    if (!triggerElement) {
      console.warn(`Trigger element not found: ${customTrigger}`);
      return;
    }

    // Configuration des animations selon le type
    const getAnimationConfig = (type: string) => {
      switch (type) {
        case "clipLeft":
          return {
            from: { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
            to: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
          };
        case "clipRight":
          return {
            from: {
              clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
            },
            to: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
          };
        case "clipTop":
          return {
            from: { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
            to: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
          };
        case "clipBottom":
          return {
            from: {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            },
            to: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
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
        case "slideUp":
          return {
            from: { y: 100, opacity: 0 },
            to: { y: 0, opacity: 1 },
          };
        case "slideDown":
          return {
            from: { y: -100, opacity: 0 },
            to: { y: 0, opacity: 1 },
          };
        default:
          return {
            from: { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
            to: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
          };
      }
    };

    const config = getAnimationConfig(animationType);

    // Initialiser l'image avec l'état initial
    gsap.set(image, config.from);

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

    // Ajouter l'animation
    tl.to(image, {
      ...config.to,
      duration: duration,
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
  }, [
    src,
    delay,
    duration,
    triggerStart,
    triggerEnd,
    animationType,
    scrub,
    markers,
    customTrigger,
  ]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className="object-cover w-full h-full"
        style={{
          clipPath: animationType.includes("clip")
            ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
            : undefined,
        }}
      />
    </div>
  );
}
