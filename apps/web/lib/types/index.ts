// Types du back-office partagés
export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalMachines: number
  activeMachines: number
  lowStockItems: number
  outOfStockItems: number
}

export interface MachineStats {
  machineId: string
  machineName: string
  location: string
  status: 'online' | 'offline' | 'maintenance' | 'out_of_service'
  totalOrders: number
  revenue: number
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
  stockStatus: {
    lowStock: number
    outOfStock: number
    total: number
  }
}

export interface ProductAnalytics {
  productId: string
  productName: string
  category: string
  totalSold: number
  revenue: number
  averagePerMachine: number
  machines: Array<{
    machineId: string
    machineName: string
    sold: number
    stock: number
    status: 'low' | 'ok' | 'out'
  }>
}

export interface RevenueAnalytics {
  period: 'day' | 'week' | 'month'
  data: Array<{
    date: string
    revenue: number
    orders: number
  }>
  total: number
  average: number
  growth: number
}

export type Theme = 'light' | 'dark'
