'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock, Shield, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore, UserRole, UserSession } from '@/stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function AuthPage() {
  const router = useRouter();
  const loginSession = useAuthStore((s) => s.login);
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter all required credentials.');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? 'login' : 'register';

    try {
      // Try hitting the real Express backend API
      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const json = await res.ok ? await res.json() : null;

      if (json && json.accessToken) {
        loginSession(json.user, json.accessToken, json.refreshToken);
        toast.success(isLogin ? `Welcome back, ${json.user.email}!` : 'Account created successfully!');
        
        // Route to dashboard/listing based on role
        redirectUser(json.user.role);
        return;
      }
    } catch (err) {
      console.warn('Real API failed, triggering client mock session fallback.');
    }

    // Client-side Mock Authentication Fallback (Happens if server is not running)
    setTimeout(() => {
      setLoading(false);
      const mockUser: UserSession = {
        id: `usr-${Math.floor(Math.random() * 9000) + 1000}`,
        email,
        role
      };
      
      loginSession(mockUser, 'mock-access-token-jwt', 'mock-refresh-token-jwt');
      toast.success(
        isLogin 
          ? `[Mock Login] Welcome back, ${email} (${role})!` 
          : `[Mock Register] Created account for ${email}!`
      );
      
      redirectUser(role);
    }, 800);
  };

  const redirectUser = (userRole: UserRole) => {
    if (userRole === 'CUSTOMER') {
      router.push('/discover');
    } else if (userRole === 'RESTAURANT_OWNER') {
      router.push('/dashboard/restaurant');
    } else if (userRole === 'DELIVERY_PARTNER') {
      router.push('/dashboard/delivery');
    } else if (userRole === 'ADMIN') {
      router.push('/dashboard/admin');
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background Graphic Orbs */}
      <div className="absolute top-0 left-0 w-[45vw] h-[45vw] rounded-full bg-gold/10 filter blur-[90px] pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[35vw] h-[35vw] rounded-full bg-coral/10 filter blur-[90px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Top Left Return Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-coral transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Return Home</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Editorial Logo Head */}
        <div className="text-center mb-8">
          <Link href="/" className="logo font-serif font-bold text-3xl tracking-tight block mb-2 text-ink">
            ✦ citybites
          </Link>
          <p className="text-xs text-gray-500 font-medium">
            Raipur&apos;s mindful hyperlocal ordering ecosystem
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white/70 border border-line p-1 rounded-2xl mb-6 shadow-sm">
          <button
            onClick={() => { setIsLogin(true); setErrorStates(); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              isLogin ? 'bg-ink text-cream shadow-md' : 'text-gray-500 hover:text-ink'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorStates(); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              !isLogin ? 'bg-ink text-cream shadow-md' : 'text-gray-500 hover:text-ink'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Container */}
        <motion.div 
          layout
          className="bg-white border border-line rounded-3xl p-8 shadow-xl premium-card-shadow"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] font-bold tracking-widest text-coral uppercase block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="e.g. customer@citybites.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold tracking-widest text-coral uppercase block mb-2">
                Secret Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            {/* Role Switcher (Shown prominently to facilitate UI testing) */}
            <div>
              <label className="text-[10px] font-bold tracking-widest text-coral uppercase block mb-2 flex items-center gap-1">
                <Shield size={10} /> Choose Platform Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full py-3.5 px-4 rounded-xl text-sm border border-line bg-white"
              >
                <option value="CUSTOMER">Customer (Browse & Order)</option>
                <option value="RESTAURANT_OWNER">Restaurant Owner (Edit Menu & Cook)</option>
                <option value="DELIVERY_PARTNER">Delivery Partner (Deliver Orders)</option>
                <option value="ADMIN">System Administrator (Approve Spots)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 py-4 px-6 bg-coral hover:bg-orange-600 text-white rounded-xl font-bold text-sm btn-magnetic shadow-lg shadow-coral/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Securing Session...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Enter Ecosystem' : 'Initialize Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Tips Box */}
        <div className="mt-8 bg-gold/10 border border-gold/20 p-4.5 rounded-2xl flex gap-3 text-xs leading-relaxed text-yellow-900">
          <Sparkles size={18} className="shrink-0 text-gold mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Developer Credentials Guide:</span>
            <span>You can log in with any custom email! To test loaded data directly in Live Mode, use seed accounts:<br />
            • Customer: <b className="font-mono">customer@citybites.com</b> / <b className="font-mono">customer123</b><br />
            • Restaurant: <b className="font-mono">owner@citybites.com</b> / <b className="font-mono">owner123</b><br />
            • Rider: <b className="font-mono">rider@citybites.com</b> / <b className="font-mono">rider123</b><br />
            • Admin: <b className="font-mono">admin@citybites.com</b> / <b className="font-mono">admin123</b></span>
          </div>
        </div>
      </div>
    </main>
  );

  function setErrorStates() {
    // helper to clean inputs
  }
}
