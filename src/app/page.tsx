"use client";

import BestSellerSection from "@/components/BestSellerSection";
import CacheStatus from "@/components/CacheStatus";
import FloatingCardsSection from "@/components/FloatingCardsSection";
import HeroSection from "@/components/HeroSection";
import HydratationSection from "@/components/HydratationSection";
import PurificationSection from "@/components/PurificationSection";
import TransparentSection from "@/components/TransparentSection";
import SophisticatedTitle from "@/components/ui/SophisticatedTitle";
import {
  useFeaturedProductsServer,
  useServerActions,
} from "@/hooks/useServerActions";
import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Home() {
  const { products: featuredProducts, loading } = useFeaturedProductsServer();
  const { prefetchData } = useServerActions();
  const sectionsContainerProductsRef = useRef<HTMLDivElement>(null);

  // Prefetch automatique des données avec Server Actions
  useEffect(() => {
    const timer = setTimeout(() => {
      prefetchData({
        featured: true,
        categories: true,
        products: false,
        delay: 50, // Très rapide pour la page d'accueil
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [prefetchData]);

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
    <div className="min-h-screen bg-white relative">
      {/* Hero Section avec parallax */}
      <HeroSection />

      {/* Section FloatingCards - Notre Engagement */}
      
      <FloatingCardsSection />

      {/* Section Transparence - Style TrueKind */}
      <div className="relative">
        <TransparentSection />
      </div>

      {/* Sections collées - HydratationSection + PurificationSection */}
      <div ref={sectionsContainerProductsRef} className="relative">
        <HydratationSection products={featuredProducts} loading={loading} />
        <PurificationSection products={featuredProducts} loading={loading} />
      </div>

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

      {/* Composant de debug du cache (seulement en développement) */}
      <CacheStatus />
    </div>
  );
}
