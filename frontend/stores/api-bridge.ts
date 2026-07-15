// API Bridge: Dual-Mode Live/Mock Client API
import { CartItem } from './cart-store';
import { UserRole } from './auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const HAS_LIVE_API_CONFIG = Boolean(process.env.NEXT_PUBLIC_API_URL);

// In-Memory fallback DB for Mock Mode
const MOCK_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'The Spice Route',
    slug: 'the-spice-route',
    city: 'Raipur',
    isOpen: true,
    cuisine: 'North Indian · Biryani',
    rating: '4.7',
    time: '25–30 min',
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=85',
    menuItems: [
      { id: 'item-101', name: 'Gourmet Butter Chicken', price: 340, isAvailable: true },
      { id: 'item-102', name: 'Royal Awadhi Biryani', price: 290, isAvailable: true },
      { id: 'item-103', name: 'Paneer Lababdar', price: 280, isAvailable: true },
      { id: 'item-104', name: 'Tandoori Roti Basket', price: 90, isAvailable: true },
      { id: 'item-105', name: 'Kesar Pista Phirni', price: 120, isAvailable: true },
    ]
  },
  {
    id: 'rest-2',
    name: 'Crust & Crumb',
    slug: 'crust-crumb',
    city: 'Raipur',
    isOpen: true,
    cuisine: 'Pizza · Italian',
    rating: '4.5',
    time: '30–35 min',
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=85',
    menuItems: [
      { id: 'item-201', name: 'Truffle Mushroom Pizza', price: 420, isAvailable: true },
      { id: 'item-202', name: 'Wild Sourdough Margarita', price: 360, isAvailable: true },
      { id: 'item-203', name: 'Creamy Pesto Fettuccine', price: 380, isAvailable: true },
      { id: 'item-204', name: 'Almond Butter Croissant', price: 140, isAvailable: true },
      { id: 'item-205', name: 'Cold Brew Espresso', price: 160, isAvailable: true },
    ]
  },
  {
    id: 'rest-3',
    name: 'Momo Nation',
    slug: 'momo-nation',
    city: 'Raipur',
    isOpen: true,
    cuisine: 'Tibetan · Chinese',
    rating: '4.6',
    time: '20–25 min',
    img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1000&q=85',
    menuItems: [
      { id: 'item-301', name: 'Steamed Cheese & Corn Momos', price: 180, isAvailable: true },
      { id: 'item-302', name: 'Schezwan Fried Wontons', price: 190, isAvailable: true },
      { id: 'item-303', name: 'Classic Chicken Thukpa', price: 240, isAvailable: true },
      { id: 'item-304', name: 'Chilli Garlic Noodles', price: 220, isAvailable: true },
      { id: 'item-305', name: 'Matcha Iced Bubble Tea', price: 170, isAvailable: true },
    ]
  }
];

class ApiBridge {
  private isLive: boolean | null = null;

