import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json();

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

    // Préparer les données pour la mise à jour
    const updateData: {
      name?: string;
      phone?: string;
      shippingStreet?: string;
      shippingCity?: string;
      shippingPostalCode?: string;
      shippingCountry?: string;
      useSameAddress?: boolean;
      billingStreet?: string;
      billingCity?: string;
      billingPostalCode?: string;
      billingCountry?: string;
      skinType?: string;
      skinConcerns?: string;
      newsletter?: boolean;
      promotions?: boolean;
    } = {
      name: profileData.name,
      phone: profileData.phone,

      // Adresse de livraison
      shippingStreet: profileData.shippingAddress?.street,
      shippingCity: profileData.shippingAddress?.city,
      shippingPostalCode: profileData.shippingAddress?.postalCode,
      shippingCountry: profileData.shippingAddress?.country,

      // Adresse de facturation
      useSameAddress: profileData.useSameAddress,
      billingStreet: profileData.useSameAddress
        ? profileData.shippingAddress?.street
        : profileData.billingAddress?.street,
      billingCity: profileData.useSameAddress
        ? profileData.shippingAddress?.city
        : profileData.billingAddress?.city,
      billingPostalCode: profileData.useSameAddress
        ? profileData.shippingAddress?.postalCode
        : profileData.billingAddress?.postalCode,
      billingCountry: profileData.useSameAddress
        ? profileData.shippingAddress?.country
        : profileData.billingAddress?.country,

      // Préférences beauté
      skinType: profileData.preferences?.skinType || undefined,
      skinConcerns: profileData.preferences?.concerns
        ? JSON.stringify(profileData.preferences.concerns)
        : undefined,

      // Préférences de notification
      newsletter: profileData.preferences?.newsletter ?? true,
      promotions: profileData.preferences?.promotions ?? true,
    };

    // Mettre à jour le profil dans la base de données
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: updateData,
    });

    // Mettre à jour l'email si changé (via Better Auth)
    if (profileData.email && profileData.email !== session.user.email) {
      await auth.api.updateUser({
        body: {
          name: profileData.name,
        },
        headers: await headers(),
      });

      // Pour l'email, on utilise directement Prisma car Better Auth a des restrictions
      if (profileData.email !== session.user.email) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { email: profileData.email },
        });
      }
    }

    return NextResponse.json(
      {
        message: "Profil mis à jour avec succès",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
