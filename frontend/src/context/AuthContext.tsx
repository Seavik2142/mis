import { createContext, useState, type ReactNode } from "react";
import type { User, TokenResponse } from "../types";

interface AuthContextType {
  user: User | null;
  login: (authData: TokenResponse | User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (authData: TokenResponse | any) => {
    const userData = (authData as TokenResponse).user || authData;

    localStorage.setItem("user", JSON.stringify(userData));
    if ((authData as TokenResponse).access_token) {
      localStorage.setItem("access_token", (authData as TokenResponse).access_token);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
