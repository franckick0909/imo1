"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";

interface HeaderProps {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

export default function Header({ onSignInClick, onSignUpClick }: HeaderProps) {
  const { data: session, isPending } = useSession();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center mr-2">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Immo1</h1>
            </Link>
          </div>

          {/* Navigation centrale */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition duration-200"
            >
              Accueil
            </Link>
            <Link
              href="/annonces"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition duration-200"
            >
              Annonces
            </Link>
            <Link
              href="/services"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition duration-200"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition duration-200"
            >
              Contact
            </Link>
          </nav>

          {/* Boutons d'authentification */}
          <div className="flex items-center space-x-4">
            {isPending ? (
              <div className="text-sm text-gray-500">Chargement...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">
                  {session.user.name || session.user.email}
                </span>
                <Link
                  href="/dashboard"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onSignInClick}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition duration-200"
                >
                  Se connecter
                </button>
                <button
                  onClick={onSignUpClick}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 text-sm font-medium"
                >
                  S&apos;inscrire
                </button>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              title="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
