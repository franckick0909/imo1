# Configuration du Webhook Stripe

Ce guide vous explique comment configurer le webhook Stripe pour finaliser automatiquement les commandes après paiement.

## 🎯 Objectif

Le webhook permet à Stripe de notifier votre application lorsque :

- ✅ Un paiement est réussi → Commande confirmée
- ❌ Un paiement échoue → Commande annulée
- 🔐 Un paiement nécessite une action (3D Secure)

## 📋 Étapes de configuration

### 1. Accéder au tableau de bord Stripe

1. Connectez-vous à [dashboard.stripe.com](https://dashboard.stripe.com)
2. Assurez-vous d'être en **mode Test** (toggle en haut à droite)

### 2. Créer un endpoint webhook

1. Dans le menu de gauche, cliquez sur **"Webhooks"**
2. Cliquez sur **"+ Add endpoint"**
3. Dans **"Endpoint URL"**, saisissez : `http://localhost:3000/api/stripe/webhook`
4. Cliquez sur **"+ Select events"**

### 3. Sélectionner les événements

Cochez ces événements essentiels :

#### ✅ Paiements réussis

- `payment_intent.succeeded`

#### ❌ Paiements échoués

- `payment_intent.payment_failed`
- `payment_intent.canceled`

#### 🔐 Actions requises

- `payment_intent.requires_action`

### 4. Finaliser la création

1. Cliquez sur **"Add events"**
2. Cliquez sur **"Add endpoint"**

### 5. Récupérer la clé de signature

1. Dans la liste des webhooks, cliquez sur le webhook que vous venez de créer
2. Dans la section **"Signing secret"**, cliquez sur **"Reveal"**
3. Copiez la clé qui commence par `whsec_...`

### 6. Configurer les variables d'environnement

Dans votre fichier `.env.local` :

```bash
# Remplacez par votre vraie clé de signature webhook
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

## 🧪 Test du webhook

### Option 1 : Test avec Stripe CLI (Recommandé)

1. Installez [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Connectez-vous : `stripe login`
3. Transférez les événements : `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Testez un paiement dans votre app

### Option 2 : Test avec un paiement réel

1. Allez sur `http://localhost:3000/checkout`
2. Ajoutez des produits au panier
3. Utilisez la carte de test : `4242 4242 4242 4242`
4. Vérifiez les logs de votre serveur

## 🔍 Vérification

### Logs attendus

Après un paiement réussi, vous devriez voir :

```bash
Événement Stripe reçu: payment_intent.succeeded pi_xxx...
💰 Paiement réussi: pi_xxx...
✅ Commande ORD-xxx... confirmée pour l'utilisateur user@example.com
```

### Base de données

La commande doit être mise à jour :

- `paymentStatus`: `"PAID"`
- `status`: `"CONFIRMED"`

## 🚀 Production

Pour déployer en production :

1. **Mise à jour de l'URL** : Remplacez `localhost:3000` par votre domaine
2. **Mode Live** : Passez en mode Live dans Stripe
3. **Nouvelles clés** : Récupérez les nouvelles clés de production
4. **SSL requis** : Votre domaine doit utiliser HTTPS

### URL de production

```
https://votre-domaine.com/api/stripe/webhook
```

## 🛠️ Debugging

### Webhook ne fonctionne pas ?

1. **Vérifiez les logs Stripe** : Dans le tableau de bord → Webhooks → Votre endpoint
2. **Vérifiez la signature** : Variable `STRIPE_WEBHOOK_SECRET` correcte ?
3. **Testez l'endpoint** : `curl -X POST http://localhost:3000/api/stripe/webhook`

### Erreurs communes

- **401 Unauthorized** : Signature webhook incorrecte
- **500 Internal Error** : Erreur dans la base de données
- **404 Not Found** : URL webhook incorrecte

## 📚 Ressources

- [Documentation Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Test des webhooks](https://stripe.com/docs/webhooks/test)
