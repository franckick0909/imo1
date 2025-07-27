"use client";

import InstagramButton from "@/components/ui/InstagramButton";
import { useElementSize } from "@/hooks/useElementSize";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import GSAPMosaicRevealImage from "./ui/GSAPMosaicRevealImage";

gsap.registerPlugin(ScrollTrigger);

export default function ConnectWithUsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const instagramRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Animation du titre
  useGSAP(
    () => {
      if (!titleRef.current) return;
      gsap.fromTo(
        titleRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { dependencies: [] }
  );

  // Animation de l'image principale
  useGSAP(
    () => {
      if (!mainImageRef.current) return;
      gsap.fromTo(
        mainImageRef.current,
        {
          opacity: 1,
          scale: 0.9,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: mainImageRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { dependencies: [] }
  );

  // Animation du texte Instagram
  useGSAP(
    () => {
      if (!instagramRef.current) return;
      gsap.fromTo(
        instagramRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.4,
          scrollTrigger: {
            trigger: instagramRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { dependencies: [] }
  );

  // Animation du texte en bas
  useGSAP(
    () => {
      if (!textRef.current) return;
      gsap.fromTo(
        textRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.6,
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { dependencies: [] }
  );

  // Animation parallax des images latérales
  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (leftImageRef.current) {
        gsap.fromTo(
          leftImageRef.current,
          {
            y: "30vh",
          },
          {
            y: "-30vh",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              scrub: 0.5,
              start: "top bottom",
              end: "bottom top",
            },
          }
        );
      }
      if (rightImageRef.current) {
        gsap.fromTo(
          rightImageRef.current,
          {
            y: "30vh",
          },
          {
            y: "-30vh",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              scrub: 0.5,
              start: "top bottom",
              end: "bottom top",
            },
          }
        );
      }
    },
    { dependencies: [] }
  );

  const [mainImageContainerRef, mainImageSize] =
    useElementSize<HTMLDivElement>();

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center py-56 lg:py-72"
    >
      {/* Image de gauche - parallax */}
      <div
        ref={leftImageRef}
        className="hidden lg:block absolute left-28 top-1/4 transform -translate-y-1/2 w-64 h-80 z-10"
        style={{ position: "absolute" }}
      >
        <div className="relative w-full h-full">
          <GSAPMosaicRevealImage
            src="/images/connect-gauche.jpg"
            alt="Femme appliquant des soins"
            rows={6}
            cols={4}
            width={300}
            height={400}
            className="object-cover"
          />
        </div>
      </div>
      {/* Texte en bas à gauche */}
      <div
        ref={textRef}
        className="absolute bottom-[10%] xl:bottom-[30%] xl:left-28 text-left max-w-sm"
        style={{ position: "absolute" }}
      >
        <p className="text-base-responsive text-gray-600 leading-relaxed">
          Recevez les dernières nouvelles sur les conseils de soins et les
          nouveaux produits.
        </p>
      </div>

      {/* Image de droite - parallax */}
      <div
        ref={rightImageRef}
        className="hidden lg:block absolute right-8 bottom-0 transform -translate-y-1/2  z-10"
        style={{ position: "absolute" }}
      >
        <div className="relative w-full h-full">
          <GSAPMosaicRevealImage
            src="/images/connect-droit.jpg"
            alt="Deux femmes"
            rows={6}
            cols={4}
            width={400}
            height={300}
            className="object-cover"
          />
        </div>
      </div>

      {/* Contenu central */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-6 tracking-tight leading-none">
        {/* Titre principal */}
        <div className="text-center max-w-4xl mx-auto">
          <h2
            ref={titleRef}
            className="absolute -top-24 left-1/2 transform -translate-x-1/2 subheading-xxl font-normal text-gray-900 tracking-tight leading-[0.9] mb-8 uppercase z-10"
            style={{ position: "absolute" }}
          >
            <span>connectez</span>
            <br />
            <span className="text-gray-900">vous</span>
          </h2>
        </div>

        {/* Image principale centrale */}
        <div
          ref={mainImageContainerRef}
          className="relative mx-auto mb-8 w-[clamp(460px,55vw,66rem)] h-auto max-w-4xl aspect-square"
        >
          {mainImageSize.width > 0 && mainImageSize.height > 0 && (
            <div ref={mainImageRef} className="w-full h-full">
              <GSAPMosaicRevealImage
                src="/images/visage-3.jpg"
                alt="Portrait de femme"
                rows={8}
                cols={6}
                width={mainImageSize.width}
                height={mainImageSize.height}
                className="rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Texte "on instagram" */}
        <div ref={instagramRef} className="text-center max-w-4xl mx-auto">
          <div className="absolute -top-48 left-1/2 transform -translate-x-1/2 font-medium italic font-metal tracking-tight text-[clamp(5rem,6vw,8rem)] z-10 font-metal text-gray-900 leading-[0.6]">
            <p className="">sur</p>
            <p className="">instagram</p>
          </div>

          {/* Bouton Instagram */}
          <div className="mt-36">
            <InstagramButton
              href="https://instagram.com"
              className="w-full max-w-96 mx-auto border-[0.5px] border-zinc-300"
              variant="dark"
            >
              INSTAGRAM
            </InstagramButton>
          </div>
        </div>
      </div>
    </section>
  );
}
