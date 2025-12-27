
import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, ChevronRight } from 'lucide-react';
import { productAPI, salesAPI } from '../db';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

const POS: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const products = useMemo(() => productAPI.getActive(), []);
  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (activeCategory === 'All' || p.category === activeCategory) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, activeCategory, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const items = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));
    
    salesAPI.create(items);
    setCart([]);
    alert('Sale completed successfully!');
  };

  return (
    <div className="flex h-full flex-col lg:flex-row gap-6 -m-8">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-gray-300 group-hover:text-indigo-200 transition-colors">
                    <ShoppingCart size={32} />
                  </div>
                  <h3 className="font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</h3>
                  <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">{product.category}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>No products found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col p-8 shadow-2xl lg:shadow-none">
        <div className="flex items-center space-x-2 mb-6">
          <ShoppingCart className="text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
          <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-xs ml-auto">
            {cart.reduce((acc, i) => acc + i.quantity, 0)} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-6 -mx-2 px-2">
          {cart.map(item => (
            <div key={item.id} className="flex items-center space-x-3 p-3 rounded-xl border border-gray-100 bg-gray-50 group">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">${item.price.toFixed(2)} / unit</p>
              </div>
              <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1 hover:text-indigo-600"
                >
                  <Minus size={14} />
                </button>
                <span className="px-2 font-bold text-sm min-w-[24px] text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1 hover:text-indigo-600"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-10">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Your order list is empty.</p>
              <p className="text-xs">Select products from the left to begin.</p>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Sales Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-50">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center space-x-2"
          >
            <CreditCard size={20} />
            <span>Complete Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
