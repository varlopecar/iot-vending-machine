import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { CartItem, Order } from "../types/product";

interface NewOrderInput {
  id: string;
  items: CartItem[];
  totalPrice: number;
  qrCodeToken?: string;
  qrCodeImage?: any;
  expiresAt?: Date;
  status?: Order["status"];
  date?: string;
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (input: NewOrderInput) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  setOrderStatus: (orderId: string, status: Order["status"]) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (input: NewOrderInput): Order => {
    const next: Order = {
      id: input.id,
      date:
        input.date || new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      items: input.items,
      totalPrice: input.totalPrice,
      qrCodeToken: input.qrCodeToken,
      qrCodeImage: input.qrCodeImage,
      expiresAt: input.expiresAt || new Date(Date.now() + 15 * 60 * 1000),
      status: input.status || "active",
    };

    setOrders((prev) => {
      const existingIndex = prev.findIndex((o) => o.id === next.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...prev[existingIndex], ...next };
        return updated;
      }
      return [next, ...prev];
    });
    return next;
  };

  const getOrderById = (orderId: string) => orders.find((o) => o.id === orderId);

  const setOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const value = useMemo(
    () => ({ orders, addOrder, getOrderById, setOrderStatus }),
    [orders]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}


