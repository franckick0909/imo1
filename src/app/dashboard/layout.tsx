"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Edit,
  Heart,
  Home,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sidebarItems = [
  {
    name: "Accueil",
    href: "/dashboard",
    icon: Home,
    exact: true,
  },
  {
    name: "Mon Profil",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Modifier Profil",
    href: "/dashboard/profile/edit",
    icon: Edit,
  },
  {
    name: "Mes Commandes",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    name: "Mes Favoris",
    href: "/dashboard/favorites",
    icon: Heart,
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActiveRoute = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
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

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-emerald-600">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {session.user.name || "Utilisateur"}
            </h2>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
          </div>
        </div>

        {/* Close button - mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          title="Fermer le menu"
          aria-label="Fermer le menu de navigation"
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href, item.exact);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-emerald-600" : ""}`}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Se déconnecter</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          title="Ouvrir le menu"
          aria-label="Ouvrir le menu de navigation"
          className="p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : "-100%",
        }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl"
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </motion.div>

      {/* Desktop Sidebar - Always visible */}
      <div className="hidden lg:block fixed inset-0 top-0 left-0 z-10 w-72 bg-white border-r border-gray-200 pt-20">
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search button */}
              <button
                title="Rechercher"
                aria-label="Rechercher"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button
                title="Notifications"
                aria-label="Voir les notifications"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
