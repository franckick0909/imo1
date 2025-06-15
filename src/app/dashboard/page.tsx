"use client";

import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Heart,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardHome() {
  const { data: session } = useSession();
  const [stats] = useState({
    totalOrders: 12,
    totalSpent: 245.8,
    favoriteProducts: 8,
    loyaltyPoints: 1250,
  });

  const quickActions = [
    {
      title: "Parcourir les produits",
      description: "Découvrir notre collection",
      icon: ShoppingBag,
      href: "/products",
      color: "emerald",
    },
    {
      title: "Mes commandes",
      description: "Suivre mes achats",
      icon: Package,
      href: "/dashboard/orders",
      color: "blue",
    },
    {
      title: "Mes favoris",
      description: "Produits préférés",
      icon: Heart,
      href: "/dashboard/favorites",
      color: "red",
    },
  ];

  const recentActivity = [
    {
      type: "order",
      message: "Votre commande #CMD-2024-001 a été expédiée",
      time: "Il y a 2 heures",
      icon: "🚚",
    },
    {
      type: "points",
      message: "Vous avez gagné 50 points de fidélité",
      time: "Il y a 1 jour",
      icon: "🎉",
    },
    {
      type: "recommendation",
      message: "Nouvelle crème anti-âge recommandée",
      time: "Il y a 2 jours",
      icon: "✨",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bonjour {session?.user.name || "Utilisateur"} ! 👋
            </h1>
            <p className="text-emerald-100 text-lg">
              Bienvenue dans votre espace personnel Immo1
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-24 w-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🌿</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commandes</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalOrders}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total dépensé</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalSpent}€
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Favoris</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.favoriteProducts}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Points fidélité
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.loyaltyPoints}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                title={action.title}
                aria-label={action.description}
                key={action.title}
                href={action.href}
                className="group p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`h-12 w-12 bg-${action.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${action.color}-200 transition-colors`}
                  >
                    <Icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-emerald-700">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600" />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Activité récente
          </h2>
          <Link
            href="/dashboard/activity"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Voir tout
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.message}
                </p>
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
