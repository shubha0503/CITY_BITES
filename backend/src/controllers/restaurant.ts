import { Request, Response } from 'express';
import { prisma } from '../db.js';

export const listRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, search, isOpen } = req.query;

    const where: any = {};
    if (city) {
      where.city = { contains: city as string, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (isOpen) {
      where.isOpen = isOpen === 'true';
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: restaurants });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getRestaurantMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isAvailable: true },
        },
      },
    });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    res.status(200).json({ data: restaurant });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createRestaurant = async (req: any, res: Response): Promise<void> => {
  try {
    // Only administrators or restaurant owners can create a restaurant
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'RESTAURANT_OWNER') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { name, city, isOpen } = req.body;
    if (!name || !city) {
      res.status(400).json({ error: 'Name and city are required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        city,
        isOpen: isOpen !== undefined ? isOpen : true,
      },
    });

    res.status(201).json({ message: 'Restaurant created successfully', data: restaurant });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const toggleOpenStatus = async (req: any, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'RESTAURANT_OWNER') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { id } = req.params;
    const { isOpen } = req.body;

    if (isOpen === undefined) {
      res.status(400).json({ error: 'isOpen status is required' });
      return;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { isOpen },
    });

    res.status(200).json({ message: 'Restaurant status updated successfully', data: restaurant });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
