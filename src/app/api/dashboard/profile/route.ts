import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer le profil utilisateur complet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        emailVerified: true,
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
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[DASHBOARD_PROFILE_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du profil" },
      { status: 500 }
    );
  }
}
