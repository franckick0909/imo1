"use client";

import { signIn, signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useState } from "react";

interface AuthModalsProps {
  showSignIn: boolean;
  showSignUp: boolean;
  onClose: () => void;
}

export default function AuthModals({
  showSignIn,
  showSignUp,
  onClose,
}: AuthModalsProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp.email({
          email,
          password,
          name,
        });
      } else {
        await signIn.email({
          email,
          password,
        });
      }
      onClose();
    } catch (error) {
      console.error("Erreur d'authentification:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!showSignIn && !showSignUp) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {showSignUp ? "Créer un compte" : "Se connecter"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
            title="Fermer"
          >
            <svg
              className="w-6 h-6"
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

        {/* Contenu */}
        <div className="p-6">
          <form
            onSubmit={(e) => handleAuth(e, showSignUp)}
            className="space-y-4"
          >
            {showSignUp && (
              <div>
                <label
                  htmlFor="modal-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom complet
                </label>
                <input
                  type="text"
                  id="modal-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre nom complet"
                  required
                />
              </div>
            )}

            <div>
              <label
                htmlFor="modal-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="modal-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="modal-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="modal-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
                required
                minLength={8}
              />
              {showSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 caractères
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-200"
            >
              {loading
                ? "Chargement..."
                : showSignUp
                ? "Créer mon compte"
                : "Me connecter"}
            </button>
          </form>

          {/* Lien mot de passe oublié - uniquement pour la connexion */}
          {showSignIn && (
            <div className="mt-3 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500"
                onClick={handleClose}
              >
                Mot de passe oublié ?
              </Link>
            </div>
          )}

          {/* Lien pour changer de mode */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {showSignUp ? "Déjà un compte ? " : "Pas encore de compte ? "}
              <button
                onClick={() => {
                  resetForm();
                  // On ferme et le parent gère l'ouverture de l'autre modale
                }}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {showSignUp ? "Se connecter" : "S'inscrire"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
