import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { catalogService } from "../../services";
import { useAPI } from "../../hooks/useAPI";
import { CatalogProduct, CatalogProductInsert } from "../../data/type";
import { Button } from "../../components/Buttons";
import ProductForm from "../../components/Modals/ProductForm";
import { uploadService } from "../../services/upload";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
} from "lucide-react";

const ProductsPage: React.FC = () => {
  const { profile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: products,
    loading,
    request: fetchProducts,
  } = useAPI(catalogService.getProducts);

  const { request: deleteProduct } = useAPI(catalogService.deleteProduct);
  const { request: updateProduct } = useAPI(catalogService.updateProduct);

  useEffect(() => {
    if (profile?.current_business_id) {
      fetchProducts(profile.current_business_id, { isActive: undefined });
    }
  }, [profile]);

  const handleOpenModal = (product?: CatalogProduct) => {
    setEditingProduct(product || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    )
      return;
    try {
      await deleteProduct(id);
      if (profile?.current_business_id) {
        await fetchProducts(profile.current_business_id);
      }
    } catch (err: any) {
      alert(err.message || "Delete failed.");
    }
  };

  const handleToggleStatus = async (product: CatalogProduct) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      if (profile?.current_business_id) {
        await fetchProducts(profile.current_business_id);
      }
    } catch (err: any) {
      alert(err.message || "Status update failed.");
    }
  };

  const handleSubmit = async (values: CatalogProductInsert) => {
    try {
      let imageUrl: string | null = null;

      if (values.image_url instanceof File) {
        const uploadResult = await uploadService.uploadProductImage(
          values.image_url,
          profile!.current_business_id!,
          profile!.id,
        );
        imageUrl = uploadResult.publicUrl;

        if (editingProduct?.image_url) {
          const oldPath = uploadService.extractPathFromUrl(
            editingProduct.image_url,
          );
          if (oldPath) {
            await uploadService.deleteFile(oldPath).catch((err) => {
              console.warn("Failed to delete old image:", err);
            });
          }
        }
      } else if (typeof values.image_url === "string") {
        imageUrl = values.image_url;
      } else {
        imageUrl = null;
      }

      const productData = {
        product_name: values.product_name,
        sku: values.sku ?? null,
        barcode: values.barcode ?? null,
        description: values.description ?? null,
        uom: values.uom ?? "ea",
        default_price: values.default_price ?? null,
        cost_price: values.cost_price ?? null,
        is_active: values.is_active ?? true,
        image_url: imageUrl,
      };

      if (editingProduct) {
        await catalogService.updateProduct(editingProduct.id, productData);
      } else {
        await catalogService.createProduct(
          profile!.current_business_id!,
          productData,
          values.category_ids,
        );
      }

      if (profile?.current_business_id) {
        await fetchProducts(profile.current_business_id);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    }
  };

  const filteredProducts = (products || []).filter(
    (p: CatalogProduct) =>
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header Section */}
      <div className="flex-shrink-0 space-y-lg pb-lg">
        {/* Title and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
          <div className="space-y-xs">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-sm">
              <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              Products
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your inventory, pricing, and product details
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenModal()}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4 mr-xs" />
            Add Product
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Form
              initialValues={{ searchQuery: "" }}
              onSubmit={(values) => setSearchQuery(values.searchQuery)}
              validateOnChange
            >
              <TextInput
                name="searchQuery"
                type="text"
                placeholder="Search by name, SKU, or description..."
                className="pl-9"
              />
            </Form>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredProducts.length} item
            {filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Scrollable Products Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && !products ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-lg animate-pulse"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-lg" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-sm" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-md" />
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg pb-lg">
            {filteredProducts.map((product: CatalogProduct) => (
              <div
                key={product.id}
                className={`group relative bg-white dark:bg-gray-800 border rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-all overflow-hidden ${
                  !product.is_active
                    ? "opacity-60 border-gray-200 dark:border-gray-700"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`inline-flex items-center px-sm py-0.5 rounded-full text-xs font-medium ${
                      product.is_active
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Image */}
                <div
                  className="aspect-square bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => handleOpenModal(product)}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-500">
                      <ImageIcon className="w-12 h-12 mb-sm" />
                      <span className="text-sm font-medium">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {product.product_name}
                  </h3>
                  <div className="flex items-center gap-xs mt-xs text-sm text-gray-500 dark:text-gray-400">
                    <span>SKU: {product.sku || "—"}</span>
                    <span>•</span>
                    <span>{product.uom || "ea"}</span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-sm line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between mt-lg">
                    <div>
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        ${(product.default_price || 0).toFixed(2)}
                      </span>
                      {product.cost_price && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 block">
                          Cost: ${product.cost_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-xs">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className="p-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-400/20 rounded-lg transition-colors"
                        title={product.is_active ? "Deactivate" : "Activate"}
                      >
                        {product.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-sm text-gray-500 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-3xl px-lg text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-lg">
              <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-xs">
              No products found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-lg">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Get started by adding your first product"}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenModal()}
              >
                <Plus className="w-4 h-4 mr-xs" />
                Add Product
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showModal && (
        <ProductForm
          isVisible={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          item={editingProduct}
        />
      )}
    </div>
  );
};

export default ProductsPage;
