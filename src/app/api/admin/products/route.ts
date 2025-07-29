import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Sérialiser les données pour éviter les erreurs Decimal
    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      weight: product.weight ? Number(product.weight) : null,
    }));

    return NextResponse.json(serializedProducts);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Données reçues pour création de produit:", body);

    // Validation des données requises
    if (!body.name || !body.description || !body.price || !body.categoryId) {
      return NextResponse.json(
        { error: "Données manquantes pour la création du produit" },
        { status: 400 }
      );
    }

    // Créer le produit avec Prisma
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        longDescription: body.longDescription,
        ingredients: body.ingredients,
        usage: body.usage,
        benefits: body.benefits,
        price: body.price,
        comparePrice: body.comparePrice,
        sku: body.sku,
        barcode: body.barcode,
        stock: body.stock || 0,
        lowStockThreshold: body.lowStockThreshold || 5,
        trackStock: body.trackStock !== undefined ? body.trackStock : true,
        weight: body.weight,
        dimensions: body.dimensions,
        slug: body.slug,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isFeatured: body.isFeatured !== undefined ? body.isFeatured : false,
        categoryId: body.categoryId,
      },
      include: {
        category: true,
        images: true,
      },
    });

    // Créer les images du produit si fournies
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      const imageData = body.images.map((imageUrl: string, index: number) => ({
        url: imageUrl,
        alt: `${body.name} - Image ${index + 1}`,
        position: index,
        productId: product.id,
      }));

      await prisma.productImage.createMany({
        data: imageData,
      });
    }

    console.log("Produit créé avec succès:", product);

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice
          ? Number(product.comparePrice)
          : null,
        weight: product.weight ? Number(product.weight) : null,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}
