"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  statusText: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  canCancel: boolean;
  canTrack: boolean;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Récupérer les détails d'une commande
 */
export async function getOrderDetails(
  orderNumber: string
): Promise<ActionResult<OrderDetails>> {
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

    if (!orderNumber) {
      return {
        success: false,
        error: "Numéro de commande requis",
      };
    }

    // Récupérer les détails de la commande
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: session.user.id,
      },
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
    });

    if (!order) {
      return {
        success: false,
        error: "Commande non trouvée",
      };
    }

    // Mapper les données pour le format détaillé
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

    // Parser les adresses JSON
    const shippingAddress = order.shippingAddress as unknown as Address;
    const billingAddress =
      (order.billingAddress as unknown as Address) || shippingAddress;

    // Calculer la date de livraison estimée (3-5 jours ouvrables)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const detailedOrder: OrderDetails = {
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt.toISOString(),
      status: statusInfo.status,
      statusText: statusInfo.text,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      taxAmount: Number(order.taxAmount),
      total: Number(order.totalAmount),
      shippingMethod: order.shippingMethod || "Standard",
      trackingNumber: order.trackingNumber || undefined,
      estimatedDelivery: estimatedDelivery.toISOString(),
      shippingAddress: {
        firstName: shippingAddress.firstName || "",
        lastName: shippingAddress.lastName || "",
        street: shippingAddress.street || "",
        city: shippingAddress.city || "",
        postalCode: shippingAddress.postalCode || "",
        country: shippingAddress.country || "France",
      },
      billingAddress: {
        firstName: billingAddress.firstName || "",
        lastName: billingAddress.lastName || "",
        street: billingAddress.street || "",
        city: billingAddress.city || "",
        postalCode: billingAddress.postalCode || "",
        country: billingAddress.country || "France",
      },
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        image: item.product.images[0]?.url || "/images/visage-2.jpg",
        price: Number(item.price),
        quantity: item.quantity,
        total: Number(item.price) * item.quantity,
      })),
      canCancel: order.status === "PENDING" || order.status === "CONFIRMED",
      canTrack: !!order.trackingNumber,
    };

    return {
      success: true,
      data: detailedOrder,
    };
  } catch (error) {
    console.error("[ORDER_DETAILS_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors du chargement des détails de la commande",
    };
  }
}

/**
 * Annuler une commande
 */
export async function cancelOrder(
  orderNumber: string
): Promise<ActionResult<{ orderNumber: string }>> {
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

    if (!orderNumber) {
      return {
        success: false,
        error: "Numéro de commande requis",
      };
    }

    // Récupérer la commande
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: session.user.id,
      },
    });

    if (!order) {
      return {
        success: false,
        error: "Commande non trouvée",
      };
    }

    // Vérifier si la commande peut être annulée
    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return {
        success: false,
        error: "Cette commande ne peut plus être annulée",
      };
    }

    // Annuler la commande
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: { orderNumber: order.orderNumber },
    };
  } catch (error) {
    console.error("[ORDER_CANCEL_ACTION_ERROR]", error);
    return {
      success: false,
      error: "Erreur lors de l'annulation de la commande",
    };
  }
}
