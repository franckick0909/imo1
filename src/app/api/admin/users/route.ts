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
    const role = searchParams.get("role") || "";
    const banned = searchParams.get("banned");
    const emailVerified = searchParams.get("emailVerified");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // Construire la clause where
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (banned !== null && banned !== undefined) {
      where.banned = banned === "true";
    }

    if (emailVerified !== null && emailVerified !== undefined) {
      where.emailVerified = emailVerified === "true";
    }

    // Construire l'ordre de tri
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[sortBy] = sortOrder as 'asc' | 'desc';

    // Récupérer les utilisateurs avec statistiques
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
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
      // lastLogin: null, // TODO: Ajouter au schéma
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: usersWithStats,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("[ADMIN_USERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des utilisateurs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // TODO: Vérifier les permissions admin

    const body = await request.json();
    const {
      name,
      email,
      role = "user",
      emailVerified = false,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified,
        role,
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
      },
    });

    // TODO: Si un mot de passe est fourni, créer un compte avec mot de passe

    return NextResponse.json(
      {
        ...newUser,
        ordersCount: 0,
        totalSpent: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_USERS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
