"use client";

import { useSession } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-2xl w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Icône de succès */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Titre principal */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Paiement réussi !
          </h1>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Votre commande a été confirmée avec succès.
          </p>

          {/* Section email de confirmation */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                  📧 Email de confirmation envoyé !
                </h3>
                <p className="text-emerald-700 mb-3">
                  Un email de confirmation a été envoyé à{" "}
                  <span className="font-medium">
                    {session?.user?.email || "votre adresse email"}
                  </span>
                </p>
                <div className="text-sm text-emerald-600">
                  <p className="font-medium mb-2">Cet email contient :</p>
                  <ul className="space-y-1">
                    <li>• Récapitulatif complet de votre commande</li>
                    <li>• Détails des produits commandés</li>
                    <li>• Adresses de livraison et facturation</li>
                    <li>• Informations de suivi de livraison</li>
                    <li>• Facture détaillée</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Informations sur le paiement */}
          {paymentIntent && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <h4 className="font-medium text-gray-900 mb-2">
                Informations de paiement
              </h4>
              <p className="text-sm text-gray-700">
                <span className="font-medium">ID de paiement :</span>{" "}
                {paymentIntent.substring(0, 27)}...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Conservez cet identifiant pour vos dossiers
              </p>
            </div>
          )}

          {/* Prochaines étapes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              🚀 Prochaines étapes
            </h3>
            <div className="space-y-2 text-blue-700">
              <div className="flex items-start">
                <span className="font-medium text-blue-600 mr-2">1.</span>
                <span>Votre commande va être préparée dans les plus brefs délais</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium text-blue-600 mr-2">2.</span>
                <span>Vous recevrez un email avec le numéro de suivi</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium text-blue-600 mr-2">3.</span>
                <span>Livraison estimée : 2-5 jours ouvrés</span>
              </div>
            </div>
          </div>

          {/* Conseil sur les spams */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mr-3 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Email non reçu ?
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Vérifiez votre dossier spam/courrier indésirable. Ajoutez{" "}
                  <span className="font-medium">noreply@biocreme.com</span> à vos contacts.
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => (window.location.href = "/dashboard/orders")}
              className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Voir mes commandes
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Retour à l&apos;accueil
            </button>
          </div>

          {/* Message de remerciement */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Merci pour votre confiance ! 💚
            </p>
            <p className="text-sm text-gray-500 mt-1">
              L&apos;équipe BioCreme
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
