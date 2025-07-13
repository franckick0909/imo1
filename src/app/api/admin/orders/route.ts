import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // TODO: Vérifier les permissions admin

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // Construire la clause where
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // Construire l'ordre de tri
    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[sortBy] = sortOrder as "asc" | "desc";

    // Récupérer les commandes
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
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

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      orders: adminOrders,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("[ADMIN_ORDERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des commandes" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // TODO: Vérifier les permissions admin

    const body = await request.json();
    const { orderId, status, paymentStatus, trackingNumber } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "ID de commande requis" },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status !== undefined && { status }),
        ...(paymentStatus !== undefined && { paymentStatus }),
        ...(trackingNumber !== undefined && { trackingNumber }),
      },
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
    });

    // Mapper la commande avec les données admin
    const adminOrder = {
      id: updatedOrder.id,
      customerId: updatedOrder.userId,
      customerName: updatedOrder.user?.name || updatedOrder.customerName,
      customerEmail: updatedOrder.user?.email || updatedOrder.customerEmail,
      customerAvatar: updatedOrder.user?.image,
      totalAmount: Number(updatedOrder.totalAmount),
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      trackingNumber: updatedOrder.trackingNumber,
      createdAt: updatedOrder.createdAt,
      shippingAddress: updatedOrder.shippingAddress,
      items: updatedOrder.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || "Produit supprimé",
        productImage: item.product?.images?.[0]?.url || null,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity,
      })),
      itemsCount: updatedOrder.orderItems.length,
    };

    return NextResponse.json(adminOrder);
  } catch (error) {
    console.error("[ADMIN_ORDERS_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}
