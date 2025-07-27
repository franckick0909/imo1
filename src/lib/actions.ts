"use server";

import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Types pour les produits Prisma (avant transformation)
interface PrismaProduct {
  id: string;
  name: string;
  description: string | null;
  price: Decimal;
  comparePrice?: Decimal | null;
  stock: number;
  slug: string;
  weight?: Decimal | null;
  isActive?: boolean;
  isFeatured?: boolean;
  longDescription?: string | null;
  ingredients?: string | null;
  usage?: string | null;
  benefits?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt?: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    alt?: string | null;
    position: number;
  }[];
}

// Types pour les produits transformés
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice?: number;
  stock: number;
  slug: string;
  weight?: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    alt?: string | null;
    position: number;
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Helper pour convertir les Decimal de Prisma en number
function transformProduct(product: PrismaProduct): Product {
  return {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice
      ? Number(product.comparePrice)
      : undefined,
    weight: product.weight ? Number(product.weight) : undefined,
  };
}

/**
 * Récupérer les produits featured
 */
export async function getFeaturedProducts(
  limit: number = 6
): Promise<Product[]> {
  console.log("🔄 Fetching featured products from database...");

  try {
    const products = await prisma.product.findMany({
      take: limit,
      where: {
        stock: {
          gt: 0, // Seulement les produits en stock
        },
      },
      include: {
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
        },
      },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    });

    const transformedProducts = products.map(transformProduct);
    console.log(
      `✅ Featured products fetched: ${transformedProducts.length} items`
    );
    return transformedProducts;
  } catch (error) {
    console.error("❌ Error fetching featured products:", error);
    throw new Error("Failed to fetch featured products");
  }
}

/**
 * Récupérer les catégories
 */
export async function getCategories(): Promise<Category[]> {
  console.log("🔄 Fetching categories from database...");

  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`✅ Categories fetched: ${categories.length} items`);
    return categories;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

/**
 * Récupérer les produits avec pagination et filtres
 */
export async function getProducts({
  page = 1,
  limit = 10,
  categoryId,
  fields = ["id", "name", "price", "images", "category"],
}: {
  page?: number;
  limit?: number;
  categoryId?: string;
  fields?: string[];
}): Promise<PaginatedProducts> {
  console.log("🔄 Fetching products with pagination...", {
    page,
    limit,
    categoryId,
  });

  try {
    const skip = (page - 1) * limit;
    const where = categoryId ? { categoryId } : {};

    // Construire la sélection dynamique
    const select: Record<string, unknown> = {};
    if (fields.includes("id")) select.id = true;
    if (fields.includes("name")) select.name = true;
    if (fields.includes("description")) select.description = true;
    if (fields.includes("price")) select.price = true;
    if (fields.includes("comparePrice")) select.comparePrice = true;
    if (fields.includes("stock")) select.stock = true;
    if (fields.includes("slug")) select.slug = true;

    if (fields.includes("category")) {
      select.category = {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      };
    }

    if (fields.includes("images")) {
      select.images = {
        select: {
          id: true,
          url: true,
          alt: true,
          position: true,
        },
        orderBy: {
          position: "asc",
        },
      };
    }

    // Récupérer les produits et le total en parallèle
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Transformer les produits pour corriger les types
    const transformedProducts = products.map((product: unknown) => {
      const p = product as PrismaProduct;
      return {
        ...p,
        price: p.price ? Number(p.price) : 0,
        comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
        weight: p.weight ? Number(p.weight) : undefined,
      };
    });

    const paginatedResult: PaginatedProducts = {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    console.log(
      `✅ Products fetched: ${transformedProducts.length}/${total} items`
    );
    return paginatedResult;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Récupérer un produit par son slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  console.log("🔄 Fetching product by slug:", slug);

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
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
        },
      },
    });

    if (!product) {
      console.log(`❌ Product not found: ${slug}`);
      return null;
    }

    const transformedProduct = transformProduct(product);
    console.log(`✅ Product fetched: ${transformedProduct.name}`);
    return transformedProduct;
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

/**
 * Invalider le cache des produits
 */
export async function revalidateProducts() {
  console.log("🔄 Revalidating products cache...");

  try {
    revalidatePath("/");
    revalidatePath("/products");

    console.log("✅ Products cache revalidated");
  } catch (error) {
    console.error("❌ Error revalidating products cache:", error);
    throw new Error("Failed to revalidate products cache");
  }
}

