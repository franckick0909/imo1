import { auth } from "@/lib/auth";
import {
  getDashboardActivityAction,
  getDashboardStatsAction,
} from "@/lib/dashboard-actions";
import {
  ArrowRight,
  DollarSign,
  Heart,
  Package,
  ShoppingBag,
  Star,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { memo, Suspense } from "react";

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
  loyaltyPoints?: number;
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

// Composant client pour les animations
function ClientWrapper({ children }: { children: React.ReactNode }) {
  "use client";
  return <>{children}</>;
}

// Composant StatCard mémorisé pour éviter les re-renders
const StatCard = memo(
  ({
    title,
    value,
    isLoading,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number;
    isLoading: boolean;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    delay: number;
  }) => {
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
      <ClientWrapper>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {isLoading ? (
                  <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  value.toLocaleString()
                )}
              </p>
            </div>
            <div className={`p-3 rounded-full ${colors.bg}`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
          </div>
        </div>
      </ClientWrapper>
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
      <ClientWrapper>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300">
          <Link href={action.href} className="block">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${action.color}`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>
        </div>
      </ClientWrapper>
    );
  }
);

QuickAction.displayName = "QuickAction";

// Composant de loading pour les stats
function StatsLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-20 h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Composant pour afficher les stats
function DashboardStats({ stats }: { stats: DashboardStats }) {
  const statItems = [
    {
      title: "Total Commandes",
      value: stats.totalOrders,
      icon: Package,
      color: "blue",
      delay: 0,
    },
    {
      title: "Total Dépensé",
      value: stats.totalSpent,
      icon: DollarSign,
      color: "green",
      delay: 0.1,
    },
    {
      title: "Produits Favoris",
      value: stats.favoriteProducts,
      icon: Heart,
      color: "red",
      delay: 0.2,
    },
    {
      title: "Points de Fidélité",
      value: stats.loyaltyPoints || 0,
      icon: Star,
      color: "yellow",
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item) => (
        <StatCard key={item.title} {...item} isLoading={false} />
      ))}
    </div>
  );
}

// Composant principal
export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  // Charger les données en parallèle
  const [statsResult, activityResult] = await Promise.all([
    getDashboardStatsAction(),
    getDashboardActivityAction(),
  ]);

  const stats: DashboardStats = statsResult.success
    ? (statsResult.data as DashboardStats)
    : {
        totalOrders: 0,
        totalSpent: 0,
        favoriteProducts: 0,
        accountAge: 0,
        completedOrders: 0,
        pendingOrders: 0,
        loyaltyPoints: 0,
      };

  const activities = activityResult.success ? activityResult.data : [];

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
      icon: ShoppingBag,
      href: "/dashboard/profile",
      color: "bg-emerald-500",
    },
    {
      title: "Continuer mes achats",
      description: "Découvrez nos nouveautés",
      icon: Star,
      href: "/products",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ClientWrapper>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord
            </h1>
            <p className="text-gray-600 mt-2">
              Bonjour {session.user.name}, bienvenue sur votre espace personnel
            </p>
          </div>
        </ClientWrapper>

        {/* Stats Cards */}
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats stats={stats} />
        </Suspense>

        {/* Quick Actions */}
        <ClientWrapper>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <QuickAction key={index} action={action} />
              ))}
            </div>
          </div>
        </ClientWrapper>

        {/* Recent Activity */}
        <ClientWrapper>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Activité récente
            </h2>
            {activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity: Activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm"
                  >
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {activity.date.toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">Aucune activité récente</div>
              </div>
            )}
          </div>
        </ClientWrapper>
      </div>
    </div>
  );
}
