import BestSellerSection from "@/components/BestSellerSection";
import CacheStatus from "@/components/CacheStatus";
import ConnectWithUsSection from "@/components/ConnectWithUsSection";
import FloatingCardsSection from "@/components/FloatingCardsSection";
import NewsletterOverlay from "@/components/NewsletterOverlay";
import ParallaxBanner from "@/components/ParallaxBanner";
import SectionBandeauLeft from "@/components/SectionBandeauLeft";
import SectionBandeauRight from "@/components/SectionBandeauRight";
import TransparentSection from "@/components/TransparentSection";
import HeroLoader from "@/components/ui/HeroLoader";
import { getCategoriesAction, getFeaturedProductsAction, getProductsAction } from "@/lib/actions";
import { Suspense } from "react";

// Types pour les données
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

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Composant de chargement pour les produits
function ProductsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-8 mx-auto max-w-full">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

// Fonctions helper pour extraire les données de manière sécurisée
function extractFeaturedProducts(result: unknown): Product[] {
  if (
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    !result.success
  ) {
    return [];
  }

  const data = result as { success: boolean; data?: { products?: unknown } };
  const products = data.data?.products;
  return Array.isArray(products) ? products : [];
}

function extractAllProducts(result: unknown): Product[] {
  if (
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    !result.success
  ) {
    return [];
  }

  const data = result as { success: boolean; data?: { products?: unknown } };
  const products = data.data?.products;
  return Array.isArray(products) ? products : [];
}

function extractCategories(result: unknown): Category[] {
  if (
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    !result.success
  ) {
    return [];
  }

  const data = result as { success: boolean; data?: unknown };
  const categories = data.data;
  return Array.isArray(categories) ? categories : [];
}

export default async function Home() {
  // Charger les données en parallèle avec les server actions
  const [featuredResult, allProductsResult, categoriesResult] = await Promise.all([
    getFeaturedProductsAction(6),
    getProductsAction({ limit: 50, isActive: true }), // Récupérer tous les produits actifs
    getCategoriesAction(),
  ]);

  // Extraction sécurisée des données
  const featuredProducts = extractFeaturedProducts(featuredResult);
  const allProducts = extractAllProducts(allProductsResult);
  const categories = extractCategories(categoriesResult);

  console.log("🔄 Fetching featured products from database...");
  if (featuredResult.success) {
    console.log(
      `✅ Featured products fetched: ${featuredProducts.length} items`
    );
  } else {
    console.log(
      `❌ Failed to fetch featured products: ${featuredResult.error}`
    );
  }

  console.log("🔄 Fetching all products from database...");
  if (allProductsResult.success) {
    console.log(
      `✅ All products fetched: ${allProducts.length} items`
    );
  } else {
    console.log(
      `❌ Failed to fetch all products: ${allProductsResult.error}`
    );
  }

  console.log("🔄 Fetching categories from database...");
  if (categoriesResult.success) {
    console.log(`✅ Categories fetched: ${categories.length} items`);
  } else {
    console.log(`❌ Failed to fetch categories: ${categoriesResult.error}`);
  }

  return (
    <main className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        <HeroLoader />
      </section>

      {/* Floating Cards Section */}
      <section className="relative">
        <FloatingCardsSection />
      </section>

      {/* Best Seller Section avec produits */}
      <section className="relative">
        <Suspense fallback={<ProductsLoadingSkeleton />}>
          <BestSellerSection products={featuredProducts} loading={false} />
        </Suspense>
      </section>

      {/* Section de produits */}

      <section className="relative">
        {/* Première section - Image à gauche */}
        <SectionBandeauLeft products={allProducts} loading={false} />
        {/* Deuxième section - Image à droite */}
        <SectionBandeauRight products={allProducts} loading={false} />
      </section>
      {/* Transparent Section */}
      <section className="relative">
        <TransparentSection />
      </section>

      {/* Final CTA Section */}
      <section className="relative">
        <ConnectWithUsSection />
      </section>

      {/* Parallax Banner */}
      <section className="relative w-full h-full">
        {/* Newsletter Overlay */}
        <NewsletterOverlay className="absolute bottom-0 right-0 z-10 " />
        <div className=" w-full h-auto relative">
          <ParallaxBanner src="/images/banner.jpg" alt="Banner" />
        </div>
      </section>

      {/* Cache Status */}
      <CacheStatus />
    </main>
  );
}
