"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Navigation",
      links: [
        { label: "Accueil", href: "/" },
        { label: "Produits", href: "/products" },
      ],
    },
    {
      title: "Mon Compte",
      links: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Mes Favoris", href: "/dashboard/favorites" },
        { label: "Mes Commandes", href: "/dashboard/orders" },
        { label: "Mon Profil", href: "/dashboard/profile" },
        { label: "Paramètres", href: "/dashboard/settings" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Centre d'aide", href: "/help" },
        { label: "Contact", href: "/contact" },
        { label: "FAQ", href: "/faq" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-zinc-900 text-white">
      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo et description */}
          <div className="sm:col-span-2 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link
                href="/"
                className="text-3xl sm:text-4xl lg:text-5xl font-pinyon text-white mb-4 block"
              >
                Bio<span className="text-emerald-400">Crème</span>
              </Link>
              <p className="text-zinc-300 text-base-responsive leading-relaxed mb-6 max-w-md">
                Votre partenaire de confiance pour tous vos projets immobiliers.
                Nous vous accompagnons dans l&apos;achat, la vente et la
                location de biens d&apos;exception avec un service personnalisé.
              </p>

              {/* Informations de contact */}
              <div className="space-y-3">
                <div className="flex items-start sm:items-center text-sm sm:text-base text-zinc-300">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-3 mt-0.5 sm:mt-0 text-emerald-400 flex-shrink-0" />
                  <span>123 Avenue des Champs, 75008 Paris</span>
                </div>
                <div className="flex items-center text-sm sm:text-base text-zinc-300">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-emerald-400 flex-shrink-0" />
                  <span>+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center text-sm sm:text-base text-zinc-300">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-emerald-400 flex-shrink-0" />
                  <span>contact@immo1.fr</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sections de liens */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="sm:col-span-1"
            >
              <h3 className="text-white font-semibold heading-sm mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-zinc-300 text-sm sm:text-base hover:text-white transition-colors duration-200 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Réseaux sociaux et Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 pt-8 border-t border-zinc-800"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            {/* Réseaux sociaux */}
            <div className="w-full lg:w-auto">
              <h4 className="text-white font-medium heading-sm mb-4">
                Suivez-nous
              </h4>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 hover:bg-emerald-200 hover:text-zinc-900 transition-all duration-200"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Newsletter */}
            <div className="w-full lg:w-auto lg:max-w-md">
              <h4 className="text-white font-medium heading-sm mb-4">
                Newsletter
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700 rounded sm:rounded-none focus:outline-none focus:border-emerald-400 text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 sm:py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-200 rounded sm:rounded-none font-medium text-sm sm:text-base whitespace-nowrap"
                >
                  S&apos;abonner
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Barre de copyright */}
      <div className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-zinc-400">
            <div className="text-center sm:text-left">
              <p className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span>© {currentYear} Immo1. Tous droits réservés.</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  Fait avec <Heart className="w-3 h-3 text-red-400" /> à Paris
                </span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center">
              <Link
                href="/mentions-legales"
                className="hover:text-white transition-colors duration-200"
              >
                Mentions légales
              </Link>
              <Link
                href="/politique-confidentialite"
                className="hover:text-white transition-colors duration-200"
              >
                Confidentialité
              </Link>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors duration-200"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
