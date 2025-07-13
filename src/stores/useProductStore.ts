import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Types pour le store
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice?: number;
  stock: number;
  slug: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    alt?: string | null;
    position: number;
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
}

interface ProductStore {
  // States
  featuredProducts: CacheEntry<Product[]> | null;
  categories: CacheEntry<Category[]> | null;
  products: Record<string, CacheEntry<Product[]>>; // Paginé par clé
  loading: {
    featured: boolean;
    categories: boolean;
    products: boolean;
  };
  errors: {
    featured: string | null;
    categories: string | null;
    products: string | null;
  };

  // Actions pour les produits featured
  setFeaturedProducts: (products: Product[]) => void;
  fetchFeaturedProducts: (force?: boolean) => Promise<Product[]>;

  // Actions pour les catégories
  setCategories: (categories: Category[]) => void;
  fetchCategories: (force?: boolean) => Promise<Category[]>;

  // Actions pour les produits paginés
  setProducts: (key: string, products: Product[]) => void;
  fetchProducts: (params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    fields?: string[];
    force?: boolean;
  }) => Promise<{ products: Product[]; pagination: unknown }>;

  // Actions utilitaires
  invalidateCache: (
    type?: "featured" | "categories" | "products" | "all"
  ) => void;
  clearErrors: () => void;
  isDataStale: (timestamp: number, maxAge?: number) => boolean;
}

// Constantes
const CACHE_DURATION = {
  FEATURED: 10 * 60 * 1000, // 10 minutes
  CATEGORIES: 15 * 60 * 1000, // 15 minutes
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
};

const DEFAULT_LOADING = {
  featured: false,
  categories: false,
  products: false,
};

const DEFAULT_ERRORS = {
  featured: null,
  categories: null,
  products: null,
};

