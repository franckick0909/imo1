/**
 * Actions Dashboard - Helpers pour les appels API du dashboard
 *
 * Ces fonctions interfacent avec les endpoints API du dashboard
 * et sont utilisées par le DashboardStore pour les mutations.
 */

import {
  DashboardOrder,
  DashboardStats,
  FavoriteProduct,
  RecentActivity,
  UserAccount,
  UserProfile,
  UserSession,
} from "@/stores/dashboard-store";

// Types d'erreur
export class DashboardError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "DashboardError";
  }
}

// Helper pour les appels API
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erreur réseau" }));
    throw new DashboardError(error.error || "Erreur inconnue", response.status);
  }

  return response.json();
}

// === STATISTIQUES ===

/**
 * Récupère les statistiques utilisateur
 */
export async function fetchUserStats(): Promise<DashboardStats> {
  return apiCall<DashboardStats>("/api/dashboard/stats");
}

// === FAVORIS ===

/**
 * Récupère la liste des favoris
 */
export async function fetchFavorites(): Promise<FavoriteProduct[]> {
  return apiCall<FavoriteProduct[]>("/api/dashboard/favorites");
}

/**
 * Ajoute un produit aux favoris
 */
export async function addToFavorites(
  productId: string
): Promise<FavoriteProduct> {
  return apiCall<FavoriteProduct>("/api/dashboard/favorites", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

/**
 * Supprime un produit des favoris
 */
export async function removeFromFavorites(
  productId: string
): Promise<{ message: string; productId: string }> {
  return apiCall<{ message: string; productId: string }>(
    `/api/dashboard/favorites/${productId}`,
    {
      method: "DELETE",
    }
  );
}

/**
 * Vide tous les favoris
 */
export async function clearAllFavorites(): Promise<{ message: string }> {
  return apiCall<{ message: string }>("/api/dashboard/favorites", {
    method: "DELETE",
  });
}

// === COMMANDES ===

/**
 * Récupère les commandes utilisateur
 */
export async function fetchUserOrders(): Promise<DashboardOrder[]> {
  return apiCall<DashboardOrder[]>("/api/dashboard/orders");
}

// === PROFIL ===

/**
 * Récupère le profil utilisateur
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  return apiCall<UserProfile>("/api/dashboard/profile");
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  return apiCall<UserProfile>("/api/auth/update-profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * Ajoute un mot de passe au compte
 */
export async function addUserPassword(
  password: string
): Promise<{ message: string }> {
  return apiCall<{ message: string }>("/api/auth/add-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// === SESSIONS ===

/**
 * Récupère les sessions utilisateur
 */
export async function fetchUserSessions(): Promise<UserSession[]> {
  return apiCall<UserSession[]>("/api/auth/list-sessions");
}

/**
 * Révoque une session spécifique
 */
export async function revokeUserSession(
  sessionId: string
): Promise<{ message: string }> {
  return apiCall<{ message: string }>("/api/auth/revoke-session", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

/**
 * Révoque toutes les sessions
 */
export async function revokeAllUserSessions(): Promise<{ message: string }> {
  return apiCall<{ message: string }>("/api/auth/revoke-all-sessions", {
    method: "POST",
  });
}

// === COMPTES ===

/**
 * Récupère les comptes liés
 */
export async function fetchUserAccounts(): Promise<UserAccount[]> {
  return apiCall<UserAccount[]>("/api/auth/list-accounts");
}

// === ACTIVITÉ ===

/**
 * Récupère l'activité récente
 */
export async function fetchRecentActivity(): Promise<RecentActivity[]> {
  return apiCall<RecentActivity[]>("/api/dashboard/activity");
}

// === UTILITAIRES ===

/**
 * Vérifie si une erreur est une DashboardError
 */
export function isDashboardError(error: unknown): error is DashboardError {
  return error instanceof DashboardError;
}

/**
 * Formatte une erreur pour l'affichage
 */
export function formatDashboardError(error: unknown): string {
  if (isDashboardError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue s'est produite";
}

/**
 * Retry helper pour les appels API avec backoff exponentiel
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Ne pas retry sur les erreurs d'autorisation
      if (isDashboardError(error) && error.status === 401) {
        throw error;
      }

      // Attendre avant de retry
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, baseDelay * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError!;
}
