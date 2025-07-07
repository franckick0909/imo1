"use client";

import ExploreButton from "@/components/ui/ExploreButton";
import TitleAnimation from "@/components/ui/TitleAnimation";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  // Configuration du parallax simplifiée
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.6], [0, -50]);
  const textScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  return (
    <motion.section
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Image avec parallax */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y }}
      >
        <Image
          src="/images/hero.jpg"
          alt="Cosmétiques naturels de luxe"
          fill
          sizes="100vw"
          className="object-cover scale-110"
          priority
        />
      </motion.div>

      {/* Overlay avec fade */}
      <motion.div
        className="absolute inset-0 bg-black/25"
        style={{ opacity: overlayOpacity }}
      />

      {/* Contenu avec parallax */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Contenu principal centré */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center text-white px-4"
            style={{
              opacity: textOpacity,
              y: textY,
              scale: textScale,
            }}
          >
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center flex-wrap leading-[0.95]">
              <TitleAnimation
                text="Bienveillant"
                className="text-white/50 text-[clamp(3rem,7vw,15rem)] font-semibold leading-tighter tracking-tighter text-center uppercase"
                delay={0.3}
                duration={0.8}
                stagger={0.15}
                triggerStart="top 80%"
                splitBy="words"
              />
              <TitleAnimation
                text="Envers la Nature"
                className="mb-2 text-white/60 text-[clamp(3rem,6vw,15rem)] font-light leading-tighter tracking-tighter text-center font-cormorant flex gap-2 lg:gap-4"
                delay={0.3}
                duration={0.8}
                stagger={0.15}
                triggerStart="top 80%"
                splitBy="words"
              />
            </div>
          </motion.div>
        </div>

        {/* Texte descriptif en bas à gauche */}
        <motion.div
          className="absolute bottom-1/4 left-4 md:left-6 lg:left-8 max-w-sm"
          style={{
            opacity: textOpacity,
            y: textY,
            scale: textScale,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
        >
          <p className="text-white font-light leading-relaxed max-w-md text-[clamp(0.95rem,1vw,2rem)]">
            Des produits authentiques qui révèlent votre beauté naturelle,
            respectueux de votre peau et de notre planète.
          </p>
        </motion.div>

        {/* Bouton en bas */}
        <motion.div
          className="flex justify-center w-full mx-auto pb-16 px-4"
          style={{
            opacity: textOpacity,
            y: textY,
            scale: textScale,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
        >
          <ExploreButton href="/products" variant="dark">
            Discover the Collection
          </ExploreButton>
        </motion.div>
      </div>
    </motion.section>
  );
}
