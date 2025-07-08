"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import SophisticatedTitle from "./ui/SophisticatedTitle";

interface FeatureCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: FeatureCard[] = [
  {
    id: 1,
    title: "Transparence Radicale",
    description:
      "Aucune formule cachée, nous révélons tous nos ingrédients pour que vous sachiez exactement ce que vous appliquez.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Pureté Irréprochable",
    description:
      "Ingrédients vérifiés et libres de plus de 1800 substances douteuses. Ce que vous mettez sur votre peau compte.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Conscient & Responsable",
    description:
      "Certifié Vegan et Cruelty Free. Nos produits sont conditionnés de manière responsable et durable.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Efficacité Multi-Tâches",
    description:
      "Nos formules sont concentrées en actifs, agents anti-oxydants et réparateurs soutenus par la science.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
];

export default function FloatingCardsSection() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Animation de la fenêtre elliptique - mouvement bien visible
  const ellipseY = useTransform(scrollYProgress, [0, 1], ["-30vh", "30vh"]);

  // Animation de l'image dans le mask - mouvement inverse pour effet de flottement
  const imageY = useTransform(scrollYProgress, [0, 1], ["30vh", "-15vh"]);

  // Animation des cartes du haut - mouvement normal
  const cardsTopY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  // Animation des cartes du bas - mouvement plus important
  const cardsBottomY = useTransform(scrollYProgress, [0, 1], ["40%", "-40%"]);

  const veraY = useTransform(scrollYProgress, [0, 1], [500, -800]);

  return (
    <motion.section
      ref={containerRef}
      id="floating-cards-section"
      className="relative min-h-[100vh] sm:min-h-[120vh] lg:min-h-[140vh] xl:min-h-[190vh] bg-white overflow-hidden pt-20"
      style={{ position: "relative" }}
    >
      {/* Overlay blanc total */}
      <div className="absolute inset-0 bg-white" />

      {/* Layout Desktop lg+ - Position absolue avec cartes aux 4 coins */}

      {/* Feuille aloe vera */}
      <motion.div
        className="absolute top-1/3 right-4 sm:right-12 md:right-24 lg:right-48 w-48 h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 z-50"
        style={{ y: veraY }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/vera-1-removed.png"
            alt="Feuille aloe vera"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            className="object-cover"
          />
        </div>
      </motion.div>

      <div className="hidden lg:block">
        {/* Container avec rotation pour desktop */}
        <motion.div
          style={{ y: ellipseY }}
          className="absolute top-72 left-0 right-0 bottom-0"
        >
          {/* Ellipse rotée qui révèle l'image */}
          <motion.div
            style={{
              clipPath: "ellipse(38vw 15vw at 50% 50%)",
              transform: "rotate(-30deg)",
              width: "100%",
              height: "100%",
            }}
            className="absolute inset-0 ellipse-responsive"
          >
            <motion.div
              style={{
                y: imageY,
                transform: "rotate(30deg)",
                transformOrigin: "center center",
                width: "100%",
                height: "100%",
              }}
              className="absolute inset-0 rotate-30"
            >
              <Image
                src="/images/clippath.jpg"
                alt="Femme appliquant des soins naturels"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                className="object-cover object-center"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Cartes du haut - mouvement normal */}
        <motion.div
          style={{ y: cardsTopY }}
          className="absolute top-72 left-0 right-0 bottom-0 z-40"
        >
          <div className="relative w-full h-full px-8 lg:px-16 py-16">
            {/* Première carte - en haut à gauche */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="absolute top-[0%] left-4 lg:left-[25%] xl:left-[25%]"
            >
              <motion.div
                className="min-h-[350px] bg-zinc-100/50 backdrop-blur-xs p-8 rounded-2xl shadow-md border border-white flex flex-col justify-center"
                style={{ width: "clamp(228px, 17vw, 350px)" }}
              >
                <div className="text-center space-y-4">
                  <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-zinc-950">
                      {features[0].icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-semibold text-zinc-900 mb-3 leading-tight">
                    {features[0].title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-base text-zinc-700 leading-relaxed">
                    {features[0].description}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Deuxième carte - en haut à droite */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true }}
              className="absolute top-[50%] right-4 lg:right-[2%] xl:right-[6%]"
            >
              <motion.div
                className="min-h-[350px] bg-zinc-100/50 backdrop-blur-xs p-8 rounded-2xl shadow-md border border-white flex flex-col justify-center"
                style={{ width: "clamp(228px, 17vw, 350px)" }}
              >
                <div className="text-center space-y-4">
                  <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-zinc-950">
                      {features[1].icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-semibold text-zinc-900 mb-3 leading-tight">
                    {features[1].title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-base text-zinc-700 leading-relaxed">
                    {features[1].description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Cartes du bas - mouvement plus important */}
        <motion.div
          style={{ y: cardsBottomY }}
          className="absolute top-72 left-0 right-0 bottom-0 z-40"
        >
          <div className="relative w-full h-full px-8 lg:px-16 py-16">
            {/* Troisième carte - en bas à gauche */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute bottom-[60%] left-4 lg:left-[2%] xl:left-[6%]"
            >
              <motion.div
                className="min-h-[350px] bg-zinc-100/50 backdrop-blur-xs p-8 rounded-2xl shadow-md border border-white flex flex-col justify-center"
                style={{ width: "clamp(228px, 17vw, 350px)" }}
              >
                <div className="text-center space-y-4">
                  <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-zinc-950">
                      {features[2].icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-semibold text-zinc-900 mb-3 leading-tight">
                    {features[2].title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-base text-zinc-700 leading-relaxed">
                    {features[2].description}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Quatrième carte - en bas à droite */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
              viewport={{ once: true }}
              className="absolute bottom-[0%] right-4 lg:right-[25%] xl:right-[25%]"
            >
              <motion.div
                className="min-h-[350px] bg-zinc-100/50 backdrop-blur-xs p-8 rounded-2xl shadow-md border border-white flex flex-col justify-center"
                style={{ width: "clamp(228px, 17vw, 350px)" }}
              >
                <div className="text-center space-y-4">
                  <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-zinc-950">
                      {features[3].icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-semibold text-zinc-900 mb-3 leading-tight">
                    {features[3].title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-base text-zinc-700 leading-relaxed">
                    {features[3].description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Section Header - Visible sur tous les formats */}
      <div className="relative z-50 px-6 md:px-12 pb-16 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-left max-w-4xl"
        >
          <SophisticatedTitle
            level="h2"
            variant="hero"
            className="text-gray-900 leading-tight mb-8"
          >
            Soins de la peau propres, Responsables & Performants.
          </SophisticatedTitle>
          <p className="text-sm md:text-base text-gray-800 font-light leading-relaxed max-w-md">
            Des produits honnêtes et sans réserve qui fonctionnent vraiment, qui
            sont doux pour la peau et la planète – sans exception !
          </p>
        </motion.div>
      </div>

      {/* Section Footer - Visible sur tous les formats */}
      <div className="absolute bottom-0 left-0 right-0 z-50 inline-block w-[90%] mx-auto h-px bg-zinc-300"></div>

      {/* Layout Mobile/Tablette md- - Structure flex verticale */}
      <div className="block lg:hidden relative z-30 h-full">
        <div className="flex flex-col h-full">
          {/* Container ClipPath centré pour md- */}
          <div className="flex-shrink-0 relative h-[70vh] flex items-center justify-center">
            <motion.div
              style={{ y: ellipseY }}
              className="relative w-full h-full"
            >
              <motion.div
                style={{
                  clipPath: "inset(30% 4% 30% 4% round 25%)",
                  width: "100%",
                  height: "100%",
                }}
                className="absolute inset-0"
              >
                <motion.div
                  style={{
                    y: imageY,
                    width: "100%",
                    height: "100%",
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src="/images/clippath.jpg"
                    alt="Femme appliquant des soins naturels"
                    fill
                    sizes="(max-width: 768px) 92vw, (max-width: 1024px) 80vw, 70vw"
                    className="object-cover object-center"
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Cartes en grid en bas pour md- */}
          <div className="flex-grow pt-6 pb-16 px-4 md:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-1 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: index * 0.1,
                  }}
                  viewport={{ once: true }}
                >
                  <div className="w-full max-w-sm mx-auto min-h-[320px] md:min-h-[280px] bg-zinc-100/50 backdrop-blur-xs p-4 md:p-6 rounded-2xl border border-zinc-200 flex flex-col justify-center">
                    <div className="text-center space-y-3 md:space-y-4">
                      <div className="mb-3 md:mb-4 flex justify-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center text-zinc-950">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-zinc-900 mb-2 md:mb-3 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-zinc-700 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
