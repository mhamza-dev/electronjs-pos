import React, { useEffect, useState } from "react";
import POSLayout from "../../components/Layout/POSLayout";
import { CatalogProduct, CartItem } from "../../data/type";
import { useAuth } from "../../contexts/AuthContext";
import { catalogService, posService } from "../../services";
import { useAPI } from "../../hooks/useAPI";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import Cart from "../../components/Cart";

const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products from catalog
  const { data: products, request: fetchProducts } = useAPI(
    catalogService.getProducts,
  );

  // Create sales order
  const { request: createOrder } = useAPI(posService.createOrder);

  useEffect(() => {
    if (profile?.current_business_id) {
      fetchProducts(profile.current_business_id, { isActive: true });
    }
  }, [profile]);

  const addToCart = (product: CatalogProduct) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + (item.default_price || 0) * item.quantity,
    0,
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0 || !profile?.current_business_id) return;

    try {
      // Prepare items for order
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.default_price || 0,
      }));

      // Create the order (cashier_employee_id can be null for now)
      await createOrder(profile.current_business_id, {
        items: orderItems,
        payment_status: "paid",
      });

      // Print receipt
      printReceipt();

      alert(`Order Placed! Total: $${total.toFixed(2)}`);
      setCart([]);
    } catch (err) {
      console.error(err);
      alert("Failed to process checkout");
    }
  };

  const printReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: 'Poppins', sans-serif; padding: 20px; width: 300px; }
            .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
            .total { border-top: 1px dashed #ccc; margin-top: 10px; padding-top: 10px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>POS PRO RECEIPT</h3>
            <p>${new Date().toLocaleString()}</p>
          </div>
          ${cart
            .map(
              (item) => `
            <div class="item">
              <span>${item.product_name} x ${item.quantity}</span>
              <span>$${((item.default_price || 0) * item.quantity).toFixed(2)}</span>
            </div>
          `,
            )
            .join("")}
          <div class="total">
            <div class="item"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="item"><span>Tax</span><span>$${tax.toFixed(2)}</span></div>
            <div class="item" style="font-size: 18px;"><span>Total</span><span>$${total.toFixed(2)}</span></div>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter products based on search
  const filteredProducts = (products || []).filter(
    (p: CatalogProduct) =>
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  return (
    <POSLayout>
      <div className="flex h-full space-x-lg overflow-hidden">
        {/* Product Grid */}
        <div className="flex-1 flex flex-col space-y-lg min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Available Products
            </h2>
            <Form
              initialValues={{ searchQuery: "" }}
              onSubmit={(values) => setSearchQuery(values.searchQuery)}
              validateOnChange={true}
            >
              <TextInput
                name="searchQuery"
                type="text"
                placeholder="Search products..."
                className="w-64"
              />
            </Form>
          </div>

          <div className="flex-1 overflow-y-auto pr-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg pb-lg">
              {filteredProducts.map((product: CatalogProduct) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm p-lg hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 text-4xl font-bold mb-lg group-hover:bg-primary-50 group-hover:text-primary transition-colors">
                    {product.product_name.charAt(0)}
                  </div>
                  <div className="flex flex-col space-y-xs">
                    <span className="text-lg font-bold text-gray-800 truncate">
                      {product.product_name}
                    </span>
                    <span className="text-sm text-gray-400">
                      {product.sku || "No SKU"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-xl">
                    <span className="text-xl font-black text-primary">
                      ${(product.default_price || 0).toFixed(2)}
                    </span>
                    <button className="p-sm bg-gray-50 group-hover:bg-primary group-hover:text-white rounded-lg transition-colors text-gray-400">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Cart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeCartItem}
          onCheckout={handleCheckout}
        />
      </div>
    </POSLayout>
  );
};

export default DashboardPage;
