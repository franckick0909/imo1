"use client";

import { useSession } from "@/lib/auth-client";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import {
  BarChart3,
  DollarSign,
  Loader2,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { getAdminStatsAction } from "./actions";

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Types pour les statistiques admin
interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  newUsersToday: number;
  activeUsers: number;
  newOrdersToday: number;
  lowStockProducts: number;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
  revenueByStatus: Array<{
    status: string;
    revenue: number;
    count: number;
  }>;
}

export default function AdminRevenuePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Vérifier les permissions admin et charger les statistiques
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.role === "admin") {
        setIsAdmin(true);
        // Charger les statistiques
        await loadStats();
      } else {
        router.push("/dashboard");
      }
    };

    if (session) {
      checkAdminStatus();
    }
  }, [session, router]);

  // Fonction pour charger les statistiques
  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await getAdminStatsAction();
      setStats(data);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Configuration des graphiques
  const revenueChartData = {
    labels:
      stats?.revenueByDay.map((item) =>
        new Date(item.date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        })
      ) || [],
    datasets: [
      {
        label: "Revenus (€)",
        data: stats?.revenueByDay.map((item) => item.revenue) || [],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Commandes",
        data: stats?.revenueByDay.map((item) => item.orders) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        yAxisID: "y1",
      },
    ],
  };

  const topProductsChartData = {
    labels:
      stats?.topProducts.map((item) =>
        item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name
      ) || [],
    datasets: [
      {
        label: "Revenus (€)",
        data: stats?.topProducts.map((item) => item.revenue) || [],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(14, 165, 233, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusChartData = {
    labels:
      stats?.revenueByStatus.map((item) => {
        const statusMap: { [key: string]: string } = {
          PENDING: "En attente",
          CONFIRMED: "Confirmée",
          PROCESSING: "En traitement",
          SHIPPED: "Expédiée",
          DELIVERED: "Livrée",
          CANCELLED: "Annulée",
          REFUNDED: "Remboursée",
        };
        return statusMap[item.status] || item.status;
      }) || [],
    datasets: [
      {
        data: stats?.revenueByStatus.map((item) => item.revenue) || [],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(156, 163, 175, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Revenus (€)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Nombre de commandes",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Revenus (€)",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  if (isPending || isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-lg font-medium">Chargement des revenus...</span>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-600">
            Vous n&apos;avez pas les permissions nécessaires.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center min-h-16 gap-4">
            <div className="flex items-center space-x-4 sm:space-x-8 md:space-x-10 lg:space-x-12">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-emerald-600" />
                <h1 className="heading-md font-metal font-bold text-gray-900">
                  Gestion des revenus
                </h1>
              </div>
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition duration-200"
              >
                ← Retour à l&apos;admin
              </Link>
            </div>
            <div className="flex items-center space-x-4 ml-8 ">
              <span className="text-sm text-gray-600">
                Connecté en tant que{" "}
                <strong>{session.user.name || session.user.email}</strong>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* En-tête avec filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Revenus et statistiques
              </h2>
              <p className="text-gray-600">
                Suivez vos performances financières et vos métriques clés
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Sélectionner la période"
              >
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
                <option value="365">12 derniers mois</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Revenus totaux
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalRevenue
                    ? `${stats.totalRevenue.toFixed(2)}€`
                    : "0€"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Commandes totales
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Panier moyen
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalOrders && stats?.totalRevenue
                    ? `${(stats.totalRevenue / stats.totalOrders).toFixed(2)}€`
                    : "0€"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Nouveaux clients
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.newUsersToday || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques et analyses détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Évolution des revenus */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Évolution des revenus et commandes
            </h3>
            <div className="h-80">
              {stats?.revenueByDay && stats.revenueByDay.length > 0 ? (
                <Line data={revenueChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Produits les plus vendus */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Produits les plus vendus
            </h3>
            <div className="h-80">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <Bar data={topProductsChartData} options={barChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Répartition des revenus par statut
            </h3>
            <div className="h-80">
              {stats?.revenueByStatus && stats.revenueByStatus.length > 0 ? (
                <Doughnut data={statusChartData} options={doughnutOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tableau des produits les plus vendus */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 des produits
            </h3>
            <div className="overflow-y-auto max-h-80">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {product.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {product.revenue.toFixed(2)}€
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.orders} commandes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Métriques supplémentaires */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Métriques détaillées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-2">
                {stats?.activeUsers || 0}
              </div>
              <div className="text-sm text-gray-600">Utilisateurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats?.newOrdersToday || 0}
              </div>
              <div className="text-sm text-gray-600">
                Commandes aujourd&apos;hui
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {stats?.lowStockProducts || 0}
              </div>
              <div className="text-sm text-gray-600">Produits en rupture</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
