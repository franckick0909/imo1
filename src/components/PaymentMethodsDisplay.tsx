"use client";

import { getAvailablePaymentMethodsAction } from "@/lib/stripe-actions";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  fees: number;
  popular: boolean;
}

interface PaymentMethodsDisplayProps {
  country?: string;
  amount: number;
  onMethodSelect?: (methodId: string) => void;
  selectedMethod?: string;
}

export default function PaymentMethodsDisplay({
  country = "FR",
  amount,
  onMethodSelect,
  selectedMethod,
}: PaymentMethodsDisplayProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getAvailablePaymentMethodsAction({
          country,
          amount,
        });

        if (result.success) {
          setPaymentMethods(result.paymentMethods);
        } else {
          setError("Erreur lors du chargement des moyens de paiement");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement des moyens de paiement");
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentMethods();
  }, [country, amount]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Moyens de paiement disponibles
        </h3>
        <p className="text-sm text-gray-600">
          Sélectionnez votre méthode de paiement préférée
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                selectedMethod === method.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => onMethodSelect?.(method.id)}
            >
              {/* Badge populaire */}
              {method.popular && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                  Populaire
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{method.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>
                  </div>
                </div>

                {/* Frais */}
                <div className="text-right">
                  <div className="text-sm text-gray-500">Frais</div>
                  <div className="text-sm font-medium text-gray-900">
                    {method.fees > 0 ? `${method.fees.toFixed(2)}€` : "Gratuit"}
                  </div>
                </div>
              </div>

              {/* Indicateur de sélection */}
              {selectedMethod === method.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
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
              )}
            </motion.div>
          ))}
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            💡 Conseils pour économiser
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • Le <strong>prélèvement SEPA</strong> a les frais les plus bas
            </li>
            <li>
              • <strong>PayPal</strong> est sécurisé mais plus cher
            </li>
            <li>
              • <strong>Apple Pay/Google Pay</strong> sont rapides et sécurisés
            </li>
            <li>
              • Les <strong>cartes bancaires</strong> sont acceptées partout
            </li>
          </ul>
        </div>

        {/* Sécurité */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
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
          <span>Tous les paiements sont sécurisés par Stripe</span>
        </div>
      </div>
    </div>
  );
}
