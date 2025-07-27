import { Decimal } from "@prisma/client/runtime/library";

// Types pour les statuts de paiement
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

// Types pour les statuts de commande
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

// Types pour les méthodes de paiement
export type PaymentMethod = "card" | "paypal" | "apple_pay" | "google_pay";

// Interface pour les objets Stripe des webhooks
export interface StripePaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status: string;
  metadata: {
    orderId?: string;
    userId?: string;
    [key: string]: string | undefined;
  };
  customer?: string;
  payment_method?: string;
}

export interface StripeCharge {
  id: string;
  object: "charge";
  amount: number;
  currency: string;
  status: string;
  payment_intent: string;
  customer?: string;
  metadata: {
    [key: string]: string;
  };
}

// Interface pour les données de paiement Stripe
export interface StripePaymentData {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  metadata?: Record<string, string>;
}

// Interface pour créer un Payment Intent
export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId: string;
  userId: string;
  metadata?: Record<string, string>;
}

// Interface pour la réponse de création de Payment Intent
export interface CreatePaymentIntentResponse {
  paymentIntent: {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
  };
  ephemeralKey?: {
    id: string;
    secret: string;
  };
}

// Interface pour les données de commande avec calculs
export interface OrderCalculation {
  subtotal: Decimal;
  shippingCost: Decimal;
  tax: Decimal;
  total: Decimal;
  items: Array<{
    productId: string;
    quantity: number;
    price: Decimal;
    total: Decimal;
  }>;
}

// Interface pour les données de checkout
export interface CheckoutData {
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: PaymentMethod;
}

// Interface pour les webhooks Stripe
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripePaymentIntent | StripeCharge | Record<string, unknown>;
  };
  created: number;
}

// Types pour les zones de livraison
export type ShippingZone =
  | "france_metro"
  | "dom_tom"
  | "europe"
  | "international";

// Interface pour les frais de livraison
export interface ShippingRate {
  zone: ShippingZone;
  baseRate: number;
  perKgRate: number;
  freeShippingThreshold?: number;
}

// Interface pour le calcul des frais de livraison
export interface ShippingCalculation {
  zone: ShippingZone;
  weight: number;
  cost: number;
  isFreeShipping: boolean;
  estimatedDeliveryDays: number;
}
