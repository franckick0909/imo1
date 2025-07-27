"use client";

import CloudinaryUpload from "@/components/CloudinaryUpload";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Styles CSS personnalisés pour améliorer la visibilité
const customStyles = `
  .admin-form input::placeholder,
  .admin-form textarea::placeholder {
    color: #6b7280 !important;
    opacity: 1 !important;
  }
  
  .admin-form select {
    color: #111827 !important;
    background-color: white !important;
  }
  
  .admin-form select option {
    color: #111827 !important;
    background-color: white !important;
  }
  
  .admin-form select option[value=""] {
    color: #6b7280 !important;
  }
  
  .admin-form input,
  .admin-form textarea {
    color: #111827 !important;
  }
`;

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string | null;

  // Nouveaux champs pour les détails produits
  ingredients: string | null;
  usage: string | null;
  benefits: string | null;

  price: number;
  comparePrice: number | null;
  sku: string;
  barcode: string | null;
  stock: number;
  lowStockThreshold: number;
  trackStock: boolean;
  weight: number | null;
  dimensions: string | null;
  categoryId: string;

  // SEO
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;

  isActive: boolean;
  isFeatured: boolean;
  category: Category;
  images: ProductImage[];
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [productId, setProductId] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state étendu
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",

    // Nouveaux champs pour les détails produits
    ingredients: "",
    usage: "",
    benefits: "",

    price: 0,
    comparePrice: 0,
    sku: "",
    barcode: "",
    stock: 0,
    lowStockThreshold: 5,
    trackStock: true,
    weight: 0,
    dimensions: "",
    categoryId: "",

    // SEO
    slug: "",
    metaTitle: "",
    metaDescription: "",

    isActive: true,
    isFeatured: false,
  });

  const [images, setImages] = useState<string[]>([]);

  // Fonction utilitaire pour la génération de slug
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
    if (formData.name && !formData.slug) {
      const slug = generateSlug(formData.name);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, formData.slug]);

  // Auto-génération du titre SEO
  useEffect(() => {
    if (formData.name && !formData.metaTitle) {
      setFormData((prev) => ({
        ...prev,
        metaTitle: `${formData.name} - Cosmétiques Bio Premium`,
      }));
    }
  }, [formData.name, formData.metaTitle]);

  // Auto-génération de la description SEO
  useEffect(() => {
    if (formData.name && !formData.metaDescription) {
      setFormData((prev) => ({
        ...prev,
        metaDescription: `Découvrez ${formData.name}, un soin bio premium formulé avec des ingrédients naturels. Livraison gratuite dès 50€.`,
      }));
    }
  }, [formData.name, formData.metaDescription]);

  // Résoudre les params
  useEffect(() => {
    params.then(({ id }) => {
      setProductId(id);
    });
  }, [params]);

  // Charger le produit et les catégories en parallèle
  useEffect(() => {
    if (!productId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Charger le produit et les catégories en parallèle
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch("/api/categories"),
        ]);

        if (!productRes.ok) {
          throw new Error("Produit non trouvé");
        }

        const [foundProduct, categoriesData] = await Promise.all([
          productRes.json(),
          categoriesRes.json(),
        ]);

        setProduct(foundProduct);
        setCategories(categoriesData.categories || []);

        // Remplir le formulaire
        setFormData({
          name: foundProduct.name || "",
          description: foundProduct.description || "",
          longDescription: foundProduct.longDescription || "",
          ingredients: foundProduct.ingredients || "",
          usage: foundProduct.usage || "",
          benefits: foundProduct.benefits || "",
          price: Number(foundProduct.price) || 0,
          comparePrice: Number(foundProduct.comparePrice) || 0,
          sku: foundProduct.sku || "",
          barcode: foundProduct.barcode || "",
          stock: Number(foundProduct.stock) || 0,
          lowStockThreshold: Number(foundProduct.lowStockThreshold) || 5,
          trackStock: foundProduct.trackStock ?? true,
          weight: Number(foundProduct.weight) || 0,
          dimensions: foundProduct.dimensions || "",
          categoryId: foundProduct.categoryId || "",
          slug: foundProduct.slug || "",
          metaTitle: foundProduct.metaTitle || "",
          metaDescription: foundProduct.metaDescription || "",
          isActive: foundProduct.isActive ?? true,
          isFeatured: foundProduct.isFeatured ?? false,
        });

        // Extraire les URLs des images
        const imageUrls =
          foundProduct.images?.map((img: ProductImage) => img.url) || [];
        setImages(imageUrls);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError("Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.categoryId
    ) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...formData,
        images, // Inclure les images dans le payload
      };

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      // Rediriger vers la liste des produits
      router.push("/admin/products");
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      {/* Styles CSS personnalisés */}
      <style jsx>{customStyles}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Modifier le produit
              </h1>
              <p className="text-gray-600 mt-2">
                Modifiez les informations de votre produit
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/products")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6 admin-form">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">
              Informations de base
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Ex: Crème hydratante bio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Catégorie *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  title="Sélectionner une catégorie"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Aucune catégorie disponible. Créez d&apos;abord des
                    catégories.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Description courte *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Description courte du produit..."
              />
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Description détaillée
              </label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Description détaillée du produit..."
              />
            </div>
          </div>

          {/* Détails produit pour l'accordéon */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">
              Détails produit (pour l&apos;accordéon)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ingrédients
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Ex: Formulé avec des ingrédients biologiques certifiés :&#10;&#10;• Huile d'argan bio - Nourrit et régénère&#10;• Beurre de karité - Hydrate en profondeur&#10;• Aloe vera - Apaise et rafraîchit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mode d&apos;emploi
                </label>
                <textarea
                  name="usage"
                  value={formData.usage}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Ex: Application recommandée :&#10;&#10;1. Nettoyez votre peau avec un démaquillant doux&#10;2. Appliquez une petite quantité sur peau propre et sèche&#10;3. Massez délicatement du centre vers l'extérieur du visage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Bienfaits
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Ex: Les bienfaits de ce soin :&#10;&#10;• Hydratation intense et durable&#10;• Nutrition en profondeur&#10;• Apaisement des irritations&#10;• Révélation de l'éclat naturel"
                />
              </div>
            </div>
          </div>

          {/* Prix et stock */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">
              Prix et stock
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Prix de vente (€) *
                </label>
                <input
                  title="Prix de vente"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Prix comparé (€)
                </label>
                <input
                  title="Prix comparé"
                  type="number"
                  name="comparePrice"
                  value={formData.comparePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Stock
                </label>
                <input
                  title="Stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">
              Images du produit
            </h2>
            <CloudinaryUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
          </div>

          {/* SEO amélioré */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">
              SEO et référencement
            </h2>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  URL du produit (slug) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                    /products/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="flex-1 border border-gray-300 rounded-r-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="url-du-produit"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Se génère automatiquement à partir du nom du produit
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Titre SEO
                    <span className="text-xs text-gray-500 ml-2">
                      ({formData.metaTitle?.length || 0}/60 caractères)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    maxLength={60}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Titre pour les moteurs de recherche"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Se génère automatiquement. Optimal : 50-60 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Description SEO
                    <span className="text-xs text-gray-500 ml-2">
                      ({formData.metaDescription?.length || 0}/160 caractères)
                    </span>
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={160}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Description pour les moteurs de recherche"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Se génère automatiquement. Optimal : 150-160 caractères
                  </p>
                </div>
              </div>

              {/* Aperçu SEO */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Aperçu dans les résultats de recherche
                </h4>
                <div className="space-y-2">
                  <div className="text-blue-600 text-lg font-medium line-clamp-1">
                    {formData.metaTitle || formData.name || "Titre du produit"}
                  </div>
                  <div className="text-green-700 text-sm">
                    votresite.com/products/{formData.slug || "url-produit"}
                  </div>
                  <div className="text-gray-600 text-sm line-clamp-2">
                    {formData.metaDescription ||
                      "Description du produit qui apparaîtra dans les résultats de recherche Google."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">
              Options
            </h2>

            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  title="Produit actif"
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Produit actif (visible sur le site)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  title="Produit en vedette"
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Produit en vedette
                </label>
              </div>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
