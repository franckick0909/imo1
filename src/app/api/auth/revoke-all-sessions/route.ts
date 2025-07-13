import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = currentSession.user.id;

    // Supprimer toutes les sessions de l'utilisateur sauf la session actuelle
    await prisma.session.deleteMany({
      where: {
        userId,
        NOT: {
          token: currentSession.session.token,
        },
      },
    });

    return NextResponse.json({
      message: "Toutes les autres sessions ont été révoquées avec succès",
    });
  } catch (error) {
    console.error("[REVOKE_ALL_SESSIONS_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la révocation des sessions" },
      { status: 500 }
    );
  }
}
