"use client";

import OrderDetailsModal from "@/components/OrderDetailsModal";
import { useOrders } from "@/stores/dashboard-store";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Loader2,
  Package,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function OrdersPageContent() {
  const { orders, isLoadingOrders, loadOrders } = useOrders();
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(
    null
  );
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Charger les commandes au montage
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Fonction pour valider le payment intent et afficher le succès
  const validatePaymentAndShowSuccess = useCallback(
    async (paymentIntentId: string) => {
      try {
        const response = await fetch(`/api/dashboard/validate-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentIntentId }),
        });

        if (response.ok) {
          const data = await response.json();
          setShowSuccessMessage(true);
          setSuccessOrderNumber(data.orderNumber);

          // Masquer le message après 8 secondes
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 8000);

          // Recharger les commandes pour afficher la nouvelle commande
          loadOrders();
        } else {
          console.error("Erreur lors de la validation du paiement");
        }
      } catch (error) {
        console.error("Erreur lors de la validation du paiement:", error);
      }
    },
    [loadOrders]
  );

  // Vérifier si on vient d'une commande réussie
  useEffect(() => {
    if (!searchParams) return;

    const success = searchParams.get("success");
    const orderNumber = searchParams.get("order");
    const paymentIntent = searchParams.get("payment_intent");

    if (success === "true") {
      if (orderNumber) {
        // Cas 1: On a déjà le numéro de commande
        setShowSuccessMessage(true);
        setSuccessOrderNumber(orderNumber);

        // Masquer le message après 8 secondes
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 8000);
      } else if (paymentIntent) {
        // Cas 2: On a un payment_intent, récupérer le numéro de commande
        validatePaymentAndShowSuccess(paymentIntent);
      }
    }
  }, [searchParams, validatePaymentAndShowSuccess]);

  const handleViewOrderDetails = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setShowOrderDetails(true);
  };

  const handleOrderCancelled = () => {
    // Recharger les commandes pour refléter l'annulation
    loadOrders();
  };

  const handleTrackOrder = (trackingNumber: string | null) => {
    if (!trackingNumber) return;
    // Ouvrir le lien de suivi dans un nouvel onglet
    // Vous pouvez personnaliser selon votre transporteur
    window.open(
      `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
      "_blank"
    );
  };

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
      month: "short",
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
      {/* Message de succès */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Paiement réussi !
                </h3>
                <p className="text-sm text-green-700">
                  Votre commande <strong>{successOrderNumber}</strong> a été
                  confirmée et sera traitée dans les plus brefs délais.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 hover:text-green-800 transition-colors"
              title="Fermer le message"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
          <p className="text-gray-600 mt-1">
            Suivez le statut de vos commandes et consultez votre historique
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ShoppingBag className="h-4 w-4" />
          <span>
            {orders.length} commande{orders.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Contenu principal */}
      {isLoadingOrders ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement de vos commandes...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune commande
          </h3>
          <p className="text-gray-500 mb-6">
            Vous n&apos;avez pas encore passé de commande.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status === "delivered" && "Livré"}
                      {order.status === "shipped" && "Expédié"}
                      {order.status === "processing" && "En cours"}
                      {order.status === "cancelled" && "Annulé"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Commande #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items} article{order.items > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Produits de la commande */}
              <div className="space-y-3">
                {order.products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantité: {product.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(product.price * product.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Statut de la commande:
                  </span>
                  <span className="text-sm text-gray-900">
                    {order.statusText}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewOrderDetails(order.id)}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Voir les détails
                  </button>
                  {order.trackingNumber && (
                    <button
                      onClick={() => handleTrackOrder(order.trackingNumber)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Suivre ma commande
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de détails de la commande */}
      {showOrderDetails && selectedOrderNumber && (
        <OrderDetailsModal
          isOpen={showOrderDetails}
          orderNumber={selectedOrderNumber}
          onClose={() => setShowOrderDetails(false)}
          onOrderCancelled={handleOrderCancelled}
        />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
