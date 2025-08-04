"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Types pour les filtres
interface ProductsFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  lowStock?: boolean;
  sortBy?: "name" | "price" | "stock" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Fonction utilitaire pour sérialiser un produit
function serializeProduct(product: {
  id: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  ingredients: string | null;
  usage: string | null;
  benefits: string | null;
  price: unknown; // Decimal from Prisma
  comparePrice: unknown; // Decimal from Prisma
  sku: string | null;
  barcode: string | null;
  stock: number;
  lowStockThreshold: number;
  trackStock: boolean;
  weight: unknown; // Decimal from Prisma
  dimensions: string | null;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  images?: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }>;
}) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    longDescription: product.longDescription,
    ingredients: product.ingredients,
    usage: product.usage,
    benefits: product.benefits,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    sku: product.sku,
    barcode: product.barcode,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    trackStock: product.trackStock,
    weight: product.weight ? Number(product.weight) : null,
    dimensions: product.dimensions,
    slug: product.slug,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    categoryId: product.categoryId,
    category: product.category,
    images: product.images,
  };
}

// Récupérer les produits avec pagination et filtres
export async function getProductsAction(
  page: number = 1,
  limit: number = 10,
  filters: ProductsFilters = {}
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    const offset = (page - 1) * limit;

    // Construire la clause where
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
      }>;
      categoryId?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      stock?: { lte: number };
    } = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.lowStock) {
      where.stock = { lte: 5 }; // Utiliser la valeur par défaut du lowStockThreshold
    }

    // Compter le total
    const total = await prisma.product.count({ where });

    // Récupérer les produits
    const products = await prisma.product.findMany({
      where,
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
      skip: offset,
      take: limit,
    });

    // Sérialiser les données pour éviter les erreurs Decimal
    const serializedProducts = products.map(serializeProduct);

    return {
      products: serializedProducts,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    throw new Error("Erreur lors de la récupération des produits");
  }
}

// Récupérer toutes les catégories
export async function getCategoriesAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
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

    return adminCategories;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    throw new Error("Erreur lors de la récupération des catégories");
  }
}

// Basculer le statut actif d'un produit
export async function toggleProductActiveAction(productId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    // Récupérer le produit actuel
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Produit non trouvé");
    }

    // Basculer le statut
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
    });

    revalidatePath("/admin/products");
    return serializeProduct(updatedProduct);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    throw new Error("Erreur lors de la mise à jour du produit");
  }
}

// Basculer le statut vedette d'un produit
export async function toggleProductFeaturedAction(productId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    // Récupérer le produit actuel
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Produit non trouvé");
    }

    // Basculer le statut
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isFeatured: !product.isFeatured },
    });

    revalidatePath("/admin/products");
    return serializeProduct(updatedProduct);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    throw new Error("Erreur lors de la mise à jour du produit");
  }
}

// Supprimer un produit
export async function deleteProductAction(productId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est admin
    if (!session?.user?.id || session.user.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Produit non trouvé");
    }

    // Supprimer les images du produit
    await prisma.productImage.deleteMany({
      where: { productId },
    });

    // Supprimer le produit
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    throw new Error("Erreur lors de la suppression du produit");
  }
}
