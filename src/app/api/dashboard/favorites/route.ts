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

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("[DASHBOARD_FAVORITES_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des favoris" },
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
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // TODO: Implémenter l'ajout réel en base de données
    // Pour l'instant, on retourne une réponse simulée
    const newFavorite = {
      id: product.id,
      name: product.name,
      brand: "Natural Beauty", // TODO: Ajouter brand au schéma Product
      price: Number(product.price),
      rating: 4.5, // TODO: Calculer depuis les reviews
      reviews: 0, // TODO: Compter les reviews
      image: product.images[0]?.url || "/images/visage-1.jpg",
      inStock: product.stock > 0,
      slug: product.slug,
      categoryId: product.categoryId,
    };

    return NextResponse.json(newFavorite, { status: 201 });
  } catch (error) {
    console.error("[DASHBOARD_FAVORITES_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout aux favoris" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // TODO: Implémenter la suppression de tous les favoris
    // Pour l'instant, on retourne une réponse de succès
    return NextResponse.json({ message: "Favoris supprimés avec succès" });
  } catch (error) {
    console.error("[DASHBOARD_FAVORITES_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des favoris" },
      { status: 500 }
    );
  }
}
