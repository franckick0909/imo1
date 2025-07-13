"use client";

import { useFavorites } from "@/stores/dashboard-store";
import { motion } from "framer-motion";
import {
  Heart,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function FavoritesPage() {
  const {
    favorites,
    isLoadingFavorites,
    loadFavorites,
    removeFromFavorites,
    clearFavorites,
  } = useFavorites();

  // Charger les favoris au montage
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await removeFromFavorites(productId);
      // Le store gère automatiquement la mise à jour avec optimistic update
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error);
    }
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implémenter l'ajout au panier
    console.log("Add to cart:", productId);
  };

  const handleClearAllFavorites = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider tous vos favoris ?")) {
      try {
        await clearFavorites();
      } catch (error) {
        console.error("Erreur lors du vidage des favoris:", error);
      }
    }
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
            {isLoadingFavorites ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="font-medium">{favorites.length} favoris</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoadingFavorites && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">
            Chargement de vos favoris...
          </span>
        </div>
      )}

      {/* Favorites Grid */}
      {!isLoadingFavorites && favorites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product, index) => (
            <motion.div
              key={`favorite-${product.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative mb-4">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <span className="text-4xl">🧴</span>
                  )}
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
      )}

      {/* Empty State */}
      {!isLoadingFavorites && favorites.length === 0 && (
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
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Découvrir nos produits
          </Link>
        </motion.div>
      )}

      {/* Quick actions */}
      {!isLoadingFavorites && favorites.length > 0 && (
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
            <button
              onClick={() => {
                // TODO: Implémenter l'ajout de tous les favoris au panier
                console.log("Add all to cart");
              }}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Tout ajouter au panier</span>
            </button>
            <button
              onClick={() => {
                // TODO: Implémenter le partage de la liste
                console.log("Share list");
              }}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span>Partager ma liste</span>
            </button>
            <button
              onClick={handleClearAllFavorites}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vider les favoris</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
