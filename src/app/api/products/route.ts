import { NextResponse } from "next/server";

// Données de test pour les catégories
const categories = [
  {
    id: "1",
    name: "Hydratation",
    slug: "hydratation",
    isActive: true,
  },
  {
    id: "2",
    name: "Purification",
    slug: "purification",
    isActive: true,
  },
  {
    id: "3",
    name: "Anti-âge",
    slug: "anti-age",
    isActive: true,
  },
  {
    id: "4",
    name: "Protection",
    slug: "protection",
    isActive: true,
  },
];

// Données de test pour les produits
const products = [
  // Produits Hydratation
  {
    id: "1",
    name: "Sérum Hydratant Intense",
    description: "Hydratation profonde avec acide hyaluronique",
    price: 45.0,
    stock: 15,
    slug: "serum-hydratant-intense",
    category: {
      id: "1",
      name: "Hydratation",
      slug: "hydratation",
    },
    images: [
      {
        id: "1",
        url: "/images/creme-rose.png",
        alt: "Sérum Hydratant Intense",
        position: 1,
      },
    ],
  },
  {
    id: "2",
    name: "Crème Hydratante Quotidienne",
    description: "Hydratation légère pour tous les jours",
    price: 32.0,
    stock: 25,
    slug: "creme-hydratante-quotidienne",
    category: {
      id: "1",
      name: "Hydratation",
      slug: "hydratation",
    },
    images: [
      {
        id: "2",
        url: "/images/creme-verte.png",
        alt: "Crème Hydratante Quotidienne",
        position: 1,
      },
    ],
  },
  {
    id: "3",
    name: "Masque Hydratant Nuit",
    description: "Régénération nocturne intensive",
    price: 28.0,
    stock: 12,
    slug: "masque-hydratant-nuit",
    category: {
      id: "1",
      name: "Hydratation",
      slug: "hydratation",
    },
    images: [
      {
        id: "3",
        url: "/images/creme-rouge.png",
        alt: "Masque Hydratant Nuit",
        position: 1,
      },
    ],
  },
  {
    id: "4",
    name: "Gel Hydratant Fraîcheur",
    description: "Hydratation rafraîchissante instantanée",
    price: 38.0,
    stock: 18,
    slug: "gel-hydratant-fraicheur",
    category: {
      id: "1",
      name: "Hydratation",
      slug: "hydratation",
    },
    images: [
      {
        id: "4",
        url: "/images/creme-rose.png",
        alt: "Gel Hydratant Fraîcheur",
        position: 1,
      },
    ],
  },
  {
    id: "5",
    name: "Huile Hydratante Nourrissante",
    description: "Hydratation profonde avec huiles naturelles",
    price: 42.0,
    stock: 8,
    slug: "huile-hydratante-nourrissante",
    category: {
      id: "1",
      name: "Hydratation",
      slug: "hydratation",
    },
    images: [
      {
        id: "5",
        url: "/images/creme-verte.png",
        alt: "Huile Hydratante Nourrissante",
        position: 1,
      },
    ],
  },
  {
    id: "6",
    name: "Spray Hydratant Express",
    description: "Hydratation rapide en spray",
    price: 22.0,
    stock: 30,
    slug: "spray-hydratant-express",
    category: {
      id: "1",
      name: "Hydratation",
      slug: "hydratation",
    },
    images: [
      {
        id: "6",
        url: "/images/creme-rouge.png",
        alt: "Spray Hydratant Express",
        position: 1,
      },
    ],
  },

  // Produits Purification
  {
    id: "7",
    name: "Gel Nettoyant Purifiant",
    description: "Nettoyage en profondeur sans agression",
    price: 26.0,
    stock: 20,
    slug: "gel-nettoyant-purifiant",
    category: {
      id: "2",
      name: "Purification",
      slug: "purification",
    },
    images: [
      {
        id: "7",
        url: "/images/creme-rose.png",
        alt: "Gel Nettoyant Purifiant",
        position: 1,
      },
    ],
  },
  {
    id: "8",
    name: "Tonique Purifiant",
    description: "Équilibre et purifie la peau",
    price: 24.0,
    stock: 16,
    slug: "tonique-purifiant",
    category: {
      id: "2",
      name: "Purification",
      slug: "purification",
    },
    images: [
      {
        id: "8",
        url: "/images/creme-verte.png",
        alt: "Tonique Purifiant",
        position: 1,
      },
    ],
  },
  {
    id: "9",
    name: "Masque Purifiant Argile",
    description: "Purification intensive à l'argile",
    price: 18.0,
    stock: 22,
    slug: "masque-purifiant-argile",
    category: {
      id: "2",
      name: "Purification",
      slug: "purification",
    },
    images: [
      {
        id: "9",
        url: "/images/creme-rouge.png",
        alt: "Masque Purifiant Argile",
        position: 1,
      },
    ],
  },
  {
    id: "10",
    name: "Exfoliant Doux Purifiant",
    description: "Exfoliation douce et efficace",
    price: 30.0,
    stock: 14,
    slug: "exfoliant-doux-purifiant",
    category: {
      id: "2",
      name: "Purification",
      slug: "purification",
    },
    images: [
      {
        id: "10",
        url: "/images/creme-rose.png",
        alt: "Exfoliant Doux Purifiant",
        position: 1,
      },
    ],
  },
  {
    id: "11",
    name: "Sérum Purifiant Anti-Imperfections",
    description: "Cible les imperfections et purifie",
    price: 35.0,
    stock: 10,
    slug: "serum-purifiant-anti-imperfections",
    category: {
      id: "2",
      name: "Purification",
      slug: "purification",
    },
    images: [
      {
        id: "11",
        url: "/images/creme-verte.png",
        alt: "Sérum Purifiant Anti-Imperfections",
        position: 1,
      },
    ],
  },
  {
    id: "12",
    name: "Lotion Purifiante Nuit",
    description: "Purification nocturne réparatrice",
    price: 28.0,
    stock: 12,
    slug: "lotion-purifiante-nuit",
    category: {
      id: "2",
      name: "Purification",
      slug: "purification",
    },
    images: [
      {
        id: "12",
        url: "/images/creme-rouge.png",
        alt: "Lotion Purifiante Nuit",
        position: 1,
      },
    ],
  },

  // Produits Anti-âge
  {
    id: "13",
    name: "Sérum Anti-Âge Rétinol",
    description: "Rétinol pur pour lutter contre le vieillissement",
    price: 55.0,
    stock: 8,
    slug: "serum-anti-age-retinol",
    category: {
      id: "3",
      name: "Anti-âge",
      slug: "anti-age",
    },
    images: [
      {
        id: "13",
        url: "/images/creme-rose.png",
        alt: "Sérum Anti-Âge Rétinol",
        position: 1,
      },
    ],
  },
  {
    id: "14",
    name: "Crème Anti-Âge Collagène",
    description: "Stimule la production de collagène",
    price: 48.0,
    stock: 15,
    slug: "creme-anti-age-collagene",
    category: {
      id: "3",
      name: "Anti-âge",
      slug: "anti-age",
    },
    images: [
      {
        id: "14",
        url: "/images/creme-verte.png",
        alt: "Crème Anti-Âge Collagène",
        position: 1,
      },
    ],
  },
  {
    id: "15",
    name: "Masque Anti-Âge Lifting",
    description: "Effet lifting immédiat et durable",
    price: 32.0,
    stock: 10,
    slug: "masque-anti-age-lifting",
    category: {
      id: "3",
      name: "Anti-âge",
      slug: "anti-age",
    },
    images: [
      {
        id: "15",
        url: "/images/creme-rouge.png",
        alt: "Masque Anti-Âge Lifting",
        position: 1,
      },
    ],
  },
  {
    id: "16",
    name: "Sérum Anti-Âge Peptides",
    description: "Peptides avancés pour la jeunesse",
    price: 62.0,
    stock: 6,
    slug: "serum-anti-age-peptides",
    category: {
      id: "3",
      name: "Anti-âge",
      slug: "anti-age",
    },
    images: [
      {
        id: "16",
        url: "/images/creme-rose.png",
        alt: "Sérum Anti-Âge Peptides",
        position: 1,
      },
    ],
  },
  {
    id: "17",
    name: "Crème Contour des Yeux Anti-Âge",
    description: "Spécialement formulée pour le contour des yeux",
    price: 38.0,
    stock: 12,
    slug: "creme-contour-yeux-anti-age",
    category: {
      id: "3",
      name: "Anti-âge",
      slug: "anti-age",
    },
    images: [
      {
        id: "17",
        url: "/images/creme-verte.png",
        alt: "Crème Contour des Yeux Anti-Âge",
        position: 1,
      },
    ],
  },
  {
    id: "18",
    name: "Huile Anti-Âge Régénérante",
    description: "Huile riche en antioxydants naturels",
    price: 45.0,
    stock: 8,
    slug: "huile-anti-age-regenerante",
    category: {
      id: "3",
      name: "Anti-âge",
      slug: "anti-age",
    },
    images: [
      {
        id: "18",
        url: "/images/creme-rouge.png",
        alt: "Huile Anti-Âge Régénérante",
        position: 1,
      },
    ],
  },

  // Produits Protection
  {
    id: "19",
    name: "Crème Solaire SPF 50+",
    description: "Protection solaire haute performance",
    price: 35.0,
    stock: 20,
    slug: "creme-solaire-spf50",
    category: {
      id: "4",
      name: "Protection",
      slug: "protection",
    },
    images: [
      {
        id: "19",
        url: "/images/creme-rose.png",
        alt: "Crème Solaire SPF 50+",
        position: 1,
      },
    ],
  },
  {
    id: "20",
    name: "Sérum Protecteur Anti-Pollution",
    description: "Protège contre la pollution urbaine",
    price: 40.0,
    stock: 15,
    slug: "serum-protecteur-anti-pollution",
    category: {
      id: "4",
      name: "Protection",
      slug: "protection",
    },
    images: [
      {
        id: "20",
        url: "/images/creme-verte.png",
        alt: "Sérum Protecteur Anti-Pollution",
        position: 1,
      },
    ],
  },
  {
    id: "21",
    name: "Crème Protectrice Barrière",
    description: "Renforce la barrière cutanée",
    price: 36.0,
    stock: 18,
    slug: "creme-protectrice-barriere",
    category: {
      id: "4",
      name: "Protection",
      slug: "protection",
    },
    images: [
      {
        id: "21",
        url: "/images/creme-rouge.png",
        alt: "Crème Protectrice Barrière",
        position: 1,
      },
    ],
  },
  {
    id: "22",
    name: "Spray Protecteur Anti-UV",
    description: "Protection UV en spray pratique",
    price: 28.0,
    stock: 25,
    slug: "spray-protecteur-anti-uv",
    category: {
      id: "4",
      name: "Protection",
      slug: "protection",
    },
    images: [
      {
        id: "22",
        url: "/images/creme-rose.png",
        alt: "Spray Protecteur Anti-UV",
        position: 1,
      },
    ],
  },
  {
    id: "23",
    name: "Sérum Protecteur Antioxydant",
    description: "Protection antioxydante avancée",
    price: 42.0,
    stock: 12,
    slug: "serum-protecteur-antioxydant",
    category: {
      id: "4",
      name: "Protection",
      slug: "protection",
    },
    images: [
      {
        id: "23",
        url: "/images/creme-verte.png",
        alt: "Sérum Protecteur Antioxydant",
        position: 1,
      },
    ],
  },
  {
    id: "24",
    name: "Crème Protectrice Nuit",
    description: "Protection et réparation nocturne",
    price: 34.0,
    stock: 16,
    slug: "creme-protectrice-nuit",
    category: {
      id: "4",
      name: "Protection",
      slug: "protection",
    },
    images: [
      {
        id: "24",
        url: "/images/creme-rouge.png",
        alt: "Crème Protectrice Nuit",
        position: 1,
      },
    ],
  },
];

export async function GET() {
  try {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      products,
      categories,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}
