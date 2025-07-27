import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID requis" },
        { status: 400 }
      );
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

    // Vérifier que le Payment Intent appartient à l'utilisateur
    if (
      !paymentIntent.customer ||
      !user.stripeCustomerId ||
      paymentIntent.customer !== user.stripeCustomerId
    ) {
      return NextResponse.json(
        { error: "Accès refusé à ce paiement" },
        { status: 403 }
      );
    }

    // Vérifier que le paiement a réussi
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Le paiement n'a pas réussi" },
        { status: 400 }
      );
    }

    // Trouver la commande correspondante
    const order = await prisma.order.findFirst({
      where: {
        paymentId: paymentIntent.id,
        userId: user.id,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Retourner les informations de la commande
    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de la validation du paiement:", error);

    // Gérer les erreurs Stripe spécifiques
    if (
      error instanceof Error &&
      error.message.includes("No such payment_intent")
    ) {
      return NextResponse.json(
        { error: "Payment Intent introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la validation du paiement" },
      { status: 500 }
    );
  }
}
