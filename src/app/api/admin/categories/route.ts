import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/compression";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET: Lister toutes les catégories pour l'admin
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id) {
      return errorResponse("Accès non autorisé", 401);
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Transformer les données pour correspondre à l'interface AdminCategory
    const adminCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productsCount: category._count.products,
    }));

    return NextResponse.json(adminCategories);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des catégories admin:",
      error
    );
    return errorResponse("Erreur lors de la récupération des catégories", 500);
  }
}

// POST: Créer une nouvelle catégorie
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id) {
      return errorResponse("Accès non autorisé", 401);
    }

    const body = await request.json();
    const { name, description, image, slug, isActive = true } = body;

    // Validation basique
    if (!name || !slug) {
      return errorResponse("Le nom et le slug sont requis", 400);
    }

    // Vérifier si le slug existe déjà
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return errorResponse("Une catégorie avec ce slug existe déjà", 409);
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        slug,
        isActive,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const adminCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productsCount: category._count.products,
    };

    return NextResponse.json(adminCategory, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return errorResponse("Erreur lors de la création de la catégorie", 500);
  }
}
