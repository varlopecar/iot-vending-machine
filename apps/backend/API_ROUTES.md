# Vending Machine Platform - tRPC API Routes

This document outlines all the tRPC routes available in the backend for the connected vending machine platform.

## Overview

The backend is organized into 7 main modules, each handling specific functionality:

1. **Auth** - User authentication and management
2. **Products** - Product catalog management
3. **Orders** - Order creation and management with QR codes
4. **Loyalty** - Loyalty points and rewards system
5. **Machines** - Vending machine management
6. **Stocks** - Inventory management
7. **Pickups** - Order pickup tracking

## 1. Auth Module (`auth`)

### Queries

- `getUserById(id: string)` - Get user by ID
- `getUserByBarcode(barcode: string)` - Get user by barcode

### Mutations

- `register(userData)` - Register new user
- `login(loginData)` - User login
- `updateUser(id, data)` - Update user information
- `updatePoints(id, points)` - Update user loyalty points

## 2. Products Module (`products`)

### Queries

- `getAllProducts()` - Get all active products
- `getProductById(id: string)` - Get product by ID
- `getProductsByCategory(category: string)` - Get products by category

### Mutations

- `createProduct(productData)` - Create new product
- `updateProduct(id, data)` - Update product information
- `deleteProduct(id)` - Soft delete product (set is_active to false)

## 3. Orders Module (`orders`)

### Queries

- `getOrderById(id: string)` - Get order with items by ID
- `getOrdersByUserId(user_id: string)` - Get all orders for a user

### Mutations

- `createOrder(orderData)` - Create new order (decrements stock immediately)
- `updateOrder(id, data)` - Update order status
- `cancelOrder(id)` - Cancel order and restore stock
- `validateQRCode(qr_code_token: string)` - Validate QR code for pickup
- `useOrder(id)` - Mark order as used

## 4. Loyalty Module (`loyalty`)

### Queries

- `getCurrentPoints(user_id: string)` - Get user's current loyalty points
- `getLoyaltyHistory(user_id: string)` - Get detailed loyalty history
- `getLoyaltyHistoryFormatted(user_id: string)` - Get formatted history for UI
- `getAvailableAdvantages()` - Get available loyalty rewards

### Mutations

- `addPoints(user_id, points, reason)` - Add loyalty points
- `deductPoints(user_id, points, reason)` - Deduct loyalty points
- `redeemAdvantage(user_id, advantage_id)` - Redeem loyalty reward

## 5. Machines Module (`machines`)

### Queries

- `getAllMachines()` - Get all machines
- `getMachineById(id: string)` - Get machine by ID
- `getMachinesByLocation(location: string)` - Get machines by location
- `getOnlineMachines()` - Get only online machines

### Mutations

- `createMachine(machineData)` - Create new machine
- `updateMachine(id, data)` - Update machine information
- `updateMachineStatus(id, status)` - Update machine status

## 6. Stocks Module (`stocks`)

### Queries

- `getAllStocks()` - Get all stock entries
- `getStockById(id: string)` - Get stock by ID
- `getStocksByMachine(machine_id: string)` - Get stocks for a machine
- `getStockByMachineAndProduct(machine_id, product_id)` - Get specific stock
- `getLowStockItems(threshold?)` - Get items with low stock
- `getOutOfStockItems()` - Get items out of stock

### Mutations

- `createStock(stockData)` - Create new stock entry
- `updateStock(id, data)` - Update stock information
- `updateStockQuantity(id, quantity)` - Update stock quantity
- `addStockQuantity(id, quantity)` - Add to stock quantity
- `removeStockQuantity(id, quantity)` - Remove from stock quantity

## 7. Pickups Module (`pickups`)

### Queries

- `getPickupById(id: string)` - Get pickup by ID
- `getPickupsByOrderId(order_id: string)` - Get pickups for an order
- `getPickupsByMachineId(machine_id: string)` - Get pickups for a machine
- `getPendingPickups()` - Get all pending pickups
- `getCompletedPickups()` - Get all completed pickups

### Mutations

- `createPickup(pickupData)` - Create new pickup record
- `updatePickup(id, data)` - Update pickup information
- `completePickup(id)` - Mark pickup as completed
- `failPickup(id, reason?)` - Mark pickup as failed

## Key Features Implemented

### Stock Management

- **Immediate stock decrement**: When an order is placed, stock is decremented immediately (not when picked up)
- **Stock restoration**: When orders are cancelled, stock is restored
- **Low stock monitoring**: Endpoints to monitor low stock and out-of-stock items

### QR Code System

- **Unique QR codes**: Each order gets a unique QR code token
- **Expiration handling**: QR codes expire after 30 minutes
- **Single-use validation**: QR codes are validated server-side
- **Status tracking**: Orders track status (pending, active, expired, used, cancelled)

### Loyalty System

- **Point tracking**: Users earn and spend loyalty points
- **History logging**: All point operations are logged with reasons
- **Reward redemption**: Users can redeem points for predefined advantages
- **Barcode integration**: Users are identified by personal barcodes

### Order Management

- **Maximum 2 products**: System enforces the 2-product limit per order
- **Real-time validation**: Stock availability is checked in real-time
- **Order lifecycle**: Complete order lifecycle from creation to pickup
- **Cancellation support**: Orders can be cancelled with stock restoration

## Database Schema Support

The API is designed to work with the provided PostgreSQL schema:

- **users** - User accounts with loyalty points and barcodes
- **products** - Product catalog with nutritional information
- **machines** - Vending machine locations and status
- **stocks** - Inventory levels per machine and product
- **orders** - Order records with QR codes and expiration
- **order_items** - Individual items in orders
- **pickups** - Pickup tracking and completion
- **loyalty_logs** - Loyalty point operation history

## Security Considerations

- **Input validation**: All inputs are validated using Zod schemas
- **Error handling**: Comprehensive error handling with appropriate HTTP status codes
- **Type safety**: Full TypeScript and tRPC type safety across the stack
- **Authentication ready**: Auth module prepared for JWT integration

## Next Steps

1. **Database integration**: Connect to PostgreSQL using Prisma ORM
2. **Authentication**: Implement JWT-based authentication
3. **Real-time updates**: Add WebSocket support for real-time stock updates
4. **Admin interface**: Create admin routes for back-office management
5. **Testing**: Add comprehensive unit and integration tests
6. **Documentation**: Generate OpenAPI documentation from tRPC schemas
