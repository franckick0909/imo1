import { cachedResponse, errorResponse } from "@/lib/compression";
import prisma from "@/lib/prisma";

// Cache pour les catégories
const categoriesCache = new Map<string, { data: unknown; timestamp: number }>();
const CATEGORIES_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// GET: Lister toutes les catégories actives avec cache
export async function GET() {
  try {
    const cacheKey = "categories:all";

    // Vérifier le cache
    const cached = categoriesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CATEGORIES_CACHE_DURATION) {
      return cachedResponse(cached.data, 900); // 15 minutes de cache
    }

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
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
      },
    });

    // Sauvegarder en cache
    categoriesCache.set(cacheKey, { data: categories, timestamp: Date.now() });

    return cachedResponse({ categories }, 900); // 15 minutes de cache
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return errorResponse("Erreur lors de la récupération des catégories", 500);
  }
}
