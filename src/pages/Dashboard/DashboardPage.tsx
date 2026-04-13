import React, { useState } from 'react';

// Components
import POSLayout from '../../components/Layout/POSLayout';

// Utils
import { mockProducts, Product } from '../../data/mockProducts';

interface CartItem extends Product {
  quantity: number;
}

const DashboardPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const filteredProducts = mockProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <POSLayout>
      <div className="flex h-full space-x-lg overflow-hidden">
        {/* Product Grid */}
        <div className="flex-1 flex flex-col space-y-lg min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Available Products</h2>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-lg pr-md py-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg pb-lg">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm p-lg hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 text-4xl font-bold mb-lg group-hover:bg-primary-50 group-hover:text-primary transition-colors">
                    {product.name.charAt(0)}
                  </div>
                  <div className="flex flex-col space-y-xs">
                    <span className="text-lg font-bold text-gray-800 truncate">{product.name}</span>
                    <span className="text-sm text-gray-400">{product.category}</span>
                  </div>
                  <div className="flex items-center justify-between mt-xl">
                    <span className="text-xl font-black text-primary">${product.price.toFixed(2)}</span>
                    <button className="p-sm bg-gray-50 group-hover:bg-primary group-hover:text-white rounded-lg transition-colors text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-width-card bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-lg border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Current Order</h3>
            <span className="bg-primary-50 text-primary text-xs px-sm py-xs rounded-full font-bold">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-lg space-y-lg">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-md">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 118 0m-4 8a2 2 0 110-4 2 2 0 010 4zm-8 8a2 2 0 110-4 2 2 0 010 4zm-4-8a2 2 0 110-4 2 2 0 010 4zm0 0V7a4 4 0 018 0v4m-8 8a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
                <span className="font-medium text-lg">Cart is empty</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-md">
                  <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 font-bold flex-shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate">{item.name}</div>
                    <div className="flex items-center space-x-sm mt-xs">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-gray-600 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-400 ml-sm">x ${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-xs">
                    <div className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-lg border-t border-gray-100 space-y-md">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-gray-900 pt-sm">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              disabled={cart.length === 0}
              onClick={() => {
                alert(`Order Placed! Total: $${total.toFixed(2)}`);
                setCart([]);
              }}
              className="w-full bg-primary text-white py-lg rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100 mt-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>
    </POSLayout>
  );
};

export default DashboardPage;
