
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Package, ShoppingBag, DollarSign, Loader2 } from 'lucide-react';
import { salesAPI, productAPI } from '../db';
import { Sale, Product } from '../types';

const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesData, productsData] = await Promise.all([
          salesAPI.getAll(),
          productAPI.getAll()
        ]);
        setSales(salesData);
        setProducts(productsData);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    
    const todaySales = sales
      .filter(s => s.created_at.startsWith(today))
      .reduce((acc, s) => acc + Number(s.total_amount), 0);

    const monthSales = sales
      .filter(s => s.created_at.startsWith(month))
      .reduce((acc, s) => acc + Number(s.total_amount), 0);

    return {
      todaySales,
      monthSales,
      activeProducts: products.filter(p => p.status === 'active').length,
      totalOrders: sales.length
    };
  }, [sales, products]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: dateStr.split('-').slice(1).join('/'),
        amount: sales
          .filter(s => s.created_at.startsWith(dateStr))
          .reduce((acc, s) => acc + Number(s.total_amount), 0)
      };
    });
    return days;
  }, [sales]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Real-time performance metrics for Leonisa's Store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Daily Revenue" value={`₱${stats.todaySales.toLocaleString()}`} icon={DollarSign} color="bg-indigo-600" />
        <StatCard label="Monthly Goal" value={`₱${stats.monthSales.toLocaleString()}`} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard label="Live Inventory" value={stats.activeProducts.toString()} icon={Package} color="bg-blue-500" />
        <StatCard label="Total Receipts" value={stats.totalOrders.toString()} icon={ShoppingBag} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-8 flex items-center">
            <TrendingUp size={18} className="mr-2 text-indigo-600" />
            Weekly Revenue Trend
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`₱${value}`, 'Revenue']}
                />
                <Bar dataKey="amount" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-8">Stock Categories</h3>
          <div className="h-[300px] flex items-center justify-center">
             <div className="text-gray-400 text-sm">Visualizing data...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-indigo-200 transition-all">
    <div className="flex items-center justify-between">
      <div className={`${color} p-3 rounded-2xl text-white shadow-lg shadow-gray-100`}>
        <Icon size={22} />
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
