"use client";

import AuthModals from "@/components/AuthModals";
import { useSession } from "@/lib/auth-client";
import { Link } from "next-view-transitions";
import { useState } from "react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  /*  const handleOpenSignUp = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };  */

  const handleOpenSignIn = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleCloseModals = () => {
    setShowSignIn(false);
    setShowSignUp(false);
  };

  const handleToggleMode = () => {
    if (showSignIn) {
      setShowSignIn(false);
      setShowSignUp(true);
    } else {
      setShowSignUp(false);
      setShowSignIn(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Votre peau mérite</span>
            <span className="block text-emerald-600">
              le meilleur de la nature
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Découvrez notre gamme de crèmes bio artisanales, formulées avec des
            ingrédients naturels pour révéler la beauté authentique de votre
            peau.
          </p>

          {/* Affichage conditionnel selon l'état de connexion */}
          {!session ? (
            // Boutons pour utilisateurs non connectés
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/products"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10 transition duration-200"
                >
                  Découvrir nos produits
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <button
                  onClick={handleOpenSignIn}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition duration-200"
                >
                  Se connecter
                </button>
              </div>
            </div>
          ) : (
            // Boutons pour utilisateurs connectés
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/products"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10 transition duration-200"
                >
                  Découvrir nos produits
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition duration-200"
                >
                  Mon compte
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    100% Bio & Naturel
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Tous nos produits sont certifiés biologiques, formulés avec
                    des ingrédients naturels soigneusement sélectionnés.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Fait avec Amour
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Chaque crème est préparée artisanalement en petites
                    quantités pour garantir fraîcheur et qualité.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Livraison Rapide
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Recevez vos produits rapidement et en parfait état grâce à
                    notre emballage éco-responsable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produits en vedette placeholder */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Nos Produits Phares
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Une sélection de nos meilleures crèmes pour prendre soin de votre
              peau au quotidien
            </p>
          </div>

          {/* Grid des produits - sera remplacé par de vrais produits */}
          <div className="mt-12 grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
            {[1, 2, 3].map((product) => (
              <div key={product} className="group relative">
                <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <span aria-hidden="true" className="absolute inset-0" />
                      Crème Bio #{product}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Soin naturel premium
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">€29,99</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24">
          <div className="bg-emerald-600 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  <span className="block">Prêt à chouchouter votre peau ?</span>
                  <span className="block text-emerald-200">
                    Découvrez nos crèmes bio dès maintenant.
                  </span>
                </h2>
              </div>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50 transition duration-200"
                  >
                    Voir tous nos produits
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modales d'authentification */}
      <AuthModals
        showSignIn={showSignIn}
        showSignUp={showSignUp}
        onClose={handleCloseModals}
        onToggleMode={handleToggleMode}
      />
    </div>
  );
}
