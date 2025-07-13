import { executeOptimisticUpdate } from "@/utils/optimistic-updates";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Types pour les données du dashboard
export interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  favoriteProducts: number;
  loyaltyPoints: number;
  lastUpdated?: Date;
}

export interface FavoriteProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  inStock: boolean;
  slug: string;
  categoryId: string;
}

export interface DashboardOrder {
  id: string;
  date: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  statusText: string;
  total: number;
  items: number;
  trackingNumber: string | null;
  products: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
}

export interface UserAccount {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  emailVerified: boolean;
  // Adresse de livraison
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  // Adresse de facturation
  billingStreet: string | null;
  billingCity: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  useSameAddress: boolean;
  // Préférences beauté
  skinType: string | null;
  skinConcerns: string | null;
  // Préférences de notification
  newsletter: boolean;
  promotions: boolean;
}

export interface RecentActivity {
  id: string;
  type: "order" | "points" | "recommendation" | "favorite";
  message: string;
  time: string;
  icon: string;
  link?: string;
}

// État du store
interface DashboardState {
  // Données
  stats: DashboardStats | null;
  favorites: FavoriteProduct[];
  orders: DashboardOrder[];
  profile: UserProfile | null;
  accounts: UserAccount[];
  sessions: UserSession[];
  recentActivity: RecentActivity[];

  // États de chargement
  isLoadingStats: boolean;
  isLoadingFavorites: boolean;
  isLoadingOrders: boolean;
  isLoadingProfile: boolean;
  isLoadingAccounts: boolean;
  isLoadingSessions: boolean;
  isLoadingActivity: boolean;

  // Cache timestamps
  lastStatsUpdate: Date | null;
  lastFavoritesUpdate: Date | null;
  lastOrdersUpdate: Date | null;
  lastProfileUpdate: Date | null;
  lastAccountsUpdate: Date | null;
  lastSessionsUpdate: Date | null;
  lastActivityUpdate: Date | null;

  // Actions
  loadStats: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadProfile: () => Promise<void>;
  loadAccounts: () => Promise<void>;
  loadSessions: () => Promise<void>;
  loadRecentActivity: () => Promise<void>;
  loadAll: () => Promise<void>;

  // Mutations favoris (avec optimistic updates)
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  clearFavorites: () => Promise<void>;

  // Mutations profil (avec optimistic updates)
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addPassword: (password: string) => Promise<void>;

  // Mutations sessions (avec optimistic updates)
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;

  // Utilitaires
  invalidateCache: (key?: keyof DashboardState) => void;
  reset: () => void;
}

// Constantes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helpers
const isStale = (lastUpdate: Date | null): boolean => {
  if (!lastUpdate) return true;
  return Date.now() - lastUpdate.getTime() > CACHE_DURATION;
};

const handleError = (error: unknown, context: string) => {
  console.error(`[DashboardStore] ${context}:`, error);
  // Ici on pourrait ajouter un toast ou une notification d'erreur
};

// Helper pour créer un favori temporaire pour l'optimistic update
const createTempFavorite = (productId: string): FavoriteProduct => ({
  id: productId,
  name: "Chargement...",
  brand: "",
  price: 0,
  rating: 0,
  reviews: 0,
  image: "",
  inStock: true,
  slug: "",
  categoryId: "",
});

