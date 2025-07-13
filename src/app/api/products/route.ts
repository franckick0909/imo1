import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Cache simple en mémoire
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Schema de validation pour créer un produit
const createProductSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  longDescription: z.string().optional(),

  // Nouveaux champs pour les détails produits
  ingredients: z.string().optional(),
  usage: z.string().optional(),
  benefits: z.string().optional(),

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

  // SEO amélioré
  slug: z.string().optional(),
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

// Fonction pour vérifier et récupérer du cache
function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Fonction pour sauvegarder en cache
function setCacheData(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

// GET: Lister tous les produits avec optimisations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const slug = searchParams.get("slug");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const fields = searchParams.get("fields")?.split(",") || [];

    // Limiter à 50 items maximum par requête
    const safeLimit = Math.min(limit, 50);
    const offset = (page - 1) * safeLimit;

    // Générer une clé de cache unique
    const cacheKey = `products:${categoryId || "all"}:${isActive}:${isFeatured}:${slug}:${page}:${safeLimit}:${fields.join(",")}`;

    // Vérifier le cache
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

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

    // Optimiser la sélection des champs
    const selectFields =
      fields.length > 0 ? getSelectFields(fields) : undefined;

    // Requête parallèle pour compter et récupérer les produits
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: selectFields || {
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
            take: 3, // Limiter à 3 images par produit
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: safeLimit,
      }),
      prisma.product.count({ where }),
    ]);

    // Transformer les champs Decimal en nombres pour éviter les erreurs de sérialisation
    const transformedProducts = products.map((product: any) => ({
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      weight: product.weight ? Number(product.weight) : null,
    }));

    const result = {
      products: transformedProducts,
      pagination: {
        page,
        limit: safeLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
        hasNext: page * safeLimit < totalCount,
        hasPrev: page > 1,
      },
    };

    // Sauvegarder en cache
    setCacheData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}

// Fonction pour mapper les champs demandés
function getSelectFields(fields: string[]) {
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

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Générer un slug unique
    const baseSlug = validatedData.slug || generateSlug(validatedData.name);
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
        ingredients: validatedData.ingredients,
        usage: validatedData.usage,
        benefits: validatedData.benefits,
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

    // Vider le cache après création
    cache.clear();

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}