/**
 * Invalider le cache des catégories
 */
export async function revalidateCategories() {
  console.log("🔄 Revalidating categories cache...");

  try {
    revalidatePath("/");
    revalidatePath("/products");

    console.log("✅ Categories cache revalidated");
  } catch (error) {
    console.error("❌ Error revalidating categories cache:", error);
    throw new Error("Failed to revalidate categories cache");
  }
}

// ========================
// ACTIONS PRODUITS
// ========================

// Schema pour les paramètres des produits
const getProductsSchema = z.object({
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  slug: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  fields: z.array(z.string()).optional(),
});

// Cache pour les produits
const productsCache = new Map<string, { data: unknown; timestamp: number }>();
const PRODUCTS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction pour vérifier et récupérer du cache
function getCachedProducts(key: string) {
  const cached = productsCache.get(key);
  if (cached && Date.now() - cached.timestamp < PRODUCTS_CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Fonction pour sauvegarder en cache
function setCachedProducts(key: string, data: unknown) {
  productsCache.set(key, { data, timestamp: Date.now() });
}

// Fonction pour mapper les champs demandés
function getProductSelectFields(fields?: string[]) {
  if (!fields || fields.length === 0) {
    return {
      id: true,
      name: true,
      description: true,
      price: true,
      comparePrice: true,
      stock: true,
      slug: true,
      isActive: true,
      isFeatured: true,
      createdAt: true,
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
        take: 3,
      },
    };
  }

  const selectObj: Record<string, unknown> = {};
  fields.forEach((field) => {
    switch (field) {
      case "id":
      case "name":
      case "description":
      case "price":
      case "comparePrice":
      case "stock":
      case "slug":
      case "isActive":
      case "isFeatured":
      case "createdAt":
        selectObj[field] = true;
        break;
      case "category":
        selectObj.category = {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        };
        break;
      case "images":
        selectObj.images = {
          select: {
            id: true,
            url: true,
            alt: true,
            position: true,
          },
          orderBy: {
            position: "asc",
          },
          take: 3,
        };
        break;
    }
  });

  return Object.keys(selectObj).length > 0 ? selectObj : undefined;
}

// Server Action pour récupérer les produits
export async function getProductsAction(params: {
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  slug?: string;
  page?: number;
  limit?: number;
  fields?: string[];
}) {
  try {
    const validatedParams = getProductsSchema.parse(params);

    // Générer une clé de cache unique
    const cacheKey = `products:${JSON.stringify(validatedParams)}`;

    // Vérifier le cache
    const cachedResult = getCachedProducts(cacheKey);
    if (cachedResult) {
      return {
        success: true,
        data: cachedResult,
        cached: true,
      };
    }

    const offset = (validatedParams.page - 1) * validatedParams.limit;
    const where: Record<string, unknown> = {};

    if (validatedParams.categoryId)
      where.categoryId = validatedParams.categoryId;
    if (validatedParams.isActive !== undefined)
      where.isActive = validatedParams.isActive;
    if (validatedParams.isFeatured !== undefined)
      where.isFeatured = validatedParams.isFeatured;
    if (validatedParams.slug) where.slug = validatedParams.slug;

    const selectFields = getProductSelectFields(validatedParams.fields);

    // Requête parallèle pour compter et récupérer les produits
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: selectFields,
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: validatedParams.limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Transformer les champs Decimal en nombres
    const transformedProducts = products.map((product: unknown) => {
      const p = product as PrismaProduct;
      return {
        ...p,
        price: p.price ? Number(p.price) : 0,
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        weight: p.weight ? Number(p.weight) : null,
      };
    });

    const result = {
      products: transformedProducts,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / validatedParams.limit),
        hasNext: validatedParams.page * validatedParams.limit < totalCount,
        hasPrev: validatedParams.page > 1,
      },
    };

    // Sauvegarder en cache
    setCachedProducts(cacheKey, result);

    return {
      success: true,
      data: result,
      cached: false,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des produits",
    };
  }
}

