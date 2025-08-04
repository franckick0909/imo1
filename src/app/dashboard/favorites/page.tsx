"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastContainer";
import { useCart } from "@/contexts/CartContext";
import {
  clearAllFavoritesAction,
  getDashboardFavoritesAction,
  removeFromFavoritesAction,
} from "@/lib/dashboard-actions";
import {
  Heart,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface Favorite {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  inStock: boolean;
  image: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  addedAt: Date;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { addItem } = useCart();
  const { success, error } = useToast();

  // Charger les favoris
  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getDashboardFavoritesAction();
      if (result.success) {
        setFavorites(result.data as Favorite[]);
      } else {
        error("Erreur lors du chargement des favoris");
      }
    } catch {
      error("Erreur lors du chargement des favoris");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  // Charger les favoris au montage
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemoveFavorite = async (favoriteId: string) => {
    setIsRemoving(favoriteId);
    try {
      const result = await removeFromFavoritesAction(favoriteId);
      if (result.success) {
        setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
        success("Produit retiré des favoris");
      } else {
        error(result.error || "Erreur lors de la suppression");
      }
    } catch {
      error("Erreur lors de la suppression du favori");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = async (favorite: Favorite) => {
    if (!favorite.inStock) {
      error("Produit en rupture de stock");
      return;
    }

    try {
      await addItem({
        id: favorite.productId,
        name: favorite.name,
        price: favorite.price,
        image: favorite.image,
        slug: favorite.slug,
        stock: favorite.stock,
      });
      success(`${favorite.name} ajouté au panier !`);
    } catch {
      error("Erreur lors de l'ajout au panier");
    }
  };

  const handleClearAllFavorites = async () => {
    try {
      const result = await clearAllFavoritesAction();
      if (result.success) {
        setFavorites([]);
        success("Tous les favoris ont été supprimés");
      } else {
        error(result.error || "Erreur lors de la suppression");
      }
    } catch {
      error("Erreur lors de la suppression des favoris");
    }
  };

  const handleAddAllToCart = async () => {
    const availableFavorites = favorites.filter((fav) => fav.inStock);

    if (availableFavorites.length === 0) {
      error("Aucun produit disponible en stock");
      return;
    }

    try {
      for (const favorite of availableFavorites) {
        await addItem({
          id: favorite.productId,
          name: favorite.name,
          price: favorite.price,
          image: favorite.image,
          slug: favorite.slug,
          stock: favorite.stock,
        });
      }
      success(`${availableFavorites.length} produits ajoutés au panier !`);
    } catch {
      error("Erreur lors de l'ajout au panier");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
            <p className="text-gray-600 mt-1">
              Retrouvez vos produits préférés
            </p>
          </div>
          <div className="flex items-center space-x-2 text-red-600">
            <Heart className="h-5 w-5 fill-current" />
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="font-medium">{favorites.length} favoris</span>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">
            Chargement de vos favoris...
          </span>
        </div>
      )}

      {/* Favorites Grid */}
      {!isLoading && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative mb-3">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src={favorite.image}
                    alt={favorite.name}
                    className="w-full h-full object-cover"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 20vw"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  disabled={isRemoving === favorite.id}
                  title="Retirer des favoris"
                  aria-label="Retirer des favoris"
                  className="absolute top-1 right-1 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {isRemoving === favorite.id ? (
                    <Loader2 className="h-3 w-3 animate-spin text-red-600" />
                  ) : (
                    <Heart className="h-3 w-3 text-red-600 fill-current" />
                  )}
                </button>
                {!favorite.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium px-2 text-center">
                      Rupture
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 truncate">
                  {favorite.category.name}
                </p>
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">
                  {favorite.name}
                </h3>

                {/* Price */}
                <p className="text-base font-bold text-emerald-600">
                  {favorite.price.toFixed(2)}€
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 mt-3">
                <button
                  type="button"
                  onClick={() => handleAddToCart(favorite)}
                  disabled={!favorite.inStock}
                  className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-emerald-600 text-white text-sm-responsive rounded-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {favorite.inStock ? "Ajouter" : "Indisponible"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  disabled={isRemoving === favorite.id}
                  title="Supprimer des favoris"
                  aria-label="Supprimer des favoris"
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                >
                  {isRemoving === favorite.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && favorites.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
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
        </div>
      )}

      {/* Quick actions */}
      {!isLoading && favorites.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddAllToCart}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Tout ajouter au panier</span>
            </button>
            <button
              onClick={() => setShowClearDialog(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vider les favoris</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAllFavorites}
        title="Vider les favoris"
        message="Êtes-vous sûr de vouloir supprimer tous vos favoris ? Cette action ne peut pas être annulée."
        confirmText="Supprimer tout"
        cancelText="Annuler"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
