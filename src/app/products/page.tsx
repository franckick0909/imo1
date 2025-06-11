"use client";

import { useState } from "react";

// Mock data en attendant la vraie base de données
const mockProducts = [
  {
    id: 1,
    name: "Crème Hydratante Bio",
    description:
      "Une crème hydratante enrichie aux extraits naturels de plantes.",
    price: 29.99,
    comparePrice: 39.99,
    image: "/api/placeholder/300/300",
    stock: 15,
    category: "Hydratation",
    slug: "creme-hydratante-bio",
  },
  {
    id: 2,
    name: "Sérum Anti-Âge Naturel",
    description:
      "Sérum concentré aux huiles essentielles pour une peau éclatante.",
    price: 45.99,
    comparePrice: null,
    image: "/api/placeholder/300/300",
    stock: 8,
    category: "Anti-âge",
    slug: "serum-anti-age-naturel",
  },
  {
    id: 3,
    name: "Masque Purifiant Argile",
    description: "Masque à l'argile verte pour purifier et détoxifier la peau.",
    price: 24.99,
    comparePrice: 34.99,
    image: "/api/placeholder/300/300",
    stock: 22,
    category: "Purification",
    slug: "masque-purifiant-argile",
  },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["Tous", "Hydratation", "Anti-âge", "Purification"];

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "Tous" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nos Produits Bio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez notre gamme complète de crèmes et soins naturels, formulés
            avec les meilleurs ingrédients biologiques.
          </p>
        </div>

        {/* Filtres */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Recherche */}
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-700 hover:bg-emerald-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grille des produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image du produit */}
              <div className="aspect-square bg-gray-200 relative">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-16 h-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Badge promotion */}
                {product.comparePrice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Promo
                  </div>
                )}

                {/* Badge stock faible */}
                {product.stock < 10 && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Stock limité
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Prix */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    €{product.price}
                  </span>
                  {product.comparePrice && (
                    <span className="text-lg text-gray-500 line-through">
                      €{product.comparePrice}
                    </span>
                  )}
                </div>

                {/* Stock */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock} unités
                  </span>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      product.stock > 10
                        ? "bg-green-500"
                        : product.stock > 5
                          ? "bg-orange-500"
                          : "bg-red-500"
                    }`}
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                    Ajouter au panier
                  </button>
                  <button
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Voir les détails du produit"
                    aria-label="Voir les détails du produit"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun produit */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
          </div>
        )}

        {/* Section informative */}
        <div className="mt-16 bg-emerald-50 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pourquoi choisir nos produits bio ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  100% Naturel
                </h3>
                <p className="text-gray-600 text-sm">
                  Ingrédients certifiés biologiques
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Artisanal</h3>
                <p className="text-gray-600 text-sm">
                  Fabriqué avec soin et passion
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Testé & Approuvé
                </h3>
                <p className="text-gray-600 text-sm">
                  Qualité garantie par nos clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
