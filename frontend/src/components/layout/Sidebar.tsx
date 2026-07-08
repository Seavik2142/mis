import {
  Boxes,
  FileBarChart,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [businessName, setBusinessName] = useState(() => {
    return localStorage.getItem("setting_business_name") || "MIS Of Me";
  });

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setBusinessName(localStorage.getItem("setting_business_name") || "MIS Of Me");
    };
    window.addEventListener("settings_updated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("settings_updated", handleSettingsUpdate);
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <BrandLogo />
        </span>
        <div>
          <p className="brand-title">{businessName}</p>
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


    </aside>
  );
}

export default Sidebar;
