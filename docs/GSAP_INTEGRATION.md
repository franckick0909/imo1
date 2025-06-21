# Guide d'intégration GSAP

## Vue d'ensemble

Ce projet utilise maintenant **GSAP** (GreenSock Animation Platform) en complément de **Framer Motion**. Cette approche hybride vous permet de :

- Garder Framer Motion pour les animations simples d'interface
- Utiliser GSAP pour les animations complexes et les effets de scroll avancés

## Composants disponibles

### 1. FeatureSection.tsx (Original - Framer Motion)

- Utilise `useScroll` et `useTransform` de Framer Motion
- Animations de base avec parallax
- Bon pour des effets simples

### 2. FeatureSectionGSAP.tsx (Nouveau - GSAP)

- Utilise `ScrollTrigger` de GSAP
- Animations plus fluides et performantes
- Effets avancés comme rotation avec parallax
- Meilleur contrôle des timelines

## Avantages de GSAP

### ✅ Performance

- Animations plus fluides, surtout sur mobile
- Optimisé pour les navigateurs
- Moins de recalculs de layout

### ✅ Contrôle avancé

- Timelines complexes
- Effets de morphing
- Animations séquentielles précises

### ✅ ScrollTrigger

- Contrôle granulaire des animations de scroll
- Paramètres `scrub` pour des effets fluides
- Meilleure gestion des triggers

## Comment utiliser

### Remplacer le composant existant

Dans votre `page.tsx`, remplacez :

```tsx
import FeatureSection from "@/components/FeatureSection";
```

Par :

```tsx
import FeatureSectionGSAP from "@/components/FeatureSectionGSAP";
```

Puis utilisez :

```tsx
<FeatureSectionGSAP />
```

### Créer de nouvelles animations GSAP

```tsx
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Enregistrer le plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function MonComposant() {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Contexte pour nettoyer les animations
    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: elementRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert(); // Nettoyage important !
  }, []);

  return <div ref={elementRef}>Mon contenu</div>;
}
```

## Bonnes pratiques

### 1. Nettoyage des animations

Toujours utiliser `gsap.context()` et `ctx.revert()` pour éviter les fuites mémoire.

### 2. SSR (Server-Side Rendering)

Toujours vérifier `typeof window !== "undefined"` avant d'utiliser GSAP.

### 3. Performance

- Utilisez `will-change: transform` en CSS pour les éléments animés
- Préférez `transform` et `opacity` aux autres propriétés
- Utilisez `scrub` pour les animations de scroll fluides

### 4. Responsive

GSAP gère automatiquement le redimensionnement avec `ScrollTrigger.refresh()`.

## Plugins GSAP utilisés

- **ScrollTrigger** : Animations basées sur le scroll
- **Core** : Animations de base (inclus par défaut)

## Migration progressive

Vous pouvez migrer progressivement :

1. Gardez les composants Framer Motion existants
2. Utilisez GSAP pour les nouveaux composants complexes
3. Migrez les animations critiques vers GSAP au besoin

## Déploiement

✅ **Vercel** : Compatible, aucune configuration supplémentaire requise
✅ **Bundle** : GSAP ajoute ~100KB (justifié pour les animations avancées)
✅ **Performance** : Amélioration des performances d'animation sur mobile
