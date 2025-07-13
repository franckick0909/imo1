import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // TODO: Implémenter la suppression réelle en base de données
    // Pour l'instant, on retourne une réponse de succès
    return NextResponse.json({
      message: "Favori supprimé avec succès",
      productId,
    });
  } catch (error) {
    console.error("[DASHBOARD_FAVORITES_DELETE_ID_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du favori" },
      { status: 500 }
    );
  }
}
