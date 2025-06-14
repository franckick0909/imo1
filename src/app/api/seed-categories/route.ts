import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

// POST: Créer les catégories par défaut
export async function POST() {
  try {
    const defaultCategories = [
      {
        name: "Hydratation",
        description: "Crèmes et soins hydratants pour tous types de peau",
      },
      {
        name: "Anti-âge",
        description: "Produits anti-âge et soins raffermissants",
      },
      {
        name: "Purification",
        description: "Nettoyants et masques purifiants",
      },
      {
        name: "Protection solaire",
        description: "Crèmes et soins de protection solaire",
      },
    ];

    const createdCategories = [];

    for (const categoryData of defaultCategories) {
      // Vérifier si la catégorie existe déjà
      const existingCategory = await prisma.category.findUnique({
        where: { name: categoryData.name },
      });

      if (!existingCategory) {
        const slug = generateSlug(categoryData.name);

        const category = await prisma.category.create({
          data: {
            name: categoryData.name,
            description: categoryData.description,
            slug,
            isActive: true,
          },
        });

        createdCategories.push(category);
      }
    }

    return NextResponse.json({
      message: `${createdCategories.length} catégories créées avec succès`,
      categories: createdCategories,
    });
  } catch (error) {
    console.error("Erreur lors de la création des catégories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création des catégories" },
      { status: 500 }
    );
  }
}
