"use client";

import { calculateShippingAction } from "@/lib/actions";
import { ShippingCalculation, ShippingResponse } from "@/lib/types/shipping";
import { Clock, MapPin, Truck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ShippingSelectorProps {
  country: string;
  postalCode?: string;
  weight: number;
  value: number;
  onShippingChange: (shipping: ShippingCalculation | null) => void;
  disabled?: boolean;
}

export default function ShippingSelector({
  country,
  postalCode,
  weight,
  value,
  onShippingChange,
  disabled = false,
}: ShippingSelectorProps) {
  const [shippingOptions, setShippingOptions] = useState<ShippingCalculation[]>(
    []
  );
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const calculateShipping = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await calculateShippingAction({
        country,
        postalCode: postalCode || "",
        weight,
        value,
      });

      if (result.success && result.data) {
        const data = result.data as ShippingResponse;
        setShippingOptions(data.availableMethods);

        // Sélectionner automatiquement la méthode par défaut
        if (data.defaultMethod && data.defaultMethod.method) {
          setSelectedMethod(data.defaultMethod.method.id);
          onShippingChange(data.defaultMethod);
        }
      } else {
        setError(result.error || "Erreur lors du calcul des frais de port");
        setShippingOptions([]);
        setSelectedMethod("");
        onShippingChange(null);
      }
    } catch (err) {
      console.error("Erreur calcul frais de port:", err);
      setError("Erreur lors du calcul des frais de port");
      setShippingOptions([]);
      setSelectedMethod("");
      onShippingChange(null);
    } finally {
      setIsLoading(false);
    }
  }, [country, postalCode, weight, value, onShippingChange]);

  // Calculer les frais de port quand les paramètres changent
  useEffect(() => {
    if (!country || weight <= 0 || value < 0) {
      setShippingOptions([]);
      setSelectedMethod("");
      onShippingChange(null);
      return;
    }

    calculateShipping();
  }, [country, postalCode, weight, value, calculateShipping, onShippingChange]);

  const handleMethodChange = (methodId: string) => {
    setSelectedMethod(methodId);
    const selectedOption = shippingOptions.find(
      (option) => option.method.id === methodId
    );
    onShippingChange(selectedOption || null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "express":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "overnight":
        return <Clock className="w-5 h-5 text-red-500" />;
      default:
        return <Truck className="w-5 h-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">
            Méthodes de livraison
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Calcul des frais de port...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">
            Méthodes de livraison
          </h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-red-500">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={calculateShipping}
            className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (shippingOptions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">
            Méthodes de livraison
          </h3>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">
            Aucune méthode de livraison disponible pour cette destination.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">
          Méthodes de livraison
        </h3>
      </div>

      <div className="space-y-3">
        {shippingOptions.map((option) => (
          <div
            key={option.method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === option.method.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !disabled && handleMethodChange(option.method.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  value={option.method.id}
                  checked={selectedMethod === option.method.id}
                  onChange={() => handleMethodChange(option.method.id)}
                  disabled={disabled}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  aria-label={`Sélectionner ${option.method.name}`}
                />
                {getMethodIcon(option.method.type)}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {option.method.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {option.method.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatPrice(option.price)}
                </p>
                <p className="text-sm text-gray-500">
                  {option.method.estimatedDays.min}-
                  {option.method.estimatedDays.max} jour(s)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
