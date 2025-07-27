"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface GSAPMosaicRevealImageProps {
  src: string;
  alt: string;
  rows?: number;
  cols?: number;
  className?: string;
  width?: number;
  height?: number;
}

export default function GSAPMosaicRevealImage({
  src,
  alt,
  rows = 4,
  cols = 4,
  className = "",
  width,
  height,
}: GSAPMosaicRevealImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    gsap.set(tileRefs.current, { scale: 0.7, opacity: 0, y: 50, x: 50 });
    gsap.to(tileRefs.current, {
      scale: 1,
      opacity: 1,
      y: 0,
      x: 0,
      stagger: {
        amount: 0.6,
        grid: [rows, cols],
        from: "start",
      },
      duration: 1,
      ease: "power4.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  }, [rows, cols]);

  // On suppose que le parent global a une taille connue (aspect-[4/5] ou w-full h-full)
  // On va utiliser Next Image sans fill, mais avec width/height du parent global
  // Pour chaque tuile, on décale l'image avec left/top négatifs
  // On suppose ici 400x500px pour l'exemple, mais on peut passer width/height en props si besoin
  const globalWidth = width ?? 400;
  const globalHeight = height ?? 500;
  const overlap = 1; // en pixels, à ajuster si besoin

  // Calcul de la taille de chaque tuile
  const tileWidth = globalWidth / cols + overlap;
  const tileHeight = globalHeight / rows + overlap;

  const tiles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = `${row}-${col}`;
      tiles.push(
        <div
          key={key}
          ref={(el) => {
            if (el) {
              tileRefs.current[row * cols + col] = el;
            }
          }}
          className="absolute overflow-hidden pointer-events-none select-none bg-transparent border-none outline-none shadow-none"
          style={{
            left: `${(col * globalWidth) / cols - overlap / 2}px`,
            top: `${(row * globalHeight) / rows - overlap / 2}px`,
            width: `${tileWidth}px`,
            height: `${tileHeight}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `-${(col * globalWidth) / cols - overlap / 2}px`,
              top: `-${(row * globalHeight) / rows - overlap / 2}px`,
              width: globalWidth,
              height: globalHeight,
            }}
          >
            <Image
              src={src}
              alt={alt}
              width={globalWidth}
              height={globalHeight}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
        </div>
      );
    }
  }
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full aspect-[4/5] ${className}`}
      style={{ minHeight: 100, width: globalWidth, height: globalHeight }}
    >
      {tiles}
    </div>
  );
}
