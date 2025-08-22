// Export all schema types from the backend
export type {
  Alert,
  AlertWithRelations,
  MachineAlertStatus,
  AlertsSummary,
} from '../alerts/alerts.schema';

export type {
  CreateOrderInput,
  UpdateOrderInput,
  Order,
  OrderWithItems,
} from '../orders/orders.schema';

export type {
  CreateProductInput,
  UpdateProductInput,
  Product,
} from '../products/products.schema';

export type {
  CreateMachineInput,
  UpdateMachineInput,
  Machine,
  MachineStats,
} from '../machines/machines.schema';

export type {
  CreateStockInput,
  UpdateStockInput,
  AddSlotInput,
  Stock,
  StockWithProduct,
} from '../stocks/stocks.schema';

export type {
  CreateRestockInput,
  RestockToMaxInput,
  RestockSlotToMaxInput,
  ManualRestockInput,
  Restock,
  RestockWithItems,
} from '../restocks/restocks.schema';

export type {
  CreatePickupInput,
  UpdatePickupInput,
  Pickup,
} from '../pickups/pickups.schema';
