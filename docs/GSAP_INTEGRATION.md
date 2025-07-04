# Guide d'intégration GSAP + Lenis

## Vue d'ensemble

Ce projet utilise maintenant **GSAP** (GreenSock Animation Platform) et **Lenis** (smooth scroll) en complément de **Framer Motion**. Cette approche hybride vous permet de :

- Garder Framer Motion pour les animations simples d'interface
- Utiliser GSAP pour les animations complexes et les effets de scroll avancés
- Bénéficier d'un smooth scroll ultra-fluide avec Lenis

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

## Intégration Lenis (Smooth Scroll)

### Installation et configuration

Lenis est automatiquement configuré via le `LenisProvider` dans le layout principal :

```tsx
// layout.tsx
import LenisProvider from "@/components/LenisProvider";

export default function RootLayout({ children }) {
  return <LenisProvider>{/* Votre contenu */}</LenisProvider>;
}
```

### Fonctionnalités Lenis

- **Smooth scroll fluide** : Transition naturelle entre les sections
- **Intégration GSAP** : Synchronisation parfaite avec ScrollTrigger
- **Responsive** : Adapté automatiquement aux différents écrans
- **Performance** : Optimisé pour tous les navigateurs

### Configuration personnalisée

Le `LenisProvider` utilise ces paramètres optimisés :

```tsx
const lenis = new Lenis({
  duration: 1.2, // Durée de l'animation de scroll
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing personnalisé
  smooth: true, // Smooth scroll activé
  smoothTouch: false, // Désactivé sur mobile pour éviter les conflits
  touchMultiplier: 2, // Sensibilité tactile
});
```

### Avantages du combo GSAP + Lenis

✅ **Expérience ultra-fluide** : Scroll naturel et animations synchronisées
✅ **Performance optimale** : Lenis gère le scroll, GSAP les animations
✅ **Compatibilité** : Fonctionne parfaitement avec ScrollTrigger
✅ **Responsive** : Adaptation automatique sur tous les appareils

## Migration progressive

Vous pouvez migrer progressivement :

1. Gardez les composants Framer Motion existants
2. Utilisez GSAP pour les nouveaux composants complexes
3. Migrez les animations critiques vers GSAP au besoin

## Déploiement

✅ **Vercel** : Compatible, aucune configuration supplémentaire requise
✅ **Bundle** : GSAP (~100KB) + Lenis (~15KB) justifiés pour l'expérience utilisateur
✅ **Performance** : Amélioration significative des performances d'animation et de scroll
✅ **UX** : Site ultra-fluide comparable aux meilleurs sites modernes
 