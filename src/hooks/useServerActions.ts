import {
  getCategories,
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  revalidateCategories,
  revalidateProducts,
  type PaginatedProducts,
  type Product,
} from "@/lib/actions";
import { useProductStore } from "@/stores/useProductStore";
import { useCallback, useTransition } from "react";

/**
 * Hook hybride qui combine Server Actions + Zustand
 * - Données serveur avec cache Next.js
 * - Cache client intelligent avec Zustand
 * - Optimistic updates et fallback
 */
export function useServerActions() {
  const [isPending, startTransition] = useTransition();
  const {
    setFeaturedProducts,
    setCategories,
    setProducts,
    invalidateCache,
    featuredProducts,
    categories,
    products,
    loading,
    errors,
  } = useProductStore();

  /**
   * Récupérer les produits featured avec Server Action
   */
  const fetchFeaturedProductsServer = useCallback(
    async (limit: number = 6, force: boolean = false) => {
      // Vérifier le cache client d'abord
      const state = useProductStore.getState();
      if (
        !force &&
        state.featuredProducts &&
        !state.isDataStale(state.featuredProducts.timestamp, 600000) // 10 minutes
      ) {
        console.log("📦 Using cached featured products");
        return state.featuredProducts.data;
      }

      console.log("🚀 Fetching featured products via Server Action...");

      try {
        const serverProducts = await getFeaturedProducts(limit);

        // Mettre à jour le store Zustand
        setFeaturedProducts(serverProducts);

        return serverProducts;
      } catch (error) {
        console.error("❌ Server Action failed:", error);
        // Fallback vers les données cachées
        return state.featuredProducts?.data || [];
      }
    },
    [setFeaturedProducts]
  );

  /**
   * Récupérer les catégories avec Server Action
   */
  const fetchCategoriesServer = useCallback(
    async (force: boolean = false) => {
      // Vérifier le cache client d'abord
      const state = useProductStore.getState();
      if (
        !force &&
        state.categories &&
        !state.isDataStale(state.categories.timestamp, 900000) // 15 minutes
      ) {
        console.log("📦 Using cached categories");
        return state.categories.data;
      }

      console.log("🚀 Fetching categories via Server Action...");

      try {
        const serverCategories = await getCategories();

        // Mettre à jour le store Zustand
        setCategories(serverCategories);

        return serverCategories;
      } catch (error) {
        console.error("❌ Server Action failed:", error);
        // Fallback vers les données cachées
        return state.categories?.data || [];
      }
    },
    [setCategories]
  );

  /**
   * Récupérer les produits avec pagination via Server Action
   */
  const fetchProductsServer = useCallback(
    async ({
      page = 1,
      limit = 10,
      categoryId,
      fields = ["id", "name", "price", "images", "category"],
      force = false,
    }: {
      page?: number;
      limit?: number;
      categoryId?: string;
      fields?: string[];
      force?: boolean;
    }): Promise<PaginatedProducts> => {
      const cacheKey = `products_${page}_${limit}_${categoryId || "all"}_${fields.join(",")}`;

      // Vérifier le cache client
      const state = useProductStore.getState();
      const cachedData = state.products[cacheKey];

      if (
        !force &&
        cachedData &&
        !state.isDataStale(cachedData.timestamp, 300000) // 5 minutes
      ) {
        console.log("📦 Using cached products");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { products: cachedData.data, pagination: {} as any }; // TODO: Sauvegarder la pagination
      }

      console.log("🚀 Fetching products via Server Action...");

      try {
        const result = await getProducts({
          page,
          limit,
          categoryId,
          fields,
        });

        // Mettre à jour le store Zustand
        setProducts(cacheKey, result.products);

        return result;
      } catch (error) {
        console.error("❌ Server Action failed:", error);
        // Fallback vers les données cachées
        return {
          products: cachedData?.data || [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pagination: {} as any,
        };
      }
    },
    [setProducts]
  );

  /**
   * Récupérer un produit par slug via Server Action
   */
  const fetchProductBySlugServer = useCallback(
    async (slug: string): Promise<Product | null> => {
      console.log("🚀 Fetching product by slug via Server Action...");

      try {
        const product = await getProductBySlug(slug);
        return product;
      } catch (error) {
        console.error("❌ Server Action failed:", error);
        return null;
      }
    },
    []
  );

  /**
   * Invalider le cache serveur et client
   */
  const revalidateData = useCallback(
    async (type: "featured" | "categories" | "products" | "all" = "all") => {
      console.log("🔄 Revalidating data...", type);

      startTransition(async () => {
        try {
          // Invalider le cache client
          invalidateCache(type);

          // Invalider le cache serveur
          if (type === "all" || type === "featured" || type === "products") {
            await revalidateProducts();
          }

          if (type === "all" || type === "categories") {
            await revalidateCategories();
          }

          console.log("✅ Data revalidated successfully");
        } catch (error) {
          console.error("❌ Revalidation failed:", error);
        }
      });
    },
    [invalidateCache]
  );

  /**
   * Prefetch intelligent qui combine les deux caches
   */
  const prefetchData = useCallback(
    async (
      options: {
        featured?: boolean;
        categories?: boolean;
        products?: boolean;
        delay?: number;
      } = {}
    ) => {
      const {
        featured = true,
        categories = true,
        products = false,
        delay = 0,
      } = options;

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const promises: Promise<any>[] = [];

      if (featured) {
        promises.push(fetchFeaturedProductsServer(6));
      }

      if (categories) {
        promises.push(fetchCategoriesServer());
      }

      if (products) {
        promises.push(fetchProductsServer({ page: 1, limit: 12 }));
      }

      try {
        await Promise.all(promises);
        console.log("✅ Data prefetched successfully");
      } catch (error) {
        console.warn("⚠️ Prefetch partially failed:", error);
      }
    },
    [fetchFeaturedProductsServer, fetchCategoriesServer, fetchProductsServer]
  );

  return {
    // Server Actions
    fetchFeaturedProductsServer,
    fetchCategoriesServer,
    fetchProductsServer,
    fetchProductBySlugServer,

    // Cache management
    revalidateData,
    prefetchData,

    // État
    isPending,
    loading,
    errors,

    // Données du store
    featuredProducts: featuredProducts?.data || [],
    categories: categories?.data || [],
    products,

    // Utilitaires
    isFeaturedStale: featuredProducts
      ? useProductStore
          .getState()
          .isDataStale(featuredProducts.timestamp, 600000)
      : true,
    isCategoriesStale: categories
      ? useProductStore.getState().isDataStale(categories.timestamp, 900000)
      : true,
  };
}

/**
 * Hook optimisé pour les produits featured avec Server Actions
 */
export function useFeaturedProductsServer() {
  const {
    fetchFeaturedProductsServer,
    featuredProducts,
    loading,
    errors,
    isFeaturedStale,
  } = useServerActions();

  return {
    products: featuredProducts,
    loading: loading.featured,
    error: errors.featured,
    refetch: fetchFeaturedProductsServer,
    isStale: isFeaturedStale,
  };
}

/**
 * Hook optimisé pour les catégories avec Server Actions
 */
export function useCategoriesServer() {
  const {
    fetchCategoriesServer,
    categories,
    loading,
    errors,
    isCategoriesStale,
  } = useServerActions();

  return {
    categories,
    loading: loading.categories,
    error: errors.categories,
    refetch: fetchCategoriesServer,
    isStale: isCategoriesStale,
  };
}
