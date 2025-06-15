"use client";

import AuthModals from "@/components/AuthModals";
import { useSession } from "@/lib/auth-client";
import { Link } from "next-view-transitions";
import { useState, useEffect } from "react";

export default function HomeClient() {
  const { data: session, isPending } = useSession();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Affichage de chargement pendant l'hydratation ou la vérification de session
  if (!isClient || isPending) {
    return (
      <div className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition duration-200">
        Chargement...
      </div>
    );
  }

  return (
    <>
      {!session ? (
        <button
          onClick={handleOpenSignIn}
          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition duration-200"
        >
          Se connecter
        </button>
      ) : (
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition duration-200"
        >
          Mon dashboard
        </Link>
      )}

      {/* Modales d'authentification */}
      <AuthModals
        showSignIn={showSignIn}
        showSignUp={showSignUp}
        onClose={handleCloseModals}
        onToggleMode={handleToggleMode}
      />
    </>
  );
}
