"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface ParallaxBannerProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ParallaxBanner({
  src,
  alt = "Parallax banner",
  className = "",
}: ParallaxBannerProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      imgRef.current,
      { y: -300 },
      {
        y: 300,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden ${className}`}
    >
      <div
        ref={imgRef}
        className="absolute inset-0 w-full h-full will-change-transform scale-100"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center w-full h-full select-none pointer-events-none"
          priority
          sizes="100vw"
        />
      </div>
    </div>
  );
}
