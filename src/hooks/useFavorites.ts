"use client";

import { useToast } from "@/components/ui/ToastContainer";
import {
  addToFavoritesAction,
  getDashboardFavoritesAction,
  removeFromFavoritesAction,
} from "@/lib/dashboard-actions";
import { useEffect, useState } from "react";

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

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { success, error } = useToast();

  // Charger les favoris
  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const result = await getDashboardFavoritesAction();
      if (result.success) {
        setFavorites(result.data as Favorite[]);
      } else {
        console.error("Erreur lors du chargement des favoris:", result.error);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des favoris:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si un produit est en favori
  const isFavorite = (productId: string) => {
    return favorites.some((fav) => fav.productId === productId);
  };

  // Ajouter aux favoris
  const addToFavorites = async (productId: string) => {
    if (isUpdating === productId) return;

    setIsUpdating(productId);
    try {
      const result = await addToFavoritesAction(productId);
      if (result.success) {
        // Recharger les favoris pour avoir les données complètes
        await loadFavorites();
        success("Produit ajouté aux favoris");
      } else {
        error(result.error || "Erreur lors de l'ajout aux favoris");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout aux favoris:", err);
      error("Erreur lors de l'ajout aux favoris");
    } finally {
      setIsUpdating(null);
    }
  };

  // Retirer des favoris
  const removeFromFavorites = async (productId: string) => {
    if (isUpdating === productId) return;

    setIsUpdating(productId);
    try {
      const favorite = favorites.find((fav) => fav.productId === productId);
      if (!favorite) {
        error("Favori non trouvé");
        return;
      }

      const result = await removeFromFavoritesAction(favorite.id);
      if (result.success) {
        setFavorites((prev) =>
          prev.filter((fav) => fav.productId !== productId)
        );
        success("Produit retiré des favoris");
      } else {
        error(result.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du favori:", err);
      error("Erreur lors de la suppression du favori");
    } finally {
      setIsUpdating(null);
    }
  };

  // Toggle favoris
  const toggleFavorite = async (productId: string) => {
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(productId);
    }
  };

  // Charger les favoris au montage
  useEffect(() => {
    loadFavorites();
  }, []);

  return {
    favorites,
    isLoading,
    isUpdating,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    loadFavorites,
  };
}
