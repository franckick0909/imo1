import { sendOrderConfirmationEmail } from "@/lib/email-service";
import prisma from "@/lib/prisma";
import { formatDeliveryRange } from "@/lib/shipping-utils";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Désactiver la vérification du body pour Stripe
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("Signature Stripe manquante");
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET non défini");
    return NextResponse.json(
      { error: "Configuration webhook manquante" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Erreur de signature webhook:", err);
    return NextResponse.json(
      { error: "Signature webhook invalide" },
      { status: 400 }
    );
  }

  console.log("Événement Stripe reçu:", event.type, event.id);

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.requires_action":
        await handlePaymentRequiresAction(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur lors du traitement du webhook:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * Gère le succès du paiement
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("💰 Paiement réussi:", paymentIntent.id);

  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) {
    console.error("OrderId manquant dans les métadonnées du payment intent");
    return;
  }

  try {
    // Mettre à jour la commande
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        // Ajouter des détails de paiement
        paymentMethod: paymentIntent.payment_method_types[0] || "card",
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    console.log(
      `✅ Commande ${order.orderNumber} confirmée pour l'utilisateur ${order.user?.email}`
    );

    // Envoyer un email de confirmation
    if (order.user?.email) {
      try {
        // Préparer les données pour l'email
        const emailData = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          orderDate: order.createdAt.toISOString(),
          items: order.orderItems.map((item) => ({
            id: item.id,
            name: item.product.name,
            price: Number(item.price),
            quantity: item.quantity,
            image: item.product.images[0]?.url || "/placeholder.jpg",
            total: Number(item.price) * item.quantity,
          })),
          subtotal: Number(order.subtotal),
          shippingCost: Number(order.shippingCost),
          taxAmount: Number(order.taxAmount),
          total: Number(order.totalAmount),
          shippingAddress:
            typeof order.shippingAddress === "object"
              ? order.shippingAddress
              : {
                  firstName: order.customerName.split(" ")[0],
                  lastName: order.customerName.split(" ").slice(1).join(" "),
                  street: "",
                  city: "",
                  postalCode: "",
                  country: "France",
                },
          billingAddress:
            typeof order.billingAddress === "object"
              ? order.billingAddress
              : {
                  firstName: order.customerName.split(" ")[0],
                  lastName: order.customerName.split(" ").slice(1).join(" "),
                  street: "",
                  city: "",
                  postalCode: "",
                  country: "France",
                },
          shippingInfo: {
            method: order.shippingMethod || "Colissimo",
            carrier: "La Poste",
            estimatedDelivery: formatDeliveryRange(
              new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 jours
              new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // +5 jours
            ),
            cost: Number(order.shippingCost),
            isFree: Number(order.shippingCost) === 0,
          },
          paymentMethod:
            order.paymentMethod === "card"
              ? "Carte bancaire"
              : order.paymentMethod || "Carte bancaire",
        };

        await sendOrderConfirmationEmail(order.user.email, emailData);
        console.log("✅ Email de confirmation envoyé");
      } catch (emailError) {
        console.error(
          "❌ Erreur lors de l'envoi de l'email de confirmation:",
          emailError
        );
        // Ne pas faire échouer le webhook si l'email échoue
      }
    }

    // TODO: Mettre à jour le stock des produits
    // TODO: Déclencher la logistique
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    throw error;
  }
}

/**
 * Gère l'échec du paiement
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("❌ Paiement échoué:", paymentIntent.id);

  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) {
    console.error("OrderId manquant dans les métadonnées du payment intent");
    return;
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "FAILED",
        status: "CANCELLED",
      },
    });

    console.log(`❌ Commande ${orderId} marquée comme échouée`);

    // TODO: Envoyer un email d'échec de paiement
    // TODO: Libérer le stock réservé
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la commande échouée:",
      error
    );
    throw error;
  }
}

/**
 * Gère l'annulation du paiement
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log("🚫 Paiement annulé:", paymentIntent.id);

  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) {
    console.error("OrderId manquant dans les métadonnées du payment intent");
    return;
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "FAILED",
        status: "CANCELLED",
      },
    });

    console.log(`🚫 Commande ${orderId} annulée`);

    // TODO: Libérer le stock réservé
  } catch (error) {
    console.error("Erreur lors de l'annulation de la commande:", error);
    throw error;
  }
}

/**
 * Gère les paiements nécessitant une action (3D Secure, etc.)
 */
async function handlePaymentRequiresAction(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("🔐 Paiement nécessite une action:", paymentIntent.id);

  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) {
    console.error("OrderId manquant dans les métadonnées du payment intent");
    return;
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PENDING",
        status: "PENDING",
      },
    });

    console.log(`🔐 Commande ${orderId} en attente d'action`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour pour action requise:", error);
    throw error;
  }
}
