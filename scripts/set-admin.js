const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function setUserAsAdmin() {
  try {
    // Remplacez par votre email
    const adminEmail = "franckick2@gmail.com";

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!user) {
      console.log(`❌ Utilisateur avec l'email ${adminEmail} non trouvé`);
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})`);

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        role: "admin",
      },
    });

    console.log(
      `🎉 Utilisateur ${updatedUser.email} est maintenant administrateur !`
    );
    console.log(`📝 Nouvel ID admin à ajouter dans auth.ts: "${user.id}"`);
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setUserAsAdmin();
