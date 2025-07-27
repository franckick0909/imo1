"use client";

import { signOut } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronLeft, ChevronRight, LogOut, Search, Home, User, Edit, Package, Heart, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// Types pour les données du dashboard
interface DashboardUser {
  id: string;
  email: string;
  name?: string;
  profileComplete?: boolean;
  createdAt: string;
  role: string;
  stripeCustomerId?: string;
}

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  favoriteProducts: number;
  accountAge: number;
  completedOrders: number;
  pendingOrders: number;
  lastOrderDate?: string;
  avgOrderValue?: number;
  loyaltyPoints?: number;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const sidebarItems: SidebarItem[] = [
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

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  user: DashboardUser;
  stats: DashboardStats;
}

export default function DashboardClientLayout({
  children,
  user,
  stats,
}: DashboardClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-emerald-600">
              {user.name?.charAt(0) || user.email?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {user.name || "Utilisateur"}
            </h2>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold text-emerald-600">
                {stats.totalOrders || 0}
              </div>
              <div className="text-emerald-700">Commandes</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-emerald-600">
                {stats.loyaltyPoints || 0}
              </div>
              <div className="text-emerald-700">Points</div>
            </div>
          </div>
        </div>
      )}

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
          type="button"
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
      {/* Sidebar Toggle Button - Languette */}
      <motion.button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-label={
          sidebarOpen
            ? "Fermer le menu de navigation"
            : "Ouvrir le menu de navigation"
        }
        className="lg:hidden fixed top-32 z-50 bg-emerald-50/50 shadow-lg border border-emerald-300 rounded-r-lg p-2 transition-all duration-300 hover:bg-gray-50"
        animate={{
          left: sidebarOpen ? "288px" : "0px", // 72*4 = 288px (width du sidebar)
        }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        )}
      </motion.button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/30 bg-opacity-50"
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
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl"
      >
        <div className="flex flex-col h-full pt-20">
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
                type="button"
                title="Rechercher"
                aria-label="Rechercher"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button
                type="button"
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
