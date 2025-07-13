import { auth } from "@/lib/auth";
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
    const limit = parseInt(searchParams.get("limit") || "20");
    const level = searchParams.get("level") || "";
    const action = searchParams.get("action") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // Construire la clause where
    const where: Record<string, unknown> = {};

    if (level) {
      where.level = level;
    }

    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }

    // Construire l'ordre de tri
    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[sortBy] = sortOrder as "asc" | "desc";

    // Pour l'instant, on génère des logs fictifs car il n'y a pas de table de logs dans le schéma
    // TODO: Créer une table AdminLog dans le schéma Prisma
    const logs = [
      {
        id: "1",
        action: "USER_LOGIN",
        level: "INFO",
        message: "Utilisateur connecté",
        userId: session.user.id,
        userEmail: session.user.email,
        userAvatar: session.user.image,
        metadata: { ip: "192.168.1.1" },
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
      {
        id: "2",
        action: "PRODUCT_CREATED",
        level: "INFO",
        message: "Nouveau produit créé",
        userId: session.user.id,
        userEmail: session.user.email,
        userAvatar: session.user.image,
        metadata: { productId: "prod123" },
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      },
      {
        id: "3",
        action: "ORDER_UPDATED",
        level: "WARNING",
        message: "Commande mise à jour",
        userId: session.user.id,
        userEmail: session.user.email,
        userAvatar: session.user.image,
        metadata: { orderId: "order456" },
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: "4",
        action: "USER_BANNED",
        level: "ERROR",
        message: "Utilisateur banni",
        userId: session.user.id,
        userEmail: session.user.email,
        userAvatar: session.user.image,
        metadata: { bannedUserId: "user789" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        id: "5",
        action: "CATEGORY_DELETED",
        level: "WARNING",
        message: "Catégorie supprimée",
        userId: session.user.id,
        userEmail: session.user.email,
        userAvatar: session.user.image,
        metadata: { categoryId: "cat101" },
        createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      },
    ];

    // Filtrer les logs selon les critères
    let filteredLogs = logs;

    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level);
    }

    if (action) {
      filteredLogs = filteredLogs.filter((log) =>
        log.action.toLowerCase().includes(action.toLowerCase())
      );
    }

    // Pagination
    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      logs: paginatedLogs,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("[ADMIN_LOGS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des logs" },
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

    const body = await request.json();
    const { action, level, message, metadata } = body;

    if (!action || !level || !message) {
      return NextResponse.json(
        { error: "Action, level et message requis" },
        { status: 400 }
      );
    }

    // Valider le niveau
    const validLevels = ["INFO", "WARNING", "ERROR"];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Niveau invalide" }, { status: 400 });
    }

    // TODO: Enregistrer le log dans la base de données
    const newLog = {
      id: Date.now().toString(),
      action,
      level,
      message,
      userId: session.user.id,
      userEmail: session.user.email,
      userAvatar: session.user.image,
      metadata: metadata || {},
      createdAt: new Date(),
    };

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_LOGS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du log" },
      { status: 500 }
    );
  }
}
