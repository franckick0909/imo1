# 🔧 Dashboard Administrateur - Immo1

## 📋 Vue d'ensemble

Le dashboard administrateur d'Immo1 utilise le plugin `admin` de Better Auth pour fournir une interface complète de gestion des utilisateurs avec des fonctionnalités avancées.

## ✨ Fonctionnalités

### 🎯 **Gestion des utilisateurs**

- **Liste paginée** : Affichage de tous les utilisateurs avec pagination (10 par page)
- **Recherche avancée** : Recherche par email avec filtrage en temps réel
- **Statistiques en temps réel** :
  - Total utilisateurs
  - Utilisateurs actifs
  - Utilisateurs bannis
  - Nombre d'administrateurs

### 👑 **Gestion des rôles**

- **Rôles disponibles** : `user` (par défaut) et `admin`
- **Changement de rôle** : Interface simple pour promouvoir/rétrograder les utilisateurs
- **Permissions automatiques** : Les admins ont accès complet aux fonctions d'administration

### 🚫 **Gestion des bannissements**

- **Bannir un utilisateur** : Empêche la connexion et révoque toutes les sessions
- **Débannir un utilisateur** : Restore l'accès au compte
- **Raisons personnalisées** : Possibilité d'ajouter une raison de bannissement
- **Bans temporaires ou permanents** : Configuration flexible des durées

### 🛡️ **Sécurité et permissions**

- **Double authentification** : Vérification via `adminUserIds` et rôle `admin`
- **Protection des routes** : Accès restreint via middleware et vérifications client
- **Audit trail** : Logs des actions administratives
- **Session impersonation** : Capacité de se connecter en tant qu'autre utilisateur (1h max)

## 🔧 Configuration

### **1. Plugin serveur (auth.ts)**

```typescript
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      adminUserIds: ["votre-user-id"], // Administrateurs fixes
      impersonationSessionDuration: 60 * 60, // 1 heure
      defaultBanReason: "Violation des conditions d'utilisation",
      bannedUserMessage: "Votre compte a été suspendu.",
    }),
  ],
  // ... autres configurations
});
```

### **2. Plugin client (auth-client.ts)**

```typescript
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    // ... autres plugins
  ],
});

export const { admin } = authClient;
```

### **3. Schéma de base de données**

```bash
# Générer le schéma avec les champs admin
npx @better-auth/cli generate --output prisma/schema.prisma

# Appliquer les migrations
npx prisma db push
```

**Nouveaux champs ajoutés :**

- **User table** : `role`, `banned`, `banReason`, `banExpires`
- **Session table** : `impersonatedBy`

## 👤 Devenir administrateur

### **Méthode 1 : Via script (recommandée)**

```bash
# Éditer scripts/set-admin.js avec votre email
node scripts/set-admin.js
```

### **Méthode 2 : Manuellement via Prisma Studio**

```bash
npx prisma studio
# Aller dans la table User
# Modifier le champ 'role' de votre utilisateur à 'admin'
```

### **Méthode 3 : Via adminUserIds**

```typescript
// Dans auth.ts
admin({
  adminUserIds: ["votre-user-id"],
});
```

## 🚀 Accès et navigation

### **Accès au dashboard admin**

1. **Se connecter** sur votre compte
2. **Aller au dashboard** principal (`/dashboard`)
3. **Cliquer sur le bouton "🔧 Admin"** (visible seulement pour les admins)
4. **Accéder à** `/admin` pour la gestion complète

### **Interface utilisateur**

- **Header** : Navigation avec retour au dashboard
- **Statistiques** : Vue d'ensemble des métriques importantes
- **Recherche** : Filtrage en temps réel par email
- **Tableau** : Liste paginée avec actions par utilisateur
- **Modal de gestion** : Interface pour modifier rôles et statuts

## 📊 API et méthodes disponibles

### **Vérifications de permissions**

```typescript
// Vérifier si l'utilisateur a des permissions admin
const hasPermission = await admin.hasPermission({
  permissions: {
    user: ["list", "ban", "set-role"],
  },
});
```

