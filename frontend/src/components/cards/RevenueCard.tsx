import { CircleDollarSign } from "lucide-react";

interface RevenueCardProps {
  revenue: number;
}

function RevenueCard({ revenue }: RevenueCardProps) {
  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(revenue);

  return (
    <article className="stat-card" style={{ "--stat-tone": "#0f766e" } as React.CSSProperties}>
      <div className="stat-head">
        <p className="stat-label">Total Revenue</p>
        <span className="stat-icon">
          <CircleDollarSign aria-hidden="true" size={20} strokeWidth={2.2} />
        </span>
      </div>
      <p className="stat-value">{formattedRevenue}</p>
      <p className="stat-detail">
        <span className="trend">+12.8%</span> from last month
      </p>
    </article>
  );
}

export default RevenueCard;
