import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response("Non autorisé", { status: 401 });
    }

    // Mettre à jour le profil via Better Auth
    await auth.api.updateUser({
      body: {
        name,
      },
      headers: request.headers,
    });

    return new Response("Profil mis à jour", { status: 200 });
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    return new Response("Erreur de mise à jour", { status: 500 });
  }
}
