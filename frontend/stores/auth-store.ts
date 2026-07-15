import { create } from 'zustand';

export type UserRole = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_PARTNER' | 'ADMIN';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: UserSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  // A test helper to switch roles on the client instantly
  activeRole: UserRole;
  
  login: (user: UserSession, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setActiveRole: (role: UserRole) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Try to load initial session from localStorage if available (client-side only)
  let initialUser: UserSession | null = null;
  let initialAccess: string | null = null;
  let initialRefresh: string | null = null;
  let initialRole: UserRole = 'CUSTOMER';

  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('cb_user');
      if (storedUser) {
        initialUser = JSON.parse(storedUser);
        initialRole = initialUser?.role || 'CUSTOMER';
      }
      initialAccess = localStorage.getItem('cb_access');
      initialRefresh = localStorage.getItem('cb_refresh');
    } catch (e) {
      console.error('Failed to load session from localStorage', e);
    }
  }

  return {
    user: initialUser,
    accessToken: initialAccess,
    refreshToken: initialRefresh,
    activeRole: initialRole,

    login: (user, accessToken, refreshToken) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_user', JSON.stringify(user));
        localStorage.setItem('cb_access', accessToken);
        localStorage.setItem('cb_refresh', refreshToken);
      }
      set({
        user,
        accessToken,
        refreshToken,
        activeRole: user.role,
      });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cb_user');
        localStorage.removeItem('cb_access');
        localStorage.removeItem('cb_refresh');
      }
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        activeRole: 'CUSTOMER',
      });
    },

    setActiveRole: (role) => {
      set({ activeRole: role });
    },

    isAuthenticated: () => {
      return get().user !== null;
    },
  };
});
