"use client";

import { useToast } from "@/components/ui/ToastContainer";
import { emailOtp } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { success, error } = useToast();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Si pas d'email dans l'URL, rediriger vers l'accueil
  if (!email) {
    router.push("/");
    return null;
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Ne permet qu'un seul caractère

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      error("Veuillez saisir le code complet à 6 chiffres");
      return;
    }

    setIsVerifying(true);

    try {
      // Vérifier l'OTP avec Better Auth
      const result = await emailOtp.verifyEmail({
        email,
        otp: otpCode,
      });

      if (result.error) {
        throw new Error(result.error.message || "Code OTP invalide");
      }

      success("Email vérifié avec succès ! Connexion en cours...");

      // Attendre un peu pour que l'utilisateur voie le message de succès
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Rediriger vers le dashboard ou la page d'accueil
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Erreur vérification OTP:", err);

      let errorMessage = "Code de vérification invalide";
      if (err instanceof Error) {
        if (err.message?.includes("expired")) {
          errorMessage = "Le code a expiré. Demandez un nouveau code.";
        } else if (err.message?.includes("invalid")) {
          errorMessage = "Code invalide. Vérifiez le code reçu par email.";
        }
      }

      error(errorMessage);

      // Réinitialiser le formulaire en cas d'erreur
      setOtp(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const result = await emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (result.error) {
        throw new Error(result.error.message || "Erreur lors du renvoi");
      }

      success("Nouveau code envoyé ! Vérifiez votre boîte email.");

      // Réinitialiser le formulaire
      setOtp(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
    } catch (err: unknown) {
      console.error("Erreur renvoi OTP:", err);
      error("Erreur lors du renvoi du code. Réessayez.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Mail className="w-8 h-8 text-emerald-600" />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vérifiez votre email
          </h1>

          <p className="text-gray-600 text-sm">
            Un code à 6 chiffres a été envoyé à
          </p>
          <p className="text-emerald-600 font-medium text-sm">{email}</p>
        </div>

        {/* Formulaire OTP */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Saisissez le code de vérification
            </label>

            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-zinc-700 placeholder:text-zinc-400"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleVerify}
            disabled={isVerifying || otp.join("").length !== 6}
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isVerifying ? (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Vérification...</span>
              </div>
            ) : (
              "Vérifier le code"
            )}
          </motion.button>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Vous n&apos;avez pas reçu le code ?
            </p>

            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {isResending ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                "Renvoyer le code"
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-700 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l&apos;accueil</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
