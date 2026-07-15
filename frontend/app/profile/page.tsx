'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, ShoppingBag, Calendar, MapPin, 
  ChevronRight, RefreshCw, Star, ShieldCheck, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/stores/api-bridge';
import { useAuthStore } from '@/stores/auth-store';

export default function CustomerProfile() {
  const router = useRouter();
  const { user, activeRole } = useAuthStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders
  useEffect(() => {
    if (!user) {
      toast.error('Please login to view your profile.');
      router.push('/auth');
      return;
    }

    setLoading(true);
    api.getOrders().then((data) => {
      // Filter customer orders
      setOrders(data.filter(o => o.userId === user.id || o.userId === 'user-mock-cust'));
      setLoading(false);
    });
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase">Fetching Order Logs...</span>
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

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-coral text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest text-gold uppercase block mb-0.5">
              Customer Registry Account
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-black tracking-tight leading-none text-white">
              {user?.email}
            </h1>
            <p className="text-xs text-gray-400 mt-1.5 font-medium flex items-center gap-1">
              <MapPin size={11} className="text-coral" /> Civil Lines, Raipur Central
            </p>
          </div>
        </div>
      </header>

      <section className="px-6 lg:px-[6.5%] mt-12 grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
        {/* Left Side: Orders History */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5 flex items-center gap-1.5">
              <ShoppingBag size={18} className="text-coral" /> Orders History
            </h3>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                <span className="text-xs font-semibold uppercase tracking-wider">No order records found</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-slate-50 border border-line p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-serif font-bold text-sm">{ord.restaurant?.name || 'Local Kitchen'}</span>
                        <span className="text-[9px] bg-coral/10 text-coral font-bold px-2 py-0.5 rounded uppercase">
                          {ord.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                        <span>Items: {ord.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}</span>
                        <span>Total Paid: ₹{ord.total}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      {['DELIVERED', 'CANCELLED'].includes(ord.status) ? (
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-100 flex items-center gap-1">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => router.push(`/track/${ord.id}`)}
                          className="py-2.5 px-4 bg-coral hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 group cursor-pointer"
                        >
                          <span>Track Order</span>
                          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Account Perks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5 flex items-center gap-1.5">
              <Star size={18} fill="currentColor" className="text-gold" /> Rewards Program
            </h3>
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Active Perks Status</span>
                <span className="font-bold text-coral">Vip Member</span>
              </div>
              <div className="flex justify-between items-center border-t border-line/60 pt-4">
                <span className="text-gray-500">Available Points</span>
                <span className="font-serif text-lg font-bold text-emerald-700">320 pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
