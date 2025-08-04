"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

// Types pour les statistiques admin
interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  newOrdersToday: number;
  lowStockProducts: number;
}

// Types pour les filtres utilisateurs
interface UsersFilters {
  search?: string;
  role?: string;
  banned?: boolean;
}

// Récupérer les utilisateurs avec pagination et filtres
export async function getUsersAction(
  page: number = 1,
  limit: number = 10,
  filters: UsersFilters = {}
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    const offset = (page - 1) * limit;

    // Construire la clause where
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      }>;
      role?: string;
      banned?: boolean;
    } = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.banned !== undefined) {
      where.banned = filters.banned;
    }

    // Compter le total
    const total = await prisma.user.count({ where });

    // Récupérer les utilisateurs
    const users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    return {
      users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }
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

    // Calculer la date d'aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Récupérer les statistiques en parallèle
    const [
      totalUsers,
      totalOrders,
      activeUsers,
      bannedUsers,
      newUsersToday,
      newOrdersToday,
      lowStockProducts,
      orders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.user.count({
        where: {
          orders: {
            some: {},
          },
        },
      }),
      prisma.user.count({
        where: {
          banned: true,
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.product.count({
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
      }),
      prisma.order.findMany({
        where: {
          status: {
            in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
        select: {
          totalAmount: true,
        },
      }),
    ]);

    // Calculer les revenus totaux
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
      activeUsers,
      bannedUsers,
      newUsersToday,
      newOrdersToday,
      lowStockProducts,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw new Error("Erreur lors de la récupération des statistiques");
  }
}

// Bannir un utilisateur
export async function banUserAction(userId: string, reason: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: true,
        banReason: reason,
        banExpires: null, // Bannissement permanent
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Erreur lors du bannissement:", error);
    throw new Error("Erreur lors du bannissement");
  }
}

// Débannir un utilisateur
export async function unbanUserAction(userId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Erreur lors du débannissement:", error);
    throw new Error("Erreur lors du débannissement");
  }
}

// Changer le rôle d'un utilisateur
export async function setUserRoleAction(userId: string, role: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Erreur lors du changement de rôle:", error);
    throw new Error("Erreur lors du changement de rôle");
  }
}
