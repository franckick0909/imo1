"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { useToast } from "./ui/ToastContainer";

gsap.registerPlugin(ScrollTrigger, Draggable, useGSAP);

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice?: number;
  stock: number;
  slug: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    alt?: string | null;
    position: number;
  }[];
}

interface PurificationSectionProps {
  products: Product[];
  loading: boolean;
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const handleAddToCart = async () => {
    try {
      // Logique d'ajout au panier
      showToast({
        type: "success",
        message: `${product.name} a été ajouté au panier`,
      });
    } catch {
      showToast({
        type: "error",
        message: "Impossible d'ajouter le produit au panier",
      });
    }
  };

  useGSAP(
    () => {
      if (cardRef.current) {
        // Animation d'entrée pour chaque carte
        gsap.fromTo(
          cardRef.current,
          {
            opacity: 0,
            y: 50,
            rotation: -4,
          },
          {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 1.5,
            delay: index * 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );

        // Animation hover
        const card = cardRef.current;

        const handleMouseEnter = () => {
          gsap.to(card, {
            y: -4,
            rotation: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            y: 0,
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        };

        card.addEventListener("mouseenter", handleMouseEnter);
        card.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          card.removeEventListener("mouseenter", handleMouseEnter);
          card.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    },
    { scope: cardRef, dependencies: [index] }
  );

  return (
    <div
      ref={cardRef}
      className="min-w-[240px] max-w-[280px] sm:min-w-[280px] sm:max-w-[320px] lg:min-w-[320px] lg:max-w-[380px] w-full max-h-[420px] sm:max-h-[480px] lg:max-h-[540px] h-full bg-green-500/30 rounded-2xl px-3 py-4 sm:px-4 sm:py-6 flex flex-col justify-between gap-3 sm:gap-4 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
    >
      {/* Badge et bouton panier */}
      <div className="flex justify-between items-center">
        <span className="bg-white text-gray-600 px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 text-xs font-medium uppercase tracking-wider rounded-full">
          PURE PURIFICATION
        </span>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white hover:bg-gray-50 text-gray-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          title="Ajouter au panier"
        >
          <svg
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"
            />
          </svg>
        </button>
      </div>

      {/* Image produit */}
      <div className="relative flex-1 rounded-lg overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            fill
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 380px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info produit */}
      <div className="flex items-center justify-between gap-4 sm:gap-6 lg:gap-20">
        <h4 className="text-gray-600 font-normal text-sm sm:text-base uppercase tracking-tight">
          {product.name}
        </h4>
        <p className="text-gray-700 font-normal text-base sm:text-lg">
          €{product.price.toFixed(0)}
        </p>
      </div>
    </div>
  );
}

export default function PurificationSection({
  products,
  loading,
}: PurificationSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const draggableInstanceRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useGSAP(
    () => {
      // Parallax désactivé pour le container - utilise le parallax global de la page
      // if (containerRef.current) {
      //   gsap.to(containerRef.current, {
      //     y: "-15%",
      //     ease: "none",
      //     scrollTrigger: {
      //       trigger: containerRef.current,
      //       start: "top bottom",
      //       end: "bottom top",
      //       scrub: 1,
      //     },
      //   });
      // }

      // Parallax GSAP pour l'image uniquement
      if (imageRef.current && containerRef.current) {
        gsap.to(imageRef.current, {
          y: "-28%", // Parallax plus intense avec la marge de 140vh, cohérent avec HydratationSection
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1, // Scrub équilibré entre fluidité et réactivité
          },
        });
      }

      if (sliderRef.current && sliderContainerRef.current) {
        const slider = sliderRef.current;
        const container = sliderContainerRef.current;

        // Attendre que les cartes soient complètement rendues
        const initSlider = () => {
          const cards = slider.children;
          console.log(
            "Initialisation du slider - Nombre de cartes:",
            cards.length
          );

          if (cards.length === 0) {
            console.log("Aucune carte trouvée, retry dans 200ms");
            setTimeout(initSlider, 200);
            return;
          }

          // Calculer la largeur totale du slider
          let totalWidth = 0;
          Array.from(cards).forEach((card) => {
            const cardElement = card as HTMLElement;
            const cardWidth = cardElement.offsetWidth || 380; // Fallback à 380px
            totalWidth += cardWidth + 20; // 20px d'espacement (moitié moins)
          });

          const containerWidth = container.offsetWidth;
          // Soustraire le padding du conteneur (64px de chaque côté pour lg:px-16) pour que la dernière carte respecte le même padding
          const availableWidth = containerWidth - 64; // 64px de padding à droite sur desktop
          const maxScroll = Math.max(0, totalWidth - availableWidth);

          console.log(
            "Total width:",
            totalWidth,
            "Container width:",
            containerWidth,
            "Available width:",
            availableWidth,
            "Max scroll:",
            maxScroll
          );

          // Détruire l'instance existante si elle existe
          if (draggableInstanceRef.current) {
            draggableInstanceRef.current.kill();
          }

          // Variables pour gérer la rotation fluide
          let isDragging = false;
          let dragDirection = 0;

          // Draggable GSAP pour le slider
          const draggableInstance = Draggable.create(slider, {
            type: "x",
            bounds: { minX: -maxScroll, maxX: 0 },
            inertia: {
              resistance: 50, // Résistance réduite pour plus de fluidité
              minDuration: 0.3, // Durée minimale d'inertie
              maxDuration: 2, // Durée maximale d'inertie
            },
            edgeResistance: 0.9, // Résistance aux bords plus élevée
            dragResistance: 0.1, // Résistance de drag très faible pour plus de fluidité
            allowNativeTouchScrolling: false, // Meilleur contrôle sur mobile
            onPress: function () {
              // Arrêter toute animation en cours lors du press
              gsap.killTweensOf(slider);
              isDragging = true;
              dragDirection = 0;
            },
            onDrag: function () {
              if (!isDragging) return;

              // Détecter la direction basée sur le déplacement depuis le début du drag
              const totalDeltaX = this.x - this.startX;

              // Définir la direction et maintenir une rotation stable
              if (Math.abs(totalDeltaX) > 5) {
                // Seuil minimum pour éviter les micro-mouvements
                dragDirection = totalDeltaX > 0 ? 1 : -1;

                // Rotation fixe basée sur la direction - reste stable pendant tout le drag
                const baseRotation = 5 * dragDirection; // 12 degrés fixes dans la direction du mouvement

                const cards = slider.children;
                Array.from(cards).forEach((card) => {
                  const element = card as HTMLElement;

                  gsap.to(element, {
                    rotation: baseRotation,
                    scale: 0.9, // Réduction des cartes pendant le drag
                    duration: 0.2,
                    transformOrigin: "center center",
                    ease: "power2.out",
                  });
                });
              }
            },
            onThrowUpdate: function () {
              // Maintenir la rotation pendant l'inertie si on a une direction
              if (dragDirection !== 0) {
                const cards = slider.children;
                const inertiaRotation = 8 * dragDirection; // Rotation plus douce pendant l'inertie

                Array.from(cards).forEach((card) => {
                  const element = card as HTMLElement;

                  gsap.to(element, {
                    rotation: inertiaRotation,
                    scale: 0.95, // Scale légèrement plus grand pendant l'inertie
                    duration: 0.1,
                    transformOrigin: "center center",
                    ease: "power2.out",
                  });
                });
              }
            },
            onDragEnd: function () {
              isDragging = false;

              // Remettre les rotations et le scale à la normale avec animation fluide SANS élasticité
              const cards = slider.children;
              Array.from(cards).forEach((card, index) => {
                gsap.to(card, {
                  rotation: 0,
                  scale: 1, // Retour au scale normal
                  duration: 1,
                  delay: index * 0.02, // Petit délai échelonné pour effet vague
                  ease: "power3.out", // Easing doux sans bounce
                });
              });

              // Reset de la direction
              dragDirection = 0;
            },
            onThrowComplete: function () {
              // Animation finale au repos - toutes ensemble SANS élasticité
              const cards = slider.children;
              Array.from(cards).forEach((card, index) => {
                gsap.to(card, {
                  rotation: 0,
                  scale: 1, // Retour au scale normal
                  duration: 0.4,
                  delay: index * 0.01,
                  ease: "power3.out", // Easing doux sans bounce
                });
              });

              dragDirection = 0;
            },
          });

          // Stocker l'instance pour pouvoir la détruire plus tard
          draggableInstanceRef.current = draggableInstance[0];

          console.log("Draggable créé avec succès:", draggableInstance);

          // Animation d'entrée du slider
          gsap.fromTo(
            slider,
            { x: 200, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 1.2,
              ease: "power4.out",
              scrollTrigger: {
                trigger: container,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        };

        // Démarrer l'initialisation
        setTimeout(initSlider, 300);
      }
    },
    { scope: containerRef, dependencies: [products] }
  ); // Ajouter products comme dépendance

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-light text-lg">
            Chargement des produits...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id="purification-section"
      className="relative overflow-hidden min-h-[100vh] max-h-[140vh] h-auto"
    >
      {/* Main Content - Slider gauche + Image droite (inversé) */}
      <div className="relative w-full min-h-[100vh]">
        {/* Slider à gauche */}
        <div className="absolute left-0 lg:right-[50%] top-0 lg:left-0 right-0 h-full  flex flex-col z-5">
          {/* Header du slider */}
          <div className="p-8 lg:pr-16">
            <h3 className="text-4xl lg:text-5xl font-light text-gray-900 mb-2">
              Pure <br />
              <span className="font-medium font-pinyon text-5xl  md:text-6xl lg:text-7xl">
                Purification
              </span>
            </h3>
          </div>

          {/* Container du slider - hauteur ajustée */}
          <div
            ref={sliderContainerRef}
            className="overflow-hidden relative px-8 lg:px-16 flex-1"
          >
            <div ref={sliderRef} className="flex gap-5 h-full items-center">
              {products.slice(0, 6).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>

          {/* Section des textes - hauteur fixe */}
          <div className="h-32 flex justify-between items-center">
            {/* Texte descriptif */}
            <div className="px-8 lg:px-16 text-left">
              <p className="text-gray-900 text-base font-light leading-relaxed max-w-xs uppercase">
                Purifiez votre peau en profondeur avec nos soins experts.
              </p>
            </div>

            {/* Indication de drag */}
            <div className="px-8 lg:px-16">
              <p className="text-gray-600 text-xs uppercase">
                ← Faites glisser pour découvrir →
              </p>
            </div>
          </div>
        </div>

        {/* Image droite avec parallax GSAP */}
        <div className="absolute right-0 top-0 w-full lg:w-1/2 h-full overflow-hidden z-10 hidden lg:block">
          <div ref={imageRef} className="relative w-full min-h-[140vh] top-0">
            <Image
              src="/images/visage-2.jpg"
              alt="Pure Purification"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