### **Gestion des utilisateurs**

```typescript
// Lister les utilisateurs
const users = await admin.listUsers({
  query: {
    limit: 10,
    offset: 0,
    searchField: "email",
    searchValue: "example.com",
  },
});

// Bannir un utilisateur
await admin.banUser({
  userId: "user-id",
  banReason: "Spam",
  banExpiresIn: 60 * 60 * 24 * 7, // 7 jours
});

// Débannir un utilisateur
await admin.unbanUser({ userId: "user-id" });

// Changer le rôle
await admin.setRole({
  userId: "user-id",
  role: "admin",
});
```

### **Sessions et impersonation**

```typescript
// Lister les sessions d'un utilisateur
const sessions = await admin.listUserSessions({
  userId: "user-id",
});

// Révoquer une session
await admin.revokeUserSession({
  sessionToken: "session-token",
});

// Impersonation (se connecter en tant qu'autre utilisateur)
await admin.impersonateUser({ userId: "user-id" });
await admin.stopImpersonating();
```

## 🔒 Sécurité et bonnes pratiques

### **Protection des routes**

- ✅ **Middleware automatique** : Vérifie les cookies de session
- ✅ **Vérification côté client** : Double validation des permissions
- ✅ **Redirection sécurisée** : Utilisateurs non-admins redirigés automatiquement

### **Audit et logging**

- ✅ **Logs des actions** : Toutes les actions admin sont logged
- ✅ **Erreurs tracées** : Gestion des erreurs avec feedback utilisateur
- ✅ **Sessions surveillées** : Tracking des sessions d'impersonation

### **Limitations et quotas**

- ✅ **Rate limiting** : 100 requêtes/minute par défaut
- ✅ **Pagination forcée** : Maximum 100 utilisateurs par requête
- ✅ **Timeouts** : Sessions d'impersonation limitées à 1h

## 🚀 Déploiement en production

### **Variables d'environnement requises**

```env
# Base de données
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="https://www.immo1.shop"

# Email (optionnel pour admin)
RESEND_API_KEY="re_..."
FROM_EMAIL="Immo1 <noreply@immo1.shop>"
```

### **Checklist de déploiement**

- [ ] ✅ Configuration des adminUserIds avec les bons IDs
- [ ] ✅ Migration de la base de données appliquée
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Test des permissions en staging
- [ ] ✅ Vérification des redirections HTTPS
- [ ] ✅ Monitoring des logs d'erreur

## 📈 Monitoring et maintenance

### **Métriques à surveiller**

- **Nombre d'admins actifs** : Ne pas avoir trop d'administrateurs
- **Actions de bannissement** : Surveiller l'utilisation des bans
- **Sessions d'impersonation** : Logs de sécurité importantes
- **Erreurs d'accès** : Tentatives non autorisées

### **Maintenance régulière**

- **Audit des permissions** : Révision trimestrielle des rôles admin
- **Nettoyage des sessions** : Suppression des sessions expirées
- **Backup des logs** : Sauvegarde des actions administratives
- **Tests de sécurité** : Vérification des protections

---

## 🆘 Support et dépannage

### **Problèmes courants**

**❌ "Pas d'accès admin"**

- Vérifier que l'utilisateur a le rôle `admin` en DB
- Vérifier que l'ID est dans `adminUserIds`
- Clear les cookies et se reconnecter

**❌ "Erreur de permissions"**

- Vérifier la configuration du plugin `adminClient`
- Vérifier les CORS et trustedOrigins
- Contrôler les variables d'environnement

**❌ "Page admin ne charge pas"**

- Vérifier que `admin` est exporté de `auth-client.ts`
- Contrôler les erreurs TypeScript
- Vérifier la route `/admin/page.tsx`

### **Debug utile**

```javascript
// Vérifier le statut admin d'un utilisateur
console.log("Session:", session);
console.log(
  "Admin check:",
  await admin.hasPermission({
    permissions: { user: ["list"] },
  })
);
```

---

_Documentation mise à jour le 2 juin 2025 pour Immo1 v2.0_
