# Optimisation du Chargement de la Hero Section

## Problème

La hero section avec une image plein écran peut créer un temps de chargement visible, ce qui nuit à l'expérience utilisateur.

## Solutions Implémentées

### 1. Loader Élaboré (`HeroLoader.tsx`)

- **Fonctionnalités :**
  - Barre de progression animée avec GSAP
  - Texte de progression dynamique
  - Animation d'entrée et de sortie fluide
  - Durée : ~2.5 secondes

- **Avantages :**
  - Expérience utilisateur engageante
  - Feedback visuel du chargement
  - Cohérence avec l'identité visuelle

- **Utilisation :**

```tsx
import HeroLoader from "@/components/ui/HeroLoader";

// Dans votre composant
if (isLoading) {
  return (
    <HeroLoader
      onLoadingComplete={handleLoadingComplete}
      imageSrc="/images/hero.jpg"
    />
  );
}
```

### 2. Loader Simple (`SimpleHeroLoader.tsx`)

- **Fonctionnalités :**
  - Spinner rotatif avec GSAP
  - Animation d'entrée du logo
  - Durée : ~2 secondes

- **Avantages :**
  - Plus rapide et léger
  - Animation subtile
  - Moins distrayant

### 3. Optimisations de l'Image

- **Placeholder blur :** Affiche un placeholder flou pendant le chargement
- **Priority loading :** L'image est chargée en priorité
- **Sizes optimisés :** Responsive image loading

```tsx
<Image
  src="/images/hero.jpg"
  alt="Cosmétiques naturels de luxe"
  fill
  sizes="100vw"
  className="object-cover scale-110"
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 4. Hook useGSAP Personnalisé

- **Fonctionnalités :**
  - Gestion automatique du nettoyage des animations
  - Optimisation des performances
  - API plus propre

```tsx
import { useGSAP } from "@/hooks/useGSAP";

useGSAP(() => {
  // Vos animations GSAP ici
  return timeline; // Optionnel
}, [dependencies]);
```

## Recommandations

### Pour un Site de Luxe (Votre Cas)

Utilisez le **HeroLoader** avec :

- Durée de 2.5 secondes pour créer de l'anticipation
- Animations fluides et élégantes
- Cohérence avec l'identité de marque

### Pour un Site Plus Rapide

Utilisez le **SimpleHeroLoader** avec :

- Durée de 2 secondes maximum
- Animations subtiles
- Focus sur la rapidité

### Optimisations Supplémentaires

1. **Préchargement de l'Image**

```tsx
// Dans le head de votre document
<link rel="preload" href="/images/hero.jpg" as="image" />
```

2. **Compression de l'Image**

- Utilisez des formats modernes (WebP, AVIF)
- Optimisez la taille de l'image
- Considérez différentes tailles pour différents écrans

3. **Lazy Loading Conditionnel**

```tsx
const [shouldLoad, setShouldLoad] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShouldLoad(true), 100);
  return () => clearTimeout(timer);
}, []);
```

## Implémentation Recommandée

Pour votre site VERA, je recommande d'utiliser la version optimisée avec le `HeroLoader` :

```tsx
// Dans votre page principale
import HeroSectionOptimized from "@/components/HeroSectionOptimized";

export default function Home() {
  return (
    <main>
      <HeroSectionOptimized />
      {/* Autres sections */}
    </main>
  );
}
```

Cette solution offre :

- ✅ Expérience utilisateur premium
- ✅ Chargement optimisé
- ✅ Animations fluides avec GSAP
- ✅ Cohérence avec votre identité de marque
- ✅ Performance optimisée
