"use client";

import { AnimatePresence } from "framer-motion";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import Toast from "./Toast";

// Types pour les toasts
export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
  persistent?: boolean;
}

// Interface du contexte
interface ToastContextType {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  hideToast: (id: string) => void;
  success: (
    message: string,
    options?: Partial<Omit<ToastItem, "message" | "type" | "id">>
  ) => void;
  error: (
    message: string,
    options?: Partial<Omit<ToastItem, "message" | "type" | "id">>
  ) => void;
  info: (
    message: string,
    options?: Partial<Omit<ToastItem, "message" | "type" | "id">>
  ) => void;
  warning: (
    message: string,
    options?: Partial<Omit<ToastItem, "message" | "type" | "id">>
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte des toasts
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(
      "useToast doit être utilisé à l'intérieur d'un ToastProvider"
    );
  }
  return context;
}

// Composant Provider pour les toasts
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Fonction pour ajouter un toast
  const showToast = useCallback((toastData: Omit<ToastItem, "id">) => {
    const id = uuidv4();
    const newToast = {
      id,
      duration: 4000,
      position: "bottom-right" as const,
      ...toastData,
    };

    setToasts((prev) => [...prev, newToast]);

    // Gérer la persistance (localStorage pour redirection)
    if (newToast.persistent && typeof window !== "undefined") {
      localStorage.setItem(
        "immo1_toast",
        JSON.stringify({
          ...newToast,
          timestamp: Date.now(),
        })
      );
    }
  }, []);

  // Fonction pour supprimer un toast
  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    // Nettoyer localStorage si nécessaire
    if (typeof window !== "undefined") {
      localStorage.removeItem("immo1_toast");
    }
  }, []);

  // Méthodes de convenance
  const success = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastItem, "message" | "type" | "id">>
    ) => {
      showToast({ message, type: "success", ...options });
    },
    [showToast]
  );

  const error = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastItem, "message" | "type" | "id">>
    ) => {
      showToast({ message, type: "error", ...options });
    },
    [showToast]
  );

  const info = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastItem, "message" | "type" | "id">>
    ) => {
      showToast({ message, type: "info", ...options });
    },
    [showToast]
  );

  const warning = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastItem, "message" | "type" | "id">>
    ) => {
      showToast({ message, type: "warning", ...options });
    },
    [showToast]
  );

  // Récupérer le toast persistant au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToast = localStorage.getItem("immo1_toast");
      if (savedToast) {
        try {
          const parsedToast = JSON.parse(savedToast);
          // Afficher seulement si le toast a moins de 10 secondes
          if (
            parsedToast.timestamp &&
            Date.now() - parsedToast.timestamp < 10000
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { timestamp, ...toastData } = parsedToast;
            showToast(toastData);
          }
          localStorage.removeItem("immo1_toast");
        } catch (error) {
          console.error("Erreur lors de la récupération du toast:", error);
          localStorage.removeItem("immo1_toast");
        }
      }
    }
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{ showToast, hideToast, success, error, info, warning }}
    >
      {children}
      {/* Container des toasts - Position fixe en bottom-right */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                message={toast.message}
                type={toast.type}
                isVisible={true}
                onClose={() => hideToast(toast.id)}
                duration={toast.duration || 4000}
                position={toast.position || "bottom-right"}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
