import { executeOptimisticUpdate } from "@/utils/optimistic-updates";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Types pour les données admin
export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
  newOrdersToday: number;
  activeUsers: number;
  lowStockProducts: number;
  lastUpdated?: Date;
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  image: string | null;
  phone: string | null;
  // Statistiques utilisateur
  ordersCount?: number;
  totalSpent?: number;
  lastLogin?: Date;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  ingredients: string | null;
  usage: string | null;
  benefits: string | null;
  price: number;
  comparePrice: number | null;
  sku: string | null;
  barcode: string | null;
  stock: number;
  lowStockThreshold: number;
  trackStock: boolean;
  weight: number | null;
  dimensions: string | null;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }>;
}

export interface AdminCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productsCount?: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  userId: string | null;
  customerEmail: string;
  customerName: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export interface AdminLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: Date;
  ip: string | null;
  userAgent: string | null;
}

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Filtres et recherche
export interface UsersFilters {
  search?: string;
  role?: string;
  banned?: boolean;
  emailVerified?: boolean;
  sortBy?: "name" | "email" | "createdAt" | "lastLogin";
  sortOrder?: "asc" | "desc";
}

export interface ProductsFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  lowStock?: boolean;
  sortBy?: "name" | "price" | "stock" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface OrdersFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "orderNumber" | "createdAt" | "totalAmount";
  sortOrder?: "asc" | "desc";
}

// État du store
interface AdminState {
  // Données
  stats: AdminStats | null;
  users: AdminUser[];
  products: AdminProduct[];
  categories: AdminCategory[];
  orders: AdminOrder[];
  logs: AdminLog[];

  // Pagination
  usersPagination: UsersPagination;
  productsPagination: ProductsPagination;
  ordersPagination: OrdersPagination;

  // Filtres
  usersFilters: UsersFilters;
  productsFilters: ProductsFilters;
  ordersFilters: OrdersFilters;

  // États de chargement
  isLoadingStats: boolean;
  isLoadingUsers: boolean;
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  isLoadingOrders: boolean;
  isLoadingLogs: boolean;

  // États des actions
  isCreatingUser: boolean;
  isUpdatingUser: boolean;
  isDeletingUser: boolean;
  isCreatingProduct: boolean;
  isUpdatingProduct: boolean;
  isDeletingProduct: boolean;
  isCreatingCategory: boolean;
  isUpdatingCategory: boolean;
  isDeletingCategory: boolean;
  isUpdatingOrder: boolean;

  // Cache timestamps
  lastStatsUpdate: Date | null;
  lastUsersUpdate: Date | null;
  lastProductsUpdate: Date | null;
  lastCategoriesUpdate: Date | null;
  lastOrdersUpdate: Date | null;
  lastLogsUpdate: Date | null;

  // Actions de chargement
  loadStats: () => Promise<void>;
  loadUsers: (page?: number, filters?: UsersFilters) => Promise<void>;
  loadProducts: (page?: number, filters?: ProductsFilters) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadOrders: (page?: number, filters?: OrdersFilters) => Promise<void>;
  loadLogs: (page?: number) => Promise<void>;
  loadAll: () => Promise<void>;

  // Actions utilisateurs
  createUser: (userData: Partial<AdminUser>) => Promise<AdminUser>;
  updateUser: (
    userId: string,
    updates: Partial<AdminUser>
  ) => Promise<AdminUser>;
  deleteUser: (userId: string) => Promise<void>;
  banUser: (userId: string, reason: string, expiresAt?: Date) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  setUserRole: (userId: string, role: string) => Promise<void>;

  // Actions produits
  createProduct: (productData: Partial<AdminProduct>) => Promise<AdminProduct>;
  updateProduct: (
    productId: string,
    updates: Partial<AdminProduct>
  ) => Promise<AdminProduct>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductActive: (productId: string) => Promise<void>;
  toggleProductFeatured: (productId: string) => Promise<void>;
  updateProductStock: (productId: string, stock: number) => Promise<void>;

  // Actions catégories
  createCategory: (
    categoryData: Partial<AdminCategory>
  ) => Promise<AdminCategory>;
  updateCategory: (
    categoryId: string,
    updates: Partial<AdminCategory>
  ) => Promise<AdminCategory>;
  deleteCategory: (categoryId: string) => Promise<void>;
  toggleCategoryActive: (categoryId: string) => Promise<void>;

