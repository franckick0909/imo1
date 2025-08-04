"use client";

import { CircleButton } from "@/components/ui/ExploreButton";
import { useToast } from "@/components/ui/ToastContainer";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { Category, Product, getCategories, getProducts } from "@/lib/actions";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger, Draggable, useGSAP);

// Fonction pour obtenir le titre de la catégorie
const getCategoryTitle = (categorySlug: string) => {
  switch (categorySlug) {
    case "hydratation":
      return "Pour une hydratation profonde et durable";
    case "purification":
      return "Pour une peau purifiée et équilibrée";
    case "anti-age":
      return "Pour préserver la jeunesse de votre peau";
    case "soins-mains":
      return "Pour des mains douces et soignées";
    case "soins-visage":
      return "Pour un teint éclatant et sain";
    case "protection-solaire":
      return "Pour protéger votre peau du soleil";
    default:
      return "Pour une peau éclatante et saine";
  }
};

// Fonction pour obtenir le label de la catégorie
const getCategoryLabel = (categorySlug: string) => {
  switch (categorySlug) {
    case "hydratation":
      return "HYDRATATION";
    case "purification":
      return "PURIFICATION";
    case "anti-age":
      return "ANTI-ÂGE";
    case "soins-mains":
      return "SOINS DES MAINS";
    case "soins-visage":
      return "SOINS DU VISAGE";
    case "protection-solaire":
      return "PROTECTION SOLAIRE";
    default:
      return categorySlug.toUpperCase();
  }
};

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

interface DraggableInstance {
  kill(): void;
  disable(): void;
  enable(): void;
  update(): void;
}

interface ProductsClientWithServerActionsProps {
  searchParams: Promise<{ category?: string }>;
}

// Composant ProductCard optimisé (basé sur SectionBandeauRight)
function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const { success, error } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isFavorite, toggleFavorite, isUpdating } = useFavorites();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

    console.log("Produit:", product.name);
    console.log("Slug original:", product.slug);
    console.log("Slug généré:", slug);

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
      // Utiliser l'API native de Next.js pour le prefetch
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
      data-card
      className={`w-[clamp(260px,22vw,360px)] h-[420px] sm:h-[430px] lg:h-[450px] xl:h-[480px] 2xl:h-[540px] rounded-2xl relative overflow-hidden cursor-grab active:cursor-grabbing select-none flex-shrink-0 group`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Image de fond qui prend toute la carte */}
      <div className="absolute inset-0">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            fill
            sizes="(max-width: 640px) 320px, (max-width: 1024px) 380px, (max-width: 1280px) 450px, 500px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 text-gray-400"
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
      <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 lg:p-5">
        {/* En-tête avec tag et icônes verticales */}
        <div className="flex justify-between items-start">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-2 text-xs xl:text-sm font-normal uppercase tracking-wider rounded-full shadow-sm">
            {getCategoryLabel(product.category.slug)}
          </span>

          {/* Icônes verticales */}
          <div className="flex flex-col gap-1 sm:gap-1.5 lg:gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={isUpdating === product.id}
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
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
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
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
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={isAdding || product.stock === 0}
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-white/90 backdrop-blur-sm hover:bg-stone-50 text-gray-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
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
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Pied de carte avec nom et prix */}
        <div className="flex items-center justify-between gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          <h4 className="text-white font-light text-sm-responsive uppercase tracking-tight flex-1 line-clamp-2 drop-shadow-lg">
            {product.name}
          </h4>
          <p className="text-white font-normal text-base-responsive flex-shrink-0 drop-shadow-lg">
            {Number(product.price).toFixed(2).replace(".", ",")}€
          </p>
        </div>
      </div>
    </div>
  );
}

