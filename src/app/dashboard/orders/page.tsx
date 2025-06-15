"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, Package, Truck } from "lucide-react";

export default function OrdersPage() {
  const orders = [
    {
      id: "CMD-2024-001",
      date: "2024-01-15",
      status: "delivered",
      statusText: "Livré",
      total: 89.99,
      items: 3,
      trackingNumber: "FR123456789",
    },
    {
      id: "CMD-2024-002",
      date: "2024-01-10",
      status: "shipped",
      statusText: "Expédié",
      total: 156.5,
      items: 5,
      trackingNumber: "FR987654321",
    },
    {
      id: "CMD-2024-003",
      date: "2024-01-05",
      status: "processing",
      statusText: "En préparation",
      total: 75.25,
      items: 2,
      trackingNumber: null,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "processing":
        return <Clock className="h-5 w-5 text-orange-600" />;
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
      default:
        return "bg-gray-100 text-gray-800";
    }
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
            <span className="font-medium">{orders.length} commandes</span>
          </div>
        </div>
      </motion.div>

      {/* Orders List */}
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
                    Commandé le {new Date(order.date).toLocaleDateString()}
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
                <p className="font-semibold text-gray-900">{order.total}€</p>
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

            <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
              <button className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium">
                Voir détails
              </button>
              {order.trackingNumber && (
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  Suivre le colis
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state if no orders */}
      {orders.length === 0 && (
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
            Vous n'avez pas encore passé de commande.
          </p>
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Découvrir nos produits
          </button>
        </motion.div>
      )}
    </div>
  );
}