  // Actions commandes
  updateOrderStatus: (
    orderId: string,
    status: AdminOrder["status"]
  ) => Promise<void>;
  updatePaymentStatus: (
    orderId: string,
    paymentStatus: AdminOrder["paymentStatus"]
  ) => Promise<void>;
  addTrackingNumber: (orderId: string, trackingNumber: string) => Promise<void>;
  refundOrder: (orderId: string, reason: string) => Promise<void>;

  // Actions filtres
  setUsersFilters: (filters: UsersFilters) => void;
  setProductsFilters: (filters: ProductsFilters) => void;
  setOrdersFilters: (filters: OrdersFilters) => void;
  resetFilters: () => void;

  // Utilitaires
  invalidateCache: (key?: keyof AdminState) => void;
  reset: () => void;
}

// Constantes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_PAGE_SIZE = 10;

// Helpers
const isStale = (lastUpdate: Date | null): boolean => {
  if (!lastUpdate) return true;
  return Date.now() - lastUpdate.getTime() > CACHE_DURATION;
};

const handleError = (error: unknown, context: string) => {
  console.error(`[AdminStore] ${context}:`, error);
  // Ici on pourrait ajouter un toast ou une notification d'erreur
};

// Store principal
export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      // État initial
      stats: null,
      users: [],
      products: [],
      categories: [],
      orders: [],
      logs: [],

      // Pagination
      usersPagination: {
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
      },
      productsPagination: {
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
      },
      ordersPagination: {
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
      },

      // Filtres
      usersFilters: {},
      productsFilters: {},
      ordersFilters: {},

      // Loading states
      isLoadingStats: false,
      isLoadingUsers: false,
      isLoadingProducts: false,
      isLoadingCategories: false,
      isLoadingOrders: false,
      isLoadingLogs: false,

      // Action states
      isCreatingUser: false,
      isUpdatingUser: false,
      isDeletingUser: false,
      isCreatingProduct: false,
      isUpdatingProduct: false,
      isDeletingProduct: false,
      isCreatingCategory: false,
      isUpdatingCategory: false,
      isDeletingCategory: false,
      isUpdatingOrder: false,

      // Cache timestamps
      lastStatsUpdate: null,
      lastUsersUpdate: null,
      lastProductsUpdate: null,
      lastCategoriesUpdate: null,
      lastOrdersUpdate: null,
      lastLogsUpdate: null,

      // Actions de chargement
      loadStats: async () => {
        const state = get();
        if (!isStale(state.lastStatsUpdate) && state.stats) return;

        set({ isLoadingStats: true });
        try {
          const response = await fetch("/api/admin/stats");
          if (!response.ok) throw new Error("Failed to load admin stats");

          const stats = await response.json();
          set({
            stats: { ...stats, lastUpdated: new Date() },
            lastStatsUpdate: new Date(),
            isLoadingStats: false,
          });
        } catch (error) {
          handleError(error, "loadStats");
          set({ isLoadingStats: false });
        }
      },

      loadUsers: async (page = 1, filters = {}) => {
        const state = get();
        const currentFilters = { ...state.usersFilters, ...filters };

        set({ isLoadingUsers: true, usersFilters: currentFilters });
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: DEFAULT_PAGE_SIZE.toString(),
            ...Object.entries(currentFilters).reduce(
              (acc, [key, value]) => {
                if (value !== undefined && value !== "") {
                  acc[key] = value.toString();
                }
                return acc;
              },
              {} as Record<string, string>
            ),
          });

          const response = await fetch(`/api/admin/users?${params}`);
          if (!response.ok) throw new Error("Failed to load users");

          const data = await response.json();
          set({
            users: data.users,
            usersPagination: {
              page: data.page,
              limit: data.limit,
              total: data.total,
              totalPages: data.totalPages,
            },
            lastUsersUpdate: new Date(),
            isLoadingUsers: false,
          });
        } catch (error) {
          handleError(error, "loadUsers");
          set({ isLoadingUsers: false });
        }
      },

      loadProducts: async (page = 1, filters = {}) => {
        const state = get();
        const currentFilters = { ...state.productsFilters, ...filters };

        set({ isLoadingProducts: true, productsFilters: currentFilters });
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: DEFAULT_PAGE_SIZE.toString(),
            ...Object.entries(currentFilters).reduce(
              (acc, [key, value]) => {
                if (value !== undefined && value !== "") {
                  acc[key] = value.toString();
                }
                return acc;
              },
              {} as Record<string, string>
            ),
          });

          const response = await fetch(`/api/admin/products?${params}`);
          if (!response.ok) throw new Error("Failed to load products");

          const data = await response.json();
          set({
            products: data.products,
            productsPagination: {
              page: data.page,
              limit: data.limit,
              total: data.total,
              totalPages: data.totalPages,
            },
            lastProductsUpdate: new Date(),
            isLoadingProducts: false,
          });
        } catch (error) {
          handleError(error, "loadProducts");
          set({ isLoadingProducts: false });
        }
      },

      loadCategories: async () => {
        const state = get();
        if (!isStale(state.lastCategoriesUpdate) && state.categories.length > 0)
          return;

        set({ isLoadingCategories: true });
        try {
          const response = await fetch("/api/admin/categories");
          if (!response.ok) throw new Error("Failed to load categories");

          const categories = await response.json();
          set({
            categories,
            lastCategoriesUpdate: new Date(),
            isLoadingCategories: false,
          });
        } catch (error) {
          handleError(error, "loadCategories");
          set({ isLoadingCategories: false });
        }
      },

      loadOrders: async (page = 1, filters = {}) => {
        const state = get();
        const currentFilters = { ...state.ordersFilters, ...filters };

        set({ isLoadingOrders: true, ordersFilters: currentFilters });
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: DEFAULT_PAGE_SIZE.toString(),
            ...Object.entries(currentFilters).reduce(
              (acc, [key, value]) => {
                if (value !== undefined && value !== "") {
                  acc[key] = value.toString();
                }
                return acc;
              },
              {} as Record<string, string>
            ),
          });

          const response = await fetch(`/api/admin/orders?${params}`);
          if (!response.ok) throw new Error("Failed to load orders");

          const data = await response.json();
          set({
            orders: data.orders,
            ordersPagination: {
              page: data.page,
              limit: data.limit,
              total: data.total,
              totalPages: data.totalPages,
            },
            lastOrdersUpdate: new Date(),
            isLoadingOrders: false,
          });
        } catch (error) {
          handleError(error, "loadOrders");
          set({ isLoadingOrders: false });
        }
      },

      loadLogs: async (page = 1) => {
        set({ isLoadingLogs: true });
        try {
          const response = await fetch(
            `/api/admin/logs?page=${page}&limit=${DEFAULT_PAGE_SIZE}`
          );
          if (!response.ok) throw new Error("Failed to load logs");

          const data = await response.json();
          set({
            logs: data.logs,
            lastLogsUpdate: new Date(),
            isLoadingLogs: false,
          });
        } catch (error) {
          handleError(error, "loadLogs");
          set({ isLoadingLogs: false });
        }
      },

      loadAll: async () => {
        const actions = get();
        await Promise.all([
          actions.loadStats(),
          actions.loadUsers(),
          actions.loadProducts(),
          actions.loadCategories(),
          actions.loadOrders(),
        ]);
      },

      // Actions utilisateurs avec optimistic updates
      createUser: async (userData) => {
        set({ isCreatingUser: true });
        try {
          const response = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          if (!response.ok) throw new Error("Failed to create user");

          const newUser = await response.json();
          set((state) => ({
            users: [newUser, ...state.users],
            isCreatingUser: false,
          }));

          return newUser;
        } catch (error) {
          handleError(error, "createUser");
          set({ isCreatingUser: false });
          throw error;
        }
      },

      updateUser: async (userId, updates) => {
        set({ isUpdatingUser: true });
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error("Failed to update user");

          const updatedUser = await response.json();
          set((state) => ({
            users: state.users.map((user) =>
              user.id === userId ? updatedUser : user
            ),
            isUpdatingUser: false,
          }));

          return updatedUser;
        } catch (error) {
          handleError(error, "updateUser");
          set({ isUpdatingUser: false });
          throw error;
        }
      },

      deleteUser: async (userId) => {
        set({ isDeletingUser: true });
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Failed to delete user");

          set((state) => ({
            users: state.users.filter((user) => user.id !== userId),
            isDeletingUser: false,
          }));
        } catch (error) {
          handleError(error, "deleteUser");
          set({ isDeletingUser: false });
          throw error;
        }
      },

      banUser: async (userId, reason, expiresAt) => {
        const userToUpdate = get().users.find((u) => u.id === userId);
        if (!userToUpdate) return;

        return executeOptimisticUpdate(set, {
          actionName: "banUser",
          optimisticUpdate: (state) => ({
            ...state,
            users: state.users.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    banned: true,
                    banReason: reason,
                    banExpires: expiresAt || null,
                  }
                : user
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            users: state.users.map((user) =>
              user.id === userId ? userToUpdate : user
            ),
          }),
          apiCall: async () => {
            const response = await fetch(`/api/admin/users/${userId}/ban`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reason, expiresAt }),
            });
            if (!response.ok) throw new Error("Failed to ban user");
            return response.json();
          },
          successUpdate: (state, updatedUser) => ({
            ...state,
            users: state.users.map((u) =>
              u.id === userId ? (updatedUser as AdminUser) : u
            ),
          }),
        });
      },

      unbanUser: async (userId) => {
        const userToUpdate = get().users.find((u) => u.id === userId);
        if (!userToUpdate) return;

        return executeOptimisticUpdate(set, {
          actionName: "unbanUser",
          optimisticUpdate: (state) => ({
            ...state,
            users: state.users.map((user) =>
              user.id === userId
                ? { ...user, banned: false, banReason: null, banExpires: null }
                : user
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            users: state.users.map((user) =>
              user.id === userId ? userToUpdate : user
            ),
          }),
          apiCall: async () => {
            const response = await fetch(`/api/admin/users/${userId}/unban`, {
              method: "POST",
            });
            if (!response.ok) throw new Error("Failed to unban user");
            return response.json();
          },
          successUpdate: (state, updatedUser) => ({
            ...state,
            users: state.users.map((u) =>
              u.id === userId ? (updatedUser as AdminUser) : u
            ),
          }),
        });
      },

      setUserRole: async (userId, role) => {
        const userToUpdate = get().users.find((u) => u.id === userId);
        if (!userToUpdate) return;

        return executeOptimisticUpdate(set, {
          actionName: "setUserRole",
          optimisticUpdate: (state) => ({
            ...state,
            users: state.users.map((user) =>
              user.id === userId ? { ...user, role } : user
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            users: state.users.map((user) =>
              user.id === userId ? userToUpdate : user
            ),
          }),
          apiCall: async () => {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role }),
            });
            if (!response.ok) throw new Error("Failed to set user role");
            return response.json();
          },
          successUpdate: (state, updatedUser) => ({
            ...state,
            users: state.users.map((u) =>
              u.id === userId ? (updatedUser as AdminUser) : u
            ),
          }),
        });
      },

      // Actions produits avec optimistic updates
      createProduct: async (productData) => {
        set({ isCreatingProduct: true });
        try {
          const response = await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          });

          if (!response.ok) throw new Error("Failed to create product");

          const newProduct = await response.json();
          set((state) => ({
            products: [newProduct, ...state.products],
            isCreatingProduct: false,
          }));

          return newProduct;
        } catch (error) {
          handleError(error, "createProduct");
          set({ isCreatingProduct: false });
          throw error;
        }
      },

      updateProduct: async (productId, updates) => {
        set({ isUpdatingProduct: true });
        try {
          const response = await fetch(`/api/admin/products/${productId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error("Failed to update product");

          const updatedProduct = await response.json();
          set((state) => ({
            products: state.products.map((product) =>
              product.id === productId ? updatedProduct : product
            ),
            isUpdatingProduct: false,
          }));

          return updatedProduct;
        } catch (error) {
          handleError(error, "updateProduct");
          set({ isUpdatingProduct: false });
          throw error;
        }
      },

      deleteProduct: async (productId) => {
        set({ isDeletingProduct: true });
        try {
          const response = await fetch(`/api/admin/products/${productId}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Failed to delete product");

          set((state) => ({
            products: state.products.filter(
              (product) => product.id !== productId
            ),
            isDeletingProduct: false,
          }));
        } catch (error) {
          handleError(error, "deleteProduct");
          set({ isDeletingProduct: false });
          throw error;
        }
      },

      toggleProductActive: async (productId) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return;

        return executeOptimisticUpdate(set, {
          actionName: "toggleProductActive",
          optimisticUpdate: (state) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === productId ? { ...p, isActive: !p.isActive } : p
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === productId ? product : p
            ),
          }),
          apiCall: async () => {
            const response = await fetch(`/api/admin/products/${productId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isActive: !product.isActive }),
            });
            if (!response.ok)
              throw new Error("Failed to toggle product active");
            return response.json();
          },
          successUpdate: (state, updatedProduct) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === productId ? (updatedProduct as AdminProduct) : p
            ),
          }),
        });
      },

      toggleProductFeatured: async (productId) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return;

        return executeOptimisticUpdate(set, {
          actionName: "toggleProductFeatured",
          optimisticUpdate: (state) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === productId ? product : p
            ),
          }),
          apiCall: async () => {
            const response = await fetch(`/api/admin/products/${productId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isFeatured: !product.isFeatured }),
            });
            if (!response.ok)
              throw new Error("Failed to toggle product featured");
            return response.json();
          },
          successUpdate: (state, updatedProduct) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === productId ? (updatedProduct as AdminProduct) : p
            ),
          }),
        });
      },

      updateProductStock: async (productId, stock) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return;

        return executeOptimisticUpdate(set, {
          actionName: "updateProductStock",
          optimisticUpdate: (state) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === productId ? { ...p, stock } : p
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === productId ? product : p
            ),
          }),
          apiCall: async () => {
            const response = await fetch(`/api/admin/products/${productId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ stock }),
            });
            if (!response.ok) throw new Error("Failed to update product stock");
            return response.json();
          },
          successUpdate: (state, updatedProduct) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === productId ? (updatedProduct as AdminProduct) : p
            ),
          }),
        });
      },

      // Actions catégories avec optimistic updates
      createCategory: async (categoryData) => {
        set({ isCreatingCategory: true });
        try {
          const response = await fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
          });

          if (!response.ok) throw new Error("Failed to create category");

          const newCategory = await response.json();
          set((state) => ({
            categories: [newCategory, ...state.categories],
            isCreatingCategory: false,
          }));

          return newCategory;
        } catch (error) {
          handleError(error, "createCategory");
          set({ isCreatingCategory: false });
          throw error;
        }
      },

      updateCategory: async (categoryId, updates) => {
        set({ isUpdatingCategory: true });
        try {
          const response = await fetch(`/api/admin/categories/${categoryId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error("Failed to update category");

          const updatedCategory = await response.json();
          set((state) => ({
            categories: state.categories.map((category) =>
              category.id === categoryId ? updatedCategory : category
            ),
            isUpdatingCategory: false,
          }));

          return updatedCategory;
        } catch (error) {
          handleError(error, "updateCategory");
          set({ isUpdatingCategory: false });
          throw error;
        }
      },

      deleteCategory: async (categoryId) => {
        set({ isDeletingCategory: true });
        try {
          const response = await fetch(`/api/admin/categories/${categoryId}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Failed to delete category");

          set((state) => ({
            categories: state.categories.filter(
              (category) => category.id !== categoryId
            ),
            isDeletingCategory: false,
          }));
        } catch (error) {
          handleError(error, "deleteCategory");
          set({ isDeletingCategory: false });
          throw error;
        }
      },

      toggleCategoryActive: async (categoryId) => {
        const category = get().categories.find((c) => c.id === categoryId);
        if (!category) return;

        return executeOptimisticUpdate(set, {
          actionName: "toggleCategoryActive",
          optimisticUpdate: (state) => ({
            ...state,
            categories: state.categories.map((c) =>
              c.id === categoryId ? { ...c, isActive: !c.isActive } : c
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            categories: state.categories.map((c) =>
              c.id === categoryId ? category : c
            ),
          }),
          apiCall: async () => {
            const response = await fetch(
              `/api/admin/categories/${categoryId}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !category.isActive }),
              }
            );
            if (!response.ok)
              throw new Error("Failed to toggle category active");
            return response.json();
          },
          successUpdate: (state, updatedCategory) => ({
            ...state,
            categories: state.categories.map((c) =>
              c.id === categoryId ? (updatedCategory as AdminCategory) : c
            ),
          }),
        });
      },

      // Actions commandes avec optimistic updates
      updateOrderStatus: async (orderId, status) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        return executeOptimisticUpdate(set, {
          actionName: "updateOrderStatus",
          optimisticUpdate: (state) => ({
            ...state,
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, status } : o
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            orders: state.orders.map((o) => (o.id === orderId ? order : o)),
          }),
          apiCall: async () => {
            const response = await fetch(
              `/api/admin/orders/${orderId}/status`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
              }
            );
            if (!response.ok) throw new Error("Failed to update order status");
            return response.json();
          },
          successUpdate: (state, updatedOrder) => ({
            ...state,
            orders: state.orders.map((o) =>
              o.id === orderId ? (updatedOrder as AdminOrder) : o
            ),
          }),
        });
      },

      updatePaymentStatus: async (orderId, paymentStatus) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        return executeOptimisticUpdate(set, {
          actionName: "updatePaymentStatus",
          optimisticUpdate: (state) => ({
            ...state,
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, paymentStatus } : o
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            orders: state.orders.map((o) => (o.id === orderId ? order : o)),
          }),
          apiCall: async () => {
            const response = await fetch(
              `/api/admin/orders/${orderId}/payment`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus }),
              }
            );
            if (!response.ok)
              throw new Error("Failed to update payment status");
            return response.json();
          },
          successUpdate: (state, updatedOrder) => ({
            ...state,
            orders: state.orders.map((o) =>
              o.id === orderId ? (updatedOrder as AdminOrder) : o
            ),
          }),
        });
      },

      addTrackingNumber: async (orderId, trackingNumber) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        return executeOptimisticUpdate(set, {
          actionName: "addTrackingNumber",
          optimisticUpdate: (state) => ({
            ...state,
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, trackingNumber } : o
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            orders: state.orders.map((o) => (o.id === orderId ? order : o)),
          }),
          apiCall: async () => {
            const response = await fetch(
              `/api/admin/orders/${orderId}/tracking`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackingNumber }),
              }
            );
            if (!response.ok) throw new Error("Failed to add tracking number");
            return response.json();
          },
          successUpdate: (state, updatedOrder) => ({
            ...state,
            orders: state.orders.map((o) =>
              o.id === orderId ? (updatedOrder as AdminOrder) : o
            ),
          }),
        });
      },

      refundOrder: async (orderId, reason) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        return executeOptimisticUpdate(set, {
          actionName: "refundOrder",
          optimisticUpdate: (state) => ({
            ...state,
            orders: state.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    status: "REFUNDED" as const,
                    paymentStatus: "REFUNDED" as const,
                  }
                : o
            ),
          }),
          rollbackUpdate: (state) => ({
            ...state,
            orders: state.orders.map((o) => (o.id === orderId ? order : o)),
          }),
          apiCall: async () => {
            const response = await fetch(
              `/api/admin/orders/${orderId}/refund`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
              }
            );
            if (!response.ok) throw new Error("Failed to refund order");
            return response.json();
          },
          successUpdate: (state, updatedOrder) => ({
            ...state,
            orders: state.orders.map((o) =>
              o.id === orderId ? (updatedOrder as AdminOrder) : o
            ),
          }),
        });
      },

      // Actions filtres
      setUsersFilters: (filters) => {
        set({ usersFilters: filters });
      },

      setProductsFilters: (filters) => {
        set({ productsFilters: filters });
      },

      setOrdersFilters: (filters) => {
        set({ ordersFilters: filters });
      },

      resetFilters: () => {
        set({
          usersFilters: {},
          productsFilters: {},
          ordersFilters: {},
        });
      },

      // Utilitaires
      invalidateCache: (key) => {
        if (key) {
          const updateKey =
            `last${key.charAt(0).toUpperCase() + key.slice(1)}Update` as keyof AdminState;
          set({ [updateKey]: null });
        } else {
          set({
            lastStatsUpdate: null,
            lastUsersUpdate: null,
            lastProductsUpdate: null,
            lastCategoriesUpdate: null,
            lastOrdersUpdate: null,
            lastLogsUpdate: null,
          });
        }
      },

      reset: () => {
        set({
          stats: null,
          users: [],
          products: [],
          categories: [],
          orders: [],
          logs: [],
          usersPagination: {
            page: 1,
            limit: DEFAULT_PAGE_SIZE,
            total: 0,
            totalPages: 0,
          },
          productsPagination: {
            page: 1,
            limit: DEFAULT_PAGE_SIZE,
            total: 0,
            totalPages: 0,
          },
          ordersPagination: {
            page: 1,
            limit: DEFAULT_PAGE_SIZE,
            total: 0,
            totalPages: 0,
          },
          usersFilters: {},
          productsFilters: {},
          ordersFilters: {},
          isLoadingStats: false,
          isLoadingUsers: false,
          isLoadingProducts: false,
          isLoadingCategories: false,
          isLoadingOrders: false,
          isLoadingLogs: false,
          isCreatingUser: false,
          isUpdatingUser: false,
          isDeletingUser: false,
          isCreatingProduct: false,
          isUpdatingProduct: false,
          isDeletingProduct: false,
          isCreatingCategory: false,
          isUpdatingCategory: false,
          isDeletingCategory: false,
          isUpdatingOrder: false,
          lastStatsUpdate: null,
          lastUsersUpdate: null,
          lastProductsUpdate: null,
          lastCategoriesUpdate: null,
          lastOrdersUpdate: null,
          lastLogsUpdate: null,
        });
      },
    }),
    {
      name: "admin-store",
    }
  )
);

