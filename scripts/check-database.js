const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log("🔍 Vérification de la base de données...\n");

    // Vérifier les utilisateurs
    const users = await prisma.user.count();
    console.log(`👥 Utilisateurs: ${users}`);

    // Vérifier les catégories
    const categories = await prisma.category.count();
    console.log(`📂 Catégories: ${categories}`);

    // Vérifier les produits
    const products = await prisma.product.count();
    console.log(`📦 Produits: ${products}`);

    // Vérifier les images
    const images = await prisma.productImage.count();
    console.log(`🖼️ Images: ${images}`);

    if (categories === 0) {
      console.log("\n❌ Aucune catégorie trouvée - Base de données vide");
    }

    if (products === 0) {
      console.log("❌ Aucun produit trouvé - Base de données vide");
    }

    console.log("\n💡 Il faut recréer les données de test");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
