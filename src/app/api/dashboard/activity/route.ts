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
        },
      }),
    ]);

    // Générer les activités
    const activities = [];

    // Activités de commandes
    for (const order of recentOrders) {
      const now = new Date();
      const createdAt = new Date(order.createdAt);
      const timeDiff = now.getTime() - createdAt.getTime();
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      const daysDiff = Math.floor(hoursDiff / 24);

      let timeText = "";
      if (daysDiff > 0) {
        timeText = `Il y a ${daysDiff} jour${daysDiff > 1 ? "s" : ""}`;
      } else if (hoursDiff > 0) {
        timeText = `Il y a ${hoursDiff} heure${hoursDiff > 1 ? "s" : ""}`;
      } else {
        timeText = "Il y a quelques minutes";
      }

      // Activité de création de commande
      activities.push({
        id: `order-created-${order.id}`,
        type: "order",
        message: `Votre commande ${order.orderNumber} a été créée`,
        time: timeText,
        icon: "📦",
        link: `/dashboard/orders`,
      });

      // Activité de changement de statut
      if (order.status === "SHIPPED" && order.shippedAt) {
        const shippedAt = new Date(order.shippedAt);
        const shippedDiff = Math.floor(
          (now.getTime() - shippedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        activities.push({
          id: `order-shipped-${order.id}`,
          type: "order",
          message: `Votre commande ${order.orderNumber} a été expédiée`,
          time: `Il y a ${shippedDiff} jour${shippedDiff > 1 ? "s" : ""}`,
          icon: "🚚",
          link: `/dashboard/orders`,
        });
      }

      if (order.status === "DELIVERED" && order.deliveredAt) {
        const deliveredAt = new Date(order.deliveredAt);
        const deliveredDiff = Math.floor(
          (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        activities.push({
          id: `order-delivered-${order.id}`,
          type: "order",
          message: `Votre commande ${order.orderNumber} a été livrée`,
          time: `Il y a ${deliveredDiff} jour${deliveredDiff > 1 ? "s" : ""}`,
          icon: "✅",
          link: `/dashboard/orders`,
        });

        // Points de fidélité gagnés
        const points = Math.floor(Number(order.totalAmount));
        activities.push({
          id: `points-earned-${order.id}`,
          type: "points",
          message: `Vous avez gagné ${points} points de fidélité`,
          time: `Il y a ${deliveredDiff} jour${deliveredDiff > 1 ? "s" : ""}`,
          icon: "🎉",
        });
      }
    }

    // Activités de recommandations (produits récents)
    for (const product of recentProducts.slice(0, 2)) {
      const createdAt = new Date(product.createdAt);
      const daysDiff = Math.floor(
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 7) {
        // Seulement les produits des 7 derniers jours
        activities.push({
          id: `recommendation-${product.id}`,
          type: "recommendation",
          message: `Nouveau produit recommandé: ${product.name}`,
          time: `Il y a ${daysDiff} jour${daysDiff > 1 ? "s" : ""}`,
          icon: "✨",
          link: `/products/${product.slug}`,
        });
      }
    }

    // Trier les activités par pertinence et date
    const sortedActivities = activities
      .sort((a, b) => {
        // Prioriser les commandes récentes
        if (a.type === "order" && b.type !== "order") return -1;
        if (a.type !== "order" && b.type === "order") return 1;
        return 0;
      })
      .slice(0, 10); // Limiter à 10 activités

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error("[DASHBOARD_ACTIVITY_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de l'activité" },
      { status: 500 }
    );
  }
}
