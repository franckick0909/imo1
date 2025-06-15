import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Utiliser Better Auth pour renvoyer l'OTP
    const result = await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "email-verification",
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du code OTP" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Code OTP envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi OTP:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi du code OTP" },
      { status: 500 }
    );
  }
}
