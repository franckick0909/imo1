"use client";

import Input from "@/components/ui/Input";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "@/lib/auth-client";
import { ShippingCalculation } from "@/lib/types/shipping";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import PaymentMethodsDisplay from "./PaymentMethodsDisplay";
import ShippingSelector from "./ShippingSelector";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface BillingAddress extends ShippingAddress {
  sameAsShipping: boolean;
}

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const { items, total, clearCart } = useCart();

  // États du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

  // Adresse de livraison
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: session?.user?.name?.split(" ")[0] || "",
    lastName: session?.user?.name?.split(" ").slice(1).join(" ") || "",
    email: session?.user?.email || "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "FR",
  });

  // Adresse de facturation
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    ...shippingAddress,
    sameAsShipping: true,
  });

  // Frais de port
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingCalculation | null>(null);

  // Calculer le poids total de la commande
  const orderWeight = useMemo(() => {
    // Utiliser un poids par défaut de 100g par produit
    return items.reduce((total, item) => total + 100 * item.quantity, 0);
  }, [items]);

  // Calculer le total final avec frais de port
  const finalTotal = useMemo(() => {
    const shippingCost = selectedShipping?.price || 0;
    return total + shippingCost;
  }, [total, selectedShipping]);

  // Validation des champs
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Validation adresse de livraison
      if (!shippingAddress.firstName.trim())
        newErrors.firstName = "Le prénom est requis";
      if (!shippingAddress.lastName.trim())
        newErrors.lastName = "Le nom est requis";
      if (!shippingAddress.email.trim()) newErrors.email = "L'email est requis";
      if (!shippingAddress.phone.trim())
        newErrors.phone = "Le téléphone est requis";
      if (!shippingAddress.street.trim())
        newErrors.street = "L'adresse est requise";
      if (!shippingAddress.city.trim()) newErrors.city = "La ville est requise";
      if (!shippingAddress.postalCode.trim())
        newErrors.postalCode = "Le code postal est requis";
      if (!shippingAddress.country.trim())
        newErrors.country = "Le pays est requis";
    }

    if (step === 2) {
      // Validation adresse de facturation (si différente)
      if (!billingAddress.sameAsShipping) {
        if (!billingAddress.firstName.trim())
          newErrors.billingFirstName = "Le prénom est requis";
        if (!billingAddress.lastName.trim())
          newErrors.billingLastName = "Le nom est requis";
        if (!billingAddress.email.trim())
          newErrors.billingEmail = "L'email est requis";
        if (!billingAddress.phone.trim())
          newErrors.billingPhone = "Le téléphone est requis";
        if (!billingAddress.street.trim())
          newErrors.billingStreet = "L'adresse est requise";
        if (!billingAddress.city.trim())
          newErrors.billingCity = "La ville est requise";
        if (!billingAddress.postalCode.trim())
          newErrors.billingPostalCode = "Le code postal est requis";
        if (!billingAddress.country.trim())
          newErrors.billingCountry = "Le pays est requis";
      }
    }

    if (step === 3) {
      // Validation moyen de paiement
      if (!selectedPaymentMethod) {
        newErrors.payment = "Veuillez sélectionner un moyen de paiement";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonctions de navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Fonctions de mise à jour des adresses
  const updateShippingAddress = (
    field: keyof ShippingAddress,
    value: string
  ) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const updateBillingAddress = (
    field: keyof BillingAddress,
    value: string | boolean
  ) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  };

  // Soumission du formulaire
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Pour les cartes bancaires, utiliser le PaymentElement de Stripe
      if (selectedPaymentMethod === "card") {
        // Confirmer le paiement avec Stripe
        const result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success`,
            shipping: {
              name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
              phone: shippingAddress.phone,
              address: {
                line1: shippingAddress.street,
                city: shippingAddress.city,
                postal_code: shippingAddress.postalCode,
                country: shippingAddress.country,
              },
            },
            payment_method_data: {
              billing_details: {
                name: billingAddress.sameAsShipping
                  ? `${shippingAddress.firstName} ${shippingAddress.lastName}`
                  : `${billingAddress.firstName} ${billingAddress.lastName}`,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                address: billingAddress.sameAsShipping
                  ? {
                      line1: shippingAddress.street,
                      city: shippingAddress.city,
                      postal_code: shippingAddress.postalCode,
                      country: shippingAddress.country,
                    }
                  : {
                      line1: billingAddress.street,
                      city: billingAddress.city,
                      postal_code: billingAddress.postalCode,
                      country: billingAddress.country,
                    },
              },
            },
          },
          redirect: "always",
        });

        if (result.error) {
          // Gestion détaillée des erreurs Stripe
          const errorMessage =
            result.error.message || "Erreur lors du paiement";
          const errorType = result.error.type || "unknown";

          console.error("Erreur de paiement Stripe:", {
            type: errorType,
            code: result.error.code,
            message: errorMessage,
            decline_code: result.error.decline_code,
          });

          setErrors({
            payment: errorMessage,
          });
        } else {
          // Avec redirect: "always", Stripe redirige automatiquement
          console.log("Paiement en cours de traitement...");
          clearCart();
          setErrors({
            payment: "Paiement en cours de traitement, redirection...",
          });
        }
      } else {
        // Pour les autres méthodes de paiement, rediriger vers une page spécifique
        // ou utiliser une autre logique selon le type de paiement
        console.log("Traitement du paiement pour:", selectedPaymentMethod);
        setErrors({
          payment: `Paiement ${selectedPaymentMethod} en cours de développement`,
        });
      }
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du paiement";
      setErrors({ payment: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Indicateur d'étapes */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm text-gray-600">Livraison</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm text-gray-600">Facturation</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="ml-2 text-sm text-gray-600">Paiement</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Étape 1: Adresse de livraison */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Adresse de livraison
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Prénom *"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  updateShippingAddress("firstName", e.target.value)
                }
                error={errors.firstName}
                placeholder="Votre prénom"
              />
              <Input
                label="Nom *"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  updateShippingAddress("lastName", e.target.value)
                }
                error={errors.lastName}
                placeholder="Votre nom"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email *"
                type="email"
                value={shippingAddress.email}
                onChange={(e) => updateShippingAddress("email", e.target.value)}
                error={errors.email}
                placeholder="votre@email.com"
              />
              <Input
                label="Téléphone *"
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) => updateShippingAddress("phone", e.target.value)}
                error={errors.phone}
                placeholder="06 12 34 56 78"
              />
            </div>

            <Input
              label="Adresse *"
              value={shippingAddress.street}
              onChange={(e) => updateShippingAddress("street", e.target.value)}
              error={errors.street}
              placeholder="123 Rue de la Paix"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Ville *"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    updateShippingAddress("city", e.target.value)
                  }
                  error={errors.city}
                  placeholder="Paris"
                />
              </div>
              <Input
                label="Code postal *"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  updateShippingAddress("postalCode", e.target.value)
                }
                error={errors.postalCode}
                placeholder="75001"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Pays *"
                value={shippingAddress.country}
                onChange={(e) =>
                  updateShippingAddress("country", e.target.value)
                }
                error={errors.country}
                placeholder="France"
              />
            </div>

            {/* Sélection des méthodes de livraison */}
            {shippingAddress.country && shippingAddress.postalCode && (
              <ShippingSelector
                country={shippingAddress.country}
                postalCode={shippingAddress.postalCode}
                weight={orderWeight}
                value={total}
                onShippingChange={setSelectedShipping}
              />
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                disabled={!selectedShipping}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            </div>
          </motion.div>
        )}

        {/* Étape 2: Adresse de facturation */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Adresse de facturation
            </h2>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={billingAddress.sameAsShipping}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({
                      ...prev,
                      sameAsShipping: e.target.checked,
                      ...(e.target.checked ? shippingAddress : {}),
                    }))
                  }
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">
                  Utiliser la même adresse pour la facturation
                </span>
              </label>

              {!billingAddress.sameAsShipping && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    name="firstName"
                    value={billingAddress.firstName}
                    onChange={(e) =>
                      updateBillingAddress("firstName", e.target.value)
                    }
                    error={errors.billingFirstName}
                    required
                  />
                  <Input
                    label="Nom"
                    name="lastName"
                    value={billingAddress.lastName}
                    onChange={(e) =>
                      updateBillingAddress("lastName", e.target.value)
                    }
                    error={errors.billingLastName}
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={billingAddress.email}
                    onChange={(e) =>
                      updateBillingAddress("email", e.target.value)
                    }
                    error={errors.billingEmail}
                    required
                  />
                  <Input
                    label="Téléphone"
                    name="phone"
                    value={billingAddress.phone}
                    onChange={(e) =>
                      updateBillingAddress("phone", e.target.value)
                    }
                    error={errors.billingPhone}
                    required
                  />
                  <Input
                    label="Adresse"
                    name="street"
                    value={billingAddress.street}
                    onChange={(e) =>
                      updateBillingAddress("street", e.target.value)
                    }
                    error={errors.billingStreet}
                    required
                    className="md:col-span-2"
                  />
                  <Input
                    label="Ville"
                    name="city"
                    value={billingAddress.city}
                    onChange={(e) =>
                      updateBillingAddress("city", e.target.value)
                    }
                    error={errors.billingCity}
                    required
                  />
                  <Input
                    label="Code postal"
                    name="postalCode"
                    value={billingAddress.postalCode}
                    onChange={(e) =>
                      updateBillingAddress("postalCode", e.target.value)
                    }
                    error={errors.billingPostalCode}
                    required
                  />
                  <Input
                    label="Pays"
                    name="country"
                    value={billingAddress.country}
                    onChange={(e) =>
                      updateBillingAddress("country", e.target.value)
                    }
                    error={errors.billingCountry}
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Continuer
              </button>
            </div>
          </motion.div>
        )}

        {/* Étape 3: Paiement */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations de paiement
            </h2>

            {/* Sélection du moyen de paiement */}
            <PaymentMethodsDisplay
              country={shippingAddress.country}
              amount={finalTotal}
              selectedMethod={selectedPaymentMethod}
              onMethodSelect={setSelectedPaymentMethod}
            />

            {/* Affichage conditionnel du PaymentElement pour les cartes */}
            {selectedPaymentMethod === "card" && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informations de la carte bancaire
                </h3>
                <PaymentElement
                  options={{
                    layout: "tabs",
                    paymentMethodOrder: ["card"],
                  }}
                />
              </div>
            )}

            {errors.payment && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.payment}</p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={
                  !stripe || !elements || isSubmitting || !selectedPaymentMethod
                }
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Payer €{finalTotal.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
