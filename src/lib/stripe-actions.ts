"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-utils";
import { z } from "zod";
import { headers } from "next/headers";

// Schéma de validation pour créer un Payment Intent
const CreatePaymentIntentSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
    })
  ),
  shippingCost: z.number().min(0).default(0),
  currency: z.string().default("eur"),
  metadata: z.record(z.string()).optional(),
});

// Schéma pour les moyens de paiement
const PaymentMethodsSchema = z.object({
  country: z.string().default("FR"),
  amount: z.number().min(0),
});

/**
 * Action pour créer un Payment Intent avec une commande
 */
export async function createPaymentIntentAction(
  data: z.infer<typeof CreatePaymentIntentSchema>
) {
  try {
    // Validation des données
    const validatedData = CreatePaymentIntentSchema.parse(data);
    const { items, shippingCost, currency, metadata = {} } = validatedData;

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      throw new Error("Utilisateur non authentifié");
    }

    // Récupérer l'utilisateur complet
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Calculer les montants
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxAmount = subtotal * 0.2; // TVA 20%
    const totalAmount = subtotal + shippingCost + taxAmount;

    // Générer un numéro de commande unique
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Créer la commande en base de données
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        customerEmail: user.email,
        customerName: user.name || "Client",
        subtotal,
        shippingCost,
        taxAmount,
        totalAmount,
        status: "PENDING",
        paymentStatus: "PENDING",
        shippingAddress: {
          street: user.shippingStreet || "",
          city: user.shippingCity || "",
          postalCode: user.shippingPostalCode || "",
          country: user.shippingCountry || "France",
        },
        billingAddress: user.useSameAddress
          ? {
              street: user.shippingStreet || "",
              city: user.shippingCity || "",
              postalCode: user.shippingPostalCode || "",
              country: user.shippingCountry || "France",
            }
          : {
              street: user.billingStreet || "",
              city: user.billingCity || "",
              postalCode: user.billingPostalCode || "",
              country: user.billingCountry || "France",
            },
        orderItems: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            name: `Produit ${item.id}`, // À améliorer avec le vrai nom du produit
          })),
        },
      },
    });

    // Créer ou récupérer le client Stripe
    const stripeCustomerId = await getOrCreateStripeCustomer(user);

    // Convertir le montant en centimes pour Stripe
    const amountInCents = Math.round(totalAmount * 100);

    // Moyens de paiement recommandés selon le pays
    const paymentMethods = getRecommendedPaymentMethods(
      user.shippingCountry || "FR"
    );

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      customer: stripeCustomerId,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        orderNumber: order.orderNumber,
        ...metadata,
      },
      payment_method_types: paymentMethods,
      shipping: {
        name: user.name || "Client",
        address: {
          line1: user.shippingStreet || "",
          city: user.shippingCity || "",
          postal_code: user.shippingPostalCode || "",
          country: user.shippingCountry || "FR",
        },
      },
    });

    // Vérifier que le client_secret est présent
    if (!paymentIntent.client_secret) {
      // Supprimer la commande si le paiement a échoué
      await prisma.order.delete({ where: { id: order.id } });
      throw new Error("Erreur lors de la création du paiement");
    }

    // Mettre à jour la commande avec l'ID du payment intent
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: paymentIntent.id,
      },
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    };
  } catch (error) {
    console.error("Erreur création Payment Intent:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erreur lors de la création du paiement"
    );
  }
}

/**
 * Action pour valider un paiement depuis le dashboard
 */
export async function validatePaymentAction(paymentIntentId: string) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      throw new Error("Utilisateur non authentifié");
    }

    // Récupérer l'utilisateur complet
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Récupérer le Payment Intent depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Vérifier que le Payment Intent appartient à l'utilisateur
    if (
      !paymentIntent.customer ||
      !user.stripeCustomerId ||
      paymentIntent.customer !== user.stripeCustomerId
    ) {
      throw new Error("Accès refusé à ce paiement");
    }

    // Vérifier que le paiement a réussi
    if (paymentIntent.status !== "succeeded") {
      throw new Error("Le paiement n'a pas réussi");
    }

    // Récupérer la commande depuis les métadonnées
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
      throw new Error("Commande non trouvée");
    }

    // Mettre à jour la commande
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentMethod: paymentIntent.payment_method_types[0] || "card",
      },
    });

    return {
      success: true,
      orderNumber: order.orderNumber,
      message: "Paiement validé avec succès",
    };
  } catch (error) {
    console.error("Erreur validation paiement:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erreur lors de la validation du paiement"
    );
  }
}

/**
 * Action pour annuler un paiement
 */
