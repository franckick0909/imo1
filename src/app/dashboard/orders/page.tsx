"use client";

import { useOrders } from "@/stores/dashboard-store";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Loader2,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import Image from "next/image";

export default function OrdersPage() {
  const { orders, isLoadingOrders, loadOrders } = useOrders();

  // Charger les commandes au montage
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "processing":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "cancelled":
        return <Package className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
            <p className="text-gray-600 mt-1">
              Suivez vos commandes et livraisons
            </p>
          </div>
          <div className="flex items-center space-x-2 text-emerald-600">
            <Package className="h-5 w-5" />
            {isLoadingOrders ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="font-medium">{orders.length} commandes</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoadingOrders && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">
            Chargement de vos commandes...
          </span>
        </div>
      )}

      {/* Orders List */}
      {!isLoadingOrders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Commandé le {formatDate(order.date)}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.statusText}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Articles</p>
                  <p className="font-semibold text-gray-900">
                    {order.items} articles
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Suivi</p>
                  <p className="font-semibold text-gray-900">
                    {order.trackingNumber || "Non disponible"}
                  </p>
                </div>
              </div>

              {/* Products in order */}
              {order.products && order.products.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Produits commandés
                  </p>
                  <div className="space-y-2">
                    {order.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="h-full w-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-lg">🧴</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-gray-500">
                              Quantité: {product.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    // TODO: Implémenter la vue détaillée de la commande
                    console.log("View order details:", order.id);
                  }}
                  className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Voir détails
                </button>
                {order.trackingNumber && (
                  <button
                    onClick={() => {
                      // TODO: Implémenter le suivi du colis
                      console.log("Track package:", order.trackingNumber);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Suivre le colis
                  </button>
                )}
                {order.status === "delivered" && (
                  <button
                    onClick={() => {
                      // TODO: Implémenter le système d'avis
                      console.log("Leave review for order:", order.id);
                    }}
                    className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    Laisser un avis
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state if no orders */}
      {!isLoadingOrders && orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center"
        >
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune commande
          </h3>
          <p className="text-gray-600 mb-6">
            Vous n&apos;avez pas encore passé de commande.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Découvrir nos produits
          </Link>
        </motion.div>
      )}
    </div>
  );
}
