'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Store, ClipboardList, TrendingUp, 
  Check, X, ShieldAlert, Sparkles, UserCheck, RefreshCw, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/stores/api-bridge';
import { useAuthStore } from '@/stores/auth-store';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, activeRole } = useAuthStore();

  const [stats, setStats] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    if (activeRole !== 'ADMIN') {
      toast.error('Access restricted to System Administrators.');
      router.push('/auth');
      return;
    }

    loadDashboardData();
  }, [activeRole, router]);

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.getDashboardStats('ADMIN'),
      api.getRestaurants()
    ]).then(([statsData, restsData]) => {
      setStats(statsData);
      setRestaurants(restsData);
      
      // Seed a few mock users for the registry list
      setUsers([
        { id: 'usr-1', email: 'customer@citybites.com', role: 'CUSTOMER', orders: 4 },
        { id: 'usr-2', email: 'owner@citybites.com', role: 'RESTAURANT_OWNER', orders: 0 },
        { id: 'usr-3', email: 'rider@citybites.com', role: 'DELIVERY_PARTNER', orders: 12 },
        { id: 'usr-4', email: 'admin@citybites.com', role: 'ADMIN', orders: 0 }
      ]);
      setLoading(false);
    });
  };

  const handleApproveRestaurant = async (restId: string) => {
    try {
      await api.updateOrderStatus(restId, 'ACCEPTED'); // generic status toggle simulation
      toast.success('Local culinary partner approved for onboarding!');
      loadDashboardData();
    } catch (err) {
      toast.error('Onboarding update failed.');
    }
  };

  const handleDeclineOnboarding = (restId: string) => {
    toast.success('Onboarding application declined.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase">Initializing Platform Statistics...</span>
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
              Platform Control Center
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl font-black tracking-tight leading-none">
              System Admin
            </h1>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Enterprise operations: <span className="text-gold font-bold">Raipur Central Cluster</span>
            </p>
          </div>
        </div>
      </header>

      <section className="px-6 lg:px-[6.5%] mt-12 grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
        {/* Left Side: Stats and approvals */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Platform Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Ecosystem Revenue', val: `₹${stats.platformRevenue}`, icon: <TrendingUp className="text-emerald-700" /> },
              { label: 'Active Users', val: stats.totalUsers, icon: <Users className="text-coral" /> },
              { label: 'Culinary Partners', val: stats.totalRestaurants, icon: <Store className="text-gold" /> },
              { label: 'Total Orders', val: stats.totalOrders, icon: <ClipboardList className="text-moss" /> }
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

          {/* Restaurant Onboarding Approvals Queue */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5">Onboarding Queue</h3>
            {stats.pendingRestaurants?.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Store size={32} className="mx-auto mb-2 opacity-50" />
                <span className="text-xs font-semibold uppercase tracking-wider">No pending applications</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {[
                  { id: 'app-1', name: 'Flavors of Bengal', city: 'Raipur', contact: 'bengal@flavors.com' },
                  { id: 'app-2', name: 'The Baker Street', city: 'Raipur', contact: 'baker@street.com' }
                ].map((app) => (
                  <div key={app.id} className="bg-slate-50 border border-line p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-serif font-bold text-sm">{app.name}</h4>
                      <div className="text-xs text-gray-500 flex flex-col gap-0.5 mt-1">
                        <span>Cluster: {app.city}</span>
                        <span>Contact: {app.contact}</span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex gap-2">
                      <button
                        onClick={() => handleDeclineOnboarding(app.id)}
                        className="p-2.5 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors rounded-xl flex items-center justify-center"
                        title="Decline Application"
                      >
                        <X size={15} />
                      </button>
                      <button
                        onClick={() => handleApproveRestaurant(app.id)}
                        className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                      >
                        <Check size={14} />
                        <span>Approve Spot</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Users and Roles directory */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5">Ecosystem Registry</h3>
            <div className="flex flex-col gap-4">
              {users.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-3 border-b border-line/45 pb-3 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-mono text-[10px] text-gray-500 font-bold block mb-0.5">{item.id}</h4>
                    <span className="font-serif text-sm font-bold block truncate max-w-[150px]">{item.email}</span>
                    <span className="text-[9px] text-coral font-bold uppercase tracking-wider mt-0.5 block">{item.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Orders</span>
                    <span className="font-bold text-xs">{item.orders}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
