"use client";

import { forgetPassword } from "@/lib/auth-client";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Veuillez entrer votre adresse email");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      setSuccess(true);
      setMessage(
        "Un email de réinitialisation a été envoyé à votre adresse email."
      );
    } catch (error: unknown) {
      console.error("Erreur:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Veuillez réessayer.";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-gray-900">Immo1</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Email envoyé avec succès
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Vérifiez votre boîte email et cliquez sur le lien pour
                    réinitialiser votre mot de passe.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/"
                    className="text-sm font-medium text-green-800 hover:text-green-700"
                  >
                    ← Retour à l&apos;accueil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="votre@email.com"
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  success
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Envoi en cours..."
                  : "Envoyer le lien de réinitialisation"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                ← Retour à l&apos;accueil
              </Link>
              <div className="text-sm">
                <span className="text-gray-600">
                  Vous vous souvenez de votre mot de passe ?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Se connecter
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
