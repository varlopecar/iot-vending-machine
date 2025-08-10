import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.loyaltyLog.deleteMany();
  await prisma.pickup.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        points: 150,
        barcode: '123456789012',
      },
    }),
    prisma.user.create({
      data: {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        points: 75,
        barcode: '234567890123',
      },
    }),
    prisma.user.create({
      data: {
        full_name: 'Bob Wilson',
        email: 'bob@example.com',
        password: hashedPassword,
        points: 300,
        barcode: '345678901234',
      },
    }),
  ]);

  console.log('👥 Created users');

  // Create machines
  const machines = await Promise.all([
    prisma.machine.create({
      data: {
        location: 'Building A - Ground Floor',
        label: 'Vending Machine A1',
        status: 'ONLINE',
        last_update: new Date().toISOString(),
      },
    }),
    prisma.machine.create({
      data: {
        location: 'Building B - 2nd Floor',
        label: 'Vending Machine B2',
        status: 'ONLINE',
        last_update: new Date().toISOString(),
      },
    }),
    prisma.machine.create({
      data: {
        location: 'Cafeteria',
        label: 'Vending Machine C1',
        status: 'MAINTENANCE',
        last_update: new Date().toISOString(),
      },
    }),
  ]);

  console.log('🤖 Created machines');

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Coca-Cola',
        description: 'Refreshing cola drink',
        price: 2.5,
        ingredients:
          'Carbonated water, sugar, caramel, phosphoric acid, natural flavors, caffeine',
        allergens: 'None',
        nutritional_value: '140 calories per 330ml',
        image_url: 'https://example.com/coca-cola.jpg',
        is_active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Chips Classic',
        description: 'Crispy potato chips',
        price: 1.8,
        ingredients: 'Potatoes, vegetable oil, salt',
        allergens: 'None',
        nutritional_value: '160 calories per 30g',
        image_url: 'https://example.com/chips.jpg',
        is_active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Water Bottle',
        description: 'Pure spring water',
        price: 1.2,
        ingredients: 'Spring water',
        allergens: 'None',
        nutritional_value: '0 calories per 500ml',
        image_url: 'https://example.com/water.jpg',
        is_active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Kinder Bueno',
        description: 'Chocolate bar with hazelnut cream',
        price: 2.8,
        ingredients:
          'Sugar, vegetable fats, hazelnuts, cocoa mass, skimmed milk powder',
        allergens: 'Milk, hazelnuts',
        nutritional_value: '180 calories per 43g',
        image_url: 'https://example.com/kinder.jpg',
        is_active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Energy Bar',
        description: 'High protein energy bar',
        price: 3.2,
        ingredients: 'Oats, honey, nuts, dried fruits, protein isolate',
        allergens: 'Nuts',
        nutritional_value: '220 calories per 60g',
        image_url: 'https://example.com/energy-bar.jpg',
        is_active: true,
      },
    }),
  ]);

  console.log('🍫 Created products');

  // Create stocks
  const stocks = await Promise.all([
    // Machine A1 stocks
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[0].id, // Coca-Cola
        quantity: 15,
        slot_number: 1,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[1].id, // Chips
        quantity: 8,
        slot_number: 2,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[2].id, // Water
        quantity: 20,
        slot_number: 3,
      },
    }),
    // Machine B2 stocks
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[0].id, // Coca-Cola
        quantity: 12,
        slot_number: 1,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[3].id, // Kinder Bueno
        quantity: 10,
        slot_number: 2,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[4].id, // Energy Bar
        quantity: 5,
        slot_number: 3,
      },
    }),
  ]);

  console.log('📦 Created stocks');

  // Create some orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        user_id: users[0].id,
        machine_id: machines[0].id,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        qr_code_token: 'qr_' + Math.random().toString(36).substr(2, 9),
      },
    }),
    prisma.order.create({
      data: {
        user_id: users[1].id,
        machine_id: machines[1].id,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        qr_code_token: 'qr_' + Math.random().toString(36).substr(2, 9),
      },
    }),
  ]);

  console.log('📋 Created orders');

  // Create order items
  const orderItems = await Promise.all([
    prisma.orderItem.create({
      data: {
        order_id: orders[0].id,
        product_id: products[0].id, // Coca-Cola
        quantity: 1,
        slot_number: 1,
      },
    }),
    prisma.orderItem.create({
      data: {
        order_id: orders[0].id,
        product_id: products[1].id, // Chips
        quantity: 1,
        slot_number: 2,
      },
    }),
    prisma.orderItem.create({
      data: {
        order_id: orders[1].id,
        product_id: products[3].id, // Kinder Bueno
        quantity: 2,
        slot_number: 2,
      },
    }),
  ]);

  console.log('🛒 Created order items');

  // Create loyalty logs
  const loyaltyLogs = await Promise.all([
    prisma.loyaltyLog.create({
      data: {
        user_id: users[0].id,
        change: 50,
        reason: 'Purchase at Building A - Ground Floor',
        created_at: new Date().toISOString(),
      },
    }),
    prisma.loyaltyLog.create({
      data: {
        user_id: users[0].id,
        change: -20,
        reason: 'Redeemed: Petit Snack',
        created_at: new Date().toISOString(),
      },
    }),
    prisma.loyaltyLog.create({
      data: {
        user_id: users[1].id,
        change: 30,
        reason: 'Purchase at Building B - 2nd Floor',
        created_at: new Date().toISOString(),
      },
    }),
  ]);

  console.log('🎯 Created loyalty logs');

  // Create a pickup
  const pickup = await prisma.pickup.create({
    data: {
      order_id: orders[0].id,
      machine_id: machines[0].id,
      picked_up_at: new Date().toISOString(),
      status: 'COMPLETED',
    },
  });

  console.log('📦 Created pickup');

  console.log('✅ Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`- ${users.length} users created`);
  console.log(`- ${machines.length} machines created`);
  console.log(`- ${products.length} products created`);
  console.log(`- ${stocks.length} stock entries created`);
  console.log(`- ${orders.length} orders created`);
  console.log(`- ${orderItems.length} order items created`);
  console.log(`- ${loyaltyLogs.length} loyalty logs created`);
  console.log(`- 1 pickup created`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
