"use client";

import { useSession } from "@/lib/auth-client";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isHydrated: boolean;
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, {
          type: "REMOVE_ITEM",
          payload: action.payload.id,
        });
      }

      const newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.min(action.payload.quantity, item.stock) }
          : item
      );

      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case "CLEAR_CART": {
      return { items: [], total: 0, itemCount: 0 };
    }

    case "LOAD_CART": {
      const items = action.payload;
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      return { items, total, itemCount };
    }

    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Surveiller la session utilisateur
  const { data: session } = useSession();

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      const savedUserId = localStorage.getItem("cartUserId");

      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        if (Array.isArray(cartItems)) {
          dispatch({ type: "LOAD_CART", payload: cartItems });
        }
      }

      if (savedUserId) {
        setLastUserId(savedUserId);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
      localStorage.removeItem("cart");
      localStorage.removeItem("cartUserId");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Vider le panier lors du changement d'utilisateur ou déconnexion
  useEffect(() => {
    if (!isHydrated) return;

    const currentUserId = session?.user?.id || null;

    // Si l'utilisateur change ou se déconnecte, vider le panier
    if (lastUserId && lastUserId !== currentUserId) {
      dispatch({ type: "CLEAR_CART" });
      localStorage.removeItem("cart");
    }

    // Mettre à jour l'ID utilisateur stocké
    if (currentUserId) {
      localStorage.setItem("cartUserId", currentUserId);
      setLastUserId(currentUserId);
    } else {
      localStorage.removeItem("cartUserId");
      setLastUserId(null);
    }
  }, [session?.user?.id, lastUserId, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("cart", JSON.stringify(state.items));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du panier:", error);
      }
    }
  }, [state.items, isHydrated]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
