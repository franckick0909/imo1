"use client";

import { useToast } from "@/components/ui/ToastContainer";
import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import {
  Check,
  Chrome,
  Edit,
  Github,
  Key,
  Mail,
  Plus,
  Shield,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Vérifier si l'utilisateur a un mot de passe configuré
  const checkPasswordStatus = async () => {
    try {
      const response = await fetch("/api/auth/list-accounts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const accounts = await response.json();
        const hasCredentialAccount = accounts.some(
          (account: { providerId: string }) =>
            account.providerId === "credential"
        );
        setHasPassword(hasCredentialAccount);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du statut du mot de passe:",
        error
      );
    }
  };

  useEffect(() => {
    if (session) {
      checkPasswordStatus();
    }
  }, [session]);

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.password !== passwordData.confirmPassword) {
      error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.password.length < 8) {
      error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/add-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordData.password,
        }),
      });

      if (response.ok) {
        success(
          "Mot de passe ajouté avec succès ! Vous pouvez maintenant vous connecter avec votre email et mot de passe."
        );
        setPasswordData({ password: "", confirmPassword: "" });
        setShowPasswordForm(false);
        checkPasswordStatus();
      } else {
        const errorData = await response.json();
        error(errorData.message || "Erreur lors de l'ajout du mot de passe");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du mot de passe:", err);
      error("Erreur lors de l'ajout du mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-emerald-600">
                {session?.user?.name?.charAt(0) ||
                  session?.user?.email?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session?.user?.name || "Utilisateur"}
              </h1>
              <p className="text-gray-600">{session?.user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {session?.user?.emailVerified ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Email vérifié</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <X className="h-4 w-4" />
                    <span className="text-sm">Email non vérifié</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/profile/edit"
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Modifier</span>
          </Link>
        </div>
      </motion.div>

      {/* Informations du compte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <User className="h-5 w-5 text-emerald-600 mr-2" />
          Informations du compte
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">
                {session?.user?.name || "Non renseigné"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{session?.user?.email}</span>
              {session?.user?.emailVerified && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Méthodes de connexion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Shield className="h-5 w-5 text-emerald-600 mr-2" />
          Méthodes de connexion
        </h2>

        <div className="space-y-4">
          {/* Google */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <Chrome className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Google</p>
                <p className="text-sm text-gray-500">Connecté avec Google</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Actif
            </span>
          </div>

          {/* GitHub */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Github className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">GitHub</p>
                <p className="text-sm text-gray-500">Connecté avec GitHub</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Actif
            </span>
          </div>

          {/* Email/Mot de passe */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Email et mot de passe
                </p>
                <p className="text-sm text-gray-500">
                  {hasPassword
                    ? "Mot de passe configuré"
                    : "Aucun mot de passe configuré"}
                </p>
              </div>
            </div>

            {hasPassword ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Configuré
              </span>
            ) : (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors text-sm"
              >
                <Plus className="h-3 w-3" />
                <span>Ajouter</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Formulaire d'ajout de mot de passe */}
      {showPasswordForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="h-5 w-5 text-emerald-600 mr-2" />
            Ajouter un mot de passe
          </h3>

          <form onSubmit={handleAddPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Minimum 8 caractères"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Confirmer le mot de passe"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Ajout en cours..." : "Ajouter le mot de passe"}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Sécurité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Shield className="h-5 w-5 text-emerald-600 mr-2" />
          Sécurité
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">
                Authentification à deux facteurs
              </h3>
              <p className="text-sm text-gray-500">
                Sécurisez votre compte avec une authentification supplémentaire
              </p>
            </div>
            <button className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium">
              Configurer
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Sessions actives</h3>
              <p className="text-sm text-gray-500">
                Gérez vos sessions de connexion sur différents appareils
              </p>
            </div>
            <button className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium">
              Voir tout
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
