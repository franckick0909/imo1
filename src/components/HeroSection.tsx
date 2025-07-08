"use client";

import ExploreButton from "@/components/ui/ExploreButton";
import TitleAnimationGSAP from "@/components/ui/TitleAnimationGSAP";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

// Enregistrer le plugin ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !heroRef.current ||
      !imageRef.current ||
      !overlayRef.current ||
      !contentRef.current
    )
      return;

    const hero = heroRef.current;
    const image = imageRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    const text = textRef.current;
    const button = buttonRef.current;

    // Parallax de l'image de fond
    gsap.to(image, {
      y: "30%",
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Fade de l'overlay
    gsap.to(overlay, {
      opacity: 0.4,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "80% top",
        scrub: true,
      },
    });

    // Parallax du contenu principal
    gsap.to(content, {
      opacity: 0,
      y: -50,
      scale: 0.95,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "60% top",
        scrub: true,
      },
    });

    // Animation d'entrée du texte descriptif
    if (text) {
      gsap.fromTo(
        text,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.7,
        }
      );
    }

    // Animation d'entrée du bouton
    if (button) {
      gsap.fromTo(
        button,
        { opacity: 0, scaleX: 0, autoAlpha: 0 },
        {
          opacity: 1,
          scaleX: 1,
          duration: 1,
          ease: "power2.inOut",
          delay: 1.5,
          autoAlpha: 1,
          transformOrigin: "center center",
          yoyo: true,
        },
      );
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === hero) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero-section"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Image avec parallax */}
      <div ref={imageRef} className="absolute inset-0 will-change-transform">
        <Image
          src="/images/hero.jpg"
          alt="Cosmétiques naturels de luxe"
          fill
          sizes="100vw"
          className="object-cover scale-110"
          priority
        />
      </div>

      {/* Overlay avec fade */}
      <div ref={overlayRef} className="absolute inset-0 bg-black/25" />

      {/* Contenu avec parallax */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Contenu principal centré */}
        <div className="flex-1 flex items-center justify-center">
          <div ref={contentRef} className="text-center text-white px-4">
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center flex-wrap leading-[0.95]">
              <TitleAnimationGSAP
                text="Bienveillant"
                className="text-white/60 text-[clamp(3rem,7vw,15rem)] font-semibold leading-tighter tracking-tighter text-center uppercase"
                delay={1}
                duration={0.8}
                stagger={0.08}
                splitBy="chars"
                animationType="slideUp"
                triggerStart="top 100%"
                customTrigger="#hero-section"
              />
              <TitleAnimationGSAP
                text="Envers la Nature"
                className="mb-2 text-rose-500 text-[clamp(3rem,3vw,15rem)] leading-tighter tracking-tighter text-center flex gap-2 lg:gap-4"
                delay={1.5}
                duration={0.9}
                stagger={0.06}
                splitBy="chars"
                animationType="slideRight"
                triggerStart="top 100%"
                customTrigger="#hero-section"
              />
            </div>
          </div>
        </div>

        {/* Texte descriptif en bas à gauche */}
        <div className="absolute bottom-1/4 left-4 md:left-6 lg:left-8 max-w-sm">
          <TitleAnimationGSAP
            text="Des produits authentiques qui révèlent votre beauté naturelle,
            respectueux de votre peau et de notre planète."
            className="text-white font-light leading-relaxed max-w-md text-[clamp(0.95rem,1vw,2rem)]"
            delay={1.5}
            duration={0.8}
            stagger={0.04}
            splitBy="words"
            animationType="slideLeft"
            triggerStart="top 100%"
            customTrigger="#hero-section"
          />
        </div>

        {/* Bouton en bas */}
        <div
          ref={buttonRef}
          className="flex justify-center w-full mx-auto pb-16 px-4"
        >
          <ExploreButton href="/products" variant="dark">
            Discover the Collection
          </ExploreButton>
        </div>
      </div>
    </section>
  );
}
