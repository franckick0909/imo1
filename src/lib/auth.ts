import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Désactivé pour simplifier au début
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // 1 jour
  },
  trustedOrigins: [
    "https://immo1.shop",
    "https://www.immo1.shop",
    "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
