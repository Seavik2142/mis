import api from "./api";
import type { TokenResponse } from "../types";

export const loginUser = async (email: string, password: string): Promise<TokenResponse> => {
  const response = await api.post("/auth/login", {
    email,
    password
  });

  return response.data;
};

export const registerUser = async (email: string, password: string, fullName: string): Promise<any> => {
  const response = await api.post("/auth/register", {
    email,
    password,
    full_name: fullName
  });
  return response.data;
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
  const response = await api.post("/auth/change-password", {
    old_password: oldPassword,
    new_password: newPassword
  });
  return response.data;
};
