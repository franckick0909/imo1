"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "next-view-transitions";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [stats] = useState({
    totalOrders: 12,
    totalSpent: 245.8,
    favoriteProducts: 8,
    loyaltyPoints: 1250,
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-lg text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const quickActions = [
    {
      title: "Parcourir nos produits",
      description: "Découvrir notre collection de soins naturels",
      icon: (
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      href: "/products",
      bgColor: "bg-emerald-500",
    },
    {
      title: "Mes commandes",
      description: "Suivre mes achats et livraisons",
      icon: (
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      href: "/orders",
      bgColor: "bg-blue-500",
    },
    {
      title: "Mes favoris",
      description: "Retrouver mes produits préférés",
      icon: (
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      href: "/favorites",
      bgColor: "bg-red-500",
    },
    {
      title: "Mon profil",
      description: "Gérer mes informations personnelles",
      icon: (
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      href: "/profile",
      bgColor: "bg-purple-500",
    },
  ];

  const recentActivity = [
    {
      type: "order",
      message: "Votre commande #CMD-2024-001 a été expédiée",
      time: "Il y a 2 heures",
      icon: "🚚",
    },
    {
      type: "points",
      message: "Vous avez gagné 50 points de fidélité",
      time: "Il y a 1 jour",
      icon: "🎉",
    },
    {
      type: "recommendation",
      message: "Nouvelle crème anti-âge recommandée pour vous",
      time: "Il y a 2 jours",
      icon: "✨",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
              <span className="text-3xl font-bold text-emerald-600">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
              </span>
            </div>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl">
              <span className="block">Bonjour</span>
              <span className="block text-emerald-600">
                {session.user.name || "Utilisateur"} !
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Bienvenue dans votre espace personnel. Gérez vos commandes,
              découvrez nos nouveautés et prenez soin de votre peau.
            </p>
          </motion.div>

          {/* Bouton vers profil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Link
              href="/profile/edit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition duration-200 shadow-lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Modifier mon profil
            </Link>
          </motion.div>
        </div>

        {/* Statistiques */}
        <div className="mb-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-6"
            >
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Mes Commandes
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-emerald-600">
                    {stats.totalOrders}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">+2 ce mois-ci</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-6"
            >
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Total Dépensé
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    €{stats.totalSpent.toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Économies: €45</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-6"
            >
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-red-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Mes Favoris
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {stats.favoriteProducts}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">3 nouveaux</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-6"
            >
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-yellow-500 rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Points Fidélité
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-yellow-600">
                    {stats.loyaltyPoints}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Niveau Gold</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Actions Rapides
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Accédez rapidement à vos fonctionnalités préférées
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="pt-6"
              >
                <Link href={action.href}>
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer group">
                    <div className="-mt-6">
                      <div>
                        <span
                          className={`inline-flex items-center justify-center p-3 ${action.bgColor} rounded-md shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          {action.icon}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Activité Récente
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Restez informé de vos dernières interactions
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-8">
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-3xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 leading-relaxed font-medium">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-emerald-600 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">Conseil beauté du jour</span>
                <span className="block text-emerald-200">
                  Prenez soin de votre peau naturellement
                </span>
              </h2>
              <p className="mt-4 text-lg text-emerald-100">
                Appliquez votre crème hydratante sur peau légèrement humide pour
                une meilleure absorption et un effet plus durable.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 lg:ml-8 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50 transition duration-200"
                >
                  Découvrir nos conseils
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
