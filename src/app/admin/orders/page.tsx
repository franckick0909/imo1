"use client";

import { useSession } from "@/lib/auth-client";
import {
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Package,
  Search,
  Shield,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrdersAction, updateOrderStatusAction } from "./actions";

// Types pour les commandes admin
interface AdminOrder {
  id: string;
  orderNumber: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  userId: string | null;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

// Types pour les filtres
interface OrdersFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
}

export default function AdminOrdersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // États locaux pour les données
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersPagination, setOrdersPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Vérifier les permissions admin et charger les données
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.role === "admin") {
        setIsAdmin(true);
        // Charger les commandes
        await loadOrders(1);
      } else {
        router.push("/dashboard");
      }
    };

    if (session) {
      checkAdminStatus();
    }
  }, [session, router]);

  // Fonction pour charger les commandes
  const loadOrders = async (page: number, filters: OrdersFilters = {}) => {
    setIsLoadingOrders(true);
    try {
      const data = await getOrdersAction(page, 10, filters);
      // Transformer les données pour correspondre à l'interface AdminOrder
      const transformedOrders = data.orders.map((order: unknown) => ({
        ...(order as AdminOrder),
        user:
          (
            order as {
              user?: { id: string; name: string | null; email: string } | null;
            }
          ).user || null,
      }));
      setOrders(transformedOrders);
      setOrdersPagination(data.pagination);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Gérer la recherche et les filtres
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    loadOrders(1, {
      search: term,
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
    });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadOrders(1, {
      search: searchTerm,
      status,
      paymentStatus: paymentStatusFilter,
    });
  };

  const handlePaymentStatusFilter = (paymentStatus: string) => {
    setPaymentStatusFilter(paymentStatus);
    loadOrders(1, { search: searchTerm, status: statusFilter, paymentStatus });
  };

  // Gérer la pagination
  const handlePageChange = (page: number) => {
    const filters = {
      search: searchTerm,
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
    };
    loadOrders(page, filters);
  };

  // Gérer la mise à jour du statut
  const handleUpdateStatus = async (
    orderId: string,
    status: AdminOrder["status"]
  ) => {
    try {
      await updateOrderStatusAction(orderId, status);
      // Recharger les commandes pour mettre à jour l'affichage
      await loadOrders(1, {
        search: searchTerm,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const getStatusColor = (status: AdminOrder["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: AdminOrder["paymentStatus"]) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: AdminOrder["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4" />;
      case "PROCESSING":
        return <Package className="h-4 w-4" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4" />;
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      case "REFUNDED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (isPending || isLoadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-lg font-medium">
            Chargement des commandes...
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
                  Gestion des commandes
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
        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Commandes</h2>
              <p className="text-gray-600">
                Gérez et suivez toutes les commandes de vos clients
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmée</option>
                <option value="PROCESSING">En traitement</option>
                <option value="SHIPPED">Expédiée</option>
                <option value="DELIVERED">Livrée</option>
                <option value="CANCELLED">Annulée</option>
                <option value="REFUNDED">Remboursée</option>
              </select>
              <select
                value={paymentStatusFilter}
                onChange={(e) => handlePaymentStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filtrer par statut de paiement"
              >
                <option value="">Tous les paiements</option>
                <option value="PAID">Payé</option>
                <option value="PENDING">En attente</option>
                <option value="FAILED">Échoué</option>
                <option value="REFUNDED">Remboursé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des commandes */}
        {isLoadingOrders ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">
              Chargement des commandes...
            </span>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commande
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paiement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-emerald-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.id.slice(-8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.orderItems?.length || 0} article
                                {(order.orderItems?.length || 0) > 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {order.customerName?.charAt(0) ||
                                  order.customerEmail?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {order.customerName || "Client anonyme"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customerEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.totalAmount.toFixed(2)}€
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1">
                              {order.status === "PENDING" && "En attente"}
                              {order.status === "CONFIRMED" && "Confirmée"}
                              {order.status === "PROCESSING" && "En traitement"}
                              {order.status === "SHIPPED" && "Expédiée"}
                              {order.status === "DELIVERED" && "Livrée"}
                              {order.status === "CANCELLED" && "Annulée"}
                              {order.status === "REFUNDED" && "Remboursée"}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus === "PAID" && "Payé"}
                            {order.paymentStatus === "PENDING" && "En attente"}
                            {order.paymentStatus === "FAILED" && "Échoué"}
                            {order.paymentStatus === "REFUNDED" && "Remboursé"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                            title="Voir détails"
                            aria-label="Voir détails de la commande"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {ordersPagination && ordersPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de{" "}
                        <span className="font-medium">
                          {(ordersPagination.page - 1) *
                            ordersPagination.limit +
                            1}
                        </span>{" "}
                        à{" "}
                        <span className="font-medium">
                          {Math.min(
                            ordersPagination.page * ordersPagination.limit,
                            ordersPagination.total
                          )}
                        </span>{" "}
                        sur{" "}
                        <span className="font-medium">
                          {ordersPagination.total}
                        </span>{" "}
                        résultats
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handlePageChange(ordersPagination.page - 1)
                        }
                        disabled={ordersPagination.page === 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(ordersPagination.page + 1)
                        }
                        disabled={
                          ordersPagination.page === ordersPagination.totalPages
                        }
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal commande */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Détails de la commande #{selectedOrder.id.slice(-8)}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fermer la modale"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations client */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Client
                </h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">
                    <strong>Nom:</strong>{" "}
                    {selectedOrder.customerName || "Client anonyme"}
                  </p>
                  <p className="text-sm text-gray-900">
                    <strong>Email:</strong> {selectedOrder.customerEmail}
                  </p>
                </div>
              </div>

              {/* Articles */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Articles
                </h4>
                <div className="space-y-2">
                  {selectedOrder.orderItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantité: {item.quantity} × {item.price.toFixed(2)}€
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {(item.price * item.quantity).toFixed(2)}€
                      </div>
                    </div>
                  )) || (
                    <div className="text-sm text-gray-500 italic">
                      Aucun article trouvé
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedOrder.totalAmount.toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        selectedOrder.id,
                        e.target.value as AdminOrder["status"]
                      )
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Modifier le statut de la commande"
                  >
                    <option value="PENDING">En attente</option>
                    <option value="CONFIRMED">Confirmée</option>
                    <option value="PROCESSING">En traitement</option>
                    <option value="SHIPPED">Expédiée</option>
                    <option value="DELIVERED">Livrée</option>
                    <option value="CANCELLED">Annulée</option>
                    <option value="REFUNDED">Remboursée</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
