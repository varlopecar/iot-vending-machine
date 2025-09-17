import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  

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



  // Create machines
  const now = new Date().toISOString();
  const machines = await Promise.all([
    prisma.machine.create({
      data: {
        location: 'Building A - Ground Floor',
        label: 'Vending Machine A1',
        status: 'ONLINE',
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
  ]);

  // Mettre à jour le champ contact via SQL (champ ajouté par patch SQL et non présent dans les types Prisma actuels)
  await prisma.$executeRaw`UPDATE "machines" SET "contact" = ${'a1-ops@vendingmachine.com'} WHERE id = ${machines[0].id}`;
  await prisma.$executeRaw`UPDATE "machines" SET "contact" = ${'b2-ops@vendingmachine.com'} WHERE id = ${machines[1].id}`;



  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Coca-Cola',
        description: 'Refreshing cola drink',
        price: 2.1,
        purchase_price: 1.0,
        category: 'Boissons',
        sku: 'COCA_001',
        ingredients:
          'Carbonated water, sugar, caramel, phosphoric acid, natural flavors, caffeine',
        allergens: 'None',
        nutritional_value: '140 calories per 330ml',
        image_url: 'https://via.placeholder.com/200x200/cc0000/ffffff?text=Coca-Cola',
        is_active: true,
        created_at: now,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Fuze Tea',
        description: 'Refreshing iced tea with natural flavors',
        price: 1.8,
        purchase_price: 0.9,
        category: 'Boissons',
        sku: 'FUZE_001',
        ingredients: 'Water, sugar, tea extract, natural lemon flavor, citric acid',
        allergens: 'None',
        nutritional_value: '90 calories per 330ml',
        image_url: 'https://via.placeholder.com/200x200/ffaa00/000000?text=Fuze+Tea',
        is_active: true,
        created_at: now,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Orangina',
        description: 'Sparkling orange drink with real orange pulp',
        price: 1.9,
        purchase_price: 1.0,
        category: 'Boissons',
        sku: 'ORANGINA_001',
        ingredients: 'Carbonated water, orange juice, sugar, citric acid, natural orange flavor',
        allergens: 'None',
        nutritional_value: '125 calories per 330ml',
        image_url: 'https://via.placeholder.com/200x200/ff6600/ffffff?text=Orangina',
        is_active: true,
        created_at: now,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pepsi',
        description: 'Classic cola with a bold taste',
        price: 2.2,
        purchase_price: 1.1,
        category: 'Boissons',
        sku: 'PEPSI_001',
        ingredients:
          'Carbonated water, sugar, caramel, phosphoric acid, natural flavors, caffeine',
        allergens: 'None',
        nutritional_value: '135 calories per 330ml',
        image_url: 'https://via.placeholder.com/200x200/0066cc/ffffff?text=Pepsi',
        is_active: true,
        created_at: now,
      },
    }),
  ]);



  // Renseigner les listes d'ingrédients, allergènes et nutrition via SQL (compatibilité types Prisma)
  const [coca, fuze, orangina, pepsi] = products;
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
    ['Water', 'Sugar', 'Tea extract', 'Natural lemon flavor', 'Citric acid'],
    [],
    JSON.stringify({ calories: 90, protein: 0, carbs: 22, fat: 0, serving: '330ml' }),
    fuze.id,
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "products"
     SET ingredients_list = $1::text[],
         allergens_list = $2::text[],
         nutritional = $3::jsonb
     WHERE id = $4`,
    ['Carbonated water', 'Orange juice', 'Sugar', 'Citric acid', 'Natural orange flavor'],
    [],
    JSON.stringify({ calories: 125, protein: 0, carbs: 31, fat: 0, serving: '330ml' }),
    orangina.id,
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "products"
     SET ingredients_list = $1::text[],
         allergens_list = $2::text[],
         nutritional = $3::jsonb
     WHERE id = $4`,
    ['Carbonated water', 'Sugar', 'Caramel', 'Phosphoric acid', 'Natural flavors', 'Caffeine'],
    [],
    JSON.stringify({ calories: 135, protein: 0, carbs: 38, fat: 0, serving: '330ml' }),
    pepsi.id,
  );

  // Helper function pour générer un low_threshold aléatoire entre 1 et 2
  const randomLowThreshold = () => Math.floor(Math.random() * 2) + 1;

  // Create stocks (slots) selon les spécifications demandées
  const stocks = await Promise.all([
    // MACHINE 1: 4 slots tous remplis (max_capacity=4)
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[0].id, // Coca-Cola
        quantity: 4,
        slot_number: 1,
        max_capacity: 4,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[1].id, // Fuze Tea
        quantity: 4,
        slot_number: 2,
        max_capacity: 4,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[2].id, // Orangina
        quantity: 4,
        slot_number: 3,
        max_capacity: 4,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[0].id,
        product_id: products[3].id, // Pepsi
        quantity: 4,
        slot_number: 4,
        max_capacity: 4,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),

    // MACHINE 2: 4 slots vides (machine hors ligne)
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[0].id, // Coca-Cola - VIDE
        quantity: 0,
        slot_number: 1,
        max_capacity: 4,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[1].id, // Fuze Tea - VIDE
        quantity: 0,
        slot_number: 2,
        max_capacity: 4,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[2].id, // Orangina - VIDE
        quantity: 0,
        slot_number: 3,
        max_capacity: 4,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.stock.create({
      data: {
        machine_id: machines[1].id,
        product_id: products[3].id, // Pepsi - VIDE
        quantity: 0,
        slot_number: 4,
        max_capacity: 4,
        low_threshold: randomLowThreshold(),
        created_at: now,
        updated_at: now,
      },
    }),
  ]);



  // Create some orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        user_id: users[0].id,
        machine_id: machines[0].id,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        qr_code_token: 'qr_' + Math.random().toString(36).substr(2, 9),
      },
    }),
  ]);



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
        product_id: products[1].id, // Fuze Tea
        quantity: 1,
        slot_number: 2,
      },
    }),
  ]);



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
  for (let i = 0; i < 60; i++) {
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
    const numItems = Math.random() > 0.4 ? 1 : 2;
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
          slot_number: Math.floor(Math.random() * 4) + 1,
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



  // Create some alerts based on new stock configuration
  const alerts = await Promise.all([
    // Alerte CRITICAL pour machine 2 (4 slots vides sur 4 configurés)
    prisma.alert.create({
      data: {
        machine_id: machines[1].id,
        type: 'CRITICAL',
        message: `Stock critique: 4 slot(s) vide(s) sur 4 configurés`,
        level: 'ERROR',
        status: 'OPEN',
        created_at: now,
        metadata: {
          empty_slots: 4,
          configured_slots: 4,
          total_slots: 4,
        }
      },
    }),
  ]);



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
        quantity_after: 4,
        quantity_added: 2,
      },
    }),
    prisma.restockItem.create({
      data: {
        restock_id: restocks[0].id,
        stock_id: stocks[1].id, // Fuze Tea slot 2
        quantity_before: 1,
        quantity_after: 4,
        quantity_added: 3,
      },
    }),
    prisma.restockItem.create({
      data: {
        restock_id: restocks[0].id,
        stock_id: stocks[2].id, // Orangina slot 3
        quantity_before: 3,
        quantity_after: 4,
        quantity_added: 1,
      },
    }),
    prisma.restockItem.create({
      data: {
        restock_id: restocks[0].id,
        stock_id: stocks[3].id, // Pepsi slot 4
        quantity_before: 0,
        quantity_after: 4,
        quantity_added: 4,
      },
    }),
  ]);




}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
