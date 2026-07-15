import { Request, Response } from 'express';
import { prisma } from '../db.js';

export const createOrder = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { restaurantId, items, total } = req.body;
    if (!restaurantId || !items || !total) {
      res.status(400).json({ error: 'Restaurant ID, items, and total are required' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        userId,
        restaurantId,
        total: Number(total),
        items,
        status: 'PENDING',
      },
      include: {
        restaurant: true,
        user: { select: { id: true, email: true } },
      },
    });

    res.status(201).json({ message: 'Order placed successfully', data: order });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        user: { select: { id: true, email: true } },
        rider: { select: { id: true, email: true } },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json({ data: order });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const listOrders = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let where: any = {};
    if (role === 'CUSTOMER') {
      where.userId = userId;
    } else if (role === 'DELIVERY_PARTNER') {
      // Show orders assigned to this rider, or PENDING/READY orders that are open for pick-up
      where.OR = [
        { riderId: userId },
        { status: 'READY', riderId: null },
      ];
    } else if (role === 'RESTAURANT_OWNER') {
      // For simplicity in single-tenant setup, show all orders or check if user owns a restaurant
      // We'll show all orders if there is no explicit ownership, or filter by restaurant if they provide one
      const { restaurantId } = req.query;
      if (restaurantId) {
        where.restaurantId = restaurantId as string;
      }
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      // Admins see all orders
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        restaurant: true,
        user: { select: { id: true, email: true } },
        rider: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: orders });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'PENDING',
      'ACCEPTED',
      'PREPARING',
      'READY',
      'ASSIGNED',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid order status' });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        restaurant: true,
        user: { select: { id: true, email: true } },
        rider: { select: { id: true, email: true } },
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${id}`).emit('order:status_changed', order);
    }

    res.status(200).json({ message: `Order status updated to ${status}`, data: order });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const assignRider = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const riderId = req.user?.id; // The rider assigning themselves

    if (req.user?.role !== 'DELIVERY_PARTNER' && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Only delivery riders or admins can assign riders' });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        riderId,
        status: 'ASSIGNED',
      },
      include: {
        restaurant: true,
        user: { select: { id: true, email: true } },
        rider: { select: { id: true, email: true } },
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${id}`).emit('order:status_changed', order);
    }

    res.status(200).json({ message: 'Rider assigned successfully', data: order });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

