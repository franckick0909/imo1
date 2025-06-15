"use client";

import { motion } from "framer-motion";
import { Bell, Globe, Moon, Settings, Shield, Sun } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: true,
    },
    privacy: {
      profilePublic: false,
      dataSharing: false,
    },
    display: {
      darkMode: false,
      language: "fr",
    },
  });

  const handleToggle = (category: string, setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as Record<string, boolean>),
        [setting]: !(prev[category as keyof typeof prev] as Record<string, boolean>)[setting],
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos préférences et paramètres de compte
            </p>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Bell className="h-5 w-5 text-emerald-600 mr-2" />
          Notifications
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">
                Notifications par email
              </h3>
              <p className="text-sm text-gray-500">
                Recevez des notifications importantes par email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                title="Notifications par email"
                aria-label="Recevez des notifications importantes par email"
                type="checkbox"
                checked={settings.notifications.email}
                onChange={() => handleToggle("notifications", "email")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Notifications push</h3>
              <p className="text-sm text-gray-500">
                Recevez des notifications push sur votre navigateur
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                title="Notifications push"
                aria-label="Recevez des notifications push sur votre navigateur"
                type="checkbox"
                checked={settings.notifications.push}
                onChange={() => handleToggle("notifications", "push")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Marketing</h3>
              <p className="text-sm text-gray-500">
                Recevez des offres et promotions personnalisées
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                title="Marketing"
                aria-label="Recevez des offres et promotions personnalisées"
                type="checkbox"
                checked={settings.notifications.marketing}
                onChange={() => handleToggle("notifications", "marketing")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Confidentialité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Shield className="h-5 w-5 text-emerald-600 mr-2" />
          Confidentialité
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Profil public</h3>
              <p className="text-sm text-gray-500">
                Permettre aux autres utilisateurs de voir votre profil
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                title="Profil public"
                aria-label="Permettre aux autres utilisateurs de voir votre profil"
                type="checkbox"
                checked={settings.privacy.profilePublic}
                onChange={() => handleToggle("privacy", "profilePublic")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Partage de données</h3>
              <p className="text-sm text-gray-500">
                Partager vos données pour améliorer nos services
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                title="Partage de données"
                aria-label="Partager vos données pour améliorer nos services"
                type="checkbox"
                checked={settings.privacy.dataSharing}
                onChange={() => handleToggle("privacy", "dataSharing")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Affichage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Globe className="h-5 w-5 text-emerald-600 mr-2" />
          Affichage et langue
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              {settings.display.darkMode ? (
                <Moon className="h-5 w-5 text-gray-600" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">Mode sombre</h3>
                <p className="text-sm text-gray-500">
                  Utiliser le thème sombre pour l&apos;interface
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                title="Mode sombre"
                aria-label="Utiliser le thème sombre pour l'interface"
                type="checkbox"
                checked={settings.display.darkMode}
                onChange={() => handleToggle("display", "darkMode")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Langue</h3>
              <p className="text-sm text-gray-500">
                Choisissez votre langue préférée
              </p>
            </div>
            <select
              title="Langue"
              aria-label="Choisissez votre langue préférée"
              value={settings.display.language}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  display: { ...prev.display, language: e.target.value },
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Actions dangereuses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-red-200"
      >
        <h2 className="text-xl font-semibold text-red-900 mb-6 flex items-center">
          <Shield className="h-5 w-5 text-red-600 mr-2" />
          Zone de danger
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <h3 className="font-medium text-red-900">Supprimer le compte</h3>
              <p className="text-sm text-red-600">
                Supprimer définitivement votre compte et toutes vos données
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Supprimer
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div>
              <h3 className="font-medium text-orange-900">
                Exporter les données
              </h3>
              <p className="text-sm text-orange-600">
                Télécharger une copie de toutes vos données
              </p>
            </div>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Exporter
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
