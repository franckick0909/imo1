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
        { label: "Acheter", href: "/achat" },
        { label: "Louer", href: "/location" },
        { label: "Vendre", href: "/vente" },
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
        { label: "Guides", href: "/guides" },
        { label: "Blog", href: "/blog" },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link
                href="/"
                className="text-5xl font-pinyon text-white mb-4 block"
              >
                Bio<span className="text-emerald-400">Crème</span>
              </Link>
              <p className="text-zinc-300 text-sm leading-relaxed mb-6 max-w-md">
                Votre partenaire de confiance pour tous vos projets immobiliers.
                Nous vous accompagnons dans l&apos;achat, la vente et la location de
                biens d&apos;exception avec un service personnalisé.
              </p>

              {/* Informations de contact */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-zinc-300">
                  <MapPin className="w-4 h-4 mr-3 text-emerald-400" />
                  123 Avenue des Champs, 75008 Paris
                </div>
                <div className="flex items-center text-sm text-zinc-300">
                  <Phone className="w-4 h-4 mr-3 text-emerald-400" />
                  +33 1 23 45 67 89
                </div>
                <div className="flex items-center text-sm text-zinc-300">
                  <Mail className="w-4 h-4 mr-3 text-emerald-400" />
                  contact@immo1.fr
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
            >
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-zinc-300 text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Réseaux sociaux */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-zinc-800"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h4 className="text-white font-medium mb-3">Suivez-nous</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 hover:bg-emerald-200 hover:text-zinc-900 transition-all duration-200"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Newsletter */}
            <div className="text-center sm:text-right">
              <h4 className="text-white font-medium mb-3">Newsletter</h4>
              <div className="flex max-w-lg w-full">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-200"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-zinc-400">
            <div className="mb-2 sm:mb-0">
              <p className="flex items-center">
                © {currentYear} Immo1. Tous droits réservés.
                <span className="mx-2">•</span>
                Fait avec <Heart className="w-3 h-3 mx-1 text-red-400" /> à
                Paris
              </p>
            </div>
            <div className="flex space-x-6">
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
