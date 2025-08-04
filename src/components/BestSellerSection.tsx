"use client";

import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

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

export default function BestSellerSection({
  products,
  loading,
}: BestSellerSectionProps) {
  return (
    <section
      id="bestseller-section"
      className="py-16 sm:py-20 lg:py-24 bg-white"
    >
      <div className="w-full px-1 sm:px-2 md:px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20 leading-none"
        >
          <h2 className="text-zinc-900 mb-6 uppercase font-thin heading-xxl tracking-tight">
            best-sellers
          </h2>
          <p className="text-base-responsive text-zinc-700 font-light max-w-2xl mx-auto ">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-8 mx-auto max-w-full">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showBadge={true}
                badgeText="Best-seller"
              />
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
