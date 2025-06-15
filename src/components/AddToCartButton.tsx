"use client";

import { useToast } from "@/components/ui/ToastContainer";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  slug: string;
  images?: { url: string; alt?: string | null }[];
}

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  className = "",
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, items } = useCart();
  const { success, error } = useToast();

  // Vérifier si le produit est déjà dans le panier
  const existingItem = items.find((item: CartItem) => item.id === product.id);
  const currentQuantityInCart = existingItem?.quantity || 0;
  const canAddMore = currentQuantityInCart + quantity <= product.stock;

  const handleAddToCart = async () => {
    if (!canAddMore) {
      error("Stock insuffisant pour cette quantité");
      return;
    }

    setIsAdding(true);

    try {
      // Simuler un délai d'ajout au panier
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Ajouter au panier via le contexte
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || "/placeholder.jpg",
        slug: product.slug,
        stock: product.stock,
      });

      // Feedback visuel avec toast
      success(`${product.name} ajouté au panier !`);
    } catch (err) {
      console.error("Erreur lors de l'ajout au panier:", err);
      error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = product.stock === 0;
  const isMaxQuantityReached = !canAddMore && !isOutOfStock;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || isOutOfStock || isMaxQuantityReached}
      className={`
        flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm
        ${
          isOutOfStock
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : isMaxQuantityReached
              ? "bg-orange-300 text-orange-700 cursor-not-allowed"
              : isAdding
                ? "bg-emerald-500 text-white cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md active:scale-95"
        }
        ${className}
      `}
      title={
        isOutOfStock
          ? "Produit en rupture de stock"
          : isMaxQuantityReached
            ? `Maximum ${product.stock} en stock`
            : `Ajouter ${product.name} au panier`
      }
    >
      {isAdding ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Ajout...</span>
        </div>
      ) : isOutOfStock ? (
        "Rupture de stock"
      ) : isMaxQuantityReached ? (
        "Stock max atteint"
      ) : existingItem ? (
        `Ajouter (+${existingItem.quantity})`
      ) : (
        "Ajouter au panier"
      )}
    </button>
  );
}
