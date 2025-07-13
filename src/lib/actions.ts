"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Types
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProduct(product: any): Product {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const select: Record<string, any> = {};
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
    const transformedProducts = products.map(transformProduct);

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
