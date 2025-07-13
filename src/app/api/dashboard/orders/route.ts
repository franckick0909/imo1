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

    // Récupérer les commandes utilisateur
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mapper les données pour correspondre au format attendu
    const formattedOrders = orders.map((order) => {
      const statusMapping = {
        PENDING: { status: "processing", text: "En attente" },
        CONFIRMED: { status: "processing", text: "Confirmée" },
        PROCESSING: { status: "processing", text: "En préparation" },
        SHIPPED: { status: "shipped", text: "Expédiée" },
        DELIVERED: { status: "delivered", text: "Livrée" },
        CANCELLED: { status: "cancelled", text: "Annulée" },
        REFUNDED: { status: "cancelled", text: "Remboursée" },
      };

      const statusInfo = statusMapping[order.status] || {
        status: "processing",
        text: "En cours",
      };

      return {
        id: order.orderNumber,
        date: order.createdAt.toISOString().split("T")[0],
        status: statusInfo.status,
        statusText: statusInfo.text,
        total: Number(order.totalAmount),
        items: order.orderItems.length,
        trackingNumber: order.trackingNumber,
        products: order.orderItems.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          image: item.product.images[0]?.url || "/images/visage-2.jpg",
          price: Number(item.price),
          quantity: item.quantity,
        })),
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("[DASHBOARD_ORDERS_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des commandes" },
      { status: 500 }
    );
  }
}
