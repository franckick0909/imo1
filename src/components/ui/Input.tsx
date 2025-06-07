"use client";

import { motion } from "framer-motion";
import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === "password";
    const actualType = isPassword && showPassword ? "text" : type;

    // États visuels
    const getInputStyles = () => {
      const baseStyles =
        "w-full px-4 py-[10px] bg-transparent border-0 border-b-1 transition-all duration-200 focus:outline-none text-gray-900 placeholder-gray-500";

      if (error) {
        return `${baseStyles} border-b-red-500`;
      }
      if (success) {
        return `${baseStyles} border-b-green-500`;
      }
      if (isFocused) {
        return `${baseStyles} border-b-indigo-500`;
      }
      return `${baseStyles} border-b-gray-300 hover:border-b-gray-400 focus:border-b-indigo-500`;
    };

    const getLabelStyles = () => {
      const baseStyles =
        "block text-sm font-medium transition-colors duration-200";

      if (error) return `${baseStyles} text-red-700`;
      if (success) return `${baseStyles} text-green-700`;
      return `${baseStyles} text-gray-700`;
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && <label className={getLabelStyles()}>{label}</label>}

        {/* Input Container */}
        <div className="relative">
          <input
            ref={ref}
            type={actualType}
            className={`${getInputStyles()} ${isPassword ? "pr-12" : ""} ${className || ""}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Password Toggle Button */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <motion.p
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}

        {success && !error && (
          <motion.p
            className="mt-2 text-sm text-green-600 flex items-center gap-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Valide
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
