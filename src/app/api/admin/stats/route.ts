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

    // Vérifier les permissions admin
    // TODO: Implémenter la vérification des rôles admin
    // Pour l'instant, on suppose que l'utilisateur est admin

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Récupérer les statistiques admin
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenueResult,
      newUsersToday,
      newOrdersToday,
      lowStockProducts,
      activeUsers,
    ] = await Promise.all([
      // Total utilisateurs
      prisma.user.count(),

      // Total produits
      prisma.product.count(),

      // Total catégories
      prisma.category.count(),

      // Total commandes
      prisma.order.count(),

      // Revenus totaux (commandes livrées)
      prisma.order.aggregate({
        where: {
          status: "DELIVERED",
          paymentStatus: "PAID",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Nouveaux utilisateurs aujourd'hui
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
          },
        },
      }),

      // Nouvelles commandes aujourd'hui
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
          },
        },
      }),

      // Produits en stock bas (stock <= 5 ou <= lowStockThreshold)
      prisma.product.count({
        where: {
          AND: [
            { trackStock: true },
            { stock: { lte: 5 } }, // Simplifié : stock <= 5
          ],
        },
      }),

      // Utilisateurs actifs (connectés dans les 30 derniers jours)
      // TODO: Ajouter un champ lastLogin au schéma User
      Promise.resolve(0), // Placeholder pour maintenant
    ]);

    const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0);

    const stats = {
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      newUsersToday,
      newOrdersToday,
      activeUsers,
      lowStockProducts,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[ADMIN_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des statistiques admin" },
      { status: 500 }
    );
  }
}
