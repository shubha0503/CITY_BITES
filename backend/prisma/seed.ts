import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean the database
  await prisma.order.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned database.');

  // Create hashed passwords
  const customerHash = await bcrypt.hash('customer123', 10);
  const ownerHash = await bcrypt.hash('owner123', 10);
  const riderHash = await bcrypt.hash('rider123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  // Seed Users
  const customer = await prisma.user.create({
    data: {
      email: 'customer@citybites.com',
      passwordHash: customerHash,
      role: 'CUSTOMER',
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: 'owner@citybites.com',
      passwordHash: ownerHash,
      role: 'RESTAURANT_OWNER',
    },
  });

  const rider = await prisma.user.create({
    data: {
      email: 'rider@citybites.com',
      passwordHash: riderHash,
      role: 'DELIVERY_PARTNER',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@citybites.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  console.log('Seeded users:', {
    customer: customer.email,
    owner: owner.email,
    rider: rider.email,
    admin: admin.email,
  });

  // Seed Restaurants & Menus
  const r1 = await prisma.restaurant.create({
    data: {
      name: 'The Spice Route',
      slug: 'the-spice-route',
      city: 'Raipur',
      isOpen: true,
      menuItems: {
        create: [
          { name: 'Gourmet Butter Chicken', price: 340, isAvailable: true },
          { name: 'Royal Awadhi Biryani', price: 290, isAvailable: true },
          { name: 'Paneer Lababdar', price: 280, isAvailable: true },
          { name: 'Tandoori Roti Basket', price: 90, isAvailable: true },
          { name: 'Kesar Pista Phirni', price: 120, isAvailable: true },
        ],
      },
    },
  });

  const r2 = await prisma.restaurant.create({
    data: {
      name: 'Crust & Crumb',
      slug: 'crust-crumb',
      city: 'Raipur',
      isOpen: true,
      menuItems: {
        create: [
          { name: 'Truffle Mushroom Pizza', price: 420, isAvailable: true },
          { name: 'Wild Sourdough Margarita', price: 360, isAvailable: true },
          { name: 'Creamy Pesto Fettuccine', price: 380, isAvailable: true },
          { name: 'Almond Butter Croissant', price: 140, isAvailable: true },
          { name: 'Cold Brew Espresso', price: 160, isAvailable: true },
        ],
      },
    },
  });

  const r3 = await prisma.restaurant.create({
    data: {
      name: 'Momo Nation',
      slug: 'momo-nation',
      city: 'Raipur',
      isOpen: true,
      menuItems: {
        create: [
          { name: 'Steamed Cheese & Corn Momos', price: 180, isAvailable: true },
          { name: 'Schezwan Fried Wontons', price: 190, isAvailable: true },
          { name: 'Classic Chicken Thukpa', price: 240, isAvailable: true },
          { name: 'Chilli Garlic Noodles', price: 220, isAvailable: true },
          { name: 'Matcha Iced Bubble Tea', price: 170, isAvailable: true },
        ],
      },
    },
  });

  console.log('Seeded restaurants and menus:', [r1.name, r2.name, r3.name]);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
