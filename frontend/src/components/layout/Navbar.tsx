import { AlertTriangle, Bell, Clock, LogOut, Moon, Package, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getLowStockProducts } from "../../services/inventoryService";
import { getOrders } from "../../services/orderService";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/customers": "Customers",
  "/orders": "Orders",
  "/inventory": "Inventory",
  "/reports": "Reports",
  "/settings": "Settings"
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "warning" | "danger";
  link: string;
  iconType: "product" | "order";
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const title = titles[location.pathname] || "Sales MIS";
  const initial = user?.email?.charAt(0)?.toUpperCase() || "A";

  async function fetchNotifications() {
    try {
      const [lowStockData, delayedOrdersData] = await Promise.all([
        getLowStockProducts(),
        getOrders("Delayed")
      ]);

      const items: NotificationItem[] = [];

      // Process low stock products
      lowStockData.forEach((product) => {
        const isOutOfStock = product.stock === 0;
        items.push({
          id: `low-stock-${product.id}`,
          title: isOutOfStock ? `Out of Stock: ${product.name}` : `Low Stock: ${product.name}`,
          description: isOutOfStock
            ? `SKU ${product.sku} has no remaining units.`
            : `Only ${product.stock} units remaining (reorder at ${product.reorder_level}).`,
          type: isOutOfStock ? "danger" : "warning",
          link: "/inventory",
          iconType: "product"
        });
      });

      // Process delayed orders
      delayedOrdersData.forEach((order) => {
        items.push({
          id: `delayed-order-${order.id}`,
          title: `Delayed Order ${order.order_number}`,
          description: `Requires immediate fulfillment attention.`,
          type: "danger",
          link: "/orders",
          iconType: "order"
        });
      });

      setNotifications(items);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // Poll for changes every 20 seconds to keep data live
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNotificationClick = (link: string) => {
    setShowDropdown(false);
    navigate(link);
  };

  return (
    <header className="topbar">
      <div>
        <h2 className="topbar-title">{title}</h2>
        <p className="topbar-meta">Clean sales, inventory, and customer operations</p>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-button"
          type="button"
          aria-label="Toggle Theme"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun aria-hidden="true" size={18} strokeWidth={2.2} />
          ) : (
            <Moon aria-hidden="true" size={18} strokeWidth={2.2} />
          )}
        </button>

        <div className="notification-container" ref={dropdownRef}>
          <button
            className="icon-button"
            type="button"
            aria-label="Notifications"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell aria-hidden="true" size={18} strokeWidth={2.2} />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showDropdown && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <span className="status danger compact">{notifications.length} Alert{notifications.length > 1 ? "s" : ""}</span>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    No urgent notifications. System is running cleanly!
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className="notification-item"
                      onClick={() => handleNotificationClick(item.link)}
                    >
                      <div className={`notification-icon-wrapper ${item.type}`}>
                        {item.iconType === "product" ? (
                          <Package size={16} strokeWidth={2.5} />
                        ) : (
                          <Clock size={16} strokeWidth={2.5} />
                        )}
                      </div>
                      <div className="notification-info">
                        <p className="notification-title">{item.title}</p>
                        <p className="notification-desc">{item.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-pill">
          <span className="avatar">{initial}</span>
          <span>{user?.email || "admin@salesmis.com"}</span>
        </div>
        <button className="button ghost" type="button" onClick={handleLogout}>
          <LogOut aria-hidden="true" size={17} strokeWidth={2.2} />
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Navbar;
