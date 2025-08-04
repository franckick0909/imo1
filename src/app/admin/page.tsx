"use client";

import { useSession } from "@/lib/auth-client";
import {
  CheckCircle,
  Eye,
  Loader2,
  Package,
  Search,
  Shield,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  banUserAction,
  getAdminStatsAction,
  getUsersAction,
  setUserRoleAction,
  unbanUserAction,
} from "./actions";

// Types pour les utilisateurs admin
interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    orders: number;
  };
}

// Types pour les statistiques admin
interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  newOrdersToday: number;
  lowStockProducts: number;
}

// Types pour les filtres utilisateurs
interface UsersFilters {
  search?: string;
  role?: string;
  banned?: boolean;
}

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // États locaux pour les données
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersPagination, setUsersPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Fonction pour charger toutes les données
  const loadAll = useCallback(async () => {
    await Promise.all([loadStats(), loadUsers(1)]);
  }, []);

  // Vérifier les permissions admin et charger les données
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.role === "admin") {
        setIsAdmin(true);
        // Charger toutes les données admin
        await loadAll();
      } else {
        router.push("/dashboard");
      }
    };

    if (session) {
      checkAdminStatus();
    }
  }, [session, router, loadAll]);

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

  // Fonction pour charger les utilisateurs
  const loadUsers = async (page: number, filters: UsersFilters = {}) => {
    setIsLoadingUsers(true);
    try {
      const data = await getUsersAction(page, 10, filters);
      setUsers(data.users);
      setUsersPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Gérer la recherche
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      loadUsers(1, { search: term });
    } else {
      loadUsers(1);
    }
  };

  // Gérer le bannissement
  const handleBanUser = async (
    userId: string,
    reason: string = "Violation des règles"
  ) => {
    try {
      await banUserAction(userId, reason);
      // Recharger les utilisateurs pour mettre à jour l'affichage
      await loadUsers(1, { search: searchTerm });
      setShowUserModal(false);
    } catch (error) {
      console.error("Erreur lors du bannissement:", error);
    }
  };

  // Gérer le débannissement
  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUserAction(userId);
      // Recharger les utilisateurs pour mettre à jour l'affichage
      await loadUsers(1, { search: searchTerm });
      setShowUserModal(false);
    } catch (error) {
      console.error("Erreur lors du débannissement:", error);
    }
  };

  // Gérer le changement de rôle
  const handleSetRole = async (userId: string, role: string) => {
    try {
      await setUserRoleAction(userId, role);
      // Recharger les utilisateurs pour mettre à jour l'affichage
      await loadUsers(1, { search: searchTerm });
      setShowUserModal(false);
    } catch (error) {
      console.error("Erreur lors du changement de rôle:", error);
    }
  };

  // Gérer la pagination
  const handlePageChange = (page: number) => {
    loadUsers(page, { search: searchTerm });
  };

  if (isPending || (isLoadingStats && isLoadingUsers)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-lg font-medium">
            Chargement du panel admin...
          </span>
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
                  Administration
                </h1>
              </div>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition duration-200"
              >
                ← Retour au dashboard
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
        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Utilisateurs
                </h3>
                {isLoadingStats ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Chargement...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalUsers || 0}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Produits</h3>
                {isLoadingStats ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Chargement...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.lowStockProducts || 0}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Commandes</h3>
                {isLoadingStats ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Chargement...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalOrders || 0}
                  </p>
                )}
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
                <h3 className="text-sm font-medium text-gray-500">Revenus</h3>
                {isLoadingStats ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Chargement...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalRevenue
                      ? `${stats.totalRevenue.toFixed(2)}€`
                      : "0€"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation rapide */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Navigation rapide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/products"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors group"
            >
              <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Produits</h3>
                <p className="text-sm text-gray-500">Gérer le catalogue</p>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group"
            >
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Commandes</h3>
                <p className="text-sm text-gray-500">Suivi des ventes</p>
              </div>
            </Link>

            <Link
              href="/admin/revenue"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors group"
            >
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Revenus</h3>
                <p className="text-sm text-gray-500">Analyses financières</p>
              </div>
            </Link>

            <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="bg-gray-200 p-3 rounded-lg">
                <Users className="w-6 h-6 text-gray-500" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-700">Utilisateurs</h3>
                <p className="text-sm text-gray-500">Section actuelle</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gestion des utilisateurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gestion des utilisateurs
              </h2>
              <p className="text-gray-600">
                Gérez les utilisateurs, leurs rôles et leurs permissions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">
                Chargement des utilisateurs...
              </span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inscription
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-medium">
                                  {user.name?.charAt(0) ||
                                    user.email?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || "Nom non renseigné"}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                {user.email}
                              </div>
                              {/* Informations supplémentaires sur mobile */}
                              <div className="sm:hidden mt-1">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                                    user.role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {user.role || "user"}
                                </span>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.banned
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {user.banned ? "Banni" : "Actif"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.banned
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.banned ? "Banni" : "Actif"}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="text-emerald-600 hover:text-emerald-900 transition-colors"
                              title="Voir détails"
                              aria-label="Voir détails de l'utilisateur"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {user.banned ? (
                              <button
                                onClick={() => handleUnbanUser(user.id)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Débannir"
                                aria-label="Débannir l'utilisateur"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(user.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Bannir"
                                aria-label="Bannir l'utilisateur"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersPagination && usersPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de{" "}
                        <span className="font-medium">
                          {(usersPagination.page - 1) * usersPagination.limit +
                            1}
                        </span>{" "}
                        à{" "}
                        <span className="font-medium">
                          {Math.min(
                            usersPagination.page * usersPagination.limit,
                            usersPagination.total
                          )}
                        </span>{" "}
                        sur{" "}
                        <span className="font-medium">
                          {usersPagination.total}
                        </span>{" "}
                        résultats
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handlePageChange(usersPagination.page - 1)
                        }
                        disabled={usersPagination.page === 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(usersPagination.page + 1)
                        }
                        disabled={
                          usersPagination.page === usersPagination.totalPages
                        }
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal utilisateur */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Détails de l&apos;utilisateur
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fermer la modale"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Nom</p>
                <p className="text-sm text-gray-900">
                  {selectedUser.name || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Rôle</p>
                <p className="text-sm text-gray-900">
                  {selectedUser.role || "user"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Statut</p>
                <p className="text-sm text-gray-900">
                  {selectedUser.banned ? "Banni" : "Actif"}
                </p>
              </div>
              {selectedUser.banReason && (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Raison du ban
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedUser.banReason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-6">
              {selectedUser.banned ? (
                <button
                  onClick={() => handleUnbanUser(selectedUser.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Débannir
                </button>
              ) : (
                <button
                  onClick={() => handleBanUser(selectedUser.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Bannir
                </button>
              )}
              <button
                onClick={() =>
                  handleSetRole(
                    selectedUser.id,
                    selectedUser.role === "admin" ? "user" : "admin"
                  )
                }
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                {selectedUser.role === "admin"
                  ? "Rétrograder"
                  : "Promouvoir Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