// Store Zustand avec persistence
export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      // États initiaux
      featuredProducts: null,
      categories: null,
      products: {},
      loading: DEFAULT_LOADING,
      errors: DEFAULT_ERRORS,

      // Vérifier si les données sont périmées
      isDataStale: (
        timestamp: number,
        maxAge: number = CACHE_DURATION.PRODUCTS
      ) => {
        return Date.now() - timestamp > maxAge;
      },

      // Actions pour les produits featured
      setFeaturedProducts: (products: Product[]) => {
        set((state) => ({
          featuredProducts: {
            data: products,
            timestamp: Date.now(),
            isStale: false,
          },
          loading: { ...state.loading, featured: false },
          errors: { ...state.errors, featured: null },
        }));
      },

      fetchFeaturedProducts: async (force = false) => {
        const currentState = get();

        // Vérifier le cache si pas forcé
        if (
          !force &&
          currentState.featuredProducts &&
          !currentState.isDataStale(
            currentState.featuredProducts.timestamp,
            CACHE_DURATION.FEATURED
          )
        ) {
          return currentState.featuredProducts.data;
        }

        // Éviter les double-fetches
        if (currentState.loading.featured) {
          return currentState.featuredProducts?.data || [];
        }

        set((state) => ({
          loading: { ...state.loading, featured: true },
          errors: { ...state.errors, featured: null },
        }));

        try {
          const response = await fetch("/api/products/featured?limit=6");
          if (!response.ok)
            throw new Error("Erreur lors du chargement des produits");

          const data = await response.json();
          const products = data.products || [];

          get().setFeaturedProducts(products);
          return products;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur inconnue";
          set((state) => ({
            loading: { ...state.loading, featured: false },
            errors: { ...state.errors, featured: errorMessage },
          }));
          return get().featuredProducts?.data || [];
        }
      },

      // Actions pour les catégories
      setCategories: (categories: Category[]) => {
        set((state) => ({
          categories: {
            data: categories,
            timestamp: Date.now(),
            isStale: false,
          },
          loading: { ...state.loading, categories: false },
          errors: { ...state.errors, categories: null },
        }));
      },

      fetchCategories: async (force = false) => {
        const currentState = get();

        // Vérifier le cache si pas forcé
        if (
          !force &&
          currentState.categories &&
          !currentState.isDataStale(
            currentState.categories.timestamp,
            CACHE_DURATION.CATEGORIES
          )
        ) {
          return currentState.categories.data;
        }

        // Éviter les double-fetches
        if (currentState.loading.categories) {
          return currentState.categories?.data || [];
        }

        set((state) => ({
          loading: { ...state.loading, categories: true },
          errors: { ...state.errors, categories: null },
        }));

        try {
          const response = await fetch("/api/categories");
          if (!response.ok)
            throw new Error("Erreur lors du chargement des catégories");

          const categories = await response.json();

          get().setCategories(categories);
          return categories;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur inconnue";
          set((state) => ({
            loading: { ...state.loading, categories: false },
            errors: { ...state.errors, categories: errorMessage },
          }));
          return get().categories?.data || [];
        }
      },

      // Actions pour les produits paginés
      setProducts: (key: string, products: Product[]) => {
        set((state) => ({
          products: {
            ...state.products,
            [key]: {
              data: products,
              timestamp: Date.now(),
              isStale: false,
            },
          },
          loading: { ...state.loading, products: false },
          errors: { ...state.errors, products: null },
        }));
      },

      fetchProducts: async ({
        page = 1,
        limit = 10,
        categoryId,
        fields = ["id", "name", "price", "images", "category"],
        force = false,
      }) => {
        const currentState = get();

        // Générer une clé de cache unique
        const cacheKey = `products_${page}_${limit}_${categoryId || "all"}_${fields.join(",")}`;

        // Vérifier le cache si pas forcé
        const cachedProducts = currentState.products[cacheKey];
        if (
          !force &&
          cachedProducts &&
          !currentState.isDataStale(
            cachedProducts.timestamp,
            CACHE_DURATION.PRODUCTS
          )
        ) {
          return { products: cachedProducts.data, pagination: {} }; // TODO: Sauvegarder aussi la pagination
        }

        // Éviter les double-fetches
        if (currentState.loading.products) {
          return { products: cachedProducts?.data || [], pagination: {} };
        }

        set((state) => ({
          loading: { ...state.loading, products: true },
          errors: { ...state.errors, products: null },
        }));

        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            fields: fields.join(","),
          });

          if (categoryId) params.append("categoryId", categoryId);

          const response = await fetch(`/api/products?${params}`);
          if (!response.ok)
            throw new Error("Erreur lors du chargement des produits");

          const data = await response.json();
          const products = data.products || [];

          get().setProducts(cacheKey, products);
          return { products, pagination: data.pagination };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur inconnue";
          set((state) => ({
            loading: { ...state.loading, products: false },
            errors: { ...state.errors, products: errorMessage },
          }));
          const currentState = get();
          const currentCachedProducts = currentState.products[cacheKey];
          return {
            products: currentCachedProducts?.data || [],
            pagination: {},
          };
        }
      },

      // Actions utilitaires
      invalidateCache: (type = "all") => {
        set((state) => {
          const newState = { ...state };

          if (type === "all" || type === "featured") {
            newState.featuredProducts = null;
          }

          if (type === "all" || type === "categories") {
            newState.categories = null;
          }

          if (type === "all" || type === "products") {
            newState.products = {};
          }

          return newState;
        });
      },

      clearErrors: () => {
        set(() => ({
          errors: DEFAULT_ERRORS,
        }));
      },
    }),
    {
      name: "product-store",
      storage: createJSONStorage(() => localStorage),
      // Seulement persister les données cachées, pas les états de loading
      partialize: (state) => ({
        featuredProducts: state.featuredProducts,
        categories: state.categories,
        products: state.products,
      }),
    }
  )
);

// Hook optimisé pour les produits featured
export const useFeaturedProducts = () => {
  const { featuredProducts, loading, errors, fetchFeaturedProducts } =
    useProductStore();

  return {
    products: featuredProducts?.data || [],
    loading: loading.featured,
    error: errors.featured,
    refetch: fetchFeaturedProducts,
    isStale: featuredProducts
      ? useProductStore
          .getState()
          .isDataStale(featuredProducts.timestamp, CACHE_DURATION.FEATURED)
      : true,
  };
};

// Hook optimisé pour les catégories
export const useCategories = () => {
  const { categories, loading, errors, fetchCategories } = useProductStore();

  return {
    categories: categories?.data || [],
    loading: loading.categories,
    error: errors.categories,
    refetch: fetchCategories,
    isStale: categories
      ? useProductStore
          .getState()
          .isDataStale(categories.timestamp, CACHE_DURATION.CATEGORIES)
      : true,
  };
};
