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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Images du produit avec carousel */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <>
            {/* Image principale */}
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              width={400}
              height={400}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Image secondaire en hover (si disponible) */}
            {hasMultipleImages && (
              <Image
                src={product.images[1].url}
                alt={product.images[1].alt || product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}

            {/* Indicateur nombre d'images */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                +{product.images.length - 1}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Badge promotion */}
        {hasPromo && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
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
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Stock limité
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
            {product.category.name}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description || "Aucune description disponible"}
        </p>

        {/* Prix */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            €{product.price.toFixed(2)}
          </span>
          {product.comparePrice && (
            <span className="text-lg text-gray-500 line-through">
              €{product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Stock: {product.stock} unités
          </span>
          <div
            className={`w-3 h-3 rounded-full ${
              product.stock > 10
                ? "bg-green-500"
                : product.stock > 5
                  ? "bg-orange-500"
                  : "bg-red-500"
            }`}
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-2">
          <AddToCartButton product={product} />
          <Link
            href={`/products/${product.slug}`}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            title="Voir les détails du produit"
            aria-label="Voir les détails du produit"
          >
            <svg
              className="w-5 h-5 text-gray-500"
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
          </Link>
        </div>
      </div>
    </div>
  );
}

// Composant de loading
function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-gray-300"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-300 rounded flex-1"></div>
              <div className="h-10 w-10 bg-gray-300 rounded"></div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {activeCategory ? `${activeCategory.name}` : "Nos Produits Bio"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {activeCategory
              ? `Découvrez notre sélection de produits ${activeCategory.name.toLowerCase()}`
              : "Découvrez notre gamme complète de produits cosmétiques biologiques pour prendre soin de votre peau naturellement."}
          </p>
        </div>

        {/* Filtres par catégorie */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/products"
                className={`px-4 py-2 rounded-full border transition-colors ${
                  !category
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300"
                }`}
              >
                Tous les produits
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    category === cat.slug
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grille des produits */}
        <Suspense fallback={<ProductsLoading />}>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
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
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {activeCategory
                  ? `Aucun produit dans la catégorie "${activeCategory.name}"`
                  : "Aucun produit disponible"}
              </h3>
              <p className="text-gray-500">
                {activeCategory
                  ? "Essayez une autre catégorie ou consultez tous nos produits."
                  : "Nos produits seront bientôt disponibles."}
              </p>
              {activeCategory && (
                <Link
                  href="/products"
                  className="inline-block mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Voir tous les produits
                </Link>
              )}
            </div>
          )}
        </Suspense>

        {/* Section informative */}
        <div className="mt-16 bg-emerald-50 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pourquoi choisir nos produits bio ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
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
                <h3 className="font-semibold text-gray-900 mb-2">
                  100% Naturel
                </h3>
                <p className="text-gray-600 text-sm">
                  Ingrédients certifiés biologiques
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
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
                <h3 className="font-semibold text-gray-900 mb-2">Artisanal</h3>
                <p className="text-gray-600 text-sm">
                  Fabriqués à la main avec passion
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
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
                <h3 className="font-semibold text-gray-900 mb-2">Testé</h3>
                <p className="text-gray-600 text-sm">
                  Qualité garantie par nos experts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
