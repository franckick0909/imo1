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

interface Account {
  id: string;
  providerId: string;
  accountId: string;
}

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Charger les comptes et sessions
  const loadAccountsAndSessions = async () => {
    try {
      // Charger les comptes
      const accountsResponse = await fetch("/api/auth/list-accounts");
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setAccounts(accountsData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des comptes:", error);
    }
  };

  const loadSessions = async () => {
    if (!showSessions) return;

    setLoadingSessions(true);
    try {
      const response = await fetch("/api/auth/list-sessions");
      if (response.ok) {
        const sessionsData = await response.json();
        setSessions(sessionsData);
      } else {
        error("Erreur lors du chargement des sessions");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des sessions:", err);
      error("Erreur lors du chargement des sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadAccountsAndSessions();
    }
  }, [session]);

  useEffect(() => {
    loadSessions();
  }, [showSessions]);

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
        loadAccountsAndSessions();
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

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch("/api/auth/revoke-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        success("Session révoquée avec succès");
        loadSessions();
      } else {
        const errorData = await response.json();
        error(
          errorData.message || "Erreur lors de la révocation de la session"
        );
      }
    } catch (err) {
      console.error("Erreur lors de la révocation de la session:", err);
      error("Erreur lors de la révocation de la session");
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
            className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            {showSessions ? "Masquer" : "Voir tout"}
          </button>
        </div>

        {showSessions && (
          <div className="space-y-4">
            {loadingSessions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : sessions.length > 0 ? (
              sessions.map((sessionItem) => {
                const userAgent = parseUserAgent(sessionItem.userAgent);
                const DeviceIcon =
                  userAgent.device === "Mobile" ? Smartphone : Monitor;

                return (
                  <div
                    key={sessionItem.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      sessionItem.isCurrent
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          sessionItem.isCurrent
                            ? "bg-emerald-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <DeviceIcon
                          className={`w-5 h-5 ${
                            sessionItem.isCurrent
                              ? "text-emerald-600"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {userAgent.browser} sur {userAgent.os}
                          </p>
                          {sessionItem.isCurrent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Session actuelle
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {sessionItem.ipAddress &&
                            `IP: ${sessionItem.ipAddress} • `}
                          Connecté le {formatDate(sessionItem.createdAt)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Expire le {formatDate(sessionItem.expiresAt)}
                        </p>
                      </div>
                    </div>

                    {!sessionItem.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(sessionItem.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Révoquer cette session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">
                Aucune session active trouvée
              </p>
            )}
          </div>
        )}

        {!showSessions && (
          <p className="text-gray-500">
            Gérez vos sessions de connexion sur différents appareils
          </p>
        )}
      </motion.div>
    </div>
  );
}
