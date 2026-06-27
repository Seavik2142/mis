import api from "./api";
import type { Order } from "../types";

export const getOrders = async (status = ""): Promise<Order[]> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await api.get(`/orders${query}`);
  return response.data;
};

export const createOrder = async (order: any): Promise<Order> => {
  const response = await api.post("/orders", order);
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};
