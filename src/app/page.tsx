"use client";

import BestSellerSection from "@/components/BestSellerSection";
import FloatingCardsSection from "@/components/FloatingCardsSection";
import HeroSection from "@/components/HeroSection";
import HydratationSection from "@/components/HydratationSection";
import PurificationSection from "@/components/PurificationSection";
import TransparentSection from "@/components/TransparentSection";
import SophisticatedTitle from "@/components/ui/SophisticatedTitle";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

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

export default function Home() {
  const { products: featuredProducts, loading } = useFeaturedProducts();
  const sectionsContainerRef = useRef<HTMLDivElement>(null);

  // Suppression du parallax global pour éviter le problème de collage avec BestSellerSection
  // useGSAP(() => {
  //   if (sectionsContainerRef.current) {
  //     gsap.to(sectionsContainerRef.current, {
  //       y: "-10%",
  //       ease: "none",
  //       scrollTrigger: {
  //         trigger: sectionsContainerRef.current,
  //         start: "top bottom",
  //         end: "bottom top",
  //         scrub: 1,
  //       },
  //     });
  //   }
  // }, { scope: sectionsContainerRef });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section avec parallax */}
      <HeroSection />

      {/* Section FloatingCards - Notre Engagement */}
      <FloatingCardsSection />

      {/* Sections collées - HydratationSection + PurificationSection */}
      <div ref={sectionsContainerRef} className="relative">
        <HydratationSection products={featuredProducts} loading={loading} />
        <PurificationSection products={featuredProducts} loading={loading} />
      </div>

      {/* Section Transparence - Style TrueKind */}
      <TransparentSection />

      {/* Section Bestsellers */}
      <BestSellerSection products={featuredProducts} loading={loading} />

      {/* Section Hydratez-vous Pendant Votre Sommeil */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="w-full">
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] gap-10 items-center mx-auto max-w-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="px-4 lg:px-6"
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
              className="relative aspect-square flex-1 w-full h-full"
            >
              <Image
                src="/images/soir.jpg"
                alt="Soin des mains naturel de nuit"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
