"use client";

import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { useState } from "react";
import SophisticatedTitle from "./ui/SophisticatedTitle";
import { useToast } from "./ui/ToastContainer";

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

interface BestSellerSectionProps {
  products: Product[];
  loading: boolean;
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
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link
          href={`/products/${product.slug}`}
          className="block w-full h-full relative"
        >
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

        {/* Badge Best Seller */}
        <div className="absolute top-4 left-4">
          <span className="bg-black text-white px-3 py-1.5 text-xs font-medium uppercase tracking-wider">
            Bestseller
          </span>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
            title="Ajouter aux favoris"
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

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
            title="Ajouter au panier"
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

      {/* Contenu produit */}
      <div className="space-y-2 p-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
          {product.category.name}
        </p>
        <div className="flex items-center justify-between gap-16">
        <h3 className="text-base font-normal text-gray-700 leading-tight tracking-tight uppercase">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-gray-600 transition-colors duration-200"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-lg font-medium text-gray-800">
          €{product.price.toFixed(0)}
        </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function BestSellerSection({
  products,
  loading,
}: BestSellerSectionProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
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
            Bestsellers
          </SophisticatedTitle>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Nos produits les plus appréciés, sélectionnés par notre communauté
          </p>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-light text-lg">
              Chargement des produits...
            </p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] gap-8 items-center mx-auto max-w-full">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <h3 className="text-3xl font-light text-gray-900 mb-6">
              Aucun bestseller pour le moment
            </h3>
            <p className="text-gray-600 mb-10 font-light text-lg">
              Nos produits seront bientôt disponibles.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
