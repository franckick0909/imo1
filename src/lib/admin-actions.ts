import {
  AdminCategory,
  AdminLog,
  AdminOrder,
  AdminProduct,
  AdminStats,
  AdminUser,
  OrdersFilters,
  OrdersPagination,
  ProductsFilters,
  ProductsPagination,
  UsersFilters,
  UsersPagination,
} from "@/stores/admin-store";

/**
 * Classe d'erreur personnalisée pour les actions admin
 */
export class AdminActionError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AdminActionError";
  }
}

/**
 * Récupère les statistiques admin
 */
export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch("/api/admin/stats", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors du chargement des statistiques"
    );
  }

  return await response.json();
}

/**
 * Récupère les utilisateurs avec pagination et filtres
 */
export async function getAdminUsers(
  pagination: UsersPagination,
  filters: UsersFilters
): Promise<{
  users: AdminUser[];
  total: number;
  totalPages: number;
}> {
  const searchParams = new URLSearchParams();

  // Pagination
  searchParams.append("page", pagination.page.toString());
  searchParams.append("limit", pagination.limit.toString());

  // Filtres
  if (filters.search) searchParams.append("search", filters.search);
  if (filters.role) searchParams.append("role", filters.role);
  if (filters.banned !== undefined)
    searchParams.append("banned", filters.banned.toString());
  if (filters.emailVerified !== undefined)
    searchParams.append("emailVerified", filters.emailVerified.toString());

  // Tri
  if (filters.sortBy) searchParams.append("sortBy", filters.sortBy);
  if (filters.sortOrder) searchParams.append("sortOrder", filters.sortOrder);

  const response = await fetch(`/api/admin/users?${searchParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors du chargement des utilisateurs"
    );
  }

  return await response.json();
}

/**
 * Crée un nouvel utilisateur
 */
export async function createAdminUser(userData: {
  name?: string;
  email: string;
  password?: string;
  role?: string | null;
  emailVerified?: boolean;
}): Promise<AdminUser> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors de la création de l'utilisateur"
    );
  }

  return await response.json();
}

/**
 * Met à jour un utilisateur
 */
export async function updateAdminUser(
  userId: string,
  userData: Partial<AdminUser>
): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors de la mise à jour de l'utilisateur"
    );
  }

  return await response.json();
}

/**
 * Supprime un utilisateur
 */
export async function deleteAdminUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors de la suppression de l'utilisateur"
    );
  }
}

/**
 * Bannit un utilisateur
 */
export async function banAdminUser(
  userId: string,
  reason: string,
  expiresAt?: Date
): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${userId}/ban`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason,
      expiresAt: expiresAt?.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors du bannissement de l'utilisateur"
    );
  }

  return await response.json();
}

/**
 * Débannit un utilisateur
 */
export async function unbanAdminUser(userId: string): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${userId}/unban`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors du débannissement de l'utilisateur"
    );
  }

  return await response.json();
}

/**
 * Change le rôle d'un utilisateur
 */
export async function changeUserRole(
  userId: string,
  role: string | null
): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${userId}/role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors du changement de rôle"
    );
  }

  return await response.json();
}

/**
 * Récupère les commandes admin avec pagination et filtres
 */
export async function getAdminOrders(
  pagination: OrdersPagination,
  filters: OrdersFilters
): Promise<{
  orders: AdminOrder[];
  total: number;
  totalPages: number;
}> {
  const searchParams = new URLSearchParams();

  // Pagination
  searchParams.append("page", pagination.page.toString());
  searchParams.append("limit", pagination.limit.toString());

  // Filtres
  if (filters.search) searchParams.append("search", filters.search);
  if (filters.status) searchParams.append("status", filters.status);
  if (filters.paymentStatus)
    searchParams.append("paymentStatus", filters.paymentStatus);

  // Tri
  if (filters.sortBy) searchParams.append("sortBy", filters.sortBy);
  if (filters.sortOrder) searchParams.append("sortOrder", filters.sortOrder);

  const response = await fetch(`/api/admin/orders?${searchParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors du chargement des commandes"
    );
  }

  return await response.json();
}

/**
 * Met à jour une commande
 */
export async function updateAdminOrder(
  orderId: string,
  updates: {
    status?: string;
    paymentStatus?: string;
    trackingNumber?: string;
  }
): Promise<AdminOrder> {
  const response = await fetch("/api/admin/orders", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      ...updates,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors de la mise à jour de la commande"
    );
  }

  return await response.json();
}

/**
 * Récupère les logs d'activité admin
 */
export async function getAdminLogs(
  page: number = 1,
  limit: number = 20,
  filters: {
    level?: string;
    action?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}
): Promise<{
  logs: AdminLog[];
  total: number;
  totalPages: number;
}> {
  const searchParams = new URLSearchParams();

  searchParams.append("page", page.toString());
  searchParams.append("limit", limit.toString());

  if (filters.level) searchParams.append("level", filters.level);
  if (filters.action) searchParams.append("action", filters.action);
  if (filters.sortBy) searchParams.append("sortBy", filters.sortBy);
  if (filters.sortOrder) searchParams.append("sortOrder", filters.sortOrder);

  const response = await fetch(`/api/admin/logs?${searchParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors du chargement des logs"
    );
  }

  return await response.json();
}

/**
 * Crée un nouveau log d'activité
 */
export async function createAdminLog(logData: {
  action: string;
  level: "INFO" | "WARNING" | "ERROR";
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<AdminLog> {
  const response = await fetch("/api/admin/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(logData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors de la création du log"
    );
  }

  return await response.json();
}

/**
 * Récupère les produits admin avec pagination et filtres
 */
export async function getAdminProducts(
  pagination: ProductsPagination,
  filters: ProductsFilters
): Promise<{
  products: AdminProduct[];
  total: number;
  totalPages: number;
}> {
  const searchParams = new URLSearchParams();

  // Pagination
  searchParams.append("page", pagination.page.toString());
  searchParams.append("limit", pagination.limit.toString());

  // Filtres
  if (filters.search) searchParams.append("search", filters.search);
  if (filters.categoryId) searchParams.append("categoryId", filters.categoryId);
  if (filters.isActive !== undefined)
    searchParams.append("isActive", filters.isActive.toString());
  if (filters.isFeatured !== undefined)
    searchParams.append("isFeatured", filters.isFeatured.toString());
  if (filters.lowStock !== undefined)
    searchParams.append("lowStock", filters.lowStock.toString());

  // Tri
  if (filters.sortBy) searchParams.append("sortBy", filters.sortBy);
  if (filters.sortOrder) searchParams.append("sortOrder", filters.sortOrder);

  const response = await fetch(`/api/admin/products?${searchParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors du chargement des produits"
    );
  }

  return await response.json();
}

/**
 * Récupère les catégories admin
 */
export async function getAdminCategories(): Promise<AdminCategory[]> {
  const response = await fetch("/api/admin/categories", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AdminActionError(
      error.error || "Erreur lors du chargement des catégories"
    );
  }

  return await response.json();
}

/**
 * Utilitaire pour retry automatique avec backoff exponentiel
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries - 1) {
        throw lastError;
      }

      // Attendre avant de retry (backoff exponentiel)
      await new Promise((resolve) =>
        setTimeout(resolve, initialDelay * Math.pow(2, i))
      );
    }
  }

  throw lastError!;
}
