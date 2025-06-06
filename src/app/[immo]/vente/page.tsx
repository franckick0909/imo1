
export default function VentePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            💰 Vente Immobilier
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Vendez votre bien immobilier rapidement et au meilleur prix avec
              nos experts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Section Estimation */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  📊 Estimation Gratuite
                </h3>
                <p className="text-gray-600 mb-4">
                  Obtenez une estimation précise de votre bien en quelques
                  minutes.
                </p>
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-200 font-medium">
                  Estimer mon bien
                </button>
              </div>

              {/* Section Services */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  🏆 Services Premium
                </h3>
                <p className="text-gray-600 mb-4">
                  Accompagnement personnalisé de A à Z pour votre vente.
                </p>
                <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-200 font-medium">
                  Découvrir nos services
                </button>
              </div>
            </div>

            {/* Avantages */}
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Pourquoi nous choisir ?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Vente Rapide
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Vente moyenne en 45 jours
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💎</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Meilleur Prix
                  </h4>
                  <p className="text-gray-600 text-sm">
                    +15% par rapport au marché
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    0% Commission
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Frais d&apos;agence offerts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
