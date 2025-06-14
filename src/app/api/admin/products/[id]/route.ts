import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Récupérer un produit spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        images: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            url: true,
            alt: true,
            position: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Sérialiser les données
    const serializedProduct = {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      weight: product.weight ? Number(product.weight) : null,
    };

    return NextResponse.json(serializedProduct);
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}

// Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Supprimer d'abord les images associées
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    // Puis supprimer le produit
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}

// Mettre à jour un produit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Séparer les images des autres données
    const { images, ...productData } = body;

    // Mettre à jour le produit dans une transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour les données du produit
      const product = await tx.product.update({
        where: { id },
        data: productData,
      });

      // 2. Gérer les images si elles sont fournies
      if (images && Array.isArray(images)) {
        // Supprimer toutes les images existantes
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Créer les nouvelles images avec leurs positions
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((url: string, index: number) => ({
              productId: id,
              url,
              position: index,
              alt: product.name,
            })),
          });
        }
      }

      // 3. Récupérer le produit complet avec ses relations
      return await tx.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
          images: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              url: true,
              alt: true,
              position: true,
            },
          },
        },
      });
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Sérialiser les données
    const serializedProduct = {
      ...updatedProduct,
      price: Number(updatedProduct.price),
      comparePrice: updatedProduct.comparePrice
        ? Number(updatedProduct.comparePrice)
        : null,
      weight: updatedProduct.weight ? Number(updatedProduct.weight) : null,
    };

    return NextResponse.json(serializedProduct);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du produit" },
      { status: 500 }
    );
  }
}
