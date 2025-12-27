import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, LogOut, User as UserIcon, Loader2, AlertCircle, BookOpen, History } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import ManualLog from './components/ManualLog';
import SalesLog from './components/SalesLog';
import { User, UserRole } from './types';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchProfile = async (authUser: any): Promise<User> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    const metadata = authUser.user_metadata || {};
    
    if (error) {
      console.warn("Database profile fetch failed, falling back to metadata:", error.message || error);
      return {
        id: authUser.id,
        username: metadata.username || authUser.email || 'User',
        role: (metadata.role as UserRole) || UserRole.CASHIER,
        createdAt: authUser.created_at || new Date().toISOString()
      };
    }

    return {
      id: data.id,
      username: data.username || metadata.username || authUser.email,
      role: (data.role as UserRole) || (metadata.role as UserRole) || UserRole.CASHIER,
      createdAt: data.created_at
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message === 'Invalid login credentials') {
          setAuthError("Email or password incorrect. Please check your credentials.");
        } else {
          setAuthError(error.message);
        }
      }
    } catch (err: any) {
      setAuthError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium animate-pulse">Leonisa's Cloud Syncing...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
              <ShoppingCart className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Leonisa's Store</h1>
            <p className="text-gray-500 mt-1">Management Access Portal</p>
          </div>
          
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-start space-x-3 rounded-r-lg">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                name="email"
                type="email" 
                required
                placeholder="admin@leonisa.com"
                className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input 
                name="password"
                type="password" 
                required
                placeholder="••••••••"
                className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 transition-all" 
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Enter Management Console'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
            : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
      >
        <Icon size={20} />
        <span className="font-semibold">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="p-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 leading-none">Leonisa's</h2>
              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.2em]">Management</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Insights" />
          <NavItem to="/logbook" icon={BookOpen} label="Log Book" />
          <NavItem to="/sales-log" icon={History} label="Sales Log" />
          <NavItem to="/products" icon={Package} label="Inventory" />
        </nav>

        <div className="p-6 mt-auto border-t border-gray-50">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl mb-4">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user.username}</p>
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                {user.role}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#FBFBFF]">
        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/logbook" element={<ManualLog />} />
            <Route path="/sales-log" element={<SalesLog />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;