import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Récupérer la session actuelle
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Récupérer le profil complet de l'utilisateur
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,

        // Adresse de livraison
        shippingStreet: true,
        shippingCity: true,
        shippingPostalCode: true,
        shippingCountry: true,

        // Adresse de facturation
        billingStreet: true,
        billingCity: true,
        billingPostalCode: true,
        billingCountry: true,
        useSameAddress: true,

        // Préférences beauté
        skinType: true,
        skinConcerns: true,

        // Préférences de notification
        newsletter: true,
        promotions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Transformer les données pour le frontend
    const profile = {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      shippingAddress: {
        street: user.shippingStreet || "",
        city: user.shippingCity || "",
        postalCode: user.shippingPostalCode || "",
        country: user.shippingCountry || "France",
      },
      billingAddress: {
        street: user.billingStreet || "",
        city: user.billingCity || "",
        postalCode: user.billingPostalCode || "",
        country: user.billingCountry || "France",
      },
      useSameAddress: user.useSameAddress,
      preferences: {
        skinType: user.skinType || "",
        concerns: user.skinConcerns ? JSON.parse(user.skinConcerns) : [],
        newsletter: user.newsletter,
        promotions: user.promotions,
      },
    };

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}
