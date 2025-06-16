import { OtpTemplate } from "@/components/email-templates/OtpTemplate";
import { ResetPasswordTemplate } from "@/components/email-templates/ResetPasswordTemplate";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, emailOTP } from "better-auth/plugins";
import React from "react";
import { Resend } from "resend";
import prisma from "./prisma";

// Initialiser Resend
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Fonction d'envoi d'email avec le SDK Resend
async function sendEmail(
  to: string,
  subject: string,
  reactTemplate: React.ReactElement
) {
  // Vérifier si Resend est configuré
  if (!resend) {
    // Mode développement - afficher dans la console
    console.log(`\n=== EMAIL (MODE DEV) ===`);
    console.log(`À: ${to}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Template React fourni`);
    console.log(`=======================\n`);
    return;
  }

  try {
    // Envoi avec Resend SDK
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Immo1 <noreply@immo1.shop>",
      to: [to],
      subject,
      react: reactTemplate,
    });

    if (error) {
      throw new Error(`Erreur Resend: ${JSON.stringify(error)}`);
    }

    console.log(`✅ Email envoyé avec succès à ${to} (ID: ${data?.id})`);
    return data;
  } catch (error) {
    console.error("❌ Erreur envoi email:", error);
    // Fallback : afficher dans la console
    console.log(`\n=== EMAIL (FALLBACK) ===`);
    console.log(`À: ${to}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Template React fourni`);
    console.log(`========================\n`);
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false, // Désactivé car il faut vérifier l'email d'abord
    minPasswordLength: 8,
    maxPasswordLength: 20,
    sendResetPassword: async ({
      user,
      url,
      token,
    }: {
      user: { email: string; name?: string };
      url: string;
      token: string;
    }) => {
      const subject = "Réinitialisation de votre mot de passe - Immo1";
      const template = React.createElement(ResetPasswordTemplate, {
        userName: user.name || user.email,
        resetUrl: url,
        token,
      });

      await sendEmail(user.email, subject, template);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subject = "Code de vérification - Immo1";
        const template = React.createElement(OtpTemplate, {
          email,
          otp,
          type,
        });

        await sendEmail(email, subject, template);

        // Log pour debug
        console.log(`🔑 Code OTP envoyé pour ${email}: ${otp}`);
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      // Vous définir comme administrateur principal
      adminUserIds: ["uw7ZV8JeYviR6aCTy0KyDXACV2exFEnX"], // ID de franckick2@gmail.com
      impersonationSessionDuration: 60 * 60, // 1 heure
      defaultBanReason: "Violation des conditions d'utilisation",
      defaultBanExpiresIn: undefined, // Ban permanent par défaut
      bannedUserMessage:
        "Votre compte a été suspendu. Contactez le support pour plus d'informations.",
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // 1 jour
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://www.immo1.shop", // Domaine principal avec www
    "https://immo1.shop", // Domaine sans www pour compatibilité
  ],
  rateLimit: {
    window: 60, // 1 minute
    max: 100, // 100 requêtes par minute
  },
});

export type Session = typeof auth.$Infer.Session;
