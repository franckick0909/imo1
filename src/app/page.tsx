import AddToCartButton from "@/components/AddToCartButton";
import HomeClient from "@/components/HomeClient";
import prisma from "@/lib/prisma";
import { Link } from "next-view-transitions";
import Image from "next/image";

interface Product {
  id: string; // ✅ String natif
  name: string; // ✅ String natif
  description: string | null; // ✅ String natif
  price: number; // ✅ Decimal → number
  comparePrice?: number; // ✅ Decimal → number
  stock: number; // ✅ Number natif
  slug: string; // ✅ String natif
  category: {
    // ✅ Object
    id: string; // ✅ String natif
    name: string; // ✅ String natif
    slug: string; // ✅ String natif
  };
  images: {
    // ✅ Array
    id: string; // ✅ String natif
    url: string; // ✅ String natif
    alt?: string | null; // ✅ String natif
    position: number; // ✅ Number natif
  }[];
}

// Fonction pour récupérer les produits en vedette
async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      // Pour l'instant, on prend les derniers produits créés
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
    orderBy: {
      createdAt: "desc",
    },
    take: 6, // Limiter à 6 produits
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    comparePrice: product.comparePrice
      ? Number(product.comparePrice)
      : undefined,
    stock: product.stock,
    slug: product.slug,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      position: image.position,
    })),
  }));
}

// Composant pour afficher une carte produit
function ProductCard({ product }: { product: Product }) {
  const hasMultipleImages = product.images.length > 1;
  const hasPromo = product.comparePrice && product.comparePrice > product.price;
  const isLowStock = product.stock < 10;

  return (
    <div className="group relative">
      <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none relative">
        {product.images && product.images.length > 0 ? (
          <>
            <Link
              href={`/products/${product.slug}`}
              className="block w-full h-full"
            >
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Badge promotion */}
            {hasPromo && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
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
              <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                Stock limité
              </div>
            )}

            {/* Indicateur nombre d'images */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm z-10">
                +{product.images.length - 1}
              </div>
            )}
          </>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="block w-full h-full"
          >
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16"
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

      <div className="mt-4 flex justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-700 font-medium">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-emerald-600 transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-emerald-600 uppercase tracking-wider">
            {product.category.name}
          </p>
          <p className="mt-1 text-sm text-gray-500 truncate">
            {product.description || "Soin naturel premium"}
          </p>
        </div>
        <div className="flex flex-col items-end ml-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              €{product.price.toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 line-through">
                €{product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="mt-2 relative z-20">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Votre peau mérite</span>
            <span className="block text-emerald-600">
              le meilleur de la nature
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Découvrez notre gamme de crèmes bio artisanales, formulées avec des
            ingrédients naturels pour révéler la beauté authentique de votre
            peau.
          </p>

          {/* Boutons d'action */}
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/products"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10 transition duration-200"
              >
                Découvrir nos produits
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <HomeClient />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    100% Bio & Naturel
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Tous nos produits sont certifiés biologiques, formulés avec
                    des ingrédients naturels soigneusement sélectionnés.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Fait avec Amour
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Chaque crème est préparée artisanalement en petites
                    quantités pour garantir fraîcheur et qualité.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Livraison Rapide
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Recevez vos produits rapidement et en parfait état grâce à
                    notre emballage éco-responsable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produits en vedette */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Nos Produits Phares
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Une sélection de nos meilleures crèmes pour prendre soin de votre
              peau au quotidien
            </p>
          </div>

          {/* Grid des produits */}
          <div className="mt-12">
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
                {featuredProducts.map((product) => (
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Aucun produit en vedette pour le moment
                </h3>
                <p className="text-gray-500 mb-4">
                  Nos produits seront bientôt mis en avant.
                </p>
                <Link
                  href="/products"
                  className="inline-block px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Voir tous nos produits
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24">
          <div className="bg-emerald-600 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  <span className="block">Prêt à chouchouter votre peau ?</span>
                  <span className="block text-emerald-200">
                    Découvrez nos crèmes bio dès maintenant.
                  </span>
                </h2>
              </div>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50 transition duration-200"
                  >
                    Voir tous nos produits
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
