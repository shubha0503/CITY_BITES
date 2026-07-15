import { Request, Response } from 'express';
import { prisma } from '../db.js';

export const getRestaurantStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.query;

    const whereClause: any = {};
    if (restaurantId) {
      whereClause.restaurantId = restaurantId as string;
    }

    // Calculate total earnings
    const completedOrders = await prisma.order.findMany({
      where: {
        ...whereClause,
        status: 'DELIVERED',
      },
      select: { total: true },
    });

    const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + o.total, 0);

    // Count orders by status
    const allOrders = await prisma.order.findMany({ where: whereClause });
    const orderCount = allOrders.length;
    const pendingCount = allOrders.filter((o: any) => o.status === 'PENDING').length;
    const activeCount = allOrders.filter((o: any) => ['ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status)).length;

    // Simple revenue by day (last 7 days)
    const today = new Date();
    const salesHistory = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = allOrders.filter(
        (o: any) => o.status === 'DELIVERED' && o.createdAt >= startOfDay && o.createdAt <= endOfDay
      );
      const daySales = dayOrders.reduce((sum: number, o: any) => sum + o.total, 0);

      salesHistory.push({
        date: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: daySales,
        orders: dayOrders.length,
      });
    }

    // Get menu items count
    const menuItemsCount = await prisma.menuItem.count({
      where: restaurantId ? { restaurantId: restaurantId as string } : {},
    });

    res.status(200).json({
      data: {
        totalRevenue,
        orderCount,
        pendingCount,
        activeCount,
        menuItemsCount,
        salesHistory,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getDeliveryStats = async (req: any, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    if (!riderId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { riderId },
      orderBy: { createdAt: 'desc' },
    });

    const completed = orders.filter((o: any) => o.status === 'DELIVERED');
    const totalDeliveries = completed.length;
    // Assume delivery fee is 10% of order total, minimum ₹35
    const totalEarnings = completed.reduce((sum: number, o: any) => sum + Math.max(35, Math.floor(o.total * 0.1)), 0);

    res.status(200).json({
      data: {
        totalEarnings,
        totalDeliveries,
        activeDeliveries: orders.filter((o: any) => ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status)),
        deliveryHistory: orders.map((o: any) => ({
          id: o.id,
          total: o.total,
          status: o.status,
          date: o.createdAt.toLocaleDateString(),
          earning: o.status === 'DELIVERED' ? Math.max(35, Math.floor(o.total * 0.1)) : 0,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalRestaurants = await prisma.restaurant.count();
    const totalOrders = await prisma.order.count();

    const orders = await prisma.order.findMany({
      where: { status: 'DELIVERED' },
      select: { total: true },
    });
    const platformRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);

    const pendingRestaurants = await prisma.restaurant.findMany({
      where: { isOpen: false },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      data: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        platformRevenue,
        pendingRestaurants,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
