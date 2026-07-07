import { PackageCheck } from "lucide-react";

interface OrdersCardProps {
  totalOrders: number;
  pendingCount: number;
}

function OrdersCard({ totalOrders, pendingCount }: OrdersCardProps) {
  return (
    <article className="stat-card" style={{ "--stat-tone": "#2563eb" } as React.CSSProperties}>
      <div className="stat-head">
        <p className="stat-label">Orders</p>
        <span className="stat-icon">
          <PackageCheck aria-hidden="true" size={20} strokeWidth={2.2} />
        </span>
      </div>
      <p className="stat-value">{totalOrders}</p>
      <p className="stat-detail">
        <span className="trend">{pendingCount}</span> waiting fulfillment
      </p>
    </article>
  );
}

export default OrdersCard;
