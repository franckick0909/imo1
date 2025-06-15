"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
}

const Toast = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 6000,
  position = "top-center",
}: ToastProps) => {
  // Auto-hide après la durée spécifiée
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Styles selon le type avec des couleurs plus modernes
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-emerald-100/50";
      case "error":
        return "bg-red-50 text-red-800 border border-red-200 shadow-red-100/50";
      case "warning":
        return "bg-amber-50 text-amber-800 border border-amber-200 shadow-amber-100/50";
      case "info":
        return "bg-blue-50 text-blue-800 border border-blue-200 shadow-blue-100/50";
      default:
        return "bg-gray-50 text-gray-800 border border-gray-200 shadow-gray-100/50";
    }
  };

  // Position selon le prop
  const getPositionStyles = () => {
    switch (position) {
      case "top-center":
        return "top-6 left-1/2 -translate-x-1/2";
      case "top-right":
        return "top-6 right-6";
      case "bottom-center":
        return "bottom-6 left-1/2 -translate-x-1/2";
      case "bottom-right":
        return "bottom-6 right-6";
      default:
        return "top-6 left-1/2 -translate-x-1/2";
    }
  };

  // Couleurs d'icônes selon le type
  const getIconStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-100 text-emerald-600";
      case "error":
        return "bg-red-100 text-red-600";
      case "warning":
        return "bg-amber-100 text-amber-600";
      case "info":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Couleur de la barre de progression
  const getProgressBarColor = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-emerald-400 to-emerald-500";
      case "error":
        return "bg-gradient-to-r from-red-400 to-red-500";
      case "warning":
        return "bg-gradient-to-r from-amber-400 to-amber-500";
      case "info":
        return "bg-gradient-to-r from-blue-400 to-blue-500";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500";
    }
  };

  // Icônes selon le type
  const getIcon = () => {
    const iconClasses = `w-6 h-6 rounded-full flex items-center justify-center ${getIconStyles()}`;

    switch (type) {
      case "success":
        return (
          <div className={iconClasses}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className={iconClasses}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className={iconClasses}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className={iconClasses}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Couleur du bouton de fermeture
  const getCloseButtonStyles = () => {
    switch (type) {
      case "success":
        return "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100";
      case "error":
        return "text-red-500 hover:text-red-700 hover:bg-red-100";
      case "warning":
        return "text-amber-500 hover:text-amber-700 hover:bg-amber-100";
      case "info":
        return "text-blue-500 hover:text-blue-700 hover:bg-blue-100";
      default:
        return "text-gray-500 hover:text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-[1000] overflow-hidden ${getPositionStyles()}`}
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 120,
            mass: 0.3,
          }}
        >
          <div
            className={`
            ${getToastStyles()} 
            px-6 py-4 rounded-2xl backdrop-blur-sm shadow-xl max-w-md min-w-[320px]
            transition-all duration-300
          `}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-relaxed break-words">
                  {message}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 
                          hover:scale-110 active:scale-95 ${getCloseButtonStyles()}`}
                title="Fermer la notification"
                aria-label="Fermer la notification"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Barre de progression avec couleurs assorties */}
            {duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 overflow-hidden rounded-b-2xl">
                <motion.div
                  className={`h-full ${getProgressBarColor()} shadow-sm rounded-b-2xl`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