  private async checkLiveness(): Promise<boolean> {
    if (this.isLive !== null) return this.isLive;

    if (!HAS_LIVE_API_CONFIG) {
      this.isLive = false;
      return false;
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`, { signal: controller.signal });
      clearTimeout(id);
      this.isLive = res.ok;
    } catch (e) {
      this.isLive = false;
    }
    return this.isLive;
  }

  private getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('cb_access');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Get local storage mock database helper
  private getMockDb() {
    if (typeof window === 'undefined') return { restaurants: MOCK_RESTAURANTS, orders: [] };
    
    let restaurants = localStorage.getItem('cb_mock_restaurants');
    if (!restaurants) {
      localStorage.setItem('cb_mock_restaurants', JSON.stringify(MOCK_RESTAURANTS));
      restaurants = JSON.stringify(MOCK_RESTAURANTS);
    }
    
    let orders = localStorage.getItem('cb_mock_orders');
    if (!orders) {
      localStorage.setItem('cb_mock_orders', JSON.stringify([]));
      orders = JSON.stringify([]);
    }

    return {
      restaurants: JSON.parse(restaurants),
      orders: JSON.parse(orders)
    };
  }

  private saveMockDb(db: { restaurants: any[]; orders: any[] }) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cb_mock_restaurants', JSON.stringify(db.restaurants));
    localStorage.setItem('cb_mock_orders', JSON.stringify(db.orders));
  }

  // RESTAURANTS API
  async getRestaurants(filters?: { search?: string; city?: string }): Promise<any[]> {
    const isLive = await this.checkLiveness();
    if (isLive) {
      try {
        const query = new URLSearchParams(filters as any).toString();
        const res = await fetch(`${API_BASE_URL}/restaurants?${query}`);
        const json = await res.json();
        // Map database schema to frontend needs (adding cuisine, rating, time, img if not present)
        return json.data.map((r: any, idx: number) => ({
          ...r,
          cuisine: r.cuisine || (idx % 3 === 0 ? 'North Indian · Biryani' : idx % 3 === 1 ? 'Pizza · Italian' : 'Tibetan · Chinese'),
          rating: r.rating || (idx % 3 === 0 ? '4.7' : idx % 3 === 1 ? '4.5' : '4.6'),
          time: r.time || (idx % 3 === 0 ? '25–30 min' : idx % 3 === 1 ? '30–35 min' : '20–25 min'),
          img: r.img || (idx % 3 === 0 
            ? 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=85'
            : idx % 3 === 1 
            ? 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=85'
            : 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1000&q=85')
        }));
      } catch (e) {
        console.error('Failed fetching live restaurants, falling back to mock.', e);
      }
    }
    
    // Mock Fallback
    const db = this.getMockDb();
    let filtered = db.restaurants;
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((r: any) => r.name.toLowerCase().includes(searchLower));
    }
    return filtered;
  }

  async getRestaurantMenu(id: string): Promise<any> {
    const isLive = await this.checkLiveness();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE_URL}/restaurants/${id}`);
        const json = await res.json();
        const r = json.data;
        return {
          ...r,
          cuisine: r.cuisine || 'North Indian · Biryani',
          rating: r.rating || '4.7',
          time: r.time || '25–30 min',
          img: r.img || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=85',
        };
      } catch (e) {
        console.error('Failed fetching live menu, falling back to mock.', e);
      }
    }

    const db = this.getMockDb();
    return db.restaurants.find((r: any) => r.id === id) || db.restaurants[0];
  }

  // ORDERS API
  async placeOrder(orderData: { restaurantId: string; items: CartItem[]; total: number }): Promise<any> {
    const isLive = await this.checkLiveness();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify(orderData)
        });
        const json = await res.json();
        if (res.ok) return json.data;
        throw new Error(json.error || 'Failed to place order');
      } catch (e: any) {
        console.error('Failed placing live order, falling back to mock.', e);
      }
    }

    // Mock Fallback
    const db = this.getMockDb();
    const activeRest = db.restaurants.find((r: any) => r.id === orderData.restaurantId);
    const newOrder = {
      id: `ord-${Math.floor(Math.random() * 90000) + 10000}`,
      userId: 'user-mock-cust',
      restaurantId: orderData.restaurantId,
      restaurant: {
        id: orderData.restaurantId,
        name: activeRest?.name || 'Local Kitchen',
        img: activeRest?.img || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=85'
      },
      status: 'PENDING',
      total: orderData.total,
      items: orderData.items,
      createdAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    this.saveMockDb(db);
    return newOrder;
  }

  async getOrder(id: string): Promise<any> {
    const isLive = await this.checkLiveness();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
          headers: this.getAuthHeaders()
        });
        const json = await res.json();
        return json.data;
      } catch (e) {
        console.error('Failed getting live order, falling back to mock.', e);
      }
    }

    const db = this.getMockDb();
    const ord = db.orders.find((o: any) => o.id === id);
    if (!ord) return null;
    
    // Auto-populate restaurant object if not attached
    if (!ord.restaurant) {
      const rest = db.restaurants.find((r: any) => r.id === ord.restaurantId);
      ord.restaurant = rest || db.restaurants[0];
    }
    return ord;
  }

  async getOrders(): Promise<any[]> {
    const isLive = await this.checkLiveness();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          headers: this.getAuthHeaders()
        });
        const json = await res.json();
        return json.data;
      } catch (e) {
        console.error('Failed fetching live orders, falling back to mock.', e);
      }
    }

    const db = this.getMockDb();
    return db.orders;
  }

  async updateOrderStatus(id: string, status: string): Promise<any> {
    const isLive = await this.checkLiveness();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify({ status })
        });
        const json = await res.json();
        return json.data;
      } catch (e) {
        console.error('Failed updating status on live API, falling back to mock.', e);
      }
    }

    const db = this.getMockDb();
    db.orders = db.orders.map((o: any) => {
      if (o.id === id) {
        o.status = status;
        if (status === 'ASSIGNED') {
          o.rider = { id: 'rider-mock', email: 'rider@citybites.com' };
        }
      }
      return o;
    });
    this.saveMockDb(db);
    
    // Broadcast status change locally for mock socket updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mock_order_status_change', { detail: { id, status } }));
    }
    
    return db.orders.find((o: any) => o.id === id);
  }

  async assignRider(id: string): Promise<any> {
    const isLive = await this.checkLiveness();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${id}/assign`, {
          method: 'PATCH',
          headers: this.getAuthHeaders()
        });
        const json = await res.json();
        return json.data;
      } catch (e) {
        console.error('Failed assigning rider on live API, falling back to mock.', e);
      }
    }

    return this.updateOrderStatus(id, 'ASSIGNED');
  }

  // DASHBOARD STATS
  async getDashboardStats(role: UserRole, restaurantId?: string): Promise<any> {
    const isLive = await this.checkLiveness();
    if (isLive) {
      try {
        const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
        const endpoint = `${API_BASE_URL}/dashboards/${role.toLowerCase().replace('_owner', '')}${query}`;
        const res = await fetch(endpoint, { headers: this.getAuthHeaders() });
        const json = await res.json();
        return json.data;
      } catch (e) {
        console.error(`Failed getting live dashboard stats for ${role}, falling back to mock.`, e);
      }
    }

    // Mock Dashboard Calculations
    const db = this.getMockDb();
    const orders = db.orders;

    if (role === 'RESTAURANT_OWNER') {
      const restOrders = restaurantId ? orders.filter((o: any) => o.restaurantId === restaurantId) : orders;
      const completed = restOrders.filter((o: any) => o.status === 'DELIVERED');
      const totalRevenue = completed.reduce((sum: number, o: any) => sum + o.total, 0);
      
      const salesHistory = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
        // Distribute sales nicely
        const scale = idx === 5 || idx === 6 ? 1.5 : 0.8;
        return {
          date: day,
          sales: Math.floor((totalRevenue * 0.12) * scale) || (150 * (idx + 1)),
          orders: Math.floor(restOrders.length / 7) + 1
        };
      });

      return {
        totalRevenue,
        orderCount: restOrders.length,
        pendingCount: restOrders.filter((o: any) => o.status === 'PENDING').length,
        activeCount: restOrders.filter((o: any) => !['PENDING', 'DELIVERED', 'CANCELLED'].includes(o.status)).length,
        menuItemsCount: db.restaurants.find((r: any) => r.id === restaurantId)?.menuItems.length || 5,
        salesHistory
      };
    }

    if (role === 'DELIVERY_PARTNER') {
      const completed = orders.filter((o: any) => o.status === 'DELIVERED');
      const totalDeliveries = completed.length;
      const totalEarnings = completed.reduce((sum: number, o: any) => sum + Math.max(35, Math.floor(o.total * 0.1)), 0);

      return {
        totalEarnings,
        totalDeliveries,
        activeDeliveries: orders.filter((o: any) => ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status)),
        deliveryHistory: orders.map((o: any) => ({
          id: o.id,
          total: o.total,
          status: o.status,
          date: new Date(o.createdAt).toLocaleDateString(),
          earning: o.status === 'DELIVERED' ? Math.max(35, Math.floor(o.total * 0.1)) : 0
        }))
      };
    }

    if (role === 'ADMIN') {
      const completed = orders.filter((o: any) => o.status === 'DELIVERED');
      const platformRevenue = completed.reduce((sum: number, o: any) => sum + o.total, 0);
      
      return {
        totalUsers: 45,
        totalRestaurants: db.restaurants.length,
        totalOrders: orders.length,
        platformRevenue,
        pendingRestaurants: db.restaurants.filter((r: any) => !r.isOpen)
      };
    }

    return null;
  }

  // Socket Mock/Live Client Generator
  subscribeToOrder(orderId: string, onUpdate: (order: any) => void): () => void {
    let active = true;
    let ws: any = null;

    this.checkLiveness().then(isLive => {
      if (!active) return;
      if (isLive) {
        try {
          const { io } = require('socket.io-client');
          const socket = io(API_BASE_URL.replace('/api/v1', ''), {
            transports: ['websocket'],
            withCredentials: true
          });
          ws = socket;
          
          socket.emit('order:subscribe', orderId);
          socket.on('order:status_changed', (updatedOrder: any) => {
            if (updatedOrder.id === orderId) {
              onUpdate(updatedOrder);
            }
          });
        } catch (e) {
          console.error('Socket.IO connection failed, switching to mock subscription.', e);
        }
      }
    });

    // Local Mock listener fallback
    const localHandler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.id === orderId) {
        this.getOrder(orderId).then(order => {
          if (order && active) {
            onUpdate(order);
          }
        });
      }
    };

    window.addEventListener('mock_order_status_change', localHandler);

    return () => {
      active = false;
      window.removeEventListener('mock_order_status_change', localHandler);
      if (ws) {
        ws.disconnect();
      }
    };
  }
}

export const api = new ApiBridge();
