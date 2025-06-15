import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

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

    // Ajouter le mot de passe au compte existant
    const result = await auth.api.setPassword({
      body: {
        newPassword: password,
      },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json(
        { message: "Erreur lors de l'ajout du mot de passe" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Mot de passe ajouté avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout du mot de passe:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
