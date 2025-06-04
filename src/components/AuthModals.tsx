"use client";

import { useToast } from "@/components/ui/ToastContainer";
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
    backdropFilter: "blur(2px)",
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
      className="flex justify-between items-center p-6 border-b border-gray-200"
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
            strokeWidth={2}
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

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <motion.p
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={{ opacity: 1, height: "auto", y: 0 }}
        exit={{ opacity: 0, height: 0, y: -10 }}
        transition={{ duration: 0.3, ease: customEasing }}
        className="text-sm text-red-600 mt-2"
      >
        {message}
      </motion.p>
    );
  };

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

  return (
    <>
      {/* Modale de Connexion */}
      <AnimatePresence>
        {showSignIn && (
          <motion.div
            key="signin-modal"
            className="fixed inset-0 z-50 p-4 bg-black/50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={!isTransitioning ? handleClose : undefined}
          >
            <div className="flex items-center justify-center min-h-full">
              <motion.div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full relative"
                //        variants={modalVariants}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: "0%" }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ duration: 0.8, ease: customEasing, staggerChildren: 0.09, delayChildren: 0.2 }}
                onClick={(e) => e.stopPropagation()}  
              >
                <ModalHeader title="Se connecter" />

                <motion.div className="p-6" variants={itemVariants}>
                  <form
                    onSubmit={signInForm.handleSubmit(handleSignIn)}
                    className="space-y-4"
                  >
                    {/* Email */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="signin-email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Adresse email
                      </label>
                      <motion.input
                        type="email"
                        id="signin-email"
                        {...signInForm.register("email")}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 transition-all duration-200 ${
                          signInForm.formState.errors.email
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-300 focus:border-indigo-500"
                        }`}
                        placeholder="votre@email.com"
                      />
                      <ErrorMessage
                        message={signInForm.formState.errors.email?.message}
                      />
                    </motion.div>

                    {/* Mot de passe */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="signin-password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Mot de passe
                      </label>
                      <motion.input
                        type="password"
                        id="signin-password"
                        {...signInForm.register("password")}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 transition-all duration-200 ${
                          signInForm.formState.errors.password
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-300 focus:border-indigo-500"
                        }`}
                        placeholder="••••••••"
                      />
                      <ErrorMessage
                        message={signInForm.formState.errors.password?.message}
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
            className="fixed inset-0 z-50 p-4 bg-black/50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={!isTransitioning ? handleClose : undefined}
          >
            <div className="flex items-center justify-center min-h-full">
              <motion.div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full relative"
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: "0%" }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ duration: 0.8, ease: customEasing, staggerChildren: 0.09, delayChildren: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader title="Créer un compte" />

                <motion.div className="p-6" variants={itemVariants}>
                  <form
                    onSubmit={signUpForm.handleSubmit(handleSignUp)}
                    className="space-y-4"
                  >
                    {/* Nom */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="signup-name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Nom complet
                      </label>
                      <motion.input
                        type="text"
                        id="signup-name"
                        {...signUpForm.register("name")}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 transition-all duration-200 ${
                          signUpForm.formState.errors.name
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-300 focus:border-indigo-500"
                        }`}
                        placeholder="Votre nom complet"
                      />
                      <ErrorMessage
                        message={signUpForm.formState.errors.name?.message}
                      />
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="signup-email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Adresse email
                      </label>
                      <motion.input
                        type="email"
                        id="signup-email"
                        {...signUpForm.register("email")}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 transition-all duration-200 ${
                          signUpForm.formState.errors.email
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-300 focus:border-indigo-500"
                        }`}
                        placeholder="votre@email.com"
                      />
                      <ErrorMessage
                        message={signUpForm.formState.errors.email?.message}
                      />
                    </motion.div>

                    {/* Mot de passe */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="signup-password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Mot de passe
                      </label>
                      <motion.input
                        type="password"
                        id="signup-password"
                        {...signUpForm.register("password")}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 transition-all duration-200 ${
                          signUpForm.formState.errors.password
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-300 focus:border-indigo-500"
                        }`}
                        placeholder="••••••••"
                      />
                      <ErrorMessage
                        message={signUpForm.formState.errors.password?.message}
                      />
                    </motion.div>

                    {/* Confirmation mot de passe */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="signup-confirm-password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Confirmer le mot de passe
                      </label>
                      <motion.input
                        type="password"
                        id="signup-confirm-password"
                        {...signUpForm.register("confirmPassword")}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 transition-all duration-200 ${
                          signUpForm.formState.errors.confirmPassword
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-300 focus:border-indigo-500"
                        }`}
                        placeholder="••••••••"
                      />
                      <ErrorMessage
                        message={
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
