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

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          // Ensure quantity never goes below 1
          return { ...item, quantity: Math.max(1, newQuantity) };
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
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const businessName =
      profile?.business_users?.find(
        (bu) => bu.business_id === profile.current_business_id,
      )?.business.business_name || "POS PRO";

    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Generate a random order number (or you can use a real one from the created order)
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const receiptContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            background: #fff;
            color: #000;
            padding: 20px 16px;
            width: 100%;
            max-width: 380px;
            margin: 0 auto;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            margin-bottom: 16px;
          }
          .business-name {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .receipt-title {
            font-size: 14px;
            margin: 4px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 12px 0;
          }
          .divider-double {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            height: 4px;
            margin: 12px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
          }
          .item-row {
            display: flex;
            font-size: 14px;
            margin-bottom: 4px;
          }
          .item-qty {
            width: 30px;
            text-align: right;
            padding-right: 8px;
          }
          .item-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .item-price {
            width: 80px;
            text-align: right;
          }
          .totals {
            margin-top: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
          }
          .total-row-bold {
            font-weight: bold;
            font-size: 16px;
            margin-top: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
          }
          .barcode {
            font-family: 'Libre Barcode 39', 'Courier New', monospace;
            font-size: 40px;
            text-align: center;
            margin: 8px 0;
            letter-spacing: 4px;
          }
          .thankyou {
            margin-top: 12px;
            font-weight: bold;
          }
        </style>
        <!-- Optional barcode font -->
        <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="header">
          <div class="business-name">${businessName}</div>
          <div class="receipt-title">SALES RECEIPT</div>
          <div class="info-row">
            <span>${formattedDate}</span>
            <span>${formattedTime}</span>
          </div>
          <div class="info-row" style="margin-top: 4px;">
            <span>Order #: ${orderNumber}</span>
            <span>Cashier: ${profile?.full_name || "Staff"}</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Items Header -->
        <div class="item-row" style="font-weight: bold; margin-bottom: 8px;">
        <span class="item-name">ITEM</span>
        <span class="item-price">UNIT PRICE</span>
        <span class="item-qty">QTY</span>
        <span class="item-price">PRICE</span>
        </div>

        <!-- Items -->
        ${cart
          .map(
            (item) => `
          <div class="item-row">
          <span class="item-name">${item.product_name}</span>
          <span class="item-price">$${(item.default_price || 0).toFixed(2)}</span>
          <span class="item-qty">${item.quantity}</span>
          <span class="item-price">$${((item.default_price || 0) * item.quantity).toFixed(2)}</span>
          </div>
        `,
          )
          .join("")}

        <div class="divider"></div>

        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>SUBTOTAL</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>TAX (10%)</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="total-row total-row-bold">
            <span>TOTAL</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="divider-double"></div>

        <!-- Payment Info -->
        <div class="info-row">
          <span>Payment:</span>
          <span>CASH</span>
        </div>
        <div class="info-row">
          <span>Change:</span>
          <span>$0.00</span>
        </div>

        <div class="divider"></div>

        <!-- Barcode (simulated with text) -->
        <div class="barcode">*${orderNumber}*</div>

        <div class="footer">
          <div>Thank you for your purchase!</div>
          <div style="margin-top: 8px;">*** CUSTOMER COPY ***</div>
        </div>
      </body>
    </html>
  `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    // Slight delay to ensure fonts/styles load
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
            <div
              className={`grid gap-lg pb-lg ${cart.length > 0 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
            >
              {filteredProducts.map((product: CatalogProduct) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm p-lg hover:shadow-md transition-shadow cursor-pointer group"
                >
                  {" "}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="w-64 h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 text-4xl font-bold mb-lg group-hover:bg-primary-50 group-hover:text-primary transition-colors">
                      {product.product_name.charAt(0)}
                    </div>
                  )}
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

        {cart.length > 0 && (
          <Cart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeCartItem}
            onCheckout={handleCheckout}
          />
        )}
      </div>
    </POSLayout>
  );
};

export default DashboardPage;
