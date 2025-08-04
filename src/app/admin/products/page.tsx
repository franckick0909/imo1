"use client";

import { useSession } from "@/lib/auth-client";
import {
  AlertTriangle,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Package,
  Plus,
  Search,
  Shield,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteProductAction,
  getCategoriesAction,
  getProductsAction,
  toggleProductActiveAction,
  toggleProductFeaturedAction,
} from "./actions";

// Types pour les produits admin
interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  slug: string;
  weight: number | null;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  longDescription: string | null;
  ingredients: string | null;
  usage: string | null;
  benefits: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  images: {
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }[];
}

// Types pour les catégories admin
interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productsCount: number;
}

// Types pour les filtres
interface ProductsFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  lowStock?: boolean;
  sortBy?: "name" | "price" | "stock" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Types pour la pagination
interface ProductsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminProductsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // États locaux pour les données
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [productsPagination, setProductsPagination] =
    useState<ProductsPagination | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Vérifier les permissions admin et charger les données
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.role === "admin") {
        setIsAdmin(true);
        // Charger les produits et catégories
        await loadProductsData(1);
        await loadCategoriesData();
      } else {
        router.push("/dashboard");
      }
    };

    if (session) {
      checkAdminStatus();
    }
  }, [session, router]);

  // Fonction pour charger les produits
  const loadProductsData = async (
    page: number,
    filters: ProductsFilters = {}
  ) => {
    setIsLoadingProducts(true);
    try {
      const data = await getProductsAction(page, 10, filters);
      setProducts(data.products as AdminProduct[]);
      setProductsPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fonction pour charger les catégories
  const loadCategoriesData = async () => {
    try {
      const data = await getCategoriesAction();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  // Gérer la recherche et les filtres
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    loadProductsData(1, {
      search: term,
      categoryId: categoryFilter,
      isActive:
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
            ? false
            : undefined,
    });
  };

  const handleCategoryFilter = (categoryId: string) => {
    setCategoryFilter(categoryId);
    loadProductsData(1, {
      search: searchTerm,
      categoryId: categoryId || undefined,
      isActive:
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
            ? false
            : undefined,
    });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadProductsData(1, {
      search: searchTerm,
      categoryId: categoryFilter,
      isActive:
        status === "active" ? true : status === "inactive" ? false : undefined,
    });
  };

  // Gérer la pagination
  const handlePageChange = (page: number) => {
    const filters: ProductsFilters = {
      search: searchTerm,
      categoryId: categoryFilter,
      isActive:
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
            ? false
            : undefined,
    };
    loadProductsData(page, filters);
  };

  // Gérer les actions sur les produits
  const handleToggleActive = async (productId: string) => {
    try {
      await toggleProductActiveAction(productId);
      // Recharger les produits pour mettre à jour l'affichage
      await loadProductsData(1, {
        search: searchTerm,
        categoryId: categoryFilter,
        isActive:
          statusFilter === "active"
            ? true
            : statusFilter === "inactive"
              ? false
              : undefined,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      await toggleProductFeaturedAction(productId);
      // Recharger les produits pour mettre à jour l'affichage
      await loadProductsData(1, {
        search: searchTerm,
        categoryId: categoryFilter,
        isActive:
          statusFilter === "active"
            ? true
            : statusFilter === "inactive"
              ? false
              : undefined,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteProductAction(productId);
        // Recharger les produits pour mettre à jour l'affichage
        await loadProductsData(1, {
          search: searchTerm,
          categoryId: categoryFilter,
          isActive:
            statusFilter === "active"
              ? true
              : statusFilter === "inactive"
                ? false
                : undefined,
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  // Calculer les statistiques
  const stats = {
    total: products?.length || 0,
    active: products?.filter((p) => p.isActive).length || 0,
    inactive: products?.filter((p) => !p.isActive).length || 0,
    featured: products?.filter((p) => p.isFeatured).length || 0,
    lowStock:
      products?.filter((p) => p.stock <= p.lowStockThreshold).length || 0,
    outOfStock: products?.filter((p) => p.stock === 0).length || 0,
    totalStock: products?.reduce((sum, p) => sum + p.stock, 0) || 0,
  };

  if (isPending || isLoadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-lg font-medium">
            Chargement des produits...
          </span>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-600">
            Vous n&apos;avez pas les permissions nécessaires.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center min-h-16 gap-4">
            <div className="flex items-center space-x-4 sm:space-x-8 md:space-x-10 lg:space-x-12">
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-emerald-600" />
                <h1 className="heading-md font-metal font-bold text-gray-900">
                  Gestion des produits
                </h1>
              </div>
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition duration-200"
              >
                ← Retour à l&apos;admin
              </Link>
            </div>
            <div className="flex items-center space-x-4 ml-8 ">
              <span className="text-sm text-gray-600">
                Connecté en tant que{" "}
                <strong>{session.user.name || session.user.email}</strong>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header avec actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Produits</h2>
            <p className="text-gray-600">
              Gérez votre catalogue de produits et leur visibilité
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Link
              href="/admin/products/new"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau produit</span>
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Produits
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Produits Actifs
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.inactive} inactifs
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Vedette</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.featured}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalStock}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.lowStock} en rupture
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filtrer par catégorie"
              >
                <option value="">Toutes les catégories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des produits */}
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">
              Chargement des produits...
            </span>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products?.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.images?.length > 0 ? (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.images[0].alt || product.name}
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {product.description || "Aucune description"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {product.category?.name || "Sans catégorie"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {product.price.toFixed(2)}€
                            {product.comparePrice && (
                              <span className="text-gray-500 line-through ml-2">
                                {product.comparePrice.toFixed(2)}€
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">
                              {product.stock}
                            </span>
                            {product.stock <= product.lowStockThreshold && (
                              <AlertTriangle className="ml-2 h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.isActive ? "Actif" : "Inactif"}
                            </span>
                            {product.isFeatured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Vedette
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() =>
                                router.push(`/admin/products/${product.id}`)
                              }
                              className="text-emerald-600 hover:text-emerald-900 transition-colors"
                              title="Modifier"
                              aria-label="Modifier le produit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleToggleActive(product.id)}
                              className={`transition-colors ${
                                product.isActive
                                  ? "text-red-600 hover:text-red-900"
                                  : "text-green-600 hover:text-green-900"
                              }`}
                              title={
                                product.isActive ? "Désactiver" : "Activer"
                              }
                              aria-label={
                                product.isActive
                                  ? "Désactiver le produit"
                                  : "Activer le produit"
                              }
                            >
                              {product.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleToggleFeatured(product.id)}
                              className={`transition-colors ${
                                product.isFeatured
                                  ? "text-yellow-600 hover:text-yellow-900"
                                  : "text-gray-400 hover:text-yellow-600"
                              }`}
                              title={
                                product.isFeatured
                                  ? "Retirer de la vedette"
                                  : "Mettre en vedette"
                              }
                              aria-label={
                                product.isFeatured
                                  ? "Retirer de la vedette"
                                  : "Mettre en vedette"
                              }
                            >
                              <Star className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Supprimer"
                              aria-label="Supprimer le produit"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {productsPagination && productsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de{" "}
                        <span className="font-medium">
                          {(productsPagination.page - 1) *
                            productsPagination.limit +
                            1}
                        </span>{" "}
                        à{" "}
                        <span className="font-medium">
                          {Math.min(
                            productsPagination.page * productsPagination.limit,
                            productsPagination.total
                          )}
                        </span>{" "}
                        sur{" "}
                        <span className="font-medium">
                          {productsPagination.total}
                        </span>{" "}
                        résultats
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handlePageChange(productsPagination.page - 1)
                        }
                        disabled={productsPagination.page === 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(productsPagination.page + 1)
                        }
                        disabled={
                          productsPagination.page ===
                          productsPagination.totalPages
                        }
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
