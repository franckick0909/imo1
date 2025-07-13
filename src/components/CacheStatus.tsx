"use client";

import { useServerActions } from "@/hooks/useServerActions";
import { useProductStore } from "@/stores/useProductStore";
import { useEffect, useState } from "react";

interface CacheStatusProps {
  showInProduction?: boolean;
}

export default function CacheStatus({
  showInProduction = false,
}: CacheStatusProps) {
  const [isVisible, setIsVisible] = useState(false);
  const store = useProductStore();
  const { revalidateData, isPending } = useServerActions();

  // Cacher en production sauf si explicitement demandé
  useEffect(() => {
    if (process.env.NODE_ENV === "development" || showInProduction) {
      setIsVisible(true);
    }
  }, [showInProduction]);

  if (!isVisible) return null;

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s ago`;
  };

  const getCacheStatus = (timestamp: number, maxAge: number) => {
    const age = Date.now() - timestamp;
    const isStale = age > maxAge;
    const percentage = Math.min((age / maxAge) * 100, 100);

    return {
      isStale,
      percentage,
      color: isStale
        ? "text-red-500"
        : percentage > 80
          ? "text-yellow-500"
          : "text-green-500",
      status: isStale ? "Stale" : percentage > 80 ? "Expiring" : "Fresh",
    };
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-md z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">Cache Status 🗄️</h3>
        <div className="flex items-center gap-2">
          {isPending && (
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-2 p-2 bg-gray-800 rounded">
        <div className="text-cyan-300 text-xs font-bold">System:</div>
        <div className="text-green-400 text-xs">
          ✅ Zustand + Server Actions
        </div>
        <div className="text-gray-400 text-xs">
          Client/Server hybrid caching
        </div>
      </div>

      {/* Featured Products */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <span className="text-blue-300">Featured Products:</span>
          {store.loading.featured && (
            <span className="text-yellow-500">Loading...</span>
          )}
        </div>
        {store.featuredProducts ? (
          <div className="ml-2">
            <div
              className={`${getCacheStatus(store.featuredProducts.timestamp, 10 * 60 * 1000).color}`}
            >
              {
                getCacheStatus(store.featuredProducts.timestamp, 10 * 60 * 1000)
                  .status
              }{" "}
              - {store.featuredProducts.data.length} items
            </div>
            <div className="text-gray-400 text-xs">
              {formatTimestamp(store.featuredProducts.timestamp)}
            </div>
          </div>
        ) : (
          <div className="ml-2 text-gray-400">No cache</div>
        )}
        {store.errors.featured && (
          <div className="ml-2 text-red-400 text-xs">
            Error: {store.errors.featured}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <span className="text-green-300">Categories:</span>
          {store.loading.categories && (
            <span className="text-yellow-500">Loading...</span>
          )}
        </div>
        {store.categories ? (
          <div className="ml-2">
            <div
              className={`${getCacheStatus(store.categories.timestamp, 15 * 60 * 1000).color}`}
            >
              {
                getCacheStatus(store.categories.timestamp, 15 * 60 * 1000)
                  .status
              }{" "}
              - {store.categories.data.length} items
            </div>
            <div className="text-gray-400 text-xs">
              {formatTimestamp(store.categories.timestamp)}
            </div>
          </div>
        ) : (
          <div className="ml-2 text-gray-400">No cache</div>
        )}
        {store.errors.categories && (
          <div className="ml-2 text-red-400 text-xs">
            Error: {store.errors.categories}
          </div>
        )}
      </div>

      {/* Products Cache */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <span className="text-purple-300">Products Cache:</span>
          {store.loading.products && (
            <span className="text-yellow-500">Loading...</span>
          )}
        </div>
        <div className="ml-2">
          <div className="text-gray-400 text-xs">
            {Object.keys(store.products).length} cached queries
          </div>
          {Object.entries(store.products)
            .slice(0, 2)
            .map(([key, cache]) => (
              <div key={key} className="text-xs">
                <div
                  className={`${getCacheStatus(cache.timestamp, 5 * 60 * 1000).color}`}
                >
                  {key.slice(0, 20)}... - {cache.data.length} items
                </div>
              </div>
            ))}
        </div>
        {store.errors.products && (
          <div className="ml-2 text-red-400 text-xs">
            Error: {store.errors.products}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 pt-2 border-t border-gray-600">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => store.invalidateCache("all")}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            disabled={isPending}
          >
            Clear Client
          </button>
          <button
            onClick={() => store.clearErrors()}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            disabled={isPending}
          >
            Clear Errors
          </button>
          <button
            onClick={() => revalidateData("all")}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
            disabled={isPending}
          >
            Revalidate All
          </button>
        </div>
        <div className="text-gray-400 text-xs mt-2">Ctrl+Shift+C to toggle</div>
      </div>
    </div>
  );
}

// Hook pour afficher/masquer le cache status
export const useCacheStatusToggle = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + Shift + C pour toggle
      if (event.ctrlKey && event.shiftKey && event.key === "C") {
        setShow((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { show, toggle: () => setShow((prev) => !prev) };
};
