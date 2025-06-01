import { OtpTemplate } from "@/components/email-templates/OtpTemplate";
import React from "react";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function GET() {
  try {
    if (!resend) {
      return Response.json(
        {
          error: "RESEND_API_KEY non configuré",
          env_vars: {
            RESEND_API_KEY: process.env.RESEND_API_KEY
              ? "✅ Défini"
              : "❌ Manquant",
            FROM_EMAIL: process.env.FROM_EMAIL || "❌ Manquant",
          },
          help: "Ajoutez RESEND_API_KEY dans votre fichier .env.local",
        },
        { status: 400 }
      );
    }

    const testTemplate = React.createElement(OtpTemplate, {
      email: "test@example.com",
      otp: "123456",
      type: "test",
    });

    // Utiliser le domaine configuré ou celui de développement
    const fromEmail = process.env.FROM_EMAIL || "Immo1 <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: ["franckick2@gmail.com"], // Remplacez par votre email
      subject: "Test Resend - Immo1",
      react: testTemplate,
    });

    if (error) {
      return Response.json(
        {
          error: "Erreur Resend",
          details: error,
          config: {
            from: fromEmail,
            api_key_prefix:
              process.env.RESEND_API_KEY?.substring(0, 10) + "...",
            domain_status: fromEmail.includes("immo1.shop")
              ? "Domaine personnalisé"
              : "Domaine de développement",
          },
          help: fromEmail.includes("onboarding")
            ? "Utilisez FROM_EMAIL='Immo1 <noreply@immo1.shop>' pour votre domaine personnalisé"
            : "Vérifiez que votre domaine est validé sur Resend",
        },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      data,
      message: "Email de test envoyé avec succès !",
      config: {
        from: fromEmail,
        domain: fromEmail.includes("immo1.shop")
          ? "✅ Domaine personnalisé"
          : "🔧 Domaine de développement",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
