"use client";

import ExploreButton from "@/components/ui/ExploreButton";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(CustomEase);
gsap.registerPlugin(SplitText);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

export default function HeroLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const word1Ref = useRef<HTMLDivElement>(null);
  const word2Ref = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const insetLeftRef = useRef<HTMLDivElement>(null);
  const insetRightRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  // Refs imbriquées : [groupe][chiffre]
  const digitsGroupRef = useRef<Array<Array<HTMLDivElement | null>>>([]);

  // Les chiffres à animer (tu peux changer pour ce que tu veux)
  const numbers = [
    ["0", "0"],
    ["2", "7"],
    ["6", "5"],
    ["9", "8"],
    ["9", "9"],
  ];

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { ease: "hop" },
      onComplete: () => {},
    });

    tl.to(loaderRef.current, {
      clipPath: "inset(0 0 0 0)",
      onComplete: () => {
        tl.to(loaderRef.current, {
          clipPath: "inset(0 0 100% 0)",
        });
      },
    });

    // Animation de la barre de progression
    tl.to(
      progressFillRef.current,
      {
        scaleX: 1,
        duration: 3, // Réduit de 5 à 3 secondes
        ease: "power1.inOut",
      },
      0
    );

    // Disparition de la barre de progression une fois pleine
    tl.to(
      progressBarRef.current,
      {
        opacity: 0,
        duration: 0.2, // Réduit de 0.3 à 0.2
        ease: "power2.out",
      },
      "+=0.3" // Réduit de 0.5 à 0.3
    );

    // Animation séquentielle des groupes de chiffres
    digitsGroupRef.current.forEach((group, index) => {
      // Apparition des chiffres du groupe (ensemble, rapide)
      tl.to(
        group,
        {
          y: "0%",
          duration: 0.6, // Réduit de 1 à 0.6
          stagger: 0.05, // Réduit de 0.075 à 0.05
        },
        index * 0.6 + 0.1 // Réduit l'intervalle entre les groupes
      );

      // Disparition du groupe (ensemble, rapide)
      tl.to(
        group,
        {
          y: "-100%",
          stagger: 0.03, // Réduit de 0.05 à 0.03
        },
        index * 0.6 + 0.6 // Ajusté pour correspondre à la nouvelle durée
      );
    });

    // Animation du logo en deux parties
    if (word1Ref.current && word2Ref.current) {
      // Word-1 arrive du haut
      tl.to(
        word1Ref.current,
        {
          y: "0%",
          duration: 1.2, // Augmenté de 0.8 à 1.2
        },
        "<"
      );
      // Word-2 arrive du bas
      tl.to(
        word2Ref.current,
        {
          y: "0%",
          duration: 1.2, // Augmenté de 0.8 à 1.2
        },
        "<"
      );
    }

    tl.to(
      dividerRef.current,
      {
        scaleY: 1,
        duration: 0.6, // Augmenté de 0.3 à 0.6
        delay: 0.2, // Augmenté de 0.1 à 0.2
        ease: "power4.inOut",
      },
      "<"
    );

    // Disparition du divider vers le bas
    tl.to(dividerRef.current, {
      y: "100%",
      duration: 0.4, // Augmenté de 0.2 à 0.4
      ease: "power2.out",
    });

    // Animation des insets ET du logo vers le haut
    tl.to(
      insetLeftRef.current,
      {
        clipPath: "inset(0 0 100% 0)",
        duration: 1.0, // Augmenté de 0.6 à 1.0
      },
      "<"
    );

    tl.to(
      insetRightRef.current,
      {
        clipPath: "inset(0 0 100% 0)",
        duration: 1.2, // Augmenté de 0.7 à 1.2
      },
      "<"
    );

    tl.to(
      word1Ref.current,
      {
        y: "100%",
        duration: 0.8, // Augmenté de 0.5 à 0.8
        opacity: 0,
      },
      "<"
    );

    tl.to(
      word2Ref.current,
      {
        y: "-100%",
        duration: 0.8, // Augmenté de 0.5 à 0.8
        opacity: 0,
      },
      "<"
    );

    // Faire disparaître le loaderRef après les insets
    tl.to(
      loaderRef.current,
      {
        opacity: 0,
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => {
          // Supprimer complètement le loader du DOM
          if (loaderRef.current) {
            loaderRef.current.style.display = "none";
          }
        },
      },
      "+=0.1"
    ); // Petit délai après les insets

    // Animation de l'image qui revient à scale 1 quand les insets se relèvent
    tl.to(
      imageRef.current,
      {
        scale: 1,
        duration: 0.8, // Réduit de 1 à 0.7
        delay: 0.3, // Réduit de 0.5 à 0.3
        ease: "none",
      },
      "<"
    );

    // Animation d'entrée du HeroSection après la disparition des insets
    if (contentRef.current && buttonRef.current && overlayRef.current) {
      tl.to(overlayRef.current, { opacity: 1 }, "<");

      // Vérifier que les polices sont chargées avant de créer les splits
      const waitForFonts = () => {
        return new Promise<void>((resolve) => {
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => resolve());
          } else {
            // Fallback si document.fonts n'est pas supporté
            setTimeout(resolve, 100);
          }
        });
      };

      // Créer tous les splits après que les polices soient chargées
      waitForFonts().then(() => {
        const h1Split = contentRef.current
          ? new SplitText(contentRef.current, {
              type: "chars",
              charsClass: "char++",
            })
          : null;

        const h2Element = contentRef.current?.nextElementSibling as HTMLElement;
        const h2Split = h2Element
          ? new SplitText(h2Element, {
              type: "lines",
              linesClass: "line++",
            })
          : null;

        const paragraphSplit = paragraphRef.current
          ? new SplitText(paragraphRef.current, {
              type: "words",
              wordsClass: "word++",
            })
          : null;

        // Regrouper tous les éléments dans un tableau pour l'animation
        const allElements: gsap.TweenTarget[] = [];

        if (h1Split) allElements.push(...h1Split.chars);
        if (h2Split) allElements.push(...h2Split.lines);
        if (paragraphSplit) allElements.push(...paragraphSplit.words);

        // Animation unifiée avec stagger
        tl.fromTo(
          allElements,
          {
            y: "100%",
            opacity: 0,
            rotateY: "10deg",
          },
          {
            y: "0%",
            opacity: 1,
            rotateY: "0deg",
            duration: 0.7, // Réduit de 1 à 0.7
            stagger: 0.07, // Réduit de 0.1 à 0.07
            ease: "power4.out",
          },
          "<"
        );
      });

      tl.to(
        buttonRef.current,
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.7, // Réduit de 1 à 0.7
          delay: 0.3, // Réduit de 0.5 à 0.3
          ease: "power4.out",
        },
        "<"
      );
    }

    // Effet parallax au scroll - ajouté après les animations du loader
    if (
      imageRef.current &&
      contentRef.current &&
      buttonRef.current &&
      heroRef.current
    ) {
      // Parallax pour l'image de fond
      gsap.fromTo(
        imageRef.current,
        {
          y: -0,
        },
        {
          y: 500,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Parallax pour le contenu (plus lent)
      gsap.to(contentRef.current, {
        yPercent: -10,
        opacity: 0.4,
        scale: 0.9,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Parallax pour le bouton (encore plus lent)
      gsap.to(buttonRef.current, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "75% bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
  }, []);

  return (
    <>
      <div ref={loaderRef} className="fixed inset-0 w-full h-full flex z-50">
        {/* Overlay */}
        <div
          ref={insetLeftRef}
          style={{
            clipPath: "inset(0 0 0 0)",
          }}
          className="absolute top-0 left-0 w-[50.1%] h-full bg-[#303030]"
        />
        <div
          ref={insetRightRef}
          style={{
            clipPath: "inset(0 0 0 0)",
          }}
          className="absolute top-0 right-0 w-[50.1%] h-full bg-[#303030] z-[500]"
        />

        {/* Logo */}
        <div
          ref={logoRef}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex leading-tight overflow-hidden z-[500]"
          id="intro-logo"
        >
          <div
            ref={word1Ref}
            className="relative overflow-hidden -left-2"
            id="word-1"
            style={{
              transform: "translateY(-100%)",
              willChange: "transform",
            }}
          >
            <h1 className="text-center font-medium tracking-tight text-rose-400">
              <span className="antialiased subheading-xxxl">King</span>
            </h1>
          </div>
          <div
            ref={word2Ref}
            className="overflow-hidden"
            id="word-2"
            style={{
              transform: "translateY(100%)",
              willChange: "transform",
            }}
          >
            <h1 className="text-center text-white font-medium subheading-xxxl tracking-tight">
              <span className="antialiased">King</span>
            </h1>
          </div>
        </div>

        <div
          ref={dividerRef}
          style={{
            transform: "scaleY(0)",
            willChange: "transform",
            transformOrigin: "top center",
          }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] bg-white w-[0.5px] h-full "
          id="divider"
        />

        {/* Barre de progression */}
        <div
          ref={progressBarRef}
          className="fixed bottom-[10%] left-1/2 -translate-x-1/2 w-64 h-1 bg-white/20 rounded-full z-[500]"
          id="progress-container"
        >
          <div
            ref={progressFillRef}
            className="h-full bg-white rounded-full"
            style={{
              transform: "scaleX(0)",
              transformOrigin: "left center",
              willChange: "transform",
            }}
          />
        </div>

        {/* Compteur de chiffres */}
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] text-white font-light text-[clamp(16rem,12vw,24rem)] leading-[0.9] tracking-tighter origin-center text-center"
          id="counter"
        >
          {numbers.map((pair, i) => (
            <div
              key={i}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] flex"
              id="count"
            >
              {pair.map((digit, j) => (
                <div
                  key={j}
                  className="flex-1 pt-1 digit overflow-hidden text-center text-white"
                >
                  <div
                    ref={(el) => {
                      if (!digitsGroupRef.current[i])
                        digitsGroupRef.current[i] = [];
                      digitsGroupRef.current[i][j] = el;
                    }}
                    style={{
                      transform: "translateY(100%)",
                      willChange: "transform",
                    }}
                  >
                    <h1>{digit}</h1>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* HeroSection intégré */}
      <section
        ref={heroRef}
        id="hero-section"
        className="relative h-screen w-screen overflow-hidden"
      >
        {/* Image avec parallax */}
        <div
          ref={imageRef}
          style={{ willChange: "transform", transform: "scale(1.2)" }}
          className="absolute inset-0 will-change-transform h-screen w-screen"
        >
          <Image
            src="/images/hero.jpg"
            alt="Cosmétiques naturels de luxe"
            fill
            sizes="100vw"
            className="object-cover object-center scale-105"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>

        {/* Overlay avec fade */}
        <div
          ref={overlayRef}
          style={{ opacity: 0 }}
          className="absolute inset-0 bg-black/15"
        />

        {/* Contenu avec parallax */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Contenu principal centré */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white px-4 relative overflow-hidden">
              <div className="max-w-4xl mx-auto flex flex-col gap-4 items-center justify-center overflow-hidden">
                <h1
                  ref={contentRef}
                  className="title-line font-light text-white tracking-tighter text-[clamp(3.2rem,7vw,14rem)] uppercase leading-[0.8] overflow-hidden"
                >
                  Bienveillant
                </h1>

                <h2 className="title-line font-light text-rose-400 tracking-tight text-[clamp(2rem,4vw,15rem)] font-metal overflow-hidden leading-[0.8] pr-1">
                  Envers la Nature
                </h2>
              </div>
            </div>
          </div>

          {/* Texte descriptif en bas à gauche */}
          <div className="absolute bottom-1/4 left-4 md:left-6 lg:left-8 max-w-sm">
            <p
              ref={paragraphRef}
              className="text-white font-light max-w-md text-[clamp(0.95rem,1vw,2rem)] overflow-hidden"
            >
              Des produits authentiques qui révèlent votre beauté naturelle,
              respectueux de votre peau et de notre planète.
            </p>
          </div>

          {/* Bouton en bas */}
          <div
            ref={buttonRef}
            style={{
              opacity: 0,
              transform: "scaleX(0)",
            }}
            className="flex justify-center w-full mx-auto pb-16 px-4 relative origin-center overflow-hidden"
          >
            <ExploreButton href="/products" variant="dark">
              Discover the Collection
            </ExploreButton>
          </div>
        </div>
      </section>
    </>
  );
}
