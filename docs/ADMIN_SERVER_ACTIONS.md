# Admin Server Actions

Ce document décrit les Server Actions et endpoints API pour l'interface admin.

## 📋 Sommaire

1. [Endpoints API](#endpoints-api)
2. [Actions TypeScript](#actions-typescript)
3. [Gestion des erreurs](#gestion-des-erreurs)
4. [Utilisation avec le store](#utilisation-avec-le-store)
5. [Sécurité](#sécurité)

## 🔗 Endpoints API

### Statistiques Admin

**GET** `/api/admin/stats`

- Récupère les statistiques globales de l'admin
- Retourne : `AdminStats`

### Gestion des utilisateurs

**GET** `/api/admin/users`

- Récupère les utilisateurs avec pagination et filtres
- Query params : `page`, `limit`, `search`, `role`, `banned`, `emailVerified`, `sortBy`, `sortOrder`
- Retourne : `{ users: AdminUser[], total: number, totalPages: number }`

**POST** `/api/admin/users`

- Crée un nouvel utilisateur
- Body : `{ name?, email, password?, role?, emailVerified? }`
- Retourne : `AdminUser`

**PATCH** `/api/admin/users/[id]`

- Met à jour un utilisateur
- Body : `Partial<AdminUser>`
- Retourne : `AdminUser`

**DELETE** `/api/admin/users/[id]`

- Supprime un utilisateur
- Retourne : `{ message: string, userId: string }`

**POST** `/api/admin/users/[id]/ban`

- Bannit un utilisateur
- Body : `{ reason: string, expiresAt?: string }`
- Retourne : `AdminUser`

**POST** `/api/admin/users/[id]/unban`

- Débannit un utilisateur
- Retourne : `AdminUser`

**POST** `/api/admin/users/[id]/role`

- Change le rôle d'un utilisateur
- Body : `{ role: UserRole }`
- Retourne : `AdminUser`

### Gestion des commandes

**GET** `/api/admin/orders`

- Récupère les commandes avec pagination et filtres
- Query params : `page`, `limit`, `search`, `status`, `paymentStatus`, `sortBy`, `sortOrder`
- Retourne : `{ orders: AdminOrder[], total: number, totalPages: number }`

**PATCH** `/api/admin/orders`

- Met à jour une commande
- Body : `{ orderId: string, status?, paymentStatus?, trackingNumber? }`
- Retourne : `AdminOrder`

### Logs d'activité

**GET** `/api/admin/logs`

- Récupère les logs d'activité
- Query params : `page`, `limit`, `level`, `action`, `sortBy`, `sortOrder`
- Retourne : `{ logs: AdminLog[], total: number, totalPages: number }`

**POST** `/api/admin/logs`

- Crée un nouveau log
- Body : `{ action: string, level: 'INFO'|'WARNING'|'ERROR', message: string, metadata? }`
- Retourne : `AdminLog`

## 🎯 Actions TypeScript

### Statistiques

```typescript
import { getAdminStats } from "@/lib/admin-actions";

try {
  const stats = await getAdminStats();
  console.log(stats);
} catch (error) {
  console.error("Erreur:", error.message);
}
```

### Gestion des utilisateurs

```typescript
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  banAdminUser,
  unbanAdminUser,
  changeUserRole,
} from "@/lib/admin-actions";

// Récupérer les utilisateurs
const { users, total, totalPages } = await getAdminUsers(
  { page: 1, limit: 10 },
  { search: "test", role: "user", sortBy: "createdAt", sortOrder: "desc" }
);

// Créer un utilisateur
const newUser = await createAdminUser({
  email: "test@example.com",
  name: "Test User",
  role: "user",
});

// Mettre à jour un utilisateur
const updatedUser = await updateAdminUser("user-id", {
  name: "Nouveau nom",
  emailVerified: true,
});

// Bannir un utilisateur
const bannedUser = await banAdminUser(
  "user-id",
  "Spam",
  new Date("2024-12-31")
);

// Débannir un utilisateur
const unbannedUser = await unbanAdminUser("user-id");

// Changer le rôle
const userWithNewRole = await changeUserRole("user-id", "admin");

// Supprimer un utilisateur
await deleteAdminUser("user-id");
```

### Gestion des commandes

```typescript
import { getAdminOrders, updateAdminOrder } from "@/lib/admin-actions";

// Récupérer les commandes
const { orders, total, totalPages } = await getAdminOrders(
  { page: 1, limit: 10 },
  { status: "PENDING", sortBy: "createdAt", sortOrder: "desc" }
);

// Mettre à jour une commande
const updatedOrder = await updateAdminOrder("order-id", {
  status: "SHIPPED",
  trackingNumber: "TRK123456",
});
```

### Logs d'activité

```typescript
import { getAdminLogs, createAdminLog } from "@/lib/admin-actions";

// Récupérer les logs
const { logs, total, totalPages } = await getAdminLogs(1, 20, {
  level: "ERROR",
  action: "USER_BAN",
});

// Créer un log
const newLog = await createAdminLog({
  action: "PRODUCT_CREATED",
  level: "INFO",
  message: "Nouveau produit créé avec succès",
  metadata: { productId: "prod-123" },
});
```

## ⚠️ Gestion des erreurs

### Classe d'erreur personnalisée

```typescript
import { AdminActionError } from "@/lib/admin-actions";

try {
  const users = await getAdminUsers(pagination, filters);
} catch (error) {
  if (error instanceof AdminActionError) {
    console.error("Erreur admin:", error.message);
    console.error("Code:", error.code);
  } else {
    console.error("Erreur inconnue:", error);
  }
}
```

### Retry automatique

```typescript
import { retryWithBackoff } from "@/lib/admin-actions";

const statsWithRetry = await retryWithBackoff(
  () => getAdminStats(),
  3, // 3 tentatives
  1000 // 1 seconde de délai initial
);
```

## 📦 Utilisation avec le store

### Exemple d'intégration dans un composant

```typescript
import { useAdminStore } from '@/stores/admin-store';

function AdminUsersPage() {
  const {
    users,
    usersLoading,
    usersPagination,
    usersFilters,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    changeRole,
    setUsersFilters,
    setUsersPagination
  } = useAdminStore();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (userData) => {
    await createUser(userData);
    // Le store se met à jour automatiquement
  };

  const handleBanUser = async (userId, reason) => {
    await banUser(userId, reason);
    // L'utilisateur est mis à jour dans le store
  };

  return (
    <div>
      {usersLoading ? (
        <div>Chargement...</div>
      ) : (
        <div>
          {users.map(user => (
            <div key={user.id}>
              {user.name} - {user.email}
              <button onClick={() => handleBanUser(user.id, 'Spam')}>
                Bannir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔒 Sécurité

### Authentification

Tous les endpoints vérifient :

1. Session utilisateur valide
2. TODO: Permissions admin (à implémenter)

### Validation des données

- Validation des paramètres de requête
- Validation des données de body
- Sanitization des inputs

### Limitations

- Prévention auto-modification (admin ne peut pas se bannir/supprimer)
- Validation des rôles
- Gestion des erreurs sécurisée

## 📝 Notes de développement

### TODOs

- [ ] Implémenter la vérification des permissions admin
- [ ] Ajouter une table AdminLog au schéma Prisma
- [ ] Implémenter la création d'utilisateurs avec mot de passe
- [ ] Ajouter le champ lastLogin au schéma User
- [ ] Créer les endpoints pour la gestion des produits admin
- [ ] Créer les endpoints pour la gestion des catégories admin

### Améliorations possibles

- Rate limiting sur les endpoints sensibles
- Audit trail complet
- Notifications en temps réel
- Backup/restore des données
- Métriques de performance
