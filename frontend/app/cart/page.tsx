'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShoppingBag, Trash2, MapPin, Tag, Percent, 
  CreditCard, Compass, CheckCircle2, ShieldCheck, Sparkles, X, Plus, Minus
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/stores/api-bridge';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const cartItems = useCartStore((s) => s.items);
  const cartRestaurant = useCartStore((s) => s.restaurant);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeCartItem = useCartStore((s) => s.remove);
  const clearCart = useCartStore((s) => s.clear);
  const couponCode = useCartStore((s) => s.couponCode);
  const couponDiscount = useCartStore((s) => s.couponDiscount);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryFee = useCartStore((s) => s.deliveryFee());
  const platformFee = useCartStore((s) => s.platformFee());
  const discountAmount = useCartStore((s) => s.discountAmount());
  const total = useCartStore((s) => s.total());

  // Input states
  const [address, setAddress] = useState('12, Civil Lines, Raipur');
  const [couponInput, setCouponInput] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (success) {
      toast.success(`Coupon code ${couponInput.toUpperCase()} applied!`);
      setCouponInput('');
    } else {
      toast.error('Invalid coupon code.');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0 || !cartRestaurant) {
      toast.error('Your bag is empty.');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter a delivery address.');
      return;
    }

    // Trigger Razorpay payment gateway simulation
    setIsPaying(true);

    setTimeout(async () => {
      try {
        const order = await api.placeOrder({
          restaurantId: cartRestaurant.id,
          items: cartItems,
          total: total
        });
        
        setIsPaying(false);
        setPaymentSuccess(true);
        toast.success('Payment authorized successfully!');
        
        setTimeout(() => {
          clearCart();
          router.push(`/track/${order.id}`);
        }, 1200);
      } catch (err) {
        setIsPaying(false);
        toast.error('Checkout failed. Please retry.');
      }
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-cream text-ink flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 bg-white border border-line rounded-full mb-6 shadow-sm">
          <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h3 className="font-serif text-2xl font-bold mb-2">Your bag is empty</h3>
        <p className="text-xs text-gray-500 max-w-sm mb-8 leading-relaxed">
          Looks like you haven&apos;t added any delicacies to tonight&apos;s order yet. Explore local kitchens to start.
        </p>
        <Link href="/discover" className="py-3.5 px-6 bg-ink text-cream font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-moss transition-colors shadow-md">
          Explore Cuisines
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-ink pb-24">
      {/* Payment Overlay Simulation */}
      <AnimatePresence>
        {isPaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-cream"
          >
            <div className="w-16 h-16 border-4 border-coral border-t-transparent rounded-full animate-spin mb-6" />
            <h3 className="font-serif text-2xl font-semibold mb-2">Authorizing Payment...</h3>
            <p className="text-xs text-gray-400 max-w-xs text-center leading-relaxed">
              Contacting secure Razorpay payment gateway. Please do not close this window or refresh the screen.
            </p>
          </motion.div>
        )}

        {paymentSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-cream"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="p-5 bg-emerald-800 rounded-full mb-6"
            >
              <CheckCircle2 size={54} className="text-white" />
            </motion.div>
            <h3 className="font-serif text-2xl font-semibold mb-2">Payment Authorized</h3>
            <p className="text-xs text-gray-400 max-w-xs text-center leading-relaxed">
              Order placed successfully. Transferring you to live tracking...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-ink text-cream pt-12 pb-16 px-6 lg:px-[6.5%] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-gold/10 filter blur-[90px] pointer-events-none" />
        
        <Link 
          href={`/restaurant/${cartRestaurant?.id}`} 
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          <span>Back to Menu</span>
        </Link>

        <h1 className="font-serif text-4xl lg:text-5xl font-black tracking-tight leading-none mb-3">
          Your Bag
        </h1>
        <p className="text-xs lg:text-sm text-gray-400 max-w-md font-medium">
          Review your items from <span className="text-gold font-bold">{cartRestaurant?.name}</span> and authorize checkout.
        </p>
      </header>

      {/* Grid Layout */}
      <section className="px-6 lg:px-[6.5%] mt-12 grid lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-start">
        {/* Left Side: Items & Details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Cart Items List */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5">Order Items</h3>
            <div className="flex flex-col gap-6">
              {cartItems.map((item) => (
                <div key={item.id + (item.customization ? '-' + item.customization : '')} className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-base">{item.name}</h4>
                    {item.customization && (
                      <span className="text-[10px] text-coral bg-coral/10 px-2 py-0.5 rounded mt-1.5 inline-block font-semibold">
                        Custom: {item.customization}
                      </span>
                    )}
                    <span className="text-xs font-bold text-gray-500 mt-1 block">₹{item.price} each</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-line rounded-lg overflow-hidden bg-slate-50">
                      <button 
                        onClick={() => updateQuantity(item.id + (item.customization ? '-' + item.customization : ''), item.quantity - 1)}
                        className="p-2 hover:bg-slate-100 transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id + (item.customization ? '-' + item.customization : ''), item.quantity + 1)}
                        className="p-2 hover:bg-slate-100 transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Trash */}
                    <button 
                      onClick={() => removeCartItem(item.id + (item.customization ? '-' + item.customization : ''))}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5 flex items-center gap-1.5">
              <MapPin size={18} className="text-coral" /> Delivery Coordinates
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold tracking-widest text-coral uppercase block mb-2">Delivery Address (Raipur)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl text-sm"
                  required
                />
              </div>

              {/* Mini Simulated Map visual */}
              <div className="h-[140px] rounded-2xl bg-zinc-950 text-white relative overflow-hidden radar-grid border border-line/10">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="w-10 h-10 rounded-full border border-gold/40 animate-ping absolute" />
                  <MapPin size={24} className="text-gold animate-bounce mb-2 z-10" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gold">Map Location Synced</span>
                  <span className="text-[9px] text-gray-500 font-medium mt-0.5">{address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Cost Summary & Checkout */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Coupon Applier */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-4 flex items-center gap-1.5">
              <Tag size={17} className="text-coral" /> Promotional Code
            </h3>
            {couponCode ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Percent size={16} className="text-emerald-700" />
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider block">{couponCode}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Promo applied · {couponDiscount}% savings</span>
                  </div>
                </div>
                <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME40"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs uppercase"
                />
                <button
                  type="submit"
                  className="py-3 px-5 bg-ink text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-moss transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
            <span className="text-[10px] text-gray-400 mt-3 block">
              Tip: Use <b className="font-semibold text-coral">WELCOME40</b> to get 40% discount!
            </span>
          </div>

          {/* Bill Breakdown */}
          <div className="bg-white border border-line p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold border-b border-line pb-3 mb-5">Order Summary</h3>
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Hyperlocal Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Platform Operations Fee</span>
                <span>₹{platformFee}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-bold">
                  <span>Promo Discount ({couponDiscount}%)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="h-px bg-line my-1" />

              <div className="flex justify-between items-center text-base font-bold font-serif text-ink">
                <span>Grand Total</span>
                <span>₹{total}</span>
              </div>

              {/* Security info */}
              <div className="flex gap-2 items-center text-[10px] text-gray-400 mt-4 border-t border-line/60 pt-4">
                <ShieldCheck size={14} className="text-coral shrink-0" />
                <span>Secure SSL Checkout via Razorpay simulation. Zero card data retained.</span>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handleCheckout}
                className="w-full mt-6 py-4.5 bg-coral hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-coral/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CreditCard size={15} />
                <span>Place order (₹{total})</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
