const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixAdminRole() {
  try {
    console.log("🔍 Recherche des utilisateurs...");

    // Lister tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log("👥 Utilisateurs trouvés:");
    users.forEach((user) => {
      console.log(
        `- ${user.email} (${user.name || "Pas de nom"}) - Rôle: ${user.role || "user"}`
      );
    });

    // Chercher l'utilisateur admin (franckick2@gmail.com)
    const adminUser = users.find(
      (user) => user.email === "franckick2@gmail.com"
    );

    if (adminUser) {
      console.log(`\n🎯 Utilisateur admin trouvé: ${adminUser.email}`);

      if (adminUser.role !== "admin") {
        console.log("🔧 Mise à jour du rôle admin...");

        await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: "admin" },
        });

        console.log("✅ Rôle admin mis à jour avec succès!");
      } else {
        console.log("✅ L'utilisateur a déjà le rôle admin");
      }
    } else {
      console.log("❌ Utilisateur admin non trouvé");
      console.log(
        "💡 Connectez-vous d'abord avec Google, puis relancez ce script"
      );
    }

    // Vérifier les produits en vedette
    console.log("\n🌟 Vérification des produits en vedette...");
    const featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true },
      select: { id: true, name: true, isFeatured: true },
    });

    console.log(`📊 Produits en vedette: ${featuredProducts.length}`);
    featuredProducts.forEach((product) => {
      console.log(`- ${product.name}`);
    });

    if (featuredProducts.length === 0) {
      console.log(
        "\n🔧 Aucun produit en vedette. Mise en vedette des 3 premiers produits..."
      );

      const products = await prisma.product.findMany({
        where: { isActive: true },
        take: 3,
        orderBy: { createdAt: "desc" },
      });

      if (products.length > 0) {
        await prisma.product.updateMany({
          where: {
            id: { in: products.map((p) => p.id) },
          },
          data: { isFeatured: true },
        });

        console.log(`✅ ${products.length} produits mis en vedette!`);
        products.forEach((product) => {
          console.log(`- ${product.name}`);
        });
      }
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminRole();
