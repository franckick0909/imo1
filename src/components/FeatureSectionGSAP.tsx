import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import SophisticatedTitle from "./ui/SophisticatedTitle";

// Enregistrer le plugin ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    title: "Ingrédients Purs",
    subtitle: "Au-delà de tout reproche",
    description:
      "Vraiment propres avec seulement des ingrédients vérifiés, exempts de plus de 1800 ingrédients douteux. Ce que vous appliquez sur votre peau compte.",
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
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    position: "top-left",
    delay: 0.2,
  },
  {
    title: "Transparence Radicale",
    subtitle: "Rien à cacher",
    description:
      "Pas de boîtes noires, rien à cacher, nous divulguons nos formules complètes, vous ne devrez jamais deviner ce qu'il y a dedans et en quelle quantité.",
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
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 616 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
    position: "top-right",
    delay: 0.2,
  },
  {
    title: "Puissant & Polyvalent",
    subtitle: "Résultats réels",
    description:
      "Nos formules regorgent d'actifs, d'antioxydants et d'agents réparateurs soutenus par la science dermique qui visent à offrir des résultats réels.",
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
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    position: "bottom-left",
    delay: 0.2,
  },
  {
    title: "Conscient & Responsable",
    subtitle: "Certifié végan",
    description:
      "Certifié végan et sans cruauté par PETA. Nos produits sont toujours emballés dans des emballages responsables et fabriqués de manière durable.",
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
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
    position: "bottom-right",
    delay: 0.2,
  },
];

