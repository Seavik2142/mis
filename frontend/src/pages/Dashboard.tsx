import {
  CheckCircle2,
  Download,
  Globe2,
  Plus,
  TrendingUp,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

import RevenueCard from "../components/cards/RevenueCard";
import OrdersCard from "../components/cards/OrdersCard";
import StatsCard from "../components/cards/StatsCard";

import MonthlySalesChart from "../components/charts/MonthlySalesChart";
import TopProductsChart from "../components/charts/TopProductsChart";
import {
  getDashboardSummary,
  getMonthlySales,
  getTopProducts
} from "../services/analyticsService";
import { getLowStockProducts } from "../services/inventoryService";
import { getOrders } from "../services/orderService";
import type { DashboardSummary, Product, Order } from "../types";
import { formatMoney } from "../utils/format";

function downloadJson(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");
      try {
        const [
          dashboardData,
          salesData,
          topProductsData,
          lowStockData,
          ordersData
        ] = await Promise.all([
          getDashboardSummary(),
          getMonthlySales(6),
          getTopProducts(5),
          getLowStockProducts(),
          getOrders()
        ]);

        if (isMounted) {
          setSummary(dashboardData);
          setMonthlySales(salesData);
          setTopProducts(topProductsData);
          setLowStock(lowStockData);
          setOrders(ordersData);
        }
      } catch (requestError: any) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const channelMix = useMemo(() => {
    const counts = orders.reduce((accumulator: Record<string, number>, order) => {
      accumulator[order.channel] = (accumulator[order.channel] || 0) + 1;
      return accumulator;
    }, {});
    const total = orders.length || 1;

    return Object.entries(counts)
      .map(([channel, count]) => ({
        channel,
        percent: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [orders]);

  const delayedOrders = orders.filter((order) => order.status === "Delayed");
  const pendingOrders = orders.filter((order) => (
    order.status === "Pending" || order.status === "Packed"
  ));
  const fulfilledCount = useMemo(() => orders.filter((order) => (
    order.status === "Fulfilled" || order.status === "Completed"
  )).length, [orders]);


  return (
    <Layout>
      <section className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Executive Overview</p>
            <h1>Sales performance at a glance</h1>
            <p className="lede">
              Monitor revenue, order movement, customer health, and inventory signals from one quiet workspace.
            </p>
          </div>

          <div className="actions">
            <button
              className="button"
              type="button"
              onClick={() => downloadJson("sales-mis-dashboard.json", {
                summary,
                monthlySales,
                topProducts,
                lowStock,
                orders
              })}
            >
              <Download aria-hidden="true" size={17} strokeWidth={2.2} />
              Export
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() => navigate("/orders")}
            >
              <Plus aria-hidden="true" size={17} strokeWidth={2.2} />
              New Order
            </button>
          </div>
        </div>

        {error && <p className="notice danger">{error}</p>}
        {isLoading && <p className="notice">Loading live dashboard data...</p>}

        <div className="kpi-grid">
          <RevenueCard revenue={summary?.revenue || 0} fulfilledCount={fulfilledCount} />

          <OrdersCard totalOrders={summary?.orders || 0} pendingCount={pendingOrders.length} />

          <StatsCard
            title="Customers"
            value={summary?.customers || 0}
            detail={`${summary?.active_products || 0} active products`}
            tone="#2563eb"
            Icon={UsersRound}
          />

          <StatsCard
            title="Inventory"
            value={formatMoney(summary?.inventory_value || 0)}
            detail={`${summary?.low_stock_products || 0} low stock`}
            tone="#b45309"
            trend={summary?.low_stock_products ? "risk" : "stable"}
            Icon={TrendingUp}
          />
        </div>

        <div className="chart-grid">
          <MonthlySalesChart sales={monthlySales} />
          <TopProductsChart products={topProducts} />
        </div>

        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">
                    <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2.2} />
                  </span>
                  <h2 className="panel-title">Priority Work</h2>
                </div>
                <p className="panel-subtitle">The next items that need attention</p>
              </div>
            </div>

            <div className="insight-list">
              {lowStock.slice(0, 3).map((product) => (
                <div className="insight-item" key={product.id}>
                  <div>
                    <strong>Restock {product.name}</strong>
                    <p>{product.stock} units left. Reorder level is {product.reorder_level}.</p>
                  </div>
                  <span className="status danger">Low stock</span>
                </div>
              ))}

              {delayedOrders.slice(0, 2).map((order) => (
                <div className="insight-item" key={order.id}>
                  <div>
                    <strong>Review delayed order</strong>
                    <p>{order.order_number} for {order.customer?.name || "customer"} needs confirmation.</p>
                  </div>
                  <span className="status danger">Risk</span>
                </div>
              ))}

              {!lowStock.length && !delayedOrders.length && (
                <div className="insight-item">
                  <div>
                    <strong>Operations are clear</strong>
                    <p>No low-stock products or delayed orders need immediate attention.</p>
                  </div>
                  <span className="status success">Healthy</span>
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">
                    <Globe2 aria-hidden="true" size={18} strokeWidth={2.2} />
                  </span>
                  <h2 className="panel-title">Channel Mix</h2>
                </div>
                <p className="panel-subtitle">Current split by order source</p>
              </div>
            </div>

            <div className="metric-list">
              {channelMix.map((channel) => (
                <div className="metric-row" key={channel.channel}>
                  <div>
                    <strong>{channel.channel}</strong>
                    <p>{pendingOrders.length} orders waiting fulfillment</p>
                  </div>
                  <span className="metric-value">{channel.percent}%</span>
                </div>
              ))}

              {!channelMix.length && (
                <div className="metric-row">
                  <div>
                    <strong>No orders yet</strong>
                    <p>Create an order to populate this mix.</p>
                  </div>
                  <span className="metric-value">0%</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}

export default Dashboard;
