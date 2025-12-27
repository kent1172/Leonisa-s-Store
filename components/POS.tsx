
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { productAPI, salesAPI } from '../db';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productAPI.getActive();
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

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

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: Number(item.price)
      }));
      
      await salesAPI.create(items);
      setCart([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      alert("Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full flex-col lg:flex-row gap-8 -m-8">
      <div className="flex-1 flex flex-col p-8 overflow-hidden bg-[#FBFBFF]">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Point of Sale</h1>
            <div className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl">
              Terminal Active
            </div>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Scan item or type name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-[1.25rem] shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                  activeCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-indigo-100' 
                    : 'bg-white text-gray-500 hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-indigo-600" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <button 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-1 transition-all text-left border border-transparent hover:border-indigo-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square bg-indigo-50/50 rounded-3xl mb-4 flex items-center justify-center text-indigo-200 group-hover:text-indigo-400 group-hover:bg-indigo-50 transition-all">
                      <ShoppingCart size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight mb-2 h-10">{product.name}</h3>
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{product.category}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-black text-gray-900">₱{Number(product.price).toFixed(2)}</span>
                    <div className="bg-indigo-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-indigo-200">
                      <Plus size={18} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[420px] bg-white border-l border-gray-100 flex flex-col p-10 shadow-2xl relative">
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300 text-center">
            <CheckCircle2 size={64} className="text-emerald-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-black text-gray-900">Sale Complete!</h2>
            <p className="text-gray-500 mt-2">The inventory has been updated and the receipt saved.</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="text-indigo-600" size={24} />
            <h2 className="text-2xl font-black text-gray-900">Current Order</h2>
          </div>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-xl text-xs font-black">
            {cart.reduce((acc, i) => acc + i.quantity, 0)} UNITS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-8 -mx-2 px-2 scrollbar-hide">
          {cart.map(item => (
            <div key={item.id} className="flex items-center space-x-4 p-5 rounded-3xl border border-gray-50 bg-gray-50/50 group">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                <p className="text-xs font-bold text-gray-400 mt-0.5">₱{Number(item.price).toFixed(2)} unit price</p>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center bg-white rounded-xl shadow-sm p-1.5 border border-gray-100">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-indigo-600"><Minus size={14} /></button>
                  <span className="px-3 font-black text-sm min-w-[30px] text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-indigo-600"><Plus size={14} /></button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-20 opacity-30">
              <ShoppingCart size={80} strokeWidth={1} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Basket Empty</p>
            </div>
          )}
        </div>

        <div className="space-y-6 pt-8 border-t border-gray-100">
          <div className="space-y-3">
            <div className="flex justify-between text-gray-500 font-bold text-sm uppercase tracking-tighter">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-bold text-sm uppercase tracking-tighter">
              <span>Processing Fee (8%)</span>
              <span>₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-3xl font-black text-gray-900 pt-4">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-6 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:shadow-none flex items-center justify-center space-x-3"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <CreditCard size={24} />
                <span>Process Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
