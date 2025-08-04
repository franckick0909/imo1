"use client";

import {
  getDashboardActivityAction,
  getDashboardStatsAction,
} from "@/lib/dashboard-actions";
import {
  ArrowRight,
  DollarSign,
  Heart,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { memo, Suspense, useEffect, useState } from "react";

// Types pour le dashboard
interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  favoriteProducts: number;
  accountAge: number;
  completedOrders: number;
  pendingOrders: number;
  lastOrderDate?: string;
  avgOrderValue?: number;
  recentOrders: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  date: Date;
  icon: string;
  link: string;
}

// Composant StatCard mémorisé pour éviter les re-renders
const StatCard = memo(
  ({
    title,
    value,
    isLoading,
    icon: Icon,
    color,
    subtitle,
  }: {
    title: string;
    value: number | string;
    isLoading: boolean;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    subtitle?: string;
  }) => {
    // Utiliser des classes CSS statiques pour éviter les problèmes de purging
    const colorClasses = {
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
      red: { bg: "bg-red-100", text: "text-red-600" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
    };

    const colors =
      colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

    return (
      <div className="bg-white rounded-xl p-3 xs:p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              {title}
            </p>
            <p className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">
              {isLoading ? (
                <div className="w-10 xs:w-12 sm:w-16 h-5 xs:h-6 sm:h-8 bg-gray-200 animate-pulse rounded"></div>
              ) : typeof value === "number" ? (
                value.toLocaleString()
              ) : (
                value
              )}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
            )}
          </div>
          <div
            className={`p-1.5 xs:p-2 sm:p-3 rounded-full ${colors.bg} flex-shrink-0 ml-2`}
          >
            <Icon
              className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-6 sm:h-6 ${colors.text}`}
            />
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

// Composant QuickAction mémorisé
const QuickAction = memo(
  ({
    action,
  }: {
    action: {
      title: string;
      description: string;
      icon: React.ComponentType<{ className?: string }>;
      href: string;
      color: string;
    };
  }) => {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300">
        <Link href={action.href} className="block">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`p-2 sm:p-3 rounded-full ${action.color} flex-shrink-0`}
            >
              <action.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 text-sm sm:text-base truncate">
                {action.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                {action.description}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
          </div>
        </Link>
      </div>
    );
  }
);

QuickAction.displayName = "QuickAction";

// Composant de loading pour les stats
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="w-16 sm:w-20 h-3 sm:h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 animate-pulse rounded-full ml-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Composant pour afficher les stats
function DashboardStats({
  stats,
  isLoading,
}: {
  stats: DashboardStats;
  isLoading: boolean;
}) {
  const statItems = [
    {
      title: "Total Commandes",
      value: stats.totalOrders,
      icon: Package,
      color: "blue",
      subtitle: "Toutes vos commandes",
    },
    {
      title: "Total Dépensé",
      value: `${stats.totalSpent.toFixed(2)}€`,
      icon: DollarSign,
      color: "emerald",
      subtitle: "Commandes livrées uniquement",
    },
    {
      title: "Produits Favoris",
      value: stats.favoriteProducts,
      icon: Heart,
      color: "red",
      subtitle: "Vos produits préférés",
    },
    {
      title: "Commandes Récentes",
      value: stats.recentOrders,
      icon: TrendingUp,
      color: "purple",
      subtitle: "30 derniers jours",
    },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-6 sm:mb-8">
      {statItems.map((item) => (
        <StatCard key={item.title} {...item} isLoading={isLoading} />
      ))}
    </div>
  );
}

// Composant principal
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    favoriteProducts: 0,
    accountAge: 0,
    completedOrders: 0,
    pendingOrders: 0,
    recentOrders: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsResult, activityResult] = await Promise.all([
        getDashboardStatsAction(),
        getDashboardActivityAction(),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data as DashboardStats);
      }

      if (activityResult.success) {
        setActivities(activityResult.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage et toutes les 30 secondes
  useEffect(() => {
    loadDashboardData();

    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      title: "Mes Commandes",
      description: "Suivez vos commandes en cours",
      icon: Package,
      href: "/dashboard/orders",
      color: "bg-blue-500",
    },
    {
      title: "Mes Favoris",
      description: "Gérez vos produits favoris",
      icon: Heart,
      href: "/dashboard/favorites",
      color: "bg-red-500",
    },
    {
      title: "Mon Profil",
      description: "Modifiez vos informations",
      icon: User,
      href: "/dashboard/profile",
      color: "bg-emerald-500",
    },
    {
      title: "Continuer mes achats",
      description: "Découvrez nos nouveautés",
      icon: ShoppingBag,
      href: "/products",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Bienvenue sur votre espace personnel
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="p-2 sm:p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
              title="Rafraîchir les données"
            >
              <RefreshCw
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats stats={stats} isLoading={isLoading} />
        </Suspense>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <QuickAction key={index} action={action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Activité récente
          </h2>
          {activities && activities.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {activities.slice(0, 5).map((activity: Activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-xl sm:text-2xl flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {activity.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs sm:text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-500 mb-2 text-sm sm:text-base">
                Aucune activité récente
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Vos commandes et activités apparaîtront ici
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
