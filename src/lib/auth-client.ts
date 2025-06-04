import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://www.immo1.shop" // Utiliser le domaine avec www
      : typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  onError: (error: { message?: string; code?: string }) => {
    console.error("Erreur de connexion:", error);
    return {
      message: error.message || "Une erreur est survenue lors de l'authentification",
      code: error.code,
    };
  },
  plugins: [emailOTPClient(), adminClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
  updateUser,
  changePassword,
  sendVerificationEmail,
  verifyEmail,
  emailOtp,
  admin,
} = authClient;
