"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface ImageParallaxProps {
  imgParallax: string;
  title: string | null;
  subtitle: string | null;
  className?: string;
}

export default function ImageParallax({
  imgParallax,
  title,
  subtitle,
  className,
}: ImageParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      imageRef.current,
      {
        y: -400,
      },
      {
        y: 400,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          scrub: true,
          markers: false,
        },
      }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[120vh] bg-sky-300 overflow-hidden"
    >
      <div ref={imageRef} className={`absolute inset-0 w-full h-full scale-100 ${className}`}>
        <Image
          src={imgParallax}
          alt="Pure Purification"
          className="w-full h-full object-cover object-center"
          style={{
            willChange: "transform",
            transform: "translateY(0) scale(1)",
          }}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {(title || subtitle) && (
        <h2 className="absolute inset-0 flex flex-col justify-center text-white max-w-xs mx-auto leading-none">
          {title && (
            <span className="text-[5vw] uppercase -translate-x-[10%]">
              {title}
            </span>
          )}
          {subtitle && (
            <span className="text-[4vw] self-end italic font-light font-monsieur">
              {subtitle}
            </span>
          )}
        </h2>
      )}
      <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-sm font-light">
        Bio Crème
      </p>
    </div>
  );
}
