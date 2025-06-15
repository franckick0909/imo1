"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";

export default function FavoritesPage() {
  const favorites = [
    {
      id: 1,
      name: "Crème hydratante visage",
      brand: "Natural Beauty",
      price: 29.99,
      rating: 4.8,
      reviews: 127,
      image: "/api/placeholder/200/200",
      inStock: true,
    },
    {
      id: 2,
      name: "Sérum anti-âge",
      brand: "Premium Care",
      price: 59.99,
      rating: 4.9,
      reviews: 89,
      image: "/api/placeholder/200/200",
      inStock: true,
    },
    {
      id: 3,
      name: "Masque purifiant",
      brand: "Pure Skin",
      price: 19.99,
      rating: 4.6,
      reviews: 203,
      image: "/api/placeholder/200/200",
      inStock: false,
    },
  ];

  const handleRemoveFavorite = (id: number) => {
    // Logic to remove from favorites
    console.log("Remove favorite:", id);
  };

  const handleAddToCart = (id: number) => {
    // Logic to add to cart
    console.log("Add to cart:", id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
            <p className="text-gray-600 mt-1">
              Retrouvez vos produits préférés
            </p>
          </div>
          <div className="flex items-center space-x-2 text-red-600">
            <Heart className="h-5 w-5 fill-current" />
            <span className="font-medium">{favorites.length} favoris</span>
          </div>
        </div>
      </motion.div>

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative mb-4">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">🧴</span>
                </div>
                <button
                  onClick={() => handleRemoveFavorite(product.id)}
                  title="Retirer des favoris"
                  aria-label="Retirer des favoris"
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                >
                  <Heart className="h-4 w-4 text-red-600 fill-current" />
                </button>
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">
                      Rupture de stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{product.brand}</p>
                <h3 className="font-semibold text-gray-900">{product.name}</h3>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviews} avis)
                  </span>
                </div>

                {/* Price */}
                <p className="text-lg font-bold text-emerald-600">
                  {product.price}€
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 mt-4">
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={!product.inStock}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>
                    {product.inStock ? "Ajouter au panier" : "Indisponible"}
                  </span>
                </button>
                <button
                  onClick={() => handleRemoveFavorite(product.id)}
                  title="Supprimer des favoris"
                  aria-label="Supprimer des favoris"
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center"
        >
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun favori
          </h3>
          <p className="text-gray-600 mb-6">
            Vous n&apos;avez pas encore ajouté de produits à vos favoris.
          </p>
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Découvrir nos produits
          </button>
        </motion.div>
      )}

      {/* Quick actions */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
              <ShoppingCart className="h-4 w-4" />
              <span>Tout ajouter au panier</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Heart className="h-4 w-4" />
              <span>Partager ma liste</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="h-4 w-4" />
              <span>Vider les favoris</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
