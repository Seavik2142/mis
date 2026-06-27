import api from "./api";
import type { Customer } from "../types";

export const getCustomers = async (search = ""): Promise<Customer[]> => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await api.get(`/customers${query}`);
  return response.data;
};

export const createCustomer = async (customer: Partial<Customer>): Promise<Customer> => {
  const response = await api.post("/customers", customer);
  return response.data;
};

export const updateCustomer = async (id: number, customer: Partial<Customer>): Promise<Customer> => {
  const response = await api.put(`/customers/${id}`, customer);
  return response.data;
};
