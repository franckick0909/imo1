"use client";

import {
  cancelOrder,
  getOrderDetails,
  OrderDetails,
} from "@/lib/order-actions";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  onOrderCancelled?: () => void;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderNumber,
  onOrderCancelled,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isOpen && orderNumber) {
      fetchOrderDetails();
    }
  }, [isOpen, orderNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getOrderDetails(orderNumber);

      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        setError(result.error || "Erreur lors du chargement");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des détails:", err);
      setError("Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    setIsCancelling(true);
    startTransition(async () => {
      try {
        const result = await cancelOrder(orderNumber);

        if (result.success) {
          // Succès
          setShowCancelConfirm(false);
          onOrderCancelled?.();
          onClose();
        } else {
          setError(result.error || "Erreur lors de l'annulation");
        }
      } catch (err) {
        console.error("Erreur lors de l'annulation:", err);
        setError("Erreur inconnue");
      } finally {
        setIsCancelling(false);
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Détails de la commande
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2 rounded-full transition-all text-gray-700 cursor-pointer hover:rotate-180 duration-300"
              aria-label="Fermer le modal"
            >
              <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
                  <p className="text-gray-600">Chargement des détails...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : order ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Commande #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.statusText}
                      </span>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* Status details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Paiement:{" "}
                        {order.paymentStatus === "PAID" ? "Payé" : "En attente"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Expédition: {order.shippingMethod}
                      </span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Suivi: {order.trackingNumber}
                        </span>
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Livraison estimée:{" "}
                          {formatDate(order.estimatedDelivery)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Produits commandés
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="100px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(item.total)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total:</span>
                      <span className="text-gray-900">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais de port:</span>
                      <span className="text-gray-900">
                        {order.shippingCost > 0
                          ? formatPrice(order.shippingCost)
                          : "Gratuit"}
                      </span>
                    </div>
                    {order.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">TVA:</span>
                        <span className="text-gray-900">
                          {formatPrice(order.taxAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-emerald-600">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse de livraison
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {order.shippingAddress.firstName}{" "}
                        {order.shippingAddress.lastName}
                      </p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.postalCode}{" "}
                        {order.shippingAddress.city}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Adresse de facturation
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {order.billingAddress.firstName}{" "}
                        {order.billingAddress.lastName}
                      </p>
                      <p>{order.billingAddress.street}</p>
                      <p>
                        {order.billingAddress.postalCode}{" "}
                        {order.billingAddress.city}
                      </p>
                      <p>{order.billingAddress.country}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center gap-3">
                    {order.canTrack && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                        Suivre ma commande
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {order.canCancel && (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={isCancelling || isPending}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isCancelling || isPending
                          ? "Annulation..."
                          : "Annuler la commande"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Annuler la commande
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir annuler cette commande ? Cette action
                  est irréversible.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isCancelling || isPending}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling || isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCancelling || isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Annulation...
                      </>
                    ) : (
                      "Confirmer l'annulation"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
