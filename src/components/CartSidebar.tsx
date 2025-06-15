"use client";

import { useCart } from "@/contexts/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useTransitionRouter } from "next-view-transitions";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Portal from "./Portal";

export default function CartSidebar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useTransitionRouter();
  const pathname = usePathname();
  const { items, total, itemCount, updateQuantity, removeItem, isHydrated } =
    useCart();

  // Fermer le panier quand on change de page
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname]);

  // Fermer le panier avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener("keydown", handleEscape);
      // Empêcher le scroll du body quand le panier est ouvert
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  // Afficher un état de chargement pendant l'hydratation
  const displayItemCount = isHydrated ? itemCount : 0;
  const displayItems = isHydrated ? items : [];
  const displayTotal = isHydrated ? total : 0;

  return (
    <>
      {/* Bouton Panier */}
      <div className="relative">
        <button
          aria-label="Panier"
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative bg-zinc-100 hover:bg-zinc-200 text-black p-1.5 sm:p-2 h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 rounded-full transition-colors duration-300 cursor-pointer flex items-center justify-center"
        >
          {/* Icône panier */}
          <svg
            className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"
            />
          </svg>
          {/* Badge du nombre d'articles */}
          {displayItemCount > 0 && (
            <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-emerald-500 text-white text-xs rounded-full h-4 sm:h-5 w-4 sm:w-5 flex items-center justify-center font-medium">
              {displayItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sidebar avec Portal pour l'overlay */}
      <Portal>
        <AnimatePresence>
          {isCartOpen && (
            <>
              {/* Overlay pour fermer en cliquant à l'extérieur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/30 z-[9998]"
                onClick={() => setIsCartOpen(false)}
              />

              {/* Sidebar du panier */}
              <motion.div
                initial={{ clipPath: "inset(0 0 0 100%)" }}
                animate={{ clipPath: "inset(0 0 0 0)" }}
                exit={{ clipPath: "inset(0 0 0 100%)" }}
                transition={{
                  duration: 0.7,
                  ease: [0.76, 0, 0.24, 1] as const,
                }}
                className="fixed right-0 top-0 bg-white shadow-2xl flex flex-col z-[9999] border-l border-emerald-300"
                style={{
                  height: "100vh",
                  width: "500px",
                  maxWidth: "90vw",
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Mon Panier ({displayItemCount})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 sm:p-2 rounded-full transition-all text-gray-700 cursor-pointer hover:rotate-180 duration-300"
                    aria-label="Fermer le panier"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Contenu du panier */}
                <div className="flex-1 overflow-y-auto">
                  {!isHydrated ? (
                    // État de chargement pendant l'hydratation
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500">Chargement du panier...</p>
                    </div>
                  ) : displayItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <svg
                        className="w-16 h-16 text-gray-400 mb-4"
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Votre panier est vide
                      </h3>
                      <p className="text-gray-500 text-center mb-6">
                        Découvrez nos produits de soins naturels et ajoutez-les
                        à votre panier !
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCartOpen(false);
                          router.push("/products");
                        }}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                      >
                        Découvrir nos produits
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {displayItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          {/* Image */}
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.image && item.image !== "/placeholder.jpg" ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 3a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Détails */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={() => setIsCartOpen(false)}
                              className="font-medium text-gray-900 hover:text-emerald-600 transition-colors block truncate"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              €{item.price.toFixed(2)} / unité
                            </p>
                            <p className="text-sm font-medium text-emerald-600 mt-1">
                              Total: €{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Contrôles quantité */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 text-zinc-700">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                disabled={item.quantity <= 1}
                                aria-label="Diminuer la quantité"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                  />
                                </svg>
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                disabled={item.quantity >= item.stock}
                                aria-label="Augmenter la quantité"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                              aria-label="Supprimer cet article"
                              title="Supprimer cet article"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer avec total et checkout */}
                {isHydrated && displayItems.length > 0 && (
                  <div className="border-t border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-emerald-600">
                        €{displayTotal.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/checkout");
                      }}
                      className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Procéder au paiement
                    </button>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/products");
                      }}
                      className="w-full mt-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Continuer mes achats
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
