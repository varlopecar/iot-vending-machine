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

  // Create stocks (slots) avec nouvelles propriétés
  const stocks = await Promise.all([
    // Machine A1 stocks
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[0].id, // Coca-Cola
        quantity: 15,
        slot_number: 1,
        max_capacity: 20,
        low_threshold: 3,
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[1].id, // Chips
        quantity: 1, // Stock faible pour générer une alerte
        slot_number: 2,
        max_capacity: 15,
        low_threshold: 2,
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[2].id, // Water
        quantity: 20,
        slot_number: 3,
        max_capacity: 25,
        low_threshold: 5,
        created_at: now,
        updated_at: now,
      },
    }),
    // Machine B2 stocks
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[0].id, // Coca-Cola
        quantity: 12,
        slot_number: 1,
        max_capacity: 20,
        low_threshold: 3,
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[3].id, // Kinder Bueno
        quantity: 0, // Slot vide pour générer une alerte
        slot_number: 2,
        max_capacity: 12,
        low_threshold: 2,
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[4].id, // Energy Bar
        quantity: 5,
        slot_number: 3,
        max_capacity: 10,
        low_threshold: 2,
        created_at: now,
        updated_at: now,
      },
    }),
    // Démonstration: même produit sur plusieurs slots
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[0].id, // Coca-Cola aussi sur slot 4
        quantity: 8,
        slot_number: 4,
        max_capacity: 20,
        low_threshold: 3,
        created_at: now,
        updated_at: now,
      },
    }),

    // Compléter la machine A1 avec TOUS les produits disponibles
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[3].id, // Kinder Bueno
        quantity: 10,
        slot_number: 4,
        max_capacity: 12,
        low_threshold: 2,
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[4].id, // Energy Bar
        quantity: 8,
        slot_number: 5,
        max_capacity: 12,
        low_threshold: 2,
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

  // Create some alerts based on low stock levels
  const alerts = await Promise.all([
    // Alerte stock faible pour chips dans machine A1
    prisma.alert.create({
      data: {
        machine_id: machines[0].id,
        stock_id: stocks[1].id, // Lié au slot Chips
        type: 'LOW_STOCK',
        message: `Stock faible: Chips Classic (Slot 2) - ${stocks[1].quantity}/${stocks[1].max_capacity}`,
        level: 'WARNING',
        status: 'OPEN',
        created_at: now,
        metadata: {
          slot_number: 2,
          current_quantity: stocks[1].quantity,
          threshold: stocks[1].low_threshold,
          product_name: 'Chips Classic'
        }
      },
    }),
    // Alerte slot vide pour Kinder Bueno dans machine B2
    prisma.alert.create({
      data: {
        machine_id: machines[1].id,
        stock_id: stocks[4].id, // Lié au slot Kinder Bueno (machine B2, slot 2)
        type: 'EMPTY',
        message: `Slot vide: Kinder Bueno (Slot 2) - Ravitaillement requis`,
        level: 'ERROR',
        status: 'OPEN',
        created_at: now,
        metadata: {
          slot_number: 2,
          current_quantity: 0,
          threshold: stocks[4].low_threshold,
          product_name: 'Kinder Bueno'
        }
      },
    }),
    // Alerte machine hors ligne pour la machine C1 (pas de stock_id)
    prisma.alert.create({
      data: {
        machine_id: machines[2].id,
        type: 'MACHINE_OFFLINE',
        message: `Machine hors ligne depuis plus de 2 heures`,
        level: 'CRITICAL',
        status: 'OPEN',
        created_at: now,
        metadata: {
          last_sync: machines[2].last_sync_at,
          offline_duration_hours: 2
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

  // Create restock items for the above restock
  const restockItems = await Promise.all([
    prisma.restockItem.create({
      data: {
        restock_id: restocks[0].id,
        stock_id: stocks[0].id, // Coca-Cola slot
        quantity_before: 5,
        quantity_after: 20,
        quantity_added: 15,
      },
    }),
    prisma.restockItem.create({
      data: {
        restock_id: restocks[0].id,
        stock_id: stocks[1].id, // Chips slot
        quantity_before: 0,
        quantity_after: 10,
        quantity_added: 10,
      },
    }),
  ]);

  console.log('🔄 Created restock history');

  console.log('✅ Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`- ${users.length} users created (1 admin, 1 operator, 3 customers)`);
  console.log(`- ${machines.length} machines created`);
  console.log(`- ${products.length} products created`);
  console.log(`- ${stocks.length} stock entries created (incluant produit dupliqué)`);
  console.log(`- ${orders.length} orders created`);
  console.log(`- ${orderItems.length} order items created`);
  // Loyalty logs supprimés du seed
  console.log(`- 1 pickup created`);
  console.log(`- ${alerts.length} alerts created (avec relations stock_id)`);
  console.log(`- ${restocks.length} restocks created`);
  console.log(`- ${restockItems.length} restock items created`);
  console.log('\n🔑 Admin credentials:');
  console.log('Email: admin@vendingmachine.com');
  console.log('Password: admin123');
  console.log('\n💡 Features demonstrated:');
  console.log('- Same product on multiple slots (Coca-Cola on slots 1 & 4 of machine B2)');
  console.log('- Stock-linked alerts (LOW_STOCK, EMPTY with stock_id)');
  console.log('- Machine-only alerts (MACHINE_OFFLINE without stock_id)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
