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

  // Styles selon le type
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600";
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

  // Icônes selon le type
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Animations d'entrée/sortie
  const getAnimationVariants = () => {
    const isTop = position.includes("top");
    const isCenter = position.includes("center");

    return {
      initial: {
        opacity: 0,
        y: isTop ? -50 : 50,
        x: isCenter ? 0 : position.includes("right") ? 50 : -50,
        scale: 0.9,
      },
      animate: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      },
      exit: {
        opacity: 0,
        y: isTop ? -20 : 20,
        x: isCenter ? 0 : position.includes("right") ? 20 : -20,
        scale: 0.95,
      },
    };
  };

  const variants = getAnimationVariants();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-[10000] ${getPositionStyles()}`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
            scale: { duration: 0.2 },
          }}
        >
          <div
            className={`
            ${getToastStyles()} 
            px-6 py-4 rounded-lg shadow-2xl max-w-md min-w-[300px]
            border border-white/20 backdrop-blur-sm
          `}
          >
            <div className="flex items-center space-x-3">
              {getIcon()}
              <p className="text-sm font-medium flex-1">{message}</p>
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors duration-200 ml-4"
                title="Fermer la notification"
                aria-label="Fermer la notification"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Barre de progression optionnelle */}
            {duration > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
