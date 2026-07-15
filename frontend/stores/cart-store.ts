import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: string;
}

interface RestaurantInfo {
  id: string;
  name: string;
}

interface CartState {
  items: CartItem[];
  restaurant: RestaurantInfo | null;
  couponCode: string | null;
  couponDiscount: number; // Percentage, e.g. 10 for 10%
  add: (item: Omit<CartItem, 'quantity'>, restaurant: RestaurantInfo) => void;
  remove: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  
  // Selectors
  subtotal: () => number;
  deliveryFee: () => number;
  platformFee: () => number;
  discountAmount: () => number;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurant: null,
  couponCode: null,
  couponDiscount: 0,

  add: (newItem, rest) => {
    const currentRest = get().restaurant;
    
    // If adding item from a different restaurant, clear previous cart items
    const shouldClear = currentRest && currentRest.id !== rest.id;
    const items = shouldClear ? [] : [...get().items];
    
    const existingIndex = items.findIndex(
      (item) => item.id === newItem.id && item.customization === newItem.customization
    );

    if (existingIndex > -1) {
      items[existingIndex].quantity += 1;
    } else {
      items.push({ ...newItem, quantity: 1 });
    }

    set({
      items,
      restaurant: rest,
    });
  },

  remove: (itemId) => {
    const items = get().items.filter((item) => item.id !== itemId);
    const restaurant = items.length === 0 ? null : get().restaurant;
    set({
      items,
      restaurant,
      ...(items.length === 0 ? { couponCode: null, couponDiscount: 0 } : {}),
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().remove(itemId);
      return;
    }

    const items = get().items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    set({ items });
  },

  clear: () => {
    set({
      items: [],
      restaurant: null,
      couponCode: null,
      couponDiscount: 0,
    });
  },

  applyCoupon: (code) => {
    const codeUpper = code.toUpperCase();
    if (codeUpper === 'CITYBITES40' || codeUpper === 'WELCOME40') {
      set({ couponCode: codeUpper, couponDiscount: 40 });
      return true;
    } else if (codeUpper === 'FREE75' || codeUpper === 'LOCALFIRST') {
      set({ couponCode: codeUpper, couponDiscount: 20 });
      return true;
    }
    return false;
  },

  removeCoupon: () => {
    set({ couponCode: null, couponDiscount: 0 });
  },

  subtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  deliveryFee: () => {
    // If cart is empty, delivery fee is 0. Otherwise ₹35 flat for hyperlocal.
    return get().items.length === 0 ? 0 : 35;
  },

  platformFee: () => {
    return get().items.length === 0 ? 0 : 5;
  },

  discountAmount: () => {
    const sub = get().subtotal();
    const discountPct = get().couponDiscount;
    return Math.floor(sub * (discountPct / 100));
  },

  total: () => {
    const sub = get().subtotal();
    const del = get().deliveryFee();
    const plat = get().platformFee();
    const disc = get().discountAmount();
    return Math.max(0, sub + del + plat - disc);
  },

  count: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
