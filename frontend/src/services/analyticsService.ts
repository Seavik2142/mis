import api from "./api";
import type { DashboardSummary, Product } from "../types";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get("/analytics/dashboard");
  return response.data;
};

export const getMonthlySales = async (months = 6) => {
  const response = await api.get(`/analytics/monthly-sales?months=${months}`);
  return response.data;
};

export const getTopProducts = async (limit = 5): Promise<Product[]> => {
  const response = await api.get(`/analytics/top-products?limit=${limit}`);
  return response.data;
};
