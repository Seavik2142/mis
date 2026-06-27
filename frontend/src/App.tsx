import type { ReactNode } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const protectedPage = (page: ReactNode) => (
    <ProtectedRoute>
      {page}
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard"
        element={protectedPage(<Dashboard />)}
      />

      <Route path="/products" element={protectedPage(<Products />)} />
      <Route path="/customers" element={protectedPage(<Customers />)} />
      <Route path="/orders" element={protectedPage(<Orders />)} />
      <Route path="/inventory" element={protectedPage(<Inventory />)} />
      <Route path="/reports" element={protectedPage(<Reports />)} />
      <Route path="/settings" element={protectedPage(<Settings />)} />
    </Routes>
  );
}

export default App;