// Server Action pour récupérer les produits featured
export async function getFeaturedProductsAction(limit: number = 6) {
  try {
    const safeLimit = Math.min(limit, 12);
    const cacheKey = `featured-products:${safeLimit}`;

    // Vérifier le cache
    const cachedResult = getCachedProducts(cacheKey);
    if (cachedResult) {
      return {
        success: true,
        data: cachedResult,
        cached: true,
      };
    }

    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        stock: {
          gt: 0,
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
          take: 1,
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: safeLimit,
    });

    // Transformer les champs Decimal
    const transformedProducts = products.map((product: unknown) => {
      const p = product as PrismaProduct;
      return {
        ...p,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      };
    });

    const result = { products: transformedProducts };

    // Sauvegarder en cache
    setCachedProducts(cacheKey, result);

    return {
      success: true,
      data: result,
      cached: false,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits featured:",
      error
    );
    return {
      success: false,
      error: "Erreur lors de la récupération des produits featured",
    };
  }
}

// Server Action pour récupérer un produit par slug
export async function getProductBySlugAction(slug: string) {
  try {
    const cacheKey = `product:${slug}`;

    // Vérifier le cache
    const cachedResult = getCachedProducts(cacheKey);
    if (cachedResult) {
      return {
        success: true,
        data: cachedResult,
        cached: true,
      };
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        longDescription: true,
        ingredients: true,
        usage: true,
        benefits: true,
        price: true,
        comparePrice: true,
        stock: true,
        slug: true,
        isActive: true,
        isFeatured: true,
        metaTitle: true,
        metaDescription: true,
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
        },
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Produit non trouvé",
      };
    }

    // Transformer les champs Decimal
    const transformedProduct = {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    };

    // Sauvegarder en cache
    setCachedProducts(cacheKey, transformedProduct);

    return {
      success: true,
      data: transformedProduct,
      cached: false,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du produit",
    };
  }
}

// ========================
// ACTIONS CATÉGORIES
// ========================

// Cache pour les catégories
const categoriesCache = new Map<string, { data: unknown; timestamp: number }>();
const CATEGORIES_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Server Action pour récupérer les catégories
export async function getCategoriesAction() {
  try {
    const cacheKey = "categories:all";

    // Vérifier le cache
    const cached = categoriesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CATEGORIES_CACHE_DURATION) {
      return {
        success: true,
        data: cached.data,
        cached: true,
      };
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
      },
    });

    // Sauvegarder en cache
    categoriesCache.set(cacheKey, { data: categories, timestamp: Date.now() });

    return {
      success: true,
      data: categories,
      cached: false,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des catégories",
    };
  }
}

// ========================
// ACTIONS FRAIS DE PORT
// ========================

// Server Action pour calculer les frais de port
export async function calculateShippingAction(params: {
  country: string;
  postalCode?: string;
  weight: number;
  value: number;
}) {
  try {
    const { country, postalCode, weight, value } = params;

    // Validation des paramètres
    if (!country || !weight || weight <= 0 || value < 0) {
      return {
        success: false,
        error: "Paramètres invalides",
      };
    }

    // Utiliser la fonction existante de calcul des frais de port
    const { calculateShipping } = await import("@/lib/shipping-utils");
    const shippingResponse = calculateShipping({
      country,
      postalCode: postalCode || "",
      weight,
      value,
    });

    if (shippingResponse.errors && shippingResponse.errors.length > 0) {
      return {
        success: false,
        error: shippingResponse.errors.join(", "),
      };
    }

    return {
      success: true,
      data: shippingResponse,
    };
  } catch (error) {
    console.error("Erreur calcul frais de port:", error);
    return {
      success: false,
      error: "Erreur lors du calcul des frais de port",
    };
  }
}

// ========================
// ACTIONS CACHE
// ========================

// Server Action pour vider le cache
export async function clearCacheAction(
  type: "products" | "categories" | "all"
) {
  try {
    switch (type) {
      case "products":
        productsCache.clear();
        break;
      case "categories":
        categoriesCache.clear();
        break;
      case "all":
        productsCache.clear();
        categoriesCache.clear();
        break;
    }

    return {
      success: true,
      message: `Cache ${type} vidé avec succès`,
    };
  } catch (error) {
    console.error("Erreur lors du vidage du cache:", error);
    return {
      success: false,
      error: "Erreur lors du vidage du cache",
    };
  }
}
