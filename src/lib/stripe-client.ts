import { loadStripe } from "@stripe/stripe-js";

// Configuration Stripe côté client
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Types pour les erreurs Stripe
export interface StripeError {
  type: string;
  code?: string;
  message: string;
  param?: string;
}

// Gestion des erreurs Stripe
export const handleStripeError = (error: StripeError) => {
  console.error("Erreur Stripe:", error);

  switch (error.code) {
    case "card_declined":
      return "Votre carte a été refusée. Veuillez vérifier vos informations ou utiliser une autre carte.";
    case "expired_card":
      return "Votre carte a expiré. Veuillez utiliser une autre carte.";
    case "insufficient_funds":
      return "Fonds insuffisants sur votre carte.";
    case "incorrect_cvc":
      return "Le code CVC est incorrect.";
    case "processing_error":
      return "Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.";
    case "rate_limit":
      return "Trop de tentatives. Veuillez attendre avant de réessayer.";
    default:
      return (
        error.message || "Une erreur inattendue est survenue lors du paiement."
      );
  }
};
