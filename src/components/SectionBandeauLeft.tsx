"use client";

import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ImageParallax from "./ImageParallax";
import { CircleButton } from "./ui/ExploreButton";
import { useToast } from "./ui/ToastContainer";

gsap.registerPlugin(ScrollTrigger, Draggable, useGSAP);

interface DraggableInstance {
  kill(): void;
  disable(): void;
  enable(): void;
  update(): void;
}

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

interface SectionBandeauLeftProps {
  products: Product[];
  loading: boolean;
  categorySlug?: string;
}

// Fonction pour générer un slug à partir du nom
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Supprimer les caractères spéciaux
    .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
    .replace(/-+/g, "-") // Remplacer les tirets multiples par un seul
    .replace(/^-+|-+$/g, "") // Supprimer les tirets en début et fin
    .trim();
};

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const { success, error } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isFavorite, toggleFavorite, isUpdating } = useFavorites();

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      error("Produit en rupture de stock");
      return;
    }
    setIsAdding(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || "/placeholder.jpg",
        slug: product.slug,
        stock: product.stock,
      });
      success(`${product.name} ajouté au panier !`);
    } catch (err) {
      console.error("Erreur lors de l'ajout au panier:", err);
      error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(product.id);
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Utiliser le slug existant s'il est propre, sinon en générer un à partir du nom
    const slug =
      product.slug && !product.slug.includes(" ")
        ? product.slug
        : generateSlug(product.name);

    if (slug) {
      router.push(`/products/${slug}`);
    }
  };

  // Prefetch la route du produit au hover
  const handleMouseEnter = () => {
    const slug =
      product.slug && !product.slug.includes(" ")
        ? product.slug
        : generateSlug(product.name);

    if (slug) {
      router.prefetch(`/products/${slug}`);
    }
  };

  useGSAP(
    () => {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 50, rotation: -4 },
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
      }
    },
    { scope: cardRef, dependencies: [index] }
  );

  return (
    <div
      ref={cardRef}
      className="min-w-[240px] max-w-[280px] sm:min-w-[280px] sm:max-w-[320px] lg:min-w-[320px] lg:max-w-[380px] w-full max-h-[420px] sm:max-h-[480px] lg:max-h-[540px] h-full rounded-2xl relative overflow-hidden cursor-grab active:cursor-grabbing select-none flex-shrink-0 group"
      onMouseEnter={handleMouseEnter}
    >
      {/* Image de fond qui prend toute la carte */}
      <div className="absolute inset-0">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            fill
            sizes="(max-width: 640px) 300px, (max-width: 768px) 340px, (max-width: 1024px) 360px, 420px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            priority
            quality={90}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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

      {/* Overlay sombre pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>

      {/* Contenu superposé */}
      <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 lg:p-6">
        {/* En-tête avec tag et icônes verticales */}
        <div className="flex justify-between items-start">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 text-xs font-medium uppercase tracking-wider rounded-full shadow-sm">
            PURE HYDRATATION
          </span>

          {/* Icônes verticales */}
          <div className="flex flex-col gap-1 sm:gap-1.5 lg:gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={isUpdating === product.id}
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              title={
                isFavorite(product.id)
                  ? "Retirer des favoris"
                  : "Ajouter aux favoris"
              }
            >
              {isUpdating === product.id ? (
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 ${isFavorite(product.id) ? "fill-current" : "fill-none"}`}
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
              )}
            </button>

            <button
              type="button"
              onClick={handleViewProduct}
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-white/90 backdrop-blur-sm hover:bg-stone-50 text-gray-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              title="Voir le produit"
            >
              <svg
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-white/90 backdrop-blur-sm hover:bg-stone-50 text-gray-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              title="Ajouter au panier"
            >
              {isAdding ? (
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5"
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
              )}
            </button>
          </div>
        </div>

        {/* Pied de carte avec nom et prix */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          <h4 className="text-white font-medium text-xs sm:text-sm lg:text-base uppercase tracking-tight flex-1 line-clamp-2 drop-shadow-lg">
            {product.name}
          </h4>
          <p className="text-white font-semibold text-sm sm:text-base lg:text-lg flex-shrink-0 drop-shadow-lg">
            {Number(product.price).toFixed(2).replace(".", ",")}€
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SectionBandeauLeft({
  products = [],
  loading,
  categorySlug = "hydratation",
}: SectionBandeauLeftProps) {
  // Détection d'appareil tactile améliorée
  const isTouchDevice = () => {
    if (typeof window === "undefined") return false;
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  };
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const draggableInstanceRef = useRef<DraggableInstance | null>(null);
  const [hydratationProducts, setHydratationProducts] = useState<Product[]>([]);

  // Filtrer les produits d'hydratation
  useEffect(() => {
    const filteredProducts = products.filter(
      (product) => product.category.slug === categorySlug
    );
    setHydratationProducts(filteredProducts);
  }, [products, categorySlug]);

  useGSAP(
    () => {
      if (sliderRef.current && sliderContainerRef.current) {
        const slider = sliderRef.current;
        const container = sliderContainerRef.current;
        const initSlider = () => {
          const cards = slider.children;
          if (cards.length === 0) {
            setTimeout(initSlider, 200);
            return;
          }

          // Sur mobile, utiliser un défilement horizontal standard
          if (isTouchDevice()) {
            // Désactiver le glissement tactile sur mobile
            if (draggableInstanceRef.current) {
              draggableInstanceRef.current.kill();
            }

            // Animation d'entrée simple
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
            return;
          }

          // Sur desktop, garder le système Draggable
          let totalWidth = 0;
          Array.from(cards).forEach((card) => {
            const cardElement = card as HTMLElement;
            const cardWidth = cardElement.offsetWidth || 380;
            totalWidth += cardWidth + 20;
          });
          const containerWidth = container.offsetWidth;
          const availableWidth = containerWidth - 64;
          const maxScroll = Math.max(0, totalWidth - availableWidth);
          if (draggableInstanceRef.current) {
            draggableInstanceRef.current.kill();
          }
          let isDragging = false;
          let dragDirection = 0;
          const draggableInstance = Draggable.create(slider, {
            type: "x",
            bounds: { minX: -maxScroll, maxX: 0 },
            inertia: {
              resistance: 50,
              minDuration: 0.3,
              maxDuration: 2,
            },
            edgeResistance: 0.9,
            dragResistance: 0.1,
            allowNativeTouchScrolling: false,
            preventDefault: true,
            onPress: function () {
              gsap.killTweensOf(slider);
              isDragging = true;
              dragDirection = 0;
            },
            onDrag: function () {
              if (!isDragging) return;
              const totalDeltaX = this.x - this.startX;
              if (Math.abs(totalDeltaX) > 5) {
                dragDirection = totalDeltaX > 0 ? 1 : -1;
                const baseRotation = 5 * dragDirection;
                const cards = slider.children;
                Array.from(cards).forEach((card) => {
                  const element = card as HTMLElement;
                  gsap.to(element, {
                    rotation: baseRotation,
                    scale: 0.9,
                    duration: 0.2,
                    transformOrigin: "center center",
                    ease: "power2.out",
                  });
                });
              }
            },
            onThrowUpdate: function () {
              if (dragDirection !== 0) {
                const cards = slider.children;
                const inertiaRotation = 8 * dragDirection;
                Array.from(cards).forEach((card) => {
                  const element = card as HTMLElement;
                  gsap.to(element, {
                    rotation: inertiaRotation,
                    scale: 0.95,
                    duration: 0.1,
                    transformOrigin: "center center",
                    ease: "power2.out",
                  });
                });
              }
            },
            onDragEnd: function () {
              isDragging = false;
              const cards = slider.children;
              Array.from(cards).forEach((card, index) => {
                gsap.to(card, {
                  rotation: 0,
                  scale: 1,
                  duration: 1,
                  delay: index * 0.02,
                  ease: "power3.out",
                });
              });
              dragDirection = 0;
            },
            onThrowComplete: function () {
              const cards = slider.children;
              Array.from(cards).forEach((card, index) => {
                gsap.to(card, {
                  rotation: 0,
                  scale: 1,
                  duration: 0.4,
                  delay: index * 0.01,
                  ease: "power3.out",
                });
              });
              dragDirection = 0;
            },
          });
          draggableInstanceRef.current = draggableInstance[0];
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
        setTimeout(initSlider, 300);
      }
    },
    { scope: containerRef, dependencies: [hydratationProducts] }
  );

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-light text-lg-responsive">
            Chargement des produits...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="flex w-full items-stretch min-h-[100vh] max-h-[140vh] h-auto pt-16 lg:pt-20 bg-white relative"
    >
      {/* Colonne gauche : ImageParallax */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden min-h-[120vh]">
        <ImageParallax
          imgParallax="/images/visage-1.jpg"
          title={null}
          subtitle={null}
        />
      </div>
      {/* Colonne droite : Slider et textes */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        {/* Slider */}
        <div className="relative flex-1 flex flex-col justify-center">
          <div className="p-8 lg:pl-16">
            <div className="flex justify-between">
              <h3 className="text-gray-900 mb-2 leading-none">
                <span className="font-thin tracking-tight heading-xxl">
                  Pure
                </span>
                <br />
                <span className="font-normal italic font-metal tracking-tight subheading-xxl">
                  Hydratation
                </span>
              </h3>
              <div className="flex items-end mb-4">
                <CircleButton
                  href={`/products?category=${categorySlug}`}
                  direction="right"
                  variant="dark"
                  size="large"
                />
              </div>
            </div>
          </div>
          <div
            ref={sliderContainerRef}
            className={`relative px-8 lg:px-16 flex-1 ${isTouchDevice() ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"}`}
          >
            <div
              ref={sliderRef}
              className={`flex gap-5 h-full items-center relative ${isTouchDevice() ? "flex-nowrap" : ""}`}
            >
              {hydratationProducts.slice(0, 6).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
          <div className="h-32 flex justify-between items-center">
            <div className="px-8 lg:px-16 text-left">
              <p className="text-gray-900 text-xs-responsive sm:text-sm-responsive md:text-base-responsive font-light leading-relaxed max-w-xs uppercase">
                Restez éclatant et en bonne santé sans avoir à y penser.
              </p>
            </div>
            <div className="px-8 lg:px-16">
              <p className="text-gray-600 text-xs-responsive uppercase">
                ← Faites glisser pour découvrir →
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
