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

  // Styles selon le type avec glassmorphism
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-500 text-white border border-emerald-400";
      case "error":
        return "bg-rose-500 text-white border border-rose-400";
      case "warning":
          return "bg-orange-500 text-white border border-amber-400";
      case "info":
        return "bg-sky-500 text-white border border-sky-400";
      default:
        return "bg-zinc-500 text-white border border-zinc-400";
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
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xs">
            <svg
              className="w-4 h-4 text-white"
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
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xs">
            <svg
              className="w-4 h-4 text-white"
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
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xs">
            <svg
              className="w-4 h-4 text-white"
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
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xs">
            <svg
              className="w-4 h-4 text-white"
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
            px-6 py-4 rounded-2xl backdrop-blur-xl shadow-2xl max-w-md min-w-[320px]
            transition-all duration-300
            ring-1 ring-white/20
          `}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed break-words">
                  {message}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-all duration-200 
                          text-white/70 hover:text-white hover:scale-110 active:scale-95"
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

            {/* Barre de progression stylée avec bords arrondis */}
            {duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 overflow-hidden rounded-b-2xl w-[96%] mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-white/80 to-white/60 shadow-sm rounded-b-2xl"
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
