"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getOrdersAction(
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    status?: string;
    paymentStatus?: string;
  } = {}
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Non autorisé");
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== "admin") {
      throw new Error("Permissions insuffisantes");
    }

    const offset = (page - 1) * limit;

    // Construire la clause where
    const where: Record<string, unknown> = {};

    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search } },
        { customerName: { contains: filters.search, mode: "insensitive" } },
        { customerEmail: { contains: filters.search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    // Récupérer les commandes
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
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
                  slug: true,
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
      orderNumber: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      userId: order.userId,
      customerName: order.user?.name || order.customerName,
      customerEmail: order.user?.email || order.customerEmail,
      subtotal: Number(order.totalAmount),
      shippingCost: 0,
      taxAmount: 0,
      totalAmount: Number(order.totalAmount),
      paymentMethod: null,
      shippingMethod: null,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: null,
      deliveredAt: null,
      user: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
          }
        : undefined,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug || "",
        },
      })),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      orders: adminOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("[GET_ORDERS_ERROR]", error);
    throw new Error("Erreur lors du chargement des commandes");
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Non autorisé");
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== "admin") {
      throw new Error("Permissions insuffisantes");
    }

    // Vérifier que la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new Error("Commande non trouvée");
    }

    // Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // Revalider le cache pour la page admin
    revalidatePath("/admin/orders");

    return {
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        userId: updatedOrder.userId,
        customerName: updatedOrder.user?.name || updatedOrder.customerName,
        customerEmail: updatedOrder.user?.email || updatedOrder.customerEmail,
        subtotal: Number(updatedOrder.totalAmount),
        shippingCost: 0,
        taxAmount: 0,
        totalAmount: Number(updatedOrder.totalAmount),
        paymentMethod: null,
        shippingMethod: null,
        trackingNumber: updatedOrder.trackingNumber,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        shippedAt: null,
        deliveredAt: null,
        user: updatedOrder.user
          ? {
              id: updatedOrder.user.id,
              name: updatedOrder.user.name,
              email: updatedOrder.user.email,
            }
          : undefined,
        orderItems: updatedOrder.orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug || "",
          },
        })),
      },
    };
  } catch (error) {
    console.error("[UPDATE_ORDER_STATUS_ERROR]", error);
    throw new Error("Erreur lors de la mise à jour du statut");
  }
}

export async function updatePaymentStatusAction(
  orderId: string,
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Non autorisé");
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== "admin") {
      throw new Error("Permissions insuffisantes");
    }

    // Vérifier que la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new Error("Commande non trouvée");
    }

    // Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // Revalider le cache pour la page admin
    revalidatePath("/admin/orders");

    return {
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        userId: updatedOrder.userId,
        customerName: updatedOrder.user?.name || updatedOrder.customerName,
        customerEmail: updatedOrder.user?.email || updatedOrder.customerEmail,
        subtotal: Number(updatedOrder.totalAmount),
        shippingCost: 0,
        taxAmount: 0,
        totalAmount: Number(updatedOrder.totalAmount),
        paymentMethod: null,
        shippingMethod: null,
        trackingNumber: updatedOrder.trackingNumber,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        shippedAt: null,
        deliveredAt: null,
        user: updatedOrder.user
          ? {
              id: updatedOrder.user.id,
              name: updatedOrder.user.name,
              email: updatedOrder.user.email,
            }
          : undefined,
        orderItems: updatedOrder.orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug || "",
          },
        })),
      },
    };
  } catch (error) {
    console.error("[UPDATE_PAYMENT_STATUS_ERROR]", error);
    throw new Error("Erreur lors de la mise à jour du statut de paiement");
  }
}
