import api from "./api";
import type { Product } from "../types";

export interface ProductFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
}

export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.lowStock) {
    params.set("low_stock", "true");
  }
  const query = params.toString();
  const response = await api.get(`/products${query ? `?${query}` : ""}`);
  return response.data;
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const response = await api.post("/products", product);
  return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
