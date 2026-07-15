'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, Star, Clock, Heart, 
  MapPin, ChevronRight, RefreshCw, X, ArrowUpRight, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/stores/api-bridge';

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-gray-400 gap-3">
        <RefreshCw size={36} className="animate-spin text-coral" />
        <span className="text-xs font-semibold tracking-wider uppercase">Loading Discover...</span>
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('trending');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Load restaurants
  useEffect(() => {
    setLoading(true);
    api.getRestaurants({ search: searchQuery }).then((data) => {
      setRestaurants(data);
      setLoading(false);
    });
  }, [searchQuery]);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter and Sort calculations
  const filteredRestaurants = restaurants.filter(r => {
    // Cuisine filter
    if (selectedCuisine !== 'All') {
      const match = r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());
      if (!match) return false;
    }
    // Veg filter (Simulated: assume momos or pizzas might contain veg, or filter by items availability)
    if (vegOnly) {
      if (r.name.includes('Spice Route')) return false; // Spicy chicken spot
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') {
      return parseFloat(b.rating) - parseFloat(a.rating);
    }
    if (sortBy === 'time') {
      return parseInt(a.time) - parseInt(b.time);
    }
    return 0; // default trending/created order
  });

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

        <h1 className="font-serif text-4xl lg:text-5xl font-black tracking-tight leading-none mb-3">
          Explore Raipur
        </h1>
        <p className="text-xs lg:text-sm text-gray-400 max-w-md font-medium">
          Woodfired slice bars, clay-pot curries, and sweet baked delights, prepared fresh nearby.
        </p>
      </header>

      {/* Control Bar */}
      <section className="sticky top-0 z-20 glass border-b border-line px-6 lg:px-[6.5%] py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md relative bg-white border border-line rounded-2xl flex items-center px-4 py-2.5">
          <Search size={18} className="text-gray-400 mr-2.5" />
          <input
            type="text"
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-ink">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters Quick Controls */}
        <div className="w-full md:w-auto flex items-center justify-end gap-3.5 overflow-x-auto self-stretch md:self-auto py-1">
          {/* Veg Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 shrink-0 ${
              vegOnly 
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' 
                : 'bg-white text-ink border-line/60 hover:border-ink/40'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-sm border ${vegOnly ? 'bg-white border-white' : 'border-emerald-700 flex items-center justify-center'}`}>
              <span className="w-1.5 h-1.5 rounded-sm bg-emerald-700" />
            </span>
            <span>Vegetarian</span>
          </button>

          {/* Cuisine quick pills */}
          {['All', 'Biryani', 'Pizza', 'Momo'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                selectedCuisine === c
                  ? 'bg-ink text-cream border-ink shadow-md'
                  : 'bg-white text-ink border-line/60 hover:border-ink/40'
              }`}
            >
              {c === 'All' ? 'All Cuisines' : c}
            </button>
          ))}

          {/* More Filters Trigger */}
          <button
            onClick={() => setShowFilterDrawer(true)}
            className="p-3 bg-white border border-line/60 rounded-full hover:border-ink transition-colors flex items-center justify-center shrink-0"
            title="More Filters"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="px-6 lg:px-[6.5%] mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
            <RefreshCw size={36} className="animate-spin text-coral" />
            <span className="text-sm font-semibold tracking-wider uppercase">Loading Cuisines...</span>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-line/80 max-w-lg mx-auto p-8 shadow-sm">
            <h3 className="font-serif text-2xl font-bold mb-2">No matching culinary spots</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              We couldn&apos;t find any partners that match your search terms or active filters. Try refining your parameters.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCuisine('All'); setVegOnly(false); }}
              className="py-3 px-6 bg-ink text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-moss transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((rest, idx) => (
              <motion.article
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                onClick={() => router.push(`/restaurant/${rest.id}`)}
                className="group cursor-pointer flex flex-col"
                key={rest.id}
              >
                <div className="w-full aspect-4/3 rounded-4xl overflow-hidden relative border border-line shadow-sm premium-card-shadow">
                  <img
                    src={rest.img}
                    alt={rest.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => toggleWishlist(rest.id, e)}
                    className="absolute top-4 right-4 bg-white/95 text-ink hover:text-coral transition-colors w-9.5 h-9.5 rounded-full flex items-center justify-center shadow-md z-10"
                  >
                    <Heart size={16} fill={wishlist.includes(rest.id) ? 'var(--coral)' : 'none'} className={wishlist.includes(rest.id) ? 'text-coral' : ''} />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-ink/80 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase">
                    {rest.cuisine.split('·')[0]}
                  </div>
                  <div className="absolute top-4 left-4 bg-coral text-white px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase shadow-md">
                    Flat 40% OFF
                  </div>
                </div>

                <div className="flex justify-between items-start mt-5 px-1">
                  <div>
                    <h3 className="font-serif text-xl group-hover:text-coral transition-colors flex items-center gap-1.5">
                      <span>{rest.name}</span>
                      <ArrowUpRight size={15} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-coral" />
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{rest.cuisine}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-gold/15 text-yellow-800 font-bold text-xs rounded-xl">
                    <Star size={12} fill="currentColor" />
                    <span>{rest.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4.5 mt-4 pt-4 border-t border-line/60 text-xs text-gray-500 px-1">
                  <div className="flex items-center gap-1">
                    <Clock size={13} className="text-coral" />
                    <span>{rest.time}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-line" />
                  <span>₹200 for one</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-line animate-pulse" />
                  <span className="text-emerald-700 font-bold">Free Delivery</span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* Filter Drawer Dialog Overlay */}
      <AnimatePresence>
        {showFilterDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
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
                  <h3 className="font-serif text-xl font-bold">Sort & Filters</h3>
                  <button onClick={() => setShowFilterDrawer(false)} className="p-2 border border-line rounded-full hover:text-coral transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Sorting options */}
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-coral uppercase block mb-3">Sort Restaurants By</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { id: 'trending', label: 'Trending (Default)' },
                        { id: 'rating', label: 'Customer Rating' },
                        { id: 'time', label: 'Delivery Speed' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSortBy(item.id)}
                          className={`text-left text-xs py-3 px-4 rounded-xl border font-bold transition-all ${
                            sortBy === item.id 
                              ? 'bg-ink text-cream border-ink' 
                              : 'bg-white text-ink border-line/60 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowFilterDrawer(false)}
                className="w-full py-4 bg-coral hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                Apply Parameters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
