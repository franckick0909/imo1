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

    // Récupérer les statistiques utilisateur
    const [ordersCount, totalSpentResult, favoritesCount] = await Promise.all([
      // Nombre total de commandes
      prisma.order.count({
        where: { userId },
      }),

      // Total dépensé (somme des commandes livrées)
      prisma.order.aggregate({
        where: {
          userId,
          status: "DELIVERED",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Nombre de favoris (à implémenter plus tard avec une table favorites)
      Promise.resolve(0), // Placeholder pour maintenant
    ]);

    // Calculer les points de fidélité (1 point par euro dépensé)
    const totalSpent = Number(totalSpentResult._sum.totalAmount || 0);
    const loyaltyPoints = Math.floor(totalSpent);

    const stats = {
      totalOrders: ordersCount,
      totalSpent: totalSpent,
      favoriteProducts: favoritesCount,
      loyaltyPoints: loyaltyPoints,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[DASHBOARD_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des statistiques" },
      { status: 500 }
    );
  }
}
