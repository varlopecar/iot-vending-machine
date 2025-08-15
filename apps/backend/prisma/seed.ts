import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (ordre important pour les foreign keys)
  await prisma.restockItem.deleteMany();
  await prisma.restock.deleteMany();
  await prisma.alert.deleteMany();
  // loyalty logs supprimés
  await prisma.pickup.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockReservation.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const users = await Promise.all([
    // Admin user for back-office
    prisma.user.create({
      data: {
        full_name: 'Admin User',
        email: 'admin@vendingmachine.com',
        password: adminPassword,
        points: 0,
        barcode: 'ADMIN_000001',
        role: 'ADMIN',
      },
    }),
    // Operator user
    prisma.user.create({
      data: {
        full_name: 'Operator Dupont',
        email: 'operator@vendingmachine.com',
        password: hashedPassword,
        points: 0,
        barcode: 'OP_000001',
        role: 'OPERATOR',
      },
    }),
    // Regular customers
    prisma.user.create({
      data: {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        points: 150,
        barcode: '123456789012',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.create({
      data: {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        points: 75,
        barcode: '234567890123',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.create({
      data: {
        full_name: 'Bob Wilson',
        email: 'bob@example.com',
        password: hashedPassword,
        points: 300,
        barcode: '345678901234',
        role: 'CUSTOMER',
      },
    }),
  ]);

  console.log('👥 Created users');

  // Create machines
  const now = new Date().toISOString();
  const machines = await Promise.all([
    prisma.machine.create({
      data: {
        location: 'Building A - Ground Floor',
        label: 'Vending Machine A1',
        status: 'OFFLINE',
        last_sync_at: now,
        created_at: now,
        last_update: now,
      },
    }),
    prisma.machine.create({
      data: {
        location: 'Building B - 2nd Floor',
        label: 'Vending Machine B2',
        status: 'OFFLINE',
        last_sync_at: now,
        created_at: now,
        last_update: now,
      },
    }),
    prisma.machine.create({
      data: {
        location: 'Cafeteria',
        label: 'Vending Machine C1',
        status: 'OFFLINE',
        last_sync_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
        created_at: now,
        last_update: now,
      },
    }),
  ]);

  // Mettre à jour le champ contact via SQL (champ ajouté par patch SQL et non présent dans les types Prisma actuels)
  await prisma.$executeRaw`UPDATE "machines" SET "contact" = ${'a1-ops@vendingmachine.com'} WHERE id = ${machines[0].id}`;
  await prisma.$executeRaw`UPDATE "machines" SET "contact" = ${'b2-ops@vendingmachine.com'} WHERE id = ${machines[1].id}`;
  await prisma.$executeRaw`UPDATE "machines" SET "contact" = ${'c1-ops@vendingmachine.com'} WHERE id = ${machines[2].id}`;

  console.log('🤖 Created machines');

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Coca-Cola',
        description: 'Refreshing cola drink',
        price: 2.5,
        purchase_price: 1.0,
        category: 'Boissons',
        sku: 'COCA_001',
        ingredients:
          'Carbonated water, sugar, caramel, phosphoric acid, natural flavors, caffeine',
        // ingredients_list removed for compatibility with current Prisma types
        allergens: 'None',
        // allergens_list removed for compatibility
        nutritional_value: '140 calories per 330ml',
        // nutritional removed for compatibility
        image_url: 'https://via.placeholder.com/200x200/cc0000/ffffff?text=Coca-Cola',
        is_active: true,
        created_at: now,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Chips Classic',
        description: 'Crispy potato chips',
        price: 1.8,
        purchase_price: 0.7,
        category: 'Snacks',
        sku: 'CHIPS_001',
        ingredients: 'Potatoes, vegetable oil, salt',
        // ingredients_list removed
        allergens: 'None',
        // allergens_list removed
        nutritional_value: '160 calories per 30g',
        // nutritional removed
        image_url: 'https://via.placeholder.com/200x200/ffcc00/000000?text=Chips',
        is_active: true,
        created_at: now,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Water Bottle',
        description: 'Pure spring water',
        price: 1.2,
        purchase_price: 0.4,
        category: 'Boissons',
        sku: 'WATER_001',
        ingredients: 'Spring water',
        // ingredients_list removed
        allergens: 'None',
        // allergens_list removed
        nutritional_value: '0 calories per 500ml',
        // nutritional removed
        image_url: 'https://via.placeholder.com/200x200/0066cc/ffffff?text=Eau',
        is_active: true,
        created_at: now,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Kinder Bueno',
        description: 'Chocolate bar with hazelnut cream',
        price: 2.8,
        purchase_price: 1.5,
        category: 'Confiseries',
        sku: 'KINDER_001',
        ingredients:
          'Sugar, vegetable fats, hazelnuts, cocoa mass, skimmed milk powder',
        // ingredients_list removed
        allergens: 'Milk, hazelnuts',
        // allergens_list removed
        nutritional_value: '180 calories per 43g',
        // nutritional removed
        image_url: 'https://via.placeholder.com/200x200/4a2c17/ffffff?text=Kinder',
        is_active: true,
        created_at: now,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Energy Bar',
        description: 'High protein energy bar',
        price: 3.2,
        purchase_price: 1.2,
        category: 'Snacks',
        sku: 'ENERGY_001',
        ingredients: 'Oats, honey, nuts, dried fruits, protein isolate',
        // ingredients_list removed
        allergens: 'Nuts',
        // allergens_list removed
        nutritional_value: '220 calories per 60g',
        // nutritional removed
        image_url: 'https://via.placeholder.com/200x200/8b4513/ffffff?text=Energy-Bar',
        is_active: true,
        created_at: now,
      },
    }),
  ]);

  console.log('🍫 Created products');

  // Renseigner les listes d'ingrédients, allergènes et nutrition via SQL (compatibilité types Prisma)
  const [coca, chips, water, kinder, energy] = products;
  await prisma.$executeRawUnsafe(
    `UPDATE "products"
     SET ingredients_list = $1::text[],
         allergens_list = $2::text[],
         nutritional = $3::jsonb
     WHERE id = $4`,
    ['Carbonated water', 'Sugar', 'Caramel', 'Phosphoric acid', 'Natural flavors', 'Caffeine'],
    [],
    JSON.stringify({ calories: 140, protein: 0, carbs: 39, fat: 0, serving: '330ml' }),
    coca.id,
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "products"
     SET ingredients_list = $1::text[],
         allergens_list = $2::text[],
         nutritional = $3::jsonb
     WHERE id = $4`,
    ['Potatoes', 'Vegetable oil', 'Salt'],
    [],
    JSON.stringify({ calories: 160, protein: 2, carbs: 15, fat: 10, serving: '30g' }),
    chips.id,
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "products"
     SET ingredients_list = $1::text[],
         allergens_list = $2::text[],
         nutritional = $3::jsonb
     WHERE id = $4`,
    ['Spring water'],
    [],
    JSON.stringify({ calories: 0, protein: 0, carbs: 0, fat: 0, serving: '500ml' }),
    water.id,
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "products"
     SET ingredients_list = $1::text[],
         allergens_list = $2::text[],
         nutritional = $3::jsonb
     WHERE id = $4`,
    ['Sugar', 'Vegetable fats', 'Hazelnuts', 'Cocoa mass', 'Skimmed milk powder'],
    ['Milk', 'Hazelnuts'],
    JSON.stringify({ calories: 180, protein: 3, carbs: 20, fat: 12, serving: '43g' }),
    kinder.id,
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "products"
     SET ingredients_list = $1::text[],
         allergens_list = $2::text[],
         nutritional = $3::jsonb
     WHERE id = $4`,
    ['Oats', 'Honey', 'Nuts', 'Dried fruits', 'Protein isolate'],
    ['Nuts'],
    JSON.stringify({ calories: 220, protein: 8, carbs: 30, fat: 7, serving: '60g' }),
    energy.id,
  );

  // Helper function pour générer un low_threshold aléatoire entre 1 et 2
  const randomLowThreshold = () => Math.floor(Math.random() * 2) + 1;

  // Create stocks (slots) selon les spécifications demandées
  const stocks = await Promise.all([
    // MACHINE 1: 6 slots tous remplis (max_capacity=5)
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[0].id, // Coca-Cola
        quantity: 5,
        slot_number: 1,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[1].id, // Chips
        quantity: 5,
        slot_number: 2,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[2].id, // Water
        quantity: 5,
        slot_number: 3,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[3].id, // Kinder Bueno
        quantity: 5,
        slot_number: 4,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[4].id, // Energy Bar
        quantity: 5,
        slot_number: 5,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[0].id, // Coca-Cola (slot 6)
        quantity: 5,
        slot_number: 6,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),

    // MACHINE 2: 6 slots dont seulement 2 remplis, le reste à 0
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[0].id, // Coca-Cola - REMPLI
        quantity: 5,
        slot_number: 1,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[1].id, // Chips - REMPLI
        quantity: 5,
        slot_number: 2,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[2].id, // Water - VIDE
        quantity: 0,
        slot_number: 3,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[3].id, // Kinder Bueno - VIDE
        quantity: 0,
        slot_number: 4,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[4].id, // Energy Bar - VIDE
        quantity: 0,
        slot_number: 5,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[0].id, // Coca-Cola - VIDE
        quantity: 0,
        slot_number: 6,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),

    // MACHINE 3: seulement 5 slots
    prisma.stock.create({
      data: {
        machine_id: machines[2].id,
        product_id: products[0].id, // Coca-Cola
        quantity: 3,
        slot_number: 1,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[2].id,
        product_id: products[1].id, // Chips
        quantity: 2,
        slot_number: 2,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[2].id,
        product_id: products[2].id, // Water
        quantity: 4,
        slot_number: 3,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[2].id,
        product_id: products[3].id, // Kinder Bueno
        quantity: 1,
        slot_number: 4,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[2].id,
        product_id: products[4].id, // Energy Bar
        quantity: 5,
        slot_number: 5,
        max_capacity: 5,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
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

  // Create additional completed orders for analytics (current month)
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  // Helper function to generate random date within current month
  const randomDateThisMonth = () => {
    const start = startOfMonth.getTime();
    const end = currentDate.getTime();
    return new Date(start + Math.random() * (end - start)).toISOString();
  };

  // Create more completed orders for analytics
  const completedOrders: any[] = [];
  const completedOrderItems: any[] = [];
  
  // Generate 50 random completed orders this month
  for (let i = 0; i < 50; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
    const orderDate = randomDateThisMonth();
    
    const order = await prisma.order.create({
      data: {
        user_id: randomUser.id,
        machine_id: randomMachine.id,
        status: 'COMPLETED',
        created_at: orderDate,
        expires_at: new Date(new Date(orderDate).getTime() + 30 * 60 * 1000).toISOString(),
        qr_code_token: 'qr_completed_' + Math.random().toString(36).substr(2, 9),
        amount_total_cents: 0, // Will be calculated based on items
        currency: 'EUR',
        paid_at: new Date(new Date(orderDate).getTime() + 5 * 60 * 1000).toISOString(), // 5 min after creation
      },
    });
    
    completedOrders.push(order);
    
    // Add 1-2 random products to each order
    const numItems = Math.random() > 0.3 ? 1 : 2; // 70% chance of 1 item, 30% chance of 2 items
    let orderTotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const quantity = 1;
      const unitPriceCents = Math.floor(parseFloat(randomProduct.price.toString()) * 100);
      const subtotalCents = unitPriceCents * quantity;
      orderTotal += subtotalCents;
      
      const orderItem = await prisma.orderItem.create({
        data: {
          order_id: order.id,
          product_id: randomProduct.id,
          quantity: quantity,
          slot_number: Math.floor(Math.random() * 6) + 1, // Random slot 1-6
          unit_price_cents: unitPriceCents,
          label: randomProduct.name,
          subtotal_cents: subtotalCents,
        },
      });
      
      completedOrderItems.push(orderItem);
    }
    
    // Update order total
    await prisma.order.update({
      where: { id: order.id },
      data: { amount_total_cents: orderTotal },
    });
  }

  console.log(`🛒 Created ${completedOrders.length} completed orders for analytics`);
  console.log(`📦 Created ${completedOrderItems.length} completed order items`);

  // Loyalty logs supprimés (l'historique est désormais dérivé de orders)

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

  // Create some alerts based on new stock configuration
  const alerts = await Promise.all([
    // Alerte CRITICAL agrégée pour machine 2 (4 slots vides sur 6)
    prisma.alert.create({
      data: {
        machine_id: machines[1].id,
        type: 'CRITICAL',
        message: `Stock critique: 4 slot(s) vide(s) sur 6 configurés`,
        level: 'ERROR',
        status: 'OPEN',
        created_at: now,
        metadata: {
          empty_slots: 4,
          configured_slots: 6,
          total_slots: 6,
        }
      },
    }),
    // Alerte INCOMPLETE pour la machine 3 (seulement 5 slots au lieu de 6)
    prisma.alert.create({
      data: {
        machine_id: machines[2].id,
        type: 'INCOMPLETE',
        message: `Machine incomplète: 5/6 slots configurés`,
        level: 'WARNING',
        status: 'OPEN',
        created_at: now,
        metadata: {
          configured_slots: 5,
          total_slots: 6,
        }
      },
    }),
  ]);

  console.log('🚨 Created alerts');

  // Create some restock history
  const restocks = await Promise.all([
    prisma.restock.create({
      data: {
        machine_id: machines[0].id,
        user_id: users[1].id, // Operator
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        notes: 'Ravitaillement hebdomadaire programmé',
      },
    }),
  ]);

  // Create restock items for the above restock (Machine 1)
  const restockItems = await Promise.all([
    prisma.restockItem.create({
      data: {
        restock_id: restocks[0].id,
        stock_id: stocks[0].id, // Coca-Cola slot 1
        quantity_before: 2,
        quantity_after: 5,
        quantity_added: 3,
      },
    }),
    prisma.restockItem.create({
      data: {
        restock_id: restocks[0].id,
        stock_id: stocks[1].id, // Chips slot 2
        quantity_before: 1,
        quantity_after: 5,
        quantity_added: 4,
      },
    }),
    prisma.restockItem.create({
      data: {
        restock_id: restocks[0].id,
        stock_id: stocks[2].id, // Water slot 3
        quantity_before: 3,
        quantity_after: 5,
        quantity_added: 2,
      },
    }),
  ]);

  console.log('🔄 Created restock history');

  console.log('✅ Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`- ${users.length} users created (1 admin, 1 operator, 3 customers)`);
  console.log(`- ${machines.length} machines created`);
  console.log(`- ${products.length} products created`);
  console.log(`- ${stocks.length} stock entries created`);
  console.log(`- ${orders.length + completedOrders.length} orders created (${orders.length} active + ${completedOrders.length} completed)`);
  console.log(`- ${orderItems.length + completedOrderItems.length} order items created`);
  // Loyalty logs supprimés du seed
  console.log(`- 1 pickup created`);
  console.log(`- ${alerts.length} alerts created`);
  console.log(`- ${restocks.length} restocks created`);
  console.log(`- ${restockItems.length} restock items created`);
  console.log('\n🔑 Admin credentials:');
  console.log('Email: admin@vendingmachine.com');
  console.log('Password: admin123');
  console.log('\n🤖 Machine Configuration:');
  console.log('- Machine 1: 6 slots tous remplis (max_capacity=5)');
  console.log('- Machine 2: 6 slots dont 2 remplis, 4 vides (slots 3-6 à quantity=0)');
  console.log('- Machine 3: 5 slots avec quantités variables');
  console.log('- Chaque slot: max_capacity=5, low_threshold=1 ou 2 (aléatoire)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
