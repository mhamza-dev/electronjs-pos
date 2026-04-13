import React, { useEffect } from "react";
import POSLayout from "../../components/Layout/POSLayout";
import { Product } from "../../data/mockProducts";
import { useAuth } from "../../contexts/AuthContext";
import { productService } from "../../services/pos";
import { useAPI } from "../../hooks/useAPI";

const ProductsPage: React.FC = () => {
  const { profile } = useAuth();

  const {
    data: products,
    loading,
    request: fetchProducts,
  } = useAPI(productService.getProducts);

  useEffect(() => {
    if (profile?.current_business_id) {
      fetchProducts(profile.current_business_id);
    }
  }, [profile, fetchProducts]);

  return (
    <POSLayout>
      <div className="flex flex-col space-y-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Inventory Management
          </h2>
          <button className="bg-primary text-white px-lg py-sm rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100">
            Add New Product
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-2xl">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg pb-lg">
            {(products || []).map((product: Product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-lg hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between"
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
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-xl">
                  <span className="text-xl font-black text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  <div className="flex space-x-sm">
                    <button className="p-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
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
                    <button className="p-sm bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-400">
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
    </POSLayout>
  );
};

export default ProductsPage;
