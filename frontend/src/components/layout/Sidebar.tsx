import {
  BarChart3,
  Boxes,
  FileBarChart,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";

interface LinkItem {
  to: string;
  label: string;
  Icon: LucideIcon;
}

const links: LinkItem[] = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/products", label: "Products", Icon: Package },
  { to: "/customers", label: "Customers", Icon: UsersRound },
  { to: "/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/inventory", label: "Inventory", Icon: Boxes },
  { to: "/reports", label: "Reports", Icon: FileBarChart },
  { to: "/settings", label: "Settings", Icon: Settings }
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <BrandLogo />
        </span>
        <div>
          <p className="brand-title">Sales MIS</p>
          <p className="brand-subtitle">Operations Console</p>
        </div>
      </div>

      <nav className="side-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (
              isActive ? "side-link active" : "side-link"
            )}
          >
            <link.Icon className="side-icon" aria-hidden="true" size={18} strokeWidth={2.2} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <BarChart3 aria-hidden="true" size={18} strokeWidth={2.2} />
        <p>Today: revenue tracking, stock watch, and order flow stay in view.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
