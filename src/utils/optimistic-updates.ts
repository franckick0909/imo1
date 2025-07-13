/**
 * Utilitaires pour les optimistic updates
 * Permet de mettre à jour l'état immédiatement et de gérer les rollbacks en cas d'erreur
 */

export interface OptimisticUpdateConfig<T> {
  /** Nom de l'action pour les logs */
  actionName: string;
  /** Fonction pour mettre à jour l'état optimistically */
  optimisticUpdate: (state: T) => T;
  /** Fonction pour rollback en cas d'erreur */
  rollbackUpdate: (state: T) => T;
  /** Fonction pour l'appel API */
  apiCall: () => Promise<unknown>;
  /** Fonction pour mettre à jour l'état avec les données réelles de l'API */
  successUpdate?: (state: T, response: unknown) => T;
}

/**
 * Execute une optimistic update avec rollback automatique en cas d'erreur
 */
export async function executeOptimisticUpdate<T>(
  setState: (updater: (state: T) => T) => void,
  config: OptimisticUpdateConfig<T>
): Promise<unknown> {
  let previousState: T | null = null;

  try {
    // 1. Sauvegarder l'état précédent et appliquer l'update optimiste
    setState((state: T) => {
      previousState = state;
      return config.optimisticUpdate(state);
    });

    // 2. Exécuter l'appel API
    const response = await config.apiCall();

    // 3. Mettre à jour avec les données réelles si nécessaire
    if (config.successUpdate) {
      setState((state: T) => config.successUpdate!(state, response));
    }

    return response;
  } catch (error) {
    // 4. Rollback en cas d'erreur
    if (previousState) {
      setState(() => config.rollbackUpdate(previousState!));
    }

    console.error(`[OptimisticUpdate] ${config.actionName} failed:`, error);
    throw error;
  }
}

/**
 * Helper pour les actions de type toggle (activer/désactiver)
 */
export function createToggleOptimisticUpdate<T>(
  actionName: string,
  findItem: (state: T) => { isActive: boolean },
  updateItem: (state: T, newValue: boolean) => T,
  apiCall: () => Promise<unknown>
): OptimisticUpdateConfig<T> {
  return {
    actionName,
    optimisticUpdate: (state: T) => {
      const item = findItem(state);
      const newValue = !item.isActive; // Suppose que le champ s'appelle isActive
      return updateItem(state, newValue);
    },
    rollbackUpdate: (state: T) => {
      const item = findItem(state);
      const originalValue = !item.isActive; // Revenir à l'état original
      return updateItem(state, originalValue);
    },
    apiCall,
  };
}

/**
 * Helper pour les actions de type array (ajouter/supprimer)
 */
export function createArrayOptimisticUpdate<T, Item>(
  actionName: string,
  getArray: (state: T) => Item[],
  updateArray: (state: T, newArray: Item[]) => T,
  apiCall: () => Promise<unknown>,
  itemToAdd?: Item,
  itemToRemove?: (item: Item) => boolean
): OptimisticUpdateConfig<T> {
  return {
    actionName,
    optimisticUpdate: (state: T) => {
      const currentArray = getArray(state);
      let newArray: Item[];

      if (itemToAdd) {
        newArray = [...currentArray, itemToAdd];
      } else if (itemToRemove) {
        newArray = currentArray.filter((item) => !itemToRemove(item));
      } else {
        throw new Error("Either itemToAdd or itemToRemove must be provided");
      }

      return updateArray(state, newArray);
    },
    rollbackUpdate: (state: T) => {
      const currentArray = getArray(state);
      let originalArray: Item[];

      if (itemToAdd) {
        originalArray = currentArray.filter((item) => item !== itemToAdd);
      } else if (itemToRemove) {
        originalArray = [...currentArray, itemToAdd!]; // Ajouter l'item supprimé
      } else {
        originalArray = currentArray;
      }

      return updateArray(state, originalArray);
    },
    apiCall,
  };
}

/**
 * Helper pour les actions de type update (modifier un objet)
 */
export function createUpdateOptimisticUpdate<T, Item>(
  actionName: string,
  findItem: (state: T) => Item,
  updateItem: (state: T, updates: Partial<Item>) => T,
  updates: Partial<Item>,
  apiCall: () => Promise<unknown>
): OptimisticUpdateConfig<T> {
  return {
    actionName,
    optimisticUpdate: (state: T) => {
      return updateItem(state, updates);
    },
    rollbackUpdate: (state: T) => {
      const currentItem = findItem(state);
      const rollbackUpdates: Partial<Item> = {};

      // Créer un objet de rollback avec les valeurs opposées
      Object.keys(updates).forEach((key) => {
        const typedKey = key as keyof Item;
        if (currentItem && currentItem[typedKey] !== undefined) {
          (rollbackUpdates as Record<string, unknown>)[key] =
            currentItem[typedKey];
        }
      });

      return updateItem(state, rollbackUpdates);
    },
    apiCall,
  };
}

/**
 * Helper pour les notifications toast (optionnel)
 */
export interface ToastConfig {
  success?: string;
  error?: string;
  loading?: string;
}

export function createOptimisticUpdateWithToast<T>(
  config: OptimisticUpdateConfig<T>,
  toastConfig: ToastConfig
): OptimisticUpdateConfig<T> {
  return {
    ...config,
    apiCall: async () => {
      // Ici on pourrait ajouter un toast de loading
      if (toastConfig.loading) {
        console.log(`[Toast] ${toastConfig.loading}`);
      }

      try {
        const result = await config.apiCall();

        // Toast de succès
        if (toastConfig.success) {
          console.log(`[Toast] ${toastConfig.success}`);
        }

        return result;
      } catch (error) {
        // Toast d'erreur
        if (toastConfig.error) {
          console.error(`[Toast] ${toastConfig.error}`);
        }
        throw error;
      }
    },
  };
}
