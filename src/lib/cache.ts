"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cache } from "react";

// ========================
// TYPES DE CACHE
// ========================

export interface CacheOptions {
  tags?: string[];
  revalidate?: number | false;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  tags: string[];
  revalidate: number | false;
}

// Types pour les paramètres de cache
export type CacheParams = Record<
  string,
  string | number | boolean | null | undefined
>;

// ========================
// CACHE TAGS
// ========================

export const CACHE_TAGS = {
  PRODUCTS: "products",
  PRODUCT: "product",
  CATEGORIES: "categories",
  FEATURED_PRODUCTS: "featured-products",
  DASHBOARD_STATS: "dashboard-stats",
  DASHBOARD_ORDERS: "dashboard-orders",
  DASHBOARD_ACTIVITY: "dashboard-activity",
  ADMIN_STATS: "admin-stats",
  ADMIN_USERS: "admin-users",
  ADMIN_ORDERS: "admin-orders",
  ADMIN_PRODUCTS: "admin-products",
  SHIPPING: "shipping",
  USER_PROFILE: "user-profile",
} as const;

// ========================
// CACHE DURÉES
// ========================

export const CACHE_DURATIONS = {
  ULTRA_SHORT: 60, // 1 minute
  SHORT: 300, // 5 minutes
  MEDIUM: 900, // 15 minutes
  LONG: 3600, // 1 heure
  VERY_LONG: 86400, // 24 heures
} as const;

// ========================
// CACHE MÉMOIRE (SERVER ACTIONS)
// ========================

const memoryCache = new Map<string, CacheEntry<unknown>>();

