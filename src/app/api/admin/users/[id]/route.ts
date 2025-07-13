import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // TODO: Vérifier les permissions admin

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "ID de l'utilisateur requis" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Éviter qu'un admin se supprime ses propres privilèges
    if (userId === session.user.id && body.role && body.role !== "admin") {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 403 }
      );
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.emailVerified !== undefined && {
          emailVerified: body.emailVerified,
        }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.phone !== undefined && { phone: body.phone }),
      },
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
    });

    // Calculer les statistiques
    const userWithStats = {
      ...updatedUser,
      ordersCount: updatedUser.orders.length,
      totalSpent: updatedUser.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      ),
    };

    return NextResponse.json(userWithStats);
  } catch (error) {
    console.error("[ADMIN_USER_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // TODO: Vérifier les permissions admin

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "ID de l'utilisateur requis" },
        { status: 400 }
      );
    }

    // Éviter qu'un admin se supprime lui-même
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 403 }
      );
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: "Utilisateur supprimé avec succès",
      userId,
    });
  } catch (error) {
    console.error("[ADMIN_USER_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
