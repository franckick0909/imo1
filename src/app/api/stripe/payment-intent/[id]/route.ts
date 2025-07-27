import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: paymentIntentId } = await params;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "ID du Payment Intent requis" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur complet depuis la base de données
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
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que Stripe est configuré
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe n'est pas configuré" },
        { status: 500 }
      );
    }

    // Récupérer le Payment Intent depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Vérifier que le Payment Intent appartient bien à l'utilisateur
    if (
      !paymentIntent.customer ||
      !user.stripeCustomerId ||
      paymentIntent.customer !== user.stripeCustomerId
    ) {
      return NextResponse.json(
        { error: "Accès refusé à cette commande" },
        { status: 403 }
      );
    }

    // Formater les données pour la réponse
    const orderDetails = {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      email: paymentIntent.receipt_email || user.email,
      created: paymentIntent.created,
      currency: paymentIntent.currency,
      description: paymentIntent.description,
      shipping: paymentIntent.shipping,
      metadata: paymentIntent.metadata,
    };

    return NextResponse.json(orderDetails);
  } catch (error) {
    console.error("Erreur lors de la récupération du Payment Intent:", error);

    // Gérer les erreurs Stripe spécifiques
    if (
      error instanceof Error &&
      error.message.includes("No such payment_intent")
    ) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails de commande" },
      { status: 500 }
    );
  }
}
