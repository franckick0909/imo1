import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { message: "ID de session requis" },
        { status: 400 }
      );
    }

    // Récupérer la session actuelle
    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession) {
      return NextResponse.json(
        { message: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Vérifier que la session appartient à l'utilisateur
    const sessionToRevoke = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: currentSession.user.id,
      },
    });

    if (!sessionToRevoke) {
      return NextResponse.json(
        { message: "Session non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Empêcher la révocation de la session actuelle
    if (sessionToRevoke.token === currentSession.session.token) {
      return NextResponse.json(
        { message: "Impossible de révoquer la session actuelle" },
        { status: 400 }
      );
    }

    // Supprimer la session
    await prisma.session.delete({
      where: {
        id: sessionId,
      },
    });

    return NextResponse.json(
      { message: "Session révoquée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la révocation de la session:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
