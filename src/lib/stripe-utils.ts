import { User } from "@prisma/client";
import prisma from "./prisma";
import { stripe } from "./stripe";

// Créer ou récupérer un client Stripe pour un utilisateur
export async function getOrCreateStripeCustomer(user: User): Promise<string> {
  // Si l'utilisateur a déjà un Stripe Customer ID, le retourner
  if (user.stripeCustomerId) {
    try {
      // Vérifier que le customer existe toujours dans Stripe
      await stripe.customers.retrieve(user.stripeCustomerId);
      return user.stripeCustomerId;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du customer Stripe:",
        error
      );
      // Si le customer n'existe plus, on va en créer un nouveau
    }
  }

  // Créer un nouveau customer Stripe
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: {
      userId: user.id,
    },
  });

  // Sauvegarder l'ID du customer dans la base de données
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// Mettre à jour les informations d'un client Stripe
export async function updateStripeCustomer(
  stripeCustomerId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      postal_code?: string;
      country?: string;
    };
  }
) {
  try {
    await stripe.customers.update(stripeCustomerId, data);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du customer Stripe:", error);
    throw error;
  }
}

// Supprimer un client Stripe
export async function deleteStripeCustomer(stripeCustomerId: string) {
  try {
    await stripe.customers.del(stripeCustomerId);
  } catch (error) {
    console.error("Erreur lors de la suppression du customer Stripe:", error);
    throw error;
  }
}

// Récupérer les méthodes de paiement d'un client
export async function getCustomerPaymentMethods(stripeCustomerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    });
    return paymentMethods.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des méthodes de paiement:",
      error
    );
    return [];
  }
}

// Créer une Setup Intent pour sauvegarder une méthode de paiement
export async function createSetupIntent(stripeCustomerId: string) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return setupIntent;
  } catch (error) {
    console.error("Erreur lors de la création du Setup Intent:", error);
    throw error;
  }
}

// Calculer le montant total d'une commande en centimes
export function calculateOrderAmount(
  items: Array<{ price: number; quantity: number }>
): number {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return Math.round(total * 100); // Convertir en centimes
}

// Valider une adresse pour Stripe
export function validateStripeAddress(address: {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}): boolean {
  return !!(
    address.street &&
    address.city &&
    address.postalCode &&
    address.country
  );
}

// Formater une adresse pour Stripe
export function formatStripeAddress(address: {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}) {
  return {
    line1: address.street || "",
    city: address.city || "",
    postal_code: address.postalCode || "",
    country: address.country || "FR",
  };
}
