"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

// ========================
// SCHEMAS DE VALIDATION
// ========================

const adminFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const userFiltersSchema = adminFiltersSchema.extend({
  role: z.string().optional(),
  banned: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

const orderFiltersSchema = adminFiltersSchema.extend({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
});

// ========================
// ACTIONS ADMIN STATISTIQUES
// ========================

// Cache pour les statistiques admin
const adminStatsCache = new Map<string, { data: unknown; timestamp: number }>();
const ADMIN_STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getAdminStatsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // TODO: Vérifier les permissions admin
    const cacheKey = "admin-stats:global";

    // Vérifier le cache
    const cached = adminStatsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ADMIN_STATS_CACHE_DURATION) {
      return {
        success: true,
        data: cached.data,
        cached: true,
      };
    }

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Récupérer les statistiques admin de manière optimisée
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

      // Produits en stock bas (stock <= 5)
      prisma.product.count({
        where: {
          AND: [{ trackStock: true }, { stock: { lte: 5 } }],
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

    // Sauvegarder en cache
    adminStatsCache.set(cacheKey, { data: stats, timestamp: Date.now() });

    return {
      success: true,
      data: stats,
      cached: false,
    };
  } catch (error) {
    console.error("[ADMIN_STATS_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement des statistiques admin",
    };
  }
}

// ========================
// ACTIONS ADMIN UTILISATEURS
// ========================

export async function getAdminUsersAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  banned?: boolean;
  emailVerified?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // TODO: Vérifier les permissions admin
    const validatedParams = userFiltersSchema.parse(params);

    const where: Record<string, unknown> = {};

    // Filtres
    if (validatedParams.search) {
      where.OR = [
        { name: { contains: validatedParams.search, mode: "insensitive" } },
        { email: { contains: validatedParams.search, mode: "insensitive" } },
      ];
    }

    if (validatedParams.role) {
      where.role = validatedParams.role;
    }

    if (validatedParams.banned !== undefined) {
      where.banned = validatedParams.banned;
    }

    if (validatedParams.emailVerified !== undefined) {
      where.emailVerified = validatedParams.emailVerified;
    }

    // Ordre de tri
    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[validatedParams.sortBy] = validatedParams.sortOrder;

    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Récupérer les utilisateurs avec statistiques
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: offset,
        take: validatedParams.limit,
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
      }),
      prisma.user.count({ where }),
    ]);

    // Calculer les statistiques pour chaque utilisateur
    const usersWithStats = users.map((user) => ({
      ...user,
      ordersCount: user.orders.length,
      totalSpent: user.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      ),
    }));

    const result = {
      users: usersWithStats,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit),
        hasNext: validatedParams.page * validatedParams.limit < total,
        hasPrev: validatedParams.page > 1,
      },
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[ADMIN_USERS_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement des utilisateurs",
    };
  }
}

// ========================
// ACTIONS ADMIN COMMANDES
// ========================

export async function getAdminOrdersAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // TODO: Vérifier les permissions admin
    const validatedParams = orderFiltersSchema.parse(params);

    const where: Record<string, unknown> = {};

  // Filtres
    if (validatedParams.search) {
      where.OR = [
        { id: { contains: validatedParams.search } },
        {
          customerName: {
            contains: validatedParams.search,
            mode: "insensitive",
          },
        },
        {
          customerEmail: {
            contains: validatedParams.search,
            mode: "insensitive",
          },
        },
        {
          user: {
            OR: [
              {
                name: { contains: validatedParams.search, mode: "insensitive" },
              },
              {
                email: {
                  contains: validatedParams.search,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ];
    }

    if (validatedParams.status) {
      where.status = validatedParams.status;
    }

    if (validatedParams.paymentStatus) {
      where.paymentStatus = validatedParams.paymentStatus;
    }

    // Ordre de tri
    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[validatedParams.sortBy] = validatedParams.sortOrder;

    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Récupérer les commandes
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip: offset,
        take: validatedParams.limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    select: {
                      url: true,
                    },
                    take: 1,
                  },
                  price: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Mapper les commandes avec les données admin
    const adminOrders = orders.map((order) => ({
      id: order.id,
      customerId: order.userId,
      customerName: order.user?.name || order.customerName,
      customerEmail: order.user?.email || order.customerEmail,
      customerAvatar: order.user?.image,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      shippingAddress: order.shippingAddress,
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || "Produit supprimé",
        productImage: item.product?.images?.[0]?.url || null,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity,
      })),
      itemsCount: order.orderItems.length,
    }));

    const result = {
      orders: adminOrders,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit),
        hasNext: validatedParams.page * validatedParams.limit < total,
        hasPrev: validatedParams.page > 1,
      },
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[ADMIN_ORDERS_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement des commandes",
    };
  }
}

// ========================
// ACTIONS ADMIN PRODUITS
// ========================

export async function getAdminProductsAction(params: {
  page?: number;
  limit?: number;
  search?: string;
    sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // TODO: Vérifier les permissions admin
    const validatedParams = adminFiltersSchema.parse(params);

    const where: Record<string, unknown> = {};

    // Filtres
    if (validatedParams.search) {
      where.OR = [
        { name: { contains: validatedParams.search, mode: "insensitive" } },
        {
          description: {
            contains: validatedParams.search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Ordre de tri
    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[validatedParams.sortBy] = validatedParams.sortOrder;

    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Récupérer les produits
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: offset,
        take: validatedParams.limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
          images: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              url: true,
              alt: true,
              position: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Sérialiser les données pour éviter les erreurs Decimal
    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      weight: product.weight ? Number(product.weight) : null,
    }));

    const result = {
      products: serializedProducts,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit),
        hasNext: validatedParams.page * validatedParams.limit < total,
        hasPrev: validatedParams.page > 1,
      },
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement des produits",
    };
  }
}

// ========================
// ACTIONS ADMIN PRODUIT INDIVIDUEL
// ========================

export async function getAdminProductAction(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // TODO: Vérifier les permissions admin

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        images: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            url: true,
            alt: true,
            position: true,
          },
        },
    },
  });

    if (!product) {
      return {
        success: false,
        error: "Produit non trouvé",
      };
    }

    // Sérialiser les données
    const serializedProduct = {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      weight: product.weight ? Number(product.weight) : null,
    };

    return {
      success: true,
      data: serializedProduct,
    };
  } catch (error) {
    console.error("[ADMIN_PRODUCT_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du produit",
    };
  }
}

// ========================
// ACTIONS CACHE ADMIN
// ========================

export async function clearAdminCacheAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // TODO: Vérifier les permissions admin

    // Vider le cache admin
    adminStatsCache.clear();

    return {
      success: true,
      message: "Cache admin vidé avec succès",
    };
  } catch (error) {
    console.error("[CLEAR_ADMIN_CACHE_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du vidage du cache admin",
    };
  }
}
