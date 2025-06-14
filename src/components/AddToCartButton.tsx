"use client";

import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
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

  const handleAddToCart = async () => {
    if (product.stock < quantity) {
      alert("Stock insuffisant");
      return;
    }

    setIsAdding(true);

    try {
      // Simuler un délai d'ajout au panier
      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: Implémenter la logique réelle du panier
      // Peut-être avec un contexte ou une API
      console.log(`Ajout au panier: ${product.name} x${quantity}`);

      // Feedback visuel
      alert(`${product.name} ajouté au panier !`);
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      alert("Erreur lors de l'ajout au panier");
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = product.stock < quantity;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || isOutOfStock}
      className={`
        flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200
        ${
          isOutOfStock
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : isAdding
              ? "bg-emerald-500 text-white cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md active:scale-95"
        }
        ${className}
      `}
    >
      {isAdding ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Ajout...</span>
        </div>
      ) : isOutOfStock ? (
        "Rupture de stock"
      ) : (
        "Ajouter au panier"
      )}
    </button>
  );
}
