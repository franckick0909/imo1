"use client";

import CloudinaryUpload from "@/components/CloudinaryUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schema de validation étendu
const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  longDescription: z.string().optional(),

  // Nouveaux champs pour les détails produits
  ingredients: z.string().optional(),
  usage: z.string().optional(),
  benefits: z.string().optional(),

  price: z.number().min(0.01, "Le prix doit être supérieur à 0"),
  comparePrice: z.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stock: z.number().min(0, "Le stock ne peut pas être négatif"),
  lowStockThreshold: z.number().min(0, "Le seuil ne peut pas être négatif"),
  trackStock: z.boolean(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),

  // SEO amélioré
  slug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),

  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock: 0,
      lowStockThreshold: 5,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  });

  const watchName = watch("name");
  const watchPrice = watch("price");
  const watchComparePrice = watch("comparePrice");
  const watchMetaTitle = watch("metaTitle");
  const watchMetaDescription = watch("metaDescription");

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🔄 Chargement des catégories...");
        const response = await fetch("/api/categories");
        console.log("📡 Réponse API:", response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("📋 Catégories reçues:", data);

        if (Array.isArray(data)) {
          setCategories(data);
          console.log("✅ Catégories chargées:", data.length, "catégories");
        } else {
          console.warn("⚠️ Format de données inattendu:", typeof data);
          setCategories([]);
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des catégories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Génération automatique du slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Auto-génération du slug quand le nom change
  useEffect(() => {
    if (watchName) {
      const slug = generateSlug(watchName);
      setValue("slug", slug);

      // Auto-génération du titre SEO si vide
      if (!watchMetaTitle) {
        setValue("metaTitle", `${watchName} - Cosmétiques Bio Premium`);
      }
    }
  }, [watchName, setValue, watchMetaTitle]);

  // Auto-génération de la description SEO
  useEffect(() => {
    if (watchName && !watchMetaDescription) {
      setValue(
        "metaDescription",
        `Découvrez ${watchName}, un soin bio premium formulé avec des ingrédients naturels. Livraison gratuite dès 50€.`
      );
    }
  }, [watchName, setValue, watchMetaDescription]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      // Préparer les données avec les images
      const productData = {
        ...data,
        images: images,
      };

      console.log("Données du produit:", productData);

      // Appel API pour créer le produit
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Erreur lors de la création du produit"
        );
      }

      console.log("Produit créé:", result.product);

      // Redirection vers la liste des produits
      router.push("/admin/products");
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      alert(
        "Erreur lors de la création du produit: " + (error as Error).message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors duration-300 border border-gray-200 cursor-pointer"
              title="Retour à la liste des produits"
              aria-label="Retour à la liste des produits"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nouveau Produit
              </h1>
              <p className="text-gray-600 mt-1">
                Ajoutez un nouveau produit à votre catalogue
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations de base
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-700">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="Ex: Crème Hydratante Bio à l'Aloe Vera"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description courte *
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="Description qui apparaîtra sur les cartes produits"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée
                </label>
                <textarea
                  {...register("longDescription")}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="Description complète qui apparaîtra sur la page produit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400 text-zinc-700"
                >
                  <option
                    value=""
                    title="Sélectionner une catégorie"
                  >
                    {categories.length === 0
                      ? "Chargement des catégories..."
                      : "Sélectionner une catégorie"}
                  </option>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      Aucune catégorie disponible
                    </option>
                  )}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  {...register("sku")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="Ex: CHA-001"
                />
              </div>
            </div>
          </div>

          {/* Détails produit pour l'accordéon */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Détails produit (pour l&apos;accordéon)
            </h2>

            <div className="space-y-6 text-zinc-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingrédients
                </label>
                <textarea
                  {...register("ingredients")}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="Ex: Formulé avec des ingrédients biologiques certifiés :&#10;&#10;• Huile d'argan bio - Nourrit et régénère&#10;• Beurre de karité - Hydrate en profondeur&#10;• Aloe vera - Apaise et rafraîchit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode d&apos;emploi
                </label>
                <textarea
                  {...register("usage")}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="Ex: Application recommandée :&#10;&#10;1. Nettoyez votre peau avec un démaquillant doux&#10;2. Appliquez une petite quantité sur peau propre et sèche&#10;3. Massez délicatement du centre vers l'extérieur du visage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bienfaits
                </label>
                <textarea
                  {...register("benefits")}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="Ex: Les bienfaits de ce soin :&#10;&#10;• Hydratation intense et durable&#10;• Nutrition en profondeur&#10;• Apaisement des irritations&#10;• Révélation de l'éclat naturel"
                />
              </div>
            </div>
          </div>

          {/* Prix et stock */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-zinc-700">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Prix et Stock
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de vente * (€)
                </label>
                <input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="29.99"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de comparaison (€)
                </label>
                <input
                  {...register("comparePrice", {
                    setValueAs: (value) =>
                      value === "" ? undefined : parseFloat(value),
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="39.99 (optionnel)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Prix barré pour les promotions (optionnel)
                </p>
                {watchComparePrice &&
                  watchPrice &&
                  watchComparePrice <= watchPrice && (
                    <p className="text-orange-500 text-sm mt-1">
                      Le prix de comparaison devrait être supérieur au prix de
                      vente
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700">
                  Stock initial *
                </label>
                <input
                  {...register("stock", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="25"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.stock.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seuil stock faible
                </label>
                <input
                  {...register("lowStockThreshold", {
                    setValueAs: (value) => (value === "" ? 5 : parseInt(value)),
                  })}
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alerte quand le stock atteint ce niveau
                </p>
              </div>

              <div className="flex items-center">
                <input
                  {...register("trackStock")}
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Suivre le stock
                </label>
              </div>
            </div>
          </div>

          {/* Caractéristiques physiques */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Caractéristiques physiques
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids (kg)
                </label>
                <input
                  {...register("weight", {
                    setValueAs: (value) =>
                      value === "" ? undefined : parseFloat(value),
                  })}
                  type="number"
                  step="0.001"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="0.05 (optionnel)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (L x l x H)
                </label>
                <input
                  {...register("dimensions")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="5cm x 5cm x 6cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code-barres
                </label>
                <input
                  {...register("barcode")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="123456789012"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-zinc-700">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Images</h2>

            <CloudinaryUpload
              images={images}
              onImagesChange={setImages}
              maxImages={8}
            />
          </div>

          {/* SEO amélioré */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-zinc-700">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              SEO et référencement
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du produit (slug) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                    /products/
                  </span>
                  <input
                    {...register("slug")}
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                    placeholder="url-du-produit"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Se génère automatiquement à partir du nom du produit
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre SEO
                  <span className="text-xs text-gray-500 ml-2">
                    ({watchMetaTitle?.length || 0}/60 caractères)
                  </span>
                </label>
                <input
                  {...register("metaTitle")}
                  type="text"
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="Titre pour les moteurs de recherche"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se génère automatiquement. Optimal : 50-60 caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description SEO
                  <span className="text-xs text-gray-500 ml-2">
                    ({watchMetaDescription?.length || 0}/160 caractères)
                  </span>
                </label>
                <textarea
                  {...register("metaDescription")}
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none placeholder:text-gray-400"
                  placeholder="Description pour les moteurs de recherche"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se génère automatiquement. Optimal : 150-160 caractères
                </p>
              </div>

              {/* Aperçu SEO */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Aperçu dans les résultats de recherche
                </h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg font-medium line-clamp-1">
                    {watchMetaTitle || watchName || "Titre du produit"}
                  </div>
                  <div className="text-green-700 text-sm">
                    votresite.com/products/{watch("slug") || "url-produit"}
                  </div>
                  <div className="text-gray-600 text-sm line-clamp-2">
                    {watchMetaDescription ||
                      "Description du produit qui apparaîtra dans les résultats de recherche Google."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Statut</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register("isActive")}
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Produit actif (visible sur le site)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register("isFeatured")}
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Mettre en vedette (apparaîtra en homepage)
                </label>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isSubmitting ? "Création..." : "Créer le produit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
