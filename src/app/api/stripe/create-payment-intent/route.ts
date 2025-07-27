import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-utils";
import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
} from "@/lib/types/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body: CreatePaymentIntentRequest = await request.json();
    const { amount, currency = "eur", orderId, userId, metadata = {} } = body;

    // Vérifier que l'utilisateur connecté correspond à l'userId
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order || order.userId !== userId) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que le montant correspond au total de la commande
    const orderTotal = Math.round(order.totalAmount.toNumber() * 100); // Convertir en centimes
    if (amount !== orderTotal) {
      return NextResponse.json({ error: "Montant incorrect" }, { status: 400 });
    }

    // Récupérer l'utilisateur complet depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Créer ou récupérer le client Stripe
    const stripeCustomerId = await getOrCreateStripeCustomer(user);

    // Vérifier que Stripe est configuré
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe n'est pas configuré" },
        { status: 500 }
      );
    }

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: stripeCustomerId,
      metadata: {
        orderId,
        userId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Vérifier que le client_secret est présent
    if (!paymentIntent.client_secret) {
      return NextResponse.json(
        { error: "Erreur lors de la création du paiement" },
        { status: 500 }
      );
    }

    const clientSecret = paymentIntent.client_secret;

    // Créer une clé éphémère pour le client mobile (optionnel)
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: stripeCustomerId },
      { apiVersion: "2024-10-28.acacia" }
    );

    // Mettre à jour le statut de la commande
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: paymentIntent.id,
        paymentStatus: "PENDING",
      },
    });

    const response: CreatePaymentIntentResponse = {
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      ephemeralKey: {
        id: ephemeralKey.id,
        secret: ephemeralKey.secret!,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur création Payment Intent:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