// Composant CategorySection avec slider draggable
function CategorySection({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableInstanceRef = useRef<DraggableInstance | null>(null);

  const categoryProducts = products.filter(
    (product) => product.category.slug === category.slug
  );

  const getCategoryDescription = (categorySlug: string) => {
    switch (categorySlug) {
      case "hydratation":
        return "Hydratation profonde et durable pour tous types de peau";
      case "purification":
        return "Nettoyage en douceur sans agression";
      case "anti-age":
        return "Soins anti-âge ciblés et efficaces";
      case "soins-mains":
        return "Protection et soins spécialisés pour les mains";
      case "soins-corps":
        return "Soins complets pour le corps";
      case "protection-solaire":
        return "Protection solaire haute performance";
      default:
        return "Découvrez nos soins spécialisés";
    }
  };

  // Détection d'appareil tactile améliorée
  const isTouchDevice = () => {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  };

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
          let totalWidth = 0;
          Array.from(cards).forEach((card) => {
            const cardElement = card as HTMLElement;
            const cardWidth = cardElement.offsetWidth || 320;
            totalWidth += cardWidth + 16; // Espacement entre cards (gap-4 = 16px)
          });
          const containerWidth = container.offsetWidth;
          const availableWidth = containerWidth - 32; // Réduire la marge
          const maxScroll = Math.max(0, totalWidth - availableWidth);
          if (draggableInstanceRef.current) {
            draggableInstanceRef.current.kill();
          }
          let isDragging = false;
          let dragDirection = 0;

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
    { scope: containerRef, dependencies: [categoryProducts] }
  );

  const handleArrowClick = (direction: "left" | "right") => {
    if (!sliderRef.current || !draggableInstanceRef.current) return;

    const slider = sliderRef.current;
    const currentX = gsap.getProperty(slider, "x") as number;

    // Utiliser la largeur réelle de la première card
    const firstCard = slider.querySelector("[data-card]") as HTMLElement;
    const cardWidth = firstCard?.offsetWidth || 320;
    const moveDistance =
      direction === "left" ? cardWidth + 16 : -(cardWidth + 16);

    gsap.to(slider, {
      x: currentX + moveDistance,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        // Update draggable bounds
        const newX = gsap.getProperty(slider, "x") as number;
        const containerWidth = sliderContainerRef.current?.offsetWidth || 0;
        const totalWidth = slider.scrollWidth;
        const maxScroll = Math.max(0, totalWidth - containerWidth);

        if (newX > 0) {
          gsap.set(slider, { x: 0 });
        } else if (newX < -maxScroll) {
          gsap.set(slider, { x: -maxScroll });
        }
      },
    });
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-stone-200/50"
      >
        {/* En-tête de la catégorie */}
        <div className="mb-8">
          {/* Titre et description */}
          <div className="mb-6 lg:mb-0">
            <h2 className="font-medium tracking-tight heading-xl leading-[0.8] text-stone-400 mb-2">
              {getCategoryTitle(category.slug)}
              <br />
              <span className="font-medium font-metal tracking-tight heading-xl text-stone-800">
                {category.name}
              </span>
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-stone-600 text-lg max-w-2xl leading-relaxed">
                {getCategoryDescription(category.slug)}
              </p>

              {/* Flèches de navigation - Desktop: à côté de la description */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleArrowClick("left")}
                  className="group"
                  title="Précédent"
                >
                  <CircleButton
                    href="#"
                    direction="right"
                    variant="dark"
                    size="medium"
                    className="pointer-events-none rotate-180"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleArrowClick("right")}
                  className="group"
                  title="Suivant"
                >
                  <CircleButton
                    href="#"
                    direction="right"
                    variant="dark"
                    size="medium"
                    className="pointer-events-none"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={sliderContainerRef}
          className={`relative ${isTouchDevice() ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"}`}
        >
          <div
            ref={sliderRef}
            className={`flex gap-4 h-full items-center relative ${isTouchDevice() ? "flex-nowrap" : ""}`}
          >
            {categoryProducts.slice(0, 6).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>

        {/* Indicateur de glissement */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs-responsive uppercase tracking-wider">
            ← Faites glisser pour découvrir →
          </p>
        </div>
      </div>
    </div>
  );
}

// Composant principal client avec useServerActions
export default function ProductsClientWithServerActions({
  searchParams,
}: ProductsClientWithServerActionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données et les searchParams en parallèle
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Charger les données et les searchParams en parallèle
        const [productsResult, categoriesResult, params] = await Promise.all([
          getProducts({
            page: 1,
            limit: 100, // Récupérer tous les produits
            fields: [
              "id",
              "name",
              "price",
              "stock",
              "slug",
              "images",
              "category",
            ],
          }),
          getCategories(),
          searchParams,
        ]);

        console.log("✅ Données chargées depuis Prisma:", {
          productsCount: productsResult.products?.length || 0,
          categoriesCount: categoriesResult?.length || 0,
          selectedCategory: params.category || "aucune",
        });

        setProducts(productsResult.products || []);
        setCategories(categoriesResult || []);
        setSelectedCategory(params.category || null);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des données:", error);
        // En cas d'erreur, on garde les tableaux vides
        setProducts([]);
        setCategories([]);
        setSelectedCategory(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  // Filtrer les catégories qui ont des produits
  const categoriesWithProducts = categories.filter((category) =>
    products.some((product) => product.category.slug === category.slug)
  );

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-light text-lg">
          Chargement des produits...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sections par catégories */}
      {selectedCategory
        ? // Afficher une seule catégorie
          (() => {
            const selectedCategoryData = categoriesWithProducts.find(
              (cat) => cat.slug === selectedCategory
            );

            if (!selectedCategoryData) {
              return (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Catégorie en cours de préparation
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Cette catégorie sera bientôt disponible avec de nouveaux
                      produits.
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                      Voir tous les produits
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <CategorySection
                category={selectedCategoryData}
                products={products}
              />
            );
          })()
        : // Afficher toutes les catégories
          categoriesWithProducts.map((category, index) => (
            <div key={category.id} className={index > 0 ? "mt-6" : ""}>
              <CategorySection category={category} products={products} />
            </div>
          ))}
    </div>
  );
}
