import AddToCartButton from "@/components/AddToCartButton";
import ProductImageGallery from "@/components/ProductImageGallery";
import prisma from "@/lib/prisma";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { notFound } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string | null;
  longDescription?: string | null;
  price: number;
  comparePrice?: number;
  stock: number;
  slug: string;
  weight?: number;
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Server Component pour récupérer les données du produit
async function getProduct(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: {
      slug,
      isActive: true,
    },
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
  });

  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice
      ? Number(product.comparePrice)
      : undefined,
    weight: product.weight ? Number(product.weight) : undefined,
  };
}

// Server Component pour récupérer des produits similaires
async function getSimilarProducts(
  categoryId: string,
  currentProductId: string
) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
      id: { not: currentProductId },
    },
    include: {
      category: true,
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
    },
    take: 4,
  });

  return products.map((product) => ({
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice
      ? Number(product.comparePrice)
      : undefined,
    weight: product.weight ? Number(product.weight) : undefined,
  }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const similarProducts = await getSimilarProducts(
    product.category.id,
    product.id
  );
  const hasPromo = product.comparePrice && product.comparePrice > product.price;
  const isLowStock = product.stock < 10;

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 overflow-hidden" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm min-w-0 w-full">
            <li className="flex-shrink-0">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Accueil
              </Link>
            </li>
            <li className="text-gray-400 flex-shrink-0">/</li>
            <li className="flex-shrink-0">
              <Link
                href="/products"
                className="text-gray-500 hover:text-gray-700"
              >
                Produits
              </Link>
            </li>
            <li className="text-gray-400 flex-shrink-0">/</li>
            <li className="min-w-0 flex-shrink">
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-gray-500 hover:text-gray-700 truncate block"
                title={product.category.name}
              >
                {product.category.name}
              </Link>
            </li>
            <li className="text-gray-400 flex-shrink-0">/</li>
            <li className="text-gray-900 font-medium min-w-0 flex-1">
              <span className="truncate block" title={product.name}>
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* Contenu principal */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
            {/* Galerie d'images */}
            <div className="space-y-4">
              <ProductImageGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Informations produit */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {product.category.name}
                </span>
                {hasPromo && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Promotion
                  </span>
                )}
                {isLowStock && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Stock limité
                  </span>
                )}
              </div>

              {/* Titre et description courte */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600">
                  {product.description || "Aucune description disponible"}
                </p>
              </div>

              {/* Prix */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-gray-900">
                  €{product.price.toFixed(2)}
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      €{product.comparePrice.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      -
                      {Math.round(
                        ((product.comparePrice - product.price) /
                          product.comparePrice) *
                          100
                      )}
                      %
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    product.stock > 10
                      ? "bg-green-500"
                      : product.stock > 5
                        ? "bg-orange-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-gray-600">
                  {product.stock > 0
                    ? `En stock (${product.stock} unités)`
                    : "Rupture de stock"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <AddToCartButton
                  product={product}
                  className="text-lg px-8 py-4"
                />
                <button
                  className="px-6 py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Ajouter aux favoris"
                  aria-label="Ajouter aux favoris"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
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
                </button>
              </div>

              {/* Informations supplémentaires */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">
                      Livraison:
                    </span>
                    <span className="text-gray-600 ml-2">2-3 jours ouvrés</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Retours:</span>
                    <span className="text-gray-600 ml-2">30 jours</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Garantie:</span>
                    <span className="text-gray-600 ml-2">
                      Satisfait ou remboursé
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Support:</span>
                    <span className="text-gray-600 ml-2">7j/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description longue */}
        {product.longDescription && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Description détaillée
            </h2>
            <div className="prose max-w-none text-gray-600">
              <p>{product.longDescription}</p>
            </div>
          </div>
        )}

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Produits similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similar) => (
                <Link
                  key={similar.id}
                  href={`/products/${similar.slug}`}
                  className="group"
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-200 relative">
                      {similar.images[0] ? (
                        <Image
                          src={similar.images[0].url}
                          alt={similar.images[0].alt || similar.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-12 h-12"
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
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {similar.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          €{similar.price.toFixed(2)}
                        </span>
                        {similar.comparePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            €{similar.comparePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
