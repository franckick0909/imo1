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

    // TODO: Implémenter la suppression du ban en base de données

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

    // Débannir l'utilisateur
    const unbannedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
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
      ...unbannedUser,
      ordersCount: unbannedUser.orders.length,
      totalSpent: unbannedUser.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      ),
    };

    return NextResponse.json(userWithStats);
  } catch (error) {
    console.error("[ADMIN_USER_UNBAN_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du débannissement de l'utilisateur" },
      { status: 500 }
    );
  }
}
