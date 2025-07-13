import { useProductStore } from "@/stores/useProductStore";
import { useCallback, useEffect } from "react";

interface PrefetchOptions {
  featured?: boolean;
  categories?: boolean;
  delay?: number;
  onIdle?: boolean;
}

// Hook pour précharger les données intelligemment
export const usePrefetch = (options: PrefetchOptions = {}) => {
  const {
    featured = true,
    categories = true,
    delay = 100,
    onIdle = true,
  } = options;

  const { fetchFeaturedProducts, fetchCategories } = useProductStore();

  const prefetchData = useCallback(async () => {
    const promises: Promise<unknown>[] = [];

    if (featured) {
      promises.push(fetchFeaturedProducts());
    }

    if (categories) {
      promises.push(fetchCategories());
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn("Prefetch failed:", error);
    }
  }, [featured, categories, fetchFeaturedProducts, fetchCategories]);

  const scheduleInIdleTime = useCallback(() => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        setTimeout(prefetchData, delay);
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
      setTimeout(prefetchData, delay);
    }
  }, [prefetchData, delay]);

  useEffect(() => {
    if (onIdle) {
      scheduleInIdleTime();
    } else {
      setTimeout(prefetchData, delay);
    }
  }, [onIdle, scheduleInIdleTime, prefetchData, delay]);

  return { prefetch: prefetchData };
};

// Hook pour précharger au hover
export const usePrefetchOnHover = () => {
  const { fetchFeaturedProducts, fetchCategories } = useProductStore();

  const prefetchFeatured = useCallback(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  const prefetchCategories = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    onMouseEnter: prefetchFeatured,
    prefetchFeatured,
    prefetchCategories,
  };
};

// Hook pour optimistic updates
export const useOptimisticUpdates = () => {
  const { invalidateCache } = useProductStore();

  const optimisticUpdateProduct = useCallback(
    (productId: string, updates: Record<string, unknown>) => {
      // TODO: Implémenter les mises à jour optimistes
      console.log("Optimistic update:", productId, updates);
    },
    []
  );

  const revalidateAfterMutation = useCallback(() => {
    // Invalider le cache pour forcer un refresh
    invalidateCache("all");
  }, [invalidateCache]);

  return {
    optimisticUpdateProduct,
    revalidateAfterMutation,
  };
};
