"use client";

import ProductsClientWithServerActions from "@/app/products/ProductsClientWithServerActions";
import ParallaxBanner from "@/components/ParallaxBanner";
import { Category, getCategories } from "@/lib/actions";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

// Composant de chargement
function ProductsLoading() {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-light text-lg">
            Chargement des produits...
          </p>
        </div>
      </div>
    </div>
  );
}

// Composant principal
export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [params, setParams] = useState<{ category?: string }>({});

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      const searchParamsData = await searchParams;
      setParams(searchParamsData);

      const categoriesData = await getCategories();
      setCategories(categoriesData);
    };

    loadData();
  }, [searchParams]);

  // Fonction pour obtenir le label de la catégorie
  const getCategoryLabel = (categorySlug: string) => {
    switch (categorySlug) {
      case "hydratation":
        return "Hydratation";
      case "purification":
        return "Purification";
      case "anti-age":
        return "Anti-âge";
      case "soins-mains":
        return "Soins des mains";
      case "soins-visage":
        return "Soins du visage";
      case "protection-solaire":
        return "Protection solaire";
      default:
        return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
    }
  };

  return (
    <div className="bg-white relative overflow-hidden">
      {/* Section ParallaxBanner */}
      <div className="relative">
        <ParallaxBanner
          src="/images/banner-2.jpg"
          alt="Visuel inspirant"
          className="object-cover"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 subheading-xxl font-light text-gray-800 mb-6 leading-tight text-center tracking-tighter">
          <h2>Pour une peau éclatante et saine</h2>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-20 bg-white">
        <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* En-tête style TrueKind */}
          <div className="text-center mb-16">
            {params.category && (
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 underline underline-offset-8">
                {getCategoryLabel(params.category)}
              </h2>
            )}
          </div>

          {/* Layout principal avec filtres */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Filtres sur le côté - style TrueKind */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="sticky top-8">
                <h3 className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">
                  FILTERS
                </h3>

                {/* Filtre RANGE - style TrueKind */}
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className="flex items-center justify-between w-full mb-4 hover:opacity-80 transition-opacity"
                  >
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Catégories
                    </h4>
                    <svg
                      aria-hidden="true"
                      className={`w-4 h-4 text-gray-500 transition-transform duration-300 cursor-pointer ${
                        isCategoriesOpen ? "rotate-180" : "-rotate-90"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isCategoriesOpen
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="space-y-2 pt-2">
                      <Link
                        href="/products"
                        className={`block text-sm font-medium transition-colors ${
                          !params.category
                            ? "text-black"
                            : "text-zinc-500 hover:text-zinc-950"
                        }`}
                      >
                        TOUS LES PRODUITS
                      </Link>

                      {categories.map((category: Category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${category.slug}`}
                          className={`block text-sm font-light transition-colors ${
                            params.category === category.slug
                              ? "text-black"
                              : "text-zinc-500 hover:text-zinc-900"
                          }`}
                        >
                          {getCategoryLabel(category.slug).toUpperCase()}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ligne de séparation */}
                <div className="border-t border-gray-300 mb-8"></div>

                {/* Section TYPE (collapsed) - style TrueKind */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      TYPE
                    </h4>
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Ligne de séparation */}
                <div className="border-t border-gray-300 mb-8"></div>

                {/* Section INGREDIENTS (collapsed) - style TrueKind */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      INGREDIENTS
                    </h4>
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections par catégories */}
            <div className="flex-1">
              <Suspense fallback={<ProductsLoading />}>
                <ProductsClientWithServerActions
                  searchParams={Promise.resolve(params)}
                />
              </Suspense>
            </div>
          </div>

          {/* Section informative en bas */}
          <div className="mt-24 bg-gray-50 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Pour une peau éclatante et saine
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Des soins propres, conscients et cliniques ! Des produits honnêtes
              qui fonctionnent vraiment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
