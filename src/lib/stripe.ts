import Stripe from "stripe";

// Configuration Stripe côté serveur
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
  typescript: true,
});

// Utilitaires pour les prix
export const formatPrice = (amount: number, currency: string = "eur") => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

// Conversion centimes vers euros
export const centsToEuros = (cents: number) => cents / 100;

// Conversion euros vers centimes
export const eurosToCents = (euros: number) => Math.round(euros * 100);

// Validation du webhook Stripe
export const validateStripeWebhook = (
  payload: string,
  signature: string,
  secret: string
) => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Erreur validation webhook Stripe:", error);
    return null;
  }
};
