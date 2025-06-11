"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartSidebar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useTransitionRouter();
  const pathname = usePathname();

  // Mock cart items pour l'exemple
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Crème Hydratante Bio à l'Aloe Vera",
      price: 29.99,
      quantity: 1,
      image: "/placeholder.jpg",
    },
    {
      id: 2,
      name: "Sérum Anti-Âge Vitamine C",
      price: 49.99,
      quantity: 2,
      image: "/placeholder.jpg",
    },
    {
      id: 3,
      name: "Masque Argile Verte & Thé Vert",
      price: 24.99,
      quantity: 1,
      image: "/placeholder.jpg",
    },
  ]);

  // Fermer le panier quand on change de page
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

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
          {totalItems > 0 && (
            <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-emerald-500 text-white text-xs rounded-full h-4 sm:h-5 w-4 sm:w-5 flex items-center justify-center font-medium">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sidebar - Sans Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 0 100%)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            exit={{ clipPath: "inset(0 0 0 100%)" }}
            transition={{
              duration: 0.7,
              ease: [0.76, 0, 0.24, 1],
            }}
            className="fixed right-0 top-0 bg-white shadow-2xl flex flex-col z-[9999] border-l border-emerald-300"
            style={{
              height: "100vh",
              width: "500px",
              maxWidth: "90vw",
            }}
            // Responsive avec CSS custom properties pour plus de contrôle
            data-responsive-width="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Mon Panier ({totalItems})
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
              {cartItems.length === 0 ? (
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
                    Découvrez nos produits de soins naturels et ajoutez-les à
                    votre panier !
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
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
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
                      </div>

                      {/* Détails */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-emerald-600 font-semibold mt-1">
                          €{item.price.toFixed(2)}
                        </p>

                        {/* Contrôles quantité */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-300 rounded text-gray-700">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-gray-100 transition-colors"
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
                                  strokeWidth={1.5}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="px-3 py-1 text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-gray-100 transition-colors"
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
                                  strokeWidth={1.5}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            aria-label="Supprimer l'article"
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
                                strokeWidth={1.5}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Prix total pour cet article */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer avec total et boutons */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Sous-total */}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium text-gray-900">Sous-total</span>
                  <span className="font-bold text-emerald-600">
                    €{cartTotal.toFixed(2)}
                  </span>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Frais de livraison calculés à l&apos;étape suivante
                </p>

                {/* Boutons d'action */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/cart");
                    }}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Voir le panier complet
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/checkout");
                    }}
                    className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Passer la commande
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Continuer mes achats
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
