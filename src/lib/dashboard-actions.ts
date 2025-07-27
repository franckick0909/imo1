"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

// ========================
// SCHEMAS DE VALIDATION
// ========================

const orderFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  status: z.string().optional(),
  search: z.string().optional(),
});

// ========================
// ACTIONS DASHBOARD STATISTIQUES
// ========================

// Cache pour les statistiques
const statsCache = new Map<string, { data: unknown; timestamp: number }>();
const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getDashboardStatsAction() {
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

    const userId = session.user.id;
    const cacheKey = `dashboard-stats:${userId}`;

    // Vérifier le cache
    const cached = statsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < STATS_CACHE_DURATION) {
      return {
        success: true,
        data: cached.data,
        cached: true,
      };
    }

    // Récupérer les statistiques utilisateur de manière optimisée
    const [ordersCount, totalSpentResult, favoritesCount, recentOrdersCount] =
      await Promise.all([
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

        // Nombre de favoris (placeholder pour l'instant)
        Promise.resolve(0),

        // Commandes récentes (30 derniers jours)
        prisma.order.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    // Calculer les points de fidélité (1 point par euro dépensé)
    const totalSpent = Number(totalSpentResult._sum.totalAmount || 0);
    const loyaltyPoints = Math.floor(totalSpent);

    const stats = {
      totalOrders: ordersCount,
      totalSpent: totalSpent,
      favoriteProducts: favoritesCount,
      loyaltyPoints: loyaltyPoints,
      recentOrders: recentOrdersCount,
      memberSince: session.user.createdAt,
      lastUpdated: new Date().toISOString(),
    };

    // Sauvegarder en cache
    statsCache.set(cacheKey, { data: stats, timestamp: Date.now() });

    return {
      success: true,
      data: stats,
      cached: false,
    };
  } catch (error) {
    console.error("[DASHBOARD_STATS_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement des statistiques",
    };
  }
}

// ========================
// ACTIONS DASHBOARD PROFIL
// ========================

export async function getDashboardProfileAction() {
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

    const userId = session.user.id;

    // Récupérer le profil utilisateur complet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        emailVerified: true,
        // Adresse de livraison
        shippingStreet: true,
        shippingCity: true,
        shippingPostalCode: true,
        shippingCountry: true,
        // Adresse de facturation
        billingStreet: true,
        billingCity: true,
        billingPostalCode: true,
        billingCountry: true,
        useSameAddress: true,
        // Préférences beauté
        skinType: true,
        skinConcerns: true,
        // Préférences de notification
        newsletter: true,
        promotions: true,
        // Dates
        createdAt: true,
        updatedAt: true,
    },
  });

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non trouvé",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("[DASHBOARD_PROFILE_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement du profil",
    };
  }
}

// ========================
// ACTIONS DASHBOARD COMMANDES
// ========================

export async function getDashboardOrdersAction(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
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

    const userId = session.user.id;
    const validatedParams = orderFiltersSchema.parse(params);

    const where: Record<string, unknown> = { userId };

    // Filtres
    if (validatedParams.status) {
      where.status = validatedParams.status;
    }

    if (validatedParams.search) {
      where.OR = [
        {
          orderNumber: {
            contains: validatedParams.search,
            mode: "insensitive",
          },
        },
        {
          orderItems: {
            some: {
              product: {
                name: { contains: validatedParams.search, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Récupérer les commandes avec pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  images: {
                    select: {
                      url: true,
                      alt: true,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: validatedParams.limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Transformer les données pour la sérialisation
    const transformedOrders = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      shippingCost: order.shippingCost ? Number(order.shippingCost) : 0,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
        product: item.product
          ? {
              ...item.product,
              price: Number(item.product.price),
            }
          : null,
      })),
    }));

    const result = {
      orders: transformedOrders,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / validatedParams.limit),
        hasNext: validatedParams.page * validatedParams.limit < totalCount,
        hasPrev: validatedParams.page > 1,
      },
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[DASHBOARD_ORDERS_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement des commandes",
    };
  }
}

// ========================
// ACTIONS DASHBOARD ACTIVITÉ
// ========================

export async function getDashboardActivityAction() {
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

    const userId = session.user.id;

    // Récupérer les activités récentes
    const [recentOrders, recentProducts] = await Promise.all([
      // Commandes récentes
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          shippedAt: true,
          deliveredAt: true,
          totalAmount: true,
        },
      }),

      // Produits récemment ajoutés (pour les recommandations)
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          createdAt: true,
          images: {
            select: {
              url: true,
              alt: true,
            },
            take: 1,
          },
        },
      }),
    ]);

    // Générer les activités
    const activities = [];

    // Ajouter les commandes récentes
    for (const order of recentOrders) {
      const orderAmount = Number(order.totalAmount);

      activities.push({
        id: `order-${order.id}`,
        type: "order",
        title: `Commande ${order.orderNumber}`,
        description: `Montant: ${orderAmount.toFixed(2)}€`,
        status: order.status,
        date: order.createdAt,
        icon: "📦",
        link: `/dashboard/orders?order=${order.orderNumber}`,
      });
    }

    // Ajouter les nouveaux produits
    for (const product of recentProducts) {
      activities.push({
        id: `product-${product.id}`,
        type: "product",
        title: "Nouveau produit disponible",
        description: `${product.name} - ${Number(product.price).toFixed(2)}€`,
        status: "new",
        date: product.createdAt,
        icon: "✨",
        link: `/products/${product.slug}`,
      });
    }

    // Trier par date décroissante
    activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      success: true,
      data: activities.slice(0, 10), // Limiter à 10 activités
    };
  } catch (error) {
    console.error("[DASHBOARD_ACTIVITY_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement de l'activité",
    };
  }
}

// ========================
// ACTIONS DASHBOARD FAVORIS
// ========================

export async function getDashboardFavoritesAction() {
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

    // Pour l'instant, on utilise des données simulées
    // TODO: Implémenter une vraie table favorites dans Prisma
    const favorites = [
      {
        id: "1",
        name: "Crème hydratante visage",
        brand: "Natural Beauty",
        price: 29.99,
        rating: 4.8,
        reviews: 127,
        image: "/images/creme-verte.png",
        inStock: true,
        slug: "creme-hydratante-visage",
        categoryId: "cat1",
      },
      {
        id: "2",
        name: "Sérum anti-âge",
        brand: "Premium Care",
        price: 59.99,
        rating: 4.9,
        reviews: 89,
        image: "/images/creme-rose.png",
        inStock: true,
        slug: "serum-anti-age",
        categoryId: "cat2",
      },
    ];

    return {
      success: true,
      data: favorites,
    };
  } catch (error) {
    console.error("[DASHBOARD_FAVORITES_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement des favoris",
    };
  }
}

// ========================
// ACTIONS CACHE DASHBOARD
// ========================

export async function clearDashboardCacheAction() {
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

    const userId = session.user.id;

    // Vider le cache des statistiques pour cet utilisateur
    const statsKey = `dashboard-stats:${userId}`;
    statsCache.delete(statsKey);

    return {
      success: true,
      message: "Cache dashboard vidé avec succès",
    };
  } catch (error) {
    console.error("[CLEAR_DASHBOARD_CACHE_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du vidage du cache dashboard",
    };
  }
}
