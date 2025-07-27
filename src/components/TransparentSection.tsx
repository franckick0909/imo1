"use client";

import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { CircleButton } from "./ui/ExploreButton";
import ImageAnimationGSAP from "./ui/ImageAnimationGSAP";
import TitleAnimation from "./ui/TitleAnimation";
import GSAPText from "./ui/GSAPText";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function TransparentSection() {
  const transparentRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        imageRef.current,
        {
          y: 200,
        },
        {
          y: -1000,
          ease: "none",
          scrollTrigger: {
            trigger: transparentRef.current,
            scrub: true,
            markers: false,
          },
        }
      );
    },
  );

  return (
    <section
      ref={transparentRef}
      id="transparent-section"
      className="overflow-x-hidden w-full min-h-full"
    >
      <div className="bg-zinc-100">
        {/* Titre principal imposant - Style TrueKind */}
        <div className="relative w-full h-full py-12">
          <div className="text-content text-zinc-700 px-2 lg:px-4 xl:px-8 mx-auto w-full leading-[0.8] h-full text-[clamp(3rem,11vw,20rem)]">
            {/* Première ligne - TRANSPARENCE */}
            <div className="title-line flex mb-1 lg:mb-2 text-center justify-center items-center">
              <TitleAnimation
                text="TRANSPARENCE"
                delay={0}
                duration={0.5}
                stagger={0.08}
                triggerStart="top 85%"
                as="h1"
                splitBy="chars"
                className="font-medium tracking-tight"
              />
            </div>

            {/* Deuxième ligne - RADICALE */}
            <div className="title-line flex items-center justify-evenly gap-8">
              <motion.div
                className=""
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                viewport={{ once: true }}
              >
                <CircleButton
                  href="/"
                  direction="right"
                  variant="dark"
                  size="large"
                  className="-rotate-45"
                />
              </motion.div>
              <TitleAnimation
                text="RADICALE."
                className="font-medium tracking-tight "
                delay={0.4}
                duration={0.8}
                stagger={0.12}
                triggerStart="top 85%"
                as="h1"
                splitBy="words"
              />
            </div>

            {/* Troisième ligne avec première image - RIEN À */}
            <div className="title-line flex justify-around gap-2 sm:gap-4 lg:gap-6 px-6 lg:px-12 w-full items-center">
              {/* Image avant "RIEN À" */}
              <div className="inline-block">
                <ImageAnimationGSAP
                  src="/images/creme-rose.png"
                  alt="Crème rose"
                  fill={true}
                  priority={true}
                  className="flex-shrink-0 !relative w-[clamp(4rem,8vw,12rem)] h-[clamp(4rem,6vw,12rem)]"
                  delay={0.5}
                  duration={1.2}
                  triggerStart="top 85%"
                  animationType="clipLeft"
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 128px, (max-width: 1536px) 160px, 192px"
                  customTrigger="#transparent-section"
                />
              </div>

              <div className="flex gap-4 font-thin">
                <TitleAnimation
                  text="RIEN"
                  className=" tracking-tight mr-4"
                  delay={0.4}
                  duration={0.8}
                  stagger={0.12}
                  triggerStart="top 85%"
                  as="h1"
                  splitBy="words"
                />
                <TitleAnimation
                  text="à"
                  className="font-light tracking-tight"
                  delay={0.4}
                  duration={0.8}
                  stagger={0.12}
                  triggerStart="top 85%"
                  as="h1"
                  splitBy="words"
                />
              </div>
            </div>

            {/* Quatrième ligne avec deuxième image - CACHER */}
            <div className="title-line flex justify-center sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-24">
                <TitleAnimation
                  text="CACHER."
                  className="font-medium text-gray-700 tracking-tight text-[clamp(3rem,11vw,20rem)]"
                  delay={0.5}
                  duration={0.6}
                  stagger={0.08}
                  triggerStart="top 85%"
                  as="h1"
                  splitBy="chars"
                />

                {/* Image après "CACHER" */}
                <ImageAnimationGSAP
                  src="/images/creme-verte.png"
                  alt="Crème verte"
                  fill={true}
                  className="flex-shrink-0 !relative w-[clamp(4rem,8vw,12rem)] h-[clamp(3rem,6vw,12rem)]"
                  delay={1.2}
                  duration={1.3}
                  triggerStart="top 85%"
                  animationType="clipRight"
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 128px, (max-width: 1536px) 160px, 192px"
                  customTrigger="#transparent-section"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image parallax */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            ref={imageRef}
            className="absolute left-1/4 md:left-8 top-3/4 w-1/2 h-1/2"
          >
            <Image
              src="/images/creme-rouge.png"
              alt="Crème rouge"
              fill
              className="object-contain object-center"
              sizes="(max-width: 1024px) 256px, 320px"
              priority
            />
          </div>
        </div>

        {/* Section des valeurs et descriptions - Style TrueKind */}
        <div className="relative py-16 lg:py-24 w-full">
          <div className="flex justify-center lg:justify-end w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full lg:w-1/2 max-w-3xl space-y-8 grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 lg:gap-12 leading-none">
              {/* 100% Transparent */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 lg:w-8 lg:h-8 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <div>
                  <GSAPText>
                  <h3 className="heading-md font-medium text-gray-900 mb-1 tracking-tight font-metal">
                    100% Transparentes.
                  </h3>
                  </GSAPText>
                  <GSAPText>
                    <p className="text-sm-responsive font-normal text-gray-600">
                      Formules 100% transparentes.
                    </p>
                  </GSAPText>
                </div>
              </div>

              {/* Only Verified Ingredients */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 lg:w-8 lg:h-8 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <GSAPText delay={0.5} duration={0.5} stagger={0.08}>
                  <h3 className="heading-md font-medium text-gray-900 mb-1 tracking-tight font-metal">
                    Ingrédients vérifiés.
                  </h3>
                  </GSAPText>
                  <GSAPText >
                  <p className="text-sm-responsive font-normal text-gray-600">
                    Nous formulons selon les normes les plus élevées
                    d&apos;éfficacité et de sécurité en utilisant uniquement des
                    ingrédients approuvés et vérifiés dans des bases
                    biocompatibles, et exempts de plus de 1800 ingrédients
                    douteux.
                  </p>
                  </GSAPText>
                </div>
              </div>

              {/* Highest Standards */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 lg:w-8 lg:h-8 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="heading-md font-medium text-gray-900 mb-1 tracking-tight font-metal">
                    Les meilleurs standards.
                  </h3>
                  <p className="text-sm-responsive font-normal text-gray-600">
                    Des résultats réels grâce à des formules soignées qui
                    respectent l&apos;équilibre naturel de votre épiderme.
                  </p>
                </div>
              </div>

              {/* Real Results */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 lg:w-8 lg:h-8 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="heading-md font-medium text-gray-900 mb-1 tracking-tight font-metal">
                    Des résultats réels.
                  </h3>
                  <p className="text-sm-responsive font-normal text-gray-600">
                    Des soins de la peau riches en antioxydants, en agents
                    régénérants et restaurateurs de la peau, aux niveaux de pH
                    instables qui ne promettent pas de miracles, mais donnent de
                    vrais résultats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}