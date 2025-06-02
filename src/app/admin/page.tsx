"use client";

import { admin, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  createdAt: Date;
}

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const usersPerPage = 10;

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Stabiliser loadUsers avec useCallback
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await admin.listUsers({
        query: {
          limit: usersPerPage,
          offset: (currentPage - 1) * usersPerPage,
          ...(searchTerm && {
            searchField: "email",
            searchOperator: "contains",
            searchValue: searchTerm,
          }),
        },
      });

      if (!response.error) {
        setUsers(response.data.users);
        setTotalUsers(response.data.total);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, usersPerPage]);

  // Vérifier les permissions admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session) {
        try {
          const response = await admin.hasPermission({
            permissions: {
              user: ["list"],
            },
          });
          if (!response.error) {
            setIsAdmin(true);
            await loadUsers();
          } else {
            router.push("/dashboard");
          }
        } catch {
          router.push("/dashboard");
        }
      }
    };

    checkAdminStatus();
  }, [session, router, loadUsers]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, loadUsers]);

  const handleBanUser = async (
    userId: string,
    reason: string = "Violation des règles"
  ) => {
    try {
      const response = await admin.banUser({
        userId,
        banReason: reason,
      });

      if (!response.error) {
        await loadUsers();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error("Erreur lors du bannissement:", error);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await admin.unbanUser({
        userId,
      });

      if (!response.error) {
        await loadUsers();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error("Erreur lors du débannissement:", error);
    }
  };

  const handleSetRole = async (userId: string, role: "user" | "admin") => {
    try {
      const response = await admin.setRole({
        userId,
        role,
      });

      if (!response.error) {
        await loadUsers();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error("Erreur lors du changement de rôle:", error);
    }
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                🔧 Administration
              </h1>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition duration-200"
              >
                ← Retour au dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des utilisateurs
          </h2>
          <p className="text-gray-600">
            Gérez les utilisateurs, leurs rôles et leurs permissions
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Total utilisateurs
                </h3>
                <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Actifs</h3>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((user) => !user.banned).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">🚫</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Bannis</h3>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter((user) => user.banned).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👑</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Admins</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter((user) => user.role === "admin").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-700"
              />
            </div>
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Effacer
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name
                                ? user.name[0].toUpperCase()
                                : user.email[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || "Nom non renseigné"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * usersPerPage + 1}
                  </span>{" "}
                  à{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * usersPerPage, totalUsers)}
                  </span>{" "}
                  sur <span className="font-medium">{totalUsers}</span>{" "}
                  résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ←
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de gestion utilisateur */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Gérer l&apos;utilisateur
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Nom :</strong>{" "}
                    {selectedUser.name || "Non renseigné"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email :</strong> {selectedUser.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Rôle :</strong> {selectedUser.role || "user"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Statut :</strong>{" "}
                    {selectedUser.banned ? "Banni" : "Actif"}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Gestion des rôles */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Changer le rôle :
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSetRole(selectedUser.id, "user")}
                        disabled={selectedUser.role === "user"}
                        className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
                      >
                        User
                      </button>
                      <button
                        onClick={() => handleSetRole(selectedUser.id, "admin")}
                        disabled={selectedUser.role === "admin"}
                        className="px-3 py-1 bg-purple-500 text-white rounded disabled:opacity-50"
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  {/* Gestion du bannissement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gestion du compte :
                    </label>
                    <div className="flex space-x-2">
                      {!selectedUser.banned ? (
                        <button
                          onClick={() => handleBanUser(selectedUser.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Bannir
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnbanUser(selectedUser.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Débannir
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
