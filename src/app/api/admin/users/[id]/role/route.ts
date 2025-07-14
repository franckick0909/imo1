import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "ID de l'utilisateur requis" },
        { status: 400 }
      );
    }

    // TODO: Vérifier les permissions admin

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Rôle requis" }, { status: 400 });
    }

    // Valider le rôle
    const validRoles = ["user", "admin", "moderator"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // Éviter qu'un admin se retire ses propres privilèges
    if (userId === session.user.id && role !== "admin") {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 403 }
      );
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Changer le rôle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        image: true,
        phone: true,
        orders: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    // Calculer les statistiques
    const userWithStats = {
      ...updatedUser,
      ordersCount: updatedUser.orders.length,
      totalSpent: updatedUser.orders.reduce(
        (sum: number, order: { totalAmount: Decimal }) =>
          sum + Number(order.totalAmount),
        0
      ),
    };

    return NextResponse.json(userWithStats);
  } catch (error) {
    console.error("[ADMIN_USER_ROLE_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de rôle" },
      { status: 500 }
    );
  }
}
