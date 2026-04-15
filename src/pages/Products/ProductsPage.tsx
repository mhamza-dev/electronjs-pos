import React, { useEffect, useState } from "react";
import POSLayout from "../../components/Layout/POSLayout";
import { useAuth } from "../../contexts/AuthContext";
import { itemsService } from "../../services/items";
import { useAPI } from "../../hooks/useAPI";
import { Item } from "../../data/type";
import { Button } from "../../components/Buttons";
import FormModal from "./FormModal";

const ProductsPage: React.FC = () => {
  const { profile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const defaultItem: Item = {
    id: "",
    name: "",
    sku: "",
    price: 0,
    cost: 0,
    type: "",
    is_active: true,
    business_id: profile?.current_business_id ?? "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const [item, setItem] = useState<Item>(defaultItem);

  const {
    data: products,
    loading,
    request: fetchProducts,
  } = useAPI(itemsService.getItems);

  useEffect(() => {
    if (profile?.current_business_id) {
      fetchProducts(profile.current_business_id);
    }
  }, [profile]);

  const handleOpenModal = (item?: Item) => {
    item && setItem(item);
    setShowModal(true);
  };

  const handleCloseModel = () => {
    setShowModal(false);
    setItem(defaultItem);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    )
      return;
    try {
      await itemsService.deleteItem(id);
      if (profile?.current_business_id) {
        await fetchProducts(profile.current_business_id);
      }
    } catch (err: any) {
      alert(err.message || "Delete failed. Only admins can delete items.");
    }
  };

  const handleToggleStatus = async (item: Item) => {
    try {
      await itemsService.toggleItemStatus(item.id, !item.is_active);
      if (profile?.current_business_id) {
        await fetchProducts(profile.current_business_id);
      }
    } catch (err: any) {
      alert(err.message || "Status update failed.");
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
            {(products || []).map((product: Item) => (
              <div
                key={product.id}
                className={`bg-white border rounded-xl shadow-sm p-lg hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between ${
                  !product.is_active
                    ? "opacity-60 border-gray-200"
                    : "border-gray-100"
                }`}
              >
                <div>
                  <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 text-4xl font-bold mb-lg group-hover:bg-primary-50 group-hover:text-primary transition-colors">
                    {product.name.charAt(0)}
                  </div>
                  <div className="flex flex-col space-y-xs">
                    <span className="text-lg font-bold text-gray-800 truncate">
                      {product.name}
                    </span>
                    <span className="text-sm text-gray-400">
                      {product.type || "Unknown"} • SKU: {product.sku}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-xl">
                  <span className="text-xl font-black text-primary">
                    ${product.price.toFixed(2)}
                  </span>
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
      showModal &&{" "}
      <FormModal
        isVisible={showModal}
        profile={profile}
        onClose={handleCloseModel}
        item={item}
      />
    </POSLayout>
  );
};

export default ProductsPage;
