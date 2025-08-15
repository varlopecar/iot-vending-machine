import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  auth: t.router({
    register: publicProcedure.input(z.object({
      full_name: z.string().min(1),
      email: z.email(),
      password: z.string().min(6),
    })).output(z.object({
      id: z.string().min(1),
      full_name: z.string(),
      email: z.email(),
      points: z.number().int().min(0),
      barcode: z.string(),
      role: z.enum(['CUSTOMER', 'OPERATOR', 'ADMIN']),
      created_at: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    login: publicProcedure.input(z.object({
      email: z.email(),
      password: z.string(),
    })).output(z.object({
      user: z.object({
        id: z.string().min(1),
        full_name: z.string(),
        email: z.email(),
        points: z.number().int().min(0),
        barcode: z.string(),
        role: z.enum(['CUSTOMER', 'OPERATOR', 'ADMIN']),
        created_at: z.string(),
      }),
      token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    adminLogin: publicProcedure.input(z.object({
      email: z.email(),
      password: z.string(),
    })).output(z.object({
      user: z.object({
        id: z.string().min(1),
        full_name: z.string(),
        email: z.email(),
        points: z.number().int().min(0),
        barcode: z.string(),
        role: z.enum(['CUSTOMER', 'OPERATOR', 'ADMIN']),
        created_at: z.string(),
      }),
      token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getUserById: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      full_name: z.string(),
      email: z.email(),
      points: z.number().int().min(0),
      barcode: z.string(),
      role: z.enum(['CUSTOMER', 'OPERATOR', 'ADMIN']),
      created_at: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getUserByBarcode: publicProcedure.input(z.object({ barcode: z.string() })).output(z.object({
      id: z.string().min(1),
      full_name: z.string(),
      email: z.email(),
      points: z.number().int().min(0),
      barcode: z.string(),
      role: z.enum(['CUSTOMER', 'OPERATOR', 'ADMIN']),
      created_at: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateUser: publicProcedure.input(z.object({
      id: z.uuid(),
      data: z.object({
        full_name: z.string().min(1),
        email: z.email(),
        password: z.string().min(6),
      }).partial().omit({
        password: true,
      }),
    })).output(z.object({
      id: z.string().min(1),
      full_name: z.string(),
      email: z.email(),
      points: z.number().int().min(0),
      barcode: z.string(),
      role: z.enum(['CUSTOMER', 'OPERATOR', 'ADMIN']),
      created_at: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updatePoints: publicProcedure.input(z.object({
      id: z.uuid(),
      points: z.number().int().min(0),
    })).output(z.object({
      id: z.string().min(1),
      full_name: z.string(),
      email: z.email(),
      points: z.number().int().min(0),
      barcode: z.string(),
      role: z.enum(['CUSTOMER', 'OPERATOR', 'ADMIN']),
      created_at: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  products: t.router({
    getAllProducts: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      // Prix de vente
      price: z.number().min(0),
      // Prix d'achat
      purchase_price: z.number().min(0),
      // Catégorie libre pour le back-office
      category: z.string().min(1),
      ingredients: z.string(),
      ingredients_list: z.array(z.string()).optional(),
      allergens: z.string(),
      allergens_list: z.array(z.string()).optional(),
      nutritional_value: z.string(),
      nutritional: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
          serving: z.string().optional(),
        })
        .optional(),
      image_url: z.string(),
      is_active: z.boolean(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getProductById: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      // Prix de vente
      price: z.number().min(0),
      // Prix d'achat
      purchase_price: z.number().min(0),
      // Catégorie libre pour le back-office
      category: z.string().min(1),
      ingredients: z.string(),
      ingredients_list: z.array(z.string()).optional(),
      allergens: z.string(),
      allergens_list: z.array(z.string()).optional(),
      nutritional_value: z.string(),
      nutritional: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
          serving: z.string().optional(),
        })
        .optional(),
      image_url: z.string(),
      is_active: z.boolean(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getProductsByCategory: publicProcedure.input(z.object({ category: z.string() })).output(z.array(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      // Prix de vente
      price: z.number().min(0),
      // Prix d'achat
      purchase_price: z.number().min(0),
      // Catégorie libre pour le back-office
      category: z.string().min(1),
      ingredients: z.string(),
      ingredients_list: z.array(z.string()).optional(),
      allergens: z.string(),
      allergens_list: z.array(z.string()).optional(),
      nutritional_value: z.string(),
      nutritional: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
          serving: z.string().optional(),
        })
        .optional(),
      image_url: z.string(),
      is_active: z.boolean(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createProduct: publicProcedure.input(z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      price: z.number().positive(),
      purchase_price: z.number().positive(),
      // Optionnels
      allergens_list: z.array(z.string()).optional(),
      nutritional: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
          serving: z.string().optional(),
        })
        .optional(),
    })).output(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      // Prix de vente
      price: z.number().min(0),
      // Prix d'achat
      purchase_price: z.number().min(0),
      // Catégorie libre pour le back-office
      category: z.string().min(1),
      ingredients: z.string(),
      ingredients_list: z.array(z.string()).optional(),
      allergens: z.string(),
      allergens_list: z.array(z.string()).optional(),
      nutritional_value: z.string(),
      nutritional: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
          serving: z.string().optional(),
        })
        .optional(),
      image_url: z.string(),
      is_active: z.boolean(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateProduct: publicProcedure.input(z.object({
      id: z.string().min(1),
      data: z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        price: z.number().positive(),
        purchase_price: z.number().positive(),
        // Optionnels
        allergens_list: z.array(z.string()).optional(),
        nutritional: z
          .object({
            calories: z.number().optional(),
            protein: z.number().optional(),
            carbs: z.number().optional(),
            fat: z.number().optional(),
            serving: z.string().optional(),
          })
          .optional(),
      }).partial(),
    })).output(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      // Prix de vente
      price: z.number().min(0),
      // Prix d'achat
      purchase_price: z.number().min(0),
      // Catégorie libre pour le back-office
      category: z.string().min(1),
      ingredients: z.string(),
      ingredients_list: z.array(z.string()).optional(),
      allergens: z.string(),
      allergens_list: z.array(z.string()).optional(),
      nutritional_value: z.string(),
      nutritional: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
          serving: z.string().optional(),
        })
        .optional(),
      image_url: z.string(),
      is_active: z.boolean(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteProduct: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.boolean()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  orders: t.router({
    getOrderById: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      user_id: z.string().min(1),
      machine_id: z.string().min(1),
      status: z.enum([
        'pending',
        'active',
        'expired',
        'used',
        'cancelled',
        // Statuts de paiement additionnels renvoyés par certains flux
        'paid',
        'failed',
        'refunded',
        'requires_payment',
      ]),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    }).extend({
      items: z.array(z.object({
        id: z.string().min(1),
        order_id: z.string().min(1),
        product_id: z.string().min(1),
        quantity: z.number().int().positive(),
        slot_number: z.number().int().positive(),
      })),
      total_price: z.number().positive(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getOrdersByUserId: publicProcedure.input(z.object({ user_id: z.string().min(1) })).output(z.array(z.object({
      id: z.string().min(1),
      user_id: z.string().min(1),
      machine_id: z.string().min(1),
      status: z.enum([
        'pending',
        'active',
        'expired',
        'used',
        'cancelled',
        // Statuts de paiement additionnels renvoyés par certains flux
        'paid',
        'failed',
        'refunded',
        'requires_payment',
      ]),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    }).extend({
      items: z.array(z.object({
        id: z.string().min(1),
        order_id: z.string().min(1),
        product_id: z.string().min(1),
        quantity: z.number().int().positive(),
        slot_number: z.number().int().positive(),
      })),
      total_price: z.number().positive(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createOrder: publicProcedure.input(z.object({
      user_id: z.string().min(1),
      machine_id: z.string().min(1),
      items: z.array(
        z.object({
          product_id: z.string().min(1),
          quantity: z.number().int().positive(),
          slot_number: z.number().int().positive(),
          is_free: z.boolean().optional(),
        }),
      ),
      points_spent: z.number().int().min(0).optional(),
    })).output(z.object({
      id: z.string().min(1),
      user_id: z.string().min(1),
      machine_id: z.string().min(1),
      status: z.enum([
        'pending',
        'active',
        'expired',
        'used',
        'cancelled',
        // Statuts de paiement additionnels renvoyés par certains flux
        'paid',
        'failed',
        'refunded',
        'requires_payment',
      ]),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    }).extend({
      items: z.array(z.object({
        id: z.string().min(1),
        order_id: z.string().min(1),
        product_id: z.string().min(1),
        quantity: z.number().int().positive(),
        slot_number: z.number().int().positive(),
      })),
      total_price: z.number().positive(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateOrder: publicProcedure.input(z.object({
      id: z.string().min(1),
      data: z.object({
        status: z
          .enum([
            'pending',
            'active',
            'expired',
            'used',
            'cancelled',
            'paid',
            'failed',
            'refunded',
            'requires_payment',
          ])
          .optional(),
        expires_at: z.string().optional(),
      }),
    })).output(z.object({
      id: z.string().min(1),
      user_id: z.string().min(1),
      machine_id: z.string().min(1),
      status: z.enum([
        'pending',
        'active',
        'expired',
        'used',
        'cancelled',
        // Statuts de paiement additionnels renvoyés par certains flux
        'paid',
        'failed',
        'refunded',
        'requires_payment',
      ]),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    cancelOrder: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      user_id: z.string().min(1),
      machine_id: z.string().min(1),
      status: z.enum([
        'pending',
        'active',
        'expired',
        'used',
        'cancelled',
        // Statuts de paiement additionnels renvoyés par certains flux
        'paid',
        'failed',
        'refunded',
        'requires_payment',
      ]),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    validateQRCode: publicProcedure.input(z.object({ qr_code_token: z.string() })).output(z.object({
      id: z.string().min(1),
      user_id: z.string().min(1),
      machine_id: z.string().min(1),
      status: z.enum([
        'pending',
        'active',
        'expired',
        'used',
        'cancelled',
        // Statuts de paiement additionnels renvoyés par certains flux
        'paid',
        'failed',
        'refunded',
        'requires_payment',
      ]),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    useOrder: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      user_id: z.string().min(1),
      machine_id: z.string().min(1),
      status: z.enum([
        'pending',
        'active',
        'expired',
        'used',
        'cancelled',
        // Statuts de paiement additionnels renvoyés par certains flux
        'paid',
        'failed',
        'refunded',
        'requires_payment',
      ]),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  stocks: t.router({
    getAllStocks: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStockById: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStocksByMachine: publicProcedure.input(z.object({ machine_id: z.string().min(1) })).output(z.array(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    }).extend({
      product_name: z.string(),
      product_price: z.number().positive(),
      product_image_url: z.string().optional(),
      product_ingredients_list: z.array(z.string()).optional(),
      product_allergens_list: z.array(z.string()).optional(),
      product_nutritional: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
          serving: z.string().optional(),
        })
        .optional(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStockByMachineAndProduct: publicProcedure.input(z.object({
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getLowStockItems: publicProcedure.input(z.object({ threshold: z.number().int().positive().optional() })).output(z.array(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    }).extend({
      product_name: z.string(),
      product_price: z.number().positive(),
      product_image_url: z.string().optional(),
      product_ingredients_list: z.array(z.string()).optional(),
      product_allergens_list: z.array(z.string()).optional(),
      product_nutritional: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
          serving: z.string().optional(),
        })
        .optional(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getOutOfStockItems: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    }).extend({
      product_name: z.string(),
      product_price: z.number().positive(),
      product_image_url: z.string().optional(),
      product_ingredients_list: z.array(z.string()).optional(),
      product_allergens_list: z.array(z.string()).optional(),
      product_nutritional: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
          serving: z.string().optional(),
        })
        .optional(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createStock: publicProcedure.input(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    }).omit({
      id: true,
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateStock: publicProcedure.input(z.object({
      id: z.string().min(1),
      data: z.object({
        id: z.string().min(1),
        machine_id: z.string().min(1),
        product_id: z.string().min(1),
        quantity: z.number().int().min(0),
        slot_number: z.number().int().positive(),
        max_capacity: z.number().int().positive(),
        low_threshold: z.number().int().min(0),
      }).omit({
        id: true,
      }).partial(),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateStockQuantity: publicProcedure.input(z.object({
      id: z.string().min(1),
      quantity: z.number().int().min(0),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addStockQuantity: publicProcedure.input(z.object({
      id: z.string().min(1),
      quantity: z.number().int().positive(),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    removeStockQuantity: publicProcedure.input(z.object({
      id: z.string().min(1),
      quantity: z.number().int().positive(),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getNextAvailableSlotNumber: publicProcedure.input(z.object({ machine_id: z.string().min(1) })).output(z.number().int().positive()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addSlot: publicProcedure.input(z.object({
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      slot_number: z.number().int().positive(),
      initial_quantity: z.number().int().min(0).default(0),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
      max_capacity: z.number().int().positive(),
      low_threshold: z.number().int().min(0),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  alerts: t.router({
    getActiveAlerts: publicProcedure.output(z.array(z.object({
      id: z.string(),
      machine_id: z.string(),
      stock_id: z.string().nullable(),
      type: z.enum(['LOW_STOCK', 'CRITICAL', 'INCOMPLETE', 'MACHINE_OFFLINE', 'MAINTENANCE_REQUIRED']),
      message: z.string().nullable(),
      level: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']),
      status: z.enum(['OPEN', 'RESOLVED', 'IGNORED']),
      is_active: z.boolean(),
      created_at: z.string(),
      resolved_at: z.string().nullable(),
      metadata: z.any().nullable(),
    }).extend({
      machine: z.object({
        id: z.string(),
        label: z.string(),
        location: z.string(),
        contact: z.string().nullable(),
        status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'OUT_OF_SERVICE']),
      }),
      stock: z.object({
        id: z.string(),
        slot_number: z.number(),
        quantity: z.number(),
        max_capacity: z.number(),
        low_threshold: z.number(),
        product: z.object({
          id: z.string(),
          name: z.string(),
          image_url: z.string(),
        }),
      }).nullable(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMachineAlerts: publicProcedure.input(z.object({ machineId: z.string() })).output(z.array(z.object({
      id: z.string(),
      machine_id: z.string(),
      stock_id: z.string().nullable(),
      type: z.enum(['LOW_STOCK', 'CRITICAL', 'INCOMPLETE', 'MACHINE_OFFLINE', 'MAINTENANCE_REQUIRED']),
      message: z.string().nullable(),
      level: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']),
      status: z.enum(['OPEN', 'RESOLVED', 'IGNORED']),
      is_active: z.boolean(),
      created_at: z.string(),
      resolved_at: z.string().nullable(),
      metadata: z.any().nullable(),
    }).extend({
      machine: z.object({
        id: z.string(),
        label: z.string(),
        location: z.string(),
        contact: z.string().nullable(),
        status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'OUT_OF_SERVICE']),
      }),
      stock: z.object({
        id: z.string(),
        slot_number: z.number(),
        quantity: z.number(),
        max_capacity: z.number(),
        low_threshold: z.number(),
        product: z.object({
          id: z.string(),
          name: z.string(),
          image_url: z.string(),
        }),
      }).nullable(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMachineAlertStatus: publicProcedure.input(z.object({ machineId: z.string() })).output(z.object({
      machineId: z.string(),
      alertType: z.enum(['LOW_STOCK', 'CRITICAL', 'INCOMPLETE', 'MACHINE_OFFLINE', 'MAINTENANCE_REQUIRED']).nullable(),
      alertLevel: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).nullable(),
      configuredSlots: z.number(),
      totalSlots: z.number(),
      emptySlots: z.number(),
      lowStockSlots: z.number(),
      slotsAtThreshold: z.number(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getAlertsSummaryByMachine: publicProcedure.output(z.array(z.object({
      id: z.string(),
      machine_id: z.string(),
      stock_id: z.string().nullable(),
      type: z.enum(['LOW_STOCK', 'CRITICAL', 'INCOMPLETE', 'MACHINE_OFFLINE', 'MAINTENANCE_REQUIRED']),
      message: z.string().nullable(),
      level: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']),
      status: z.enum(['OPEN', 'RESOLVED', 'IGNORED']),
      is_active: z.boolean(),
      created_at: z.string(),
      resolved_at: z.string().nullable(),
      metadata: z.any().nullable(),
    }).extend({
      machine: z.object({
        id: z.string(),
        label: z.string(),
        location: z.string(),
        contact: z.string().nullable(),
        status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'OUT_OF_SERVICE']),
      }),
      stock: z.object({
        id: z.string(),
        slot_number: z.number(),
        quantity: z.number(),
        max_capacity: z.number(),
        low_threshold: z.number(),
        product: z.object({
          id: z.string(),
          name: z.string(),
          image_url: z.string(),
        }),
      }).nullable(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getAlertsSummary: publicProcedure.output(z.object({
      totalAlerts: z.number(),
      criticalAlerts: z.number(),
      lowStockAlerts: z.number(),
      incompleteAlerts: z.number(),
      alertsByMachine: z.array(z.object({
        id: z.string(),
        machine_id: z.string(),
        stock_id: z.string().nullable(),
        type: z.enum(['LOW_STOCK', 'CRITICAL', 'INCOMPLETE', 'MACHINE_OFFLINE', 'MAINTENANCE_REQUIRED']),
        message: z.string().nullable(),
        level: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']),
        status: z.enum(['OPEN', 'RESOLVED', 'IGNORED']),
        is_active: z.boolean(),
        created_at: z.string(),
        resolved_at: z.string().nullable(),
        metadata: z.any().nullable(),
      }).extend({
        machine: z.object({
          id: z.string(),
          label: z.string(),
          location: z.string(),
          contact: z.string().nullable(),
          status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'OUT_OF_SERVICE']),
        }),
        stock: z.object({
          id: z.string(),
          slot_number: z.number(),
          quantity: z.number(),
          max_capacity: z.number(),
          low_threshold: z.number(),
          product: z.object({
            id: z.string(),
            name: z.string(),
            image_url: z.string(),
          }),
        }).nullable(),
      })),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateMachineAlerts: publicProcedure.input(z.object({ machineId: z.string() })).output(z.object({ success: z.boolean(), message: z.string() })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    resolveAlert: publicProcedure.input(z.object({ alertId: z.string() })).output(z.object({ success: z.boolean(), message: z.string() })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    recalculateAllAlerts: publicProcedure.output(z.object({
      success: z.boolean(),
      message: z.string(),
      machinesProcessed: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    cleanupDuplicateAlerts: publicProcedure.output(z.object({
      success: z.boolean(),
      message: z.string(),
      cleaned: z.number(),
      machinesProcessed: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  loyalty: t.router({
    getCurrentPoints: publicProcedure.input(z.object({ user_id: z.string().min(1) })).output(z.number()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getLoyaltyHistory: publicProcedure.input(z.object({ user_id: z.string().min(1) })).output(z.array(z.object({
      id: z.string(),
      date: z.string(),
      location: z.string(),
      points: z.number().int(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getLoyaltyHistoryFormatted: publicProcedure.input(z.object({ user_id: z.string().min(1) })).output(z.array(z.object({
      id: z.string(),
      date: z.string(),
      location: z.string(),
      points: z.number().int(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getLoyaltyHistoryPaged: publicProcedure.input(z.object({
      user_id: z.string().min(1),
      offset: z.number().int().min(0).default(0),
      limit: z.number().int().min(1).max(100).default(20),
    })).output(z.object({
      entries: z.array(z.object({
        id: z.string(),
        date: z.string(),
        location: z.string(),
        points: z.number().int(),
      })),
      nextOffset: z.number().int().nullable(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getAvailableAdvantages: publicProcedure.output(z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      points: z.number().int().positive(),
      image: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addPoints: publicProcedure.input(z.object({
      user_id: z.string().min(1),
      points: z.number().int().positive(),
      reason: z.string(),
    })).output(z.object({
      id: z.string(),
      date: z.string(),
      location: z.string(),
      points: z.number().int(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deductPoints: publicProcedure.input(z.object({
      user_id: z.string().min(1),
      points: z.number().int().positive(),
      reason: z.string(),
    })).output(z.object({
      id: z.string(),
      date: z.string(),
      location: z.string(),
      points: z.number().int(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    redeemAdvantage: publicProcedure.input(z.object({
      user_id: z.string().min(1),
      advantage_id: z.string(),
    })).output(z.object({
      id: z.string(),
      date: z.string(),
      location: z.string(),
      points: z.number().int(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  machines: t.router({
    getAllMachines: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      contact: z.string().email().nullable().optional(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMachineById: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      contact: z.string().email().nullable().optional(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMachinesByLocation: publicProcedure.input(z.object({ location: z.string() })).output(z.array(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      contact: z.string().email().nullable().optional(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getOnlineMachines: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      contact: z.string().email().nullable().optional(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createMachine: publicProcedure.input(z.object({
      location: z.string(),
      label: z.string(),
      contact: z.string().email().optional(),
      // Statut optionnel côté input, mais ignoré: le backend force OFFLINE à la création
      status: z
        .enum(['online', 'offline', 'maintenance', 'out_of_service'])
        .optional()
    })).output(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      contact: z.string().email().nullable().optional(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateMachine: publicProcedure.input(z.object({
      id: z.string().min(1),
      data: z.object({
        location: z.string(),
        label: z.string(),
        contact: z.string().email().optional(),
        // Statut optionnel côté input, mais ignoré: le backend force OFFLINE à la création
        status: z
          .enum(['online', 'offline', 'maintenance', 'out_of_service'])
          .optional()
      }).partial(),
    })).output(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      contact: z.string().email().nullable().optional(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteMachine: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.boolean()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateMachineStatus: publicProcedure.input(z.object({
      id: z.string().min(1),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
    })).output(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      contact: z.string().email().nullable().optional(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMachineStats: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      machine_id: z.string().min(1),
      totalSlots: z.number().int().nonnegative(),
      lowStockCount: z.number().int().nonnegative(),
      outOfStockCount: z.number().int().nonnegative(),
      revenueTotalCents: z.number().int().nonnegative(),
      revenueLast30dCents: z.number().int().nonnegative(),
      ordersLast30d: z.number().int().nonnegative(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getAllMachineStats: publicProcedure.output(z.array(z.object({
      machine_id: z.string().min(1),
      totalSlots: z.number().int().nonnegative(),
      lowStockCount: z.number().int().nonnegative(),
      outOfStockCount: z.number().int().nonnegative(),
      revenueTotalCents: z.number().int().nonnegative(),
      revenueLast30dCents: z.number().int().nonnegative(),
      ordersLast30d: z.number().int().nonnegative(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  pickups: t.router({
    getPickupById: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPickupsByOrderId: publicProcedure.input(z.object({ order_id: z.string().min(1) })).output(z.array(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPickupsByMachineId: publicProcedure.input(z.object({ machine_id: z.string().min(1) })).output(z.array(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPendingPickups: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getCompletedPickups: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createPickup: publicProcedure.input(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }).omit({
      id: true,
      picked_up_at: true,
    })).output(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updatePickup: publicProcedure.input(z.object({
      id: z.string().min(1),
      data: z.object({
        id: z.string().min(1),
        order_id: z.string().min(1),
        machine_id: z.string().min(1),
        picked_up_at: z.string(),
        status: z.enum(['pending', 'completed', 'failed']),
      }).omit({
        id: true,
        picked_up_at: true,
      }).partial(),
    })).output(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    completePickup: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    failPickup: publicProcedure.input(z.object({
      id: z.string().min(1),
      reason: z.string().optional(),
    })).output(z.object({
      id: z.string().min(1),
      order_id: z.string().min(1),
      machine_id: z.string().min(1),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  stripe: t.router({
    createPaymentIntent: publicProcedure.input(z.object({
      amount: z.number().int().positive(),
      currency: z.string().length(3).default('eur'),
      metadata: z.object({
        order_id: z.string().min(1),
        user_id: z.string().min(1),
        machine_id: z.string().min(1),
      }),
      supportsNativePay: z.boolean().optional(),
      platform: z.enum(['ios', 'android', 'web']).optional(),
    })).output(z.object({
      id: z.string(),
      client_secret: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      metadata: z.record(z.string(), z.string()),
      supportsNativePay: z.boolean(),
      paymentMethodTypes: z.array(z.string()),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPaymentIntent: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.any()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    confirmPaymentIntent: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.any()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    cancelPaymentIntent: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.any()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    checkNativePayAvailability: publicProcedure.input(z.object({ domain: z.string().optional() })).output(z.object({
      applePay: z.boolean(),
      googlePay: z.boolean(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  checkout: t.router({
    createIntent: publicProcedure.input(z.object({
      orderId: z.string().min(1, 'OrderId requis'),
    })).output(z.object({
      publishableKey: z.string(),
      paymentIntentClientSecret: z.string(),
      customerId: z.string(),
      ephemeralKey: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStatus: publicProcedure.input(z.object({
      orderId: z.string().min(1, 'OrderId requis'),
    })).output(z.object({
      orderStatus: z.string(),
      paymentStatus: z.string().nullable(),
      paidAt: z.string().nullable(),
      receiptUrl: z.string().nullable(),
      amountTotalCents: z.number().int().positive(),
      currency: z.string().length(3),
      qrCodeToken: z.string().nullable(),
      stripePaymentIntentId: z.string().nullable(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  payments: t.router({
    refund: publicProcedure.input(z.object({
      orderId: z.string().uuid(),
      amountCents: z.number().int().positive().optional(),
      reason: z
        .enum(['duplicate', 'fraudulent', 'requested_by_customer'])
        .optional(),
    })).output(z.object({
      refundId: z.string(),
      stripeRefundId: z.string(),
      status: z.string(),
      amountCents: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  jobs: t.router({
    getJobsStatus: publicProcedure.output(z.object({
      expireStaleOrders: z.object({
        name: z.string(),
        schedule: z.string(),
        timezone: z.string(),
        description: z.string(),
      }),
      cleanupStalePaymentIntents: z.object({
        name: z.string(),
        schedule: z.string(),
        timezone: z.string(),
        description: z.string(),
      }),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getJobMetrics: publicProcedure.output(z.object({
      paymentsExpiredTotal: z.number(),
      paymentIntentsCanceledTotal: z.number(),
      stockReleasedTotal: z.number(),
      jobExecutionTime: z.number(),
      lastExecutionTime: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    runExpireStaleOrdersManually: publicProcedure.output(z.object({
      ordersExpired: z.number(),
      paymentIntentsCanceled: z.number(),
      stockReleased: z.number(),
      executionTime: z.number(),
      errors: z.array(z.string()),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    runCleanupStalePaymentIntentsManually: publicProcedure.output(z.object({
      paymentIntentsCanceled: z.number(),
      paymentsUpdated: z.number(),
      executionTime: z.number(),
      errors: z.array(z.string()),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  restocks: t.router({
    getAllRestocks: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      user_id: z.string().min(1),
      created_at: z.string(),
      notes: z.string().optional(),
    }).extend({
      items: z.array(z.object({
        id: z.string().min(1),
        restock_id: z.string().min(1),
        stock_id: z.string().min(1),
        quantity_before: z.number().int().min(0),
        quantity_after: z.number().int().min(0),
        quantity_added: z.number().int(),
        type: z.enum(['addition', 'removal']).optional(),
      }).extend({
        slot_number: z.number().int().positive(),
        product_name: z.string(),
        type: z.enum(['addition', 'removal']).optional(),
        product_image_url: z.string().optional(),
      })),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getRestocksByMachine: publicProcedure.input(z.object({ machine_id: z.string().min(1) })).output(z.array(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      user_id: z.string().min(1),
      created_at: z.string(),
      notes: z.string().optional(),
    }).extend({
      items: z.array(z.object({
        id: z.string().min(1),
        restock_id: z.string().min(1),
        stock_id: z.string().min(1),
        quantity_before: z.number().int().min(0),
        quantity_after: z.number().int().min(0),
        quantity_added: z.number().int(),
        type: z.enum(['addition', 'removal']).optional(),
      }).extend({
        slot_number: z.number().int().positive(),
        product_name: z.string(),
        type: z.enum(['addition', 'removal']).optional(),
        product_image_url: z.string().optional(),
      })),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createRestock: publicProcedure.input(z.object({
      machine_id: z.string().min(1),
      user_id: z.string().min(1),
      notes: z.string().optional(),
      items: z.array(z.object({
        stock_id: z.string().min(1),
        quantity_to_add: z.number().int().positive(),
      })).min(1),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      user_id: z.string().min(1),
      created_at: z.string(),
      notes: z.string().optional(),
    }).extend({
      items: z.array(z.object({
        id: z.string().min(1),
        restock_id: z.string().min(1),
        stock_id: z.string().min(1),
        quantity_before: z.number().int().min(0),
        quantity_after: z.number().int().min(0),
        quantity_added: z.number().int(),
        type: z.enum(['addition', 'removal']).optional(),
      }).extend({
        slot_number: z.number().int().positive(),
        product_name: z.string(),
        type: z.enum(['addition', 'removal']).optional(),
        product_image_url: z.string().optional(),
      })),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    restockToMax: publicProcedure.input(z.object({
      machine_id: z.string().min(1),
      user_id: z.string().min(1).optional(), // Optionnel - sera déterminé automatiquement
      notes: z.string().optional(),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      user_id: z.string().min(1),
      created_at: z.string(),
      notes: z.string().optional(),
    }).extend({
      items: z.array(z.object({
        id: z.string().min(1),
        restock_id: z.string().min(1),
        stock_id: z.string().min(1),
        quantity_before: z.number().int().min(0),
        quantity_after: z.number().int().min(0),
        quantity_added: z.number().int(),
        type: z.enum(['addition', 'removal']).optional(),
      }).extend({
        slot_number: z.number().int().positive(),
        product_name: z.string(),
        type: z.enum(['addition', 'removal']).optional(),
        product_image_url: z.string().optional(),
      })),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    restockSlotToMax: publicProcedure.input(z.object({
      stock_id: z.string().min(1),
      user_id: z.string().min(1).optional(), // Optionnel - sera déterminé automatiquement
      notes: z.string().optional(),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      user_id: z.string().min(1),
      created_at: z.string(),
      notes: z.string().optional(),
    }).extend({
      items: z.array(z.object({
        id: z.string().min(1),
        restock_id: z.string().min(1),
        stock_id: z.string().min(1),
        quantity_before: z.number().int().min(0),
        quantity_after: z.number().int().min(0),
        quantity_added: z.number().int(),
        type: z.enum(['addition', 'removal']).optional(),
      }).extend({
        slot_number: z.number().int().positive(),
        product_name: z.string(),
        type: z.enum(['addition', 'removal']).optional(),
        product_image_url: z.string().optional(),
      })),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    manualRestock: publicProcedure.input(z.object({
      stock_id: z.string().min(1),
      quantity: z.number().int().positive(),
      user_id: z.string().min(1).optional(), // Optionnel - sera déterminé automatiquement
      notes: z.string().optional(),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      user_id: z.string().min(1),
      created_at: z.string(),
      notes: z.string().optional(),
    }).extend({
      items: z.array(z.object({
        id: z.string().min(1),
        restock_id: z.string().min(1),
        stock_id: z.string().min(1),
        quantity_before: z.number().int().min(0),
        quantity_after: z.number().int().min(0),
        quantity_added: z.number().int(),
        type: z.enum(['addition', 'removal']).optional(),
      }).extend({
        slot_number: z.number().int().positive(),
        product_name: z.string(),
        type: z.enum(['addition', 'removal']).optional(),
        product_image_url: z.string().optional(),
      })),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

