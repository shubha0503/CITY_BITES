'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, MapPin, ShoppingBag, Search, Star, 
  Menu, X, Sparkles, ChevronRight, Compass, Shield, User, LogOut, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore, UserRole } from '@/stores/auth-store';
import { api } from '@/stores/api-bridge';

// Framer motion variants
const rise = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const router = useRouter();
  const cartCount = useCartStore((s) => s.count());
  const { user, activeRole, logout, setActiveRole } = useAuthStore();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(true);

  useEffect(() => {
    // Fetch restaurants
    api.getRestaurants().then((data) => {
      setRestaurants(data.slice(0, 3));
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/discover');
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink select-none relative">
      {/* Floating Demo Role Switcher */}
      <AnimatePresence>
        {showRoleSwitcher && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 glass p-5 rounded-2xl border border-line shadow-2xl max-w-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-serif text-sm font-semibold flex items-center gap-1.5 text-coral">
                <Sparkles size={14} /> Quick Demo Switcher
              </h4>
              <button 
                onClick={() => setShowRoleSwitcher(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
              Switch roles to explore customer, owner, rider, and admin flows instantly.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Customer', role: 'CUSTOMER', path: '/discover' },
                { name: 'Restaurant Owner', role: 'RESTAURANT_OWNER', path: '/dashboard/restaurant' },
                { name: 'Delivery Partner', role: 'DELIVERY_PARTNER', path: '/dashboard/delivery' },
                { name: 'Administrator', role: 'ADMIN', path: '/dashboard/admin' }
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    setActiveRole(item.role as UserRole);
                    router.push(item.path);
                  }}
                  className={`text-xs py-2 px-3 rounded-lg font-medium transition-all ${
                    activeRole === item.role
                      ? 'bg-ink text-cream shadow-md'
                      : 'bg-white/60 hover:bg-white text-ink border border-line/40'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transparent Glass Navbar */}
      <nav className="sticky top-0 z-40 glass w-full h-19 px-6 lg:px-[6.5%] flex items-center justify-between border-b border-line/50 transition-all duration-300">
        <Link href="/" className="logo font-serif font-bold text-2xl lg:text-[28px] tracking-tight hover:opacity-80 transition-opacity">
          ✦ citybites
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/discover" className="nav-link-hover text-sm font-medium hover:text-coral transition-colors">
            Discover
          </Link>
          <Link href="#how-it-works" className="nav-link-hover text-sm font-medium hover:text-coral transition-colors">
            How It Works
          </Link>
          <Link href="#partner" className="nav-link-hover text-sm font-medium hover:text-coral transition-colors">
            For Partners
          </Link>
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 bg-white/70 border border-line/60 rounded-full">
            <MapPin size={13} className="text-coral animate-pulse" />
            <span>Raipur, India</span>
          </div>

          <Link href="/cart" className="relative p-2.5 bg-white border border-line/60 rounded-full hover:border-coral transition-all duration-300 shadow-sm flex items-center justify-center group">
            <ShoppingBag size={17} className="group-hover:scale-105 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-coral text-white text-[10px] w-5 h-5 rounded-full font-bold grid place-items-center animate-bounce shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                href={activeRole === 'CUSTOMER' ? '/profile' : activeRole === 'RESTAURANT_OWNER' ? '/dashboard/restaurant' : activeRole === 'DELIVERY_PARTNER' ? '/dashboard/delivery' : '/dashboard/admin'}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold py-2.5 px-4 bg-ink text-cream rounded-full hover:bg-moss transition-colors shadow-md"
              >
                <User size={13} />
                <span>Dashboard</span>
              </Link>
              <button 
                onClick={() => logout()}
                className="p-2.5 bg-white border border-line/60 rounded-full hover:text-coral transition-colors shadow-sm"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="flex items-center gap-1.5 text-xs font-bold py-2.5 px-5 bg-ink text-cream rounded-full hover:bg-moss transition-colors shadow-md"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-white border border-line/60 rounded-full hover:text-coral transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-line overflow-hidden absolute top-19 w-full left-0 z-30 shadow-lg"
          >
            <div className="flex flex-col gap-4 p-6">
              <Link 
                href="/discover" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold hover:text-coral transition-colors py-2 border-b border-line/30 flex items-center justify-between"
              >
                <span>Discover Restaurants</span>
                <ChevronRight size={16} />
              </Link>
              <Link 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold hover:text-coral transition-colors py-2 border-b border-line/30 flex items-center justify-between"
              >
                <span>How It Works</span>
                <ChevronRight size={16} />
              </Link>
              <Link 
                href="#partner" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold hover:text-coral transition-colors py-2 flex items-center justify-between"
              >
                <span>For Partners</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-76px)] px-6 lg:px-[6.5%] py-12 lg:py-20 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center bg-ink text-cream relative overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-0 right-0 w-[55vw] h-[55vw] rounded-full bg-gold/15 filter blur-[100px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-coral/10 filter blur-[80px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

        <div className="lg:col-span-7 flex flex-col justify-center z-10">
          <motion.div {...rise} className="inline-flex items-center gap-1.5 py-1 px-3 bg-moss rounded-full text-gold text-xs font-bold tracking-wider uppercase mb-6 self-start">
            <Sparkles size={12} /> Local Delights, Curated With Care
          </motion.div>

          <motion.h1 
            {...rise}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="huge-text font-serif font-black text-[clamp(44px,6.5vw,94px)] tracking-tight leading-[0.9] mb-6"
          >
            Everything local.<br />
            <em className="text-gold font-normal italic pr-2">Beautifully</em> close.
          </motion.h1>

          <motion.p 
            {...rise}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base lg:text-lg text-gray-300 max-w-xl mb-10 leading-relaxed font-sans"
          >
            From Raipur&apos;s oldest woodfired bakeries to tonight&apos;s gourmet cravings — CityBites connects you directly with the authentic culinary builders of your neighborhood.
          </motion.p>

          <motion.form 
            onSubmit={handleSearchSubmit}
            {...rise}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl bg-white p-2 rounded-2xl text-ink shadow-2xl border border-line"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="What are you craving today? (e.g. Pizza, Awadhi Biryani)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-gray-400 focus:box-shadow-none"
              />
            </div>
            <button 
              type="submit"
              className="py-4 px-8 bg-coral text-white rounded-xl font-bold text-sm btn-magnetic shadow-lg shadow-coral/20 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Menu</span>
              <ArrowRight size={16} />
            </button>
          </motion.form>

          {/* Social Proof */}
          <motion.div 
            {...rise} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-6 mt-12 text-xs text-gray-400 border-t border-white/10 pt-8"
          >
            <div className="flex items-center gap-1">
              <span className="text-gold text-lg font-bold">✦ 120+</span>
              <span>Local Partners</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="flex items-center gap-1">
              <span className="text-gold text-lg font-bold">● Raipur</span>
              <span>Active Operations</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Visual Block */}
        <div className="lg:col-span-5 relative w-full h-80 sm:h-105 lg:h-130 grid place-items-center z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85%] aspect-square rounded-[40%] bg-gold absolute top-[10%] left-[10%] rotate-12 -z-10 shadow-lg shadow-gold/10"
          />

          <motion.img 
            initial={{ opacity: 0, y: 50, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -5 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=90" 
            alt="Local feast platter" 
            className="w-[82%] aspect-square object-cover rounded-3xl shadow-[25px_30px_0px_var(--coral)] border-[3px] border-white z-10"
          />

          {/* Floating Badges */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="absolute left-[3%] bottom-[22%] z-20 bg-cream border border-line text-ink py-3 px-4 rounded-2xl shadow-xl flex flex-col gap-0.5 text-xs font-bold leading-tight -rotate-6"
          >
            <span className="text-coral">Local Sourcing</span>
            <span className="text-gray-500 font-medium">Warmly Delivered</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
            className="absolute right-[2%] top-[15%] z-20 bg-cream border border-line text-ink py-3 px-4.5 rounded-2xl shadow-xl flex items-center gap-1.5 text-xs font-bold rotate-6"
          >
            <Star size={14} fill="currentColor" className="text-gold" />
            <span>4.9 <small className="text-gray-400 font-normal ml-0.5">Community Rated</small></span>
          </motion.div>
        </div>
      </section>

      {/* Infinite Brand Marquee */}
      <section className="bg-coral text-cream py-5.5 overflow-hidden border-y border-coral">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex gap-20 text-[18px] lg:text-[22px] font-serif font-semibold tracking-wider uppercase">
              <span>✦ CRAFT KITCHENS</span>
              <span>✦ RAPID COURIERS</span>
              <span>✦ STRICT HYGIENE</span>
              <span>✦ ZERO EXTORTIVE COMMISSIONS</span>
              <span>✦ RAIPUR&apos;S FINEST KITCHENS</span>
              <span>✦ 100% FRESH DAILY</span>
            </div>
          ))}
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="px-6 lg:px-[6.5%] py-24 bg-cream">
        <motion.div 
          {...rise}
          className="grid md:grid-cols-12 gap-6 items-end mb-16"
        >
          <div className="md:col-span-7">
            <span className="text-xs font-bold tracking-widest text-coral uppercase block mb-3">
              Explore Cuisines
            </span>
            <h2 className="font-serif text-[clamp(34px,4vw,56px)] leading-[0.95] tracking-tight">
              A city of flavor,<br />right at your doorstep.
            </h2>
          </div>
          <div className="md:col-span-5 max-w-sm md:justify-self-end text-gray-500 text-sm leading-relaxed">
            CityBites brings the culinary soul of the city straight to your home. Select a collection and start your next meal.
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'cat-1', name: 'Awadhi Biryani', count: '14 places', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=85', tag: 'Royal Classics' },
            { id: 'cat-2', name: 'Woodfired Pizza', count: '8 places', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=85', tag: 'Sourdough' },
            { id: 'cat-3', name: 'Cheese Dumplings', count: '12 places', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=85', tag: 'Tibetan Momo' },
            { id: 'cat-4', name: 'Heritage Sweets', count: '9 places', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=85', tag: 'Fresh Baked' }
          ].map((cat, i) => (
            <motion.div
              {...rise}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              onClick={() => router.push(`/discover?search=${encodeURIComponent(cat.name)}`)}
              key={cat.id}
              className="group cursor-pointer aspect-4/5 relative rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-line"
            >
              <img 
                src={cat.img} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white" >
                <span className="text-[10px] uppercase font-bold text-gold tracking-wider mb-1">{cat.tag}</span>
                <h3 className="font-serif text-lg leading-tight mb-0.5">{cat.name}</h3>
                <span className="text-xs text-gray-300 font-medium">{cat.count}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Restaurant Showcase */}
      <section className="px-6 lg:px-[6.5%] py-24 bg-white border-y border-line/45">
        <motion.div 
          {...rise}
          className="flex flex-col sm:flex-row justify-between items-end mb-14"
        >
          <div>
            <span className="text-xs font-bold tracking-widest text-coral uppercase block mb-3">
              Raipur Originals
            </span>
            <h2 className="font-serif text-[clamp(34px,4vw,56px)] leading-[0.95] tracking-tight">
              Curated neighborhood favorites.
            </h2>
          </div>
          <Link href="/discover" className="mt-4 sm:mt-0 flex items-center gap-2 group text-sm font-bold text-coral hover:text-orange-600 transition-colors">
            <span>View all spots</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {restaurants.map((rest, i) => (
            <motion.article 
              {...rise}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onClick={() => router.push(`/restaurant/${rest.id}`)}
              className="group cursor-pointer flex flex-col"
              key={rest.id}
            >
              <div className="w-full aspect-4/3 rounded-3xl overflow-hidden relative border border-line">
                <img 
                  src={rest.img} 
                  alt={rest.name} 
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                />
                <button className="absolute top-4 right-4 bg-white/95 text-ink hover:text-coral transition-colors w-9 h-9 rounded-full flex items-center justify-center shadow-md">
                  ♡
                </button>
                <div className="absolute bottom-4 left-4 bg-ink/80 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase">
                  {rest.cuisine.split('·')[0]}
                </div>
              </div>
              
              <div className="flex justify-between items-start mt-5">
                <div>
                  <h3 className="font-serif text-xl group-hover:text-coral transition-colors">{rest.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{rest.cuisine}</p>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-gold/15 text-yellow-800 font-bold text-xs rounded-xl">
                  <Star size={12} fill="currentColor" />
                  <span>{rest.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-line/60 text-xs text-gray-500">
                <span>{rest.time}</span>
                <div className="w-1 h-1 rounded-full bg-line" />
                <span className="font-bold text-emerald-700">Flat 40% off</span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* How CityBites Works */}
      <section id="how-it-works" className="px-6 lg:px-[6.5%] py-24 bg-ink text-cream relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold tracking-widest text-gold uppercase block mb-3">
              Platform Workflow
            </span>
            <h2 className="font-serif text-[clamp(34px,4vw,56px)] leading-[0.95] tracking-tight mb-6">
              From their stove<br />to your table.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              CityBites links local kitchens directly to you, minimizing middleman markups and treating delivery couriers with the compensation they deserve.
            </p>
            <div className="w-48 h-48 rounded-full border border-gold/20 flex flex-col items-center justify-center text-gold font-serif text-center font-bold rotate-12 shrink-0">
              <span className="text-xs tracking-widest uppercase">Community</span>
              <span className="text-2xl my-1">✦ FIRST ✦</span>
              <span className="text-[10px]">RAIPUR ENGINE</span>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-8">
            {[
              { num: '01', title: 'Find a neighborhood gem', desc: 'Browse handcrafted menus and discover the culinary artisans who make our city unique.' },
              { num: '02', title: 'They cook it fresh', desc: 'The restaurant receives your orders and prepares them with authentic, local ingredients.' },
              { num: '03', title: 'Rider brings the warmth', desc: 'A dedicated delivery courier picks up the order and delivers it directly to you hot and fresh.' }
            ].map((step, i) => (
              <motion.div 
                {...rise}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                key={step.num}
                className="flex items-start gap-5 p-6 bg-moss/30 border border-white/5 rounded-2xl"
              >
                <span className="font-serif text-2xl font-black text-gold">{step.num}</span>
                <div>
                  <h3 className="font-serif text-lg text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Banner */}
      <section id="partner" className="my-20 mx-6 lg:mx-[6.5%] p-12 lg:p-20 bg-coral text-cream rounded-4xl flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-xl">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-white/10 filter blur-3xl pointer-events-none" />
        
        <div className="max-w-xl z-10">
          <span className="text-xs font-bold tracking-widest text-gold uppercase block mb-3">
            Grow with CityBites
          </span>
          <h2 className="font-serif text-[clamp(30px,3.8vw,52px)] leading-[0.95] tracking-tight mb-5">
            Your regulars are<br />already searching.
          </h2>
          <p className="text-sm text-white/95 leading-relaxed">
            Expand your customer reach with transparent rates, zero hidden commission fees, and powerful, clean dashboard analytics designed for local creators.
          </p>
        </div>

        <button 
          onClick={() => {
            setActiveRole('RESTAURANT_OWNER');
            router.push('/dashboard/restaurant');
          }}
          className="z-10 bg-white text-ink hover:text-coral font-bold py-4.5 px-8 rounded-2xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 group transition-colors btn-magnetic shrink-0"
        >
          <span>Partner portal</span>
          <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </section>

      {/* Editorial Footer */}
      <footer className="px-6 lg:px-[6.5%] py-16 bg-zinc-950 text-gray-400 border-t border-line/10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <Link href="/" className="logo font-serif font-bold text-2xl text-white tracking-tight">
              ✦ citybites
            </Link>
            <p className="text-xs leading-relaxed mt-4 max-w-xs">
              Connecting local kitchens, delivery couriers, and hungry neighbors. Beautiful hyperlocal commerce for the cities that deserve more.
            </p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Explore</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><Link href="/discover" className="hover:text-white transition-colors">Restaurants Listing</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">Operational Process</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Your Bag</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Dashboards</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><Link href="/dashboard/restaurant" className="hover:text-white transition-colors">Restaurant Owner</Link></li>
              <li><Link href="/dashboard/delivery" className="hover:text-white transition-colors">Delivery Couriers</Link></li>
              <li><Link href="/dashboard/admin" className="hover:text-white transition-colors">System Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Download</h4>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white p-1 rounded-lg">
                {/* Simulated QR Code */}
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[10px] text-white text-center font-bold leading-tight">
                  QR CODE
                </div>
              </div>
              <p className="text-[10px] max-w-30 leading-snug">
                Scan to download the companion mobile courier application.
              </p>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
          <span>© 2026 CityBites Co. Made for Raipur with bigger hearts.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
