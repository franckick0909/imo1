import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Schema de validation pour créer un produit
const createProductSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  longDescription: z.string().optional(),
  price: z.number().min(0.01, "Le prix doit être supérieur à 0"),
  comparePrice: z.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stock: z.number().min(0, "Le stock ne peut pas être négatif"),
  lowStockThreshold: z.number().min(0, "Le seuil ne peut pas être négatif"),
  trackStock: z.boolean().default(true),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url()).optional(),
});

// Fonction utilitaire pour générer un slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET: Lister tous les produits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const slug = searchParams.get("slug");

    const where: {
      categoryId?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      slug?: string;
    } = {};

    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null) where.isActive = isActive === "true";
    if (isFeatured !== null) where.isFeatured = isFeatured === "true";
    if (slug) where.slug = slug;

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}

// POST: Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions admin
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin (ajustez selon votre système de rôles)
    // if (session.user.role !== "admin") {
    //   return NextResponse.json(
    //     { error: "Permissions insuffisantes" },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Générer un slug unique
    const baseSlug = generateSlug(validatedData.name);
    let slug = baseSlug;
    let counter = 1;

    // Vérifier l'unicité du slug
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Générer un SKU unique si non fourni
    let sku = validatedData.sku;
    if (!sku) {
      // Générer un SKU basé sur le nom du produit et un timestamp
      const baseSku = validatedData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 6);
      sku = `${baseSku}-${Date.now().toString().slice(-6)}`;
    }

    // Vérifier l'unicité du SKU
    let skuCounter = 1;
    const originalSku = sku;
    while (await prisma.product.findUnique({ where: { sku } })) {
      sku = `${originalSku}-${skuCounter}`;
      skuCounter++;
    }

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        longDescription: validatedData.longDescription,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice,
        sku: sku,
        barcode: validatedData.barcode,
        stock: validatedData.stock,
        lowStockThreshold: validatedData.lowStockThreshold,
        trackStock: validatedData.trackStock,
        weight: validatedData.weight,
        dimensions: validatedData.dimensions,
        categoryId: validatedData.categoryId,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        slug,
        images: validatedData.images
          ? {
              create: validatedData.images.map((url, index) => ({
                url,
                position: index,
                alt: validatedData.name,
              })),
            }
          : undefined,
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
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      {
        product,
        message: "Produit créé avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Gestion spécifique des erreurs Prisma
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Un produit avec ces données existe déjà" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}
