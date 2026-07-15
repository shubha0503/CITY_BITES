'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Star, Clock, ShoppingBag, Plus, Minus, Check, 
  MapPin, AlertCircle, ChevronRight, X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cart-store';
import { api } from '@/stores/api-bridge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RestaurantDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomizerItem, setSelectedCustomizerItem] = useState<any>(null);
  const [customizationText, setCustomizationText] = useState('');

  // Cart integration
  const cartItems = useCartStore((s) => s.items);
  const cartRestaurant = useCartStore((s) => s.restaurant);
  const addCartItem = useCartStore((s) => s.add);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartSubtotal = useCartStore((s) => s.subtotal());

  // Load restaurant & menu
  useEffect(() => {
    setLoading(true);
    api.getRestaurantMenu(id).then((data) => {
      setRestaurant(data);
      setLoading(false);
    });
  }, [id]);

  const handleAddItemClick = (item: any) => {
    // If cart has items from another restaurant, warn the user
    if (cartRestaurant && cartRestaurant.id !== id) {
      const confirmChange = window.confirm(
        `Your cart contains items from "${cartRestaurant.name}". Adding this item will empty your previous cart. Continue?`
      );
      if (!confirmChange) return;
    }

    // Open premium customizer modal for customizations
    setSelectedCustomizerItem(item);
    setCustomizationText('');
  };

  const handleConfirmCustomization = () => {
    if (!selectedCustomizerItem) return;
    
    addCartItem({
      id: selectedCustomizerItem.id,
      name: selectedCustomizerItem.name,
      price: selectedCustomizerItem.price,
      customization: customizationText || undefined
    }, {
      id: restaurant.id,
      name: restaurant.name
    });

    toast.success(`Added ${selectedCustomizerItem.name} to your bag!`);
    setSelectedCustomizerItem(null);
  };

  const getQuantityInCart = (itemId: string) => {
    return cartItems
      .filter(item => item.id === itemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase">Fetching Menu Catalogue...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={40} className="text-coral mb-4" />
        <h3 className="font-serif text-2xl font-bold mb-2">Culinary spot not found</h3>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          The restaurant you are looking for might have closed, changed locations, or is temporarily offline.
        </p>
        <Link href="/discover" className="py-3 px-6 bg-ink text-white font-bold text-xs uppercase tracking-widest rounded-xl">
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-ink pb-36 relative">
      {/* Immersive Cover Image Header */}
      <header className="relative h-[250px] sm:h-[350px] lg:h-[400px] overflow-hidden">
        <img 
          src={restaurant.img} 
          alt={restaurant.name} 
          className="w-full h-full object-cover filter brightness-[0.7]" 
        />
        
        {/* Navigation Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        
        <div className="absolute top-6 left-6 lg:left-[6.5%] z-10">
          <Link 
            href="/discover" 
            className="flex items-center gap-1.5 py-2.5 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Discover Spots</span>
          </Link>
        </div>

        {/* Restaurant Details Head Block */}
        <div className="absolute bottom-10 left-6 lg:left-[6.5%] right-6 lg:right-[6.5%] text-white flex flex-col sm:flex-row justify-between items-end gap-6 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-coral text-white font-bold text-[9px] uppercase tracking-widest py-1 px-2.5 rounded-md">Raipur Local</span>
              {restaurant.isOpen ? (
                <span className="bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-widest py-1 px-2.5 rounded-md">Open Now</span>
              ) : (
                <span className="bg-red-800 text-white font-bold text-[9px] uppercase tracking-widest py-1 px-2.5 rounded-md">Closed</span>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none mb-2">
              {restaurant.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              {restaurant.cuisine} · {restaurant.city}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/45 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
            <div className="text-center px-3 border-r border-white/15">
              <span className="flex items-center gap-1 text-gold font-bold text-sm justify-center mb-0.5">
                <Star size={14} fill="currentColor" /> {restaurant.rating}
              </span>
              <span className="text-[10px] text-gray-400 font-medium block">4.9 community stars</span>
            </div>
            <div className="text-center px-3">
              <span className="flex items-center gap-1 text-white font-bold text-sm justify-center mb-0.5">
                <Clock size={14} className="text-coral" /> {restaurant.time}
              </span>
              <span className="text-[10px] text-gray-400 font-medium block">average courier speed</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Menu Segment */}
      <section className="px-6 lg:px-[6.5%] mt-16 max-w-4xl mx-auto">
        <h2 className="font-serif text-2xl font-bold border-b border-line pb-4 mb-8">
          Recommended Delicacies
        </h2>

        {/* Menu Items Grid */}
        <div className="flex flex-col gap-6">
          {restaurant.menuItems.map((item: any, idx: number) => {
            const qty = getQuantityInCart(item.id);
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={item.id}
                className="bg-white border border-line p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex justify-between items-center gap-6"
              >
                <div>
                  <span className="w-4.5 h-4.5 rounded border border-emerald-700 flex items-center justify-center mb-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                  </span>
                  <h3 className="font-serif text-lg font-bold group-hover:text-coral transition-colors">{item.name}</h3>
                  <span className="text-sm font-semibold text-coral mt-1 block">₹{item.price}</span>
                  <p className="text-xs text-gray-400 mt-2 max-w-lg leading-relaxed">
                    Freshly made in house with premium regional spices. Served standard warm.
                  </p>
                </div>

                {/* Add to bag controls */}
                <div className="shrink-0">
                  {qty > 0 ? (
                    <div className="flex items-center bg-ink text-cream rounded-xl shadow-md overflow-hidden">
                      <button 
                        onClick={() => {
                          const existingItem = cartItems.find(x => x.id === item.id);
                          if (existingItem) {
                            updateQuantity(existingItem.id + (existingItem.customization ? '-' + existingItem.customization : ''), qty - 1);
                          }
                        }}
                        className="p-3.5 hover:bg-moss transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-4 text-sm font-bold">{qty}</span>
                      <button 
                        onClick={() => handleAddItemClick(item)}
                        className="p-3.5 hover:bg-moss transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddItemClick(item)}
                      className="py-3 px-5 bg-white border border-line hover:border-coral text-ink font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Plus size={14} className="text-coral" />
                      <span>Add to Bag</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Floating Checkout Bag Indicator Bar */}
      <AnimatePresence>
        {cartItems.length > 0 && cartRestaurant && cartRestaurant.id === id && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-6 right-6 lg:left-1/2 lg:right-auto lg:w-[700px] lg:-translate-x-1/2 z-30"
          >
            <div className="dark-glass p-5 rounded-2xl flex items-center justify-between text-white shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-coral rounded-xl">
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-xs text-gray-300 block font-medium">Your citybites bag ({cartItems.length} items)</span>
                  <span className="font-serif text-lg font-bold">₹{cartSubtotal} <small className="text-xs text-gray-400 font-sans font-medium">(subtotal)</small></span>
                </div>
              </div>

              <button
                onClick={() => router.push('/cart')}
                className="py-3.5 px-6 bg-coral hover:bg-orange-600 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 group transition-colors"
              >
                <span>Continue to checkout</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customizer Drawer / Modal Overlay */}
      <AnimatePresence>
        {selectedCustomizerItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomizerItem(null)}
              className="fixed inset-0 z-40 bg-black"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white p-8 border-l border-line flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-serif text-xl font-bold">Customize Item</h3>
                  <button onClick={() => setSelectedCustomizerItem(null)} className="p-2 border border-line rounded-full hover:text-coral transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="font-serif text-lg font-bold mb-1">{selectedCustomizerItem.name}</h4>
                  <span className="text-sm font-semibold text-coral">₹{selectedCustomizerItem.price}</span>
                </div>

                <div className="flex flex-col gap-5">
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-coral uppercase block mb-2">Preparation Instructions</label>
                    <textarea
                      placeholder="e.g. Extra spicy, no onions, keep dressing on side..."
                      value={customizationText}
                      onChange={(e) => setCustomizationText(e.target.value)}
                      className="w-full p-4 rounded-xl text-xs h-32 border border-line"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmCustomization}
                className="w-full py-4 bg-coral hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
              >
                <Check size={15} />
                <span>Confirm customization</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
