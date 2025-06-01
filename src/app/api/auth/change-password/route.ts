import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response("Non autorisé", { status: 401 });
    }

    // Changer le mot de passe via Better Auth
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
      headers: request.headers,
    });

    return new Response("Mot de passe modifié", { status: 200 });
  } catch (error) {
    console.error("Erreur changement mot de passe:", error);
    return new Response("Erreur de changement de mot de passe", {
      status: 400,
    });
  }
}
