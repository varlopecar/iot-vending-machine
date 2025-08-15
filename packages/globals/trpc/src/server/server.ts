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
      created_at: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getUserByBarcode: publicProcedure.input(z.object({ barcode: z.string() })).output(z.object({
      id: z.string().min(1),
      full_name: z.string(),
      email: z.email(),
      points: z.number().int().min(0),
      barcode: z.string(),
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
      created_at: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  products: t.router({
    getAllProducts: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
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
      image_url: z.url(),
      is_active: z.boolean(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getProductById: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
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
      image_url: z.url(),
      is_active: z.boolean(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getProductsByCategory: publicProcedure.input(z.object({ category: z.string() })).output(z.array(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
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
      image_url: z.url(),
      is_active: z.boolean(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createProduct: publicProcedure.input(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
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
      image_url: z.url(),
      is_active: z.boolean(),
    }).omit({
      id: true,
    })).output(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
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
      image_url: z.url(),
      is_active: z.boolean(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateProduct: publicProcedure.input(z.object({
      id: z.uuid(),
      data: z.object({
        id: z.string().min(1),
        name: z.string(),
        description: z.string(),
        price: z.number().positive(),
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
        image_url: z.url(),
        is_active: z.boolean(),
      }).omit({
        id: true,
      }).partial(),
    })).output(z.object({
      id: z.string().min(1),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
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
      image_url: z.url(),
      is_active: z.boolean(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteProduct: publicProcedure.input(z.object({ id: z.uuid() })).output(z.boolean()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
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
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStockById: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStocksByMachine: publicProcedure.input(z.object({ machine_id: z.string().min(1) })).output(z.array(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
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
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getLowStockItems: publicProcedure.input(z.object({ threshold: z.number().int().positive().optional() })).output(z.array(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
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
    }).omit({
      id: true,
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateStock: publicProcedure.input(z.object({
      id: z.string().min(1),
      data: z.object({
        id: z.string().min(1),
        machine_id: z.string().min(1),
        product_id: z.string().min(1),
        quantity: z.number().int().min(0),
        slot_number: z.number().int().positive(),
      }).omit({
        id: true,
      }).partial(),
    })).output(z.object({
      id: z.string().min(1),
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
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
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMachineById: publicProcedure.input(z.object({ id: z.string().min(1) })).output(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMachinesByLocation: publicProcedure.input(z.object({ location: z.string() })).output(z.array(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getOnlineMachines: publicProcedure.output(z.array(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createMachine: publicProcedure.input(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }).omit({
      id: true,
      last_update: true,
    })).output(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateMachine: publicProcedure.input(z.object({
      id: z.string().min(1),
      data: z.object({
        id: z.string().min(1),
        location: z.string(),
        label: z.string(),
        status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
        last_update: z.string(),
      }).omit({
        id: true,
        last_update: true,
      }).partial(),
    })).output(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateMachineStatus: publicProcedure.input(z.object({
      id: z.string().min(1),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
    })).output(z.object({
      id: z.string().min(1),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
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
  })
});
export type AppRouter = typeof appRouter;

