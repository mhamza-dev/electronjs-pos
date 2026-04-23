import React, { useEffect, useState } from "react";
import { CatalogProduct, CartItem } from "../../data/type";
import { useAuth } from "../../contexts/AuthContext";
import { catalogService, employeeService, posService } from "../../services";
import { useAPI } from "../../hooks/useAPI";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import Cart from "../../components/Cart";
import CashPaymentModal from "../../components/Modals/CashPaymentModal";
import {
  Search,
  Plus,
  Package,
  ShoppingCart,
  Image as ImageIcon,
} from "lucide-react";

const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCashModal, setShowCashModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{
    discount: number;
    totalAfterDiscount: number;
  } | null>(null);

  const { data: products, request: fetchProducts } = useAPI(
    catalogService.getProducts,
  );
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
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      }),
    );
  };

  // Called when Cart's checkout button is clicked (after discount applied)
  const handleCheckout = async (orderDetails: {
    discount: number;
    totalAfterDiscount: number;
  }) => {
    if (cart.length === 0 || !profile?.current_business_id) return;
    // Store the order details and show cash modal
    setPendingOrder(orderDetails);
    setShowCashModal(true);
  };

  // Called when cashier confirms cash payment
  const handleCashPayment = async (amountTendered: number) => {
    if (!pendingOrder || !profile?.current_business_id) return;

    const { discount, totalAfterDiscount } = pendingOrder;
    const changeDue = amountTendered - totalAfterDiscount;

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.default_price || 0,
      }));

      const currentMembership = profile.business_users.find(
        (bu) => bu.business_id === profile.current_business_id,
      );
      const isAdminOrOwner =
        currentMembership?.role?.role_name === "admin" ||
        currentMembership?.business.owner_user_id === profile.id;

      let cashierEmployeeId: string | undefined = undefined;

      if (!isAdminOrOwner) {
        const employee = await employeeService.getEmployeeByUserId(
          profile.current_business_id,
          profile.id,
        );
        cashierEmployeeId = employee?.id;
      }

      await createOrder(profile.current_business_id, {
        items: orderItems,
        payment_status: "paid",
        payment_method: "cash",
        discount_amount: discount,
        total_amount: totalAfterDiscount,
        amount_tendered: amountTendered,
        change_due: changeDue,
        cashier_employee_id: cashierEmployeeId,
      });

      printReceipt(discount, totalAfterDiscount, amountTendered, changeDue);
      setCart([]);
      setShowCashModal(false);
      setPendingOrder(null);
    } catch (err) {
      console.error(err);
      alert("Failed to process order");
    }
  };

  const printReceipt = (
    discount: number,
    finalTotal: number,
    amountTendered?: number,
    changeDue?: number,
  ) => {
    const subtotal = cart.reduce(
      (acc, item) => acc + (item.default_price || 0) * item.quantity,
      0,
    );
    const tax = subtotal * 0.1;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const businessName =
      profile?.business_users?.find(
        (bu) => bu.business_id === profile.current_business_id,
      )?.business.business_name || "Vendora PRO";

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

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const receiptContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
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
          .header { text-align: center; margin-bottom: 16px; }
          .business-name { font-size: 22px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
          .receipt-title { font-size: 14px; margin: 4px 0; text-transform: uppercase; letter-spacing: 2px; }
          .divider { border-top: 1px dashed #000; margin: 12px 0; }
          .divider-double { border-top: 1px dashed #000; border-bottom: 1px dashed #000; height: 4px; margin: 12px 0; }
          .info-row { display: flex; justify-content: space-between; font-size: 14px; }
          .item-row { display: flex; font-size: 14px; margin-bottom: 4px; }
          .item-name { flex: 2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 4px; }
          .item-price { width: 75px; text-align: right; }
          .item-qty { width: 40px; text-align: right; padding-right: 8px; }
          .totals { margin-top: 8px; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; }
          .total-row-bold { font-weight: bold; font-size: 16px; margin-top: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          .barcode { font-family: 'Libre Barcode 39', 'Courier New', monospace; font-size: 40px; text-align: center; margin: 8px 0; letter-spacing: 4px; }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="header">
          <div class="business-name">${businessName}</div>
          <div class="receipt-title">SALES RECEIPT</div>
          <div class="info-row"><span>${formattedDate}</span><span>${formattedTime}</span></div>
          <div class="info-row" style="margin-top: 4px;"><span>Order #: ${orderNumber}</span><span>Cashier: ${profile?.full_name || "Staff"}</span></div>
        </div>
        <div class="divider"></div>
        <div class="item-row" style="font-weight: bold; margin-bottom: 8px;">
          <span class="item-name">ITEM</span>
          <span class="item-price">PRICE</span>
          <span class="item-qty">QTY</span>
          <span class="item-price">TOTAL</span>
        </div>
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
        <div class="totals">
          <div class="total-row"><span>SUBTOTAL</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="total-row"><span>TAX (10%)</span><span>$${tax.toFixed(2)}</span></div>
          ${discount > 0 ? `<div class="total-row"><span>DISCOUNT</span><span>-$${discount.toFixed(2)}</span></div>` : ""}
          <div class="total-row total-row-bold"><span>TOTAL</span><span>$${finalTotal.toFixed(2)}</span></div>
        </div>
        <div class="divider-double"></div>
        ${
          amountTendered !== undefined
            ? `
        <div class="info-row"><span>Cash Tendered</span><span>$${amountTendered.toFixed(2)}</span></div>
        <div class="info-row"><span>Change</span><span>$${changeDue?.toFixed(2) || "0.00"}</span></div>
        `
            : ""
        }
        <div class="divider"></div>
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
    setTimeout(() => printWindow.print(), 250);
  };

  const filteredProducts = (products || []).filter(
    (p: CatalogProduct) =>
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ) ||
      (p.sku?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all ${cart.length > 0 ? "mr-96" : ""}`}
      >
        {/* Sticky Header */}
        <div className="flex-shrink-0 space-y-lg pb-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <ShoppingCart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Point of Sale
              </h2>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Form
                initialValues={{ searchQuery: "" }}
                onSubmit={(values) => setSearchQuery(values.searchQuery)}
                validateOnChange
              >
                <TextInput
                  name="searchQuery"
                  type="text"
                  placeholder="Search products..."
                  className="pl-9"
                />
              </Form>
            </div>
          </div>
        </div>

        {/* Scrollable Product Grid */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-3xl text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-lg" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-xs">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-lg pb-lg">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="aspect-square bg-gray-50 dark:bg-gray-700 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-500">
                        <ImageIcon className="w-10 h-10 mb-xs" />
                        <span className="text-xs font-medium">No image</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">
                        Click to add
                      </span>
                    </div>
                  </div>
                  <div className="p-md">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {product.product_name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-xs truncate">
                      {product.sku || "—"}
                    </p>
                    <div className="flex items-center justify-between mt-md">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        ${(product.default_price || 0).toFixed(2)}
                      </span>
                      <button
                        className="p-sm bg-primary-50 dark:bg-primary-400/20 text-primary dark:text-primary-300 rounded-lg hover:bg-primary dark:hover:bg-primary-500 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl transform transition-transform duration-300 z-20 ${
          cart.length > 0 ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Cart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeCartItem}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Cash Payment Modal */}
      {showCashModal && pendingOrder && (
        <CashPaymentModal
          total={pendingOrder.totalAfterDiscount}
          onSubmit={handleCashPayment}
          onCancel={() => {
            setShowCashModal(false);
            setPendingOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
