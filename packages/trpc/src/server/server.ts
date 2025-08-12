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
      id: z.uuid(),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
      ingredients: z.string(),
      allergens: z.string(),
      nutritional_value: z.string(),
      image_url: z.url(),
      is_active: z.boolean(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getProductById: publicProcedure.input(z.object({ id: z.uuid() })).output(z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
      ingredients: z.string(),
      allergens: z.string(),
      nutritional_value: z.string(),
      image_url: z.url(),
      is_active: z.boolean(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getProductsByCategory: publicProcedure.input(z.object({ category: z.string() })).output(z.array(z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
      ingredients: z.string(),
      allergens: z.string(),
      nutritional_value: z.string(),
      image_url: z.url(),
      is_active: z.boolean(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createProduct: publicProcedure.input(z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
      ingredients: z.string(),
      allergens: z.string(),
      nutritional_value: z.string(),
      image_url: z.url(),
      is_active: z.boolean(),
    }).omit({
      id: true,
    })).output(z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
      ingredients: z.string(),
      allergens: z.string(),
      nutritional_value: z.string(),
      image_url: z.url(),
      is_active: z.boolean(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateProduct: publicProcedure.input(z.object({
      id: z.uuid(),
      data: z.object({
        id: z.uuid(),
        name: z.string(),
        description: z.string(),
        price: z.number().positive(),
        ingredients: z.string(),
        allergens: z.string(),
        nutritional_value: z.string(),
        image_url: z.url(),
        is_active: z.boolean(),
      }).omit({
        id: true,
      }).partial(),
    })).output(z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string(),
      price: z.number().positive(),
      ingredients: z.string(),
      allergens: z.string(),
      nutritional_value: z.string(),
      image_url: z.url(),
      is_active: z.boolean(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteProduct: publicProcedure.input(z.object({ id: z.uuid() })).output(z.boolean()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  orders: t.router({
    getOrderById: publicProcedure.input(z.object({ id: z.uuid() })).output(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      machine_id: z.uuid(),
      status: z.enum(['pending', 'active', 'expired', 'used', 'cancelled']),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    }).extend({
      items: z.array(z.object({
        id: z.uuid(),
        order_id: z.uuid(),
        product_id: z.uuid(),
        quantity: z.number().int().positive(),
        slot_number: z.number().int().positive(),
      })),
      total_price: z.number().positive(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getOrdersByUserId: publicProcedure.input(z.object({ user_id: z.uuid() })).output(z.array(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      machine_id: z.uuid(),
      status: z.enum(['pending', 'active', 'expired', 'used', 'cancelled']),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    }).extend({
      items: z.array(z.object({
        id: z.uuid(),
        order_id: z.uuid(),
        product_id: z.uuid(),
        quantity: z.number().int().positive(),
        slot_number: z.number().int().positive(),
      })),
      total_price: z.number().positive(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createOrder: publicProcedure.input(z.object({
      user_id: z.uuid(),
      machine_id: z.uuid(),
      items: z.array(
        z.object({
          product_id: z.uuid(),
          quantity: z.number().int().positive(),
          slot_number: z.number().int().positive(),
        }),
      ),
    })).output(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      machine_id: z.uuid(),
      status: z.enum(['pending', 'active', 'expired', 'used', 'cancelled']),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    }).extend({
      items: z.array(z.object({
        id: z.uuid(),
        order_id: z.uuid(),
        product_id: z.uuid(),
        quantity: z.number().int().positive(),
        slot_number: z.number().int().positive(),
      })),
      total_price: z.number().positive(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateOrder: publicProcedure.input(z.object({
      id: z.uuid(),
      data: z.object({
        status: z
          .enum(['pending', 'active', 'expired', 'used', 'cancelled'])
          .optional(),
        expires_at: z.string().optional(),
      }),
    })).output(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      machine_id: z.uuid(),
      status: z.enum(['pending', 'active', 'expired', 'used', 'cancelled']),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    cancelOrder: publicProcedure.input(z.object({ id: z.uuid() })).output(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      machine_id: z.uuid(),
      status: z.enum(['pending', 'active', 'expired', 'used', 'cancelled']),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    validateQRCode: publicProcedure.input(z.object({ qr_code_token: z.string() })).output(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      machine_id: z.uuid(),
      status: z.enum(['pending', 'active', 'expired', 'used', 'cancelled']),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    useOrder: publicProcedure.input(z.object({ id: z.uuid() })).output(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      machine_id: z.uuid(),
      status: z.enum(['pending', 'active', 'expired', 'used', 'cancelled']),
      created_at: z.string(),
      expires_at: z.string(),
      qr_code_token: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  stocks: t.router({
    getAllStocks: publicProcedure.output(z.array(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStockById: publicProcedure.input(z.object({ id: z.uuid() })).output(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStocksByMachine: publicProcedure.input(z.object({ machine_id: z.uuid() })).output(z.array(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    }).extend({
      product_name: z.string(),
      product_price: z.number().positive(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStockByMachineAndProduct: publicProcedure.input(z.object({
      machine_id: z.uuid(),
      product_id: z.uuid(),
    })).output(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getLowStockItems: publicProcedure.input(z.object({ threshold: z.number().int().positive().optional() })).output(z.array(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    }).extend({
      product_name: z.string(),
      product_price: z.number().positive(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getOutOfStockItems: publicProcedure.output(z.array(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    }).extend({
      product_name: z.string(),
      product_price: z.number().positive(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createStock: publicProcedure.input(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    }).omit({
      id: true,
    })).output(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateStock: publicProcedure.input(z.object({
      id: z.uuid(),
      data: z.object({
        id: z.uuid(),
        machine_id: z.uuid(),
        product_id: z.uuid(),
        quantity: z.number().int().min(0),
        slot_number: z.number().int().positive(),
      }).omit({
        id: true,
      }).partial(),
    })).output(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateStockQuantity: publicProcedure.input(z.object({
      id: z.uuid(),
      quantity: z.number().int().min(0),
    })).output(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addStockQuantity: publicProcedure.input(z.object({
      id: z.uuid(),
      quantity: z.number().int().positive(),
    })).output(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    removeStockQuantity: publicProcedure.input(z.object({
      id: z.uuid(),
      quantity: z.number().int().positive(),
    })).output(z.object({
      id: z.uuid(),
      machine_id: z.uuid(),
      product_id: z.uuid(),
      quantity: z.number().int().min(0),
      slot_number: z.number().int().positive(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  loyalty: t.router({
    getCurrentPoints: publicProcedure.input(z.object({ user_id: z.uuid() })).output(z.number()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getLoyaltyHistory: publicProcedure.input(z.object({ user_id: z.uuid() })).output(z.array(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      change: z.number().int(),
      reason: z.string(),
      created_at: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getLoyaltyHistoryFormatted: publicProcedure.input(z.object({ user_id: z.uuid() })).output(z.array(z.object({
      id: z.string(),
      date: z.string(),
      location: z.string(),
      points: z.number().int(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getAvailableAdvantages: publicProcedure.output(z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      points: z.number().int().positive(),
      image: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addPoints: publicProcedure.input(z.object({
      user_id: z.uuid(),
      points: z.number().int().positive(),
      reason: z.string(),
    })).output(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      change: z.number().int(),
      reason: z.string(),
      created_at: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deductPoints: publicProcedure.input(z.object({
      user_id: z.uuid(),
      points: z.number().int().positive(),
      reason: z.string(),
    })).output(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      change: z.number().int(),
      reason: z.string(),
      created_at: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    redeemAdvantage: publicProcedure.input(z.object({
      user_id: z.uuid(),
      advantage_id: z.string(),
    })).output(z.object({
      id: z.uuid(),
      user_id: z.uuid(),
      change: z.number().int(),
      reason: z.string(),
      created_at: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  machines: t.router({
    getAllMachines: publicProcedure.output(z.array(z.object({
      id: z.uuid(),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMachineById: publicProcedure.input(z.object({ id: z.uuid() })).output(z.object({
      id: z.uuid(),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMachinesByLocation: publicProcedure.input(z.object({ location: z.string() })).output(z.array(z.object({
      id: z.uuid(),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getOnlineMachines: publicProcedure.output(z.array(z.object({
      id: z.uuid(),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createMachine: publicProcedure.input(z.object({
      id: z.uuid(),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    }).omit({
      id: true,
      last_update: true,
    })).output(z.object({
      id: z.uuid(),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateMachine: publicProcedure.input(z.object({
      id: z.uuid(),
      data: z.object({
        id: z.uuid(),
        location: z.string(),
        label: z.string(),
        status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
        last_update: z.string(),
      }).omit({
        id: true,
        last_update: true,
      }).partial(),
    })).output(z.object({
      id: z.uuid(),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateMachineStatus: publicProcedure.input(z.object({
      id: z.uuid(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
    })).output(z.object({
      id: z.uuid(),
      location: z.string(),
      label: z.string(),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
      last_update: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  pickups: t.router({
    getPickupById: publicProcedure.input(z.object({ id: z.uuid() })).output(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPickupsByOrderId: publicProcedure.input(z.object({ order_id: z.uuid() })).output(z.array(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPickupsByMachineId: publicProcedure.input(z.object({ machine_id: z.uuid() })).output(z.array(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPendingPickups: publicProcedure.output(z.array(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getCompletedPickups: publicProcedure.output(z.array(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createPickup: publicProcedure.input(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    }).omit({
      id: true,
      picked_up_at: true,
    })).output(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updatePickup: publicProcedure.input(z.object({
      id: z.uuid(),
      data: z.object({
        id: z.uuid(),
        order_id: z.uuid(),
        machine_id: z.uuid(),
        picked_up_at: z.string(),
        status: z.enum(['pending', 'completed', 'failed']),
      }).omit({
        id: true,
        picked_up_at: true,
      }).partial(),
    })).output(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    completePickup: publicProcedure.input(z.object({ id: z.uuid() })).output(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    failPickup: publicProcedure.input(z.object({
      id: z.uuid(),
      reason: z.string().optional(),
    })).output(z.object({
      id: z.uuid(),
      order_id: z.uuid(),
      machine_id: z.uuid(),
      picked_up_at: z.string(),
      status: z.enum(['pending', 'completed', 'failed']),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

