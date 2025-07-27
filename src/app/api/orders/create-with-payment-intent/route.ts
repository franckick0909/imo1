import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-utils";
import { NextRequest, NextResponse } from "next/server";

interface CartItem {
  id: string;
  quantity: number;
  price: number;
}

interface CreateOrderWithPaymentRequest {
  items: CartItem[];
  currency?: string;
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body: CreateOrderWithPaymentRequest = await request.json();
    const { items, currency = "eur", metadata = {} } = body;

    // Valider les données d'entrée
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Le panier ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Récupérer les produits pour vérifier les prix et disponibilité
    const productIds = items.map((item) => item.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Certains produits n'existent plus" },
        { status: 400 }
      );
    }

    // Calculer le total et vérifier les prix
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.id);
      if (!product) {
        return NextResponse.json(
          { error: `Produit ${item.id} non trouvé` },
          { status: 400 }
        );
      }

      // Vérifier le prix (tolérance de 1 centime pour les arrondis)
      const expectedPrice = product.price.toNumber();
      if (Math.abs(expectedPrice - item.price) > 0.01) {
        return NextResponse.json(
          { error: `Prix incorrect pour le produit ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price, // Prix unitaire seulement
      });
    }

    // Calculer les frais et total
    const shippingCost = 0; // Livraison gratuite pour le moment
    const taxAmount = 0; // Pas de TVA pour le moment
    const totalAmount = subtotal + shippingCost + taxAmount;

    // Récupérer l'utilisateur complet
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Générer un numéro de commande unique
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

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
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Créer ou récupérer le client Stripe
    const stripeCustomerId = await getOrCreateStripeCustomer(user);

    // Convertir le montant en centimes pour Stripe
    const amountInCents = Math.round(totalAmount * 100);

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      customer: stripeCustomerId,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Vérifier que le client_secret est présent
    if (!paymentIntent.client_secret) {
      // Supprimer la commande si le paiement a échoué
      await prisma.order.delete({ where: { id: order.id } });
      return NextResponse.json(
        { error: "Erreur lors de la création du paiement" },
        { status: 500 }
      );
    }

    // Mettre à jour la commande avec l'ID du payment intent
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: paymentIntent.id,
      },
    });

    // Créer une clé éphémère pour le client mobile (optionnel)
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: stripeCustomerId },
      { apiVersion: "2024-10-28.acacia" }
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      ephemeralKey: {
        id: ephemeralKey.id,
        secret: ephemeralKey.secret!,
      },
    });
  } catch (error) {
    console.error("Erreur création commande avec paiement:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
