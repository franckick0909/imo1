"use client";

import { useToast } from "@/components/ui/ToastContainer";
import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Heart, MapPin, Save, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
      country: "France",
    },
    preferences: {
      newsletter: true,
      promotions: true,
      skinType: "",
      concerns: [] as string[],
    },
  });

  useEffect(() => {
    if (session) {
      setProfileData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  const skinTypes = [
    { value: "dry", label: "Peau sèche" },
    { value: "oily", label: "Peau grasse" },
    { value: "combination", label: "Peau mixte" },
    { value: "sensitive", label: "Peau sensible" },
    { value: "normal", label: "Peau normale" },
  ];

  const skinConcerns = [
    "Anti-âge",
    "Hydratation",
    "Acné",
    "Taches pigmentaires",
    "Rides et ridules",
    "Pores dilatés",
    "Rougeurs",
    "Éclat du teint",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulation d'une API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      success("Profil mis à jour avec succès !");
      router.push("/dashboard/profile");
    } catch {
      error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConcernToggle = (concern: string) => {
    setProfileData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        concerns: prev.preferences.concerns.includes(concern)
          ? prev.preferences.concerns.filter((c) => c !== concern)
          : [...prev.preferences.concerns, concern],
      },
    }));
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
            <button
              type="button"
              title="Retour"
              aria-label="Retour au profil"
              onClick={() => router.push("/dashboard/profile")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Modifier mon profil
              </h1>
              <p className="text-gray-600">
                Gérez vos informations personnelles et préférences
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? "Sauvegarde..." : "Sauvegarder"}</span>
          </button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6 text-zinc-700">
        {/* Informations personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <User className="h-5 w-5 text-emerald-600 mr-2" />
            Informations personnelles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="Votre nom complet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>
        </motion.div>

        {/* Adresse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-5 w-5 text-emerald-600 mr-2" />
            Adresse de livraison
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={profileData.address.street}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="123 rue de la Paix"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={profileData.address.city}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={profileData.address.postalCode}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      address: { ...prev.address, postalCode: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                  placeholder="75001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  title="Pays"
                  aria-label="Pays de livraison"
                  value={profileData.address.country}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Préférences beauté */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Heart className="h-5 w-5 text-emerald-600 mr-2" />
            Préférences beauté
          </h2>

          <div className="space-y-6">
            {/* Type de peau */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de peau
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {skinTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      profileData.preferences.skinType === type.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="skinType"
                      value={type.value}
                      checked={profileData.preferences.skinType === type.value}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            skinType: e.target.value,
                          },
                        }))
                      }
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-center">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Préoccupations beauté */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Préoccupations beauté
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {skinConcerns.map((concern) => (
                  <label
                    key={concern}
                    className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      profileData.preferences.concerns.includes(concern)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={profileData.preferences.concerns.includes(
                        concern
                      )}
                      onChange={() => handleConcernToggle(concern)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-center">
                      {concern}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Bell className="h-5 w-5 text-emerald-600 mr-2" />
            Préférences de notification
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Newsletter</h3>
                <p className="text-sm text-gray-500">
                  Recevez nos dernières actualités et conseils beauté
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  title="Newsletter"
                  aria-label="Recevoir nos dernières actualités et conseils beauté"
                  type="checkbox"
                  checked={profileData.preferences.newsletter}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        newsletter: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Promotions</h3>
                <p className="text-sm text-gray-500">
                  Soyez informé de nos offres spéciales et réductions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  title="Promotions"
                  aria-label="Soyez informé de nos offres spéciales et réductions"
                  type="checkbox"
                  checked={profileData.preferences.promotions}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        promotions: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-end space-x-4 pt-6"
        >
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </span>
          </button>
        </motion.div>
      </form>
    </div>
  );
}
