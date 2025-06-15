"use client";

import { useToast } from "@/components/ui/ToastContainer";
import Input from "@/components/ui/Input";
import { signIn, signUp } from "@/lib/auth-client";
import {
  signInSchema,
  signUpSchema,
  type SignInFormData,
  type SignUpFormData,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface AuthModalsProps {
  showSignIn: boolean;
  showSignUp: boolean;
  onClose: () => void;
  onToggleMode: () => void;
}

// Courbes de Bézier personnalisées
const customEasing = [0.16, 1, 0.3, 1];
const exitEasing = [0.7, 0, 0.84, 0];

// Variants pour le backdrop
const backdropVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: "blur(0px)",
  },
  visible: {
    opacity: 1,
    backdropFilter: "blur(1px)",
    transition: {
      duration: 0.3,
      ease: customEasing,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.25,
      ease: exitEasing,
    },
  },
};

// Variants pour les éléments enfants
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: customEasing,
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: {
      duration: 0.3,
      ease: exitEasing,
    },
  },
};

// Variants pour le titre
const titleVariants = {
  hidden: {
    opacity: 0,
    x: -25,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: customEasing,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: -15,
    transition: {
      duration: 0.25,
      ease: exitEasing,
    },
  },
};

export default function AuthModals({
  showSignIn,
  showSignUp,
  onClose,
  onToggleMode,
}: AuthModalsProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { success, error } = useToast();
  const isOpen = showSignIn || showSignUp;

  // Formulaires
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const handleClose = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    // Laisser le temps à l'animation de se jouer avant de nettoyer
    setTimeout(() => {
      signInForm.reset();
      signUpForm.reset();
      onClose();
      setIsTransitioning(false);
    }, 100); // Petit délai pour laisser l'animation commencer
  }, [signInForm, signUpForm, onClose, isTransitioning]);

  // Gestion clavier et scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isTransitioning) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose, isTransitioning]);

  const handleSignIn = async (data: SignInFormData) => {
    try {
      await signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onRequest: () => {
            // Cette fonction est appelée quand la requête commence
            signInForm.clearErrors();
          },
          onResponse: (ctx) => {
            // Cette fonction est appelée quand la réponse arrive
            if (ctx.response.ok) {
              success("Connexion réussie ! Bienvenue !", { persistent: true });
              // Fermeture immédiate pour laisser la redirection se faire
              handleClose();
            }
          },
          onError: (ctx) => {
            // Gestion robuste des erreurs - privilégier le statut HTTP
            let errorMessage = "Une erreur est survenue lors de la connexion";

            // D'abord vérifier le statut de la réponse (plus fiable)
            if (ctx.response) {
              switch (ctx.response.status) {
                case 401:
                  errorMessage = "Email ou mot de passe incorrect";
                  break;
                case 404:
                  errorMessage = "Aucun compte trouvé avec cet email";
                  break;
                case 429:
                  errorMessage =
                    "Trop de tentatives. Veuillez réessayer plus tard";
                  break;
                case 400:
                  errorMessage = "Données invalides. Vérifiez vos informations";
                  break;
                case 500:
                  errorMessage = "Erreur serveur. Veuillez réessayer";
                  break;
                default:
                  errorMessage = `Erreur ${ctx.response.status}: ${ctx.response.statusText || "Erreur inconnue"}`;
              }
            }

            // Ensuite vérifier différents formats d'erreur possible (si disponible)
            if (
              ctx.error &&
              typeof ctx.error === "object" &&
              Object.keys(ctx.error).length > 0
            ) {
              if (typeof ctx.error === "string") {
                errorMessage = ctx.error;
              } else if (ctx.error.message) {
                errorMessage = ctx.error.message;
              } else if (ctx.error.error) {
                errorMessage = ctx.error.error;
              }

              // Messages personnalisés basés sur le contenu
              if (errorMessage.includes("User not found")) {
                errorMessage = "Aucun compte trouvé avec cet email";
              } else if (errorMessage.includes("Invalid password")) {
                errorMessage = "Mot de passe incorrect";
              } else if (errorMessage.includes("Invalid")) {
                errorMessage = "Email ou mot de passe incorrect";
              }
            }

            // Log informatif sans console.error qui génère l'erreur
            console.log(
              `🔴 Erreur de connexion (${ctx.response?.status}): "${errorMessage}"`
            );

            error(errorMessage);

            signInForm.setError("root", {
              message: errorMessage,
            });
          },
        }
      );
    } catch (err) {
      console.error("Erreur inattendue:", err);
      error("Une erreur inattendue est survenue");
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      await signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
        },
        {
          onRequest: () => {
            signUpForm.clearErrors();
          },
          onResponse: (ctx) => {
            if (ctx.response.ok) {
              success("Compte créé avec succès ! Bienvenue !", {
                persistent: true,
              });
              // Fermeture immédiate pour laisser la redirection se faire
              handleClose();
            }
          },
          onError: (ctx) => {
            // Gestion robuste des erreurs - privilégier le statut HTTP
            let errorMessage = "Une erreur est survenue lors de l'inscription";

            // D'abord vérifier le statut de la réponse (plus fiable)
            if (ctx.response) {
              switch (ctx.response.status) {
                case 409:
                  errorMessage = "Un compte existe déjà avec cet email";
                  break;
                case 400:
                  errorMessage = "Données invalides. Vérifiez vos informations";
                  break;
                case 422:
                  errorMessage =
                    "Le mot de passe ne respecte pas les critères requis";
                  break;
                case 429:
                  errorMessage =
                    "Trop de tentatives. Veuillez réessayer plus tard";
                  break;
                case 500:
                  errorMessage = "Erreur serveur. Veuillez réessayer";
                  break;
                default:
                  errorMessage = `Erreur ${ctx.response.status}: ${ctx.response.statusText || "Erreur inconnue"}`;
              }
            }

            // Ensuite vérifier différents formats d'erreur possible (si disponible)
            if (
              ctx.error &&
              typeof ctx.error === "object" &&
              Object.keys(ctx.error).length > 0
            ) {
              if (typeof ctx.error === "string") {
                errorMessage = ctx.error;
              } else if (ctx.error.message) {
                errorMessage = ctx.error.message;
              } else if (ctx.error.error) {
                errorMessage = ctx.error.error;
              }

              // Messages personnalisés
              if (errorMessage.includes("already exists")) {
                errorMessage = "Un compte existe déjà avec cet email";
              } else if (errorMessage.includes("weak")) {
                errorMessage = "Le mot de passe est trop faible";
              }
            }

            // Log informatif sans console.error qui génère l'erreur
            console.log(
              `🔴 Erreur d'inscription (${ctx.response?.status}): "${errorMessage}"`
            );

            error(errorMessage);

            signUpForm.setError("root", {
              message: errorMessage,
            });
          },
        }
      );
    } catch (err) {
      console.error("Erreur inattendue:", err);
      error("Une erreur inattendue est survenue");
    }
  };

  // Basculement avec délai
  const handleToggleMode = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    signInForm.reset();
    signUpForm.reset();

    setTimeout(() => {
      onToggleMode();
      setIsTransitioning(false);
    }, 150);
  }, [signInForm, signUpForm, onToggleMode, isTransitioning]);

  // Composants réutilisables
  const ModalHeader = ({ title }: { title: string }) => (
    <motion.div
      className="flex justify-between items-center p-6"
      variants={itemVariants}
    >
      <motion.h2
        className="text-xl font-semibold text-gray-900"
        variants={titleVariants}
      >
        {title}
      </motion.h2>
      <motion.button
        type="button"
        onClick={handleClose}
        disabled={isTransitioning}
        className="text-gray-500 hover:text-gray-700 transition-all duration-200 rounded-full p-2 hover:bg-gray-100"
        whileHover={{
          rotate: 90,
          scale: 1.1,
          transition: { duration: 0.2, ease: customEasing },
        }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </motion.button>
    </motion.div>
  );

  const ModalFooter = ({ isSignUp }: { isSignUp: boolean }) => (
    <motion.div variants={itemVariants} className="mt-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      <motion.p className="text-sm text-gray-600 mt-4">
        {isSignUp ? "Déjà un compte ? " : "Pas encore de compte ? "}
        <motion.button
          type="button"
          onClick={handleToggleMode}
          disabled={isTransitioning}
          className="text-indigo-600 hover:text-indigo-500 font-medium focus:outline-none px-1 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSignUp ? "Se connecter" : "S'inscrire"}
        </motion.button>
      </motion.p>
    </motion.div>
  );

  const LoadingSpinner = () => (
    <motion.svg
      className="h-5 w-5 text-white mr-3"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );

  // Fonction pour gérer la connexion sociale
  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (err) {
      console.error("Erreur OAuth:", err);
      error("Erreur lors de la connexion avec " + provider);
    }
  };

  // Composant pour les boutons sociaux
  const SocialButtons = () => (
    <motion.div variants={itemVariants} className="space-y-3">
      {/* Séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
        </div>
      </div>

      {/* Boutons providers */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google */}
        <motion.button
          type="button"
          onClick={() => handleSocialSignIn("google")}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </motion.button>

        {/* GitHub */}
        <motion.button
          type="button"
          onClick={() => handleSocialSignIn("github")}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5 mr-2" fill="#181717" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Modale de Connexion */}
      <AnimatePresence>
        {showSignIn && (
          <motion.div
            key="signin-modal"
            className="fixed inset-0 z-50 p-4 bg-black/30"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={!isTransitioning ? handleClose : undefined}
          >
            <div className="flex items-center justify-center min-h-screen">
              <motion.div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full relative my-6"
                //        variants={modalVariants}
                initial={{ opacity: 0, y: 200 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 200 }}
                transition={{
                  duration: 0.8,
                  ease: customEasing,
                  staggerChildren: 0.09,
                  delayChildren: 0.2,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader title="Se connecter" />

                <motion.div className="p-6" variants={itemVariants}>
                  <form
                    onSubmit={signInForm.handleSubmit(handleSignIn)}
                    className="space-y-2"
                  >
                    {/* Email */}
                    <motion.div variants={itemVariants}>
                      <Input
                        type="email"
                        label="Adresse email"
                        {...signInForm.register("email")}
                        error={signInForm.formState.errors.email?.message}
                      />
                    </motion.div>

                    {/* Mot de passe */}
                    <motion.div variants={itemVariants}>
                      <Input
                        type="password"
                        label="Mot de passe"
                        {...signInForm.register("password")}
                        error={signInForm.formState.errors.password?.message}
                      />
                    </motion.div>

                    {/* Erreur générale */}
                    <AnimatePresence>
                      {signInForm.formState.errors.root && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.3, ease: customEasing }}
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                        >
                          <p className="text-sm text-red-600">
                            {signInForm.formState.errors.root.message}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bouton submit */}
                    <motion.div variants={itemVariants}>
                      <motion.button
                        type="submit"
                        disabled={
                          signInForm.formState.isSubmitting || isTransitioning
                        }
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200"
                      >
                        <AnimatePresence mode="wait">
                          {signInForm.formState.isSubmitting ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center"
                            >
                              <LoadingSpinner />
                              Connexion...
                            </motion.div>
                          ) : (
                            <motion.span
                              key="signin-text"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              Me connecter
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </motion.div>
                  </form>

                  {/* Boutons de connexion sociale */}
                  <div className="mt-6">
                    <SocialButtons />
                  </div>

                  {/* Lien mot de passe oublié */}
                  <motion.div
                    variants={itemVariants}
                    className="mt-4 text-center"
                  >
                    <Link
                      href="/forgot-password"
                      className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                      onClick={handleClose}
                    >
                      Mot de passe oublié ?
                    </Link>
                  </motion.div>

                  <ModalFooter isSignUp={false} />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale d'Inscription */}
      <AnimatePresence>
        {showSignUp && (
          <motion.div
            key="signup-modal"
            className="fixed inset-0 z-50 p-4 bg-black/30"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={!isTransitioning ? handleClose : undefined}
          >
            <div className="flex items-center justify-center min-h-screen">
              <motion.div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full relative my-8"
                initial={{ opacity: 0, y: 200 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 200 }}
                transition={{
                  duration: 0.8,
                  ease: customEasing,
                  staggerChildren: 0.09,
                  delayChildren: 0.2,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader title="Créer un compte" />

                <motion.div className="p-6" variants={itemVariants}>
                  <form
                    onSubmit={signUpForm.handleSubmit(handleSignUp)}
                    className="space-y-2"
                  >
                    {/* Nom */}
                    <motion.div variants={itemVariants}>
                      <Input
                        type="text"
                        label="Nom complet"
                        {...signUpForm.register("name")}
                        error={signUpForm.formState.errors.name?.message}
                      />
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants}>
                      <Input
                        type="email"
                        label="Adresse email"
                        {...signUpForm.register("email")}
                        error={signUpForm.formState.errors.email?.message}
                      />
                    </motion.div>

                    {/* Mot de passe */}
                    <motion.div variants={itemVariants}>
                      <Input
                        type="password"
                        label="Mot de passe"
                        {...signUpForm.register("password")}
                        error={signUpForm.formState.errors.password?.message}
                      />
                    </motion.div>

                    {/* Confirmation mot de passe */}
                    <motion.div variants={itemVariants}>
                      <Input
                        type="password"
                        label="Confirmer le mot de passe"
                        {...signUpForm.register("confirmPassword")}
                        error={
                          signUpForm.formState.errors.confirmPassword?.message
                        }
                      />
                    </motion.div>

                    {/* Erreur générale */}
                    <AnimatePresence>
                      {signUpForm.formState.errors.root && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.3, ease: customEasing }}
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                        >
                          <p className="text-sm text-red-600">
                            {signUpForm.formState.errors.root.message}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bouton submit */}
                    <motion.div variants={itemVariants}>
                      <motion.button
                        type="submit"
                        disabled={
                          signUpForm.formState.isSubmitting || isTransitioning
                        }
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200"
                      >
                        <AnimatePresence mode="wait">
                          {signUpForm.formState.isSubmitting ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center"
                            >
                              <LoadingSpinner />
                              Création...
                            </motion.div>
                          ) : (
                            <motion.span
                              key="signup-text"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              Créer mon compte
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </motion.div>
                  </form>

                  {/* Boutons de connexion sociale */}
                  <div className="mt-6">
                    <SocialButtons />
                  </div>

                  <ModalFooter isSignUp={true} />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
