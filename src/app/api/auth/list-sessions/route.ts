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

    // Récupérer les sessions actives de l'utilisateur
    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
        token: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Marquer la session actuelle
    const sessionsWithCurrent = sessions.map((s) => ({
      ...s,
      isCurrent: s.token === session.session.token,
    }));

    return NextResponse.json(sessionsWithCurrent, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
