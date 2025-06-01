"use client";

import {
  changePassword,
  emailOtp,
  signOut,
  updateUser,
  useSession,
} from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
    if (session) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await updateUser({
        name: formData.name,
      });
      setMessage("Profil mis à jour avec succès !");
      setIsEditing(false);
    } catch (error) {
      setMessage("Erreur lors de la mise à jour du profil");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setMessage("Mot de passe modifié avec succès !");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage("Erreur lors du changement de mot de passe");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await emailOtp.sendVerificationOtp({
        email: session?.user.email || "",
        type: "email-verification",
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage(
        "Email de vérification envoyé ! Vérifiez votre boîte mail et la console du serveur."
      );
      setShowOtpInput(true);
    } catch (error) {
      setMessage("Erreur lors de l'envoi de l'email de vérification");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await emailOtp.verifyEmail({
        email: session?.user.email || "",
        otp: otpCode,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Email vérifié avec succès !");
      setShowOtpInput(false);
      setOtpCode("");
      window.location.reload();
    } catch (error) {
      setMessage("Code OTP invalide ou expiré");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Immo1
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition duration-200"
              >
                ← Retour au dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon profil</h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et votre sécurité
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.includes("succès")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations personnelles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Informations personnelles
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {isEditing ? "Annuler" : "Modifier"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  title="Nom complet"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <input
                  title="Adresse email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email vérifié
                </label>
                <div className="flex items-center space-x-3">
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.user.emailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {session.user.emailVerified ? "Vérifié" : "Non vérifié"}
                  </div>
                  {!session.user.emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendVerificationEmail}
                      disabled={loading}
                      className="text-indigo-600 hover:text-indigo-500 text-sm font-medium disabled:opacity-50"
                    >
                      Vérifier l&apos;email
                    </button>
                  )}
                </div>
              </div>

              {isEditing && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition duration-200"
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              )}
            </form>

            {/* Formulaire OTP séparé - en dehors du formulaire principal */}
            {showOtpInput && (
              <form
                onSubmit={handleVerifyEmail}
                className="mt-4 p-4 bg-blue-50 rounded-md"
              >
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Code de vérification (6 chiffres)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Vérifier
                  </button>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  Le code OTP s&apos;affiche dans la console du serveur (npm run
                  dev)
                </p>
              </form>
            )}
          </div>

          {/* Sécurité */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Sécurité
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading || !formData.currentPassword || !formData.newPassword
                }
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition duration-200"
              >
                {loading ? "Modification..." : "Changer le mot de passe"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Connexions récentes
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Session actuelle
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleDateString("fr-FR")} • En cours
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Actif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
