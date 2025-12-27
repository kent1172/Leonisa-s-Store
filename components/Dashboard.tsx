
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Package, ShoppingBag, DollarSign } from 'lucide-react';
import { getDB } from '../db';

const Dashboard: React.FC = () => {
  const db = getDB();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    
    const todaySales = db.sales
      .filter(s => s.createdAt.startsWith(today))
      .reduce((acc, s) => acc + s.totalAmount, 0);

    const monthSales = db.sales
      .filter(s => s.createdAt.startsWith(month))
      .reduce((acc, s) => acc + s.totalAmount, 0);

    return {
      todaySales,
      monthSales,
      activeProducts: db.products.filter(p => p.status === 'active').length,
      totalOrders: db.sales.length
    };
  }, [db]);

  const chartData = useMemo(() => {
    // Generate last 7 days chart data
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: dateStr.split('-').slice(1).join('/'),
        fullDate: dateStr,
        amount: db.sales
          .filter(s => s.createdAt.startsWith(dateStr))
          .reduce((acc, s) => acc + s.totalAmount, 0)
      };
    });
    return days;
  }, [db]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    db.products.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + 1;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [db]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back to Leonisa's Store oversight.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Today's Sales" 
          value={`$${stats.todaySales.toLocaleString()}`} 
          icon={DollarSign} 
          trend="+12%" 
          color="bg-indigo-500"
        />
        <StatCard 
          label="Monthly Sales" 
          value={`$${stats.monthSales.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="+5%" 
          color="bg-green-500"
        />
        <StatCard 
          label="Active Products" 
          value={stats.activeProducts.toString()} 
          icon={Package} 
          trend="0%" 
          color="bg-blue-500"
        />
        <StatCard 
          label="Total Orders" 
          value={stats.totalOrders.toString()} 
          icon={ShoppingBag} 
          trend="+2%" 
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Recent Sales Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Product Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-gray-600">{cat.name}</span>
                </div>
                <span className="font-medium text-gray-800">{cat.value} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      <p className="text-xs font-semibold text-green-500 mt-2">{trend} <span className="text-gray-400 font-normal">vs last week</span></p>
    </div>
    <div className={`${color} p-3 rounded-lg text-white`}>
      <Icon size={24} />
    </div>
  </div>
);

export default Dashboard;
