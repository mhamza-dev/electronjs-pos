import React, { useEffect, useState } from "react";
import { Product, CartItem } from "../../data/types"; // assuming types are in types/index.ts
import { useAuth } from "../../contexts/AuthContext";
import { listProductsByBusiness } from "../../services/productService";
import {
  createSale,
  addItemToSale,
  listSalesByBusiness,
} from "../../services/saleService";
import { listCustomersByBusiness } from "../../services/customerService";
import { listAppointmentsByBusiness } from "../../services/appointmentService";
import { createPayment } from "../../services/paymentService";
import { useApi } from "../../hooks"; // your useApi hook
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import Cart from "../../components/Cart";
import CashPaymentModal from "../../components/Modals/CashPaymentModal";
import Card from "../../components/Card";
import {
  Search,
  Plus,
  Package,
  ShoppingCart,
  Image as ImageIcon,
  DollarSign,
  ShoppingBag,
  Users,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const DashboardPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { profile } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCashModal, setShowCashModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{
    discount: number;
    totalAfterDiscount: number;
  } | null>(null);

  // Fetch products with generic type
  const { data: products, request: fetchProducts } = useApi<Product[]>(
    listProductsByBusiness,
  );

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalSalesToday: 0,
    ordersToday: 0,
    customers: 0,
    appointments: 0,
    lowStockProducts: 0,
    loading: true,
  });

  // Load products & analytics when businessId changes
  useEffect(() => {
    if (businessId) {
      fetchProducts(businessId);
      fetchAnalytics(businessId);
    }
  }, [businessId]);

  const fetchAnalytics = async (bId: string) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Parallel fetch
      const [salesRes, customersRes, appointmentsRes, productsRes] =
        await Promise.all([
          listSalesByBusiness(bId),
          listCustomersByBusiness(bId),
          listAppointmentsByBusiness(bId),
          listProductsByBusiness(bId),
        ]);

      const todaySales = (salesRes.data || []).filter(
        (s) => s.created_at && new Date(s.created_at) >= todayStart,
      );
      const ordersToday = todaySales.length;
      const totalSalesToday = todaySales.reduce(
        (sum, s) => sum + (s.total || 0),
        0,
      );
      const customersCount = (customersRes.data || []).length;
      const upcomingAppointments = (appointmentsRes.data || []).filter(
        (a) => a.scheduled_at && new Date(a.scheduled_at) >= todayStart,
      ).length;
      const lowStock = (productsRes.data || []).filter(
        (p) => p.is_active && p.stock_quantity <= p.reorder_level,
      ).length;

      setAnalytics({
        totalSalesToday,
        ordersToday,
        customers: customersCount,
        appointments: upcomingAppointments,
        lowStockProducts: lowStock,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load analytics", error);
      setAnalytics((prev) => ({ ...prev, loading: false }));
    }
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: (product as any).image_url ?? null, // if image_url doesn't exist in Product type, cast
      };
      return [...prevCart, newItem];
    });
  };

  const removeCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item,
      ),
    );
  };

  const handleCheckout = (orderDetails: {
    discount: number;
    totalAfterDiscount: number;
  }) => {
    if (cart.length === 0 || !businessId) return;
    setPendingOrder(orderDetails);
    setShowCashModal(true);
  };

  const handleCashPayment = async (amountTendered: number) => {
    if (!pendingOrder || !businessId || !profile?.id) return;

    const { discount, totalAfterDiscount } = pendingOrder;
    const changeDue = amountTendered - totalAfterDiscount;

    try {
      // 1. Create the sale record
      const salePayload = {
        business_id: businessId,
        branch_id: null,
        customer_id: null,
        subtotal: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
        total: Math.max(0, totalAfterDiscount),
        created_by: profile.id,
      };

      const { data: sale, error: saleError } = await createSale(salePayload);
      if (saleError || !sale)
        throw saleError || new Error("Failed to create sale");

      // 2. Add sale items
      for (const item of cart) {
        const { error: itemError } = await addItemToSale({
          sale_id: sale.id,
          item_type: "product",
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        });
        if (itemError) throw itemError;
      }

      // 4. Create payment
      await createPayment({
        business_id: businessId,
        sale_id: sale.id,
        amount: amountTendered,
        method: "cash",
      });

      // 5. Print receipt
      printReceipt(discount, totalAfterDiscount, amountTendered, changeDue);

      // 6. Clear state
      setCart([]);
      setShowCashModal(false);
      setPendingOrder(null);
    } catch (err) {
      console.error(err);
      alert("Failed to process order");
    }
  };

  // Receipt printer
  const printReceipt = (
    discount: number,
    finalTotal: number,
    amountTendered?: number,
    changeDue?: number,
  ) => {
    const subtotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.1;
    // Use a simple fallback for business name (you can improve by fetching the business)
    const businessName = "Vendora PRO";
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
          /* same minimal receipt styling as before */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; background: #fff; color: #000; padding: 20px; }
          .header { text-align: center; margin-bottom: 16px; }
          .business-name { font-size: 22px; font-weight: bold; }
          .receipt-title { font-size: 14px; margin: 4px 0; }
          .divider { border-top: 1px dashed #000; margin: 12px 0; }
          .info-row { display: flex; justify-content: space-between; font-size: 14px; }
          .item-row { display: flex; font-size: 14px; margin-bottom: 4px; }
          .item-name { flex: 2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 4px; }
          .item-price { width: 75px; text-align: right; }
          .item-qty { width: 40px; text-align: right; padding-right: 8px; }
          .totals { margin-top: 8px; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; }
          .total-row-bold { font-weight: bold; font-size: 16px; margin-top: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          .barcode { font-family: 'Libre Barcode 39', monospace; font-size: 40px; text-align: center; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="business-name">${businessName}</div>
          <div class="receipt-title">SALES RECEIPT</div>
          <div class="info-row"><span>${formattedDate}</span><span>${formattedTime}</span></div>
          <div class="info-row" style="margin-top: 4px;">
            <span>Order #: ${orderNumber}</span>
            <span>Cashier: ${profile?.full_name || "Staff"}</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="item-row" style="font-weight: bold;">
          <span class="item-name">ITEM</span>
          <span class="item-price">PRICE</span>
          <span class="item-qty">QTY</span>
          <span class="item-price">TOTAL</span>
        </div>
        ${cart
          .map(
            (item) => `
          <div class="item-row">
            <span class="item-name">${item.name}</span>
            <span class="item-price">$${item.price.toFixed(2)}</span>
            <span class="item-qty">${item.quantity}</span>
            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>`,
          )
          .join("")}
        <div class="divider"></div>
        <div class="totals">
          <div class="total-row"><span>SUBTOTAL</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="total-row"><span>TAX (10%)</span><span>$${tax.toFixed(2)}</span></div>
          ${discount > 0 ? `<div class="total-row"><span>DISCOUNT</span><span>-$${discount.toFixed(2)}</span></div>` : ""}
          <div class="total-row total-row-bold"><span>TOTAL</span><span>$${finalTotal.toFixed(2)}</span></div>
        </div>
        <div class="divider"></div>
        ${
          amountTendered !== undefined
            ? `
        <div class="info-row"><span>Cash Tendered</span><span>$${amountTendered.toFixed(2)}</span></div>
        <div class="info-row"><span>Change</span><span>$${changeDue?.toFixed(2) || "0.00"}</span></div>`
            : ""
        }
        <div class="barcode">*${orderNumber}*</div>
        <div class="footer">
          <div>Thank you for your purchase!</div>
          <div>*** CUSTOMER COPY ***</div>
        </div>
      </body>
    </html>`;
    // unchanged, but replace businessName with the variable
    // The receiptContent string is large; I'll keep it unchanged to save space.
    // Ensure you replace the businessName usage properly.

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  // Analytics cards
  const analyticsCards = [
    {
      title: "Today's Sales",
      value: analytics.loading
        ? "..."
        : `$${analytics.totalSalesToday.toFixed(2)}`,
      icon: <DollarSign className="w-5 h-5" />,
      trend: { value: 0, isPositive: true },
      description: "today",
    },
    {
      title: "Orders",
      value: analytics.loading ? "..." : analytics.ordersToday,
      icon: <ShoppingBag className="w-5 h-5" />,
      description: "today",
    },
    {
      title: "Customers",
      value: analytics.loading ? "..." : analytics.customers,
      icon: <Users className="w-5 h-5" />,
      description: "active",
    },
    {
      title: "Appointments",
      value: analytics.loading ? "..." : analytics.appointments,
      icon: <ClipboardList className="w-5 h-5" />,
      description: "upcoming",
    },
    {
      title: "Low Stock",
      value: analytics.loading ? "..." : analytics.lowStockProducts,
      icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
      description: "need reorder",
    },
  ];

  // Product filtering
  const filteredProducts = (products || []).filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all ${cart.length > 0 ? "mr-96" : ""}`}
      >
        {/* Header with search and analytics */}
        <div className="flex-shrink-0 space-y-lg pb-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <ShoppingCart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Point of Sale
              </h2>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

          {/* Analytics Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {analyticsCards.map((card) => (
              <Card key={card.title} {...card} />
            ))}
          </div>
        </div>

        {/* Product Grid */}
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
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                >
                  <div className="aspect-square bg-gray-50 dark:bg-gray-700 relative">
                    {(product as any).image_url ? (
                      <img
                        src={(product as any).image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-500">
                        <ImageIcon className="w-10 h-10 mb-xs" />
                        <span className="text-xs font-medium">No image</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                      <span className="text-white text-xs font-medium">
                        Click to add
                      </span>
                    </div>
                  </div>
                  <div className="p-md">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-xs truncate">
                      {product.sku || "—"}
                    </p>
                    <div className="flex items-center justify-between mt-md">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        ${product.price.toFixed(2)}
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
