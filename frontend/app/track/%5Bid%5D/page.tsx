'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, MapPin, Phone, MessageSquare, 
  CheckCircle2, Compass, RefreshCw, AlertCircle, ShoppingBag, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/stores/api-bridge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTrackingPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState('25–30 min');
  const [radarDegree, setRadarDegree] = useState(0);

  // Load order details
  useEffect(() => {
    setLoading(true);
    api.getOrder(id).then((data) => {
      setOrder(data);
      setLoading(false);
      
      if (data && data.status === 'PENDING') {
        // In client-side Mock Mode, auto-progress the order status over a 30s cycle to demonstrate order flow!
        simulateOrderStatusProgress(data.id);
      }
    });
  }, [id]);

  // Subscribe to real-time socket updates (or client events fallback)
  useEffect(() => {
    if (!id) return;
    
    const unsubscribe = api.subscribeToOrder(id, (updatedOrder) => {
      setOrder(updatedOrder);
      toast.success(`Order status updated: ${updatedOrder.status}!`);
    });

    return () => unsubscribe();
  }, [id]);

  // Rotate simulated radar sweeps
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarDegree(prev => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const simulateOrderStatusProgress = (orderId: string) => {
    const statuses = [
      { status: 'ACCEPTED', delay: 3500 },
      { status: 'PREPARING', delay: 8500 },
      { status: 'READY', delay: 14500 },
      { status: 'ASSIGNED', delay: 18500 },
      { status: 'OUT_FOR_DELIVERY', delay: 24500 },
      { status: 'DELIVERED', delay: 32000 }
    ];

    statuses.forEach((step) => {
      setTimeout(async () => {
        // Query current state to ensure order wasn't cleared/changed
        const curr = await api.getOrder(orderId);
        if (curr && curr.status !== 'DELIVERED' && curr.status !== 'CANCELLED') {
          api.updateOrderStatus(orderId, step.status);
        }
      }, step.delay);
    });
  };

  const getStepProgressIndex = (status: string) => {
    const indexMap: Record<string, number> = {
      'PENDING': 0,
      'ACCEPTED': 1,
      'PREPARING': 2,
      'READY': 3,
      'ASSIGNED': 3,
      'PICKED_UP': 4,
      'OUT_FOR_DELIVERY': 4,
      'DELIVERED': 5
    };
    return indexMap[status] !== undefined ? indexMap[status] : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase">Initializing Radar Feed...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={40} className="text-coral mb-4" />
        <h3 className="font-serif text-2xl font-bold mb-2">Order not found</h3>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          We could not resolve an active order with this reference token. It may have expired or been cancelled.
        </p>
        <Link href="/discover" className="py-3 px-6 bg-ink text-white font-bold text-xs uppercase tracking-widest rounded-xl">
          Back to Discover
        </Link>
      </div>
    );
  }

  const progressIdx = getStepProgressIndex(order.status);

  return (
    <main className="min-h-screen bg-cream text-ink pb-24">
      {/* Header */}
      <header className="bg-ink text-cream pt-12 pb-16 px-6 lg:px-[6.5%] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-gold/10 filter blur-[90px] pointer-events-none" />
        
        <Link 
          href="/discover" 
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          <span>Ecosystem Directory</span>
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-gold uppercase block mb-1">
              Live Courier Tracking
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl font-black tracking-tight leading-none">
              Order {order.id}
            </h1>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Sourced from <span className="text-gold font-bold">{order.restaurant?.name || 'Local Spot'}</span>
            </p>
          </div>

          <div className="py-2.5 px-4.5 bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3">
            <Clock size={16} className="text-coral animate-pulse" />
            <div>
              <span className="text-[10px] text-gray-400 block font-semibold uppercase leading-none mb-1">Estimated Arrival</span>
              <span className="text-sm font-bold">{order.status === 'DELIVERED' ? 'Delivered warmly' : eta}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <section className="px-6 lg:px-[6.5%] mt-12 grid lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-start">
        {/* Left Side: Live Map Radar */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white border border-line rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h3 className="font-serif text-lg font-bold flex items-center gap-1.5">
                <Compass size={18} className="text-coral" /> Delivery Coordinates
              </h3>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 animate-pulse bg-emerald-50 px-2 py-1 rounded">
                Live Status: {order.status}
              </span>
            </div>

            {/* Radar Animation Area */}
            <div className="h-[280px] rounded-2xl bg-zinc-950 relative overflow-hidden radar-grid flex items-center justify-center border border-line/10">
              {/* Spinning Radar line */}
              <div 
                style={{ transform: `rotate(${radarDegree}deg)` }}
                className="absolute w-[560px] h-[560px] bg-gradient-to-r from-gold/15 to-transparent origin-center rounded-full pointer-events-none"
              />

              {/* Concentric rings */}
              <div className="absolute w-[80px] h-[80px] border border-white/5 rounded-full" />
              <div className="absolute w-[180px] h-[180px] border border-white/5 rounded-full" />
              <div className="absolute w-[280px] h-[280px] border border-white/5 rounded-full" />

              {/* Coordinates Markers */}
              {/* Restaurant Pin */}
              <div className="absolute top-[35%] left-[30%] flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-moss border border-gold flex items-center justify-center shadow-lg">
                  🍳
                </div>
                <span className="text-[9px] font-bold text-gray-400 mt-1 block">Kitchen</span>
              </div>

              {/* Courier Rider Pin */}
              {progressIdx >= 3 && progressIdx < 5 && (
                <motion.div 
                  animate={{ 
                    x: progressIdx === 3 ? [-40, -10] : [-10, 40], 
                    y: progressIdx === 3 ? [40, 0] : [0, -35] 
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-[48%] left-[50%] flex flex-col items-center z-10"
                >
                  <div className="w-9 h-9 rounded-full bg-coral border border-white flex items-center justify-center shadow-lg animate-bounce">
                    🚴
                  </div>
                  <span className="text-[9px] font-bold text-gold mt-1 block">Rider</span>
                </motion.div>
              )}

              {/* User Dropoff Pin */}
              <div className="absolute top-[60%] right-[25%] flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-ink border border-line flex items-center justify-center shadow-lg">
                  📍
                </div>
                <span className="text-[9px] font-bold text-gray-400 mt-1 block">Home</span>
              </div>
            </div>

            {/* Courier Rider Contact */}
            {progressIdx >= 3 && (
              <div className="bg-slate-50 border border-line p-4.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg shadow-sm">
                    👤
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm">Rider Assigned</h4>
                    <span className="text-[10px] text-gray-400 font-medium">Verified local courier partner</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-white border border-line rounded-full hover:text-coral transition-colors shadow-sm">
                    <Phone size={14} />
                  </button>
                  <button className="p-3 bg-white border border-line rounded-full hover:text-coral transition-colors shadow-sm">
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline & Receipt Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Progress Timeline */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5">Order Progress</h3>
            
            <div className="flex flex-col gap-5 relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
              {[
                { step: 0, label: 'Order Placed & Sent', desc: 'Awaiting restaurant approval' },
                { step: 1, label: 'Kitchen Accepted', desc: 'Order details accepted by chefs' },
                { step: 2, label: 'Delicacy Preparing', desc: 'Your meal is being cooked fresh' },
                { step: 3, label: 'Rider Dispatched', desc: 'Courier picking up package' },
                { step: 4, label: 'Out for Delivery', desc: 'Rider is cruising to your location' },
                { step: 5, label: 'Delivered', desc: 'Handed over warm. Enjoy!' }
              ].map((item) => {
                const isDone = progressIdx >= item.step;
                const isCurrent = progressIdx === item.step;
                return (
                  <div key={item.step} className="relative flex gap-3 text-xs">
                    {/* Circle indicators */}
                    <span className={`absolute -left-[20px] top-0.5 w-2.5 h-2.5 rounded-full border transition-all z-10 ${
                      isDone 
                        ? 'bg-coral border-coral scale-110 shadow-sm shadow-coral/30' 
                        : 'bg-white border-line'
                    }`} />
                    <div>
                      <h4 className={`font-serif font-bold ${isCurrent ? 'text-coral font-black text-sm' : 'text-ink'}`}>
                        {item.label}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Receipt Breakdown */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-4">Receipt Summary</h3>
            
            {/* Items Receipt */}
            <div className="flex flex-col gap-2.5 mb-4 text-xs">
              {order.items && Array.isArray(order.items) && order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-gray-600">
                  <span>{item.name} <b className="text-gray-400 font-normal">x{item.quantity}</b></span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-line my-3" />

            <div className="flex justify-between items-center text-xs font-bold text-ink">
              <span>Grand Total Paid</span>
              <span>₹{order.total}</span>
            </div>
            
            {/* Payment security indicator */}
            <div className="flex gap-2 items-center text-[10px] text-gray-400 mt-4 border-t border-line/60 pt-4">
              <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
              <span>Razorpay Simulation: Transaction authorized & logged.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
