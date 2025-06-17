import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction utilitaire pour générer un slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function seedCategories() {
  try {
    console.log("🌱 Seeding des catégories...");

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
      {
        name: "Soins du corps",
        description: "Crèmes et soins pour le corps",
      },
      {
        name: "Soins des mains",
        description: "Crèmes et soins spécialisés pour les mains",
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
        console.log(`✅ Catégorie créée: ${category.name}`);
      } else {
        console.log(`⚠️  Catégorie déjà existante: ${categoryData.name}`);
      }
    }

    console.log(
      `\n🎉 ${createdCategories.length} nouvelles catégories créées avec succès !`
    );

    // Afficher toutes les catégories existantes
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    console.log("\n📋 Catégories disponibles:");
    allCategories.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du seeding des catégories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
