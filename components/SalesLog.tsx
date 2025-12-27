import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Calendar, ArrowRight, Loader2, Download, Filter, X, ChevronRight, FileText } from 'lucide-react';
import { salesAPI } from '../db';

const SalesLog: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  
  // Advanced Filter States
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);

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
    return sales.filter(s => {
      // Receipt ID match
      const matchesSearch = s.id.toString().includes(filters.search) || 
                           s.total_amount.toString().includes(filters.search);
      
      // Date range match
      const saleDate = new Date(s.created_at).toISOString().split('T')[0];
      const matchesDate = (!filters.startDate || saleDate >= filters.startDate) &&
                         (!filters.endDate || saleDate <= filters.endDate);
      
      // Amount range match
      const amount = Number(s.total_amount);
      const matchesAmount = (!filters.minAmount || amount >= Number(filters.minAmount)) &&
                           (!filters.maxAmount || amount <= Number(filters.maxAmount));

      return matchesSearch && matchesDate && matchesAmount;
    });
  }, [sales, filters]);

  const resetFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const handleExport = () => {
    const headers = ['Receipt ID', 'Date', 'Total Amount', 'Items Count'];
    const csvContent = [
      headers.join(','),
      ...filteredSales.map(s => [
        s.id,
        new Date(s.created_at).toLocaleString(),
        s.total_amount,
        s.sale_items?.length || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leonisa_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Sales Log</h1>
          <p className="text-gray-500">History of all completed transactions at Leonisa's Store.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl border transition-all flex items-center space-x-2 font-bold text-sm ${
              showFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            <span>Advanced Filters</span>
          </button>
          <button 
            onClick={handleExport}
            className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center space-x-2 font-bold text-sm"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-300">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Search Receipt/Price</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Ex: 1023 or 50.00"
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">From Date</label>
            <input 
              type="date" 
              value={filters.startDate}
              onChange={e => setFilters({...filters, startDate: e.target.value})}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">To Date</label>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={e => setFilters({...filters, endDate: e.target.value})}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Min Amount (₱)</label>
            <input 
              type="number" 
              placeholder="0"
              value={filters.minAmount}
              onChange={e => setFilters({...filters, minAmount: e.target.value})}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Max Amount (₱)</label>
            <input 
              type="number" 
              placeholder="9999"
              value={filters.maxAmount}
              onChange={e => setFilters({...filters, maxAmount: e.target.value})}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button 
              onClick={resetFilters}
              className="flex items-center space-x-2 text-red-500 hover:text-red-600 font-black uppercase text-[10px] tracking-widest p-3"
            >
              <X size={14} />
              <span>Clear All Filters</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden min-h-[600px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-6">ID</th>
                  <th className="px-8 py-6">Date & Time</th>
                  <th className="px-8 py-6 text-right">Total</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-indigo-600" size={32} /></td></tr>
                ) : filteredSales.length > 0 ? (
                  filteredSales.map(sale => (
                    <tr 
                      key={sale.id} 
                      className={`hover:bg-indigo-50/40 transition-all cursor-pointer group ${selectedSale?.id === sale.id ? 'bg-indigo-50' : ''}`}
                      onClick={() => setSelectedSale(sale)}
                    >
                      <td className="px-8 py-6 font-black text-gray-900">
                        #{sale.id}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(sale.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {new Date(sale.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-emerald-600">
                        ₱{Number(sale.total_amount).toFixed(2)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all ml-auto">
                          <ChevronRight size={18} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-32 text-center text-gray-400">
                      <FileText size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-black uppercase text-xs tracking-widest">No matching logs found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col sticky top-8 max-h-[calc(100vh-100px)]">
          {selectedSale ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-[#FBFBFF] rounded-t-[2.5rem]">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Verified Log</span>
                  <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <h3 className="font-black text-2xl text-gray-900 mb-2">Receipt #{selectedSale.id}</h3>
                <div className="text-xs font-bold text-gray-400 flex items-center">
                  <Calendar size={14} className="mr-2" />
                  {new Date(selectedSale.created_at).toLocaleString()}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-4">
                  {selectedSale.sale_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0">
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-sm text-gray-900">{item.products?.name || 'Loading item...'}</p>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                          {item.quantity} units @ ₱{Number(item.price_at_sale).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-black text-sm text-gray-900">₱{Number(item.line_total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 border-t border-gray-50 bg-gray-50/30 rounded-b-[2.5rem]">
                <div className="flex justify-between text-3xl font-black text-gray-900">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">Grand Total</span>
                  <span>₱{Number(selectedSale.total_amount).toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Print Copy
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-400 min-h-[400px]">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                <Eye size={32} strokeWidth={1.5} className="text-gray-300" />
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">Select a Log</h3>
              <p className="text-xs font-bold text-gray-400 max-w-[180px] mx-auto uppercase tracking-tighter">Click a transaction entry on the left to view the line items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesLog;