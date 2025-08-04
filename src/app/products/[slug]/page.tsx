import AddToCartButton from "@/components/AddToCartButton";
import ProductAccordion from "@/components/ProductAccordion";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";
import prisma from "@/lib/prisma";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string | null;
  longDescription?: string | null;

  // Nouveaux champs pour les détails produits
  ingredients?: string | null;
  usage?: string | null;
  benefits?: string | null;

  price: number;
  comparePrice?: number;
  stock: number;
  slug: string;
  weight?: number;
  dimensions?: string | null;
  barcode?: string | null;
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

  // D'abord, essayer de trouver le produit avec le slug exact
  let product = await prisma.product.findUnique({
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

  // Si pas trouvé, essayer de trouver par le nom (en générant le slug)
  if (!product) {
    const allProducts = await prisma.product.findMany({
      where: {
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

    // Chercher le produit dont le slug généré correspond
    product = allProducts.find((p) => generateSlug(p.name) === slug) || null;
  }

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
    <div className="min-h-screen bg-stone-100 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex overflow-hidden" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm min-w-0 w-full">
              <li className="flex-shrink-0">
                <Link
                  href="/"
                  className="text-stone-500 hover:text-emerald-600 transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li className="text-stone-300 flex-shrink-0">/</li>
              <li className="flex-shrink-0">
                <Link
                  href="/products"
                  className="text-stone-500 hover:text-emerald-600 transition-colors"
                >
                  Produits
                </Link>
              </li>
              <li className="text-stone-300 flex-shrink-0">/</li>
              <li className="min-w-0 flex-shrink">
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-stone-500 hover:text-emerald-600 transition-colors truncate block"
                  title={product.category.name}
                >
                  {product.category.name}
                </Link>
              </li>
              <li className="text-stone-300 flex-shrink-0">/</li>
              <li className="text-stone-900 font-medium min-w-0 flex-1">
                <span className="truncate block" title={product.name}>
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section produit principale */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-stone-200/50 overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Galerie d'images */}
            <div className="p-8 lg:p-12">
              <ProductImageGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Informations produit */}
            <div className="p-8 lg:p-12 bg-stone-50/50 flex flex-col justify-center">
              {/* Badges et catégorie */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {product.category.name}
                </span>
                {hasPromo && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                    -
                    {Math.round(
                      ((product.comparePrice! - product.price) /
                        product.comparePrice!) *
                        100
                    )}
                    %
                  </span>
                )}
                {isLowStock && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200">
                    Stock limité
                  </span>
                )}
              </div>

              {/* Titre */}
              <h1 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6 leading-tight">
                {product.name}
              </h1>

              {/* Étoiles de notation */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < 4 ? "text-yellow-400" : "text-stone-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-stone-600 text-sm">(4.0) • 127 avis</span>
              </div>

              {/* Prix */}
              <div className="mb-8">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-5xl font-bold text-stone-900">
                    €{Number(product.price).toFixed(2)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-2xl text-stone-400 line-through">
                      €{product.comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-stone-600">
                  TVA incluse • Livraison gratuite dès 50€
                </p>
              </div>

              {/* Indicateurs de stock et qualité */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/50">
                  <div
                    className={`w-3 h-3 rounded-full ${product.stock > 10 ? "bg-green-500" : product.stock > 5 ? "bg-orange-500" : "bg-red-500"}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-900">Stock</p>
                    <p className="text-xs text-stone-600">
                      {product.stock > 0
                        ? `${product.stock} unités`
                        : "Rupture"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/50">
                  <svg
                    className="w-6 h-6 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      Bio & Naturel
                    </p>
                    <p className="text-xs text-stone-600">Certifié</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <AddToCartButton
                  product={product}
                  className="w-full text-lg px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                />

                <div className="flex gap-3">
                  <button
                    className="flex-1 px-6 py-3 border-2 border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                    title="Ajouter aux favoris"
                    aria-label="Ajouter aux favoris"
                  >
                    <svg
                      className="w-5 h-5 text-stone-600"
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
                    <span className="text-sm font-medium text-stone-700">
                      Favoris
                    </span>
                  </button>

                  <button
                    className="flex-1 px-6 py-3 border-2 border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                    title="Partager"
                    aria-label="Partager"
                  >
                    <svg
                      className="w-5 h-5 text-stone-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-stone-700">
                      Partager
                    </span>
                  </button>
                </div>
              </div>

              {/* Garanties */}
              <div className="mt-8 pt-8 border-t border-stone-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-stone-700">Livraison 2-3 jours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-stone-700">Retours 30 jours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-stone-700">
                      Satisfait ou remboursé
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-stone-700">Support 7j/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections d'informations avec accordéon */}
        <div className="mb-12">
          <ProductAccordion
            items={[
              {
                id: "description",
                title: "Description",
                content:
                  product.longDescription ||
                  product.description ||
                  "Soin naturel premium pour une peau éclatante et nourrie en profondeur. Formulé avec des ingrédients biologiques certifiés pour respecter votre peau et l'environnement.",
                icon: (
                  <svg
                    className="w-5 h-5 text-stone-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
              },
              {
                id: "ingredients",
                title: "Ingrédients Naturels",
                content:
                  product.ingredients ||
                  "Formulé avec des ingrédients biologiques certifiés :\n\n• Huile d'argan bio - Nourrit et régénère\n• Beurre de karité - Hydrate en profondeur\n• Aloe vera - Apaise et rafraîchit\n• Extraits botaniques - Antioxydants naturels\n• Vitamine E - Protection anti-âge\n\nTous nos ingrédients sont issus de l'agriculture biologique et du commerce équitable.",
                icon: (
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                ),
              },
              {
                id: "usage",
                title: "Mode d'emploi",
                content:
                  product.usage ||
                  "Application recommandée :\n\n1. Nettoyez votre peau avec un démaquillant doux\n2. Appliquez une petite quantité sur peau propre et sèche\n3. Massez délicatement du centre vers l'extérieur du visage\n4. Évitez le contour des yeux\n5. Utilisez matin et/ou soir selon vos besoins\n\nPour de meilleurs résultats, utilisez quotidiennement pendant au moins 4 semaines.",
                icon: (
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
              {
                id: "benefits",
                title: "Bienfaits",
                content:
                  product.benefits ||
                  "Les bienfaits de ce soin :\n\n• Hydratation intense et durable\n• Nutrition en profondeur\n• Apaisement des irritations\n• Révélation de l'éclat naturel\n• Protection contre les agressions extérieures\n• Amélioration de l'élasticité de la peau\n• Réduction des signes de fatigue\n\nRésultats visibles dès les premières applications.",
                icon: (
                  <svg
                    className="w-5 h-5 text-pink-600"
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
                ),
              },
              {
                id: "specifications",
                title: "Caractéristiques physiques",
                content: (() => {
                  const specs = [];
                  if (product.weight) {
                    specs.push(`• Poids : ${product.weight} kg`);
                  }
                  if (product.dimensions) {
                    specs.push(`• Dimensions : ${product.dimensions}`);
                  }
                  if (product.barcode) {
                    specs.push(`• Code-barres : ${product.barcode}`);
                  }

                  if (specs.length === 0) {
                    return "Informations techniques non disponibles pour ce produit.";
                  }

                  return specs.join("\n");
                })(),
                icon: (
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                ),
              },
            ]}
          />
        </div>

        {/* Description longue si elle existe */}
        {product.longDescription && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-200/50 p-8 mb-12">
            <h2 className="heading-lg font-medium text-stone-900 mb-8 text-center">
              Description détaillée
            </h2>
            <div className="prose max-w-none text-stone-700 text-base-responsive leading-relaxed font-light">
              <p>{product.longDescription}</p>
            </div>
          </div>
        )}

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-200/50 p-8">
            <h2 className="heading-lg font-medium text-stone-900 mb-8 text-center">
              Vous pourriez aussi aimer
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similar) => (
                <ProductCard
                  key={similar.id}
                  product={similar}
                  showBadge={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
