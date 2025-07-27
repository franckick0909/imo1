export interface ShippingZone {
  id: string;
  name: string;
  description: string;
  countries: string[];
  isActive: boolean;
  displayOrder: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  carrier: string;
  type: "standard" | "express" | "overnight";
  estimatedDays: {
    min: number;
    max: number;
  };
  isActive: boolean;
  zoneId: string;
}

export interface ShippingRate {
  id: string;
  methodId: string;
  weightFrom: number; // en grammes
  weightTo: number; // en grammes
  price: number; // en euros
  freeShippingThreshold?: number; // montant minimum pour livraison gratuite
}

export interface ShippingCalculation {
  zone: ShippingZone;
  method: ShippingMethod;
  rate: ShippingRate;
  price: number;
  isFree: boolean;
  estimatedDelivery: {
    min: Date;
    max: Date;
  };
}

export interface ShippingRequest {
  country: string;
  postalCode: string;
  weight: number; // en grammes
  value: number; // valeur de la commande en euros
}

export interface ShippingResponse {
  availableMethods: ShippingCalculation[];
  defaultMethod: ShippingCalculation;
  errors?: string[];
}

// Constantes pour les zones
export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "fr-metro",
    name: "France Métropolitaine",
    description: "France continentale et Corse",
    countries: ["FR"],
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "dom-tom",
    name: "DOM-TOM",
    description: "Départements et territoires d'outre-mer",
    countries: [
      "GP",
      "MQ",
      "GF",
      "RE",
      "YT",
      "BL",
      "MF",
      "PM",
      "WF",
      "PF",
      "NC",
    ],
    isActive: true,
    displayOrder: 2,
  },
  {
    id: "europe",
    name: "Europe",
    description: "Union Européenne et pays limitrophes",
    countries: [
      "BE",
      "DE",
      "ES",
      "IT",
      "LU",
      "NL",
      "AT",
      "PT",
      "CH",
      "GB",
      "IE",
      "DK",
      "SE",
      "NO",
      "FI",
      "PL",
      "CZ",
      "SK",
      "HU",
      "SI",
      "HR",
      "RO",
      "BG",
      "GR",
      "CY",
      "MT",
      "EE",
      "LV",
      "LT",
    ],
    isActive: true,
    displayOrder: 3,
  },
  {
    id: "international",
    name: "International",
    description: "Reste du monde",
    countries: ["*"], // Wildcard pour tous les autres pays
    isActive: true,
    displayOrder: 4,
  },
];

// Méthodes de livraison par zone
export const SHIPPING_METHODS: ShippingMethod[] = [
  // France Métropolitaine
  {
    id: "fr-colissimo",
    name: "Colissimo",
    description: "Livraison standard à domicile",
    carrier: "La Poste",
    type: "standard",
    estimatedDays: { min: 2, max: 3 },
    isActive: true,
    zoneId: "fr-metro",
  },
  {
    id: "fr-chronopost",
    name: "Chronopost",
    description: "Livraison express 24h",
    carrier: "Chronopost",
    type: "express",
    estimatedDays: { min: 1, max: 1 },
    isActive: true,
    zoneId: "fr-metro",
  },
  {
    id: "fr-point-relais",
    name: "Point Relais",
    description: "Livraison en point relais",
    carrier: "Mondial Relay",
    type: "standard",
    estimatedDays: { min: 3, max: 5 },
    isActive: true,
    zoneId: "fr-metro",
  },

  // DOM-TOM
  {
    id: "dom-colissimo",
    name: "Colissimo DOM-TOM",
    description: "Livraison outre-mer",
    carrier: "La Poste",
    type: "standard",
    estimatedDays: { min: 5, max: 10 },
    isActive: true,
    zoneId: "dom-tom",
  },

  // Europe
  {
    id: "eu-colissimo",
    name: "Colissimo Europe",
    description: "Livraison en Europe",
    carrier: "La Poste",
    type: "standard",
    estimatedDays: { min: 4, max: 7 },
    isActive: true,
    zoneId: "europe",
  },
  {
    id: "eu-chronopost",
    name: "Chronopost Europe",
    description: "Livraison express en Europe",
    carrier: "Chronopost",
    type: "express",
    estimatedDays: { min: 2, max: 3 },
    isActive: true,
    zoneId: "europe",
  },

  // International
  {
    id: "intl-colissimo",
    name: "Colissimo International",
    description: "Livraison internationale",
    carrier: "La Poste",
    type: "standard",
    estimatedDays: { min: 7, max: 14 },
    isActive: true,
    zoneId: "international",
  },
];

// Grille tarifaire
export const SHIPPING_RATES: ShippingRate[] = [
  // France Métropolitaine - Colissimo
  {
    id: "fr-colissimo-0-500g",
    methodId: "fr-colissimo",
    weightFrom: 0,
    weightTo: 500,
    price: 4.95,
    freeShippingThreshold: 50,
  },
  {
    id: "fr-colissimo-500g-1kg",
    methodId: "fr-colissimo",
    weightFrom: 500,
    weightTo: 1000,
    price: 6.95,
    freeShippingThreshold: 50,
  },
  {
    id: "fr-colissimo-1kg-2kg",
    methodId: "fr-colissimo",
    weightFrom: 1000,
    weightTo: 2000,
    price: 8.95,
    freeShippingThreshold: 50,
  },

  // France Métropolitaine - Chronopost
  {
    id: "fr-chronopost-0-500g",
    methodId: "fr-chronopost",
    weightFrom: 0,
    weightTo: 500,
    price: 12.95,
  },
  {
    id: "fr-chronopost-500g-1kg",
    methodId: "fr-chronopost",
    weightFrom: 500,
    weightTo: 1000,
    price: 15.95,
  },

  // France Métropolitaine - Point Relais
  {
    id: "fr-point-relais-0-500g",
    methodId: "fr-point-relais",
    weightFrom: 0,
    weightTo: 500,
    price: 3.95,
    freeShippingThreshold: 40,
  },
  {
    id: "fr-point-relais-500g-1kg",
    methodId: "fr-point-relais",
    weightFrom: 500,
    weightTo: 1000,
    price: 5.95,
    freeShippingThreshold: 40,
  },

  // DOM-TOM
  {
    id: "dom-colissimo-0-500g",
    methodId: "dom-colissimo",
    weightFrom: 0,
    weightTo: 500,
    price: 12.95,
  },
  {
    id: "dom-colissimo-500g-1kg",
    methodId: "dom-colissimo",
    weightFrom: 500,
    weightTo: 1000,
    price: 18.95,
  },

  // Europe
  {
    id: "eu-colissimo-0-500g",
    methodId: "eu-colissimo",
    weightFrom: 0,
    weightTo: 500,
    price: 8.95,
  },
  {
    id: "eu-colissimo-500g-1kg",
    methodId: "eu-colissimo",
    weightFrom: 500,
    weightTo: 1000,
    price: 12.95,
  },

  // Europe Express
  {
    id: "eu-chronopost-0-500g",
    methodId: "eu-chronopost",
    weightFrom: 0,
    weightTo: 500,
    price: 19.95,
  },

  // International
  {
    id: "intl-colissimo-0-500g",
    methodId: "intl-colissimo",
    weightFrom: 0,
    weightTo: 500,
    price: 15.95,
  },
  {
    id: "intl-colissimo-500g-1kg",
    methodId: "intl-colissimo",
    weightFrom: 500,
    weightTo: 1000,
    price: 22.95,
  },
];
