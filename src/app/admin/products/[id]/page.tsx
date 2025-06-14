"use client";

import CloudinaryUpload from "@/components/CloudinaryUpload";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  slug: string;
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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
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
    metaTitle: "",
    metaDescription: "",
    isActive: true,
    isFeatured: false,
  });

  const [images, setImages] = useState<string[]>([]);

  // Résoudre les params
  useEffect(() => {
    params.then(({ id }) => {
      setProductId(id);
    });
  }, [params]);

  // Charger le produit et les catégories
  useEffect(() => {
    if (!productId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Charger le produit spécifique
        const productRes = await fetch(`/api/admin/products/${productId}`);
        if (!productRes.ok) {
          throw new Error("Produit non trouvé");
        }
        const foundProduct = await productRes.json();
        setProduct(foundProduct);

        // Remplir le formulaire
        setFormData({
          name: foundProduct.name || "",
          description: foundProduct.description || "",
          longDescription: foundProduct.longDescription || "",
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
          metaTitle: foundProduct.metaTitle || "",
          metaDescription: foundProduct.metaDescription || "",
          isActive: foundProduct.isActive ?? true,
          isFeatured: foundProduct.isFeatured ?? false,
        });

        // Extraire les URLs des images
        const imageUrls =
          foundProduct.images?.map((img: ProductImage) => img.url) || [];
        setImages(imageUrls);

        // Charger les catégories
        const categoriesRes = await fetch("/api/categories");
        const categoriesData = await categoriesRes.json();
        console.log("Categories loaded:", categoriesData);
        setCategories(categoriesData.categories || []);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations de base
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Crème hydratante bio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  title="Sélectionner une catégorie"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {/* Debug - à supprimer en production */}
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-2 text-xs text-gray-500">
                    Debug: {categories.length} catégories chargées
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 text-zinc-700">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description courte *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Description courte du produit..."
              />
            </div>

            <div className="mt-6 text-zinc-700">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée
              </label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Description détaillée du produit..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Images du produit
            </h2>
            <CloudinaryUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
          </div>

          {/* Prix et stock */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Prix et stock
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de vente (€) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  title="Prix de vente en euros"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix comparé (€)
                </label>
                <input
                  type="number"
                  name="comparePrice"
                  value={formData.comparePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  title="Prix comparé en euros"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  title="Quantité en stock"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Options
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  title="Produit actif"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Produit actif (visible sur le site)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  title="Produit en vedette"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Produit en vedette
                </label>
              </div>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
