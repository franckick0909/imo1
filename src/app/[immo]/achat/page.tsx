
export default function AchatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🏠 Achat Immobilier
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Trouvez la propriété de vos rêves avec notre sélection exclusive
              de biens à vendre.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Carte 1 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Appartements
                </h3>
                <p className="text-gray-600 mb-4">
                  Des appartements modernes dans les meilleurs quartiers de la
                  ville.
                </p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200">
                  Voir les offres
                </button>
              </div>

              {/* Carte 2 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Maisons
                </h3>
                <p className="text-gray-600 mb-4">
                  Maisons familiales avec jardin, parfaites pour une nouvelle
                  vie.
                </p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200">
                  Voir les offres
                </button>
              </div>

              {/* Carte 3 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Terrains
                </h3>
                <p className="text-gray-600 mb-4">
                  Terrains constructibles pour réaliser votre projet immobilier.
                </p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200">
                  Voir les offres
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
