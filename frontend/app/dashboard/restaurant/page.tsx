'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Store, DollarSign, ClipboardList, Utensils, 
  Clock, CheckCircle, RefreshCw, Eye, EyeOff, Play, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/stores/api-bridge';
import { useAuthStore } from '@/stores/auth-store';

export default function RestaurantDashboard() {
  const router = useRouter();
  const { user, activeRole } = useAuthStore();

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard details
  useEffect(() => {
    if (activeRole !== 'RESTAURANT_OWNER' && activeRole !== 'ADMIN') {
      toast.error('Access restricted to Restaurant Owners.');
      router.push('/auth');
      return;
    }

    setLoading(true);
    // Fetch stats & orders
    Promise.all([
      api.getDashboardStats('RESTAURANT_OWNER', 'rest-1'),
      api.getOrders(),
      api.getRestaurantMenu('rest-1')
    ]).then(([statsData, ordersData, menuData]) => {
      setStats(statsData);
      setOrders(ordersData.filter(o => o.restaurantId === 'rest-1'));
      if (menuData) setMenuItems(menuData.menuItems);
      setLoading(false);
    });
  }, [activeRole, router]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      toast.success(`Order progressed to: ${nextStatus}`);
      
      // Reload orders
      const ordersData = await api.getOrders();
      setOrders(ordersData.filter(o => o.restaurantId === 'rest-1'));
      
      // Reload stats
      const statsData = await api.getDashboardStats('RESTAURANT_OWNER', 'rest-1');
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to update order status.');
    }
  };

  const toggleMenuItem = async (itemId: string, currentAvailable: boolean) => {
    // Simulated toggle: update local state
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isAvailable: !currentAvailable } : item
    ));
    toast.success(`Item availability updated!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase">Syncing Restaurant Stats...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-ink pb-24">
      {/* Header Banner */}
      <header className="bg-ink text-cream pt-12 pb-16 px-6 lg:px-[6.5%] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-gold/10 filter blur-[90px] pointer-events-none" />
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          <span>Back to Landing</span>
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-gold uppercase block mb-1">
              Store Owner Control Center
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl font-black tracking-tight leading-none">
              The Spice Route
            </h1>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Ecosystem operations: <span className="text-gold font-bold">Raipur branch</span>
            </p>
          </div>
        </div>
      </header>

      <section className="px-6 lg:px-[6.5%] mt-12 grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
        {/* Left Side: Stats and Analytics */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Analytical Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sales', val: `₹${stats.totalRevenue}`, icon: <DollarSign className="text-emerald-700" /> },
              { label: 'Total Orders', val: stats.orderCount, icon: <ClipboardList className="text-coral" /> },
              { label: 'Awaiting Cook', val: stats.pendingCount, icon: <Clock className="text-gold animate-pulse" /> },
              { label: 'Dishes Active', val: stats.menuItemsCount, icon: <Utensils className="text-moss" /> }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-line p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{stat.label}</span>
                  <div className="p-2 bg-slate-50 border border-line/40 rounded-lg">{stat.icon}</div>
                </div>
                <h3 className="font-serif text-xl font-bold">{stat.val}</h3>
              </div>
            ))}
          </div>

          {/* Recharts Analytics Chart */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-6">Revenue Analysis</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salesHistory}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} contentStyle={{ background: '#1b3027', borderRadius: '12px', color: 'white', border: '0', fontSize: '12px' }} />
                  <Bar dataKey="sales" fill="var(--coral)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Kitchen Queue */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5">Active Kitchen Orders</h3>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Store size={32} className="mx-auto mb-2 opacity-50" />
                <span className="text-xs font-semibold uppercase tracking-wider">No incoming orders yet</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-slate-50 border border-line p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-xs">Order {ord.id}</span>
                        <span className="text-[10px] bg-coral/10 text-coral font-bold px-2 py-0.5 rounded uppercase">
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-col gap-1">
                        <span>Items: {ord.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}</span>
                        <span>Grand Total: ₹{ord.total}</span>
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="shrink-0 flex gap-2">
                      {ord.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'ACCEPTED')}
                          className="py-2 px-4 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                        >
                          <Play size={12} />
                          <span>Accept & Prep</span>
                        </button>
                      )}
                      {ord.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                          className="py-2 px-4 bg-coral hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                        >
                          Start Cooking
                        </button>
                      )}
                      {ord.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'READY')}
                          className="py-2 px-4 bg-gold hover:bg-yellow-600 text-ink rounded-xl text-xs font-bold transition-all shadow-md"
                        >
                          Mark Ready
                        </button>
                      )}
                      {['READY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(ord.status) && (
                        <span className="text-[10px] text-gray-400 font-semibold italic flex items-center gap-1">
                          <CheckCircle size={12} className="text-emerald-700" /> Awaiting rider handover
                        </span>
                      )}
                      {ord.status === 'DELIVERED' && (
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 py-1.5 px-3.5 rounded-lg flex items-center gap-1 border border-emerald-100">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Menu Items Controller */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5">Menu Catalogue</h3>
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-3">
                  <div>
                    <h4 className="font-serif text-sm font-bold">{item.name}</h4>
                    <span className="text-xs text-coral font-bold block mt-0.5">₹{item.price}</span>
                  </div>
                  <button
                    onClick={() => toggleMenuItem(item.id, item.isAvailable)}
                    className={`p-2.5 rounded-full border transition-all ${
                      item.isAvailable 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                    title={item.isAvailable ? 'Deactivate Dish' : 'Activate Dish'}
                  >
                    {item.isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
