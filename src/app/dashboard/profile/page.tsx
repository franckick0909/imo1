"use client";

import { useToast } from "@/components/ui/ToastContainer";
import { useSession } from "@/lib/auth-client";
import {
  useDashboardStore,
  useProfile,
  useUserAccounts,
  useUserSessions,
} from "@/stores/dashboard-store";
import { motion } from "framer-motion";
import {
  Check,
  Chrome,
  Edit,
  Github,
  Key,
  Loader2,
  Mail,
  Monitor,
  Plus,
  Shield,
  Smartphone,
  Trash2,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Utiliser les stores Zustand
  const { profile, isLoadingProfile, loadProfile } = useProfile();
  const {
    sessions,
    isLoadingSessions,
    loadSessions,
    revokeSession,
    revokeAllSessions,
  } = useUserSessions();
  const { accounts, isLoadingAccounts, loadAccounts } = useUserAccounts();
  const { addPassword } = useDashboardStore();

  // Charger les données au montage
  useEffect(() => {
    if (session) {
      loadProfile();
      loadAccounts();
    }
  }, [session, loadProfile, loadAccounts]);

  // Charger les sessions si l'onglet est ouvert
  useEffect(() => {
    if (showSessions) {
      loadSessions();
    }
  }, [showSessions, loadSessions]);

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
      await addPassword(passwordData.password);
      success(
        "Mot de passe ajouté avec succès ! Vous pouvez maintenant vous connecter avec votre email et mot de passe."
      );
      setPasswordData({ password: "", confirmPassword: "" });
      setShowPasswordForm(false);
      // Recharger les comptes pour voir le nouveau compte credential
      loadAccounts();
    } catch (err) {
      console.error("Erreur lors de l'ajout du mot de passe:", err);
      error("Erreur lors de l'ajout du mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      success("Session révoquée avec succès");
    } catch (err) {
      console.error("Erreur lors de la révocation de la session:", err);
      error("Erreur lors de la révocation de la session");
    }
  };

  const handleRevokeAllSessions = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir révoquer toutes les autres sessions ?"
      )
    ) {
      try {
        await revokeAllSessions();
        success("Toutes les sessions ont été révoquées");
      } catch (err) {
        console.error("Erreur lors de la révocation des sessions:", err);
        error("Erreur lors de la révocation des sessions");
      }
    }
  };

  // Fonction pour parser le User-Agent
  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return { device: "Appareil inconnu", browser: "", os: "" };

    // Simple parsing - on pourrait utiliser une lib plus sophistiquée
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent);
    const isFirefox = /Firefox/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !isChrome;
    const isEdge = /Edge/i.test(userAgent);

    let browser = "Navigateur inconnu";
    if (isChrome) browser = "Chrome";
    else if (isFirefox) browser = "Firefox";
    else if (isSafari) browser = "Safari";
    else if (isEdge) browser = "Edge";

    return {
      device: isMobile ? "Mobile" : "Ordinateur",
      browser,
      os: userAgent.includes("Windows")
        ? "Windows"
        : userAgent.includes("Mac")
          ? "macOS"
          : userAgent.includes("Linux")
            ? "Linux"
            : "Système inconnu",
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Vérifier les méthodes de connexion disponibles
  const hasGoogle = accounts.some((account) => account.providerId === "google");
  const hasGithub = accounts.some((account) => account.providerId === "github");
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential"
  );

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
              {profile?.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name || "Profil"}
                  className="h-full w-full rounded-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <span className="text-2xl font-bold text-emerald-600">
                  {profile?.name?.charAt(0) ||
                    session?.user?.name?.charAt(0) ||
                    session?.user?.email?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.name || session?.user?.name || "Utilisateur"}
              </h1>
              <p className="text-gray-600">
                {profile?.email || session?.user?.email}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {profile?.emailVerified || session?.user?.emailVerified ? (
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

        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Chargement du profil...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">
                  {profile?.name || session?.user?.name || "Non renseigné"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">
                  {profile?.email || session?.user?.email}
                </span>
                {(profile?.emailVerified || session?.user?.emailVerified) && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>

            {profile?.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{profile.phone}</span>
                </div>
              </div>
            )}
          </div>
        )}
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

        {isLoadingAccounts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">
              Chargement des comptes...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Chrome className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Google</p>
                  <p className="text-sm text-gray-500">
                    {hasGoogle ? "Connecté avec Google" : "Non configuré"}
                  </p>
                </div>
              </div>
              {hasGoogle ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Actif
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Non configuré
                </span>
              )}
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Github className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">GitHub</p>
                  <p className="text-sm text-gray-500">
                    {hasGithub ? "Connecté avec GitHub" : "Non configuré"}
                  </p>
                </div>
              </div>
              {hasGithub ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Actif
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Non configuré
                </span>
              )}
            </div>

            {/* Mot de passe */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mot de passe</p>
                  <p className="text-sm text-gray-500">
                    {hasPassword ? "Configuré" : "Non configuré"}
                  </p>
                </div>
              </div>
              {hasPassword ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Actif
                </span>
              ) : (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Formulaire d'ajout de mot de passe */}
        {showPasswordForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-gray-50 rounded-lg"
          >
            <h3 className="font-medium text-gray-900 mb-4">
              Ajouter un mot de passe
            </h3>
            <form onSubmit={handleAddPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Au moins 8 caractères"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Répétez le mot de passe"
                  required
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? "Ajout..." : "Ajouter"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ password: "", confirmPassword: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>

      {/* Sessions actives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Monitor className="h-5 w-5 text-emerald-600 mr-2" />
            Sessions actives
          </h2>
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            {showSessions ? "Masquer" : "Afficher"}
          </button>
        </div>

        {showSessions && (
          <>
            {isLoadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">
                  Chargement des sessions...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((sessionItem) => {
                  const deviceInfo = parseUserAgent(sessionItem.userAgent);
                  return (
                    <div
                      key={sessionItem.id}
                      className={`p-4 border rounded-lg ${
                        sessionItem.isCurrent
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {deviceInfo.device === "Mobile" ? (
                              <Smartphone className="h-5 w-5 text-gray-600" />
                            ) : (
                              <Monitor className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {deviceInfo.browser} sur {deviceInfo.os}
                              {sessionItem.isCurrent && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                                  Session actuelle
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              IP: {sessionItem.ipAddress || "Non disponible"} •{" "}
                              Connecté le {formatDate(sessionItem.createdAt)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expire le {formatDate(sessionItem.expiresAt)}
                            </p>
                          </div>
                        </div>
                        {!sessionItem.isCurrent && (
                          <button
                            onClick={() => handleRevokeSession(sessionItem.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Révoquer cette session"
                            aria-label="Révoquer cette session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {sessions.length > 1 && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleRevokeAllSessions}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Révoquer toutes les autres sessions</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
