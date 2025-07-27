"use client";

import CheckoutForm from "@/components/CheckoutForm";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "@/lib/auth-client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Charger Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { items, total, itemCount, isHydrated } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [error, setError] = useState("");

  // Rediriger si non authentifié
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/signin?redirect=/checkout");
    }
  }, [session, sessionLoading, router]);

  // Rediriger si panier vide
  useEffect(() => {
    if (isHydrated && itemCount === 0) {
      router.push("/products");
    }
  }, [isHydrated, itemCount, router]);

  // Créer le Payment Intent Stripe
  useEffect(() => {
    if (!isHydrated || itemCount === 0 || !session) return;

    const createPaymentIntent = async () => {
      setIsCreatingPayment(true);
      setError("");

      try {
        const response = await fetch("/api/orders/create-with-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la création du paiement"
          );
        }

        const data = await response.json();
        setClientSecret(data.paymentIntent.client_secret);
      } catch (err) {
        console.error("Erreur Payment Intent:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la création du paiement"
        );
      } finally {
        setIsCreatingPayment(false);
      }
    };

    createPaymentIntent();
  }, [items, itemCount, session, isHydrated]);

  // Options Stripe Elements (constantes pour éviter les re-renders)
  const stripeOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#059669", // emerald-600
          colorBackground: "#ffffff",
          colorText: "#374151", // gray-700
          colorDanger: "#dc2626", // red-600
          fontFamily: "Inter, system-ui, sans-serif",
          spacingUnit: "4px",
          borderRadius: "8px",
        },
      },
    }),
    [clientSecret]
  );

  // États de chargement
  if (sessionLoading || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Utilisateur non connecté
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder au checkout.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=/checkout")}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Panier vide
  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Panier vide</h1>
          <p className="text-gray-600 mb-6">
            Votre panier est vide. Ajoutez des produits pour continuer.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Découvrir nos produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Finaliser votre commande
            </h1>
            <p className="text-gray-600">
              {itemCount} article{itemCount > 1 ? "s" : ""} • Total: €
              {total.toFixed(2)}
            </p>
          </div>

          {/* Contenu principal */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            {/* Formulaire de checkout */}
            <div className="lg:col-span-1">
              {isCreatingPayment ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Préparation du paiement...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              ) : clientSecret ? (
                <Elements 
                  key={clientSecret}
                  options={stripeOptions} 
                  stripe={stripePromise}
                >
                  <CheckoutForm />
                </Elements>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Initialisation...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1 mt-10 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Résumé de commande
                </h2>

                {/* Articles */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.image && item.image !== "/placeholder.jpg" ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-400"
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
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totaux */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Sous-total</p>
                    <p>€{total.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <p>Frais de livraison</p>
                    <p>Calculés à l&apos;étape suivante</p>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900 mt-4 pt-4 border-t border-gray-200">
                    <p>Total</p>
                    <p>€{total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Sécurité */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Paiement sécurisé par Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
