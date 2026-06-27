import api from "./api";
import type { InventoryMovement, Product } from "../types";

export const getLowStockProducts = async (): Promise<Product[]> => {
  const response = await api.get("/inventory/low-stock");
  return response.data;
};

export const getInventoryMovements = async (limit = 20): Promise<InventoryMovement[]> => {
  const response = await api.get(`/inventory/movements?limit=${limit}`);
  return response.data;
};

export const adjustInventory = async (productId: number, adjustment: { quantity: number; note: string }): Promise<void> => {
  const response = await api.post(`/inventory/${productId}/adjust`, adjustment);
  return response.data;
};
