"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

// Types pour les statistiques admin
interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  newUsersToday: number;
  activeUsers: number;
  newOrdersToday: number;
  lowStockProducts: number;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
  revenueByStatus: Array<{
    status: string;
    revenue: number;
    count: number;
  }>;
}

// Récupérer les statistiques admin
export async function getAdminStatsAction(): Promise<AdminStats> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    // Calculer la date d'il y a 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculer la date d'aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Récupérer les commandes des 30 derniers jours
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    // Calculer les revenus totaux
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    // Compter les commandes
    const totalOrders = orders.length;

    // Compter les nouveaux utilisateurs aujourd'hui
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Compter les utilisateurs actifs (ayant des commandes)
    const activeUsers = await prisma.user.count({
      where: {
        orders: {
          some: {},
        },
      },
    });

    // Compter les nouvelles commandes aujourd'hui
    const newOrdersToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Compter les produits en rupture de stock
    const lowStockProducts = await prisma.product.count({
      where: {
        AND: [
          { trackStock: true },
          {
            stock: {
              lte: 5, // Utiliser la valeur par défaut du lowStockThreshold
            },
          },
        ],
      },
    });

    // Récupérer les revenus par jour pour les 30 derniers jours
    const ordersByDay = await prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const revenueByDay = ordersByDay.map((day) => ({
      date: day.createdAt.toISOString().split("T")[0],
      revenue: Number(day._sum.totalAmount || 0),
      orders: day._count.id,
    }));

    // Récupérer les produits les plus vendus
    const topProductsData = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
          status: {
            in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
      },
      _sum: {
        quantity: true,
        price: true,
      },
    });

    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });

        const revenue =
          Number(item._sum.price || 0) * Number(item._sum.quantity || 0);

        return {
          name: product?.name || "Produit inconnu",
          revenue,
          orders: Number(item._sum.quantity || 0),
        };
      })
    );

    // Récupérer les revenus par statut
    const revenueByStatusData = await prisma.order.groupBy({
      by: ["status"],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const revenueByStatus = revenueByStatusData.map((item) => ({
      status: item.status,
      revenue: Number(item._sum.totalAmount || 0),
      count: item._count.id,
    }));

    return {
      totalRevenue,
      totalOrders,
      newUsersToday,
      activeUsers,
      newOrdersToday,
      lowStockProducts,
      revenueByDay: revenueByDay as Array<{
        date: string;
        revenue: number;
        orders: number;
      }>,
      topProducts: topProducts as Array<{
        name: string;
        revenue: number;
        orders: number;
      }>,
      revenueByStatus: revenueByStatus as Array<{
        status: string;
        revenue: number;
        count: number;
      }>,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw new Error("Erreur lors de la récupération des statistiques");
  }
}