export async function cancelPaymentAction(paymentIntentId: string) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      throw new Error("Utilisateur non authentifié");
    }

    // Annuler le Payment Intent dans Stripe
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    // Récupérer la commande depuis les métadonnées
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      // Mettre à jour la commande
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        },
      });
    }

    return {
      success: true,
      message: "Paiement annulé avec succès",
    };
  } catch (error) {
    console.error("Erreur annulation paiement:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erreur lors de l'annulation du paiement"
    );
  }
}

/**
 * Récupérer les moyens de paiement recommandés selon le pays
 */
function getRecommendedPaymentMethods(country: string): string[] {
  const baseMethods = ["card", "paypal", "apple_pay", "google_pay"];

  // Moyens de paiement spécifiques par pays/région
  const countryMethods: Record<string, string[]> = {
    FR: [...baseMethods, "sepa_debit"], // France
    BE: [...baseMethods, "bancontact", "sepa_debit"], // Belgique
    NL: [...baseMethods, "ideal", "sepa_debit"], // Pays-Bas
    DE: [...baseMethods, "sofort", "sepa_debit"], // Allemagne
    IT: [...baseMethods, "sepa_debit"], // Italie
    ES: [...baseMethods, "sepa_debit"], // Espagne
    GB: [...baseMethods], // Royaume-Uni
    US: [...baseMethods, "us_bank_account"], // États-Unis
  };

  return countryMethods[country] || baseMethods;
}

/**
 * Action pour récupérer les moyens de paiement disponibles
 */
export async function getAvailablePaymentMethodsAction(
  data: z.infer<typeof PaymentMethodsSchema>
) {
  try {
    const { country, amount } = PaymentMethodsSchema.parse(data);

    // Récupérer les moyens de paiement recommandés
    const paymentMethods = getRecommendedPaymentMethods(country);

    // Informations sur chaque moyen de paiement
    const methodsInfo = paymentMethods.map((method) => ({
      id: method,
      name: getPaymentMethodName(method),
      icon: getPaymentMethodIcon(method),
      description: getPaymentMethodDescription(method),
      fees: getPaymentMethodFees(method, amount),
      popular: ["card", "paypal", "apple_pay", "google_pay"].includes(method),
    }));

    return {
      success: true,
      country,
      paymentMethods: methodsInfo,
    };
  } catch (error) {
    console.error("Erreur récupération moyens de paiement:", error);
    throw new Error("Erreur lors de la récupération des moyens de paiement");
  }
}

/**
 * Utilitaires pour les informations des moyens de paiement
 */
function getPaymentMethodName(method: string): string {
  const names: Record<string, string> = {
    card: "Carte bancaire",
    paypal: "PayPal",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    sepa_debit: "Prélèvement SEPA",
    bancontact: "Bancontact",
    ideal: "iDEAL",
    sofort: "Sofort",
    us_bank_account: "Compte bancaire US",
  };
  return names[method] || method;
}

function getPaymentMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    card: "💳",
    paypal: "🟦",
    apple_pay: "🍎",
    google_pay: "🟨",
    sepa_debit: "🏦",
    bancontact: "🇧🇪",
    ideal: "🇳🇱",
    sofort: "🇩🇪",
    us_bank_account: "🇺🇸",
  };
  return icons[method] || "💳";
}

function getPaymentMethodDescription(method: string): string {
  const descriptions: Record<string, string> = {
    card: "Visa, MasterCard, CB",
    paypal: "Compte PayPal ou carte via PayPal",
    apple_pay: "Paiement rapide et sécurisé",
    google_pay: "Paiement rapide et sécurisé",
    sepa_debit: "Prélèvement bancaire européen",
    bancontact: "Système de paiement belge",
    ideal: "Système de paiement néerlandais",
    sofort: "Virement instantané allemand",
    us_bank_account: "Compte bancaire américain",
  };
  return descriptions[method] || "Méthode de paiement";
}

function getPaymentMethodFees(method: string, amount: number): number {
  // Frais Stripe approximatifs (à ajuster selon vos tarifs)
  const feeRates: Record<string, number> = {
    card: 0.014, // 1.4% + 0.25€
    paypal: 0.034, // 3.4% + 0.35€
    apple_pay: 0.014, // 1.4% + 0.25€
    google_pay: 0.014, // 1.4% + 0.25€
    sepa_debit: 0.008, // 0.8% (plafonné à 5€)
    bancontact: 0.014, // 1.4% + 0.25€
    ideal: 0.008, // 0.8% + 0.25€
    sofort: 0.014, // 1.4% + 0.25€
    us_bank_account: 0.008, // 0.8% (plafonné à 5€)
  };

  const rate = feeRates[method] || 0.014;
  return Math.round(amount * rate * 100) / 100; // Arrondir à 2 décimales
}
