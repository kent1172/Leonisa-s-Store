
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Calendar, ArrowRight, Loader2, Download } from 'lucide-react';
import { salesAPI } from '../db';
import { Sale } from '../types';

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await salesAPI.getAll();
      setSales(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      s.id.toString().includes(searchTerm) || 
      s.total_amount.toString().includes(searchTerm)
    );
  }, [sales, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Transactions</h1>
          <p className="text-gray-500">Full audit log of store sales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by Receipt ID or Price..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-gray-900 font-bold"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-6">Receipt</th>
                  <th className="px-8 py-6">Timestamp</th>
                  <th className="px-8 py-6">Grand Total</th>
                  <th className="px-8 py-6 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-indigo-600" /></td></tr>
                ) : filteredSales.map(sale => (
                  <tr 
                    key={sale.id} 
                    className={`hover:bg-indigo-50/30 transition-all cursor-pointer group ${selectedSale?.id === sale.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => setSelectedSale(sale)}
                  >
                    <td className="px-8 py-6 font-black text-gray-900">
                      #{sale.id.toString().padStart(6, '0')}
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-400">
                      {new Date(sale.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-8 py-6 font-black text-emerald-600">
                      ₱{Number(sale.total_amount).toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-all ml-auto">
                        <ArrowRight size={18} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col min-h-[600px] sticky top-8">
          {selectedSale ? (
            <div className="flex flex-col h-full">
              <div className="p-10 border-b border-gray-50 bg-[#FBFBFF] rounded-t-[2.5rem]">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Processed</span>
                  <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                    <Download size={20} />
                  </button>
                </div>
                <h3 className="font-black text-2xl text-gray-900 mb-2">Receipt Detail</h3>
                <div className="text-xs font-bold text-gray-400 flex items-center">
                  <Calendar size={14} className="mr-2" />
                  {new Date(selectedSale.created_at).toLocaleString()}
                </div>
                <div className="text-[10px] font-black text-indigo-300 mt-2 uppercase tracking-widest">Auth ID: {selectedSale.created_by.slice(0,8)}...</div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-6">
                <div className="space-y-4">
                  {selectedSale.sale_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1 pr-6">
                        <p className="font-bold text-sm text-gray-900">{item.products?.name || 'Loading item...'}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {item.quantity} units @ ₱{Number(item.price_at_sale).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-black text-sm text-gray-900">₱{Number(item.line_total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-10 border-t border-gray-50 bg-gray-50/50 rounded-b-[2.5rem]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span>₱{Number(selectedSale.total_amount * 0.92).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <span>Tax Applied</span>
                    <span>₱{Number(selectedSale.total_amount * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-3xl font-black text-gray-900 pt-4 border-t border-gray-100">
                    <span>Total</span>
                    <span>₱{Number(selectedSale.total_amount).toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="w-full py-5 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  Print Official Receipt
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-400">
              <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                <Eye size={40} strokeWidth={1.5} className="text-gray-200" />
              </div>
              <h3 className="font-black text-gray-900 text-xl mb-2">Audit Viewer</h3>
              <p className="text-sm font-medium text-gray-400 max-w-[200px] mx-auto">Select a transaction from the list to pull the cloud receipt record.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
