import type { AppRouter } from "../../../../packages/globals/trpc/src/server/server";
import type { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { TRPCClientError } from "@trpc/client";

// Infer the types from our AppRouter
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Specific types for common data structures
export type Machine = RouterOutputs["machines"]["getMachineById"];
export type Product = RouterOutputs["products"]["getProductById"];
export type Stock = RouterOutputs["stocks"]["getStockById"];
export type Alert = RouterOutputs["alerts"]["getActiveAlerts"][0];
export type Order = RouterOutputs["orders"]["getOrderById"];
export type User = RouterOutputs["auth"]["getUserById"];

// Auth types
export type LoginResponse = RouterOutputs["auth"]["adminLogin"];
export type AdminUser = LoginResponse["user"];

// Error type for tRPC mutations
export type TRPCError = TRPCClientError<AppRouter>;

// Machine status type
export type MachineStatus =
  | "online"
  | "offline"
  | "maintenance"
  | "out_of_service";

// Alert types
export type AlertType =
  | "LOW_STOCK"
  | "CRITICAL"
  | "INCOMPLETE"
  | "MACHINE_OFFLINE"
  | "MAINTENANCE_REQUIRED";
export type AlertLevel = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
