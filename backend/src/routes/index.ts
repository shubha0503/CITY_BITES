import { Router } from 'express';
import { register, login, getMe, authenticateToken } from '../controllers/auth.js';
import { listRestaurants, getRestaurantMenu, createRestaurant, toggleOpenStatus } from '../controllers/restaurant.js';
import { createOrder, getOrder, listOrders, updateOrderStatus, assignRider } from '../controllers/order.js';
import { getRestaurantStats, getDeliveryStats, getAdminStats } from '../controllers/dashboard.js';

export const router = Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getMe);

// Restaurant routes
router.get('/restaurants', listRestaurants);
router.get('/restaurants/:id', getRestaurantMenu);
router.post('/restaurants', authenticateToken, createRestaurant);
router.patch('/restaurants/:id/status', authenticateToken, toggleOpenStatus);

// Order routes
router.post('/orders', authenticateToken, createOrder);
router.get('/orders', authenticateToken, listOrders);
router.get('/orders/:id', authenticateToken, getOrder);
router.patch('/orders/:id/status', authenticateToken, updateOrderStatus);
router.patch('/orders/:id/assign', authenticateToken, assignRider);

// Dashboard routes
router.get('/dashboards/restaurant', authenticateToken, getRestaurantStats);
router.get('/dashboards/delivery', authenticateToken, getDeliveryStats);
router.get('/dashboards/admin', authenticateToken, getAdminStats);