// Hooks utilitaires
export const useAdminStats = () => {
  const { stats, isLoadingStats, loadStats } = useAdminStore();
  return { stats, isLoadingStats, loadStats };
};

export const useAdminUsers = () => {
  const {
    users,
    usersPagination,
    usersFilters,
    isLoadingUsers,
    isCreatingUser,
    isUpdatingUser,
    isDeletingUser,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    setUserRole,
    setUsersFilters,
  } = useAdminStore();
  return {
    users,
    usersPagination,
    usersFilters,
    isLoadingUsers,
    isCreatingUser,
    isUpdatingUser,
    isDeletingUser,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    setUserRole,
    setUsersFilters,
  };
};

export const useAdminProducts = () => {
  const {
    products,
    productsPagination,
    productsFilters,
    isLoadingProducts,
    isCreatingProduct,
    isUpdatingProduct,
    isDeletingProduct,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    toggleProductFeatured,
    updateProductStock,
    setProductsFilters,
  } = useAdminStore();
  return {
    products,
    productsPagination,
    productsFilters,
    isLoadingProducts,
    isCreatingProduct,
    isUpdatingProduct,
    isDeletingProduct,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    toggleProductFeatured,
    updateProductStock,
    setProductsFilters,
  };
};

export const useAdminCategories = () => {
  const {
    categories,
    isLoadingCategories,
    isCreatingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
  } = useAdminStore();
  return {
    categories,
    isLoadingCategories,
    isCreatingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
  };
};

export const useAdminOrders = () => {
  const {
    orders,
    ordersPagination,
    ordersFilters,
    isLoadingOrders,
    isUpdatingOrder,
    loadOrders,
    updateOrderStatus,
    updatePaymentStatus,
    addTrackingNumber,
    refundOrder,
    setOrdersFilters,
  } = useAdminStore();
  return {
    orders,
    ordersPagination,
    ordersFilters,
    isLoadingOrders,
    isUpdatingOrder,
    loadOrders,
    updateOrderStatus,
    updatePaymentStatus,
    addTrackingNumber,
    refundOrder,
    setOrdersFilters,
  };
};

export const useAdminLogs = () => {
  const { logs, isLoadingLogs, loadLogs } = useAdminStore();
  return { logs, isLoadingLogs, loadLogs };
};
