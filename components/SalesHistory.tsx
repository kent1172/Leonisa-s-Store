
import React, { useState, useMemo } from 'react';
import { Search, Eye, Calendar, ArrowRight } from 'lucide-react';
import { salesAPI } from '../db';
import { Sale } from '../types';

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState(salesAPI.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      s.id.toString().includes(searchTerm) || 
      s.totalAmount.toString().includes(searchTerm)
    );
  }, [sales, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
          <p className="text-gray-500">Track and review every transaction processed in your store.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table View */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by sale ID or amount..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Sale ID</th>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 font-semibold">Total Amount</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.map(sale => (
                  <tr 
                    key={sale.id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedSale?.id === sale.id ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
                    onClick={() => setSelectedSale(sale)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      #{sale.id.toString().padStart(6, '0')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      ${sale.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center">
                        Details <ArrowRight size={14} className="ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No sales records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
          {selectedSale ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">Receipt Details</h3>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Paid</span>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {new Date(selectedSale.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-1 uppercase">ID: #{selectedSale.id.toString().padStart(6, '0')}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <div className="flex-1 pr-4">
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        <p className="text-gray-400 text-xs">{item.quantity} x ${item.priceAtSale.toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-gray-700">${item.lineTotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 space-y-2 bg-gray-50">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span>${selectedSale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Tax (Included)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${selectedSale.totalAmount.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="w-full mt-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Eye size={32} />
              </div>
              <h3 className="font-medium text-gray-700 mb-1">No Selection</h3>
              <p className="text-sm">Select a transaction from the list to see full details and receipt.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
