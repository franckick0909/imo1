"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { CircleButton } from "./ui/ExploreButton";

gsap.registerPlugin(ScrollTrigger);

export default function NewsletterOverlay({ 
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !contentRef.current) return;

    // Effet de parallax sur le contenu
    gsap.fromTo(
      contentRef.current,
      { y: 300 },
      {
        y: -300,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  }, []);

  return (
    <div ref={containerRef} className={`${className}`}>
      <div ref={contentRef} className="max-w-xl h-full px-4 md:px-8">
        <div className="bg-black text-white p-12 shadow-2xl h-full w-full flex flex-col justify-center items-center space-y-12">
          <div className="text-center mb-8">
            <h2 className="heading-lg font-light tracking-tight mb-4 uppercase">
              En savoir plus sur nous
            </h2>
            <p className="text-zinc-100 text-md-responsive font-light">
              Recevez les dernières nouvelles sur nos conseils beauté et nos
              nouveaux produits.
            </p>
          </div>

          <form className="flex flex-col gap-4 items-center justify-center max-w-md mx-auto border-b-[0.5px] border-white w-full pb-8">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              className="flex-1 px-6 py-4 bg-zinc-950 text-white placeholder-zinc-400 border border-zinc-600 rounded-full focus:outline-none focus:border-zinc-400 text-base w-full"
            />
            <CircleButton
              href="#"
              variant="dark"
              size="large"
              className="text-zinc-800 -rotate-45 hover:text-zinc-900"
            />
          </form>

          <p className="text-center text-zinc-50 text-xs-responsive mt-8 font-thin max-w-md">
            Pas de spam, que des conseils beauté pour vous aider à être plus
            radieuse.
          </p>
        </div>
      </div>
    </div>
  );
}
