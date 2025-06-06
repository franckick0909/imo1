
export default function LocationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🏠 Location Immobilier
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Trouvez votre location idéale ou mettez votre bien en location en
              toute sérénité.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Locataires */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  🔍 Je cherche à louer
                </h3>
                <p className="text-gray-600 mb-6">
                  Découvrez notre sélection de biens en location, vérifiés et de
                  qualité.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Photos HD et visites virtuelles
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Dossiers pré-validés
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Réponse sous 24h
                  </div>
                </div>

                <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium w-full">
                  Rechercher un logement
                </button>
              </div>

              {/* Propriétaires */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  🏡 Je veux mettre en location
                </h3>
                <p className="text-gray-600 mb-6">
                  Maximisez vos revenus locatifs avec notre accompagnement
                  expert.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Estimation de loyer gratuite
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Sélection des locataires
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Gestion locative complète
                  </div>
                </div>

                <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-200 font-medium w-full">
                  Estimer mon loyer
                </button>
              </div>
            </div>

            {/* Types de biens */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Types de locations disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🏢</div>
                  <h4 className="font-semibold text-gray-900">Appartements</h4>
                  <p className="text-gray-600 text-sm">Studios à 5 pièces</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🏘️</div>
                  <h4 className="font-semibold text-gray-900">Maisons</h4>
                  <p className="text-gray-600 text-sm">Avec ou sans jardin</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🏢</div>
                  <h4 className="font-semibold text-gray-900">Bureaux</h4>
                  <p className="text-gray-600 text-sm">
                    Espaces professionnels
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🏭</div>
                  <h4 className="font-semibold text-gray-900">Commerces</h4>
                  <p className="text-gray-600 text-sm">Locaux commerciaux</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
