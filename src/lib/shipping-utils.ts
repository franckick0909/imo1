import {
  SHIPPING_METHODS,
  SHIPPING_RATES,
  SHIPPING_ZONES,
  ShippingCalculation,
  ShippingMethod,
  ShippingRate,
  ShippingRequest,
  ShippingResponse,
  ShippingZone,
} from "./types/shipping";

/**
 * Trouve la zone de livraison pour un pays donné
 */
export function findShippingZone(country: string): ShippingZone | null {
  // Chercher d'abord dans les zones spécifiques
  for (const zone of SHIPPING_ZONES) {
    if (zone.countries.includes(country)) {
      return zone;
    }
  }

  // Si pas trouvé, utiliser la zone internationale
  return SHIPPING_ZONES.find((zone) => zone.countries.includes("*")) || null;
}

/**
 * Récupère les méthodes de livraison disponibles pour une zone
 */
export function getShippingMethodsForZone(zoneId: string): ShippingMethod[] {
  return SHIPPING_METHODS.filter(
    (method) => method.zoneId === zoneId && method.isActive
  );
}

/**
 * Trouve le tarif approprié pour une méthode et un poids donnés
 */
export function findShippingRate(
  methodId: string,
  weight: number
): ShippingRate | null {
  const rates = SHIPPING_RATES.filter(
    (rate) =>
      rate.methodId === methodId &&
      weight >= rate.weightFrom &&
      weight <= rate.weightTo
  );

  // Retourner le tarif le plus approprié (le plus spécifique)
  return rates.length > 0 ? rates[0] : null;
}

/**
 * Calcule les frais de port pour une méthode donnée
 */
export function calculateShippingCost(
  method: ShippingMethod,
  weight: number,
  orderValue: number
): { price: number; isFree: boolean } {
  const rate = findShippingRate(method.id, weight);

  if (!rate) {
    return { price: 0, isFree: false };
  }

  // Vérifier si livraison gratuite
  const isFree =
    rate.freeShippingThreshold && orderValue >= rate.freeShippingThreshold;

  return {
    price: isFree ? 0 : rate.price,
    isFree: Boolean(isFree),
  };
}

/**
 * Calcule les dates de livraison estimées
 */
export function calculateDeliveryDates(method: ShippingMethod): {
  min: Date;
  max: Date;
} {
  const now = new Date();
  const minDate = new Date(now);
  const maxDate = new Date(now);

  // Ajouter les jours ouvrables (exclure weekends)
  minDate.setDate(now.getDate() + method.estimatedDays.min);
  maxDate.setDate(now.getDate() + method.estimatedDays.max);

  return {
    min: minDate,
    max: maxDate,
  };
}

/**
 * Calcule tous les frais de port disponibles pour une requête
 */
export function calculateShipping(request: ShippingRequest): ShippingResponse {
  const errors: string[] = [];

  // Valider la requête
  if (!request.country) {
    errors.push("Pays requis");
  }

  if (request.weight <= 0) {
    errors.push("Poids invalide");
  }

  if (request.value < 0) {
    errors.push("Valeur de commande invalide");
  }

  if (errors.length > 0) {
    return {
      availableMethods: [],
      defaultMethod: {} as ShippingCalculation,
      errors,
    };
  }

  // Trouver la zone de livraison
  const zone = findShippingZone(request.country);
  if (!zone) {
    return {
      availableMethods: [],
      defaultMethod: {} as ShippingCalculation,
      errors: ["Zone de livraison non trouvée"],
    };
  }

  // Récupérer les méthodes disponibles
  const methods = getShippingMethodsForZone(zone.id);
  if (methods.length === 0) {
    return {
      availableMethods: [],
      defaultMethod: {} as ShippingCalculation,
      errors: ["Aucune méthode de livraison disponible"],
    };
  }

  // Calculer les frais pour chaque méthode
  const calculations: ShippingCalculation[] = [];

  for (const method of methods) {
    const rate = findShippingRate(method.id, request.weight);
    if (!rate) {
      continue; // Pas de tarif pour ce poids
    }

    const { price, isFree } = calculateShippingCost(
      method,
      request.weight,
      request.value
    );
    const deliveryDates = calculateDeliveryDates(method);

    calculations.push({
      zone,
      method,
      rate,
      price,
      isFree,
      estimatedDelivery: deliveryDates,
    });
  }

  if (calculations.length === 0) {
    return {
      availableMethods: [],
      defaultMethod: {} as ShippingCalculation,
      errors: ["Aucune méthode de livraison disponible pour ce poids"],
    };
  }

  // Trier par prix (le moins cher en premier)
  calculations.sort((a, b) => a.price - b.price);

  // Méthode par défaut : la moins chère
  const defaultMethod = calculations[0];

  return {
    availableMethods: calculations,
    defaultMethod,
    errors: [],
  };
}

/**
 * Calcule le poids total d'une commande à partir des produits
 */
export function calculateOrderWeight(
  items: Array<{ weight: number; quantity: number }>
): number {
  return items.reduce((total, item) => total + item.weight * item.quantity, 0);
}

/**
 * Formate une date de livraison pour l'affichage
 */
export function formatDeliveryDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formate une fourchette de dates de livraison
 */
export function formatDeliveryRange(
  min: Date | string,
  max: Date | string
): string {
  // Convertir en objets Date si nécessaire
  const minDate = min instanceof Date ? min : new Date(min);
  const maxDate = max instanceof Date ? max : new Date(max);

  if (minDate.toDateString() === maxDate.toDateString()) {
    return `le ${formatDeliveryDate(minDate)}`;
  }

  const minFormatted = minDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  const maxFormatted = maxDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return `entre le ${minFormatted} et le ${maxFormatted}`;
}

/**
 * Vérifie si un pays est dans l'UE (pour les taxes)
 */
export function isEUCountry(country: string): boolean {
  const euCountries = [
    "AT",
    "BE",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "HU",
    "IE",
    "IT",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SK",
    "SI",
    "ES",
    "SE",
  ];

  return euCountries.includes(country);
}

/**
 * Récupère la liste des pays par zone pour l'interface
 */
export function getCountriesByZone(): Record<string, string[]> {
  const countriesByZone: Record<string, string[]> = {};

  for (const zone of SHIPPING_ZONES) {
    countriesByZone[zone.id] = zone.countries;
  }

  return countriesByZone;
}
