import { calculateShipping } from "@/lib/shipping-utils";
import { ShippingRequest } from "@/lib/types/shipping";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: ShippingRequest = await request.json();

    // Valider les paramètres requis
    if (!body.country || !body.weight || !body.value) {
      return NextResponse.json(
        { error: "Paramètres manquants: country, weight, value requis" },
        { status: 400 }
      );
    }

    // Calculer les frais de port
    const shippingResponse = calculateShipping(body);

    // Retourner une erreur si aucune méthode disponible
    if (shippingResponse.errors && shippingResponse.errors.length > 0) {
      return NextResponse.json(
        { error: shippingResponse.errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(shippingResponse);
  } catch (error) {
    console.error("Erreur calcul frais de port:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const weight = searchParams.get("weight");
    const value = searchParams.get("value");
    const postalCode = searchParams.get("postalCode") || "";

    if (!country || !weight || !value) {
      return NextResponse.json(
        { error: "Paramètres manquants: country, weight, value requis" },
        { status: 400 }
      );
    }

    const shippingRequest: ShippingRequest = {
      country,
      postalCode,
      weight: parseFloat(weight),
      value: parseFloat(value),
    };

    const shippingResponse = calculateShipping(shippingRequest);

    if (shippingResponse.errors && shippingResponse.errors.length > 0) {
      return NextResponse.json(
        { error: shippingResponse.errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(shippingResponse);
  } catch (error) {
    console.error("Erreur calcul frais de port:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