// Fonction pour générer une clé de cache
export function generateCacheKey(prefix: string, params: CacheParams = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${JSON.stringify(params[key])}`)
    .join(",");
  return `${prefix}:${sortedParams}`;
}

// Fonction pour vérifier si un cache est valide
export function isCacheValid(entry: CacheEntry<unknown>): boolean {
  if (entry.revalidate === false) return true;
  if (entry.revalidate === 0) return false;

  const now = Date.now();
  const elapsed = now - entry.timestamp;
  return elapsed < entry.revalidate * 1000;
}

// Fonction pour récupérer du cache mémoire
export function getFromMemoryCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (!isCacheValid(entry)) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data as T;
}

// Fonction pour sauvegarder en cache mémoire
export function setInMemoryCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    tags: options.tags || [],
    revalidate: options.revalidate ?? CACHE_DURATIONS.SHORT,
  };

  memoryCache.set(key, entry);
}

// Fonction pour nettoyer le cache mémoire par tag
export function invalidateMemoryCacheByTag(tag: string): void {
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.tags.includes(tag)) {
      memoryCache.delete(key);
    }
  }
}

// Fonction pour vider tout le cache mémoire
export function clearMemoryCache(): void {
  memoryCache.clear();
}

// ========================
// CACHE REACT (unstable_cache)
// ========================

// Type pour les fonctions cachées
type CacheableFunction = (...args: unknown[]) => unknown;

// Fonction wrapper pour unstable_cache avec tags
export function createCachedFunction<T extends CacheableFunction>(fn: T): T {
  return cache(fn) as T;
}

// ========================
// INTERFACES DE RETOUR
// ========================

interface CacheActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

interface CacheStats {
  memoryCache: {
    size: number;
    keys: string[];
    entries: Array<{
      key: string;
      tags: string[];
      timestamp: number;
      revalidate: number | false;
      isValid: boolean;
    }>;
  };
}

interface CleanupResult {
  cleaned: number;
  remaining: number;
}

// ========================
// REVALIDATION ACTIONS
// ========================

// Server Action pour revalider par tag
export async function revalidateByTag(tag: string): Promise<CacheActionResult> {
  try {
    // Revalider le cache Next.js
    revalidateTag(tag);

    // Invalider le cache mémoire
    invalidateMemoryCacheByTag(tag);

    return {
      success: true,
      message: `Cache revalidé pour le tag: ${tag}`,
    };
  } catch (error) {
    console.error(`Erreur lors de la revalidation du tag ${tag}:`, error);
    return {
      success: false,
      error: `Erreur lors de la revalidation: ${error}`,
    };
  }
}

// Server Action pour revalider par path
export async function revalidateByPath(
  path: string
): Promise<CacheActionResult> {
  try {
    revalidatePath(path);
    return {
      success: true,
      message: `Cache revalidé pour le path: ${path}`,
    };
  } catch (error) {
    console.error(`Erreur lors de la revalidation du path ${path}:`, error);
    return {
      success: false,
      error: `Erreur lors de la revalidation: ${error}`,
    };
  }
}

// Server Action pour revalider plusieurs tags
export async function revalidateMultipleTags(
  tags: string[]
): Promise<CacheActionResult> {
  try {
    const results = await Promise.all(tags.map((tag) => revalidateByTag(tag)));

    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      return {
        success: false,
        error: `Erreurs lors de la revalidation: ${failed.map((f) => f.error).join(", ")}`,
      };
    }

    return {
      success: true,
      message: `Cache revalidé pour ${tags.length} tags`,
    };
  } catch (error) {
    console.error("Erreur lors de la revalidation multiple:", error);
    return {
      success: false,
      error: `Erreur lors de la revalidation: ${error}`,
    };
  }
}

// ========================
// HELPERS SPÉCIFIQUES
// ========================

// Fonction pour revalider tous les caches produits
export async function revalidateProductsCache(): Promise<CacheActionResult> {
  return revalidateMultipleTags([
    CACHE_TAGS.PRODUCTS,
    CACHE_TAGS.PRODUCT,
    CACHE_TAGS.FEATURED_PRODUCTS,
    CACHE_TAGS.CATEGORIES,
  ]);
}

// Fonction pour revalider tous les caches dashboard
export async function revalidateDashboardCache(): Promise<CacheActionResult> {
  return revalidateMultipleTags([
    CACHE_TAGS.DASHBOARD_STATS,
    CACHE_TAGS.DASHBOARD_ORDERS,
    CACHE_TAGS.DASHBOARD_ACTIVITY,
    CACHE_TAGS.USER_PROFILE,
  ]);
}

// Fonction pour revalider tous les caches admin
export async function revalidateAdminCache(): Promise<CacheActionResult> {
  return revalidateMultipleTags([
    CACHE_TAGS.ADMIN_STATS,
    CACHE_TAGS.ADMIN_USERS,
    CACHE_TAGS.ADMIN_ORDERS,
    CACHE_TAGS.ADMIN_PRODUCTS,
  ]);
}

// ========================
// CACHE MANAGER
// ========================

export class CacheManager {
  private static instance: CacheManager;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Méthode pour obtenir des statistiques du cache
  getCacheStats(): CacheStats {
    const stats: CacheStats = {
      memoryCache: {
        size: memoryCache.size,
        keys: Array.from(memoryCache.keys()),
        entries: Array.from(memoryCache.entries()).map(([key, entry]) => ({
          key,
          tags: entry.tags,
          timestamp: entry.timestamp,
          revalidate: entry.revalidate,
          isValid: isCacheValid(entry),
        })),
      },
    };

    return stats;
  }

  // Méthode pour nettoyer les caches expirés
  cleanExpiredCache(): CleanupResult {
    let cleaned = 0;

    for (const [key, entry] of memoryCache.entries()) {
      if (!isCacheValid(entry)) {
        memoryCache.delete(key);
        cleaned++;
      }
    }

    return {
      cleaned,
      remaining: memoryCache.size,
    };
  }
}

// ========================
// ACTIONS CACHE DEBUG
// ========================

// Server Action pour obtenir les statistiques du cache
export async function getCacheStats(): Promise<CacheActionResult> {
  try {
    const manager = CacheManager.getInstance();
    const stats = manager.getCacheStats();

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Erreur lors de l'obtention des stats cache:", error);
    return {
      success: false,
      error: "Erreur lors de l'obtention des statistiques",
    };
  }
}

// Server Action pour nettoyer le cache
export async function cleanExpiredCache(): Promise<CacheActionResult> {
  try {
    const manager = CacheManager.getInstance();
    const result = manager.cleanExpiredCache();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Erreur lors du nettoyage du cache:", error);
    return {
      success: false,
      error: "Erreur lors du nettoyage du cache",
    };
  }
}

// Server Action pour vider tout le cache
export async function clearAllCache(): Promise<CacheActionResult> {
  try {
    clearMemoryCache();

    // Revalider tous les tags principaux
    await revalidateMultipleTags([
      CACHE_TAGS.PRODUCTS,
      CACHE_TAGS.CATEGORIES,
      CACHE_TAGS.FEATURED_PRODUCTS,
      CACHE_TAGS.DASHBOARD_STATS,
      CACHE_TAGS.ADMIN_STATS,
    ]);

    return {
      success: true,
      message: "Tous les caches ont été vidés",
    };
  } catch (error) {
    console.error("Erreur lors du vidage du cache:", error);
    return {
      success: false,
      error: "Erreur lors du vidage du cache",
    };
  }
}
