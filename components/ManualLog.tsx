
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, Save, Loader2, CheckCircle2, AlertCircle, RefreshCw, Search, X } from 'lucide-react';
import { productAPI, salesAPI } from '../db';
import { Product } from '../types';

interface LogRow {
  id: string;
  productId: number | '';
  searchQuery: string;
  quantity: number;
  price: number;
}

const ManualLog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<LogRow[]>([
    { id: crypto.randomUUID(), productId: '', searchQuery: '', quantity: 1, price: 0 }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productAPI.getActive();
      setProducts(data);
    } catch (e) {
      setError("Failed to load products. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    setRows([...rows, { id: crypto.randomUUID(), productId: '', searchQuery: '', quantity: 1, price: 0 }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const selectProduct = (rowId: string, product: Product) => {
    setRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          productId: product.id,
          searchQuery: product.name,
          price: Number(product.price)
        };
      }
      return row;
    }));
    setActiveDropdownId(null);
  };

  const updateQuantity = (rowId: string, qty: number) => {
    setRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, quantity: Math.max(0, qty) } : row
    ));
  };

  const updateSearchQuery = (rowId: string, query: string) => {
    setRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, searchQuery: query, productId: row.searchQuery === query ? row.productId : '' } : row
    ));
    setActiveDropdownId(rowId);
  };

  const grandTotal = useMemo(() => {
    return rows.reduce((acc, row) => acc + (row.price * row.quantity), 0);
  }, [rows]);

  const handleSave = async () => {
    const validRows = rows.filter(r => r.productId !== '' && r.quantity > 0);
    if (validRows.length === 0) {
      setError("Please select valid products and quantities before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const items = validRows.map(row => ({
        productId: Number(row.productId),
        quantity: row.quantity,
        price: row.price
      }));

      await salesAPI.create(items);
      setRows([{ id: crypto.randomUUID(), productId: '', searchQuery: '', quantity: 1, price: 0 }]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "An error occurred while saving the log.");
    } finally {
      setIsSaving(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Log Book</h1>
          <p className="text-gray-500">Fast-entry manual ledger for Leonisa's Store inventory.</p>
        </div>
        <button 
          onClick={loadProducts}
          className="p-3 rounded-2xl border border-gray-100 bg-white text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center space-x-2"
        >
          <RefreshCw size={18} />
          <span className="text-sm font-bold">Sync Items</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-visible">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-indigo-600">
            <Plus size={24} />
            <span className="font-black uppercase tracking-widest text-sm">New Entry Session</span>
          </div>
          {showSuccess && (
            <div className="flex items-center text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl animate-in fade-in zoom-in">
              <CheckCircle2 size={18} className="mr-2" />
              <span className="text-xs font-black uppercase">Log Saved Successfully</span>
            </div>
          )}
        </div>

        <div className="p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                <th className="pb-6 pr-4 w-1/2">Product Search</th>
                <th className="pb-6 px-4">Unit Price</th>
                <th className="pb-6 px-4">Qty</th>
                <th className="pb-6 px-4">Line Total</th>
                <th className="pb-6 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, index) => (
                <tr key={row.id} className="group">
                  <td className="py-6 pr-4 relative">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                        <Search size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Search product name or category..."
                        value={row.searchQuery}
                        onChange={(e) => updateSearchQuery(row.id, e.target.value)}
                        onFocus={() => setActiveDropdownId(row.id)}
                        className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 transition-all ${
                          row.productId ? 'ring-2 ring-indigo-100' : ''
                        }`}
                      />
                      {row.searchQuery && (
                        <button 
                          onClick={() => updateSearchQuery(row.id, '')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                        >
                          <X size={16} />
                        </button>
                      )}
                      
                      {activeDropdownId === row.id && row.searchQuery && !row.productId && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-64 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                          {products
                            .filter(p => 
                              p.name.toLowerCase().includes(row.searchQuery.toLowerCase()) || 
                              p.category.toLowerCase().includes(row.searchQuery.toLowerCase())
                            )
                            .map(product => (
                              <button
                                key={product.id}
                                onClick={() => selectProduct(row.id, product)}
                                className="w-full text-left p-4 hover:bg-indigo-50 transition-colors flex items-center justify-between group/item"
                              >
                                <div>
                                  <p className="font-bold text-gray-900">{product.name}</p>
                                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{product.category}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-gray-900">₱{Number(product.price).toFixed(2)}</p>
                                  <span className="text-[10px] text-gray-300 font-bold">SELECT ITEM</span>
                                </div>
                              </button>
                            ))}
                          {products.filter(p => p.name.toLowerCase().includes(row.searchQuery.toLowerCase()) || p.category.toLowerCase().includes(row.searchQuery.toLowerCase())).length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                              <p className="text-xs font-bold uppercase tracking-widest">No matching items</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="font-black text-gray-900 bg-gray-50/50 p-4 rounded-2xl border border-transparent">
                      ₱{row.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => updateQuantity(row.id, parseInt(e.target.value) || 0)}
                      className="w-24 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-gray-900 text-center"
                    />
                  </td>
                  <td className="py-6 px-4">
                    <div className="font-black text-indigo-600 p-4">
                      ₱{(row.price * row.quantity).toFixed(2)}
                    </div>
                  </td>
                  <td className="py-6 pl-4 text-right">
                    <button 
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 flex flex-col md:flex-row gap-6 items-center justify-between pt-8 border-t border-gray-50">
            <button 
              onClick={addRow}
              className="flex items-center space-x-2 px-8 py-4 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl font-black text-sm transition-all"
            >
              <Plus size={18} />
              <span>Add New Item Row</span>
            </button>

            <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Session Grand Total</p>
                <p className="text-4xl font-black text-gray-900">₱{grandTotal.toFixed(2)}</p>
              </div>

              <button 
                disabled={isSaving || rows.every(r => r.productId === '')}
                onClick={handleSave}
                className="w-full md:w-auto flex items-center justify-center space-x-3 px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <Save size={24} />
                    <span>Save Log Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start space-x-3 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="shrink-0" size={20} />
          <div>
            <p className="font-black uppercase text-xs tracking-widest mb-1">System Error</p>
            <p className="text-sm font-bold">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualLog;
