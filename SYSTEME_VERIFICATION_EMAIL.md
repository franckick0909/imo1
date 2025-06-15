# Système de Vérification d'Email par OTP

## Vue d'ensemble

Le système de vérification d'email a été complètement refondu pour utiliser un code OTP (One-Time Password) à 6 chiffres au lieu d'un lien de vérification traditionnel.

## Problèmes Résolus

### Avant (Problèmes identifiés) :

- ❌ Configuration incohérente avec deux systèmes de vérification qui se chevauchaient
- ❌ Pas d'interface utilisateur pour saisir le code OTP
- ❌ Les utilisateurs recevaient un code mais ne pouvaient pas l'utiliser
- ❌ Template `EmailVerificationTemplate` non utilisé

### Après (Solutions apportées) :

- ✅ Configuration unifiée avec uniquement le plugin `emailOTP`
- ✅ Interface utilisateur moderne pour saisir le code OTP
- ✅ Processus complet de vérification d'email fonctionnel
- ✅ Système de toast pour les notifications utilisateur

## Architecture

### Backend (`src/lib/auth.ts`)

- Utilisation du plugin `emailOTP` de Better Auth
- Suppression de la logique redondante dans `sendVerificationEmail`
- Configuration correcte de `sendVerificationOTP`
- Codes OTP à 6 chiffres valides 5 minutes

### Frontend (`src/app/verify-email/page.tsx`)

- Nouvelle page dédiée à la vérification d'email
- Interface utilisateur moderne avec 6 champs numériques
- Auto-focus entre les champs pour une meilleure UX
- Gestion d'erreurs complète avec messages en français
- Possibilité de renvoyer un nouveau code
- Animation avec Framer Motion

### Intégration (`src/components/AuthModals.tsx`)

- Redirection automatique vers `/verify-email?email=...` après inscription
- Message de confirmation adapté

## Flux Utilisateur

1. **Inscription** : L'utilisateur s'inscrit avec email/mot de passe
2. **Code OTP envoyé** : Un code à 6 chiffres est envoyé par email
3. **Redirection** : L'utilisateur est redirigé vers `/verify-email?email=...`
4. **Saisie du code** : Interface intuitive pour saisir le code
5. **Vérification** : Le code est vérifié côté serveur
6. **Connexion** : Si valide, l'utilisateur est connecté et redirigé

## API Routes

### `/api/auth/resend-otp`

- **Méthode** : POST
- **Payload** : `{ email: string }`
- **Fonction** : Renvoie un nouveau code OTP

## Configuration Required

### Variables d'environnement

```env
RESEND_API_KEY=your_resend_key
FROM_EMAIL=Immo1 <noreply@immo1.shop>
```

### Base de données

Le plugin utilise la table `verification` existante de Better Auth, aucune migration supplémentaire nécessaire.

## Sécurité

- **Expiration** : Les codes expirent après 5 minutes
- **Unicité** : Chaque code n'est valide qu'une seule fois
- **Rate limiting** : Protection contre les tentatives multiples
- **Chiffrement** : Codes stockés de manière sécurisée

## Tests et Développement

### Mode développement

Sans `RESEND_API_KEY`, les emails s'affichent dans la console avec le code OTP pour les tests.

### Mode production

Avec `RESEND_API_KEY`, les emails sont envoyés via Resend.

## Compatibilité

- ✅ Next.js 15
- ✅ Better Auth v1.2.8
- ✅ React 19
- ✅ TypeScript strict mode
- ✅ Framer Motion pour les animations
- ✅ Système de toast existant

## Maintenance

Le système est maintenant unifié et plus simple à maintenir :

- Un seul point de configuration (plugin `emailOTP`)
- API cohérente avec Better Auth
- Code plus lisible et maintenable