export default function FeatureSectionGSAP() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const clipPathRef = useRef<HTMLDivElement>(null);
  const clipPathImageRef = useRef<HTMLDivElement>(null);
  const featuresRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = containerRef.current;
    const image = imageRef.current;
    const clipPath = clipPathRef.current;
    const clipPathImage = clipPathImageRef.current;

    if (!container || !image || !clipPath) return;

    // Contexte GSAP pour nettoyer les animations
    const ctx = gsap.context(() => {
      // Animation de l'image centrale - Container principal
      gsap.to(image, {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // Animation du clip-path - Mouvement subtil comme TrueKind
      gsap.to(clipPath, {
        y: 100,
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: 2.5,
        },
      });

      // Animation de l'image dans le clip-path - Effet parallax marqué
      if (clipPathImage) {
        gsap.to(clipPathImage, {
          y: -300,
          scale: 1.2,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }

      // Animation des features avec ScrollTrigger - Desktop uniquement
      const mediaQuery = window.matchMedia("(min-width: 1280px)"); // xl breakpoint

      if (mediaQuery.matches) {
        featuresRefs.current.forEach((feature, index) => {
          if (!feature) return;

          const featureData = features[index];
          let yMovement = 0;

          // Définir le mouvement selon la position - Plus rapide que l'image clip-path
          switch (featureData.position) {
            case "top-left":
              yMovement = -500; // Plus rapide et plus ample
              break;
            case "top-right":
              yMovement = 450; // Variation subtile
              break;
            case "bottom-left":
              yMovement = -500; // Mouvement inverse
              break;
            case "bottom-right":
              yMovement = 450; // Plus léger
              break;
          }

          // Animation d'apparition simple une seule fois
          gsap.fromTo(
            feature,
            {
              opacity: 0,
              y: 30,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: featureData.delay,
              ease: "power2.out",
            }
          );

          // Animation de parallax rapide - Plus vite que l'image clip-path (-400px)
          gsap.to(feature, {
            y: yMovement,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.3, // Plus rapide que l'image (0.8) pour effet de vitesse
            },
          });
        });
      }

      // Animation du titre avec effet de type machine à écrire
      const titleElement = container.querySelector(".section-title");
      if (titleElement) {
        gsap.fromTo(
          titleElement,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: titleElement,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Animation du bouton avec effet élastique
      const button = container.querySelector(".explore-button");
      if (button) {
        gsap.fromTo(
          button,
          { opacity: 0, y: 30, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: 0.3,
            ease: "elastic.out(1, 0.5)",
            scrollTrigger: {
              trigger: button,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, container);

    return () => ctx.revert(); // Nettoyage des animations
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden min-h-[200vh] w-full h-full relative"
    >
      <div className="w-full px-6 lg:px-12">
        <div className="text-center mb-20 section-title">
          <SophisticatedTitle
            level="h2"
            variant="section"
            className="text-gray-900 mb-6"
          >
            Propre Conscient Performance
          </SophisticatedTitle>
          <p className="text-xl text-gray-600 font-light max-w-4xl mx-auto leading-relaxed">
            Des produits véritablement honnêtes qui fonctionnent, respectueux de
            la peau et de la planète – sans exception !
          </p>
        </div>

        {/* Layout responsive avec image et étiquettes */}
        <div className="w-full">
          {/* Layout desktop - Absolute positioning */}
          <div className="hidden xl:block relative w-full h-[120vh]">
            {/* Grande image centrale avec GSAP parallax - Desktop */}
            <div
              ref={imageRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[78vw] h-[150vh] z-10"
            >
              {/* Masque clip-path animé avec GSAP */}
              <div
                ref={clipPathRef}
                className="w-full h-full absolute inset-0 overflow-hidden"
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{
                    clipPath: "ellipse(25% 40% at 50% 50%)",
                    filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))",
                    transform: "rotate(30deg)",
                  }}
                >
                  <div ref={clipPathImageRef} className="w-full h-full">
                    <Image
                      src="/images/clippath.jpg"
                      alt="Cosmétiques naturels premium"
                      fill
                      className="object-cover object-center -rotate-30 scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
                </motion.div>
              </div>
            </div>

            {/* Étiquettes en absolute - Desktop uniquement */}
            {features.map((feature, index) => {
              const positions: Record<string, string> = {
                "top-left": "absolute xl:top-32 xl:left-72 2xl:top-28 2xl:left-96",
                "top-right": "absolute xl:bottom-0 xl:-right-4 2xl:bottom-96 2xl:right-16",
                "bottom-left": "absolute xl:bottom xl:-left-4 2xl:bottom-96 2xl:left-16",
                "bottom-right": "absolute xl:bottom-48 xl:right-72 2xl:bottom-48 2xl:right-96",
              };

              return (
                <div
                  key={feature.title}
                  ref={(el) => {
                    featuresRefs.current[index] = el;
                  }}
                  className={`${positions[feature.position]} z-20`}
                >
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 w-72">
                    {/* Contenu vertical comme TrueKind */}
                    <div className="text-center">
                      {/* Icône en haut */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-lg">
                          {feature.icon}
                        </div>
                      </div>

                      {/* Titre principal */}
                      <h3 className="font-bold text-gray-900 text-xl mb-2 leading-tight">
                        {feature.title}
                      </h3>

                      {/* Sous-titre */}
                      <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4 opacity-90">
                        {feature.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-gray-600 text-base leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layout mobile/tablet - Flex vertical */}
          <div className="xl:hidden flex flex-col items-center gap-16">
            {/* Image responsive - Devient ronde/carrée */}
            <div className="w-[600px] h-[600px] md:w-[600px] md:h-[600px] relative">
              <motion.div
                className="w-full h-full absolute inset-0 overflow-hidden"
                style={{
                  clipPath: "circle(50%)", // Rond sur mobile/tablet
                  filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))",
                }}
              >
                <Image
                  src="/images/clippath.jpg"
                  alt="Cosmétiques naturels premium"
                  fill
                  className="object-cover object-center scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
              </motion.div>
            </div>

            {/* Étiquettes en grid responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 px-4 max-w-4xl">
              {features.map((feature) => (
                <div key={feature.title} className="w-full">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
                    {/* Contenu vertical comme TrueKind */}
                    <div className="text-center">
                      {/* Icône en haut */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-lg">
                          {feature.icon}
                        </div>
                      </div>

                      {/* Titre principal */}
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-2 leading-tight">
                        {feature.title}
                      </h3>

                      {/* Sous-titre */}
                      <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4 opacity-90">
                        {feature.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton avec animation GSAP - Toujours en bas */}
        <div className="text-center mt-16 xl:mt-32 relative z-20 explore-button">
          <Link
            href="/products"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/70 to-emerald-600/70 text-white px-12 py-4 rounded-full font-medium uppercase tracking-wider hover:from-emerald-600/70 hover:to-emerald-700/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>Explorer</span>
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </motion.svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
