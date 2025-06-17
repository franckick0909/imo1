"use client";

import FeatureSection from "@/components/FeatureSection";
import SophisticatedTitle from "@/components/ui/SophisticatedTitle";
import { useToast } from "@/components/ui/ToastContainer";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { useEffect, useState } from "react";

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

interface RawProduct {
  id: string;
  name: string;
  description: string | null;
  price: string;
  comparePrice?: string;
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

function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "/api/products?isFeatured=true&isActive=true"
        );
        if (response.ok) {
          const data = await response.json();
          const formattedProducts = (data.products || []).slice(0, 6).map(
            (product: RawProduct): Product => ({
              ...product,
              price: Number(product.price),
              comparePrice: product.comparePrice
                ? Number(product.comparePrice)
                : undefined,
            })
          );
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { success, error } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="group relative bg-white"
    >
      {/* Image container - Plus haute et plus large */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-6">
        <Link
          href={`/products/${product.slug}`}
          className="block w-full h-full"
        >
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
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
          )}
        </Link>

        {/* Badge Best Seller en blanc */}
        <div className="absolute top-4 left-4">
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="bg-white text-black px-3 py-1.5 text-xs font-medium uppercase tracking-wider shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        {/* Actions - Panier et Favoris */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Bouton Favoris */}
          <button
            onClick={handleToggleFavorite}
            className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Ajouter aux favoris"
          >
            <svg
              className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "fill-none"}`}
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
          </button>

          {/* Bouton Panier */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Ajouter au panier"
          >
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="w-5 h-5"
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

      {/* Contenu produit - Style épuré */}
      <div className="space-y-2">
        {/* Catégorie et type */}
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
          {product.category.name} • Hydratant • Crème
        </p>

        {/* Nom du produit */}
        <h3 className="text-xl font-medium text-gray-900 leading-tight">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-gray-600 transition-colors duration-200"
          >
            {product.name}
          </Link>
        </h3>

        {/* Prix */}
        <p className="text-xl font-medium text-gray-900">
          {product.price.toFixed(0)}€
        </p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { products: featuredProducts, loading } = useFeaturedProducts();

  return (
    <div className="bg-white">
      {/* Hero Section - Image plus claire et haute définition */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Cosmétiques naturels de luxe"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-5xl">
            <SophisticatedTitle
              level="h1"
              variant="hero"
              className="mb-8 text-white"
            >Bienveillant envers la Nature
            </SophisticatedTitle>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              className="text-xl md:text-2xl font-light leading-relaxed mb-10 max-w-3xl mx-auto"
            >
              Des produits authentiques qui révèlent votre beauté naturelle,
              respectueux de votre peau et de notre planète.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
            >
              <Link
                href="/products"
                className="inline-block bg-white text-gray-900 px-10 py-5 text-lg font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors duration-300 shadow-lg"
              >
                Découvrir la Collection
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-white">
        <div className="w-full px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-5xl mx-auto"
          >
            <SophisticatedTitle
              level="h2"
              variant="section"
              className="text-gray-900 leading-tight mb-8"
            >
              Une Mission Simplifier les Soins
            </SophisticatedTitle>
            <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
              Des formulations pures et efficaces pour révéler la beauté
              naturelle de votre peau, sans compromis sur la qualité ni
              l&apos;éthique. Chaque produit est conçu pour transformer votre
              routine beauté en un moment de bien-être authentique.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section Certifications avec animations de scroll */}
      <FeatureSection />

      {/* Section Featured Products - Plus grande */}
      <section className="py-24 bg-white">
        <div className="w-full px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <SophisticatedTitle
              level="h2"
              variant="section"
              className="text-gray-900 mb-6"
            >
              Collection Printemps
            </SophisticatedTitle>
            <div className="flex justify-center space-x-12 text-sm font-medium text-gray-600 uppercase tracking-wider">
              <span className="border-b-2 border-gray-900 pb-2">
                Bestsellers
              </span>
              <span className="hover:border-b-2 border-gray-300 pb-2 cursor-pointer transition-colors">
                Visage
              </span>
              <span className="hover:border-b-2 border-gray-300 pb-2 cursor-pointer transition-colors">
                Corps
              </span>
            </div>
          </motion.div>

          {/* Products Grid - Plus large et plus espacé */}
          {loading ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 mx-auto mb-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-light text-lg">
                Chargement des produits...
              </p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 max-w-7xl mx-auto">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <h3 className="text-3xl font-light text-gray-900 mb-6">
                Collection à venir
              </h3>
              <p className="text-gray-600 mb-10 font-light text-lg">
                Nos produits signature seront bientôt disponibles.
              </p>
              <Link
                href="/products"
                className="inline-block bg-gray-900 text-white px-10 py-4 font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Explorer le catalogue
              </Link>
            </div>
          )}

          {/* Shop All Button */}
          {featuredProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mt-20"
            >
              <Link
                href="/products"
                className="inline-block bg-gray-900 text-white px-16 py-5 text-lg font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors duration-300 shadow-lg"
              >
                Voir Toute la Collection
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Section Hero Secondary */}
      <section className="py-24 bg-gray-50">
        <div className="w-full px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <SophisticatedTitle
                level="h2"
                variant="section"
                className="text-gray-900 leading-52 mb-8"
              >
                Hydratez-vous Pendant Votre Sommeil
              </SophisticatedTitle>
              <p className="text-xl text-gray-600 font-light leading-relaxed mb-10">
                Réveillez-vous avec des mains douces et souples grâce à ce
                traitement nocturne recommandé par les dermatologues.
              </p>
              <Link
                href="/products"
                className="inline-block bg-gray-900 text-white px-10 py-5 font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors duration-300 shadow-lg"
              >
                Découvrir Maintenant
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              className="relative aspect-square"
            >
              <Image
                src="/images/soir.jpg"
                alt="Soin des mains naturel de nuit"
                fill
                className="object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
