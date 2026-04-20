import React, { useEffect, useState } from "react";
import POSLayout from "../../components/Layout/POSLayout";
import { useAuth } from "../../contexts/AuthContext";
import { catalogService } from "../../services";
import { useAPI } from "../../hooks/useAPI";
import { CatalogProduct, CatalogProductInsert } from "../../data/type";
import { Button } from "../../components/Buttons";
import ProductForm from "./ProductForm";

const ProductsPage: React.FC = () => {
  const { profile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(
    null,
  );

  const {
    data: products,
    loading,
    request: fetchProducts,
  } = useAPI(catalogService.getProducts);

  const { loading: _deleteLoading, request: deleteProduct } = useAPI(
    catalogService.deleteProduct,
  );

  const { loading: _toggleLoading, request: updateProduct } = useAPI(
    catalogService.updateProduct,
  );

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
      const productData = {
        product_name: values.product_name,
        sku: values.sku ?? null,
        barcode: values.barcode ?? null,
        description: values.description ?? null,
        uom: values.uom ?? "ea",
        default_price: values.default_price ?? null,
        cost_price: values.cost_price ?? null,
        is_active: values.is_active ?? true,
        image_url: values.image_url ?? null,
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

  return (
    <POSLayout>
      <div className="flex flex-col space-y-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Inventory Management
          </h2>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            Add New Product
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-2xl">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg pb-lg">
            {(products || []).map((product: CatalogProduct) => (
              <div
                key={product.id}
                className={`bg-white border rounded-xl shadow-sm p-lg hover:shadow-md transition-shadow group flex flex-col justify-between ${
                  !product.is_active
                    ? "opacity-60 border-gray-200"
                    : "border-gray-100"
                }`}
              >
                <div>
                  <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mb-lg">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-gray-300">
                        {product.product_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col space-y-xs">
                    <span className="text-lg font-bold text-gray-800 truncate">
                      {product.product_name}
                    </span>
                    <span className="text-sm text-gray-400">
                      SKU: {product.sku || "—"} • {product.uom || "ea"}
                    </span>
                    {product.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-xl">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-primary">
                      ${(product.default_price || 0).toFixed(2)}
                    </span>
                    {product.cost_price && (
                      <span className="text-xs text-gray-400">
                        Cost: ${product.cost_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-sm">
                    <button
                      onClick={() => handleToggleStatus(product)}
                      className="p-sm bg-gray-50 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors text-gray-400"
                      title={product.is_active ? "Deactivate" : "Activate"}
                    >
                      {product.is_active ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
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
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-sm bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-400"
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
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4H5"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <ProductForm
          isVisible={showModal}
          profile={profile}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          item={editingProduct}
        />
      )}
    </POSLayout>
  );
};

export default ProductsPage;
