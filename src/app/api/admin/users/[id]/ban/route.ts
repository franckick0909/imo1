import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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
    const { reason, expiresAt } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Raison du bannissement requis" },
        { status: 400 }
      );
    }

    // Éviter qu'un admin se bannisse lui-même
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous bannir vous-même" },
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

    // Bannir l'utilisateur
    const bannedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: true,
        banReason: reason,
        banExpires: expiresAt ? new Date(expiresAt) : null,
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
      ...bannedUser,
      ordersCount: bannedUser.orders.length,
      totalSpent: bannedUser.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      ),
    };

    return NextResponse.json(userWithStats);
  } catch (error) {
    console.error("[ADMIN_USER_BAN_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du bannissement de l'utilisateur" },
      { status: 500 }
    );
  }
}