// Store principal
export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // État initial
      stats: null,
      favorites: [],
      orders: [],
      profile: null,
      accounts: [],
      sessions: [],
      recentActivity: [],

      // Loading states
      isLoadingStats: false,
      isLoadingFavorites: false,
      isLoadingOrders: false,
      isLoadingProfile: false,
      isLoadingAccounts: false,
      isLoadingSessions: false,
      isLoadingActivity: false,

      // Cache timestamps
      lastStatsUpdate: null,
      lastFavoritesUpdate: null,
      lastOrdersUpdate: null,
      lastProfileUpdate: null,
      lastAccountsUpdate: null,
      lastSessionsUpdate: null,
      lastActivityUpdate: null,

      // Actions de chargement
      loadStats: async () => {
        const state = get();
        if (!isStale(state.lastStatsUpdate) && state.stats) return;

        set({ isLoadingStats: true });
        try {
          const response = await fetch("/api/dashboard/stats");
          if (!response.ok) throw new Error("Failed to load stats");

          const stats = await response.json();
          set({
            stats,
            lastStatsUpdate: new Date(),
            isLoadingStats: false,
          });
        } catch (error) {
          handleError(error, "loadStats");
          set({ isLoadingStats: false });
        }
      },

      loadFavorites: async () => {
        const state = get();
        if (!isStale(state.lastFavoritesUpdate) && state.favorites.length > 0)
          return;

        set({ isLoadingFavorites: true });
        try {
          const response = await fetch("/api/dashboard/favorites");
          if (!response.ok) throw new Error("Failed to load favorites");

          const favorites = await response.json();

          // Déduplication basée sur l'ID pour éviter les doublons
          const uniqueFavorites = favorites.filter(
            (fav: FavoriteProduct, index: number, self: FavoriteProduct[]) =>
              index === self.findIndex((f) => f.id === fav.id)
          );

          set({
            favorites: uniqueFavorites,
            lastFavoritesUpdate: new Date(),
            isLoadingFavorites: false,
          });
        } catch (error) {
          handleError(error, "loadFavorites");
          set({ isLoadingFavorites: false });
        }
      },

      loadOrders: async () => {
        const state = get();
        if (!isStale(state.lastOrdersUpdate) && state.orders.length > 0) return;

        set({ isLoadingOrders: true });
        try {
          const response = await fetch("/api/dashboard/orders");
          if (!response.ok) throw new Error("Failed to load orders");

          const orders = await response.json();
          set({
            orders,
            lastOrdersUpdate: new Date(),
            isLoadingOrders: false,
          });
        } catch (error) {
          handleError(error, "loadOrders");
          set({ isLoadingOrders: false });
        }
      },

      loadProfile: async () => {
        const state = get();
        if (!isStale(state.lastProfileUpdate) && state.profile) return;

        set({ isLoadingProfile: true });
        try {
          const response = await fetch("/api/auth/get-profile-complete");
          if (!response.ok) throw new Error("Failed to load profile");

          const profile = await response.json();
          set({
            profile,
            lastProfileUpdate: new Date(),
            isLoadingProfile: false,
          });
        } catch (error) {
          handleError(error, "loadProfile");
          set({ isLoadingProfile: false });
        }
      },

      loadAccounts: async () => {
        const state = get();
        if (!isStale(state.lastAccountsUpdate) && state.accounts.length > 0)
          return;

        set({ isLoadingAccounts: true });
        try {
          const response = await fetch("/api/auth/list-accounts");
          if (!response.ok) throw new Error("Failed to load accounts");

          const accounts = await response.json();
          set({
            accounts,
            lastAccountsUpdate: new Date(),
            isLoadingAccounts: false,
          });
        } catch (error) {
          handleError(error, "loadAccounts");
          set({ isLoadingAccounts: false });
        }
      },

      loadSessions: async () => {
        const state = get();
        if (!isStale(state.lastSessionsUpdate) && state.sessions.length > 0)
          return;

        set({ isLoadingSessions: true });
        try {
          const response = await fetch("/api/auth/list-sessions");
          if (!response.ok) throw new Error("Failed to load sessions");

          const sessions = await response.json();
          set({
            sessions,
            lastSessionsUpdate: new Date(),
            isLoadingSessions: false,
          });
        } catch (error) {
          handleError(error, "loadSessions");
          set({ isLoadingSessions: false });
        }
      },

      loadRecentActivity: async () => {
        const state = get();
        if (
          !isStale(state.lastActivityUpdate) &&
          state.recentActivity.length > 0
        )
          return;

        set({ isLoadingActivity: true });
        try {
          const response = await fetch("/api/dashboard/activity");
          if (!response.ok) throw new Error("Failed to load activity");

          const recentActivity = await response.json();
          set({
            recentActivity,
            lastActivityUpdate: new Date(),
            isLoadingActivity: false,
          });
        } catch (error) {
          handleError(error, "loadRecentActivity");
          set({ isLoadingActivity: false });
        }
      },

      loadAll: async () => {
        const actions = get();

        // Grouper les mises à jour pour éviter les re-renders multiples
        const loadCriticalData = async () => {
          await Promise.all([actions.loadStats(), actions.loadProfile()]);
        };

        const loadSecondaryData = async () => {
          await Promise.all([
            actions.loadFavorites(),
            actions.loadOrders(),
            actions.loadRecentActivity(),
          ]);
        };

        const loadAccountData = async () => {
          await Promise.all([actions.loadAccounts(), actions.loadSessions()]);
        };

        // Charger en 3 phases pour éviter la surcharge
        await loadCriticalData();
        await loadSecondaryData();
        await loadAccountData();
      },

      // Mutations favoris avec optimistic updates
      addToFavorites: async (productId: string) => {
        const tempFavorite = createTempFavorite(productId);

        return executeOptimisticUpdate(set, {
          actionName: "addToFavorites",
          optimisticUpdate: (state) => {
            // Vérifier si le produit n'est pas déjà dans les favoris
            const existingFavorite = state.favorites.find(
              (f) => f.id === productId
            );
            if (existingFavorite) {
              return state; // Ne pas ajouter si déjà présent
            }

            return {
              ...state,
              favorites: [...state.favorites, tempFavorite],
              stats: state.stats
                ? {
                    ...state.stats,
                    favoriteProducts: state.stats.favoriteProducts + 1,
                  }
                : null,
            };
          },
          rollbackUpdate: (state) => ({
            ...state,
            favorites: state.favorites.filter((f) => f.id !== productId),
            stats: state.stats
              ? {
                  ...state.stats,
                  favoriteProducts: Math.max(
                    0,
                    state.stats.favoriteProducts - 1
                  ),
                }
              : null,
          }),
          apiCall: async () => {
            const response = await fetch("/api/dashboard/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            });
            if (!response.ok) throw new Error("Failed to add to favorites");
            return response.json();
          },
          successUpdate: (state, newFavorite) => ({
            ...state,
            favorites: state.favorites.map((f) =>
              f.id === productId ? (newFavorite as FavoriteProduct) : f
            ),
          }),
        });
      },

      removeFromFavorites: async (productId: string) => {
        const favoriteToRemove = get().favorites.find(
          (f) => f.id === productId
        );

        return executeOptimisticUpdate(set, {
          actionName: "removeFromFavorites",
          optimisticUpdate: (state) => ({
            ...state,
            favorites: state.favorites.filter((f) => f.id !== productId),
            stats: state.stats
              ? {
                  ...state.stats,
                  favoriteProducts: Math.max(
                    0,
                    state.stats.favoriteProducts - 1
                  ),
                }
              : null,
          }),
          rollbackUpdate: (state) => ({
            ...state,
            favorites: favoriteToRemove
              ? [...state.favorites, favoriteToRemove]
              : state.favorites,
            stats: state.stats
              ? {
                  ...state.stats,
                  favoriteProducts: state.stats.favoriteProducts + 1,
                }
              : null,
          }),
          apiCall: async () => {
            const response = await fetch(
              `/api/dashboard/favorites/${productId}`,
              {
                method: "DELETE",
              }
            );
            if (!response.ok)
              throw new Error("Failed to remove from favorites");
            return response.json();
          },
        });
      },

      clearFavorites: async () => {
        const favoritesToRestore = get().favorites;

        return executeOptimisticUpdate(set, {
          actionName: "clearFavorites",
          optimisticUpdate: (state) => ({
            ...state,
            favorites: [],
            stats: state.stats
              ? {
                  ...state.stats,
                  favoriteProducts: 0,
                }
              : null,
          }),
          rollbackUpdate: (state) => ({
            ...state,
            favorites: favoritesToRestore,
            stats: state.stats
              ? {
                  ...state.stats,
                  favoriteProducts: favoritesToRestore.length,
                }
              : null,
          }),
          apiCall: async () => {
            const response = await fetch("/api/dashboard/favorites", {
              method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to clear favorites");
            return response.json();
          },
        });
      },

      // Mutations profil avec optimistic updates
      updateProfile: async (updates: Partial<UserProfile>) => {
        const currentProfile = get().profile;

        return executeOptimisticUpdate(set, {
          actionName: "updateProfile",
          optimisticUpdate: (state) => ({
            ...state,
            profile: state.profile ? { ...state.profile, ...updates } : null,
          }),
          rollbackUpdate: (state) => ({
            ...state,
            profile: currentProfile,
          }),
          apiCall: async () => {
            const response = await fetch("/api/auth/update-profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error("Failed to update profile");
            return response.json();
          },
          successUpdate: (state, updatedProfile) => ({
            ...state,
            profile: updatedProfile as UserProfile,
          }),
        });
      },

      addPassword: async (password: string) => {
        try {
          const response = await fetch("/api/auth/add-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });

          if (!response.ok) throw new Error("Failed to add password");

          // Recharger les comptes pour refléter le changement
          await get().loadAccounts();
        } catch (error) {
          handleError(error, "addPassword");
          throw error;
        }
      },

      // Mutations sessions avec optimistic updates
      revokeSession: async (sessionId: string) => {
        const sessionToRevoke = get().sessions.find((s) => s.id === sessionId);

        return executeOptimisticUpdate(set, {
          actionName: "revokeSession",
          optimisticUpdate: (state) => ({
            ...state,
            sessions: state.sessions.filter((s) => s.id !== sessionId),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            sessions: sessionToRevoke
              ? [...state.sessions, sessionToRevoke]
              : state.sessions,
          }),
          apiCall: async () => {
            const response = await fetch("/api/auth/revoke-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            });
            if (!response.ok) throw new Error("Failed to revoke session");
            return response.json();
          },
        });
      },

      revokeAllSessions: async () => {
        const sessionsToRestore = get().sessions;

        return executeOptimisticUpdate(set, {
          actionName: "revokeAllSessions",
          optimisticUpdate: (state) => ({
            ...state,
            sessions: [],
          }),
          rollbackUpdate: (state) => ({
            ...state,
            sessions: sessionsToRestore,
          }),
          apiCall: async () => {
            const response = await fetch("/api/auth/revoke-all-sessions", {
              method: "POST",
            });
            if (!response.ok) throw new Error("Failed to revoke all sessions");
            return response.json();
          },
        });
      },

      // Utilitaires
      invalidateCache: (key?: keyof DashboardState) => {
        if (key) {
          const updateKey =
            `last${key.charAt(0).toUpperCase() + key.slice(1)}Update` as keyof DashboardState;
          set({ [updateKey]: null });
        } else {
          set({
            lastStatsUpdate: null,
            lastFavoritesUpdate: null,
            lastOrdersUpdate: null,
            lastProfileUpdate: null,
            lastAccountsUpdate: null,
            lastSessionsUpdate: null,
            lastActivityUpdate: null,
          });
        }
      },

      reset: () => {
        set({
          stats: null,
          favorites: [],
          orders: [],
          profile: null,
          accounts: [],
          sessions: [],
          recentActivity: [],
          isLoadingStats: false,
          isLoadingFavorites: false,
          isLoadingOrders: false,
          isLoadingProfile: false,
          isLoadingAccounts: false,
          isLoadingSessions: false,
          isLoadingActivity: false,
          lastStatsUpdate: null,
          lastFavoritesUpdate: null,
          lastOrdersUpdate: null,
          lastProfileUpdate: null,
          lastAccountsUpdate: null,
          lastSessionsUpdate: null,
          lastActivityUpdate: null,
        });
      },
    }),
    {
      name: "dashboard-store",
    }
  )
);

// Hooks utilitaires
export const useStats = () => {
  const { stats, isLoadingStats, loadStats } = useDashboardStore();
  return { stats, isLoadingStats, loadStats };
};

export const useFavorites = () => {
  const {
    favorites,
    isLoadingFavorites,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
  } = useDashboardStore();
  return {
    favorites,
    isLoadingFavorites,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
  };
};

export const useOrders = () => {
  const { orders, isLoadingOrders, loadOrders } = useDashboardStore();
  return { orders, isLoadingOrders, loadOrders };
};

export const useProfile = () => {
  const { profile, isLoadingProfile, loadProfile, updateProfile, addPassword } =
    useDashboardStore();
  return {
    profile,
    isLoadingProfile,
    loadProfile,
    updateProfile,
    addPassword,
  };
};

export const useUserSessions = () => {
  const {
    sessions,
    isLoadingSessions,
    loadSessions,
    revokeSession,
    revokeAllSessions,
  } = useDashboardStore();
  return {
    sessions,
    isLoadingSessions,
    loadSessions,
    revokeSession,
    revokeAllSessions,
  };
};

export const useUserAccounts = () => {
  const { accounts, isLoadingAccounts, loadAccounts } = useDashboardStore();
  return { accounts, isLoadingAccounts, loadAccounts };
};

export const useRecentActivity = () => {
  const { recentActivity, isLoadingActivity, loadRecentActivity } =
    useDashboardStore();
  return { recentActivity, isLoadingActivity, loadRecentActivity };
};
