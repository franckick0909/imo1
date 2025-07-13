"use client";

import { useSession } from "@/lib/auth-client";
import { useRecentActivity, useStats } from "@/stores/dashboard-store";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Heart,
  Loader2,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { memo, useEffect, useMemo } from "react";

// Types
interface StatCardProps {
  title: string;
  value: number;
  isLoading: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  delay: number;
}

interface QuickActionProps {
  action: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
  };
}

// Composant StatCard mémorisé pour éviter les re-renders
const StatCard = memo(
  ({ title, value, isLoading, icon: Icon, color, delay }: StatCardProps) => {
    // Utiliser des classes CSS statiques pour éviter les problèmes de purging
    const colorClasses = {
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
      red: { bg: "bg-red-100", text: "text-red-600" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    };

    const colors =
      colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {isLoading ? (
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-400">Chargement...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            )}
          </div>
          <div
            className={`h-12 w-12 ${colors.bg} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
        </div>
      </motion.div>
    );
  }
);

StatCard.displayName = "StatCard";

// Composant QuickAction mémorisé
const QuickAction = memo(({ action }: QuickActionProps) => {
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
        <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
          <Icon className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-800">
            {action.title}
          </p>
          <p className="text-sm text-gray-500 group-hover:text-emerald-600">
            {action.description}
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
      </div>
    </Link>
  );
});

QuickAction.displayName = "QuickAction";

export default function DashboardHome() {
  const { data: session } = useSession();
  const { stats, isLoadingStats, loadStats } = useStats();
  const { recentActivity, isLoadingActivity, loadRecentActivity } =
    useRecentActivity();

  // Charger les données progressivement
  useEffect(() => {
    // Charger d'abord les statistiques (plus importantes)
    loadStats();

    // Charger l'activité récente avec un délai
    const timer = setTimeout(() => {
      loadRecentActivity();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadStats, loadRecentActivity]);

  const quickActions = useMemo(
    () => [
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
    ],
    []
  );

  // Mémoriser les statistiques pour éviter les re-calculs
  const statsData = useMemo(
    () => [
      {
        title: "Commandes",
        value: stats?.totalOrders || 0,
        icon: Package,
        color: "blue",
        delay: 0.1,
      },
      {
        title: "Total dépensé",
        value: stats?.totalSpent || 0,
        icon: TrendingUp,
        color: "emerald",
        delay: 0.2,
        suffix: "€",
      },
      {
        title: "Favoris",
        value: stats?.favoriteProducts || 0,
        icon: Heart,
        color: "red",
        delay: 0.3,
      },
      {
        title: "Points fidélité",
        value: stats?.loyaltyPoints || 0,
        icon: Star,
        color: "yellow",
        delay: 0.4,
      },
    ],
    [stats]
  );

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
        {statsData.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            isLoading={isLoadingStats}
            icon={stat.icon}
            color={stat.color}
            delay={stat.delay}
          />
        ))}
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
          {quickActions.map((action) => (
            <QuickAction key={action.title} action={action} />
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Activité récente
        </h2>
        {isLoadingActivity ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">
              Chargement de l&apos;activité...
            </span>
          </div>
        ) : recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-lg">{activity.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                </div>
                {activity.link && (
                  <Link
                    href={activity.link}
                    className="text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune activité récente</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
