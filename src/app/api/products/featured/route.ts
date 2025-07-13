import { cachedResponse, errorResponse } from "@/lib/compression";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

// Cache spécifique pour les produits featured
const featuredCache = new Map<string, { data: unknown; timestamp: number }>();
const FEATURED_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes pour les featured

// GET: Récupérer uniquement les produits featured optimisés
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");
    const safeLimit = Math.min(limit, 12); // Maximum 12 produits featured

    const cacheKey = `featured:${safeLimit}`;

    // Vérifier le cache
    const cached = featuredCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < FEATURED_CACHE_DURATION) {
      return cachedResponse(cached.data, 600); // 10 minutes de cache
    }

    // Requête ultra-optimisée pour les produits featured
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        stock: {
          gt: 0, // Seulement les produits en stock
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        comparePrice: true,
        stock: true,
        slug: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            position: true,
          },
          orderBy: {
            position: "asc",
          },
          take: 1, // Seulement la première image pour les featured
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: safeLimit,
    });

    // Transformer les champs Decimal en nombres pour éviter les erreurs de sérialisation
    const transformedProducts = products.map((product: any) => ({
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    }));

    const result = { products: transformedProducts };

    // Sauvegarder en cache
    featuredCache.set(cacheKey, { data: result, timestamp: Date.now() });

    return cachedResponse(result, 600); // 10 minutes de cache
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits featured:",
      error
    );
    return errorResponse(
      "Erreur lors de la récupération des produits featured",
      500
    );
  }
}
