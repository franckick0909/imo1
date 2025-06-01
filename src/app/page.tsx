"use client";

import AuthModals from "@/components/AuthModals";
import Header from "@/components/Header";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const router = useRouter();

  // Redirection vers dashboard si connecté
  useEffect(() => {
    if (session && !isPending) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleSignInClick = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const handleSignUpClick = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleCloseModals = () => {
    setShowSignIn(false);
    setShowSignUp(false);
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  // Si connecté, on ne devrait pas voir cette page (redirection en cours)
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
      />

      {/* Hero Section */}
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Trouvez votre{" "}
              <span className="text-indigo-600">bien immobilier</span> idéal
            </h1>
            <p className="text-lg leading-8 text-gray-600 max-w-2xl mx-auto mb-8">
              Découvrez notre plateforme moderne pour acheter, vendre ou louer
              votre propriété. Des milliers d&apos;annonces vous attendent.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleSignUpClick}
                className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 transition duration-200 font-semibold"
              >
                Commencer maintenant
              </button>
              <button
                onClick={handleSignInClick}
                className="text-gray-900 px-8 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200 font-semibold"
              >
                J&apos;ai déjà un compte
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Recherche avancée
              </h3>
              <p className="text-gray-600">
                Trouvez rapidement le bien qui correspond à vos critères grâce à
                nos filtres intelligents.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Annonces vérifiées
              </h3>
              <p className="text-gray-600">
                Toutes nos annonces sont vérifiées pour vous garantir des
                informations fiables et actualisées.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Suivi personnalisé
              </h3>
              <p className="text-gray-600">
                Sauvegardez vos biens favoris et recevez des alertes pour les
                nouvelles annonces qui vous intéressent.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à commencer votre recherche ?
            </h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Rejoignez des milliers d&apos;utilisateurs qui font confiance à
              Immo1 pour leurs projets immobiliers.
            </p>
            <button
              onClick={handleSignUpClick}
              className="bg-white text-indigo-600 px-8 py-3 rounded-md hover:bg-gray-50 transition duration-200 font-semibold"
            >
              Créer mon compte gratuitement
            </button>
          </div>
        </div>
      </main>

      {/* Modales d'authentification */}
      <AuthModals
        showSignIn={showSignIn}
        showSignUp={showSignUp}
        onClose={handleCloseModals}
      />
    </div>
  );
}
