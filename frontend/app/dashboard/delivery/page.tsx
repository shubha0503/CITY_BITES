'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Bike, Wallet, Navigation, CheckCircle, 
  MapPin, Clock, DollarSign, Compass, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/stores/api-bridge';
import { useAuthStore } from '@/stores/auth-store';

export default function DeliveryDashboard() {
  const router = useRouter();
  const { user, activeRole } = useAuthStore();

  const [stats, setStats] = useState<any>(null);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load stats & orders
  useEffect(() => {
    if (activeRole !== 'DELIVERY_PARTNER' && activeRole !== 'ADMIN') {
      toast.error('Access restricted to Delivery Partners.');
      router.push('/auth');
      return;
    }

    loadDashboardData();
  }, [activeRole, router]);

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.getDashboardStats('DELIVERY_PARTNER'),
      api.getOrders()
    ]).then(([statsData, ordersData]) => {
      setStats(statsData);
      
      // Find active job assigned to this rider
      const riderOrders = ordersData.filter(o => 
        ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status)
      );
      setActiveJob(riderOrders[0] || null);

      // Available orders are those marked READY that don't have a rider yet
      const readyPool = ordersData.filter(o => o.status === 'READY' && !o.riderId);
      setAvailableOrders(readyPool);
      setLoading(false);
    });
  };

  const handleClaimOrder = async (orderId: string) => {
    try {
      await api.assignRider(orderId);
      toast.success('Courier job claimed successfully!');
      loadDashboardData();
    } catch (err) {
      toast.error('Could not claim job. Check connection.');
    }
  };

  const handleProgressJob = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'PICKED_UP';
    if (currentStatus === 'ASSIGNED') {
      nextStatus = 'PICKED_UP';
    } else if (currentStatus === 'PICKED_UP') {
      nextStatus = 'OUT_FOR_DELIVERY';
    } else if (currentStatus === 'OUT_FOR_DELIVERY') {
      nextStatus = 'DELIVERED';
    }

    try {
      await api.updateOrderStatus(orderId, nextStatus);
      toast.success(`Job progressed to: ${nextStatus}`);
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to update job progress.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase">Fetching Available Jobs...</span>
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
              Courier Partner Network
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl font-black tracking-tight leading-none">
              Courier Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Operational area: <span className="text-gold font-bold">Raipur Central</span>
            </p>
          </div>
        </div>
      </header>

      <section className="px-6 lg:px-[6.5%] mt-12 grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
        {/* Left Side: Active Delivery Map and Job info */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Active Job Block */}
          {activeJob ? (
            <div className="bg-white border border-line rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-line pb-3">
                <h3 className="font-serif text-lg font-bold flex items-center gap-1.5">
                  <Navigation size={18} className="text-coral" /> Active Delivery Job
                </h3>
                <span className="text-[10px] font-bold tracking-widest uppercase text-coral bg-coral/10 py-1 px-2.5 rounded">
                  Status: {activeJob.status}
                </span>
              </div>

              {/* simulated routing map */}
              <div className="h-[200px] rounded-2xl bg-zinc-950 text-white relative overflow-hidden radar-grid border border-line/10">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <Bike size={26} className="text-gold animate-bounce mb-1" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gold">Map Navigation Routed</span>
                  <span className="text-[9px] text-gray-500 font-medium mt-0.5">Raipur Local Streets Guidance</span>
                </div>
              </div>

              {/* Locations details */}
              <div className="grid md:grid-cols-2 gap-6 text-xs border-y border-line/60 py-5">
                <div className="flex gap-2.5">
                  <MapPin size={16} className="text-coral shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">PICKUP KITCHEN</span>
                    <span className="font-serif text-sm font-bold block text-ink">{activeJob.restaurant?.name || 'Local Kitchen'}</span>
                    <span className="text-gray-500">Civil Lines, Raipur</span>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <MapPin size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">DROPOFF NEIGHBOR</span>
                    <span className="font-serif text-sm font-bold block text-ink">{activeJob.user?.email}</span>
                    <span className="text-gray-500">Raipur Central Coordinates</span>
                  </div>
                </div>
              </div>

              {/* Job progress button CTA */}
              <div className="flex justify-between items-center gap-4">
                <div className="text-xs">
                  <span className="text-gray-400 block font-semibold">Total Job Earnings</span>
                  <span className="font-serif text-base font-bold text-emerald-700">₹{Math.max(35, Math.floor(activeJob.total * 0.1))}</span>
                </div>

                <button
                  onClick={() => handleProgressJob(activeJob.id, activeJob.status)}
                  className="py-3 px-6 bg-coral hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  {activeJob.status === 'ASSIGNED' && 'Mark Picked Up'}
                  {activeJob.status === 'PICKED_UP' && 'Mark Out For Delivery'}
                  {activeJob.status === 'OUT_FOR_DELIVERY' && 'Mark Delivered'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-line rounded-3xl p-8 shadow-sm text-center py-16">
              <Compass size={36} className="mx-auto mb-2 text-gray-400 opacity-60 animate-spin-slow" />
              <h3 className="font-serif text-xl font-bold mb-1">Awaiting Courier Jobs</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                You are currently offline or don&apos;t have an active assigned courier route. Claim a restaurant job from the available listing queue.
              </p>
            </div>
          )}

          {/* Available Jobs pool */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5">Available Job Openings</h3>
            {availableOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <AlertCircle size={28} className="mx-auto mb-2 opacity-50" />
                <span className="text-xs font-semibold uppercase tracking-wider">No packages ready for pickup</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {availableOrders.map((ord) => (
                  <div key={ord.id} className="bg-slate-50 border border-line p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-xs">Job {ord.id}</span>
                        <span className="text-[10px] bg-gold/15 text-yellow-800 font-bold px-2 py-0.5 rounded uppercase">
                          Ready for Courier
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-col gap-1">
                        <span>Pickup: <b className="text-ink">{ord.restaurant?.name}</b></span>
                        <span>Estimated Earnings: <b className="text-emerald-700">₹{Math.max(35, Math.floor(ord.total * 0.1))}</b></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimOrder(ord.id)}
                      className="py-2.5 px-4 bg-ink hover:bg-moss text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      Claim Route
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Wallet & History */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Wallet summary */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5 flex items-center gap-1.5">
              <Wallet size={18} className="text-coral" /> Earnings Wallet
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Completed Routes</span>
                <span className="font-bold text-sm">{stats.totalDeliveries} routes</span>
              </div>
              <div className="flex justify-between items-center border-t border-line/60 pt-4">
                <span className="text-xs text-gray-500 font-bold">Total Wallet Cash</span>
                <span className="font-serif text-xl font-bold text-emerald-700">₹{stats.totalEarnings}</span>
              </div>
            </div>
          </div>

          {/* Delivery History */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-4">Route History</h3>
            <div className="flex flex-col gap-3 text-xs">
              {stats.deliveryHistory?.map((hist: any) => (
                <div key={hist.id} className="flex justify-between items-center text-gray-600">
                  <span>Job {hist.id} ({hist.date})</span>
                  <span className="font-semibold text-emerald-700">+₹{hist.earning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
