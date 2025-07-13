import AddToCartButton from "@/components/AddToCartButton";
import prisma from "@/lib/prisma";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { Suspense } from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  longDescription?: string | null;
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

// Server Component pour récupérer les données avec filtrage par catégorie
async function getProductsData(categorySlug?: string) {
  // Construire la condition where pour le filtrage
  const whereCondition = {
    isActive: true,
    ...(categorySlug && {
      category: {
        slug: categorySlug,
        isActive: true,
      },
    }),
  };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereCondition,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    products: products.map((product) => ({
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice
        ? Number(product.comparePrice)
        : undefined,
      weight: product.weight ? Number(product.weight) : undefined,
    })),
    categories,
  };
}

// Composant pour afficher une carte produit avec carousel d'images
function ProductCard({ product }: { product: Product }) {
  const hasMultipleImages = product.images.length > 1;
  const hasPromo = product.comparePrice && product.comparePrice > product.price;
  const isLowStock = product.stock < 10;

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100">
      {/* Container image avec aspect ratio fixe */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images && product.images.length > 0 ? (
          <>
            <Link
              href={`/products/${product.slug}`}
              className="block w-full h-full"
            >
              {/* Image principale */}
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Image secondaire en hover (si disponible) */}
              {hasMultipleImages && (
                <Image
                  src={product.images[1].url}
                  alt={product.images[1].alt || product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </Link>

            {/* Badge promotion - style moderne */}
            {hasPromo && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg z-10">
                -
                {Math.round(
                  ((product.comparePrice! - product.price) /
                    product.comparePrice!) *
                    100
                )}
                %
              </div>
            )}

            {/* Badge stock faible */}
            {isLowStock && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg z-10">
                Stock limité
              </div>
            )}

            {/* Indicateur nombre d'images - style moderne */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white px-2.5 py-1.5 rounded-full text-xs font-medium shadow-lg z-10">
                +{product.images.length - 1}
              </div>
            )}
          </>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="block w-full h-full"
          >
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
              <svg
                className="w-20 h-20"
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
          </Link>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="p-6 space-y-3">
        {/* Catégorie */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
            {product.category.name}
          </span>
          {/* Étoiles de notation (statique pour l'instant) */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < 4 ? "text-yellow-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Nom du produit */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-emerald-600 transition-colors duration-200"
          >
            {product.name}
          </Link>
        </h3>

        {/* Description courte */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {product.description ||
            "Soin naturel premium pour une peau éclatante et nourrie en profondeur."}
        </p>

        {/* Prix et actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              €{Number(product.price).toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">
                €{product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Bouton d'ajout rapide (visible sur desktop) */}
          <div className="hidden sm:block">
            <AddToCartButton product={product} />
          </div>
        </div>

        {/* Indicateurs supplémentaires */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span>Bio & Naturel</span>
          </span>
          <span className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${product.stock > 10 ? "bg-green-500" : product.stock > 5 ? "bg-orange-500" : "bg-red-500"}`}
            />
            <span>En stock ({product.stock})</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Composant de loading
function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-gray-200"></div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="w-3 h-3 bg-gray-200 rounded-full"
                  ></div>
                ))}
              </div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Composant principal (Server Component) avec gestion des searchParams
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const { products, categories } = await getProductsData(category);

  // Trouver la catégorie active pour l'affichage
  const activeCategory = category
    ? categories.find((cat) => cat.slug === category)
    : null;

  return (
    <div className="min-h-screen bg-rose-50/95 pt-20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête moderne */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            Cosmétiques Bio Premium
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {activeCategory ? (
              <>
                <span className="block text-emerald-600">
                  {activeCategory.name}
                </span>
                <span className="block text-3xl md:text-4xl lg:text-5xl text-gray-600 font-medium">
                  Collection
                </span>
              </>
            ) : (
              <>
                <span className="block">Nos Produits</span>
                <span className="block text-emerald-600">Bio & Naturels</span>
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {activeCategory
              ? `Découvrez notre sélection exclusive de produits ${activeCategory.name.toLowerCase()} formulés avec des ingrédients biologiques certifiés.`
              : "Découvrez notre gamme complète de cosmétiques biologiques artisanaux, conçus pour révéler la beauté naturelle de votre peau."}
          </p>
        </div>

        {/* Filtres par catégorie - Design moderne */}
        {categories.length > 0 && (
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Filtrer par catégorie
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/products"
                  className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                    !category
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25"
                      : "border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  Tous les produits
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                      category === cat.slug
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25"
                        : "border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {products.length}
            </h3>
            <p className="text-gray-600">
              {activeCategory
                ? `Produits ${activeCategory.name.toLowerCase()}`
                : "Produits disponibles"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">100%</h3>
            <p className="text-gray-600">Ingrédients biologiques</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-pink-600"
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
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Artisanal</h3>
            <p className="text-gray-600">Fait avec amour</p>
          </div>
        </div>

        {/* Grille des produits */}
        <Suspense fallback={<ProductsLoading />}>
          {products.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeCategory
                    ? `Collection ${activeCategory.name}`
                    : "Tous nos produits"}
                </h2>
                <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {products.length} produit{products.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {activeCategory
                    ? `Aucun produit dans "${activeCategory.name}"`
                    : "Aucun produit disponible"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeCategory
                    ? "Essayez une autre catégorie ou consultez tous nos produits."
                    : "Nos produits seront bientôt disponibles."}
                </p>
                {activeCategory && (
                  <Link
                    href="/products"
                    className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium shadow-lg"
                  >
                    Voir tous les produits
                  </Link>
                )}
              </div>
            </div>
          )}
        </Suspense>

        {/* Section informative redesignée */}
        <div className="mt-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-16 sm:px-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Pourquoi choisir nos produits bio ?
              </h2>
              <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                Découvrez les avantages de nos cosmétiques biologiques
                artisanaux
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  100% Naturel
                </h3>
                <p className="text-emerald-100 leading-relaxed">
                  Ingrédients certifiés biologiques, sans produits chimiques
                  nocifs pour votre peau
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Artisanal
                </h3>
                <p className="text-emerald-100 leading-relaxed">
                  Fabriqués à la main en petites quantités avec passion et
                  savoir-faire
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.25-1.955a3 3 0 00-2.121-1.021H13.5a3 3 0 00-3 3V4.5h-1A2.5 2.5 0 007 7v10a2.5 2.5 0 002.5 2.5h6A2.5 2.5 0 0018 17V7a2.5 2.5 0 00-2.5-2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Testé & Approuvé
                </h3>
                <p className="text-emerald-100 leading-relaxed">
                  Qualité garantie par nos experts et testée dermatologiquement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
